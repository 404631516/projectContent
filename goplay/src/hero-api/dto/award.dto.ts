/**
 * 派獎類型, 與 mssr server 的 ContestRewardItemTypeEnum 相同
 * mssr內部"reward"跟"award"使用混亂, hero-api裡統一使用"award"
 * 但在 mssr server 中, 此 enum 名為"ContestRewardItemTypeEnum"
 */
export enum ContestAwardItemTypeEnum {
  /** 空值 */
  None = 'none',
  /** 星球大戰金幣. */
  PlanetWarGoldCoin = 'planetWarGoldCoin',
  /** 星球大戰生物兵器. */
  PlanetWarWeapon = 'planetWarWeapon',
  /** 星球大戰水晶. */
  PlanetWarCrystalCoin = 'planetWarCrystalCoin',
  /** 逆塔防道具 */
  PlanetAntiTDItem = 'planetAntiTDItem',
  /** 花幣(激勵平台貨幣) */
  FarmCoin = 'farmCoin',
  /** 裝飾物道具. */
  AdornmentItem = 'adornmentItem',
  /** 禮包. */
  GiftPack = 'giftPack',
}

/** 獎勵物品 */
export class Award {
  /** 派獎類型 */
  itemType: ContestAwardItemTypeEnum;

  /** 獎勵物品ID(部分派獎類型無用, 需填0) */
  itemId: number;

  /** 派獎物品數量 */
  count: number;

  constructor(itemType: ContestAwardItemTypeEnum, itemId: number, count: number) {
    this.itemType = itemType;
    this.itemId = itemId;
    this.count = count;
  }
}

/** 派發來源代碼 */
export enum DeliveryCodeType {
  /** 0.系統信領獎 */
  Mail = 0,
  /** 1.任務領獎 */
  Quest = 1,
  /** 2.賽事排行領獎*/
  ContestRank = 2,
  /** 3.問卷獎勵 */
  FormsReward = 3,
  /** 4.賽事挑戰獎勵 */
  ContestGame = 4,
  /** 5.自學闖關 */
  LearningStage = 5,
  /** 6.星球大戰 */
  PlanetWar = 6,
  /** 7.因雄宇宙任務 */
  HeroUniverseTask = 7,
}
