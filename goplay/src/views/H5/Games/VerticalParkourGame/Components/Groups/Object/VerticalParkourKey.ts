import { VerticalParkourString } from '../../../Data/VerticalParkourConfig';
import { VerticalParkourGroupsObject } from '../VerticalParkourGroupsObject';

export class VerticalParkourKey extends VerticalParkourGroupsObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // 設置圖片
    this.sprite = this.addSprite(VerticalParkourString.Key, 0, 0);
    this.sprite.setOrigin(0.5);
    this.sprite.setDepth(1);
  }

  public init(speed: number, leftEdge: number, rightEdge: number) {
    // 設置物理碰撞範圍
    this.body.setSize(this.sprite.displayWidth, this.sprite.displayHeight);
    this.body.setOffset(-this.sprite.displayWidth / 2, -this.sprite.displayHeight / 2);
    this.setPosition(
      Phaser.Math.Between(leftEdge + this.sprite.displayWidth / 2, rightEdge - this.sprite.displayWidth / 2),
      0,
    );
    this.body.setVelocityX(0);
    this.body.setVelocityY(speed);
    this.setVisible(true);
    this.setActive(true);
  }
}
