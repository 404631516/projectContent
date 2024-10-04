import UIDialog from '../../../Scripts/Components/UIDialog';
import { DefenseString } from '../Data/DefenseConfig';

export default class DefenseStateDialog extends UIDialog {
  private baseText?: Phaser.GameObjects.Text;
  private stageText?: Phaser.GameObjects.Text;
  private stageTag?: Phaser.GameObjects.Image;

  /** 更換階段 */
  public changeState(content: string, delay: number = 500) {
    if (this.stageText === undefined || this.stageTag === undefined) {
      return;
    }

    // 設置文字
    this.stageText.setText(content);

    // 淡出
    this.scene.add.tween({
      delay,
      targets: [this.baseText, this.stageText, this.stageTag],
      alpha: 1,
      duration: 1000,
    });

    // 淡入
    this.scene.add.tween({
      delay: 5000,
      targets: [this.baseText, this.stageText, this.stageTag],
      alpha: 0,
      duration: 1000,
    });
  }

  protected setUI(): void {
    const x = this.width * 0.5;
    const y = this.height * 0.2;
    this.stageTag = this.addImage(DefenseString.StageTag, x, y);
    this.stageTag.setAlpha(0);
    this.baseText = this.addText(`進入第       階段`, x, y, { fontSize: '30px', color: '#FFFFFF' });
    this.baseText.setAlpha(0);
    this.stageText = this.addText(``, x + 12, y - 2, {
      fontSize: '30px',
      color: '#FFFF00',
    });
    this.stageText.setAlpha(0);
  }
}
