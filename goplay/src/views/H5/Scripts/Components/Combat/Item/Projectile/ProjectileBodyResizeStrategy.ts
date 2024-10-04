import { BodyType } from '@/helper/enum/Combat';
import BaseProjectile from './BaseProjectile';

/** 投射物body調整Strategy */
export default abstract class ProjectileBodyResizeStrategy {
  /** 調整投射物物理body
   * @param projectile 投射物
   */
  public abstract resize(projectile: BaseProjectile): void;
}

/** 水平箭矢長方形body */
export class ArrowBodyResize extends ProjectileBodyResizeStrategy {
  public resize(projectile: BaseProjectile): void {
    projectile.resizeBody(BodyType.Arrow);
  }
}

/** 魔法彈方形範圍body */
export class BoltBodyResize extends ProjectileBodyResizeStrategy {
  public resize(projectile: BaseProjectile): void {
    projectile.resizeBody(BodyType.Bolt);
  }
}

/** 不調整body */
export class SkipBodyResize extends ProjectileBodyResizeStrategy {
  public resize(projectile: BaseProjectile): void {
    projectile.resizeBody(BodyType.None);
    return;
  }
}
