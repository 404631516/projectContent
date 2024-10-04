import { planetWarUserInfoAPI } from '@/api/planetWar';
import { Message } from '@/helper/class/Common';
import { PlanetWarType, ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { PlanetUserInfoData } from '@/helper/interface/PlanetWar';
import { ActionContext, ReturnGetters } from '@/types/store';
import { PlanetWarGameResult, TowerDefenseGameData, AntiTDGameData } from '@/helper/interface/Game';
import { BaseGameStrategy, PlanetDefenseGame, PlanetAntiTDGame } from '@/views/H5/Games/Common/PhaserGameStrategy';

interface PlanetWarState {
  /**使用者晶球數 */
  crystalCoin: number;
  /**使用者金幣數 */
  goldCoin: number;
  /** 星球大戰關卡ID */
  learnLid: number;
  /** 星球大戰紀錄ID */
  learnLogId: number;
  /** 星球大戰類別 */
  planetWarType: PlanetWarType;
  /** 星球大戰結果 */
  planetWarResult?: PlanetWarGameResult;
  /** 塔防遊戲設定 */
  defenseGameData?: TowerDefenseGameData;
  /** 逆塔防遊戲設定 */
  antiTDGameData?: AntiTDGameData;
}

const moduleState: PlanetWarState = {
  learnLid: -1,
  learnLogId: -1,
  planetWarType: PlanetWarType.Outter,
  crystalCoin: 0,
  goldCoin: 0,
};

const moduleGetters = {};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /**
   * 更新使用者 coin
   * @param state
   * @param crystalCoin
   * @param goldCoin
   */
  updateUserCoin(state: PlanetWarState, coin: { crystalCoin: number; goldCoin: number }) {
    state.crystalCoin = coin.crystalCoin;
    state.goldCoin = coin.goldCoin;
  },

  /**
   * 設定星球大戰使用者值
   * @param state
   * @param planetWarUserInfo
   */
  setPlanetWarUserInfo(state: PlanetWarState, planetWarUserInfo: PlanetUserInfoData) {
    state.crystalCoin = planetWarUserInfo.crystalCoin;
    state.goldCoin = planetWarUserInfo.goldCoin;
  },

  /** 設定星球大戰關卡ID
   * @param state
   * @param learnLid
   */
  setPlanetWarLearnLid(state: PlanetWarState, learnLid: number) {
    state.learnLid = learnLid;
  },

  /** 設定星球大戰紀錄ID
   * @param state
   * @param learnLid
   */
  setPlanetWarLearnLogId(state: PlanetWarState, learnLogId: number) {
    state.learnLogId = learnLogId;
  },

  /** 設定星球大戰類型
   * @param state
   * @param planetWarType
   */
  setPlanetWarType(state: PlanetWarState, planetWarType: PlanetWarType) {
    state.planetWarType = planetWarType;
  },

  /** 設定星球大戰結算資料
   * @param state
   * @param data
   */
  setPlanetWarResult(state: PlanetWarState, data: PlanetWarGameResult) {
    state.planetWarResult = data;
  },

  /** 設定塔防星球大戰遊戲資料
   * @param state
   * @param data
   */
  setPlanetTowerDefenseGameData(state: PlanetWarState, data: TowerDefenseGameData) {
    state.defenseGameData = data;
  },

  /** 設定逆塔防遊戲資料
   * @param state
   * @param data
   */
  setAntiTDGameData(state: PlanetWarState, data: AntiTDGameData) {
    state.antiTDGameData = data;
  },
};

const actions = {
  /** 取得星球大戰用戶資訊 */
  async getPlanetWarUserInfo(context: ActionContext<PlanetWarState, Getters>): Promise<void> {
    try {
      // API 取得星球大戰個人資訊
      const response: any = await planetWarUserInfoAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }
      context.commit('setPlanetWarUserInfo', response);
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 開始新遊戲
   * @param context
   */
  async newPlanetGame(context: ActionContext<PlanetWarState, Getters>): Promise<BaseGameStrategy | undefined> {
    switch (context.state.planetWarType) {
      // 塔防
      case PlanetWarType.Outter:
        if (context.state.defenseGameData != null) {
          return new PlanetDefenseGame(context.state.defenseGameData, context.state.learnLid, context.state.learnLogId);
        }
        break;
      // 逆塔防
      case PlanetWarType.Inner:
      case PlanetWarType.HeroUniverse:
        if (context.state.antiTDGameData != null) {
          return new PlanetAntiTDGame(context.state.antiTDGameData, context.state.learnLid, context.state.learnLogId);
        }
        break;
      default:
        console.log(`newGame Error: unknow planetWarType=${context.state.planetWarType}`);
        return;
    }

    // 未設定gameData
    console.error('Start Planet Game fail: gameData = null');
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
