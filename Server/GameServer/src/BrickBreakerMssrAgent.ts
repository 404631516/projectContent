import { BrickBreakerAnswerStatisticsData, BrickBreakerRoomData } from './NetProtocol/BrickBreakerStructure';
import MssrAgent, { PlayerScore } from './MssrAgent';

export default class BrickBreakerMssrAgent {
  /** 取得BrickBreakerRoomData
   * @param contestId 賽事Id
   * @param contestRoomId token內提供的房間Id
   * @returns BrickBreaker房間設定資料
   */
  public static async getBrickBreakerRoomData(contestId: number, contestRoomId: number): Promise<BrickBreakerRoomData> {
    // 根據gameRoomId, 去mssr取遊戲設定資料
    const params = new Map<string, any>();
    params.set('contestRoomId', contestRoomId);
    params.set('contestId', contestId);
    // 送http封包給mssr server, 取得BrickBreaker遊戲設定資料
    const response = await MssrAgent.get('/contestRoomGame', params);
    // mssrServer時間校正
    const mssrServerNow = response.headers.servertime;
    const timeDiff = Date.now() - mssrServerNow;

    // 日期UnixTime轉換成校正後的servertime
    if (response) {
      response.data.startAt = response.data.startAt + timeDiff;
      response.data.endAt = response.data.endAt + timeDiff;
    }
    // 回傳
    return response.data;
  }

  /** 賽局結算, 由於需要多傳mvpList, 所以沒辦法寫成各遊戲通用function
   * @param contestRoomId token內提供的房間Id
   * @param contestId 賽事Id
   * @param playerScoreList 個人成績
   * @param verifyCode gamelog驗證用verifyCode, 送開局封包時取得
   * @param mvpList BrickBreaker特殊資料, 各項mvp
   * @returns 成功與否
   */
  public static async updateFinishGameLog<T extends PlayerScore>(
    contestRoomId: number,
    contestId: number,
    playerScoreList: T[],
    verifyCode: string,
    mvpList: BrickBreakerLogMvpList,
    userAnswerLogDatas: UserAnswerLogData[],
    gamePlaySec: number,
    bossTotalHp: number,
    bossHp: number
  ): Promise<boolean> {
    const params = new Map<string, any>();
    params.set('contestRoomId', contestRoomId);
    params.set('contestId', contestId);
    params.set('playerDatas', playerScoreList);
    params.set('verifyCode', verifyCode);
    params.set('mvpList', mvpList);
    params.set('userAnswerDatas', userAnswerLogDatas);
    params.set('gamePlaySec', gamePlaySec);
    params.set('bossTotalHp', bossTotalHp);
    params.set('bossHp', bossHp);
    // 送http封包給mssr server
    const response = await MssrAgent.put('/contestRoomGame', params);
    // 回傳
    return response !== undefined;
  }
}

//#region 結算相關格式
/** BrickBreaker專用結算格式 */
export interface BrickBreakerPlayerScore extends PlayerScore {
  /** BrickBreaker特殊的個人log data */
  brickBreakerLog: BrickBreakerLog;
}

/** BrickBreaker特殊的個人log data */
interface BrickBreakerLog {
  /** 魔王格子七題全對次數 */
  hitBossSuccessCount: number;
  /** 對魔王造成的傷害量 */
  bossDamage: number;
  /** 使用號角次數 */
  hornCount: number;
  /** 魔王觸手成功防禦次數 */
  defenseSuccessCount: number;
  /** 成功打開寶箱次數 */
  gridAnswerTreasureCount: number;
  /** 觸發寶物格子次數 */
  gridTreasureCount: number;
  /** 觸發磚塊格子次數 */
  gridBreakableBrickCount: number;
}

/** game log用, 各項mvp清單, 這邊的變數名稱必須對應到enum BrickBreakerRankType的名稱, 第一個字改小寫 */
export interface BrickBreakerLogMvpList {
  gameScore: MvpLogData;
  questionCorrect: MvpLogData;
  bossHitSuccess: MvpLogData;
  bossDamage: MvpLogData;
  hornCount: MvpLogData;
  defenseCount: MvpLogData;
  answerTreasureCount: MvpLogData;
  treasureCount: MvpLogData;
  brickBreakCount: MvpLogData;
}

/** game log用, mvp資料 */
export interface MvpLogData {
  playerId: number;
  count: number;
}

/** game log用, 玩家答題資料 */
export interface UserAnswerLogData extends BrickBreakerAnswerStatisticsData {
  playerId: number;
}
//#endregion
