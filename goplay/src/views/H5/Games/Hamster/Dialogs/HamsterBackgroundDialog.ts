import UIDialog from '../../../Scripts/Components/UIDialog';
import { HamsterString } from '../Data/HamsterConfig';
export default class HamsterBackgroundDialog extends UIDialog {
  protected setUI(): void {
    this.changeBackground(HamsterString.Background);
  }
}
