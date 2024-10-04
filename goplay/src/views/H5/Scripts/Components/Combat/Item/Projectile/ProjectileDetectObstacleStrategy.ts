import { RangeType } from '@/helper/enum/Combat';
import MapObstacle from '../../Component/MapObstacle';
import BaseProjectile from './BaseProjectile';

/** 投射物偵測障礙物Strategy */
export default abstract class ProjectileDetectObstacleStrategy {
  /** 是否擊中障礙物
   * @param projectile 投射物
   * @returns 是否擊中
   */
  public abstract detect(projectile: BaseProjectile): MapObstacle | undefined;
}

/** 偵測前端1/4處，半徑為長度1/8的圓圈範圍 */
export class TopCircleDetectObstacle extends ProjectileDetectObstacleStrategy {
  public detect(projectile: BaseProjectile): MapObstacle | undefined {
    return projectile.getRangeObstacle(RangeType.TopCircle);
  }
}

/** 偵測中心圓圈範圍 */
export class CenterCircleDetectObstacle extends ProjectileDetectObstacleStrategy {
  public detect(projectile: BaseProjectile): MapObstacle | undefined {
    return projectile.getRangeObstacle(RangeType.CenterCircle);
  }
}

/** 不偵測障礙物 */
export class SkipDetectObstacle extends ProjectileDetectObstacleStrategy {
  public detect(projectile: BaseProjectile): MapObstacle | undefined {
    return undefined;
  }
}
