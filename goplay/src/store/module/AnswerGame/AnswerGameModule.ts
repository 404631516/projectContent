import { EndType } from '@/helper/enum/WebGame';
import {
  QuizSource,
  ResponseState,
  HeroJ7GameType,
  GATagCategoryIdType,
  GATagActionIdType,
  GATagActionStrType,
  GATagCategoryStrType,
} from '@/helper/enum/Common';
import { ContestGameResult, ContestPlayerData } from '@/helper/interface/Game';
import { ListStatus } from '@/helper/enum/AnswerGame';
import {
  QuestionData,
  AnswerResult,
  AnswerGameInfo,
  ResultListState,
  ContinueState,
  ShopItemData,
} from '@/helper/interface/AnswerGame';
import { ReturnGetters, ActionContext } from '@/types/store';
import { Load, Message } from '@/helper/class/Common';
import { contestWebGame } from '@/api/contestGame';
import { handleAPIError, sendGAEvent } from '@/helper/fnc/common';
import { ContestGameAward } from '@/helper/interface/Contest';
import {
  BaseAnswerGameStrategy,
  DefenseAnswerGame,
  HamsterAnswerGame,
  BejeweledAnswerGame,
  ShooterAnswerGame,
  ParkourAnswerGame,
  FishingAnswerGame,
  BomberManAnswerGame,
  BubbleDragonAnswerGame,
  MatchingCardAnswerGame,
  PiggyAnswerGame,
  SnakeAnswerGame,
  VerticalParkourAnswerGame,
  SpaceInvadersAnswerGame,
  Puzzle2048AnswerGame,
} from '@/views/H5/Games/Common/AnswerGameStrategy';
import router from '@/router';

interface AnswerGameState {
  /** 答題結果排行狀態 */
  resultListState: ResultListState;
  /** 續命題狀態 */
  showAnswer: ContinueState;
  /** 答題遊戲資訊 */
  answerGameInfo: AnswerGameInfo;
  /** 作答結果 */
  answerResult: AnswerResult;
  /** 答題記錄時間 */
  recordTime: number;
  /** 回合題目 */
  answerRecord: QuestionData[];
  /** 獎勵獲取道具列表 */
  rewardsProps: ShopItemData[];
  /** 題庫來源 */
  quizSource: QuizSource;
  /** 遊戲音樂開關 */
  isOpenWebAudio: boolean;
}

const moduleState: AnswerGameState = {
  resultListState: {
    isShowList: false,
    listType: ListStatus.None,
    isOpenRank: false,
  },
  showAnswer: {
    isShowAnswer: false,
    resultType: EndType.None,
    rewardData: [],
  },
  answerGameInfo: {
    contestId: -1,
    logId: -1,
    verifyKey: '',
  },
  answerResult: {
    topicCount: 0,
    answerScore: 0,
  },
  recordTime: 0,
  answerRecord: [],
  rewardsProps: [],
  quizSource: QuizSource.None,
  isOpenWebAudio: false,
};

const moduleGetters = {
  /** 是否靜音
   * @param state
   */
  isMute(state: AnswerGameState): boolean {
    return state.isOpenWebAudio === false;
  },
  /** 答題記錄
   * @param state
   */
  answerInformation(state: AnswerGameState): QuestionData[] {
    // 取得最後一題Index
    const lastIndex = state.answerRecord.length - 1;

    // 防呆
    if (lastIndex < 0) {
      return [];
    }

    // 檢查是否有觸發續命題 (最後一題是答題結束)
    return state.answerRecord[lastIndex].isFinished
      ? // 返回全部答題記錄
        state.answerRecord
      : // 去除掉續命題
        state.answerRecord.filter((question) => {
          return question.isRoundOneEnd === false;
        });
  },
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 設定答題結果
   * @param state
   * @param data
   */
  setAnswerResult(state: AnswerGameState, data: AnswerResult) {
    state.answerResult = data;
  },

  /** 設定答題遊戲資訊
   * @param state
   * @param data
   */
  setAnswerGameInfo(state: AnswerGameState, data: AnswerGameInfo) {
    state.answerGameInfo = data;
  },

  /** 顯示結果列表資訊
   * @param state
   * @param data
   */
  setResultListState(state: AnswerGameState, data: ResultListState) {
    state.resultListState = data;
  },

  /** 開啟續命答題
   * @param state
   * @param data 回傳結果資料
   */
  setContinueState(state: AnswerGameState, data: ContinueState) {
    state.showAnswer = data;
  },

  /** 答題時間紀錄
   * @param state
   * @param recordTime
   */
  setRecordTime(state: AnswerGameState, recordTime: number) {
    state.recordTime = recordTime;
  },

  /** 存取當前答題題目
   * @param state
   * @param data
   */
  setAnswerRecord(state: AnswerGameState, data: QuestionData[]) {
    state.answerRecord = data;
  },

  /** 取得獎勵道具列表
   * @param state
   * @param data
   */
  setRewardsProps(state: AnswerGameState, data: ShopItemData[]) {
    state.rewardsProps = data;
  },

  /** 存取題庫來源
   * @param state
   * @param quizSource
   */
  setQuizSource(state: AnswerGameState, quizSource: QuizSource) {
    state.quizSource = quizSource;
  },

  /** 遊戲音樂開關(與小遊戲溝通判斷)
   * @param state
   * @param isOpen
   */
  setOpenWebAudio(state: AnswerGameState, isOpen: boolean) {
    state.isOpenWebAudio = isOpen;
    sessionStorage.setItem('openWebAudio', JSON.stringify(state.isOpenWebAudio));
  },
};

