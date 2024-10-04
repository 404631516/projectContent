import BaseGroups from '@/views/H5/Scripts/Components/BaseGroups';
import BaseItem, {
  DeadTeammate,
  Spray,
  SurroundProjectile,
  TeamSlash,
  Aura,
  AuraProjectile,
  AuraSlash,
  EndangerTeammate,
  Projectile,
  Self,
  SelfTeam,
  Slash,
  TargetProjectile,
  DiagonalTargetProjectile,
  ParallelMinion,
  ForwardProjectile,
} from './Item/BaseItem';
import BaseProjectile, {
  Arrow,
  Axe,
  Bolt,
  Boomerang,
  CurveArrow,
  HomingArrow,
  HomingBolt,
  PhysicsArrow,
  PhysicsBolt,
  PhysicsBoomerang,
  Shield,
  Spear,
  TargetHomingBolt,
  TeamArrow,
  TeamBolt,
} from './Item/Projectile/BaseProjectile';
import { CombatString, ItemFunction, MinionFunction, ProjectileFunction } from '@/helper/enum/Combat';
import MapObstacle, { CanNotPassObstacle, OnlyMagicProjectilePassObstacle } from './Component/MapObstacle';
import { OnlyProjectilePassObstacle, OnlyRangedProjectilePassObstacle } from './Component/MapObstacle';
import ItemBaseMinion, { Avatar } from './Item/Minion/ItemBaseMinion';

export default abstract class CombatGroups extends BaseGroups {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  /** 繼承類別自定義，初始化創建群組 */
  public abstract onInit(): void;

  /** 全道具類別 */
  private readonly itemClassTypes: Map<string, typeof BaseItem> = new Map([
    [ItemFunction.Aura, Aura],
    [ItemFunction.Spray, Spray],
    [ItemFunction.AuraSlash, AuraSlash],
    [ItemFunction.AuraProjectile, AuraProjectile],
    [ItemFunction.Slash, Slash],
    [ItemFunction.TeamSlash, TeamSlash],
    [ItemFunction.Projectile, Projectile],
    [ItemFunction.ForwardProjectile, ForwardProjectile],
    [ItemFunction.SurroundProjectile, SurroundProjectile],
    [ItemFunction.ParallelMinion, ParallelMinion],
    [ItemFunction.TargetProjectile, TargetProjectile],
    [ItemFunction.DiagonalTargetProjectile, DiagonalTargetProjectile],
    [ItemFunction.Self, Self],
    [ItemFunction.SelfTeam, SelfTeam],
    [ItemFunction.EndangerTeammate, EndangerTeammate],
    [ItemFunction.DeadTeammate, DeadTeammate],
  ]);

  /** 遠程投射物類別 */
  private readonly rangedProjectileClassTypes: Map<string, typeof BaseProjectile> = new Map([
    [ProjectileFunction.Arrow, Arrow],
    [ProjectileFunction.PhysicsArrow, PhysicsArrow],
    [ProjectileFunction.CurveArrow, CurveArrow],
    [ProjectileFunction.HomingArrow, HomingArrow],
    [ProjectileFunction.TeamArrow, TeamArrow],
    [ProjectileFunction.Boomerang, Boomerang],
    [ProjectileFunction.PhysicsBoomerang, PhysicsBoomerang],
  ]);
  /** 魔法投射物類別 */
  private readonly magicProjectileClassTypes: Map<string, typeof BaseProjectile> = new Map([
    [ProjectileFunction.Bolt, Bolt],
    [ProjectileFunction.PhysicsBolt, PhysicsBolt],
    [ProjectileFunction.HomingBolt, HomingBolt],
    [ProjectileFunction.TargetHomingBolt, TargetHomingBolt],
    [ProjectileFunction.TeamBolt, TeamBolt],
  ]);
  /** 其餘投射物類別 */
  private readonly otherProjectileClassTypes: Map<string, typeof BaseProjectile> = new Map([
    [ProjectileFunction.Axe, Axe],
    [ProjectileFunction.Spear, Spear],
    [ProjectileFunction.Shield, Shield],
  ]);
  /** 全投射物類別 */
  private readonly projectileClassTypes: Map<string, typeof BaseProjectile> = new Map([
    ...this.rangedProjectileClassTypes,
    ...this.magicProjectileClassTypes,
    ...this.otherProjectileClassTypes,
  ]);

