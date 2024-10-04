import UIDialog from '../../../Scripts/Components/UIDialog';
import TableManager from '@/manager/TableManager';
import { ShootNumber, ShootString } from '../Data/ShooterConfig';
import { createParabola } from '../../../Helper/MathHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import ShooterGameScene from '../Scenes/ShooterGameScene';

export default class ShootCannonDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: ShooterGameScene;

  /** 拋物瞄準線要畫至右方x個pixel為止 */
  private readonly parabolaDistanceX: number = 400;
  /** 提示拋物線的採樣數 */
  private readonly parabolaHintPointNumber: number = 20;

  /** 射擊以及點擊區域 */
  private shootZone!: Phaser.GameObjects.Zone;
  /** 砲台 */
  private cannon!: Phaser.GameObjects.Image;

  /** 炮管 */
  private barrel!: Object2D;
  /** 用於繪出發射路徑 */
  private graphics!: Phaser.GameObjects.Graphics;

  protected setUI(): void {
    // 設置砲台
    this.setCannon();
    // 設置範圍
    this.setZone();
  }

  /** 建立砲台 */
  private setCannon(): void {
    // 設置英雄圖片大小、位置
    this.cannon = this.addImage(ShootString.Cannon, 120, 450);
    this.cannon.setScale(-0.5, 0.5);
    // 發射起始點
    this.barrel = this.addObject(140, 380);
    // 繪製瞄準線
    this.graphics = this.addGraphics(0, 0);
    this.graphics.lineStyle(10, 0x000000);
  }

  /** 建立點擊範圍 */
  private setZone(): void {
    // 建立點擊範圍
    this.shootZone = this.addZone(this.width / 2, this.height / 2, this.width, this.height);
    this.shootZone.setInteractive({ useHandCursor: true });

    // 建立轉動砲台角度的事件
    this.shootZone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, (pointer: any) => {
      // 計算炮管角度
      const angle = Phaser.Math.Angle.BetweenPoints(this.barrel, pointer);
      // 角度不超過-90~90的範圍
      if (Math.abs(Phaser.Math.RadToDeg(angle)) >= 89) {
        return;
      }

      // 更換炮管角度
      this.barrel.angle = angle;
      // 描繪出拋物線
      this.drawParabola(angle, ShootNumber.BombVelocity, ShootNumber.BombGravity);
    });

    /** 建立發射的事件 */
    this.shootZone.on(Phaser.Input.Events.POINTER_UP, () => {
      // 通知ShooterGameScene玩家發射
      this.scene.shoot(this.barrel);
    });
  }

  /** 建立砲彈的發射路線 */
  private drawParabola(angle: number, velocity: number, gravity: number): void {
    if (this.graphics === undefined || this.barrel === undefined) {
      return;
    }

    // 建立拋物線
    const curve = createParabola({
      originX: this.barrel.x,
      originY: this.barrel.y,
      endX: this.parabolaDistanceX,
      angle,
      velocity,
      gravity,
    });

    // 取得拋物線上的點
    const points = curve.getPoints(this.parabolaHintPointNumber);

    // 繪出虛線
    this.graphics.clear();
    for (let i = 0; i < points.length; ++i) {
      this.graphics?.fillStyle(0xffffff, (points.length - i) / points.length);
      this.graphics?.fillCircle(points[i].x, points[i].y, 4);
    }
  }

  /** 設置左下角英雄圖片 */
  public setHero(heroId: number): void {
    const heroData = TableManager.hero.findOne(heroId);
    this.cannon.setTexture(heroData ? heroData.nameKey : '');
  }
}
