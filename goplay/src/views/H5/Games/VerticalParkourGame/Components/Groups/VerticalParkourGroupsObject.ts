import Object2D from '@/views/H5/Scripts/Components/Object2D';

export abstract class VerticalParkourGroupsObject extends Object2D {
  /** 物理body */
  declare body: Phaser.Physics.Arcade.Body;
  /** 顯示圖片 */
  protected sprite: Phaser.GameObjects.Sprite;

  public init(speed: number, leftEdge: number, rightEdge: number): void {
    /** */
  }
}
