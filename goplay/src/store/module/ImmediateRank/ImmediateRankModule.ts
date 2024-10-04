import { Message } from '@/helper/class/Common';
import { ResponseState, RankRuleType } from '@/helper/enum/Common';
import { contestRankScoreAPI } from '@/api/contest';
import { RankData } from '@/helper/interface/Rank';
import { ReturnGetters } from '@/store';
import { ActionContext } from '@/types/store';

interface ImmediateRankState {
  /** 賽事ID */
  contestId: number;
  /** 賽事排名規則 */
  rankRuleType: RankRuleType;
}

const moduleState: ImmediateRankState = {
  contestId: 0,
  rankRuleType: RankRuleType.AdlEdu,
};

const moduleGetters = {};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 設定賽事ID
   * @param state
   * @param contestId
   */
  setContestId(state: ImmediateRankState, contestId: number) {
    state.contestId = contestId;
  },

  /** 設定賽事排名規則
   * @param state
   * @param rankRuleType
   */
  setRankRuleType(state: ImmediateRankState, rankRuleType: RankRuleType) {
    state.rankRuleType = rankRuleType;
  },
};

const actions = {
  /** 取得賽事排名
   * @param context
   */
  async getContestRankScoreApi(context: ActionContext<ImmediateRankState, Getters>): Promise<RankData | undefined> {
    // 組成封包
    const data = {
      contestId: context.state.contestId,
      pageSize: 50,
    };
    try {
      // API 取得賽事排行榜
      const response: any = await contestRankScoreAPI.fetch(data);
      if (ResponseState.Success === response.result) {
        const rankData = JSON.parse(response.data);
        return rankData;
      } else {
        Message.error(response.result);
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
