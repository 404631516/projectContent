import { BaseGameLogic } from '../../BaseGameLogic';
import {
  BrickBreakerProtocolName,
  GetNextQuestionResultType,
  PTCLBrickBreakerAvatarUpdate,
  PTCLBrickBreakerBossUpdate,
  PTCLBrickBreakerGridUpdate,
  PTCLBrickBreakerPlayerReconnect,
  PTCLBrickBreakerRankData,
  RPCBrickBreakerAvatarMove,
  RPCBrickBreakerGetAvatarDataList,
  RPCBrickBreakerGetGameInfo,
  RPCBrickBreakerPlayerAnswerFinished,
  RPCBrickBreakerPlayerGetNextQuestion,
} from '../../NetProtocol/BrickBreakerProtocol';
import {
  BrickBreakerAvatarState,
  BrickBreakerAvatarUpdateData,
  BrickBreakerAvatarUpdateType,
  BrickBreakerRoomData,
  BrickBreakerGridEventType,
  BrickBreakerItemType,
  BrickBreakerAvatarData,
} from '../../NetProtocol/BrickBreakerStructure';
import { PTCLGameStart } from '../../NetProtocol/GameProtocol';
import GameUser from '../../GameUser';
import { Session } from '../../Netbase/Session';
import State from '../../Netcommon/StateMachine/State';
import StateMachine from '../../Netcommon/StateMachine/StateMachine';
import BrickBreakerMapManager from './BrickBreakerMapManager';
import QuestionManager from '../../Components/QuestionManager';
import BrickBreakerAvatar from './BrickBreakerAvatar';
import BrickBreakerBoss from './BrickBreakerBoss';
import BrickBreakerAvatarManager, { EffectRangeType } from './BrickBreakerAvatarManager';
import BrickBreakerMssrAgent from '../../BrickBreakerMssrAgent';
import TableManager from '../Table/TableManager';
import { UserJoinGameResult } from '../../NetProtocol/CommonStructure';

/** state machine transition */
enum BrickBreakerEventType {
  /** 遊戲開始 */
  GameStart,
  /** 遊戲結束 */
  GameEnd,
}

enum BrickBreakerStateType {
  Prepare,
  Gaming,
  GameEnd,
}

export default class BrickBreakerGameLogic extends BaseGameLogic {
  /** 狀態機 */
  private stateMachine: StateMachine<BrickBreakerGameLogic> = new StateMachine<BrickBreakerGameLogic>();

  /** avatarManager */
  private avatarManager: BrickBreakerAvatarManager = new BrickBreakerAvatarManager();

  /** 地圖manager */
  private mapManager: BrickBreakerMapManager = new BrickBreakerMapManager();

  /** 題庫管理者 */
  public questionManager: QuestionManager = new QuestionManager();

  /** 遊戲正式開始前有個等待加入的等待期, 等待期間不接受玩家移動 */
  public currentState: BrickBreakerStateType = BrickBreakerStateType.Prepare;

  /** 房間ID */
  public gameRoomId: number = 0;

  /** 魔王 */
  public boss!: BrickBreakerBoss;

  /** 上次送封包更新grid的時間點 */
  private updateGridAt: number = Number.MAX_VALUE;

  /** 遊戲開始時間 */
  public prepareStateEndAt: number = Number.MAX_VALUE;

  /** 遊戲結束時間 */
  public gameEndAt: number = 0;

  /** 遊戲已結束 */
  private isGameEnd = false;

  /** 房間總人數, client端顯示用 */
  private maxPlayers: number = 50;

  /** 地圖更新時間, 每x秒送一次封包 */
  private readonly gridUpdateMilliSec = 1000;

  /** 等待玩家入場秒數 */
  public readonly gamePrepareSec: number = 100;

  /** 開場時間允許誤差(毫秒), 這邊保險起見給1000 */
  private readonly startTimeTolerance = 1000;

