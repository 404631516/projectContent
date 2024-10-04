import UIDialog from '../../../Scripts/Components/UIDialog';
import { SnakeString } from '../Data/SnakeConfig';

export default class SnakeBackgroundDialog extends UIDialog {
  protected setUI() {
    this.changeBackground(SnakeString.Background);
  }
}
