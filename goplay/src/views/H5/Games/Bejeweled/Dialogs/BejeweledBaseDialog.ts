import UIDialog from '../../../Scripts/Components/UIDialog';
import { BejeweledString } from '../Data/BejeweledConfig';

export default class BejeweledBaseDialog extends UIDialog {
  protected setUI(): void {
    // 更換背景
    this.changeBackground(BejeweledString.BG);
  }
}