  /** init
   * @param gameRoomId 對應遊戲id
   */
  public async init(gameRoomId: number, contestId: number): Promise<UserJoinGameResult> {
    this.gameRoomId = gameRoomId;

    // call特殊API取得BrickBreaker專用資料
    const roomData: BrickBreakerRoomData = await BrickBreakerMssrAgent.getBrickBreakerRoomData(contestId, gameRoomId);
    // 防呆, roomData資訊有誤
    if (roomData === undefined) {
      console.error('BrickBreakerGameLogic.init error, roomData is undefined!');
      return UserJoinGameResult.RoomDataNotFound;
    }

    // 防呆, 對應ID的房間遊戲已結束的情況
    if (roomData.isFinished) {
      console.error('BrickBreakerGameLogic.init error, roomData.isFinished is true!');
      return UserJoinGameResult.IsRoomFinished;
    }

    // 防呆, 檢查遊戲時間格式
    if (roomData.startAt == null || roomData.endAt == null || isNaN(roomData.startAt) || isNaN(roomData.endAt)) {
      console.error(
        `BrickBreakerGameLogic.init error, roomData time is null! start: ${roomData.startAt}, end: ${roomData.endAt}`
      );
      return UserJoinGameResult.RoomDataError;
    }
    // 防呆, 檢查遊戲時間區間
    const now = Date.now();
    if (now < roomData.startAt - this.startTimeTolerance || now > roomData.endAt) {
      console.error(
        `BrickBreakerGameLogic.init error, start time out of range! \nnow: ${new Date(now)}, \nstart: ${new Date(
          roomData.startAt
        )}, \nend: ${new Date(roomData.endAt)}`
      );
      return UserJoinGameResult.RoomDataError;
    }
    if (roomData.roomBossId === undefined) {
      console.error(`BrickBreakerGameLogic.init() error, roomData.bossId undefined! gameRoomId ${gameRoomId}`);
      roomData.roomBossId = 3;
    }

    // 房間總人數存起來
    this.maxPlayers = roomData.maxPlayers;

    const initSuccess = this.mapManager.init(roomData.mapId);
    // 防呆
    if (initSuccess === false) {
      console.error(`BrickBreakerGameLogic.init error, map init failed! mapId: ${roomData.mapId}`);
      return UserJoinGameResult.GameLogicInitError;
    }

    // 計算遊戲開始時間, 在開始時間到之前, 進場的玩家不能操作
    this.prepareStateEndAt = roomData.startAt + this.gamePrepareSec * 1000;

    // 設定boss
    this.boss = new BrickBreakerBoss(roomData.roomBossId);

    // 設定題庫
    this.questionManager.init(roomData.quizList);

    // 下次地圖更新時間
    this.updateGridAt = Date.now() + this.gridUpdateMilliSec;

    // 遊戲結束時間
    this.gameEndAt = roomData.endAt;

    // setHandler
    this.setHandler(BrickBreakerProtocolName.RPCBrickBreakerGetGameInfo, this.onRPCBrickBreakerGetGameInfo.bind(this));
    this.setHandler(
      BrickBreakerProtocolName.RPCBrickBreakerGetAvatarDataList,
      this.onRPCBrickBreakerGetAvatarDataList.bind(this)
    );
    this.setHandler(BrickBreakerProtocolName.RPCBrickBreakerAvatarMove, this.onRPCBrickBreakerAvatarMove.bind(this));
    this.setHandler(
      BrickBreakerProtocolName.RPCBrickBreakerPlayerGetNextQuestion,
      this.onRPCBrickBreakerPlayerGetNextQuestion.bind(this)
    );
    this.setHandler(
      BrickBreakerProtocolName.RPCBrickBreakerPlayerAnswerFinished,
      this.onRPCBrickBreakerPlayerAnswerFinished.bind(this)
    );

    // 狀態機setTarget
    this.stateMachine.setTarget(this);
    // create states.
    const prepareState = this.stateMachine.createState(PrepareState);
    const gamingState = this.stateMachine.createState(GamingState);
    const gameEndState = this.stateMachine.createState(GameEndState);
    // set transition.
    this.stateMachine.setTransition(BrickBreakerEventType.GameStart, gamingState, prepareState);
    this.stateMachine.setTransition(BrickBreakerEventType.GameEnd, gameEndState, gamingState);
    // 起始state
    this.stateMachine.initState(prepareState);

    return UserJoinGameResult.Success;
  }

