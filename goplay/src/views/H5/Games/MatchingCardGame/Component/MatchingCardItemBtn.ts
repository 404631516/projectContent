import { Scene } from 'phaser';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';
import { MatchingCardItemData } from '@/manager/TableManager';

/** 翻翻牌-道具按鈕 */
export default class MatchingCardItemBtn extends StoreItem<MatchingCardItemData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: MatchingCardItemData,
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
