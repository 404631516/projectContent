import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import MssrAgent from './MssrAgent';

/** 負責與Mssr弱連網server溝通, 收送http封包 */
export default class MssrComponent {
  /** 連線目標 */
  private mssrUrl: string;
  /** 連線實體 */
  private axiosInstance!: AxiosInstance;

  /** constructor
   * @param mssrUrl 連線目標
   * @param mssrToken 預設token
   */
  constructor(mssrUrl: string, mssrToken: string) {
    this.mssrUrl = mssrUrl;
    // 根據預設token設定axiosInstance
    this.setAxiosInstance(mssrToken);
  }

  /** 根據token設定axiosInstance */
  private setAxiosInstance(mssrToken: string): void {
    const config: AxiosRequestConfig = {
      baseURL: this.mssrUrl,
    };
    config.headers = { 'Content-Type': 'application/json' };
    config.headers.token = mssrToken;
    this.axiosInstance = axios.create(config);
  }

  /** 使用者登入
   * @param account 使用者帳號
   * @param password 使用者密碼
   * @returns 成功與否
   */
  public async login(account: string, password: string): Promise<boolean> {
    const params = new Map<string, any>();
    params.set('device', 3);
    params.set('account', account);
    params.set('password', password);
    params.set('origin', '33');
    params.set('qRCode', '');
    params.set('appId', 10205);
    params.set('deviceModel', 'Microsoft_PC');
    // 送http封包給mssr server
    const response = await MssrAgent.post(this.axiosInstance, '/login', params);
    // 回傳
    if (response === undefined) {
      console.error(`MssrAgent.login() error, response is undefined! account = ${account}`);
      return false;
    }
    const loginData = JSON.parse(response.data.data);
    // 更新header token
    this.setAxiosInstance(loginData.token);
    // 回傳
    return true;
  }

  /** 創立賽事房間
   * @param contestId 賽事id
   * @param roomPassword 房間密碼
   * @param maxPlayers 房間最大玩家數
   * @param roundTime 房間持續時間(分鐘)
   * @returns
   */
  public async creatContestRoom(
    contestId: number,
    roomPassword: string,
    maxPlayers: number,
    roundTime: number
  ): Promise<CreatContestRoomResponse> {
    // 通知mssr開局
    const params = new Map<string, any>();
    params.set('contestId', contestId);
    params.set('roomName', 'stressTestRoom');
    params.set('roomPassword', roomPassword);
    params.set('useQuiz', { sourceType: 0, quizSetIds: ['1'] });
    params.set('limitUid', []);
    params.set('maxPlayers', maxPlayers);
    params.set('info', '');
    params.set('startAt', Date.now());
    // 結束是幾分鐘後
    params.set('roundTime', roundTime);

    // 送http封包給mssr server
    const response = await MssrAgent.post(this.axiosInstance, '/customContestRoomEdit', params);
    // 防呆
    if (response === undefined) {
      console.error(`MssrAgent.customContestRoomEdit() error, response is undefined! contestId = ${contestId}`);
      return {
        isSuccess: false,
        contestRoom: response.data.contestRoom,
      };
    }
    // 回傳
    return {
      isSuccess: true,
      contestRoom: response.data.contestRoom,
    };
  }

  /** 取得房間Token
   * @param contestRoomId 賽事房間Id
   * @param roomPassword 密碼
   * @returns 房間 Token
   */
  public async getSignUpToken(contestRoomId: number, roomPassword: string): Promise<GetSignUpTokenResponse> {
    // 通知mssr開局
    const params = new Map<string, any>();
    params.set('contestRoomId', contestRoomId);
    params.set('password', roomPassword);

    // 送http封包給mssr server
    const response = await MssrAgent.post(this.axiosInstance, '/customContestRoomUserSignUp', params);
    // 防呆
    if (response === undefined || response.data.result !== 'success') {
      return {
        isSuccess: false,
        signUpToken: '',
      };
    }
    // 回傳
    return {
      isSuccess: true,
      signUpToken: response.data.signUpToken,
    };
  }
}

/** 取得的Token值 */
export interface GetSignUpTokenResponse {
  /** 是否成功開局 */
  isSuccess: boolean;
  /** 取得的Token值 */
  signUpToken: string;
}

/** 創立賽事房間 */
export interface CreatContestRoomResponse {
  /** 是否成功開局 */
  isSuccess: boolean;
  /** 取得的賽事房間 */
  contestRoom: ContestRoom;
}

/** 賽事房間結構 */
export interface ContestRoom {
  contestRoomId: number;
  roomName: string;
  roomPassword: string;
}

//#region 結算相關格式
/** 結束遊戲, 傳給server紀錄玩家成績(gamePlayerLog). 欄位名字不可改, 會影響router成績上傳 */
export interface PlayerScore {
  /** cid */
  playerId: number;
  /** 總分 */
  score: number;
  /** 使用平台, Unity enum RuntimePlatform */
  platform: number;
  /** 遊戲結束後有沒有剩血量 */
  isSurvivor: boolean;
  /** 所選英雄hid */
  hid: number;
  /** 隊伍編號 */
  teamId: number;
  /** key: 第幾題, value: 該題詳細資料 */
  quizAnswer: { [k: string]: PlayerAnswerLog };
}

/** gamePlayerLog裡一題的紀錄 */
export interface PlayerAnswerLog {
  /** 題目 */
  qid: string;
  /** 答題選項 */
  answer: number;
  /** 剩餘時間 */
  answerTime: number;
  /** 答題所花秒數, 即(題目秒數-剩餘時間) */
  usedTime: number;
  /** Unix時間, 本回合結束時間點(20XX年X月X日X時X分X秒) */
  unixTime: number;
  // /** 本題所得分數 */
  // score: number;
}
//#endregion