  public update(): void {
    if (this.stateMachine) {
      this.stateMachine.updateState();
    }

    // 每隔一段時間發送地圖更新封包
    if (Date.now() >= this.updateGridAt) {
      // 取得需要解凍的avatar清單
      const unfreezeAvatars = this.avatarManager.getUnfreezeTimeupAvatars();
      // 解凍
      if (unfreezeAvatars.length > 0) {
        this.unfreezeAvatars(unfreezeAvatars, 0);
      }
      // mapManager update
      const waitForUpdateGrids = this.mapManager.update(this.avatarManager.getAllPlayerStandingGrid());
      // 發送地圖更新封包
      if (waitForUpdateGrids.length !== 0) {
        // 廣播封包給client
        const ptcl: PTCLBrickBreakerGridUpdate = new PTCLBrickBreakerGridUpdate();
        ptcl.gridArray = waitForUpdateGrids;
        this.roomBroadcast(ptcl);
      }

      // 下次地圖更新時間
      this.updateGridAt = Date.now() + this.gridUpdateMilliSec;
    }
  }

  /** 玩家加入遊戲
   * @param sn session
   * @param rpc 加入房間封包
   */
  public async joinPlayer(gameUser: GameUser): Promise<UserJoinGameResult> {
    // 取得對應使用者資料
    const playerInfo = gameUser.getUserInfo();

    // 取得BrickBreakerAvatar
    const avatar = this.avatarManager.getAvatar(playerInfo.uid);
    // avatar不存在, create avatar
    if (avatar === undefined) {
      // 起始隨機位置
      const avatarIndex = this.avatarManager.getAllAvatarCount();
      const beginGridId = this.mapManager.getPlayerRespawnPoint(avatarIndex);
      // createAvatar
      const newAvatar = this.avatarManager.createAvatar(
        playerInfo,
        beginGridId,
        this.questionManager.getQuestionTotalCount()
      );
      // 取得加入新玩家後的玩家總數
      const allAvatarCount = this.avatarManager.getAllAvatarCount();
      // 嘗試解鎖地圖區域
      this.mapManager.tryUnlockArea(allAvatarCount);

      // 通知魔王有新玩家加入
      this.boss.onNewPlayerJoin();
      // 廣播魔王狀態更新
      this.broadcastBossUpdate([playerInfo.uid]);

      // broadcast, 送封包通知房間內原有client, 新玩家的資訊
      const updateData: BrickBreakerAvatarUpdateData = {
        updateType: BrickBreakerAvatarUpdateType.Join,
        itemId: 0,
        activatorUid: playerInfo.uid,
      };
      this.broadcastAvatarsUpdate([newAvatar], updateData, [playerInfo.uid]);
    }
    // 玩家avatarData已存在, 更新isOnline資料
    else {
      avatar.avatarData.isOnline = true;
      // broadcast, 送封包通知房間內原有client, 玩家又上線了
      const updateData: BrickBreakerAvatarUpdateData = {
        updateType: BrickBreakerAvatarUpdateType.Online,
        itemId: 0,
        activatorUid: playerInfo.uid,
      };
      this.broadcastAvatarsUpdate([avatar], updateData, [playerInfo.uid]);
      // 送給當事人斷線重連通知
      const ptclReconnect: PTCLBrickBreakerPlayerReconnect = new PTCLBrickBreakerPlayerReconnect();
      gameUser.send(ptclReconnect);
    }

    return UserJoinGameResult.Success;
  }

  /** 觀戰者加入遊戲
   * @param sn session
   * @param rpc 加入房間封包
   */
  public async joinSpectator(gameUser: GameUser): Promise<UserJoinGameResult> {
    return UserJoinGameResult.Success;
  }

  /** 收到玩家斷線訊息
   * @param sn session
   */
  public onDisconnect(uid: number): void {
    // 更改avatarData
    const avatar = this.avatarManager.getAvatar(uid);
    if (avatar === undefined) {
      // 觀戰者沒有avatar, 所以視為正常情況直接回傳
      return;
    }
    avatar.onDisconnect();

    // 送封包通知client
    const updateData: BrickBreakerAvatarUpdateData = {
      updateType: BrickBreakerAvatarUpdateType.Online,
      itemId: 0,
      activatorUid: uid,
    };
    this.broadcastAvatarsUpdate([avatar], updateData, [uid]);
  }

