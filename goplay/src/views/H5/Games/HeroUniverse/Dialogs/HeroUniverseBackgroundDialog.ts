import UIDialog from '../../../Scripts/Components/UIDialog';

export default class HeroUniverseBackgroundDialog extends UIDialog {
  protected setUI() {
    /** */
  }

  /** 設定背景圖片 */
  public setBG(key: string): void {
    this.changeBackground(key);
  }
}
