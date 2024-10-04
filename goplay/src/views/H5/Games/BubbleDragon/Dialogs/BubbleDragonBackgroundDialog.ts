import UIDialog from '../../../Scripts/Components/UIDialog';
import { BubbleDragonString } from '../Data/BubbleDragonConfig';

export default class BubbleDragonBackgroundDialog extends UIDialog {
  protected setUI() {
    // 新增新的背景物件
    this.addImage(BubbleDragonString.Background, this.width * 0.5, this.height * 0.5);
  }

  update(delta: number) {
    // 抓滑鼠位置
    const x = -this.scene.input.x / 10;
    // 背景位置-滑鼠位置,避免單次移動量過大
    if (Math.abs(this.x - x) > 1) {
      this.x += delta * (this.x - x) > 0 ? -1 : 1;
    } else {
      this.x = x;
    }
  }
}
