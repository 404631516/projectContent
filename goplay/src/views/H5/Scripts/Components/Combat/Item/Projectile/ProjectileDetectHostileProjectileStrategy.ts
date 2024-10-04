import { RangeType } from '@/helper/enum/Combat';
import BaseProjectile from './BaseProjectile';

export default abstract class ProjectileDetectHostileProjectileStrategy {
  /** 是否擊中投射物
   * @param projectile 投射物
   * @returns 是否擊中
   */
  public abstract detect(projectile: BaseProjectile): BaseProjectile | undefined;
}

/** 偵測前端1/4處，半徑為長度1/8的圓圈範圍 */
export class TopCircleDetectProjectile extends ProjectileDetectHostileProjectileStrategy {
  public detect(projectile: BaseProjectile): BaseProjectile | undefined {
    return projectile.getRangeNearestHostileProjectiles(RangeType.TopCircle);
  }
}

/** 偵測中心圓圈範圍 */
export class CenterCircleDetectProjectile extends ProjectileDetectHostileProjectileStrategy {
  public detect(projectile: BaseProjectile): BaseProjectile | undefined {
    return projectile.getRangeNearestHostileProjectiles(RangeType.CenterCircle);
  }
}

/** 不偵測投射物 */
export class SkipDetectProjectile extends ProjectileDetectHostileProjectileStrategy {
  public detect(projectile: BaseProjectile): BaseProjectile | undefined {
    return;
  }
}