const actions = {
  /** 取得答題遊戲設定
   * @param context
   * @param gameType
   */
  async newAnswerGame(
    context: ActionContext<AnswerGameState, Getters>,
    gameType: HeroJ7GameType,
  ): Promise<BaseAnswerGameStrategy | undefined> {
    // 重置存取回合題目
    context.commit('setAnswerRecord', []);

    // 續命題重置
    context.commit('setContinueState', {
      isShowAnswer: false,
      resultType: EndType.None,
      rewardData: [],
    });

    // 返回答題遊戲設定
    switch (gameType) {
      // 塔防
      case HeroJ7GameType.TowerDefense:
        return new DefenseAnswerGame();
      // 打地鼠
      case HeroJ7GameType.Hamster:
        return new HamsterAnswerGame();
      // 消消樂
      case HeroJ7GameType.Bejeweled:
        return new BejeweledAnswerGame();
      // 射擊
      case HeroJ7GameType.Shooter:
        return new ShooterAnswerGame();
      // 跑酷
      case HeroJ7GameType.Parkour:
        return new ParkourAnswerGame();
      // 釣魚
      case HeroJ7GameType.Fishing:
        return new FishingAnswerGame();
      // 炸彈超人
      case HeroJ7GameType.BomberMan:
        return new BomberManAnswerGame();
      // 泡泡龍
      case HeroJ7GameType.BubbleDragon:
        return new BubbleDragonAnswerGame();
      // 翻翻牌
      case HeroJ7GameType.MatchingCard:
        return new MatchingCardAnswerGame();
      // 小豬
      case HeroJ7GameType.Piggy:
        return new PiggyAnswerGame();
      // 貪吃蛇
      case HeroJ7GameType.Snake:
        return new SnakeAnswerGame();
      // 垂直跑酷
      case HeroJ7GameType.VerticalParkour:
        return new VerticalParkourAnswerGame();
      // 太空侵略者
      case HeroJ7GameType.SpaceInvaders:
        return new SpaceInvadersAnswerGame();
      // 2048
      case HeroJ7GameType.Puzzle2048:
        return new Puzzle2048AnswerGame();
      default:
        console.error(`newAnswerGame Error: unknown gameType=${gameType}`);
        return;
    }
  },

  /** 結算Phaser小遊戲
   * @param context
   * @param contestId
   */
  async sendPhaserGameResult(
    context: ActionContext<AnswerGameState, Getters>,
    playerData: ContestPlayerData,
  ): Promise<ContestGameAward[]> {
    // 組合結算資料
    const data: ContestGameResult = {
      contestId: context.state.answerGameInfo.contestId,
      gameLogId: context.state.answerGameInfo.logId,
      verifyCode: context.state.answerGameInfo.verifyKey,
      playerData: JSON.stringify(playerData),
    };

    try {
      // 開啟讀取中
      Load.use(true);

      // API 遊戲結算
      const response: any = await contestWebGame.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // GA 紀錄結算結束事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7Game,
        GATagActionIdType.Heroj7GameFinish,
        `${GATagActionStrType.Heroj7GameFinish}-${context.state.answerGameInfo.contestId}`,
        router.app.$gtag,
        GATagActionStrType.Heroj7GameFinish,
        GATagCategoryStrType.Heroj7GameFinish,
      );

      // 回傳獎勵
      return response.reward as ContestGameAward[];
    } catch (e) {
      Message.error(`${e}`);
      return [];
    } finally {
      Load.use(false);
    }
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
