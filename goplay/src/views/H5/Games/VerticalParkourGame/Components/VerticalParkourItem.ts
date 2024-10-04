import { Scene } from 'phaser';
import { Size } from '../../../Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';
import { VerticalParkourItemData } from '@/manager/TableManager';

export default class VerticalParkourItem extends StoreItem<VerticalParkourItemData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: VerticalParkourItemData,
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
