import { Scene } from 'phaser';
import UIHelper from '../../Helper/UIHelper';
import Object2D from './Object2D';

type BitmapMask = Phaser.Display.Masks.BitmapMask;
export default abstract class UIDialog extends Object2D {
  public width: Readonly<number>;
  public height: Readonly<number>;
  protected isFullscreen: boolean = true;
  private background!: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;

  public get centerX(): number {
    return this.x + this.width * 0.5;
  }
  public get centerY(): number {
    return this.y + this.height * 0.5;
  }

  constructor(scene: Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    const canvas = this.scene.game.canvas;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  /** 是否全螢幕 */
  public get fullscreen(): boolean {
    return this.isFullscreen;
  }
  public set fullscreen(value: boolean) {
    this.isFullscreen = value;
    if (value) {
      this.background.setActive(true);
    } else {
      this.background.setActive(false);
    }
  }

  /** 初始化Dialog(建立圖層以及背景遮罩) */
  public initialize(fullscreen: boolean = true): void {
    // 製作後面的全螢幕背景
    this.defaultBackground();
    this.fullscreen = fullscreen;
    // 顯示UI
    this.setUI();
  }

  /** 產生預設的Dialog背景 */
  public defaultBackground(): void {
    // 先移除場上原有的背景
    this.background?.destroy();

    // 製作半透明的黑幕
    this.background = this.scene.add.rectangle(this.width / 2, this.height / 2, this.width, this.height);
    this.background.fillColor = 0;
    this.background.setAlpha(0.8);
    this.add(this.background);
  }

  /** 在中心顯示文字
   * @param content 要顯示的內容
   * @param textStyle 文字風格
   * @returns Phaser.GameObjects.Text
   */
  public addTextToCenter(content: string, textStyle: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return this.addText(content, this.centerX, this.centerY, textStyle);
  }

  /** 設置UI */
  protected abstract setUI(): void;

  /** 更換背景 */
  protected changeBackground(key: string): void {
    // 先移除場上原有的背景
    this.background?.destroy();
    // 新增新的背景物件
    this.background = this.addImage(key, this.width * 0.5, this.height * 0.5);
    // 調整圖片長寬, 對應當前gamescene設定大小
    this.background.displayWidth = this.width;
    this.background.displayHeight = this.height;
  }

  /** 製作遮罩
   * @param shape 要創建的形狀
   * @param x 位置x
   * @param y 位置y
   * @returns BitmapMask
   */
  protected createShapeMask(shape: Phaser.GameObjects.Shape, x: number = 0, y: number = 0): BitmapMask {
    this.add(shape);
    shape.setVisible(true);
    shape.setPosition(x, y);
    return shape.createBitmapMask(shape);
  }

  /** 製作一個方形遮罩
   * @param width 寬
   * @param height 高
   * @param x 位置x
   * @param y 位置y
   * @param alpha 透明度
   * @returns BitmapMask
   */
  protected createRectMask(
    width: number,
    height: number,
    x: number = 0,
    y: number = 0,
    fillColor: number = UIHelper.blackNumber,
    alpha = 1
  ): BitmapMask {
    const shape = this.scene.add.rectangle(0, 0, width, height, fillColor, alpha);
    return this.createShapeMask(shape, x, y);
  }

  /** 製作一個圓形遮罩
   * @param radius 半徑
   * @param x 位置x
   * @param y 位置y
   * @param alpha 透明度
   * @returns BitmapMask
   */
  protected createCircleMask(
    radius: number,
    x: number = 0,
    y: number = 0,
    fillColor: number = UIHelper.blackNumber,
    alpha = 1
  ): BitmapMask {
    const shape = this.scene.add.circle(0, 0, radius, fillColor, alpha);
    return this.createShapeMask(shape, x, y);
  }

  /** 製作一個圖形遮罩 */
  protected createImageMask(key: string, x: number = 0, y: number = 0, alpha = 1): BitmapMask {
    const shape = this.addImage(key, x, y);
    shape.setVisible(false);
    shape.setAlpha(alpha);
    return shape.createBitmapMask(shape);
  }
}
