import BaseProjectile from './BaseProjectile';

/** 投射物偵測存活條件Strategy */
export default abstract class ProjectileDetectSurviveStrategy {
  /** 檢查是否可以存活
   * @param projectile 投射物
   * @return 是否可以存活
   */
  public abstract detect(projectile: BaseProjectile): boolean;
}

/** 界內存活 */
export class InBoundDetectSurvive extends ProjectileDetectSurviveStrategy {
  public detect(projectile: BaseProjectile): boolean {
    return projectile.isInBounds;
  }
}

/** 隨目標存活 */
export class TargetAliveDetectSurvive extends ProjectileDetectSurviveStrategy {
  public detect(projectile: BaseProjectile): boolean {
    return projectile.target ? projectile.target.isAlive : false;
  }
}

/** 回到發動者位置前存活 */
export class BoomerangDetectSurvive extends ProjectileDetectSurviveStrategy {
  public detect(projectile: BaseProjectile): boolean {
    // 投射物尚未返回
    if (projectile.isReturn === false) {
      return true;
    }

    const distanceFromInstigator = Phaser.Math.Distance.Between(
      projectile.x,
      projectile.y,
      projectile.instigator.x,
      projectile.instigator.y
    );

    // 投射物返回且回到發動者位置則返回false
    return distanceFromInstigator > projectile.instigator.displayHeight / 2;
  }
}

/** 不偵測存活條件 */
export class SkipDetectSurvive extends ProjectileDetectSurviveStrategy {
  public detect(projectile: BaseProjectile): boolean {
    return true;
  }
}
