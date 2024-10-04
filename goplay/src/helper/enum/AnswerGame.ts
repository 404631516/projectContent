import { ContestAwardItemTypeEnum } from '@/hero-api/dto/award.dto';

/** 排行頁面類型 */
export enum ListStatus {
  None = 0,
  /** 排行榜 */
  Ranking = 1,
  /** 答題詳細清單 */
  Detail = 2,
}

/** 轉場狀態 */
export enum TransStatus {
  None = 0,
  /** 開始遊戲 */
  StartGame = 1,
  /** 能量轉換(快閃店)時間到 */
  TimeEnd = 2,
  /** 英雄出場訊息 */
  OutHero = 3,
  /** 觸發續命題 */
  ContinueAnswer = 4,
}

/** 賽事獎勵類型 */
export enum RewardItemKey {
  /** 生物兵器 */
  Weapon = 'planetWarWeapon',
  /** 金幣 */
  PlanetGold = 'planetWarGoldCoin',
  /** 晶球 */
  PlanetCrystal = 'planetWarCrystalCoin',
  /** 逆塔防道具 */
  PlanetAntiTDItem = 'planetAntiTDItem',
  /** 裝飾物 */
  AdornmentItem = 'adornmentItem',
}

/** 將 ContestAwardItemTypeEnum 轉換為 RewardItemKey */
export function mapContestAwardToRewardItemKey(award: ContestAwardItemTypeEnum): RewardItemKey | undefined {
  const mapping: { [key in ContestAwardItemTypeEnum]?: RewardItemKey } = {
    [ContestAwardItemTypeEnum.PlanetWarWeapon]: RewardItemKey.Weapon,
    [ContestAwardItemTypeEnum.PlanetWarGoldCoin]: RewardItemKey.PlanetGold,
    [ContestAwardItemTypeEnum.PlanetWarCrystalCoin]: RewardItemKey.PlanetCrystal,
    [ContestAwardItemTypeEnum.PlanetAntiTDItem]: RewardItemKey.PlanetAntiTDItem,
    [ContestAwardItemTypeEnum.AdornmentItem]: RewardItemKey.AdornmentItem,
  };
  return mapping[award];
}

/** 賽事獎勵類型文字 */
export enum RewardItemKeyName {
  /** 生物兵器 */
  Weapon = '生物兵器',
  /** 金幣 */
  PlanetGold = '金幣',
  /** 晶球 */
  PlanetCrystal = '晶球',
  /** 逆塔防道具 */
  PlanetAntiTDItem = '逆塔防道具',
  /** 裝飾物 */
  AdornmentItem = '裝飾物',
}

/** 背包道具類型 */
export enum ItemType {
  /** 逆塔防道具 */
  PlanetAntiTDItem = 212,
  /** 裝飾物道具 */
  AdornmentItem = 213,
}
