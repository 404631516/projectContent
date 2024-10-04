import { RangeType } from '@/helper/enum/Combat';
import BaseItem from './BaseItem';
import BaseProjectile from './Projectile/BaseProjectile';

/** 道具偵測敵對投射物Strategy */
export default abstract class ItemDetectHostileProjectileStrategy {
  /** 偵測
   * @param baseItem 道具
   * @returns 範圍內的敵對投射物
   */
  public abstract detect(baseItem: BaseItem): BaseProjectile[];
}

/** 偵測中心圓圈範圍 */
export class CenterCircleDetectProjectile extends ItemDetectHostileProjectileStrategy {
  public detect(baseItem: BaseItem): BaseProjectile[] {
    return baseItem.getRangeHostileProjectiles(RangeType.CenterCircle);
  }
}

/** 不偵測投射物 */
export class SkipDetectProjectile extends ItemDetectHostileProjectileStrategy {
  public detect(baseItem: BaseItem): BaseProjectile[] {
    return [];
  }
}
