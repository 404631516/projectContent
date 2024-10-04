import { Scene } from 'phaser';
import { DefenseString, DefenseNumber } from '../Data/DefenseConfig';
import { createPath } from '../../../Helper/MathHelper';
import Object2D from '../../../Scripts/Components/Object2D';
import Slider from '../../../Scripts/Components/Slider';
import DefenseGameScene from '../Scenes/DefenseGameScene';
import { DefenseEnemyData } from '@/manager/TableManager';
import AttributeHelper, { AttributeRelation, AttributeType } from '@/views/H5/Helper/AttributeHelper';
import TimeEventManager, { GameSpeed } from '@/views/H5/Scripts/Manager/TimeEventManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';

export enum DefenseEnemyAnimKey {
  EnemyWalk = 'enemyWalk',
  DamageEffect = 'damageEffect',
}

enum EnemyDirection {
  Left = 1,
  Right = -1,
}

export default class DefenseEnemy extends Object2D {
  // 敵人血量是否為0
  public get isDead(): boolean {
    return this.hp <= 0;
  }
  public get pathProgressRate(): number {
    return this._pathProgressRate;
  }
  public topHp?: Slider; // 血條

  // 敵人靜態表
  public tableData?: Readonly<DefenseEnemyData>;

  // 血條顯示的位置
  public hpOffset: number = -50;

  // 敵人摧毀後回呼
  public onDestroy!: (enemy: DefenseEnemy) => void;

  // 敵人抵達終點的回呼
  public onArrived?: (enemy: DefenseEnemy) => void;

  // 敵人抵達續命點的回呼
  public onReviveArrive?: () => void;

  // 場景敵人流水號
  private index: number = 0;

  // 移動速度(每秒x格)
  private speed: number = 2;

  // 敵人物件
  private enemy?: Phaser.GameObjects.Sprite; // 敵人動畫
  private damageEffect: Phaser.GameObjects.Sprite; // 受傷特效
  private hp: number = 0; // 血量
  private currentDirection: EnemyDirection = EnemyDirection.Left; // 面對方向, 圖片預設面對左邊

  // 路徑
  private path?: Phaser.Curves.Path;
  // 路徑行走進度: pathProgressRate為一個0~1之間的值, 0表示在起始點, 1表示抵達終點
  private _pathProgressRate: number = 0;
  /** 每秒路徑移動進度:
   * 每秒需前進多少比例的pathProgressRate
   * 例如一個敵人每秒走1格, 它共需要走20格, 則 每秒路徑移動進度 = 1/20 = 0.05
   * 例如一個敵人每秒走1.5格, 它共需要走15格, 則 每秒路徑移動進度 = 1.5/15 = 0.1
   * 為了不想在update裡重複計算此值, 所以才另外存成一個變數
   */
  private pathProgressRatePerSecond: number = 0;

  /** 0~1之間的數字, 當敵人行進進度達到此值時, 觸發續命題 */
  private revivePathProgressRate: number = 0;