  /** 玩家要求取得當前整張地圖 */
  public onRPCBrickBreakerGetGameInfo(sn: Session, rpc: RPCBrickBreakerGetGameInfo): void {
    rpc.mapId = this.mapManager.getMapId();
    rpc.allGridData = this.mapManager.getAllGrid();
    rpc.mapHeight = this.mapManager.getMapHeight();
    rpc.mapWidth = this.mapManager.getMapWidth();
    rpc.playerMax = this.maxPlayers;
    rpc.bossData = this.boss.getBossData();
    rpc.gameStartAt = this.prepareStateEndAt;
    rpc.gameEndAt = this.gameEndAt;
    rpc.serverNow = Date.now();
    rpc.isGameStart = this.currentState === BrickBreakerStateType.Gaming;
    sn.reply(rpc);
  }

  /** 玩家要求取得當前所有玩家資料 */
  public onRPCBrickBreakerGetAvatarDataList(sn: Session, rpc: RPCBrickBreakerGetAvatarDataList): void {
    // 更新類型為AlreadyJoin
    rpc.updateData = {
      updateType: BrickBreakerAvatarUpdateType.AlreadyJoin,
      itemId: 0,
      activatorUid: sn.getId(),
    };
    // 取得所有玩家avatarData
    rpc.avatarDataList = this.avatarManager.getAllAvatarData();
    // reply
    sn.reply(rpc);
  }

  /** 玩家要求移動
   * @param sn
   * @param rpc
   */
  public async onRPCBrickBreakerAvatarMove(sn: Session, rpc: RPCBrickBreakerAvatarMove): Promise<void> {
    const uid = sn.getId();
    // rpc回傳預設值
    rpc.outIsSuccess = false;
    rpc.outEventType = BrickBreakerGridEventType.TriggerFailed;
    rpc.outAvatarUpdateData = {
      updateType: BrickBreakerAvatarUpdateType.ShowError,
      itemId: 0,
      activatorUid: uid,
    };

    // 防呆, 遊戲未正式開始, 不允許移動
    if (this.currentState !== BrickBreakerStateType.Gaming) {
      console.log('onRPCBrickBreakerAvatarMove() warning, game currentState is not Gaming!');
      sn.reply(rpc);
      return;
    }
    // 取得對應玩家資料
    const avatar = this.avatarManager.getAvatar(uid);
    if (avatar === undefined) {
      console.error(`BrickBreakerGame.onRPCThrowDice() error, player not found! uid = ${sn.getId()}`);
      sn.reply(rpc);
      return;
    }
    // 防呆, 驗證玩家位置可否觸發目標grid
    const isDistanceTriggerable = this.mapManager.isGridDistanceTriggerable(
      avatar.avatarData.currentGridId,
      rpc.inGridId
    );
    if (isDistanceTriggerable === false) {
      console.log('onRPCBrickBreakerAvatarMove() warning, distance is not triggerable!');
      sn.reply(rpc);
      return;
    }
    // 防呆, 玩家狀態是否可移動
    if (avatar.avatarData.userState !== BrickBreakerAvatarState.Idle) {
      console.log(
        `onRPCBrickBreakerAvatarMove() warning, userState = ${BrickBreakerAvatarState[avatar.avatarData.userState]}`
      );
      sn.reply(rpc);
      return;
    }

    // 更新grid狀態, 取得觸發的事件
    const mapTriggerResult = this.mapManager.triggerGrid(rpc.inGridId);

    // 更新avatar狀態
    const avatarUpdateData = avatar.onTriggerGridEvent(
      mapTriggerResult.gridType,
      mapTriggerResult.eventType,
      rpc.inGridId
    );

    // 根據結果更新avatarData
    await this.handleAvatarUpdate(avatar, avatarUpdateData);

    // 送封包回覆client
    const isSuccess = avatarUpdateData.updateType !== BrickBreakerAvatarUpdateType.ShowError;
    rpc.outIsSuccess = isSuccess;
    rpc.outEventType = mapTriggerResult.eventType;
    rpc.outAvatarUpdateData = avatarUpdateData;
    rpc.outAvatarData = avatar.avatarData;
    sn.reply(rpc);

    // 送封包通知所有client
    if (isSuccess) {
      this.broadcastAvatarsUpdate([avatar], avatarUpdateData, [uid]);
    }
  }

