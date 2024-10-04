import { CombatNumber } from '@/helper/enum/Combat';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { ICombatScene } from '@/views/H5/Scripts/Components/Combat/Combat';
import Object2D from '@/views/H5/Scripts/Components/Object2D';

/** 逆塔防地圖障礙物 */
export default abstract class MapObstacle extends Object2D {
  /** 戰鬥遊戲場景 */
  public declare scene: Phaser.Scene & ICombatScene;

  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** 特效圖片 */
  protected effectTweenSpriteGroup: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, x?: number | undefined, y?: number | undefined) {
    super(scene, x, y);
    // 設置尺寸符合Tile大小
    this.setSize(CombatNumber.TileSize, CombatNumber.TileSize);

    // 設置表演圖片群組
    this.effectTweenSpriteGroup = this.scene.add.group({
      classType: Phaser.GameObjects.Sprite,
      createCallback: (gameobject: Phaser.GameObjects.GameObject) => {
        const sprite = gameobject as Phaser.GameObjects.Sprite;
        // 設置深度
        sprite.setDepth(this.scene.worldTopEdgeY);
        // 初始為關閉狀態
        sprite.setVisible(false);
        sprite.setActive(false);
      },
    });
  }

  /** 播放投射物碰撞障礙物特效
   * @param projectileX 投射物位置x
   * @param projectileY 投射物位置y
   * @param onHitEffectIdList 擊中特效Id清單
   */
  public playHitByProjectileEffectTween(projectileX: number, projectileY: number, onHitEffectIdList: number[]): void {
    onHitEffectIdList.forEach((onHitEffectId: number) =>
      this.playTween(projectileX + this.x, projectileY + this.y, onHitEffectId)
    );
  }

  /** 播放特效
   * @param x 世界位置X
   * @param y 世界位置Y
   * @param effectId 特效Id
   */
  private playTween(x: number, y: number, effectId: number): void {
    // 獲取特效資料
    const effectData = this.scene.combatComponent.getEffectData(effectId);
    if (effectData === undefined) {
      return;
    }
    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    if (effectSprite === null) {
      return;
    }
    // 設置特效Tween
    effectSprite.setTexture(effectData.nameKey);
    effectSprite.setPosition(x / 2, y / 2);
    AnimationHelper.setTweenFromEffectData(effectSprite, effectData, false);
  }

  /** 投射物是否可通過
   * @param projectileFunction 投射物類型
   */
  public abstract isPass(projectileFunction: string): boolean;
}

/** 所有投射物都不能通過 */
export class CanNotPassObstacle extends MapObstacle {
  public isPass(projectileFunction: string): boolean {
    return false;
  }
}

/** 所有投射物都可以通過 */
export class OnlyProjectilePassObstacle extends MapObstacle {
  public isPass(projectileFunction: string): boolean {
    return true;
  }
}

/** 只有遠程投射物都可以通過 */
export class OnlyRangedProjectilePassObstacle extends MapObstacle {
  public isPass(projectileFunction: string): boolean {
    return this.scene.combatGroups.isRangedProjectile(projectileFunction);
  }
}

/** 只有魔法投射物都可以通過 */
export class OnlyMagicProjectilePassObstacle extends MapObstacle {
  public isPass(projectileFunction: string): boolean {
    return this.scene.combatGroups.isMagicProjectile(projectileFunction);
  }
}
