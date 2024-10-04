import { BrickBreakerGridImgType, BrickBreakerNumber, BrickBreakerString } from '../Data/BrickBreakerConfig';
import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import BrickBreakerGameDialog from '../Dialogs/BrickBreakerGameDialog';
import BrickBreakerGamePlayerManager from '../Components/Game/BrickBreakerGamePlayerManager';
import { MemberType, ServiceUserInfo, UserJoinGameResult } from '@/views/H5/Net/NetProtocol/CommonStructure';
import BrickBreakerClient from '@/views/H5/Net/NetClient/BrickBreaker/BrickBreakerClient';
import IBrickBreakerClient from '@/views/H5/Net/NetClient/BrickBreaker/IBrickBreakerClient';
import {
  BrickBreakerAvatarData,
  BrickBreakerAvatarUpdateData,
  BrickBreakerBossData,
  BrickBreakerGrid,
  BrickBreakerAvatarState,
  BrickBreakerEffectKey,
  BrickBreakerGameFinishStatus,
  BrickBreakerAvatarUpdateType,
  BrickBreakerGridEventType,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Config from '@/config/setting';
import GridManager from '../Components/Game/GridManager';
import BrickBreakerBackgroundDialog from '../Dialogs/BrickBreakerBackgroundDialog';
import InfoBox, { InfoBoxResponse } from '@/views/H5/Scripts/Components/InfoBox';
import { BrickBreakerGameData, BrickBreakerScoreList } from '@/helper/interface/Game';
import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import BrickBreakerRankDialog from '../Dialogs/BrickBreakerRankDialog';
import EnhancedCamera from '@/views/H5/Scripts/Components/Camera/EnhancedCamera';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import BrickBreakerTimerDialog from '../Dialogs/BrickBreakerTimerDialog';
import BrickBreakerEventMsgDialog from '../Dialogs/BrickBreakerEventMsgDialog';
import TableManager, { EffectData } from '@/manager/TableManager';
import { brickBreakerImgUrl } from '../Data/BrickBreakerResource';
import BrickBreakerEffectLayer from '../Components/Game/BrickBreakerEffectLayer';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import { PTCLDisconnectReason, PTCLError } from '@/views/H5/Net/Netbase/Protocol';
import { PTCLBrickBreakerRankData, RPCBrickBreakerAvatarMove } from '@/views/H5/Net/NetProtocol/BrickBreakerProtocol';
import ReconnectDialog from '../../UIHelper/ReconnectDialog';
import { formatSeconds } from '@/views/H5/Helper/MathHelper';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import BaseBrickBreakerStrategy, {
  BrickBreakerAttackStrategy,
  BrickBreakerBombStrategy,
  BrickBreakerCrossBrickBreakStrategy,
  BrickBreakerDefenseFailedBombStrategy,
  BrickBreakerDefenseFailedShieldStrategy,
  BrickBreakerDefenseSuccessStrategy,
  BrickBreakerDoNothingStrategy,
  BrickBreakerFreezeStrategy,
  BrickBreakerGetItemAllStrategy,
  BrickBreakerGetItemAroundStrategy,
  BrickBreakerGetItemStrategy,
  BrickBreakerHitBossFailedBombStrategy,
  BrickBreakerHitBossFailedShieldStrategy,
  BrickBreakerHitBossSuccessStrategy,
  BrickBreakerHitWallStrategy,
  BrickBreakerHornStrategy,
  BrickBreakerMoveStrategy,
  BrickBreakerOnlineStrategy,
  BrickBreakerShowErrorStrategy,
  BrickBreakerShurikenStrategy,
  BrickBreakerStartAnswerStrategy,
  BrickBreakerTeleportStrategy,
  BrickBreakerUnfreezeStrategy,
  BrickBreakerUseItemStrategy,
} from '../Components/BrickBreakerStrategy/BrickBreakerStrategy';
import { MessageBox } from 'element-ui';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import { IRoomWeb } from '../../Common/PhaserGameStrategy';

export default class BrickBreakerGameScene extends BaseGameScene implements IBrickBreakerClient {
  /** 倒數計時 */
  public declare timerDialog: BrickBreakerTimerDialog;

  /** 滑鼠滾輪縮放變動量 */
  private readonly wheelScaleDiff: number = 0.4;

  /** ui專用攝影機 */
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  /** 地圖區域專用攝影機 */
  public mapViewCamera!: EnhancedCamera;

  /** 全螢幕背景攝影機 */
  private bgCamera!: Phaser.Cameras.Scene2D.Camera;

  /** 玩家棋子manager */
  public playerManager!: BrickBreakerGamePlayerManager;

  /** 地圖 */
  public gridManager!: GridManager;

  /** 特效層, 特效在特效層表演, 在playerManager & gridManager之上 */
  public effectLayer!: BrickBreakerEffectLayer;

  /** BrickBreakerClientGameLogic */
  private brickBreakerClient!: BrickBreakerClient;

  /** 暫存特效靜態表 */
  public effectDataMap!: Map<BrickBreakerEffectKey, EffectData>;

  //#region Dialog
  /** 背景 */
  public backGroundDialog!: BrickBreakerBackgroundDialog;
  /** 主UI, 包含玩家個人資訊 */
  public gameDialog!: BrickBreakerGameDialog;
  /** 排名UI */
  private rankDialog!: BrickBreakerRankDialog;
  /** 全畫面觸發事件提示 */
  private eventMsgDialog!: BrickBreakerEventMsgDialog;
  //#endregion Dialog

  /** 玩家當前可否操作 */
  private isUserOperatable: boolean = false;
  private get isOperatable(): boolean {
    return this.eventMsgDialog.isHide() && this.isUserOperatable;
  }

  /** 玩家身分: 觀戰者/玩家 */
  private _memberType!: MemberType;
  public get memberType(): MemberType {
    return this._memberType;
  }

  /** 遊戲開始flag */
  private isGameStart = false;

  /** 遊戲結束flag */
  public isGameEnd = false;

  constructor(public gameData: BrickBreakerGameData, private gameWeb: IRoomWeb) {
    super({ key: 'BrickBreakerGameScene' });
  }

  async preload() {
    // ui攝影機
    this.uiCamera = this.cameras.main;

    // mapView攝影機，創建時設置攝影機渲染遊戲區域的位置
    this.mapViewCamera = new EnhancedCamera(this);

    // 全螢幕背景攝影機
    this.bgCamera = this.cameras.add();

    // 改變攝影機顯示順序 先 bgCamera 在來 gameViewCamera 在來才是 uiCamera
    this.cameras.cameras.reverse();

    // 開啟loading dialog
    const loadingDialog = UIManager.instance.openDialog(LoadingDialog, this);
    this.mapViewCamera.ignore(loadingDialog);
    this.bgCamera.ignore(loadingDialog);

    // 設定身分
    this._memberType = this.gameData.memberType;

    // load英雄大頭貼resources
    HeroManager.loadHeroImagesByImgType(this, HeroImgType.Head);
    // load英雄Idle & Walk圖片資源
    AnimationHelper.loadAllHeroSprite(this, CharacterAnimType.Idle);
    AnimationHelper.loadAllHeroSprite(this, CharacterAnimType.Walk);

    // load grid image resources
    for (let i = 0; i < BrickBreakerGridImgType.Max; ++i) {
      this.load.image(BrickBreakerString.GridImgKey + i, `${brickBreakerImgUrl}/grid/grid_${i.toString()}.png`);
    }

    // 取得特效靜態表
    const effects = TableManager.brickBreakerEffect.getAll();
    this.effectDataMap = new Map(effects.map((effectData: Readonly<EffectData>) => [effectData.id, effectData]));
    // 載入特效圖
    this.effectDataMap.forEach((effectData: EffectData) => {
      this.load.spritesheet(effectData.nameKey, `${brickBreakerImgUrl}/effect/${effectData.url}`, {
        frameWidth: effectData.frameSize,
        frameHeight: effectData.frameSize,
      });
    });

    // app
    const token = this.gameData.contestRoomUserToken;
    this.brickBreakerClient = new BrickBreakerClient(Config.socketServerUrl, token, this);

    // 傳遞Client讓Vue共用
    StoreHelper.$$store.commit('setBrickBreakerClient', this.brickBreakerClient);
    // on scene destroy, 強聯網disconnect
    this.events.on('destroy', () => {
      // 關閉vue視窗
      StoreHelper.$$store.commit('destroyBrickBreakerClient');
      StoreHelper.$$store.commit('setShowBrickBreakerQuiz', false);
      StoreHelper.$$store.commit('setShowBrickBreakerExplainDialog', false);
      StoreHelper.$$store.commit('setShowBrickBreakerScoreBoard', false);
    });
  }

  async create() {
    // 物件生成順序即render順序
    // BrickBreakerBackgroundDialog
    this.backGroundDialog = UIManager.instance.openDialog(BrickBreakerBackgroundDialog, this, false);
    this.mapViewCamera.ignore(this.backGroundDialog);
    this.uiCamera.ignore(this.backGroundDialog);

    // 地圖層
    this.gridManager = new GridManager(this);
    this.uiCamera.ignore(this.gridManager);
    this.bgCamera.ignore(this.gridManager);

    // 玩家層
    this.playerManager = new BrickBreakerGamePlayerManager(this);
    this.uiCamera.ignore(this.playerManager);
    this.bgCamera.ignore(this.playerManager);

    // 特效層
    this.effectLayer = new BrickBreakerEffectLayer(this);
    this.uiCamera.ignore(this.effectLayer);
    this.bgCamera.ignore(this.effectLayer);

    // BrickBreakerGameDialog
    this.gameDialog = UIManager.instance.openDialog(BrickBreakerGameDialog, this, false);
    this.mapViewCamera.ignore(this.gameDialog);
    this.bgCamera.ignore(this.gameDialog);

    // 排行Dialog
    this.rankDialog = UIManager.instance.openDialog(BrickBreakerRankDialog, this);
    this.mapViewCamera.ignore(this.rankDialog);
    this.bgCamera.ignore(this.rankDialog);

    // 倒數計時Dialog
    this.timerDialog = UIManager.instance.openDialog(BrickBreakerTimerDialog, this);
    this.mapViewCamera.ignore(this.timerDialog);
    this.bgCamera.ignore(this.timerDialog);

    // 觸發事件提示Dialog
    this.eventMsgDialog = UIManager.instance.openDialog(BrickBreakerEventMsgDialog, this);
    this.mapViewCamera.ignore(this.eventMsgDialog);
    this.bgCamera.ignore(this.eventMsgDialog);

    // 創建特效動畫
    this.effectDataMap.forEach((effectData: EffectData) => {
      AnimationHelper.createSpriteAnimFromEffectData(this, effectData);
    });

    // 鎖玩家操作
    this.setUserOperatable(false);

    // 等待強聯網連線完成
    const isConnectSuccess = await this.onNetAppConnected();
    if (isConnectSuccess === false) {
      return;
    }

    // 暫停接收廣播封包
    this.brickBreakerClient.pauseBroadcastProtocol();

    // 加入房間
    const joinGameResult = await this.playerJoinGame();
    if (joinGameResult === false) {
      return;
    }

    // 取得遊戲資訊
    const isGameStart = await this.getGameInfo();

    // 取得房間現有玩家資訊
    await this.getAvatarDataList();

    // 恢復接收廣播封包
    this.brickBreakerClient.resumeBroadcastProtocol();

    // 初始化攝影機
    this.initCamera();

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);

    // 若遊戲已開始, 觸發OnGameStart()
    if (isGameStart) {
      this.onGameStart();
    }
  }

  fixedUpdate(time: number, delta: number): void {
    this.playerManager.onUpdate();
    this.effectLayer.update();
  }

  //#region 強聯網建立連線, 取得開場資料
  /** 強聯網連線完成 */
  private async onNetAppConnected(): Promise<boolean> {
    // 建立連線
    const connectResult = await this.brickBreakerClient.startConnecting();
    if (connectResult === false) {
      const connectErrorMsg = Localization.getText(LocalKeyType.Common, 'errorMsg_UserJoinGameResult_ConnectFailed');
      console.error('netApp connect failed!');
      await this.onNetError(connectErrorMsg);
      return false;
    }

    return true;
  }

  /** 送出自己的個資, 要求加入房間 */
  private async playerJoinGame(): Promise<boolean> {
    // 自己的個資
    const playerInfo: ServiceUserInfo = {
      // uid, server端會再依照token裡的uid重新驗證
      uid: this.gameData.uid,
      name: this.gameData.name,
      school: this.gameData.school,
      heroId: this.gameData.heroListData.heroId,
      hid: this.gameData.heroListData.hid,
      // memberType, server端會再依照token裡的contestRoomUserId重新驗證
      memberType: this.gameData.memberType,
      // isOnline填假的, server會自行判斷
      isOnline: true,
    };

    // 要求加入房間
    const token = this.gameData.contestRoomUserToken;
    const joinGameResult = await this.brickBreakerClient.sendRPCPlayerJoinGame(token, playerInfo);

    // 加入房間成功
    if (joinGameResult === UserJoinGameResult.Success) {
      return true;
    }
    // 加入房間失敗
    else {
      const errorMsgKey = 'errorMsg_UserJoinGameResult_' + UserJoinGameResult[joinGameResult];
      const errorMsg = Localization.getText(LocalKeyType.Common, errorMsgKey);
      console.warn('netApp join game failed!');
      this.infoBoxWarnWithoutPause(errorMsg, '');
      this.onGameEnd();
      this.onCloseGame();
      return false;
    }
  }

  /** 加入房間後, 取得遊戲資訊
   * @returns isGameStart
   */
  private async getGameInfo(): Promise<boolean> {
    // 取得目前地圖狀況
    const result = await this.brickBreakerClient.sendRPCBrickBreakerGetGameInfo();
    // 防呆
    if (result instanceof PTCLError) {
      this.onPTCLError(result);
      return false;
    }

    console.log('mapId = ' + result.mapId);

    // 生成gridComponents
    this.gridManager.init(result.allGridData, result.mapHeight, result.mapWidth, result.bossData);

    /** 生成魔王位置提示 */
    this.effectLayer.init(result.bossData.bossId);

    // gameDialog.setBoss
    this.gameDialog.setBoss(result.bossData);

    // 計算遊戲開始時間及結束時間, 要考慮server跟client的時鐘誤差
    const now = Date.now();
    const gameStartAt = now - result.serverNow + result.gameStartAt;
    const gameEndAt = now - result.serverNow + result.gameEndAt;

    // timerDialog init
    this.timerDialog.setGameEndAt(gameEndAt);

    // 若還在準備階段
    if (now <= gameStartAt) {
      // 開啟準備階段vue
      StoreHelper.$$store.commit('setContestPlayerList', this.brickBreakerClient.getAllPlayerInfo());
      StoreHelper.$$store.commit('setMaxPlayerInRoom', result.playerMax);
      StoreHelper.$$store.commit('setGameStartCountDown', gameStartAt);
      StoreHelper.$$store.commit('setShowWaitingRoom', true);
    }

    return result.isGameStart;
  }

  /** 取得房間現有玩家資訊 */
  private async getAvatarDataList(): Promise<void> {
    const result = await this.brickBreakerClient.sendRPCBrickBreakerGetAvatarDataList();
    // 防呆
    if (result instanceof PTCLError) {
      this.onPTCLError(result);
      return;
    }
  }
  //#endregion

  /** 初始化攝影機 */
  private initCamera(): void {
    // 設置攝影機照射的地圖區域範圍, 範圍包含真正的地圖旁邊圍一圈的假格子
    const mapDisplayWidth = (this.gridManager.mapWidth + 2) * BrickBreakerNumber.GridWidth;
    const mapDisplayHeight = (this.gridManager.mapHeight + 2) * BrickBreakerNumber.GridHeight;
    // 若要寫漂亮的話, 可以先比對"地圖寬高比"與"gameScene寬高比"哪個比較大, 來決定mapViewCamera要照的範圍寬高
    // 目前假定地圖一定頂到螢幕上下緣, 以地圖高度推算攝影機要照的寬度
    const mapViewWidth = mapDisplayHeight * (this.game.canvas.width / this.game.canvas.height);
    const mapViewHeight = mapDisplayHeight;

    // 設置攝影機照射範圍
    this.mapViewCamera.setBounds(
      -(mapViewWidth - mapDisplayWidth) / 2,
      -BrickBreakerNumber.GridHeight, // 地圖上方的一排假格子高度
      mapViewWidth,
      mapViewHeight,
    );

    // 能看見整張地圖的最小縮放值(縮放值越小可以見得越多)
    let minZoom = this.game.canvas.width / mapViewWidth;

    if (minZoom > BrickBreakerNumber.MapViewMaxZoom) {
      console.error(`載入地圖寬高過小。mapDisplayWidth : ${mapDisplayWidth}、mapDisplayHeight : ${mapDisplayHeight}`);
      minZoom = BrickBreakerNumber.MapViewMaxZoom;
    }

    // 縮放地圖攝影機，一次看見所有Grid
    this.mapViewCamera.setZoom(minZoom);
    // 限制地圖滾輪縮放的範圍，不讓地圖顯示小於鏡頭，造成破圖的錯覺
    this.mapViewCamera.wheelComponent.setZoomRange(minZoom, BrickBreakerNumber.MapViewMaxZoom, this.wheelScaleDiff);

    // 獲取自己或觀戰時關注的玩家物件，並預設將攝影機聚焦
    if (this.memberType === MemberType.Player) {
      this.focusOnPlayer(0, false);
    }
  }

  //#region IBrickBreakerClient
  /** 斷線通知
   * @param reason 斷線原因
   */
  public async onDisconnected(reason: PTCLDisconnectReason): Promise<void> {
    // 遊戲正常結束就不用表演斷線
    if (this.isGameEnd) {
      return;
    }

    // 一般斷線
    if (reason === PTCLDisconnectReason.Normal) {
      await this.onNetError('遭遇強連網斷線');
    }
    // 特殊斷線
    else {
      // 顯示錯誤訊息視窗
      const msgKey = 'errorMsg_PTCLDisconnectReason_' + PTCLDisconnectReason[reason];
      const msg = Localization.getText(LocalKeyType.Common, msgKey);
      MessageBox.alert(msg, '');
      // 跳回首頁
      this.isGameEnd = true;
      this.onCloseGame();
    }
  }

  /** 斷線重連通知 */
  public onReconnect(): void {
    // 表演
    this.eventMsgDialog.showMsg(Localization.getText(LocalKeyType.Common, 'brickBreaker_onReconnect'));
  }

  /** 收到遊戲開始通知 */
  public async onGameStart(): Promise<void> {
    // 防呆重複觸發
    if (this.isGameStart === true) {
      return;
    }
    this.isGameStart = true;

    // 開始遊戲結束時間倒數
    this.timerDialog.startGameEndCountdown();
    // 解鎖玩家操作
    this.setUserOperatable(true);
  }

  /** 收到別的玩家的狀態更新 */
  public onAvatarUpdate(updateData: BrickBreakerAvatarUpdateData, avatarData: BrickBreakerAvatarData): void {
    // join流程
    if (
      updateData.updateType === BrickBreakerAvatarUpdateType.Join ||
      updateData.updateType === BrickBreakerAvatarUpdateType.AlreadyJoin
    ) {
      // 設定component座標到對應的格子上
      const gridComponent = this.gridManager.getGridComponent(avatarData.currentGridId);
      // 防呆, gridComponent undefine的情況
      if (gridComponent === undefined) {
        console.error(`onAvatarUpdate() error, gridComponent undefined!, currentGridId: ${avatarData.currentGridId}`);
        return;
      }
      // 更新UI上的玩家資料
      this.updateUIPlayerInfo(avatarData);
      // 創建新的playerComponent
      this.playerManager.onAvatarJoin(avatarData, gridComponent.x, gridComponent.y);

      // 若是自己, 可互動格子highlight
      if (avatarData.uid === this.gameData.uid) {
        const highlightGridIds = this.brickBreakerClient.getCrossGridId(avatarData.currentGridId);
        this.gridManager.setHighlightGrids(highlightGridIds);
      }
    }
    // avatar更新表演
    else {
      this.updateAvatar(updateData, avatarData, undefined, 0);
    }

    // 通知準備階段vue更新名單
    StoreHelper.$$store.commit('setContestPlayerList', this.brickBreakerClient.getAllPlayerInfo());
  }

  /** 收到地圖狀態更新 */
  public onGridUpdate(grid: BrickBreakerGrid): void {
    this.gridManager.onGridUpdate(grid);
  }

  /** 魔王資料更新 */
  public onBossUpdate(bossData: BrickBreakerBossData): void {
    // update bossInfo UI
    this.gameDialog.updateBossHp(bossData);
    // update boss component
    this.gridManager.onBossUpdate(bossData);
  }

  /** 收到結算資料 */
  public async onRankData(ptclRankData: PTCLBrickBreakerRankData): Promise<void> {
    // 把答題vue & 玩家清單vue關掉
    StoreHelper.$$store.commit('setShowBrickBreakerQuiz', false);
    StoreHelper.$$store.commit('setShowBrickBreakerScoreBoard', false);

    // 鎖玩家操作
    this.setUserOperatable(false);

    // 表演魔王死亡
    const isBossDead = ptclRankData.bossHp <= 0;
    if (isBossDead) {
      await this.gridManager.playBossDead();
      await this.eventMsgDialog.showMsg(Localization.getText(LocalKeyType.Common, 'brickBreaker_onDefeatBoss'));
    }
    // 表演時間到
    else {
      await this.eventMsgDialog.showTimeup();
    }

    // 取得所有玩家分數
    const avatarScoreDataMap = this.rankDialog.getAvatarScoreDataMap();
    const allAvatarDataWithScore = Array.from(avatarScoreDataMap.values());
    allAvatarDataWithScore.sort((a, b) => {
      return b.score - a.score;
    });

    // 計算分數排行
    const rankList: BrickBreakerScoreList[] = [];
    allAvatarDataWithScore.forEach((player, index) => {
      // 同分數則同排行
      const rankIndex = allAvatarDataWithScore.findIndex((player2) => player2.score === player.score);
      let rank = rankIndex !== -1 ? rankIndex + 1 : index + 1;
      // 若分數為0, 則rank = -1
      if (player.score === 0) {
        rank = -1;
      }
      // 填入顯示用資料格式
      const scoreList: BrickBreakerScoreList = {
        uid: player.uid,
        rank,
        school: player.school,
        name: player.name,
        score: player.score,
      };
      rankList.push(scoreList);
    });

    // 結算顯示格式
    const gameFinishStatus: BrickBreakerGameFinishStatus = {
      gamePlayTime: formatSeconds(ptclRankData.gamePlaySec),
      bossTotalHp: ptclRankData.bossTotalHp,
      bossHp: ptclRankData.bossHp,
    };

    // 開啟結算vue, 顯示MVP
    StoreHelper.$$store.commit('setContestRankList', rankList);
    StoreHelper.$$store.commit('setContestResultData', ptclRankData.rankData);
    StoreHelper.$$store.commit('setGameFinishStatus', gameFinishStatus);
    StoreHelper.$$store.commit('setAnswerRankList', ptclRankData.userAnswerDatas);
    this.onCloseGame();
  }

  /** 收到遊戲結束事件通知 */
  public async onGameEnd(): Promise<void> {
    // 防呆
    if (this.isGameEnd === true) {
      return;
    }
    this.isGameEnd = true;

    // 斷線
    this.brickBreakerClient.disconnect(PTCLDisconnectReason.Normal);
  }

  /** 關閉遊戲 */
  private onCloseGame(): void {
    this.pauseScene();

    this.gameWeb.onGameEnd();
  }
  //#endregion

  /** 嘗試取得對應uid的BrickBreakerAvatarData */
  public getPlayerInfo(uid: number): BrickBreakerAvatarData | undefined {
    return this.brickBreakerClient.getPlayerInfo(uid);
  }

  /** 聚焦在自己或觀戰時關注的玩家
   * @param duration 聚焦行動的持續時間，0會立即聚焦到目標
   * @param isFollow 是否在聚焦後持續跟隨物件
   */
  public async focusOnPlayer(duration: number, isFollow: boolean, isZoomIn: boolean = true): Promise<void> {
    // 是否zoomIn
    if (isZoomIn) {
      this.mapViewCamera.setZoom(BrickBreakerNumber.MapViewMaxZoom);
    }

    // 取得關注玩家playerComponent
    const focusPlayerComponent = this.playerManager.getPlayer(this.gameData.uid);
    // 無法取得關注玩家playerComponent
    if (focusPlayerComponent === undefined) {
      console.error(`focusOnPlayer() error, can't find playerComponent. self uid: ${this.gameData.uid}`);
      return;
    }

    // 聚焦目標
    this.mapViewCamera.pan(focusPlayerComponent.x, focusPlayerComponent.y, duration * 1000);
    // 等待聚焦完成
    await AsyncHelper.sleep(duration);
    // 聚焦後不跟隨
    if (isFollow === false) {
      return;
    }
    // 開始跟隨
    this.mapViewCamera.startFollow(focusPlayerComponent);
  }

  /** 不再聚焦於自己或觀戰時關注的玩家 */
  public stopFocusOnPlayer(): void {
    this.mapViewCamera.stopFollow();
  }

  /** avatar更新表演
   * @param updateData 更新類型
   * @param avatarData 玩家資料
   * @param gridEventType 觸發格子類型(僅 StartAnswer 會用到)
   * @param correctCount 答題正確數(僅 HitBossFailedBomb & HitBossFailedShield 會用到)
   * @param isInitiative 是否是主動觸發的更新事件(僅 GetItem 會用到)
   * @returns
   */
  private async updateAvatar(
    updateData: BrickBreakerAvatarUpdateData,
    avatarData: BrickBreakerAvatarData,
    gridEventType: BrickBreakerGridEventType | undefined,
    correctCount: number,
  ): Promise<void> {
    // 更新UI上的玩家資料
    this.updateUIPlayerInfo(avatarData);

    // 取得對應playerComponent
    const playerComponent = this.playerManager.getPlayer(avatarData.uid);
    if (playerComponent === undefined) {
      console.error('updateAvatar() error, playerComponent undefined');
      return;
    }
    // 更新playerComponent的avatar資料
    playerComponent.onAvatarUpdate(avatarData);

    // 取得對應strategy
    let strategy: BaseBrickBreakerStrategy;
    switch (updateData.updateType) {
      /** client端報錯 */
      case BrickBreakerAvatarUpdateType.ShowError:
        strategy = new BrickBreakerShowErrorStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.DoNothing:
        strategy = new BrickBreakerDoNothingStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.HitWall:
        strategy = new BrickBreakerHitWallStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Online:
        strategy = new BrickBreakerOnlineStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Move:
        strategy = new BrickBreakerMoveStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.StartAnswer:
        strategy = new BrickBreakerStartAnswerStrategy(playerComponent, updateData, avatarData, gridEventType);
        break;
      case BrickBreakerAvatarUpdateType.Attack:
        strategy = new BrickBreakerAttackStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.DefenseSuccess:
        strategy = new BrickBreakerDefenseSuccessStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.DefenseFailedBomb:
        strategy = new BrickBreakerDefenseFailedBombStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.DefenseFailedShield:
        strategy = new BrickBreakerDefenseFailedShieldStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Bomb:
        strategy = new BrickBreakerBombStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Teleport:
        strategy = new BrickBreakerTeleportStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.HitBossSuccess:
        strategy = new BrickBreakerHitBossSuccessStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.HitBossFailedBomb:
        strategy = new BrickBreakerHitBossFailedBombStrategy(playerComponent, updateData, avatarData, correctCount);
        break;
      case BrickBreakerAvatarUpdateType.HitBossFailedShield:
        strategy = new BrickBreakerHitBossFailedShieldStrategy(playerComponent, updateData, avatarData, correctCount);
        break;
      case BrickBreakerAvatarUpdateType.CrossBrickBreak:
        strategy = new BrickBreakerCrossBrickBreakStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Shuriken:
        strategy = new BrickBreakerShurikenStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Freeze:
        strategy = new BrickBreakerFreezeStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Horn:
        strategy = new BrickBreakerHornStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.Unfreeze:
        let useHornUserName = '';
        const useHornUid = updateData.activatorUid;
        // 若是自己被別人解凍, 做訊息提示表演
        if (useHornUid !== 0) {
          // 取得吹號角玩家資料
          const useHornAvatarData = this.getPlayerInfo(useHornUid);
          if (useHornAvatarData === undefined) {
            console.error(
              `BrickBreakerUnfreezeStrategy.showUpdateMessage() error,
              useHornAvatarData not found! uid = ${useHornUid}`,
            );
            this.infoBoxWarnWithoutPause(`解凍事件, 取得吹號角玩家資料失敗, 對象uid: ${useHornUid}`, '');
            return;
          }
          useHornUserName = useHornAvatarData.name;
        }
        strategy = new BrickBreakerUnfreezeStrategy(playerComponent, updateData, avatarData, useHornUserName);
        break;
      case BrickBreakerAvatarUpdateType.GetItem:
        strategy = new BrickBreakerGetItemStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.GetItemAround:
        strategy = new BrickBreakerGetItemAroundStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.GetItemAll:
        strategy = new BrickBreakerGetItemAllStrategy(playerComponent, updateData, avatarData);
        break;
      case BrickBreakerAvatarUpdateType.UseItem:
        strategy = new BrickBreakerUseItemStrategy(playerComponent, updateData, avatarData);
        break;

      default:
        console.error(
          `BrickBreakerGameScene.updateAvatar() error, unexpected updateType ${
            BrickBreakerAvatarUpdateType[updateData.updateType]
          }`,
        );
        return;
    }
    // showMsg
    if (playerComponent.isSelf) {
      await strategy.showUpdateMessage(this.eventMsgDialog);
    }
    // playerComponent表演
    await strategy.onAvatarUpdate(this);
  }

  /** 更新UI 玩家資料
   * @param avatarData 新的玩家資料
   */
  private updateUIPlayerInfo(avatarData: BrickBreakerAvatarData): void {
    // 若是個人資訊UI要顯示的人, 更新個人資訊UI
    if (avatarData.uid === this.gameData.uid && this.memberType === MemberType.Player) {
      this.gameDialog.updatePlayerInfo(avatarData);
    }
    // 通知rankDialog更新
    this.rankDialog.onAvatarDataUpdate(avatarData);
  }

  /** 開啟InfoBox warn且不暫停場景(但會關閉使用者操作)
   * @param message
   * @param title
   */
  public async infoBoxWarnWithoutPause(message: string, title: string): Promise<void> {
    this.setUserOperatable(false);
    await InfoBox.warn([], message, title);
    this.setUserOperatable(true);
  }

  /** 鎖上/解鎖 玩家操作
   * @param isUserOperatable 玩家是否可操作
   */
  public setUserOperatable(isUserOperatable: boolean): void {
    // 防呆, 遊戲已結束, 而某些表演的Promise完成後可能想解鎖玩家操作, 此時直接return
    if (isUserOperatable && this.isGameEnd) {
      return;
    }
    // 設定isUserOperatable
    this.isUserOperatable = isUserOperatable;
    // mapView攝影機開啟拖拉功能
    this.mapViewCamera.dragComponent.setLock(isUserOperatable === false);
    // mapView攝影機開啟滾輪縮放功能
    this.mapViewCamera.wheelComponent.setLock(isUserOperatable === false);
  }

  /** 經由UI觸發, 準備發送移動封包給server */
  public async onClickGrid(targetGridId: number): Promise<void> {
    // 防呆玩家操作
    if (this.isOperatable === false) {
      return;
    }
    // 觀戰者不可操作
    if (this.memberType === MemberType.Spectator) {
      return;
    }
    // 取得avatarData
    const uid = this.gameData.uid;
    const avatarData = this.brickBreakerClient.getPlayerInfo(uid);
    if (avatarData === undefined) {
      console.error('onClickGrid() error, avatarData undefined!');
      return;
    }
    // 若是點到自己所在的格子, return
    if (targetGridId === avatarData.currentGridId) {
      return;
    }
    // 防呆, 檢查可移動範圍
    const getPossiblePositions = this.brickBreakerClient.getPossiblePositions(uid);
    if (getPossiblePositions.includes(targetGridId) === false) {
      this.infoBoxWarnWithoutPause('超出可移動範圍', '');
      return;
    }
    // 防呆, 狀態是否答題中, 理論上不可能發生
    if (avatarData.userState === BrickBreakerAvatarState.Answering) {
      this.infoBoxWarnWithoutPause('答題中, 無法操作', '');
      return;
    }
    // 找出玩家playerComponent
    const selfPlayer = this.playerManager.getPlayer(uid);
    if (selfPlayer === undefined) {
      console.error('onClickGrid() error, could not find selfPlayer!');
      return;
    }

    // 鎖玩家操作
    this.setUserOperatable(false);

    // 檢查狀態是否冷凍
    if (avatarData.userState === BrickBreakerAvatarState.Freeze) {
      // 玩家playerComponent表演 狀態不可移動
      await selfPlayer.playUserStateNotMovable();
      this.setUserOperatable(true);
      return;
    }

    // Player敲磚表演
    const targetGridComponent = this.gridManager.onPlayerMove(targetGridId);
    // 判斷Grid有沒有可被破壞的磚塊，來決定要不要表演
    if (targetGridComponent.isPlayPlayerBreakAnim()) {
      selfPlayer.playBreakBrickTo(new Phaser.Math.Vector2(targetGridComponent.x, targetGridComponent.y));
    }

    // 送出RPC
    const result = await this.brickBreakerClient.sendRPCMove(targetGridId);
    // 處理回傳封包
    await this.handleRPCMove(result);
    // 可互動格子highlight
    this.gridManager.setHighlightGrids(this.brickBreakerClient.getPossiblePositions(uid));
    // 解鎖玩家操作
    this.setUserOperatable(true);
  }

  /** 處理sendRPCMove的回傳封包
   * @param result sendRPCMove的回傳封包
   */
  private async handleRPCMove(result: RPCBrickBreakerAvatarMove | PTCLError): Promise<void> {
    // 防呆
    if (result instanceof PTCLError) {
      this.onPTCLError(result);
      return;
    }
    // 若回傳移動失敗
    if (result.outIsSuccess === false) {
      // TODO RPCProtocol
      console.error('OnClickGridTryMove() error, result.outIsSuccess is false!');
      this.infoBoxWarnWithoutPause(`OnClickGridTryMove() error, result.outIsSuccess is false!`, '');
      return;
    }
    // 防呆, 既然isSuccess就一定有outAvatarData
    if (result.outAvatarData === undefined) {
      console.error('OnClickGridTryMove() error, result.outIsSuccess is true but outAvatarData undefined!');
      this.infoBoxWarnWithoutPause(
        `OnClickGridTryMove() error, result.outIsSuccess is true but outAvatarData undefined!`,
        '',
      );
      return;
    }

    // 表演遇到的格子事件
    await this.updateAvatar(result.outAvatarUpdateData, result.outAvatarData, result.outEventType, 0);
  }

  /** 點擊查看玩家清單按鈕 */
  public async onClickHowToPlayButton(): Promise<void> {
    // 防呆玩家操作
    if (this.isOperatable === false) {
      return;
    }
    // 鎖玩家操作
    this.setUserOperatable(false);
    // 開啟玩法說明vue
    StoreHelper.$$store.commit('setShowBrickBreakerExplainDialog', true);
    // pending until vue視窗關閉
    await AsyncHelper.pendingUntil(() => {
      return StoreHelper.$$store.state.BrickBreakerModule.isShowExplainDialog === false;
    });
    // 解鎖玩家操作
    this.setUserOperatable(true);
  }

  /** 點擊查看玩家清單按鈕 */
  public async onClickScoreBoardButton(): Promise<void> {
    // 防呆玩家操作
    if (this.isOperatable === false) {
      return;
    }
    // 鎖玩家操作
    this.setUserOperatable(false);
    // 開啟玩家清單vue
    StoreHelper.$$store.commit('setShowBrickBreakerScoreBoard', true);
    // pending until vue視窗關閉
    await AsyncHelper.pendingUntil(() => {
      return StoreHelper.$$store.state.BrickBreakerModule.isShowScoreBoard === false;
    });
    // 解鎖玩家操作
    this.setUserOperatable(true);
  }

  /** 點擊Locate按鈕, 鏡頭轉到玩家身上, 並顯示selfTag */
  public onClickLocateButton(): void {
    // 聚焦在目標玩家
    this.focusOnPlayer(0.6, false, false);
    // 取得關注玩家playerComponent
    const selfPlayerComponent = this.playerManager.getPlayer(this.gameData.uid);
    // 無法取得關注玩家playerComponent
    if (selfPlayerComponent === undefined) {
      console.error(`onClickLocateButton() error, can't find playerComponent. self uid: ${this.gameData.uid}`);
      return;
    }
    // selfTag pop表演
    selfPlayerComponent.selfTagPop(1.6);
  }

  /** 點擊查看玩家清單按鈕 */
  public async onClickSpectatorLeaveButton(): Promise<void> {
    // 跳到房間清單頁面
    this.onCloseGame();
  }

  /** 進行答題 */
  public async startAnswerQuestions(): Promise<void> {
    // 遊戲已結束防呆
    if (this.isGameEnd) {
      return;
    }
    // 以vuex通知, 開始答題
    StoreHelper.$$store.commit('setShowBrickBreakerQuiz', true);
    // 等待答題結束
    await AsyncHelper.pendingUntil(() => StoreHelper.$$store.state.BrickBreakerModule.isShowQuiz === false);

    // 遊戲已結束防呆
    if (this.isGameEnd) {
      return;
    }
    // 取得答題前的答對題數
    const oldSelfAvatarData = this.brickBreakerClient.getPlayerInfo(this.gameData.uid);
    if (oldSelfAvatarData === undefined) {
      console.error('startAnswerQuestions() get self avatarData failed!');
      return;
    }
    const oldCorrectCount = oldSelfAvatarData.correctCount;
    // 等待答題結束
    const result = await this.brickBreakerClient.sendRPCBrickBreakerPlayerAnswerFinished();
    // 防呆
    if (result instanceof PTCLError) {
      this.onPTCLError(result);
      return;
    }
    // 防呆
    if (result.isSuccess === false) {
      console.error('sendRPCBrickBreakerPlayerAnswerFinished() error, isSuccess is false!');
      return;
    }
    // 計算答對題數
    const newSelfPlayerInfo = this.brickBreakerClient.getPlayerInfo(this.gameData.uid);
    if (newSelfPlayerInfo === undefined) {
      console.error('startAnswerQuestions() get self avatarData failed!');
      return;
    }
    const correctCount = newSelfPlayerInfo.correctCount - oldCorrectCount;
    // avatar更新表演
    await this.updateAvatar(result.avatarUpdateData, result.avatarData, undefined, correctCount);
  }

  //#region 斷線重連
  /** 各rpc封包回傳為PTCLError時, 走斷線流程重新進入遊戲
   * @param ptclError PTCLError
   */
  private async onPTCLError(ptclError: PTCLError): Promise<void> {
    // 請玩家走斷線重連流程
    this.onNetError(`PTCLError message: ${ptclError.message}`);
  }

  /** 偵測到斷線, 詢問是否重新連線後, phaser重開
   * @param errorMsg 連線錯誤原因
   */
  private async onNetError(errorMsg: string): Promise<void> {
    // 關閉vue視窗
    StoreHelper.$$store.commit('setShowWaitingRoom', false);
    StoreHelper.$$store.commit('setShowBrickBreakerQuiz', false);
    StoreHelper.$$store.commit('setShowBrickBreakerExplainDialog', false);
    StoreHelper.$$store.commit('setShowBrickBreakerScoreBoard', false);

    // 限制玩家操作
    this.setUserOperatable(false);
    // 開啟loading UI
    const reconnectDialog = UIManager.instance.assureDialog(ReconnectDialog, this);
    this.mapViewCamera.ignore(reconnectDialog);
    this.bgCamera.ignore(reconnectDialog);
    // 等數秒, 短期內有網路就自動重連, 否則請玩家確認網路連線後手動重連
    const isAutoConnect = await this.brickBreakerClient.isAutoConnect();
    // 網路已恢復
    if (isAutoConnect) {
      this.gameWeb.onGameRestart();
      return;
    }
    // 網路未恢復
    else {
      // 顯示錯誤訊息
      if (errorMsg !== '') {
        await InfoBox.defaultMessage([this], errorMsg);
      }
      // 跳視窗, 請玩家檢查網路連線
      const message = Localization.getText(LocalKeyType.Common, 'brickBreaker_reconnect_failedMsg');
      const confirmBtn = Localization.getText(LocalKeyType.Common, 'brickBreaker_reconnect_confirmButton');
      const cancelBtn = Localization.getText(LocalKeyType.Common, 'brickBreaker_reconnect_cancelButton');
      const response = await InfoBox.customMessage([this], message, '', confirmBtn, cancelBtn, '');
      if (response === InfoBoxResponse.Confirm) {
        // 按確認, 再試一次
        this.onNetError('');
      } else {
        // 按取消, 結束遊戲
        this.onCloseGame();
      }
    }
  }
  //#endregion
}
