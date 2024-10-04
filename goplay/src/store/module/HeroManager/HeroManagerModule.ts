import {
  heroListAPI,
  heroTeamAPI,
  heroFirstChoiceAPI,
  heroEquipAPI,
  heroTotalPointAPI,
  heroListVisitorAPI,
} from '@/api/hero';
import { Message } from '@/helper/class/Common';
import { ResponseState } from '@/helper/enum/Common';
import HeroManager from '@/manager/HeroManager';
import { HeroListData, HeroNet, HeroTeamNet, HeroAntiTDNet } from '@/helper/interface/Hero';
import { ReturnGetters, ActionContext } from '@/types/store';
import { getters } from '@/store';
import { handleAPIError } from '@/helper/fnc/common';
import AntiTDManager from '@/manager/AntiTDManager';

interface HeroManagerState {
  /** 英雄原始資料 */
  heroNetList: HeroNet[];
  /** 使用者所有英雄狀態 */
  heroList: HeroListData[];
  /** 英雄隊伍資料 */
  heroTeam: HeroTeamNet[];
}

const moduleState: HeroManagerState = {
  heroNetList: [],
  heroList: [],
  heroTeam: [],
};

const moduleGetters = {
  /** 取得上場英雄資訊
   * @param state
   * @returns 目前上場的英雄
   */
  onlineHero(state: HeroManagerState): HeroListData | undefined {
    // 尚未有上場英雄
    if (getters.onlineHeroHId < 0) {
      return undefined;
    }

    // 找到上場英雄
    return state.heroList.find((heroData) => {
      return heroData.hid === getters.onlineHeroHId;
    });
  },

  /** 取得上場英雄hid (沒有英雄回-1)
   * @param state
   */
  onlineHeroHId(state: HeroManagerState): number {
    return state.heroTeam.find((hero) => hero.subjectSeat === 1)?.hid ?? -1;
  },

  /** 取得解鎖英雄數量
   * @param state
   * @returns 解鎖英雄數量
   */
  heroCount(state: HeroManagerState): number {
    return state.heroList.filter((hero) => hero.locked === false).length;
  },

  /** 取得解鎖英雄清單
   * @param state
   */
  heroList(state: HeroManagerState): HeroListData[] {
    return state.heroList;
  },

  /** 取得英雄隊伍資料
   * @param state
   */
  heroTeam(state: HeroManagerState): HeroTeamNet[] {
    return state.heroTeam;
  },

  /** 逆塔防隊伍資料
   * @param state
   */
  antiTDHeroTeam(state: HeroManagerState): Array<HeroListData | undefined> {
    return state.heroTeam.map<HeroListData | undefined>((hero) => {
      return state.heroList.find((heroListData) => heroListData.hid === hero.hid);
    });
  },

  /** 取得英雄科目資料 (目前限定為1)
   * @param state
   */
  subjectSeat(state: HeroManagerState): number {
    return state.heroTeam[0].subjectSeat;
  },
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 初始化使用者英雄狀態
   * @param state
   * @param userHeroList 使用者目前有的英雄
   */
  setHeroList(state: HeroManagerState, userHeroList: HeroNet[]) {
    // 取得英雄預設資料
    const heroCardList = HeroManager.getDefaultHeroListData();
    // 結合後端傳來使用者解鎖的英雄資料
    heroCardList.forEach((hero: HeroListData) => {
      const userHeroData = userHeroList.find((heroData) => heroData.heroId === hero.heroId);
      if (userHeroData) {
        hero.hid = userHeroData.hid;
        hero.level = HeroManager.getHeroLevel(userHeroData.totalExp);
        hero.locked = false;
        hero.equipItemIds = userHeroData.equipItemIds;
      }
    });
    state.heroList = heroCardList;
    state.heroNetList = userHeroList;
  },

  /** 更改使用者上場的英雄
   * @param state
   * @param heroTeamList 英雄流水號
   */
  setUserHeroTeam(state: HeroManagerState, heroTeamList: HeroTeamNet[]) {
    state.heroList.forEach((hero: HeroListData) => {
      hero.online = heroTeamList.findIndex((heroTeam) => hero.hid === heroTeam.hid) > -1;
    });
    state.heroTeam = heroTeamList;
  },

  /** 設定新解鎖英雄
   * @param state
   * @param unlockHeroList
   */
  setUnlockHero(state: HeroManagerState, unlockHeroList: HeroNet[]) {
    unlockHeroList.forEach((unlockHero) => {
      const heroData = state.heroList.find((heroListData) => heroListData.heroId === unlockHero.heroId);
      if (heroData) {
        heroData.hid = unlockHero.hid;
        heroData.level = 1;
        heroData.locked = false;
      }
    });
  },
};

