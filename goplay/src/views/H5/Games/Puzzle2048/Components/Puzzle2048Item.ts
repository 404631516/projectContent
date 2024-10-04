import { Scene } from 'phaser';
import { Size } from '../../../Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';
import { Puzzle2048ItemData } from '@/manager/TableManager';

export default class Puzzle2048Item extends StoreItem<Puzzle2048ItemData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: Puzzle2048ItemData,
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
