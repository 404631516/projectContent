import { ActionContext, ReturnGetters } from '@/types/store';
import { adlForumUserRecord } from '@/api/InterstellarForum';
import { Message } from '@/helper/class/Common';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';

interface InterstellarForumState {
  /** 回答次數上限 */
  answerMax: number;
}

const moduleState: InterstellarForumState = {
  answerMax: 3,
};

const moduleGetters = {};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {};

const actions = {
  /** 取得挑戰次數資訊
   *  @param context
   */
  async getAdlForumUserRecord(context: ActionContext<InterstellarForumState, Getters>): Promise<number> {
    try {
      // API 取得挑戰資訊
      const response: any = await adlForumUserRecord.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }
      return context.state.answerMax - response.answerCount;
    } catch (e) {
      Message.error(`${e}`);
      return -1;
    }
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
