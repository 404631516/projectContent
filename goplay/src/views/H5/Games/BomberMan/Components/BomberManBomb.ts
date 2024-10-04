/** 炸彈超人-炸彈 */
export default class BomberManBomb extends Phaser.Physics.Arcade.Sprite {
  /** 爆炸次數 (避免連鎖引爆後，await又執行一次引爆) */
  public explosionCount: number = 0;
}
