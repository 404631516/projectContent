import { Scene } from 'phaser';

export default class FadeText extends Phaser.GameObjects.Text {
  /** 文字消失後的回呼 */
  public onFadeEnd?: (fadeText: FadeText) => void;

  constructor(scene: Scene, x: number, y: number, text: string) {
    super(scene, x, y, text, {
      fontFamily: 'sans-serif, Times, Georgia',
      fontStyle: 'bold',
    });

    this.setFontSize(30);

    // 預設隱藏
    this.setVisible(false);
  }

  /** 往上飄動淡入 */
  public fadeUp(text: string, color: string, x: number, y: number, duration: number = 1000, delay: number = 0) {
    // 設置文字
    this.setPosition(x, y);
    this.setText(text);
    this.setColor(color);
    this.setVisible(true);
    this.setAlpha(1);

    // 增加動畫
    this.scene.tweens.add({
      targets: this,
      y: '-= 100',
      alpha: '-=1',
      delay,
      duration,
      ease: Phaser.Math.Easing.Cubic.Out,
      onComplete: () => {
        this.setVisible(false);
        if (this.onFadeEnd) {
          this.onFadeEnd(this);
        }
      },
    });
  }
}
