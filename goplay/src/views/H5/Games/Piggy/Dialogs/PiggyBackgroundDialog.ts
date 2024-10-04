import UIDialog from '../../../Scripts/Components/UIDialog';
import { PiggyString } from '../Data/PiggyConfig';

export default class PiggyBackgroundDialog extends UIDialog {
  protected setUI() {
    this.changeBackground(PiggyString.Background);
  }
}