  /** 根據更新類型更新avatarData */
  private async handleAvatarUpdate(
    avatar: BrickBreakerAvatar,
    updateData: BrickBreakerAvatarUpdateData
  ): Promise<void> {
    // 針對事件更新avatar資料
    switch (updateData.updateType) {
      // 撞牆、成功防禦等, 不須更新avatarData
      case BrickBreakerAvatarUpdateType.DoNothing:
      case BrickBreakerAvatarUpdateType.HitWall:
        // 不需更新自己的avatar資料
        return;
      // 移動
      case BrickBreakerAvatarUpdateType.Move:
        // 更新position
        avatar.setPosition(avatar.avatarData.targetGridId);
        return;
      // 答題事件
      case BrickBreakerAvatarUpdateType.StartAnswer:
        avatar.setUserState(BrickBreakerAvatarState.Answering);
        // 取得題目index array
        const questionIndices = avatar.getQuestionIndices();
        // 去questionManager要題目
        const questions = this.questionManager.getQuestions(questionIndices);
        // avatar設定題目, 更新答題狀態
        avatar.initQuestions(questions);
        return;
      // 炸彈
      case BrickBreakerAvatarUpdateType.Bomb:
        // 回到重生點
        avatar.setPosition(avatar.avatarData.beginGridId);
        return;
      // 傳送
      case BrickBreakerAvatarUpdateType.Teleport:
        // 瞬移至目標
        const telepotTargetGridId = this.mapManager.getTeleportTargetGridId();
        if (telepotTargetGridId === undefined) {
          console.error('handleAvatarUpdate() error, telepotTargetGridId undefined!');
          // 回到重生點
          avatar.setPosition(avatar.avatarData.beginGridId);
          return;
        }
        avatar.setPosition(telepotTargetGridId);
        return;
      // 防禦成功
      case BrickBreakerAvatarUpdateType.DefenseSuccess:
        // 紀錄防禦成功次數
        avatar.avatarData.defenseCount++;
        return;
      // 防禦失敗, 回重生點
      case BrickBreakerAvatarUpdateType.DefenseFailedBomb:
        // 回到重生點
        avatar.setPosition(avatar.avatarData.beginGridId);
        return;
      // 防禦失敗, 消耗護盾
      case BrickBreakerAvatarUpdateType.DefenseFailedShield:
        // 消耗護盾
        avatar.useItem(BrickBreakerItemType.Shield);
        return;
      // 弩砲 & 手裏劍
      case BrickBreakerAvatarUpdateType.Attack:
      case BrickBreakerAvatarUpdateType.Shuriken:
        // 魔王扣血
        this.attackBoss(avatar, updateData, 1);
        return;
      // 魔王答題全對, 成功攻擊魔王
      case BrickBreakerAvatarUpdateType.HitBossSuccess:
        // 記錄成功對魔王七連擊的次數
        avatar.avatarData.bossHitSuccessCount++;
        // 魔王扣血
        this.attackBoss(avatar, updateData, avatar.getCorrectCount());
        return;
      // 魔王答題沒有全對, 表演被炸回家
      case BrickBreakerAvatarUpdateType.HitBossFailedBomb:
        // 回到重生點
        avatar.setPosition(avatar.avatarData.beginGridId);
        // 魔王扣血
        this.attackBoss(avatar, updateData, avatar.getCorrectCount());
        return;
      // 魔王答題沒有全對, 表演使用護盾
      case BrickBreakerAvatarUpdateType.HitBossFailedShield:
        // 消耗護盾
        avatar.useItem(BrickBreakerItemType.Shield);
        // 魔王扣血
        this.attackBoss(avatar, updateData, avatar.getCorrectCount());
        return;
      // 十字破壞周圍磚塊
      case BrickBreakerAvatarUpdateType.CrossBrickBreak:
        // 通知mapManager去十字破壞
        this.mapManager.crossBrickBreak(avatar.avatarData.targetGridId);
        return;
      // 獲得道具
      case BrickBreakerAvatarUpdateType.GetItem:
        const itemTableData = TableManager.brickBreakerItem.findOne(updateData.itemId);
        // 防呆
        if (itemTableData === undefined) {
          console.error('handleAvatarUpdate() item table data not found!');
          return;
        }
        // 獲得道具
        avatar.addItem(itemTableData);
        return;
      // 獲得道具(九宮格)
      case BrickBreakerAvatarUpdateType.GetItemAround:
        // 通知AvatarManager給附近九宮格的人派發道具
        return this.distributeItem(BrickBreakerItemType.Axe, EffectRangeType.Around, avatar.avatarData);
      // 獲得道具(全體)
      case BrickBreakerAvatarUpdateType.GetItemAll:
        // 通知AvatarManager給所有玩家派發道具
        return this.distributeItem(BrickBreakerItemType.Axe, EffectRangeType.All, avatar.avatarData);
      // 號角, 解凍全體
      case BrickBreakerAvatarUpdateType.Horn:
        // 找出所有結凍玩家
        const freezeAvatars = this.avatarManager.getFreezeAvatars();

        // 紀錄使用號角次數, 有成功解凍到人才算數
        if (freezeAvatars.length !== 0) {
          avatar.avatarData.hornCount++;
          // 解凍
          this.unfreezeAvatars(freezeAvatars, avatar.avatarData.uid);
        }
        return;
      // 使用道具
      case BrickBreakerAvatarUpdateType.UseItem:
        avatar.useItem(updateData.itemId);
        return;
      // 結凍
      case BrickBreakerAvatarUpdateType.Freeze:
        avatar.freeze();
        return;
      // 解凍
      case BrickBreakerAvatarUpdateType.Unfreeze:
        if (avatar.avatarData.userState === BrickBreakerAvatarState.Freeze) {
          avatar.setUserState(BrickBreakerAvatarState.Idle);
        }
        return;
      default:
        console.error(
          `handleAvatarUpdate() error, unexpected updateType ${BrickBreakerAvatarUpdateType[updateData.updateType]}`
        );
        return;
    }
  }

