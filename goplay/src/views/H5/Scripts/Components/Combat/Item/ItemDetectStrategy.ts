import { CombatNumber, RangeType } from '@/helper/enum/Combat';
import { HeroData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BaseItem from './BaseItem';

/** 道具偵測敵人Strategy */
export default abstract class ItemDetectStrategy {
  /** 偵測
   * @param baseItem 道具
   * @returns 範圍內是否有敵人
   */
  public abstract detect(baseItem: BaseItem): boolean;
}

/** 跳過偵測階段直接發動 */
export class SkipDetect extends ItemDetectStrategy {
  public detect(): boolean {
    return true;
  }
}

/** 若圓形範圍內有敵人，則發動 */
export class CircleDetect extends ItemDetectStrategy {
  public detect(baseItem: BaseItem): boolean {
    return baseItem.getRangeHostileUnits(RangeType.CenterCircle).length > 0;
  }
}

/** 若扇形範圍內有敵人，則發動 */
export class FanDetect extends ItemDetectStrategy {
  public detect(baseItem: BaseItem): boolean {
    const units = baseItem.getRangeHostileUnits(RangeType.CenterCircle);

    const triggerTarget = units.find((unit: BattleUnit<HeroData>) => {
      const includedRotation = baseItem.getBattleUnitIncludedRotation(unit);

      // 夾角小於90度，返回目標
      return Math.abs(includedRotation) < CombatNumber.Rad_90_Degree;
    });

    return triggerTarget !== undefined;
  }
}
