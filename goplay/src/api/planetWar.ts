import { PlanetWarLevelDetailResultDto } from '@/helper/interface/PlanetWar';
import { fetch, post, put } from './http-server';

/** 星球大戰 用戶資訊 */
export const planetWarUserInfoAPI = {
  /** 取得 用戶資訊 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/planetWarUserInfo', paramObj);
  },
};

/** 星球大戰 生物兵器 */
export const planetWarUnlockWeaponAPI = {
  /** 購買解鎖生物武器 */
  post: (paramObj: {} | undefined) => {
    return post('/planetWarUnlockWeapon', paramObj);
  },
  /** 配置生物武器列隊 */
  put: (paramObj: {} | undefined) => {
    return put(`/planetWarUnlockWeapon?queueWeaponIds=${paramObj}`);
  },
};

/** 星球大戰 戰鬥 */
export const planetWarBattleAPI = {
  /** 戰鬥開始 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/planetWarBattle', paramObj, true) as Promise<{
      learnLogId: number;
      planetPower: number;
    }>;
  },
  /** 戰鬥結束 */
  post: (paramObj: {} | undefined) => {
    return post('/planetWarBattle', paramObj, true);
  },
};

/** 星球大戰 小關資訊 */
export const planetWarLevelAPI = {
  /** 取得小關列表 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/planetWarLevel', paramObj);
  },
  /** 取得小關詳細資訊 */
  getLevelDetail: (paramObj: {} | undefined): Promise<PlanetWarLevelDetailResultDto> => {
    return post('/planetWarLevel', paramObj) as Promise<PlanetWarLevelDetailResultDto>;
  },
};

/** 因材網幣交易 */
export const planetWarAdleduTradeAPI = {
  /**  取得代幣數量跟兌換晶球比率 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/planetWarAdleduTrade', paramObj);
  },
  /** 代幣兌換晶球 */
  post: (paramObj: {} | undefined) => {
    return post('/planetWarAdleduTrade', paramObj, true);
  },
};

/** 星球大戰 同學進度 取代 PlanetWarClassmateProgress */
export const learningClassmateProgressAPI = {
  /** 取得 此大關 同學的小關進度 */
  fetch: (paramObj: {} | undefined) => {
    return fetch('/learningClassmateProgress', paramObj);
  },
};

/** 星球大戰 逆塔防英雄道具裝備 */
export const planetWarUnlockHeroItemAPI = {
  /** 購買解鎖道具 */
  post: (options: {} | undefined) => {
    return post('/planetWarUnlockHeroItem', options, true);
  },
};