  /** 解凍avatars
   * @param unfreezeAvatars 解凍avatar清單
   * @param unfreezeByUid 使用號角者uid 0代表系統解凍
   */
  private unfreezeAvatars(unfreezeAvatars: BrickBreakerAvatar[], unfreezeByUid: number): void {
    const unfreezeUpdateData: BrickBreakerAvatarUpdateData = {
      updateType: BrickBreakerAvatarUpdateType.Unfreeze,
      itemId: 0,
      activatorUid: unfreezeByUid,
    };
    // 更新avatar資料
    unfreezeAvatars.forEach((freezeAvatar) => {
      this.handleAvatarUpdate(freezeAvatar, unfreezeUpdateData);
    });
    // 發送PTCL狀態更新(解凍)
    this.broadcastAvatarsUpdate(unfreezeAvatars, unfreezeUpdateData, []);
  }

  /** 攻擊魔王
   * @param updateData BrickBreakerAvatarUpdateData
   * @param correctCount 答對題數
   */
  private attackBoss(avatar: BrickBreakerAvatar, updateData: BrickBreakerAvatarUpdateData, correctCount: number): void {
    // 是否威力上升
    const isPowerUp = updateData.itemId === BrickBreakerItemType.Axe;
    if (isPowerUp) {
      avatar.useItem(BrickBreakerItemType.Axe);
    }
    // 攻擊
    const damage = this.boss.onAttackBoss(updateData.updateType, correctCount, isPowerUp);

    if (damage === 0) {
      return;
    }
    // 計算總傷害
    avatar.onBossDamage(damage);
    // 廣播魔王狀態更新
    this.broadcastBossUpdate();

    // 判斷遊戲結束
    if (this.boss.isDead()) {
      // 遊戲結束
      this.endGame();
    }
  }

