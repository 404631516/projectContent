import { RangeType } from '@/helper/enum/Combat';
import { HeroData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BaseProjectile from './BaseProjectile';

/** 投射物偵測目標Strategy */
export default abstract class ProjectileDetectTargetStrategy {
  /** 偵測目標
   * @param projectile 投射物
   * @returns 目標或undefined
   */
  public abstract detect(projectile: BaseProjectile): BattleUnit<HeroData> | undefined;
}

/** 偵測前端1/4處，半徑為長度1/8的圓圈範圍 */
export class TopCircleDetectTarget extends ProjectileDetectTargetStrategy {
  public detect(projectile: BaseProjectile): BattleUnit<HeroData> | undefined {
    return projectile.getRangeNearestHostileUnit(RangeType.TopCircle);
  }
}

/** 偵測中心圓圈範圍 */
export class CenterCircleDetectTarget extends ProjectileDetectTargetStrategy {
  public detect(projectile: BaseProjectile): BattleUnit<HeroData> | undefined {
    return projectile.getRangeNearestHostileUnit(RangeType.CenterCircle);
  }
}

/** 偵測前端1/4處，半徑為長度1/8的圓圈 + 前端2/4處，半徑為長度1/8的圓圈組合而成的長方形範圍 */
export class HalfRectangleDetectTarget extends ProjectileDetectTargetStrategy {
  public detect(projectile: BaseProjectile): BattleUnit<HeroData> | undefined {
    return projectile.getRangeNearestHostileUnit(RangeType.HalfRectangle);
  }
}

/** 不偵測目標 */
export class SkipDetectTarget extends ProjectileDetectTargetStrategy {
  public detect(projectile: BaseProjectile): BattleUnit<HeroData> | undefined {
    return undefined;
  }
}
