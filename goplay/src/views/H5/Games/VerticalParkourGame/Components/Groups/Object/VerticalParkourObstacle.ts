import { VerticalParkourString } from '../../../Data/VerticalParkourConfig';
import { VerticalParkourGroupsObject } from '../VerticalParkourGroupsObject';

export class VerticalParkourObstacle extends VerticalParkourGroupsObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // 設置圖片
    this.sprite = this.addSprite(VerticalParkourString.Obstacle1, 0, 0);
    this.sprite.setOrigin(0.5);
  }

  init(obstacleSpeedY: number, leftEdge: number, rightEdge: number) {
    // 更改圖片
    const spriteKey = Phaser.Math.RND.pick([VerticalParkourString.Obstacle1, VerticalParkourString.Obstacle2]);
    this.sprite.setTexture(spriteKey);
    // 設置物理碰撞範圍
    this.body.setSize(this.sprite.displayWidth, this.sprite.displayHeight);
    this.body.setOffset(-this.sprite.displayWidth / 2, -this.sprite.displayHeight / 2);
    this.setPosition(
      Phaser.Math.Between(leftEdge + this.sprite.displayWidth / 2, rightEdge - this.sprite.displayWidth / 2),
      -this.sprite.displayHeight / 2,
    );
    this.body.setVelocityY(obstacleSpeedY);
    this.setVisible(true);
    this.setActive(true);
  }
}
