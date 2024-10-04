import MssrComponent from './MssrComponent';
import Bot from './Bot';
import botConfigJson from './botConfig.json';
import BrickBreakerBot from './BrickBreakerBot';
import accountJson from './account.json';

/** 遊戲類別 */
export enum GameType {
  /** 全部 */
  Total = 0,
  /** 一對一單對單 */
  PKG = 1,
  /** 走位戰 */
  Blocking = 2,
  /** 跑酷戰 */
  Parkour = 3,
  /** 決鬥 */
  Duel = 4,
  /** 聊天室 */
  Chat = 5,
  /** 猜拳小遊戲 */
  Jankenpon = 6,
  /** 打地鼠 */
  MoleBuster = 7,
  /** 健身 */
  Fitness = 8,
  /** 程式積木 */
  CodeBlock = 9,
  /** 聊天模式 */
  ChatRoom = 10,
  /** 塔防 */
  WebTowerDefense = 11,
  /** 消消樂 */
  WebBejeweled = 12,
  /** 射擊 */
  WebShooter = 13,
  /** 打地鼠 */
  WebHamster = 14,
  /** 網頁遊戲隨機 */
  WebAdlGameBox = 15,
  /** 跑酷 */
  WebParkour = 16,
  /** 釣魚 */
  WebFishing = 17,
  /** 炸彈人 */
  WebBomberMan = 18,
  /** 敲敲答答 */
  BrickBreaker = 19,
}

/** 為了保證botConfig.json格式正確, 定義各參數名稱, 避免botConfig.json填錯而不自知的情況 */
interface BotConfig {
  /** 根據GameType決定要啟用的bot類型 */
  gameType: GameType;
  /** 要玩的賽事id */
  contestId: number;
  /** 房間數 */
  roomCount: number;
  /** 每個房間的玩家數 */
  roomPlayerCount: number;
  /** 遊戲房間持續時間(分鐘) */
  roundTime: number;
  /** 強連網server網址 */
  gatewayServerUrl: string;
  /** 弱連網mssr server網址 */
  mssrUrl: string;
  /** 解token用salt, 跟 mssrServer & 強連網server 的salt要是一樣的 */
  jwtSalt: string;
  /** 創房間用的老師token */
  teacherToken: string;
}

interface AccountData {
  account: string;
  password: string;
}

/** bot管理者 */
export default class BotManager {
  /** config */
  private botConfig!: BotConfig;

  /** bot map */
  private bots: Bot[] = new Array<Bot>();
  /** 帳號資料 map */
  public accountDataMap = new Map<number, AccountData>();

  /** 創房用, 老師身分的弱連網連線 */
  private adminMssrAgentComponent: MssrComponent = new MssrComponent(botConfigJson.mssrUrl, botConfigJson.teacherToken);

  /** init flag */
  private isInitDone: boolean = false;

  constructor() {
    // 讀取account file來設定帳密
    this.setAccountDataMap();

    console.log('gameType = ' + botConfigJson.gameType);
    console.log('contestId = ' + botConfigJson.contestId);
    console.log('roomCount = ' + botConfigJson.roomCount);
    console.log('roomPlayerCount = ' + botConfigJson.roomPlayerCount);
    console.log('roundTime = ' + botConfigJson.roundTime);
    console.log('serverUrl = ' + botConfigJson.gatewayServerUrl);
    console.log('mssrUrl = ' + botConfigJson.mssrUrl);
    console.log('jwtSalt = ' + botConfigJson.jwtSalt);
    console.log('teacherToken = ' + botConfigJson.teacherToken);

    // 確保json檔跟BotConfig的格式符合, 所以在這邊轉換成BotConfig做使用
    this.botConfig = botConfigJson;

    this.init();
  }

  /** set accountDataMap */
  private setAccountDataMap() {
    accountJson.forEach((accountData) => {
      this.accountDataMap.set(accountData.uid, {
        account: accountData.account,
        password: accountData.password,
      });
    });
  }

  /** 生成房間及機器人 */
  private async init(): Promise<void> {
    // 取得輸入參數, proccessIndex
    const paramProcessIndexStr = process.argv[2];
    // 若沒有輸入參數, 預設為1
    const proccessIndex: number = paramProcessIndexStr ? Number(process.argv[2]) : 1;
    // 顯示目前的process基本資訊
    console.log('proccessIndex = ' + proccessIndex);

    // 根據proccessIndex, 動態算這個proccess的第一個uid & 第一個gameRoomId
    const processFirstUid = 1 + (proccessIndex - 1) * this.botConfig.roomCount * this.botConfig.roomPlayerCount;

    // for多個房間
    for (let i = 0; i < this.botConfig.roomCount; ++i) {
      // admin帳號 創立房間
      const createRoomResult = await this.adminMssrAgentComponent.creatContestRoom(
        this.botConfig.contestId,
        '',
        // 房間人數上線設成房間機器人數+10, 方便正常玩家也可加入同一房間觀察測試情況
        this.botConfig.roomPlayerCount + 10,
        this.botConfig.roundTime
      );
      // 防呆
      if (createRoomResult.isSuccess === false) {
        console.error(`BotManager.init() error, creatContestRoom failed! i: ${i}`);
        continue;
      }

      // 取得房間資訊
      const contestRoomId = createRoomResult.contestRoom.contestRoomId;
      const roomPassword = createRoomResult.contestRoom.roomPassword;
      console.log(`create contestRoom id: ${contestRoomId}, password: ${roomPassword}`);

      // 每個房間創建多個bot
      for (let j = 0; j < this.botConfig.roomPlayerCount; ++j) {
        // 計算uid
        const uid = processFirstUid + i * this.botConfig.roomPlayerCount + j;
        // createBot
        const bot = this.createBot(uid, this.botConfig.gameType, this.botConfig.gatewayServerUrl);
        // bot設定房間資料
        bot.setRoomInfo(contestRoomId, roomPassword);
        // get bot account & password
        const accountData = this.accountDataMap.get(bot.uid);
        if (accountData === undefined) {
          console.error('accountData not found! uid = ' + bot.uid);
          return;
        }
        // bot login
        const isLoginSuccess = await bot.login(accountData.account, accountData.password);
        if (isLoginSuccess === false) {
          console.error(
            `BotManager.init() error, login failed! uid: ${uid}, account: ${accountData.account}, password: ${accountData.password}`
          );
          continue;
        }
        // bot存至map
        this.bots.push(bot);
      }
    }

    this.isInitDone = true;
  }

  /** update */
  public update() {
    // 等待init完成
    if (this.isInitDone === false) {
      return;
    }
    // update每個bot
    this.bots.forEach((bot) => {
      bot.update();
    });
  }

  /** 根據botType創建bot
   * @param uid bot uid
   * @param gameType gameType
   * @returns Bot
   */
  private createBot(uid: number, gameType: GameType, gatewayServerUrl: string): Bot {
    // 根據botType生成對應的Bot
    switch (gameType) {
      case GameType.BrickBreaker:
        return new BrickBreakerBot(uid, gatewayServerUrl);
      default:
        console.error(`createBot() error, unexpected botType ${gameType}`);
        return new BrickBreakerBot(uid, gatewayServerUrl);
    }
  }
}