const actions = {
  /** 取得目前使用者目前解鎖英雄
   * @param context
   */
  async getHeroList(context: ActionContext<HeroManagerState, Getters>): Promise<number> {
    // API 取得英雄清單
    const response: any = await heroListAPI.fetch({});
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤訊息
      handleAPIError(response.result, response.resMessage);
    }

    // 最新英雄資料
    const heroNetList = response.resList as HeroNet[];

    // 找到英雄獲得經驗
    let expGain = 0;
    context.state.heroNetList.forEach((oldHero) => {
      const newHero = heroNetList.find((heroNet) => oldHero.hid === heroNet.hid);

      if (newHero != null && oldHero.totalExp !== newHero.totalExp) {
        expGain = newHero.totalExp - oldHero.totalExp;
      }
    });

    // 修正錯誤類型的道具資料
    const newHeroNetList = AntiTDManager.fixHeroItemType(heroNetList);

    // 儲存英雄清單
    context.commit('setHeroList', newHeroNetList);

    // 返回獲得經驗
    return expGain;
  },

  /** 取得使用者上場英雄
   * @param context
   */
  async getHeroTeam(context: ActionContext<HeroManagerState, Getters>): Promise<void> {
    // API 取得上場英雄
    const response: any = await heroTeamAPI.fetch({});
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤訊息
      handleAPIError(response.result, response.resMessage);
    }

    // 儲存上場英雄
    context.commit('setUserHeroTeam', response.resList);
  },

  /** 更改目前上場英雄
   * @param context
   * @param payload 英雄流水號
   */
  async onChangeHero(context: ActionContext<HeroManagerState, Getters>, payload: HeroTeamNet): Promise<void> {
    // 編輯後隊伍
    const newTeam = context.getters.antiTDHeroTeam;

    // 如果選擇到逆塔防隊員, 與隊長互換位置
    const memberIndex = context.getters.heroTeam.findIndex((hero) => hero.hid === payload.hid);
    if (memberIndex > -1) {
      newTeam[memberIndex] = newTeam[0];
    }

    // 設定新隊長
    newTeam[0] = context.state.heroList.find((hero) => hero.hid === payload.hid);
    await context.dispatch('onChangeAntiTDHeroTeam', newTeam);
  },

  /** 更換逆塔防隊伍
   * @param context
   * @param payload
   */
  async onChangeAntiTDHeroTeam(
    context: ActionContext<HeroManagerState, Getters>,
    payload: Array<HeroListData | undefined>
  ): Promise<void> {
    // 打包封包
    const data = {
      heroEquipList: payload.map<HeroAntiTDNet>((hero) => {
        return {
          hid: hero?.hid ?? 0,
          equipItemIds: hero?.equipItemIds ?? [],
        };
      }),
    };

    // API 更新英雄隊伍
    const response: any = await heroEquipAPI.put(data);
    if (response.result !== ResponseState.Success) {
      throw Error(response.result);
    }

    // 刷新 列表英雄
    await context.dispatch('getHeroList');
    // 刷新 上場英雄
    await context.dispatch('getHeroTeam');
  },

  /** 首次解鎖英雄
   * @param param0
   * @param payload 英雄卡片的 index
   */
  async onHeroFirstChoice(context: ActionContext<HeroManagerState, Getters>, payload: number): Promise<void> {
    // 組成封包
    const data = { heroIds: [context.state.heroList[payload].heroId] };

    // API 英雄首選
    const response: any = await heroFirstChoiceAPI.post(data);
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤訊息
      handleAPIError(response.result, response.resMessage);
    }

    // 設定解鎖
    context.commit('setUnlockHero', response.resList);
    // 設定上場 (首選英雄自動為上場英雄) 並刷新逆塔防隊伍
    await context.dispatch('getHeroTeam');
  },

  /** 解鎖英雄
   * @param context
   * @param payload
   */
  async onUnlockHero(context: ActionContext<HeroManagerState, Getters>, payload: number): Promise<boolean> {
    // 取得解鎖目標
    const heroData = context.state.heroList[payload];
    const data = { heroIds: [heroData.heroId] };
    try {
      // API 解鎖英雄
      const response: any = await heroListAPI.post(data);
      if (response.result === ResponseState.Success) {
        // 設定英雄解鎖
        context.commit('setUnlockHero', response.resList);
        const heroTeamData: HeroTeamNet = {
          subjectSeat: context.getters.subjectSeat,
          hid: heroData.hid,
        };

        // API 切換剛解鎖的英雄為上場英雄
        context.dispatch('onChangeHero', heroTeamData);
        return true;
      }
    } catch (e) {
      Message.error(`${e}`);
    }

    return false;
  },

  /** 取得使用者總積分
   * @param context
   * @returns 使用者總積分
   */
  async getUserPoint(context: ActionContext<HeroManagerState, Getters>): Promise<number> {
    try {
      // API 取得使用者總積分
      const response: any = await heroTotalPointAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }
      return response.totalPoint;
    } catch (e) {
      Message.error(`${e}`);
      return -1;
    }
  },

  /** 取得拜訪對象的英雄列表
   * @param context
   * @param uid 使用者編號
   * @returns 對象的英雄列表
   */
  async getVisitorHeroList(context: ActionContext<HeroManagerState, Getters>, uid: number): Promise<number[]> {
    const data = {
      uid,
    };

    try {
      // API 取得拜訪對象的英雄列表
      const response: any = await heroListVisitorAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }
      return response.heroIds;
    } catch (e) {
      Message.error(`${e}`);
      return [];
    }
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
