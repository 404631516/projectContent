import { CombatNumber, RangeType } from '@/helper/enum/Combat';
import { HeroData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BaseItem from './BaseItem';

/** 獲取目標群Strategy */
export default abstract class ItemTargetStrategy {
  /** 獲取目標群
   * @param baseItem 道具
   * @returns 目標群
   */
  public abstract getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>>;
}

/** 圓形範圍內所有敵對目標 */
export class CircleTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    return baseItem.getRangeHostileUnits(RangeType.CenterCircle);
  }
}

/** 圓形範圍內隨機一位敵對目標 */
export class CircleRandomTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    const units = baseItem.getRangeHostileUnits(RangeType.CenterCircle);
    // 隨機挑選一位
    const target = Phaser.Math.RND.pick(units);
    return target ? [target] : [];
  }
}

/** 圓形範圍內隨機挑選等同於投射物數量的敵對目標 */
export class CircleRandomProjectileAmountTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    const units = baseItem.getRangeHostileUnits(RangeType.CenterCircle);
    // 隨機挑選數位
    Phaser.Math.RND.shuffle(units);
    const target = units.slice(0, baseItem.projectileAmount);
    return target;
  }
}

/** 圓形範圍內距離最近敵對目標 */
export class CircleNearestTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    const target = baseItem.getRangeNearestHostileUnit(RangeType.CenterCircle);
    return target ? [target] : [];
  }
}

/** 圓形範圍內距離最近敵對隊伍隊長 */
export class CircleNearestLeaderTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    const target = baseItem.getRangeNearestHostileUnit(RangeType.CenterCircle);
    return target ? [target.battleTeam.leader] : [];
  }
}

/** 前方長方形範圍內所有敵對目標 */
export class HalfRectangleTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    return baseItem.getRangeHostileUnits(RangeType.HalfRectangle);
  }
}

/** 扇形範圍內所有敵人 */
export class FanTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    return baseItem.getWithinRotationRangeHostileUnits(RangeType.CenterCircle, CombatNumber.Rad_90_Degree);
  }
}

/** 扇形範圍內所有敵人隊伍成員 */
export class FanTeamTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    // 扇形範圍內所有敵人
    const targetUnits = baseItem.getWithinRotationRangeHostileUnits(RangeType.CenterCircle, CombatNumber.Rad_90_Degree);

    // 獲取扇形範圍內所有敵人的全部組員，並撇除重複
    const targetTeamUnits: Array<BattleUnit<HeroData>> = [];
    targetUnits.forEach((targetUnit: BattleUnit<HeroData>) => {
      targetUnit.battleTeam.battleUnits.forEach((unit: BattleUnit<HeroData>) => {
        if (targetTeamUnits.includes(unit) === false) {
          targetTeamUnits.push(unit);
        }
      });
    });

    return targetTeamUnits;
  }
}

/** 發動道具的戰鬥單位 */
export class SelfTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    return [baseItem.instigator];
  }
}

/** 發動道具的戰鬥隊伍全體(活著的) */
export class SelfTeamTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    const aliveTeammates = baseItem.instigator.battleTeam.battleUnits.filter(
      (battleUnit: BattleUnit<HeroData>) => battleUnit.isAlive
    );
    return aliveTeammates;
  }
}

/** 鎖定血量最低且活著的隊友 */
export class EndangerTeammateTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    const teammates = baseItem.instigator.battleTeam.battleUnits;

    let endangerTeammate = teammates[0];
    teammates.forEach((battleUnit: BattleUnit<HeroData>) => {
      // 已死亡或滿血跳過
      if (battleUnit.isAlive === false || battleUnit.isFullHp === true) {
        return;
      }
      // 判斷血量是否最低
      if (battleUnit.hp < endangerTeammate.hp) {
        endangerTeammate = battleUnit;
      }
    });

    return [endangerTeammate];
  }
}

/** 鎖定死亡的隊友 */
export class DeadTeammateTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    // 全部隊友
    const teammates = baseItem.instigator.battleTeam.battleUnits;
    // 順序靠前的已死亡隊友
    const deadTeammate = teammates.find((battleUnit: BattleUnit<HeroData>) => battleUnit.isAlive === false);
    return deadTeammate ? [deadTeammate] : [];
  }
}

/** 不鎖定目標 */
export class SkipTarget extends ItemTargetStrategy {
  public getTargets(baseItem: BaseItem): Array<BattleUnit<HeroData>> {
    return [];
  }
}
