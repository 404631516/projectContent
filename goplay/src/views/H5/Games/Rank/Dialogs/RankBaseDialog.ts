import UIDialog from '../../../Scripts/Components/UIDialog';
import { RankString } from '../Data/RankConfig';

export default class RankBaseDialog extends UIDialog {
  protected setUI(): void {
    // 背景
    this.addTileSprite(RankString.BG, this.width * 0.5, this.height * 0.5, this.width, this.height);
  }
}
