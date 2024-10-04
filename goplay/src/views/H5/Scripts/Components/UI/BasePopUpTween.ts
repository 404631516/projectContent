import { MinMax } from '@/views/H5/Helper/PhaserHelper';
import HorizontalLayout from '../HorizontalLayout';
import Object2D from '../Object2D';

export default abstract class BasePopUpTween extends Object2D {
  /** 持續秒數 */
  protected abstract duration: number;
  /** 上浮距離 */
  protected abstract distanceY: number;
  /** 上浮過程中橫移距離 */
  protected abstract distanceX: MinMax;
  /** 起始位置偏移 */
  protected abstract offsetX: MinMax;

  /** 文字圖示 */
  protected icon: Phaser.GameObjects.Image;
  /** 文字元件 */
  protected text: Phaser.GameObjects.Text;
  /** 暫存tween */
  protected tween?: Phaser.Tweens.Tween;
  /** 水平排列元件 */
  protected _layout: HorizontalLayout;
  public get layout(): HorizontalLayout {
    return this._layout;
  }

  /** Constructor
   * @param scene 遊戲場景
   * @param x 位置x
   * @param y 位置y
   * @param textStyle 文字風格
   */
  constructor(scene: Phaser.Scene, x: number, y: number, textStyle: Phaser.Types.GameObjects.Text.TextStyle) {
    super(scene, x, y);

    // 文字圖示
    this.icon = this.addImage('', 0, 0);
    this.icon.setVisible(false);

    // 文字
    this.text = this.addText('', 0, 0, textStyle);

    // 設置對齊Layout
    this._layout = new HorizontalLayout(this.addObject(0, 0));
    this.layout.fitElements = true;
  }

  /** 設置popUpUI
   * @param content 要顯示的內容
   * @param iconKey 要顯示的Icon(左側)
   * @param iconScale Icon的Scale
   */
  public setDisplay(content: string, iconKey?: string, iconScale?: number): void {
    // 用對齊Layout排列ui (因為要重新設定元件順序，只能清除參考不可刪除)
    this.layout.removeAllElements(false);

    // 判斷是否顯示圖標
    if (iconKey) {
      // 設置圖標材質
      this.icon.setTexture(iconKey);
      this.icon.setVisible(true);
      // 縮放圖示
      this.icon.setScale(iconScale ?? 1);
      // 水平排列
      this.layout.addElement(this.icon);
    }
    // 不顯示圖標
    else {
      this.icon.setVisible(false);
    }

    // 設置文字
    this.text.text = content;
    this.layout.addElement(this.text);
  }

  /** 播放PopUp動畫 */
  public playTween(): void {
    // 確保動畫消除
    if (this.tween) {
      this.scene.tweens.remove(this.tween);
    }

    // 繪製layout顯示
    this.layout.draw();

    // 紀錄原點位置
    const originalX = this.x;
    const originalY = this.y;

    // tween的onStart不保證在同一frame執行，因此先行開啟active，確保此元件本身正在使用中
    this.setActive(true);
    // 設置tween
    this.tween = this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0 },
      y: `-=${this.distanceY}`,
      x: {
        // 起始位置偏移，避免重疊
        from: `+=${Phaser.Math.Between(this.distanceX.min, this.distanceX.max)}`,
        // 左右隨機飄動
        to: `+=${Phaser.Math.Between(this.distanceX.min, this.distanceX.max)}`,
      },
      duration: this.duration,
      ease: 'Sine.easeIn',
      onStart: () => {
        this.setVisible(true);
      },
      onComplete: () => {
        this.setVisible(false);
        this.setActive(false);
        // 回復原點位置
        this.x = originalX;
        this.y = originalY;
      },
    });
  }
}

/** 預設PopUpTween */
export class PopUpTween extends BasePopUpTween {
  /** 持續秒數 */
  protected readonly duration: number = 1000;
  /** 上浮距離 */
  protected readonly distanceY: number = 100;
  /** 上浮過程中橫移距離 */
  protected readonly distanceX: MinMax = { min: -30, max: 30 };
  /** 起始位置偏移 */
  protected readonly offsetX: MinMax = { min: -30, max: 30 };
}
