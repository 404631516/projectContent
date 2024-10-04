import { Scene } from 'phaser';
import { BubbleDragonItemData } from '@/manager/TableManager';
import { Size } from '../../../Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';

export default class BubbleItem extends StoreItem<BubbleDragonItemData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: BubbleDragonItemData,
    count: number = 0,
    content: string = ''
  ) {
    super(scene, x, y, size, data, count, content);

    // icon
    this.setIconSize(size.width, size.width);

    this.setHighlight(false);

    // highlight框大小
    this.setHighlightIconSize(size.width, size.width);
  }
}
