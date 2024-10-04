export abstract class BaseSpaceInvadersBullet extends Phaser.Physics.Arcade.Sprite {
  /** 世界範圍 */
  private worldBounds: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    // 取得世界範圍
    this.worldBounds = this.scene.physics.world.bounds;
  }

  update(): void {
    // 所在位置超出世界範圍時，自動kill
    if (
      this.y <= this.worldBounds.top ||
      this.y >= this.worldBounds.bottom ||
      this.x <= this.worldBounds.left ||
      this.x >= this.worldBounds.right
    ) {
      this.kill();
    }
  }

  /** 摧毀 */
  public kill() {
    this.destroy();
  }
}
