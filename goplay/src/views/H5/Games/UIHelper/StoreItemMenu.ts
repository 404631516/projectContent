import HorizontalLayout from '../../Scripts/Components/HorizontalLayout';
import { Align } from '@/views/H5/Helper/MathHelper';
import { Size } from '../../Helper/PhaserHelper';
import UIHelper from '../../Helper/UIHelper';

export default class StoreItemMenu extends HorizontalLayout {
  constructor(parent: Phaser.GameObjects.Container, elementSize?: Size) {
    super(parent);

    // 標準化layout
    this.setAlign(Align.Center);
    this.setSpacing(10);
    this.setPadding(10, 10);
    this.setFill(UIHelper.blackNumber, 10, 0.5);
    this.setFillElement(UIHelper.blackNumber, 0.9);
    this.setElementStroke(UIHelper.whiteNumber, 0.8, 3);

    // 設置內容的大小
    if (elementSize) {
      this.setElementSize(elementSize.width, elementSize.height);
    }

    // 重算容器範圍及背景，排列容器內元件
    this.draw();
  }
}
