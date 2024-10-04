import { EnemyStateData } from './Game';
import { ContestGameAward } from './Contest';
import { MssrResultDto } from './Common';

/** 星球細節資料 */
export interface PlanetWarLevelDetailResultDto extends MssrResultDto {
  /** 波次資料 */
  enemyWaves: EnemyStateData[];
  /** 英雄等級上限 */
  heroLevelCap: number;
  /** 星球大戰關卡ID */
  learnLid: number;
  /** 星球內容 */
  levelContent: string;
  /** 星球名稱 */
  levelName: string;
  /** 星球地圖ID */
  targetId: number;
  /** 最低分數需求 */
  scoreRequire: number;
}

/** 好友資訊 */
export interface UserFriendInfo {
  /** 星球大戰進度 */
  highLid: number;
  /** 好友名稱 */
  name: string;
  /** 好友ID */
  uid: number;
}

/** 星球清單資料 */
export interface PlanetListInfo {
  /** 是否開放 */
  isOpen: boolean;
  /** 星球大戰關卡ID */
  learnLid: number;
  /** 星球名稱 */
  levelName: string;
  /** 闖關星等紀錄 */
  starCount: number;
  /** 星球圖片 */
  planetBg: string;
  /** 好友進度 */
  userFriends: UserFriendInfo[];
}

/** 星球詳細資料 */
export interface PlanetDetailInfo {
  /** 簡易資料 */
  listInfo: PlanetListInfo;
  /** 細節資料 */
  detailData: PlanetWarLevelDetailResultDto;
}

/** 星球大戰使用者資訊 */
export interface PlanetUserInfoData {
  /** 擁有晶球數量 */
  crystalCoin: number;
  /** 擁有金幣數量 */
  goldCoin: number;
  /** 星球能量 */
  planetPower: number;
  /** 上場生物兵器 */
  queueWeaponIds: number[];
  /** 生物兵器清單 */
  weaponIds: number[];
  /** 道具列表 */
  antiTDItemList: number[];
}

/** 星球簡易資料 */
export interface PlanetData {
  /** 是否開放 */
  isOpen: boolean;
  /** 星球大戰關卡ID */
  learnLid: number;
  /** 星球名稱 */
  levelName: string;
  /** 闖關星等紀錄 */
  starCount: number;
}

// 小關關卡資訊
export interface PointOtherInfo {
  mapId: number; // 地圖id
  levelContent: number; // 關卡說明
  enemies: any[]; // 敵人資訊
}

/** 星球大戰獎勵 */
export interface PlanetReward {
  /** 獎勵晶球 */
  awardCrystal: number;
  /** 獎勵金幣 */
  awardGold: number;
  /** 獎勵生物兵器 */
  awardWeaponIds: number[];
  /** 獎勵道具 */
  awardItemList: ContestGameAward[];
  /** 遊戲得分 */
  score: number;
  /** 星等 */
  starCount: number;
}