  /** 派發道具
   * @param itemType 派發的道具類型
   * @param rangeType 派發的範圍類型
   * @param avatarData 派發事件的觸發者
   */
  public async distributeItem(
    itemType: BrickBreakerItemType,
    rangeType: EffectRangeType,
    avatarData: BrickBreakerAvatarData
  ): Promise<void> {
    // 找出目標格子
    const targetGridId = avatarData.targetGridId;
    // 排除觸發當事人, 觸發當事人的事件從reply那邊自行處理, 否則可能有非同步問題,
    // 因為底層rpc跟send是不同thread, 無法保證client端收到的順序, 有可能導致舊資料蓋到新資料
    const ignoreUid = avatarData.uid;

    // 取得對應item table data
    const itemTableData = TableManager.brickBreakerItem.findOne(itemType);
    // 防呆
    if (itemTableData === undefined) {
      console.error(
        'BrickBreakerAvatarManager.distributeItem() error, item table data not found! itemType: ' + itemType
      );
      return;
    }
    // 找出範圍內的成員名單
    const effectRangeAvatars = this.getEffectRangeAvatars(rangeType, targetGridId);
    // 派發道具
    effectRangeAvatars.forEach((avatar) => {
      avatar.addItem(itemTableData);
    });
    // 送狀態更新通知
    const updateData: BrickBreakerAvatarUpdateData = {
      updateType: BrickBreakerAvatarUpdateType.GetItem,
      itemId: itemType,
      activatorUid: avatarData.uid,
    };
    await this.broadcastAvatarsUpdate(effectRangeAvatars, updateData, [ignoreUid]);
    return;
  }

  /** 找出指定範圍avatars */
  private getEffectRangeAvatars(rangeType: EffectRangeType, targetGridId: number): BrickBreakerAvatar[] {
    const effectRangeAvatars: BrickBreakerAvatar[] = [];
    switch (rangeType) {
      case EffectRangeType.All:
        // 回傳所有avatar(除了ignoreUid)
        return this.avatarManager.getAllAvatar();
      case EffectRangeType.Around:
        // 找出符合條件的地圖格子
        const effectedGridIds = this.mapManager.getAroundGridId(targetGridId);
        // 找出站在指定格子上的人們
        return this.avatarManager.getRangeAvatars(effectedGridIds);
      default:
        console.error('getEffectRangeAvatars() error, unexpected rangeType: ' + rangeType);
        return effectRangeAvatars;
    }
  }

  /** 玩家答題
   * @param sn session
   * @param rpc rpc protocol
   */
  public onRPCBrickBreakerPlayerGetNextQuestion(sn: Session, rpc: RPCBrickBreakerPlayerGetNextQuestion): void {
    const uid = sn.getId();
    // 取得avatar
    const avatar = this.avatarManager.getAvatar(uid);
    if (avatar === undefined) {
      rpc.outResultType = GetNextQuestionResultType.GetAvatarFailed;
      sn.reply(rpc);
      return;
    }
    // 判斷上一題對錯, 並給出下一題
    const questionData = avatar.onGetNextQuestion(rpc.inAnswerInfo);

    // 回傳
    rpc.outResultType = GetNextQuestionResultType.Success;
    rpc.outQuestionData = questionData;
    sn.reply(rpc);
  }

  /** 玩家答題結束, 確認下一步動作
   * @param sn session
   * @param rpc rpc protocol
   */
  public async onRPCBrickBreakerPlayerAnswerFinished(
    sn: Session,
    rpc: RPCBrickBreakerPlayerAnswerFinished
  ): Promise<void> {
    const uid = sn.getId();
    // 取得avatar
    const avatar = this.avatarManager.getAvatar(uid);
    if (avatar === undefined) {
      rpc.isSuccess = false;
      sn.reply(rpc);
      return;
    }
    // 取得接下來的表演
    const updateData = avatar.onPlayerAnswerFinished();
    const isSuccess = updateData.updateType !== BrickBreakerAvatarUpdateType.ShowError;
    if (isSuccess) {
      // 根據結果更新avatarData
      await this.handleAvatarUpdate(avatar, updateData);
    }

    // 清空狀態
    avatar.clearState();

    // 回傳
    rpc.isSuccess = isSuccess;
    rpc.avatarUpdateData = updateData;
    rpc.avatarData = avatar.avatarData;
    sn.reply(rpc);

    // 通知其他人表演
    if (isSuccess) {
      this.broadcastAvatarsUpdate([avatar], updateData, [uid]);
    }
  }

  /** 通知client遊戲開始 */
  public broadcastGameStart(): Promise<boolean> {
    // 廣播封包給client
    const ptcl: PTCLGameStart = new PTCLGameStart();
    return this.roomBroadcast(ptcl);
  }

