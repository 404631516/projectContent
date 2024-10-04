import UIDialog from '../../../Scripts/Components/UIDialog';
import { ShootString } from '../Data/ShooterConfig';

export default class ShootBackgroundDialog extends UIDialog {
  protected setUI() {
    this.changeBackground(ShootString.Background);
  }
}
