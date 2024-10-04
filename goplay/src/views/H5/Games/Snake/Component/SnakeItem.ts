import { Scene } from 'phaser';
import { SnakeItemData } from '@/manager/TableManager';
import { Size } from '../../../Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';

export default class SnakeItem extends StoreItem<SnakeItemData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: SnakeItemData,
    count: number = 0,
    content: string = '',
  ) {
    super(scene, x, y, size, data, count, content);

    // icon
    this.setIconSize(size.width - 10, size.height - 10);

    // 設置highLight圖片
    this.setHighlightIconSize(size.width + 10, size.height + 10);
  }
}
