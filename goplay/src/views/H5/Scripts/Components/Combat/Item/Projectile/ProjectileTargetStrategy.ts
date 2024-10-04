import { HeroData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BaseProjectile from './BaseProjectile';

/** 投射物確認目標Strategy */
export default abstract class ProjectileTargetStrategy {
  /** 確認目標
   * @param projectile 投射物
   * * @param detectTarget 要確認的目標
   * @returns 目標或undefined
   */
  public abstract target(projectile: BaseProjectile, detectTarget: BattleUnit<HeroData>): Array<BattleUnit<HeroData>>;
}

/** 真接攻擊偵測到的戰鬥單位 */
export class DirectTarget extends ProjectileTargetStrategy {
  public target(projectile: BaseProjectile, detectTarget: BattleUnit<HeroData>): Array<BattleUnit<HeroData>> {
    return [detectTarget];
  }
}

/** 如果偵測到的戰鬥單位是目標才進行攻擊 */
export class HomingTarget extends ProjectileTargetStrategy {
  public target(projectile: BaseProjectile, detectTarget: BattleUnit<HeroData>): Array<BattleUnit<HeroData>> {
    // 偵測投射物與目標的距離長短判定是否擊中。
    if (projectile.target && projectile.target.isAlive) {
      return detectTarget === projectile.target ? [projectile.target] : [];
    }

    // 當喪失目標
    projectile.clearTarget();
    return [detectTarget];
  }
}

/** 真接攻擊偵測到的戰鬥單位的整個隊伍 */
export class TeamTarget extends ProjectileTargetStrategy {
  public target(projectile: BaseProjectile, detectTarget: BattleUnit<HeroData>): Array<BattleUnit<HeroData>> {
    return detectTarget.battleTeam.battleUnits;
  }
}
