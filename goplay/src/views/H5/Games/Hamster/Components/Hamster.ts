import { HamsterData } from '@/manager/TableManager';
import Object2D from '../../../Scripts/Components/Object2D';
import { Scene } from 'phaser';
import HamsterDisplay from './HamsterDisplay';
import HamsterGameScene from '../Scenes/HamsterGameScene';

/** 地鼠蹲下的距離 */
const offset = 60;
/** 進場/退場 的動畫時間 */
const tweenTime = 500;

export default class Hamster extends Object2D {
  /** 地鼠鑽回地洞的時間 */
  public set disappearTime(value: number) {
    value = value < tweenTime ? tweenTime : value;
  }

  /** 地鼠剩餘的打擊數 */
  public get currentHp(): number {
    return this.hp;
  }
  /** 是否地鼠鑽出地面中 */
  public isAppear: Readonly<boolean> = false;
  /** 是否存活 */
  public isAlive: Readonly<boolean> = false;

  /** 當地鼠回到洞穴裡的回呼 */
  public onDisappearHurt?: (data: Hamster) => void;
  /** 當地鼠被擊敗後的回呼 */
  public onDie?: (data: Hamster) => void;
  /** 當地鼠啟動攻擊後的回呼 */
  public onAttack?: (data: HamsterData) => void;

  /** 地鼠靜態資料 */
  public hamsterData: Readonly<HamsterData>;

  /** 地鼠攻擊的目標 */
  private target?: Object2D | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  /** 地鼠觸控範圍 */
  private hitZone: Phaser.GameObjects.Zone;
  private isHitZoneAvailable: boolean = false;
  /** 地鼠圖片 */
  private hamsterDisplay: HamsterDisplay;
  /** 當前剩餘hp */
  private hp: number = 1;
  /** 地鼠出現的貯列 */
  private hamsterQueue: HamsterData[] = [];
  /** 停留在地洞外的時間事件 */
  private stayTimeEvent?: Phaser.Time.TimerEvent;
  /** 地鼠攻擊的時間事件 */
  private attackTimeEvent?: Phaser.Time.TimerEvent;

  private hamsterScale: number = 1;

