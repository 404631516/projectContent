import { SpaceInvadersNumber, SpaceInvadersString } from '../Data/SpaceInvadersConfig';
import { SpaceInvadersGroupManager } from './Manager/SpaceInvadersGroupManager';
import { SpaceInvadersPlayerBullet } from './Bullets/SpaceInvadersPlayerBullet';
import { SpaceInvadersAnimDestroy } from './AnimObjects/SpaceInvadersAnimDestroy';
import { AnimationType } from './Manager/SpaceInvadersAnimationFactory';
import { SpaceInvadersPlayerBulletCircle } from './Bullets/SpaceInvadersPlayerBulletCircle';
import SpaceInvadersGameScene from '../Scenes/SpaceInvadersGameScene';

export class SpaceInvadersShip extends Phaser.Physics.Arcade.Sprite {
  /** 玩家子彈發射時間 */
  private bulletTime: number = 0;
  /** 畫面中心的座標位置X軸 */
  private sceneCenterX: number = this.scene.game.canvas.width / 2;
  /** 是否無敵 */
  private isInvincible: boolean = false;
  /** 無敵時間 */
  private invincibleTime: number = 0;
  /** 無敵防護罩圖片 */
  private invincibleShield: Phaser.GameObjects.Image;

  constructor(private gameScene: SpaceInvadersGameScene, private groupManager: SpaceInvadersGroupManager) {
    super(gameScene, 0, 0, SpaceInvadersString.Ship);
    gameScene.add.existing(this);
    gameScene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.enterScene();
    // 無敵防護罩
    this.invincibleShield = this.scene.add.image(0, 0, SpaceInvadersString.ShipShield);
    this.invincibleShield.setVisible(false);
    this.invincibleShield.setScale(1.4);
  }

  public onUpdate(currentTime: number, delta: number): void {
    if (currentTime > this.bulletTime) {
      const bullet: SpaceInvadersPlayerBullet = this.groupManager.playerBullets.get();
      if (bullet) {
        bullet.shoot(this.x, this.y - 18);
        this.bulletTime = currentTime + this.gameScene.gameSetting.normalAttackInterval;
      }
    }

    if (this.isInvincible) {
      // 更新無敵盾牌的位置, 為了讓無敵盾牌跟著飛船移動, 這裡需要計算飛船的速度, 否則會慢一幀
      this.invincibleShield.setPosition(
        this.x + ((this.body?.velocity.x ?? 0) * delta) / 1000,
        this.y + ((this.body?.velocity.y ?? 0) * delta) / 1000,
      );
      // 檢查無敵時間是否到期
      if (currentTime > this.invincibleTime) {
        this.isInvincible = false;
        this.invincibleShield.setVisible(false);
      }
    }
  }

  /** 從畫面外進場, 從下面以tween移動到場中央 */
  private enterScene(): void {
    // 畫面外進場位置
    const enterPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.sceneCenterX, 380);
    // 遊戲位置
    const formationPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
      this.sceneCenterX,
      this.gameScene.gameSetting.playerStartPositionY,
    );
    // 設定進場位置
    this.setPosition(enterPosition.x, enterPosition.y);
    // 進場動畫
    this.scene.tweens.add({
      targets: this,
      ease: Phaser.Math.Easing.Quadratic.Out,
      duration: 2000,
      x: formationPosition.x,
      y: formationPosition.y,
      paused: false,
    });
  }

  /**
   * 玩家射擊圓形子彈
   */
  public shootBulletCircle(): void {
    // 生成子彈
    const bullet = this.groupManager.playerBulletCircles.get() as SpaceInvadersPlayerBulletCircle;
    if (bullet) {
      bullet.shoot(this.x, this.y);
    }
  }

  /** 設定無敵
   * @param currentTime 當前遊戲時間
   * @param seconds 無敵時間(秒)
   */
  public setInvincible(currentTime: number, seconds: number): void {
    this.isInvincible = true;
    this.invincibleShield.setVisible(true);
    const newInvincibleTime = currentTime + seconds * 1000;
    if (newInvincibleTime > this.invincibleTime) {
      this.invincibleTime = newInvincibleTime;
    }
  }

  /** 受擊
   * @returns 是否受傷
   */
  public onHit(currentTime: number): boolean {
    if (this.isInvincible) {
      // 無敵受擊音效
      this.scene.sound.play(SpaceInvadersString.AudioPlayerOnHitInvincible);
      return false;
    }
    // 爆炸特效
    const explosion: SpaceInvadersAnimDestroy = this.groupManager.animDestroy.get();
    explosion.setActive(true);
    explosion.setPosition(this.x, this.y);
    explosion.play(AnimationType.DestroyExplode);
    explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      explosion.setActive(false);
    });
    // 播放音效
    this.scene.sound.play(SpaceInvadersString.AudioPlayerHurt);
    // 無敵時間
    this.setInvincible(currentTime, this.gameScene.gameSetting.invincibleTimeOnHit);

    return true;
  }
}
