import { Scene } from 'phaser';
import { TestItemData } from '@/manager/TableManager';
import { Size } from '../../../Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';

export default class TestItem extends StoreItem<TestItemData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: TestItemData,
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
