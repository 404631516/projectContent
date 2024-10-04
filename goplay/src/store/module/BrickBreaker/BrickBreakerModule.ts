import {
  BrickBreakerGameFinishStatus,
  BrickBreakerRankData,
  BrickBreakerVueUserAnswerData,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import { BrickBreakerAvatarDataWithScore } from '@/views/H5/Games/BrickBreaker/Dialogs/BrickBreakerRankDialog';
import { ActionContext, ReturnGetters } from '@/types/store';
import { Message } from '@/helper/class/Common';
import { AnswerInfo, QuestionData } from '@/helper/interface/AnswerGame';
import BrickBreakerClient from '@/views/H5/Net/NetClient/BrickBreaker/BrickBreakerClient';
import { BrickBreakerScoreList } from '@/helper/interface/Game';
import { PTCLError } from '@/views/H5/Net/Netbase/Protocol';

interface BrickBreakerState {
  /** Client */
  brickBreakerClient?: BrickBreakerClient;
  /** 遊戲內玩家得分列表 */
  playerScoreList: BrickBreakerAvatarDataWithScore[];
  /** 結算資料 */
  contestResultData: BrickBreakerRankData[];
  /** 總分排名資料 */
  contestRankList: BrickBreakerScoreList[];
  /** 答題排名資料 */
  answerRankList: BrickBreakerVueUserAnswerData[];
  /** 遊戲結束狀態資料 */
  gameFinishStatus: BrickBreakerGameFinishStatus;
  /** 是否顯示得分板 */
  isShowScoreBoard: boolean;
  /** 是否顯示答題畫面 */
  isShowQuiz: boolean;
  /** 是否顯示物件說明畫面 */
  isShowExplainDialog: boolean;
}

const moduleState: BrickBreakerState = {
  playerScoreList: [],
  contestResultData: [],
  contestRankList: [],
  answerRankList: [],
  gameFinishStatus: {} as BrickBreakerGameFinishStatus,
  isShowScoreBoard: false,
  isShowQuiz: false,
  isShowExplainDialog: false,
};

const moduleGetters = {};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 設定BrickBreakerClient
   * @param state
   * @param brickBreakerClient Phaser端建立的BrickBreakerClient
   */
  setBrickBreakerClient(state: BrickBreakerState, brickBreakerClient: BrickBreakerClient) {
    state.brickBreakerClient = brickBreakerClient;
  },

  /** 摧毀BrickBreakerClient
   * @param state
   */
  destroyBrickBreakerClient(state: BrickBreakerState) {
    state.brickBreakerClient = undefined;
  },

  /** 設定玩家詳細資訊列表
   * @param state
   * @param playerDetailList 玩家詳細資訊列表
   */
  setPlayerScoreList(state: BrickBreakerState, playerDetailList: BrickBreakerAvatarDataWithScore[]) {
    state.playerScoreList = playerDetailList;
  },

  /** 設定結算資料
   * @param state
   * @param resultData 結算資料
   */
  setContestResultData(state: BrickBreakerState, resultData: BrickBreakerRankData[]) {
    state.contestResultData = resultData;
  },

  /** 設定遊戲結束狀態資料
   * @param state
   * @param gameFinishStatus 遊戲結束狀態
   */
  setGameFinishStatus(state: BrickBreakerState, gameFinishStatus: BrickBreakerGameFinishStatus) {
    state.gameFinishStatus = gameFinishStatus;
  },

  /** 設定總分排名資料
   * @param state
   * @param rankData 排名資料
   */
  setContestRankList(state: BrickBreakerState, rankData: BrickBreakerScoreList[]) {
    state.contestRankList = rankData;
  },

  /** 設定答題排名資料
   * @param state
   * @param rankData 排名資料
   */
  setAnswerRankList(state: BrickBreakerState, rankData: BrickBreakerVueUserAnswerData[]) {
    state.answerRankList = rankData;
  },

  /** 設定顯示得分板
   * @param state
   * @param isShow 是否顯示
   */

  setShowBrickBreakerScoreBoard(state: BrickBreakerState, isShow: boolean) {
    state.isShowScoreBoard = isShow;
  },

  /** 設定顯示答題畫面
   * @param state
   * @param isShow 是否顯示
   */
  setShowBrickBreakerQuiz(state: BrickBreakerState, isShow: boolean) {
    state.isShowQuiz = isShow;
  },

  /** 設定顯示物件說明
   * @param state
   * @param isShow 是否顯示
   */
  setShowBrickBreakerExplainDialog(state: BrickBreakerState, isShow: boolean) {
    state.isShowExplainDialog = isShow;
  },
};

const actions = {
  /** 送出答案並要求下一題
   * @param context
   * @param payload 作答樣式
   * @returns
   */
  async sendAnswerGetQuestion(
    context: ActionContext<BrickBreakerState, Getters>,
    payload: AnswerInfo
  ): Promise<QuestionData> {
    try {
      if (context.state.brickBreakerClient === undefined) {
        throw new Error('brickBreakerClient undefined');
      }
      // 送出答案並等待RPC回傳
      const response = await context.state.brickBreakerClient.sendRPCBrickBreakerPlayerGetNextQuestion(
        payload.answerIndex,
        payload.usedSecond
      );
      if (response instanceof PTCLError) {
        throw new Error('PTCLError');
      }

      // 返回取得的題目
      return response.outQuestionData;
    } catch (e) {
      Message.error(`${e}`);
      return {} as QuestionData;
    }
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