  constructor(scene: Scene, x: number, y: number, data: HamsterData, mask: Phaser.Display.Masks.BitmapMask) {
    super(scene, x, y);
    // 設置靜態資料
    this.hamsterData = data;

    // 設置地鼠圖片
    this.hamsterDisplay = this.addObject(0, 0, HamsterDisplay, data);

    // 使用遮罩讓地鼠藏到洞內
    this.hamsterDisplay.setMask(mask);
    this.hamsterDisplay.setVisible(false);
    this.hamsterDisplay.setScale(this.hamsterScale);

    // 設定觸控範圍, 長在地洞的位置, 跟地洞一樣寬, 底部對齊地洞底部, 高度比地洞高一些
    this.hitZone = this.addZone(0, 40, 120, 100);
    // 設定觸控範圍event
    this.hitZone.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.onClick();
    });
  }
  /** 點擊後可以扣除多少血量的回呼 */
  public onHit: (data: Hamster) => number = (data: Hamster) => 1;
  public setTarget(target: Object2D | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
    this.target = target;
  }

  /** 地鼠從地洞出現 */
  public appear(data: HamsterData): void {
    if (this.isAppear) {
      this.hamsterQueue.push(data);
      return;
    }
    // 開啟觸控範圍偵測
    this.setHitZoneAvailable(true);
    // 清除等待時間的事件
    this.stayTimeEvent?.remove();
    this.attackTimeEvent?.remove();
    // 標示地鼠在洞外
    this.isAppear = true;
    // 標示地鼠還未擊敗
    this.isAlive = true;
    // 新的地鼠資料則更換
    if (data) {
      // 設定地鼠資料以及顯示
      this.hamsterData = data;
      this.hamsterDisplay.setHamster(data);
      // hp重置
      this.hp = this.hamsterData.hits;
    }
    // 先讓地鼠躲起來
    this.hamsterDisplay.setPosition(0, this.hamsterDisplay.height);
    this.hamsterDisplay.setVisible(true);
    // 判斷地鼠是否有要攻擊
    if (this.hamsterData.attackId >= 0 && this.hamsterData.attackTime > 0) {
      // 建立 攻擊TimeEvent
      this.attackTimeEvent = this.scene.time.addEvent({
        // 建立攻擊的時間: tween出場時間+靜態表攻擊時間
        delay: tweenTime + this.hamsterData.attackTime * 1000,
        callback: () => {
          this.attack();
        },
      });
    }
    // 建立 退場TimeEvent
    this.stayTimeEvent = this.scene.time.addEvent({
      delay: tweenTime + this.hamsterData.appearTime * 1000,
      callback: () => {
        this.disappear();
      },
    });
    // 執行地鼠出現的動畫
    this.scene.tweens.add({
      targets: this.hamsterDisplay,
      y: `-=${this.hamsterDisplay.height - offset}`,
      duration: tweenTime,
      ease: Phaser.Math.Easing.Back.Out,
    });
  }

  /** 地鼠沒被擊殺, 自行鑽回地底 */
  public disappear(): void {
    // 若已經被擊敗則跳過動畫
    if (this.isAlive === false) {
      return;
    }

    // 退場動畫, 此時並未關閉觸控範圍, 所以執行退場動畫期間還是有可能被擊殺
    this.scene.tweens.add({
      targets: this.hamsterDisplay,
      y: `+=${this.hamsterDisplay.height - offset}`,
      duration: tweenTime,
      ease: Phaser.Math.Easing.Back.In,
      onComplete: () => {
        // 關閉觸控範圍偵測
        this.setHitZoneAvailable(false);
        // 若玩家未成功擊敗地鼠, 則玩家扣血
        // 若玩家在退場動畫執行期間擊敗地鼠, 就不會扣血
        if (this.onDisappearHurt && this.isAlive) {
          this.onDisappearHurt(this);
        }
        // 設定地鼠隱藏
        this.hamsterDisplay.setVisible(false);
        this.isAppear = false;
        // 檢查是否還有在等待出現的資料，有則執行出洞
        if (this.hamsterQueue.length > 0) {
          this.appear(this.hamsterQueue[0]);
          this.hamsterQueue.shift();
        }
      },
    });
  }

  /** 當地鼠被擊殺 */
  public die(): void {
    // 換圖
    this.hamsterDisplay.setHamsterImage(this.hamsterData.dieDisplayKey);
    // 取消攻擊事件
    this.attackTimeEvent?.destroy();
    // 關閉觸控範圍偵測
    this.setHitZoneAvailable(false);
    // 地鼠死亡
    this.isAlive = false;
    // 執行被擊敗後的callback
    if (this.onDie) {
      this.onDie(this);
    }
    // 執行被擊敗的退場動畫
    this.scene.tweens.add({
      targets: this.hamsterDisplay,
      delay: 100,
      y: `+=${this.hamsterDisplay.height - offset}`,
      duration: 300,
      ease: Phaser.Math.Easing.Cubic.In,
      onComplete: () => {
        // 設定地鼠沒有顯示中
        this.hamsterDisplay.setVisible(false);
        this.isAppear = false;
        // 檢查是否還有在等待出現的資料，有則執行出洞
        if (this.hamsterQueue.length > 0) {
          this.appear(this.hamsterQueue[0]);
          this.hamsterQueue.shift();
        }
      },
    });
  }

  /** 地鼠攻擊 */
  public attack(): void {
    if (this.target == null) {
      console.error('Hamster.attack() error, this.target is null!');
      return;
    }
    // 檢查是否有攻擊資料
    const attackData = this.hamsterDisplay.attackData;
    if (attackData === undefined) {
      console.error('Hamster.attack() error, attackData is null!');
      return;
    }
    // 取得攻擊物件
    const hamsterAttack = HamsterGameScene.instance.getAttack(attackData.nameKey);
    // 執行攻擊動畫
    hamsterAttack.attack(
      new Phaser.Math.Vector2(this.x, this.y),
      new Phaser.Math.Vector2(this.target.x, this.target.y),
      () => {
        if (this.onAttack) {
          this.onAttack(this.hamsterData);
        }
      }
    );
  }

  /** 點擊地洞callback */
  private onClick(): void {
    // 檢查觸控範圍是否允許觸控
    if (this.isHitZoneAvailable === false) {
      return;
    }
    // 計算打擊的次數
    const hitCount = this.onHit(this);
    // 扣血
    this.hp -= hitCount;
    // 更新血條UI
    this.hamsterDisplay.updateHp(hitCount);
    // 震動
    this.hamsterDisplay.setScale(this.hamsterScale * 0.9);
    this.scene?.add.tween({
      targets: this.hamsterDisplay,
      duration: 50,
      scale: this.hamsterScale * 1.1,
      repeat: 1,
      onComplete: () => {
        this.hamsterDisplay.setScale(this.hamsterScale);
      },
    });
    // 若點擊達到次數並且地鼠還活著則進行擊敗動作
    if (this.hp === 0 && this.isAlive) {
      this.die();
    }
  }

  /** 開啟/關閉 觸控範圍 */
  private setHitZoneAvailable(isAvailable: boolean): void {
    // 觸控範圍 顯示/隱藏 滑鼠手指提示
    if (isAvailable) {
      this.hitZone.setInteractive({ useHandCursor: true });
    } else {
      this.hitZone.disableInteractive();
    }
    // 開始/停止 觸發點擊事件
    this.isHitZoneAvailable = isAvailable;
  }
}
