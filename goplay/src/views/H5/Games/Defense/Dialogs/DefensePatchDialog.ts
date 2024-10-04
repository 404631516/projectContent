import UIDialog from '../../../Scripts/Components/UIDialog';

/** 補丁Dialog, 蓋在角色層上方, 顯示會遮到角色的場景物, 好讓畫面看起來好像有分render順序 */
export default class DefensePatchDialog extends UIDialog {
  public setBG(mapId: number): void {
    // 更換塔防背景地圖資料
    this.changeBackground('patch_' + mapId);
  }
  protected setUI(): void {
    /** */
  }
}
