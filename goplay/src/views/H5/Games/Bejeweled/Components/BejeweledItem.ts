import { BejeweledBombData } from '@/manager/TableManager';
import { Scene } from 'phaser';
import { Size } from '../../../Helper/PhaserHelper';
import StoreItem from '../../UIHelper/StoreItem';
import { BejeweledNumber } from '../Data/BejeweledConfig';

export default class BejeweledItem extends StoreItem<BejeweledBombData> {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: BejeweledBombData,
    count: number = 0,
    content: string = ''
  ) {
    super(scene, x, y, size, data, count, content);

    // icon圖示大小
    this.setIconSize(BejeweledNumber.BombSize, BejeweledNumber.BombSize);

    this.setHighlight(false);

    // highlight框大小
    this.setHighlightIconSize(BejeweledNumber.BombSize, BejeweledNumber.BombSize);
  }
}
