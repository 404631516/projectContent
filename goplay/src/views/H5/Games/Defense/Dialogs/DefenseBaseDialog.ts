import UIDialog from '../../../Scripts/Components/UIDialog';

export default class DefenseBaseDialog extends UIDialog {
  public setBG(mapId: number): void {
    // 更換塔防背景地圖資料
    this.changeBackground('bg_' + mapId);
  }
  protected setUI(): void {
    /** */
  }
}
