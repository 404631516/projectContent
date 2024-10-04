import { Scene } from 'phaser';
import WeaponBomb, { BombType } from './WeaponBomb';
import DefenseGameScene from '../Scenes/DefenseGameScene';
import DefenseEnemy from './DefenseEnemy';
import WeaponDisplay from './WeaponDisplay';
import { parseAngle } from '@/views/H5/Helper/MathHelper';
import { DefenseWeaponData } from '@/manager/TableManager';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import InfoBox, { InfoBoxResponse } from '@/views/H5/Scripts/Components/InfoBox';
import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import DefenseWeaponPlaceDialog from '../Dialogs/DefenseWeaponPlaceDialog';
import { DefenseNumber } from '../Data/DefenseConfig';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import TextDialog from '../../UIHelper/TextDialog';
import TimeEventManager from '@/views/H5/Scripts/Manager/TimeEventManager';

/** 實際執行遊戲的生物兵器物件 */
export default class WeaponTower extends WeaponDisplay {
  /** 是否為英雄砲塔 */
  private get isHeroTower(): boolean {
    // 用當初是否傳入mapDataTilePos來判斷
    return this.mapDataTilePos === undefined;
  }
  private get attackRadius(): number {
    if (this._attackRadius === 0) {
      // 半徑轉換:radiusInExcel代表的是: 每100代表半徑一格, 這邊要轉成pixel
      // 這邊偷偷多加一個"0.1"格的誤差計算,
      // 以免enemy快速通過砲塔面前時, 距離剛好卡在兩個frame之間, 從而導致砲塔不發射
      const radiusInExcel = this.weapon.data.attackRange + 10;
      // 實際上一格的X跟Y不同, 這邊取較大者X
      this._attackRadius = (radiusInExcel * DefenseNumber.TileSizeX) / 100;
    }
    return this._attackRadius;
  }

  /** 場上砲塔流水號 */
  public key: number = 0;
  /** 砲塔之間, render順序 */
  public order: number = 0;
  /** 砲塔靜態表 */
  public tableData: DefenseWeaponData;

  /** 砲管是否要隨著瞄準目標旋轉 */
  public isBarrelRotate: boolean = true;
  /** 砲管圖片當前是否左右翻轉 */
  protected isBarrelFlip: boolean = false;
  private textDialog?: TextDialog;
  /** 砲塔設置區域在DefenseMapDialog.mapData中的位置 */
  private mapDataTilePos?: Phaser.Math.Vector2;
  /** 子彈scale比例 */
  private bombScale: number = 1;
  /** 現在是否是射擊cooldown狀態 */
  private isCooldown = false;

  /** 砲塔說明文字相關數值 */
  private textDialogScale: number = 6.6;
  private textDialogOffsetY = -40;

  /** 攻擊範圍偵測原點 */
  private attackRadiusOriginPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  /** 攻擊半徑 */
  private _attackRadius: number = 0;

  /** 砲台點擊 觸控範圍大小 */
  private originWeaponSize: Size = {
    width: 512,
    height: 512,
  };

  constructor(scene: Scene, x: number, y: number, defenseWeaponData: DefenseWeaponData) {
    super(scene, x, y, defenseWeaponData);
    this.tableData = defenseWeaponData;
  }