  /** 走路動畫播放速度, 每秒播放幾個frame */
  private readonly animEnemyWalkFrameRate: number = 6;
  /** 受傷動畫播放速度, 每秒播放幾個frame */
  private readonly animDamageFrameRate: number = 15;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, 0, 0);

    // 建立路徑時間軸
    this._pathProgressRate = 0;

    // 建立傷害特效
    this.damageEffect = this.addSprite(DefenseString.EnemyDamageEffect, 0, 0);
    this.damageEffect.anims.create({
      key: DefenseEnemyAnimKey.DamageEffect,
      frames: DefenseString.EnemyDamageEffect,
      // 基本動畫速度 * 遊戲加速倍率 = 目標動畫播放速度
      frameRate: this.animDamageFrameRate * TimeEventManager.instance.getCurrentGameSpeed(),
      showOnStart: true,
      hideOnComplete: true,
    });

    // this.onDestroy = this.destroy;
  }

  public setEnemyData(id: number, speed: number) {
    this.index = id;
    this.speed = speed;
  }

  /** 設置敵人的靜態資料以及更新敵人外觀 */
  public setEnemyTableData(tableData: DefenseEnemyData) {
    // 置入靜態資料
    this.tableData = tableData;
    this.hp = tableData.hp;

    if (this.enemy === undefined) {
      this.enemy = this.addSprite(tableData.nameKey, 0, 0);
    }

    // 建立血條
    this.topHp = DefenseGameScene.instance.getHpBar();
    if (this.topHp !== undefined) {
      this.topHp.setValue(tableData.hp, tableData.hp);
      // 根據屬性決定血條顏色
      const hpColor = AttributeHelper.getAttributeColor(this.tableData.attribute);
      this.topHp.setValueColor({ value: 1, color: hpColor });
      // 設定血條size
      this.topHp.setBarSize(50, 15);
    }
    // 設定屬性icon
    const iconKey = AttributeHelper.getAttributeIconImgKey(this.tableData.attribute);
    const attributeIcon = this.topHp.addImage(iconKey, -38, 0);
    attributeIcon.setScale(0.4);

    this.bringToTop(this.damageEffect);
  }

  /** 設置動畫 */
  public setWalkAnimation(framesKey: string) {
    if (this.enemy === undefined) {
      return;
    }

    this.enemy.anims.remove(DefenseEnemyAnimKey.EnemyWalk);
    this.enemy.anims.create({
      key: DefenseEnemyAnimKey.EnemyWalk,
      frames: framesKey,
      // 基本動畫速度 * 遊戲加速倍率 = 目標動畫播放速度
      frameRate: this.animEnemyWalkFrameRate * TimeEventManager.instance.getCurrentGameSpeed(),
      repeat: -1,
    });
  }

  /** 重置物件位置及動畫 */
  public resetEnemyObject() {
    this.enemy?.setPosition(0, 0);
    this.enemy?.anims.remove(DefenseEnemyAnimKey.EnemyWalk);
    this.topHp?.setPosition(0, this.hpOffset);
  }

  /** 繪製敵人路線並啟動敵人前進 */
  public startOnPath(pathNodes: Phaser.Math.Vector2[]) {
    if (this.enemy === undefined || this.topHp === undefined) {
      console.warn('沒有建立敵人動圖');
      return;
    }

    if (false === this.enemy.anims.exists(DefenseEnemyAnimKey.EnemyWalk)) {
      console.warn('沒有建立敵人走路動畫');
      return;
    }

    // 設定血量
    this.topHp.resetHP();

    // 建立路徑並始於原點
    this._pathProgressRate = 0;
    this.path = createPath(pathNodes);

    // 若路徑錯誤則執行摧毀的回呼
    if (this.path === undefined) {
      console.error('TowerRoom: path is built fail!');
      this.onDestroy(this);
      return;
    }

    // 播放走路的動畫
    this.enemy.anims.play(DefenseEnemyAnimKey.EnemyWalk);

    // 設置初始位置
    this.setPosition(pathNodes[0].x, pathNodes[0].y);
  }

  /** 計算每秒路徑移動進度, 需要有speed及path才能計算 */
  public setPathProgressRateInSec(): void {
    if (this.path == null) {
      console.error('DefenseEnemy.setMovingDistanceInSec() error, this.path is null!');
      return;
    }
    // 路徑總長(pixel)
    const totalPathPixels = this.path.getLength();
    // 計算每秒路徑移動進度
    // this.speed 即 "每秒走幾格"
    // (DefenseNumber.TileSizeX / totalPathPixels) 即 "1/總共要走幾格"
    this.pathProgressRatePerSecond = (this.speed * DefenseNumber.TileSizeX) / totalPathPixels;
  }

  public setRevivePathProgressRate(reviveTileNumberToEndPoint: number) {
    if (this.path == null) {
      console.error('DefenseEnemy.setMovingDistanceInSec() error, this.path is null!');
      return;
    }
    // 路徑總長(pixel)
    const totalPathPixels = this.path.getLength();
    // 距離終點x格時會觸發續命題
    const reviveDistance = reviveTileNumberToEndPoint * DefenseNumber.TileSizeY;
    // 0~1之間的數字, 當敵人行進進度達到此值時, 觸發續命題
    this.revivePathProgressRate = (totalPathPixels - reviveDistance) / totalPathPixels;
  }

  // 計算扣血
  public receiveDamage(damage: number, attribute: AttributeType, delay: number) {
    // 判斷是否表演受傷
    if (this.isDead) {
      return;
    }
    const computedDamage = this.computeDamage(damage, attribute);
    this.hp += computedDamage;

    // 作表演
    setTimeout(() => {
      if (this.topHp === undefined) {
        console.warn('沒有建立敵人血條');
        return;
      }

      if (this.scene === undefined && this.topHp.isEmpty) {
        return;
      }

      this.topHp.addValue(computedDamage);

      // 播放音效
      DefenseGameScene.instance.playOnShootSound();

      // 若血量小於零後執行摧毀的回呼
      if (this.topHp.isEmpty) {
        this.damageEffect.anims.complete();
        this.onDestroy(this);
        return;
      }

      // 執行傷害特效
      if (this.damageEffect.anims.isPlaying === false) {
        this.damageEffect.anims.play(DefenseEnemyAnimKey.DamageEffect);
      }
    }, delay);
  }

  public update(time: any, delta: number) {
    // 檢查路徑
    if (this.path === undefined) {
      return;
    }

    // 檢查血量物件
    if (this.topHp !== undefined && this.topHp.isEmpty) {
      return;
    }

    // HpBar位置更新
    this.topHp?.setPosition(this.x, this.y + this.hpOffset);

    // 推進時間軸
    this._pathProgressRate += this.getTimelineDeltaTime(delta);

    // 若行走到指定的進度時, 觸發續命題
    if (this._pathProgressRate > this.revivePathProgressRate && this.onReviveArrive != null) {
      this.onReviveArrive();
    }

    // 判斷是否抵達終點
    if (this._pathProgressRate > 1) {
      if (this.onArrived !== undefined) {
        this.onArrived(this);
      }
      this.damageEffect.anims.complete();
      this.onDestroy(this);
      return;
    }

    // 根據時間找出路徑位置
    const targetPos = this.path.getPoint(this._pathProgressRate);
    // 確定是否轉向
    this.updateDirectionX(this.x, targetPos.x);
    // 設定position
    this.setPosition(targetPos.x, targetPos.y);

    // 更新敵人z方向
    this.setDepth(this.y / 1000);
  }

  /** 預知敵人在x毫秒後的位置 */
  public getFuturePosition(duration: number): Phaser.Math.Vector2 | undefined {
    if (this.path === undefined) {
      return undefined;
    }
    const nextTime = this._pathProgressRate + this.getTimelineDeltaTime(duration);
    if (nextTime > 1) {
      return undefined;
    }
    return this.path.getPoint(nextTime);
  }

  /** 顯示目前敵人的路徑 */
  public showPath() {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3, 0xffffff, 1);
    this.path?.draw(graphics);
  }

  /** 遊戲速度調整時要做的事, 更新動畫播放速度
   * @param newGameSpeed
   */
  public OnGameSpeedReset(newGameSpeed: GameSpeed): void {
    // 防呆
    if (this.enemy === undefined) {
      console.error('DefenseEnemy.OnGameSpeedReset() error, this.enemy is undefined!');
      return;
    }

    // 傷害特效, 更新動畫播放速度
    const damageAnim = this.damageEffect.anims.get(DefenseEnemyAnimKey.DamageEffect);
    damageAnim.frameRate = this.animDamageFrameRate * newGameSpeed;

    // 走路特效, 更新動畫播放速度
    const walkAnim = this.enemy.anims.get(DefenseEnemyAnimKey.EnemyWalk);
    walkAnim.frameRate = this.animEnemyWalkFrameRate * newGameSpeed;
    // 要重新play新的設定, 否則不會套用
    this.enemy.anims.play(DefenseEnemyAnimKey.EnemyWalk);
  }

  /** 確定是否轉向 */
  private updateDirectionX(lastX: number, newX: number) {
    let newDirection: EnemyDirection;
    if (lastX === newX) {
      return;
    }
    // 取得預定要轉的方向
    newDirection = lastX < newX ? EnemyDirection.Right : EnemyDirection.Left;
    // 若沒有要轉向就return
    if (this.currentDirection === newDirection) {
      return;
    }
    // 轉向
    this.enemy?.setScale(newDirection, 1);
    // 存當前面對方向, 避免每個frame都在setX()
    this.currentDirection = newDirection;
  }

  /** 計算x毫秒的path移動進度 */
  private getTimelineDeltaTime(deltaTime: number): number {
    return (deltaTime / 1000) * this.pathProgressRatePerSecond * TimeEventManager.instance.getCurrentGameSpeed();
  }

  /** 根據屬性計算傷害 */
  private computeDamage(damage: number, attribute: AttributeType): number {
    if (this.tableData === undefined) {
      console.error('沒有敵人資料');
      return 0;
    }

    const res = AttributeHelper.attributeRelationship(attribute, this.tableData.attribute);

    if (res === AttributeRelation.Advantage) {
      return -damage * 1.5;
    }

    if (res === AttributeRelation.Disadvantage) {
      return -damage * 0.8;
    }

    return -damage;
  }
}
