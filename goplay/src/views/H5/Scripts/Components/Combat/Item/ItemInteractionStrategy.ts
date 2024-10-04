import { HeroData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BaseItem from './BaseItem';

/** 與目標互動Strategy */
export default abstract class ItemInteractionStrategy {
  /** 與目標互動
   * @param baseItem 道具
   * @param battleUnits 目標群
   */
  public abstract interact(baseItem: BaseItem, battleUnits: Array<BattleUnit<HeroData>>): void;
}

/** 直接與目標互動 */
export class DirectInteraction extends ItemInteractionStrategy {
  public interact(baseItem: BaseItem, battleUnits: Array<BattleUnit<HeroData>>): void {
    baseItem.interactTargets(battleUnits);
  }
}

/** 發出投射物，讓投射物與目標互動 */
export class ProjectileInteraction extends ItemInteractionStrategy {
  public interact(baseItem: BaseItem, battleUnits: Array<BattleUnit<HeroData>>): void {
    // 對所有目標發射投射物
    baseItem.spawnProjectilesByTargets(battleUnits);
  }
}

/** 直接在目標位置生成投射物(必中)，若沒有目標則隨機在地圖上播放擊中特效 */
export class TargetProjectileInteraction extends ItemInteractionStrategy {
  public interact(baseItem: BaseItem, battleUnits: Array<BattleUnit<HeroData>>): void {
    baseItem.spawnProjectilesAtTargets(battleUnits);
  }
}

/** 直接在目標位置左上角螢幕外生成投射物並追蹤，若沒有目標則隨機在地圖左上角螢幕外生成投射物 */
export class DiagonalTargetProjectileInteraction extends ItemInteractionStrategy {
  public interact(baseItem: BaseItem, battleUnits: Array<BattleUnit<HeroData>>): void {
    baseItem.spawnDiagonalProjectilesAtTargets(battleUnits);
  }
}

/** 與目標互動並發出投射物環繞在目標周遭 */
export class SurroundProjectileInteraction extends ItemInteractionStrategy {
  public interact(baseItem: BaseItem, battleUnits: Array<BattleUnit<HeroData>>): void {
    baseItem.interactTargets(battleUnits);
    baseItem.spawnSurroundProjectilesByTargets(battleUnits);
  }
}

/** 與目標互動並生成召喚物並列左右 */
export class ParallelMinionInteraction extends ItemInteractionStrategy {
  public interact(baseItem: BaseItem, battleUnits: Array<BattleUnit<HeroData>>): void {
    baseItem.interactTargets(battleUnits);
    baseItem.spawnParallelMinionByTargets(battleUnits);
  }
}
