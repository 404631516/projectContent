import UIDialog from '../../../Scripts/Components/UIDialog';
import { MatchingCardString } from '../Data/MatchingCardConfig';

/** 翻翻牌 小遊戲-背景UI */
export default class MatchingCardBackgroundDialog extends UIDialog {
  protected setUI() {
    this.changeBackground(MatchingCardString.Background);
  }
}