  /** 廣播avatar狀態更新
   * @param avatar 新的avatar資料
   * @param actionType 更新類型, 方便client判斷顯示用
   * @returns session send是否成功
   */
  private broadcastAvatarsUpdate(
    avatars: BrickBreakerAvatar[],
    updateData: BrickBreakerAvatarUpdateData,
    ignore: number[]
  ): Promise<boolean> {
    const avatarDataList: BrickBreakerAvatarData[] = [];
    for (const avatar of avatars) {
      avatarDataList.push(avatar.avatarData);
    }
    // 廣播封包給client
    const ptcl: PTCLBrickBreakerAvatarUpdate = new PTCLBrickBreakerAvatarUpdate();
    ptcl.updateData = updateData;
    ptcl.avatarDataList = avatarDataList;
    return this.roomBroadcast(ptcl, ignore);
  }

  /** 廣播魔王更新 */
  private async broadcastBossUpdate(ignore: number[] = []): Promise<void> {
    const ptcl: PTCLBrickBreakerBossUpdate = new PTCLBrickBreakerBossUpdate();
    ptcl.bossData = this.boss.getBossData();
    await this.roomBroadcast(ptcl, ignore);
    return;
  }

  /** 結束遊戲
   * @param isBossDead 魔王已死
   */
  public endGame(): void {
    // 防呆
    if (this.isGameEnd) {
      return;
    }
    this.isGameEnd = true;

    // 切換至GameEndState
    this.stateMachine.triggerEvent(BrickBreakerEventType.GameEnd);
  }

  /** GameEndState呼叫, 結算完成後, 送PTCL通知玩家, 並送http封包通知mssr結果 */
  public onGameEnd(): void {
    // 統計各種結算用資料
    this.avatarManager.onGameEnd();

    // 計算遊戲時長(秒)
    const gamePlaySec = (Date.now() - this.prepareStateEndAt) / 1000 + this.gamePrepareSec;

    // 廣播通知client做特殊表演
    const ptcl: PTCLBrickBreakerRankData = new PTCLBrickBreakerRankData();
    ptcl.rankData = this.avatarManager.getRpcRankData();
    ptcl.gamePlaySec = gamePlaySec;
    ptcl.bossTotalHp = this.boss.getBossData().totalHp;
    ptcl.bossHp = this.boss.getBossData().hp;
    ptcl.userAnswerDatas = this.avatarManager.getVueUserAnswerData();
    this.roomBroadcast(ptcl, []);

    // 送出結算
    const playerScoreList = this.avatarManager.getPlayerScoreList();
    const mvpList = this.avatarManager.getLogMvpList();
    const userAnswerLogDatas = this.avatarManager.getUserAnswerLogDatas();
    BrickBreakerMssrAgent.updateFinishGameLog(
      this.gameRoomId,
      this.contestId,
      playerScoreList,
      this.verifyCode,
      mvpList,
      userAnswerLogDatas,
      gamePlaySec,
      this.boss.getBossData().totalHp,
      this.boss.getBossData().hp
    );

    // 關閉房間
    this.finishGameRoom();
  }
}

/** 玩家進場階段 */
class PrepareState extends State<BrickBreakerGameLogic> {
  private endAt: number = 0;

  public onEnter(): void {
    this.getTarget().currentState = BrickBreakerStateType.Prepare;
    this.endAt = this.getTarget().prepareStateEndAt;
  }

  public onUpdate(delta?: number): void {
    if (Date.now() > this.endAt) {
      this.triggerEvent(BrickBreakerEventType.GameStart);
    }
  }
}

/** 連線成功後, 加入房間, 加入成功後進入Idle */
class GamingState extends State<BrickBreakerGameLogic> {
  public onEnter(): void {
    console.log(`Game ${this.getTarget().gameRoomId} start!`);

    this.getTarget().currentState = BrickBreakerStateType.Gaming;

    // 廣播開場封包給client
    this.getTarget().broadcastGameStart();
  }

  public onUpdate(delta?: number): void {
    if (Date.now() > this.getTarget().gameEndAt) {
      this.getTarget().endGame();
    }
  }
}

/** 在遊戲中Idle, 等一段隨機秒數後進入DrawDiceState */
class GameEndState extends State<BrickBreakerGameLogic> {
  public onEnter(): void {
    this.getTarget().currentState = BrickBreakerStateType.GameEnd;
    this.getTarget().onGameEnd();
  }

  public onUpdate(delta?: number): void {
    //
  }
}
