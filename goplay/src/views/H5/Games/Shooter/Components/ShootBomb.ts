import { ShootBombData } from '@/manager/TableManager';
import { ShootNumber } from '../Data/ShooterConfig';
import ShooterGameScene from '../Scenes/ShooterGameScene';

export default class ShootBomb extends Phaser.Physics.Arcade.Image {
  /** 遊戲場景 */
  public declare scene: ShooterGameScene;

  /** 炸彈縮放 */
  private readonly bombScale: number = 0.5;

  /** 炸彈靜態表資料 */
  public bombData?: Readonly<ShootBombData>;

  /** 砲彈標記，避免重複攻擊 */
  private _index: number = 0;
  public get index(): number {
    return this._index;
  }

  /** 用接收到的資料設定外觀並發射
   * @param data 炸彈資料
   * @param index 炸彈標記，避免重複攻擊
   * @param angle 射擊角度
   */
  public shoot(data: ShootBombData, index: number, angle: number): void {
    this.bombData = data;
    // 設定砲彈圖片
    this.setTexture(data.nameKey);
    // 標記砲彈index
    this._index = index;
    // 設定砲彈的物理性質
    this.body!.setSize(this.width, this.height);

    // 顯示跑彈
    this.setScale(this.bombScale);
    this.setActive(true);
    this.setVisible(true);

    // 設置加速度與重力
    const velocityX = ShootNumber.BombVelocity * Math.cos(angle);
    const velocityY = ShootNumber.BombVelocity * Math.sin(angle);
    this.setVelocity(velocityX, velocityY);
    this.setGravityY(ShootNumber.BombGravity);

    // 設置炸彈生存時間
    this.scene.time.addEvent({
      delay: ShootNumber.BombLifeTimeMilliSec,
      callback: () => {
        this.setVisible(false);
        this.setActive(false);
        this.scene.bombShootComplete();
      },
    });
  }
}
