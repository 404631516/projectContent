import { Scene } from 'phaser';
import StoreItem from '../../../UIHelper/StoreItem';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import { BomberManItemData } from '@/manager/TableManager';

/** 炸彈超人-道具按鈕 */
export default class BomberItemBtn extends StoreItem<BomberManItemData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: BomberManItemData,
    count: number = 0,
    content: string = ''
  ) {
    super(scene, x, y, size, data, count, content);

    // icon
    this.setIconSize(size.width - 10, size.height - 10);

    // 設置highLight圖片
    this.setHighlightIconSize(size.width + 10, size.height + 10);
  }
}
