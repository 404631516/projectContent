import { SpaceInvadersPlayerBullet } from '../Bullets/SpaceInvadersPlayerBullet';
import { SpaceInvadersEnemyBullet } from '../Bullets/SpaceInvadersEnemyBullet';
import { SpaceInvadersAnimDestroy } from '../AnimObjects/SpaceInvadersAnimDestroy';
import { SpaceInvadersAnimCircle } from '../AnimObjects/SpaceInvadersAnimCircle';
import { SpaceInvadersAnimFullScreen } from '../AnimObjects/SpaceInvadersAnimFullScreen';
import { SpaceInvadersPlayerBulletCircle } from '../Bullets/SpaceInvadersPlayerBulletCircle';
import { SpaceInvadersAnimLine } from '../AnimObjects/SpaceInvadersAnimLine';
import { SpaceInvadersAnimSlowDownEnemies } from '../AnimObjects/SpaceInvadersAnimSlowDownEnemies';

export class SpaceInvadersGroupManager {
  public playerBullets: Phaser.Physics.Arcade.Group;
  public playerBulletCircles: Phaser.Physics.Arcade.Group;
  public enemyBullets: Phaser.Physics.Arcade.Group;
  public animDestroy: Phaser.Physics.Arcade.Group;
  public animLine: Phaser.Physics.Arcade.Group;
  public animCircle: Phaser.Physics.Arcade.Group;
  public animFullScreen: Phaser.Physics.Arcade.Group;
  public animSlowDownEnemies: Phaser.Physics.Arcade.Group;

  constructor(private _scene: Phaser.Scene) {
    this.playerBullets = this._createGroup(SpaceInvadersPlayerBullet);
    this.playerBulletCircles = this._createGroup(SpaceInvadersPlayerBulletCircle);
    this.enemyBullets = this._createGroup(SpaceInvadersEnemyBullet);
    this.animDestroy = this._createGroup(SpaceInvadersAnimDestroy);
    this.animLine = this._createGroup(SpaceInvadersAnimLine);
    this.animCircle = this._createGroup(SpaceInvadersAnimCircle);
    this.animFullScreen = this._createGroup(SpaceInvadersAnimFullScreen);
    this.animSlowDownEnemies = this._createGroup(SpaceInvadersAnimSlowDownEnemies);
  }

  /** 創建group的通用方法 */
  private _createGroup(classType: typeof Phaser.Physics.Arcade.Sprite): Phaser.Physics.Arcade.Group {
    return this._scene.physics.add.group({
      max: 0,
      classType,
      runChildUpdate: true,
    });
  }

  /**
   * 清除指定的敵人子彈
   * @param shouldDestroy 判斷是否要清除的條件
   */
  public clearRangeEnemyBullets(shouldDestroy: (bullet: SpaceInvadersEnemyBullet) => boolean): void {
    this.enemyBullets.getChildren().forEach((gameObject) => {
      const bullet = gameObject as SpaceInvadersEnemyBullet;
      if (shouldDestroy(bullet)) {
        bullet.kill();
      }
    });
  }
}
