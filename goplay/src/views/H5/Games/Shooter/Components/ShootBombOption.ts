import { Scene } from 'phaser';
import { ShootBombData } from '@/manager/TableManager';
import { Size } from '../../../Helper/PhaserHelper';
import ShooterGameScene from '../Scenes/ShooterGameScene';
import StoreItem from '../../UIHelper/StoreItem';

export default class ShootBombOption extends StoreItem<ShootBombData> {
  /** 遊戲場景 */
  public declare scene: ShooterGameScene;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: ShootBombData,
    count: number = 0,
    content: string = ''
  ) {
    super(scene, x, y, size, data, count, content);
    // 設置炸彈icon
    this.setIconSize(50, 50);
    // 設置highLight圖片
    this.setHighlightIconSize(70, 70);
  }
}
