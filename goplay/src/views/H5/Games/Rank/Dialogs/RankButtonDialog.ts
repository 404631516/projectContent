import UIDialog from '../../../Scripts/Components/UIDialog';
import { RankString } from '../Data/RankConfig';
import RankGameScene from '../Scenes/RankGameScene';

export default class RankButtonDialog extends UIDialog {
  /** 指定為RankGameScene使用 */
  public declare scene: RankGameScene;

  protected setUI(): void {
    // 返回最上方按鈕
    const backToTopBtn = this.addImage(RankString.BackToTop, this.width * 0.9, this.height * 0.9);
    backToTopBtn.setInteractive({ useHandCursor: true });
    backToTopBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.onBackToTopButton();
    });
  }
}