  /** 砲塔初始化 */
  public init(
    key: number,
    tilePos: Phaser.Math.Vector2 | undefined,
    attackRadiusOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0),
  ): void {
    this.key = key;
    this.mapDataTilePos = tilePos;
    // 生成一個觸控範圍 點擊後詢問是否撤除砲塔
    // 砲塔本身有被額外scale過, 這邊觸控範圍只須設定成跟原圖一樣大小即可
    const zoneWidth = this.originWeaponSize.width / this.scale;
    const zoneHeight = this.originWeaponSize.height / this.scale;
    const block = this.addZone(0, 0, zoneWidth, zoneHeight);

    // 對話泡泡 道具說明
    this.textDialog = this.addObject(0, this.textDialogOffsetY, TextDialog);
    const content = Localization.getText(LocalKeyType.Common, this.tableData.contentKey);
    this.textDialog.setText(content);
    this.textDialog.setVisible(false);
    this.textDialog.setScale(this.textDialogScale);

    // 攻擊範圍原點設定
    this.attackRadiusOriginPos = new Phaser.Math.Vector2(this.x + attackRadiusOffset.x, this.y + attackRadiusOffset.y);
    // 測試用, 畫出攻擊範圍
    // this.drawAttackRange();

    // 觸控範圍設定
    block.setInteractive({ useHandCursor: true });
    block.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickWeaponTower();
    });
    block.on(Phaser.Input.Events.POINTER_OVER, () => {
      // 顯示 砲塔說明文字
      this.textDialog?.setVisible(true);
    });
    block.on(Phaser.Input.Events.POINTER_OUT, () => {
      // 隱藏 砲塔說明文字
      this.textDialog?.setVisible(false);
    });
  }

  /** 從外部取得本砲塔在MapData裡的座標 */
  public getMapDataTilePos(): Phaser.Math.Vector2 | undefined {
    return this.mapDataTilePos;
  }

  /** 測試用, 畫出攻擊範圍 */
  public drawAttackRange() {
    const attackRangeGraphic = this.scene.add.graphics().lineStyle(2, 0xd9d6be, 1); // thickness, color, alpha
    attackRangeGraphic.strokeCircle(
      this.attackRadiusOriginPos.x,
      this.attackRadiusOriginPos.y,
      this.attackRadius, // radius
    );
  }

  public update(TIME: number, delta: number) {
    // 若冷卻時間還沒結束, 直接return
    if (this.isCooldown) {
      return;
    }

    // 若冷卻時間結束, 試著攻擊射程範圍內的敵人
    if (this.tryShoot()) {
      // 進入冷卻狀態
      this.isCooldown = true;
      // 計算下次可攻擊時間(冷卻結束時間)
      // attackSpeed為攻擊頻率
      // 所求 冷卻時間 = 攻擊週期 = (1 / attackSpeed)
      const currentTime = TimeEventManager.instance.getTime();
      const cooldownEndTime = currentTime + 1000 / this.weapon.data.attackSpeed;
      // 設定一個timeEvent, 冷卻時間結束後重置isCooldown
      TimeEventManager.instance.newTimeEvent(cooldownEndTime, () => {
        this.isCooldown = false;
      });
    }
  }

  /** 點擊砲塔觸控範圍 */
  private async onClickWeaponTower() {
    // 排除英雄砲塔, 英雄砲塔沒有設置mapDataTilePos
    if (this.isHeroTower) {
      return;
    }
    // 視窗詢問是否拆除
    const weaponName = Localization.getText(LocalKeyType.Common, this.tableData.nameKey);
    const response = await InfoBox.customMessage([this.scene], `是否卸載${weaponName}?`, '', '', '', 'red-button');
    if (response === InfoBoxResponse.Confirm) {
      // 通知DefenseWeaponPlaceDialog, 從tower清單移除, 此地點回復為"可設置"
      const defenseWeaponPlaceDialog = UIManager.instance.assureDialog(DefenseWeaponPlaceDialog, this.scene);
      defenseWeaponPlaceDialog.onTowerDestroy(this);
      // 自我毀滅
      this.destroy();
    }
  }

  /** 砲台射擊 */
  private tryShoot(): boolean {
    // 取得敵人，沒有敵人則不動作
    const enemy = this.getEnemy();
    if (enemy == null) {
      return false;
    }
    // 敵人已死
    if (enemy.isDead) {
      return false;
    }
    // 遊戲已結束
    if (DefenseGameScene.instance.isGameEnd) {
      return false;
    }
    // 取得敵人被砲彈打中的位置
    const pos = enemy.getFuturePosition(DefenseNumber.BombHitTime / TimeEventManager.instance.getCurrentGameSpeed());
    if (pos === undefined) {
      return false;
    }
    // 取得子彈，沒有子彈則不動作
    const bomb = this.getBomb();
    if (bomb === null) {
      return false;
    }

    // 調整砲彈以及砲台的順序
    this.addAt(bomb, 0);
    bomb.setScale(this.bombScale);

    // 砲管旋轉
    if (this.isBarrelRotate && this.barrel) {
      // 計算砲管旋轉角度
      const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      const parsedAngle = parseAngle(Phaser.Math.RadToDeg(angle) + 180);
      this.barrel.angle = parsedAngle;
      // 判斷砲管是否要左右翻轉
      const flipRange = (parsedAngle > 90 && parsedAngle <= 180) || (parsedAngle > -180 && parsedAngle <= -90);
      if (this.isBarrelFlip !== flipRange) {
        this.barrel.flipY = true;
        this.isBarrelFlip = flipRange;
      }
    }

    // TODO:　tower xy
    // 子彈發射特效
    const targetPos = new Phaser.Math.Vector2((pos.x - this.x) / this.scaleX, (pos.y - this.y) / this.scaleY);
    const bombHitTime = DefenseNumber.BombHitTime / TimeEventManager.instance.getCurrentGameSpeed();
    const bombType = this.barrel.visible ? BombType.Linear : BombType.Parabola;
    bomb.shoot(0, 0, targetPos, bombHitTime, bombType);
    enemy.receiveDamage(this.weapon.data.attack, this.weapon.data.attribute, bombHitTime);

    return true;
  }

  /** 取得子彈 */
  private getBomb(): WeaponBomb | null {
    return DefenseGameScene.instance.getBomb(this.weapon.bombKey);
  }

  /** 取得敵人 */
  private getEnemy(): DefenseEnemy | null {
    return DefenseGameScene.instance.getEnemy(this.attackRadiusOriginPos, this.attackRadius);
  }
}