  /** 召喚物類別 */
  private readonly minionClassTypes: Map<string, typeof ItemBaseMinion> = new Map([[MinionFunction.Avatar, Avatar]]);

  /** 障礙物類別 */
  private readonly mapObstacles: Map<string, typeof MapObstacle> = new Map([
    [CombatString.TileTypeCanNotPass, CanNotPassObstacle],
    [CombatString.TileTypeOnlyProjectilePass, OnlyProjectilePassObstacle],
    [CombatString.TileTypeOnlyRangedProjectilePass, OnlyRangedProjectilePassObstacle],
    [CombatString.TileTypeOnlyMagicProjectilePass, OnlyMagicProjectilePassObstacle],
  ]);
  /** 障礙物類別Keys */
  public readonly mapObstacleKeys: string[] = [...this.mapObstacles.keys()];

  public init(): void {
    /** 道具物件池 */
    this.itemClassTypes.forEach((itemClassType: typeof BaseItem, nameKey: string) => {
      this.createGroup(nameKey, { classType: itemClassType, runChildUpdate: true });
    });

    /** 投射物物件池 */
    this.projectileClassTypes.forEach((projectileClassType: typeof BaseProjectile, nameKey: string) => {
      this.createPhysicGroup(nameKey, { classType: projectileClassType, runChildUpdate: true, enable: false });
    });

    /** 召喚物物件池 */
    this.minionClassTypes.forEach((minionClassType: typeof ItemBaseMinion, nameKey: string) => {
      this.createGroup(nameKey, { classType: minionClassType, runChildUpdate: true });
    });

    /** 地圖障礙物物件池 */
    this.mapObstacles.forEach((obstacleType: typeof MapObstacle, nameKey: string) => {
      this.createPhysicGroup(nameKey, { classType: obstacleType });
    });

    /** 繼承類別初始化 */
    this.onInit();
  }

  /** 獲取所有道具群組
   * @returns 所有道具群組
   */
  public getItemGroups(): Phaser.GameObjects.Group[] {
    const itemGroups: Phaser.GameObjects.Group[] = [];
    this.itemClassTypes.forEach((value: typeof BaseItem, itemClassType: string) => {
      const itemGroup = this.getGroup(itemClassType);
      if (itemGroup !== undefined) {
        itemGroups.push(itemGroup);
      }
    });
    return itemGroups;
  }

  /** 獲取所有障礙物群組
   * @returns 所有障礙物群組
   */
  public getMapObstacleGroups(): Phaser.Physics.Arcade.Group[] {
    const objectGroups: Phaser.Physics.Arcade.Group[] = [];
    this.mapObstacleKeys.forEach((mapObstacleKey: string) => {
      const objectGroup = this.getGroup(mapObstacleKey) as Phaser.Physics.Arcade.Group;
      if (objectGroup !== undefined) {
        objectGroups.push(objectGroup);
      }
    });
    return objectGroups;
  }

  /** 判斷投射物功能是否為遠程類型
   * @param projectileFunction 投射物功能
   * @returns 是否為遠程類型
   */
  public isRangedProjectile(projectileFunction: string): boolean {
    return this.rangedProjectileClassTypes.has(projectileFunction);
  }

  /** 判斷投射物功能是否為魔法類型
   * @param projectileFunction 投射物功能
   * @returns 是否為魔法類型
   */
  public isMagicProjectile(projectileFunction: string): boolean {
    return this.magicProjectileClassTypes.has(projectileFunction);
  }
}
