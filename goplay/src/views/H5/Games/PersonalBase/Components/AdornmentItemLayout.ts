import { Align } from '@/views/H5/Helper/MathHelper';
import HorizontalLayout from '@/views/H5/Scripts/Components/HorizontalLayout';
import { AdornmentNumber } from '../Data/AdornmentConfig';

export default class AdornmentItemLayout extends HorizontalLayout {
    constructor(parent: Phaser.GameObjects.Container) {
        super(parent);

        // 標準化layout
        this.setAlign(Align.LeftCenter);
        this.setSpacing(14);
        this.setPadding(10, 10);

        // 設置內容的大小
        this.setElementSize(AdornmentNumber.itemCellWidth, AdornmentNumber.itemCellHeight);

        // 重算容器範圍及背景，排列容器內元件
        this.draw();
    }
}
