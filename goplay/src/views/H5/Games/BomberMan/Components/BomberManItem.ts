import { BomberManItemData } from '@/manager/TableManager';

/** 炸彈超人-道具(物理) */
export default class BomberManItem extends Phaser.Physics.Arcade.Sprite {
  /** 道具靜態表 */
  public itemTableData!: BomberManItemData;
}
