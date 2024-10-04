import UIDialog from '../../../Scripts/Components/UIDialog';
import { Puzzle2048String } from '../Data/Puzzle2048Config';

export default class Puzzle2048BackgroundDialog extends UIDialog {
  /** 設置背景 */
  protected setUI(): void {
    this.changeBackground(Puzzle2048String.Background);
  }
}
