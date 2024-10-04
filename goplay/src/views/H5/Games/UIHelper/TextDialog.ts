import { Scene } from 'phaser';
import Object2D from '../../Scripts/Components/Object2D';
import Layout from '../../Scripts/Components/Layout';
import { Padding } from '../../Helper/MathHelper';
import HorizontalLayout from '../../Scripts/Components/HorizontalLayout';

export default class TextDialog extends Object2D {
  /** 對話框顏色 */
  public color: number = 0x000000;
  /** 對話框透明度 */
  public alpha: number = 0.8;
  public padding: Padding = { top: 10, bottom: 10, left: 10, right: 10 };
  private graphic: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private textLayout: Layout;
  private arrPad: number = 10;

  constructor(scene: Scene, x?: number, y?: number) {
    super(scene, x, y);

    this.graphic = this.addGraphics(0, 0);
    this.text = this.addText('', 0, 0);
    this.textLayout = new HorizontalLayout(this.addObject(0, 0));
    this.textLayout.addElement(this.text);
    this.textLayout.fitElements = true;
    // 重算容器範圍及背景，排列容器內元件
    this.textLayout.draw();
  }

  /** 輸入文字內容 */
  public setText(content: string) {
    this.text.setText(content);
    this.textLayout.container.setActive(true);
    this.textLayout.draw();

    this.draw();
  }

  public draw() {
    // 清空對話框
    this.graphic.clear();

    // 繪製對話框下方三角形
    this.graphic.fillStyle(this.color, this.alpha);
    this.graphic.fillTriangle(0, 0, this.arrPad, -this.arrPad, -this.arrPad, -this.arrPad);

    // 對話框尺寸
    const size: { width: number; height: number } = { width: 0, height: 0 };

    // 設置尺寸
    size.width = this.textLayout.container.width;
    size.height = this.textLayout.container.height;

    // 設定位置
    this.textLayout.container.setPosition(0, -size.height * 0.5 - this.arrPad - this.padding.top);

    size.width = size.width + this.padding.left + this.padding.right;
    size.height = size.height + this.padding.top + this.padding.bottom;

    // TODO 改layout bg
    // 繪製對話框
    this.graphic.fillRoundedRect(-size.width * 0.5, -this.arrPad - size.height, size.width, size.height, 5);
  }
}
