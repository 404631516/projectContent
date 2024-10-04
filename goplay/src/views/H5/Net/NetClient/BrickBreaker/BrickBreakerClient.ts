import { PTCLError } from '../../Netbase/Protocol';
import { Session } from '../../Netbase/Session';
import BaseClient from '../BaseClient/BaseClient';
import {
  BrickBreakerProtocolName,
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
  BrickBreakerAvatarData,
  BrickBreakerAvatarUpdateData,
  BrickBreakerAvatarUpdateType,
  BrickBreakerGrid,
} from '../../NetProtocol/BrickBreakerStructure';
import IBrickBreakerClient from './IBrickBreakerClient';

export default class BrickBreakerClient extends BaseClient<IBrickBreakerClient> {
  /** 房間玩家清單 */
  private avatarMap: Map<number, BrickBreakerAvatarData> = new Map<number, BrickBreakerAvatarData>();

  /** 場上所有地圖格子資料, index即gridId */
  private allGrid: BrickBreakerGrid[] = [];

  public mapHeight: number = 10;
  public mapWidth: number = 10;

  /** constructor
   * @param uid 玩家uid
   * @param clientInterface 對應的表演class, 需implements IBrickBreakerClient
   */
  constructor(socketServerUrl: string, token: string, clientInterface: IBrickBreakerClient) {
    super(socketServerUrl, token, clientInterface);
  }

  /** 註冊要監聽的Protocols */
  protected setHandlers(): void {
    super.setHandlers();
    this.app.setHandler(
      BrickBreakerProtocolName.PTCLBrickBreakerAvatarUpdate,
      this.onPTCLBrickBreakerAvatarUpdate.bind(this)
    );
    this.app.setHandler(
      BrickBreakerProtocolName.PTCLBrickBreakerGridUpdate,
      this.onPTCLBrickBreakerGridUpdate.bind(this)
    );
    this.app.setHandler(
      BrickBreakerProtocolName.PTCLBrickBreakerBossUpdate,
      this.onPTCLBrickBreakerBossUpdate.bind(this)
    );
    this.app.setHandler(
      BrickBreakerProtocolName.PTCLBrickBreakerPlayerReconnect,
      this.onPTCLBrickBreakerPlayerReconnect.bind(this)
    );
    this.app.setHandler(BrickBreakerProtocolName.PTCLBrickBreakerRankData, this.onPTCLBrickBreakerRankData.bind(this));
  }

  //#region 收到強聯網封包
  /** 玩家更新狀態 */
  private onPTCLBrickBreakerAvatarUpdate(sn: Session, ptcl: PTCLBrickBreakerAvatarUpdate): void {
    this.onAvatarUpdate(ptcl.updateData, ptcl.avatarDataList);
  }

  /** 地圖更新狀態 */
  private onPTCLBrickBreakerGridUpdate(sn: Session, ptcl: PTCLBrickBreakerGridUpdate): void {
    // 防呆, 還沒有設定this.allGrid的情況
    if (this.allGrid.length === 0) {
      // 報錯
      console.error('BrickBreakerClient.onGridUpdate() error, allGrid.length is 0');
      return;
    }
    // 依序更新grid
    for (const gridData of ptcl.gridArray) {
      const gridId = gridData.gridId;
      // 防呆
      if (gridId >= this.allGrid.length) {
        console.error(
          `BrickBreakerClient.onGridUpdate() error, gridId ${gridId}, allGrid.length ${this.allGrid.length}`
        );
        continue;
      }
      // 更新地圖資訊
      this.allGrid[gridId] = gridData;
      // 通知外部表演
      this.clientInterface.onGridUpdate(gridData);
    }
  }

  /** 地圖更新狀態 */
  private onPTCLBrickBreakerBossUpdate(sn: Session, ptcl: PTCLBrickBreakerBossUpdate): void {
    // 通知外部表演
    this.clientInterface.onBossUpdate(ptcl.bossData);
  }

  /** server通知玩家, 自己是斷線重連 */
  private onPTCLBrickBreakerPlayerReconnect(sn: Session, ptcl: PTCLBrickBreakerPlayerReconnect): void {
    // 通知外部表演
    this.clientInterface.onReconnect();
  }

  /** 收到結算排名資料 */
  private onPTCLBrickBreakerRankData(sn: Session, ptcl: PTCLBrickBreakerRankData): void {
    // 通知外部表演
    this.clientInterface.onRankData(ptcl);
  }
  //#endregion

  /** 取得玩家資訊
   * @param uid 玩家uid
   */
  public getPlayerInfo(uid: number): BrickBreakerAvatarData | undefined {
    return this.avatarMap.get(uid);
  }

  /** 取得全部玩家資訊 */
  public getAllPlayerInfo(): BrickBreakerAvatarData[] {
    return Array.from(this.avatarMap.values());
  }

  /** 取得地圖格子資訊 */
  public getGrid(gridId: number): BrickBreakerGrid {
    return this.allGrid[gridId];
  }

  //#region send rpc
  /** 取得地圖 */
  public async sendRPCBrickBreakerGetGameInfo(): Promise<RPCBrickBreakerGetGameInfo | PTCLError> {
    const result = await this.sendRPC(new RPCBrickBreakerGetGameInfo());
    // rpc防呆
    if (result instanceof PTCLError) {
      return result;
    }
    // 將遊戲地圖資訊存起來
    this.allGrid = result.allGridData;
    this.mapHeight = result.mapHeight;
    this.mapWidth = result.mapWidth;
    return result;
  }

  /** 取得房間現有玩家資訊 */
  public async sendRPCBrickBreakerGetAvatarDataList(): Promise<RPCBrickBreakerGetAvatarDataList | PTCLError> {
    const result = await this.sendRPC(new RPCBrickBreakerGetAvatarDataList());
    // rpc防呆
    if (result instanceof PTCLError) {
      return result;
    }
    // 處理收到的BrickBreakerAvatarUpdateData
    this.onAvatarUpdate(result.updateData, result.avatarDataList);
    return result;
  }

  /** 發送移動封包 */
  public async sendRPCMove(targetGridId: number): Promise<RPCBrickBreakerAvatarMove | PTCLError> {
    const rpc = new RPCBrickBreakerAvatarMove();
    rpc.inGridId = targetGridId;
    const result = await this.sendRPC(rpc);
    // rpc防呆
    if (result instanceof PTCLError) {
      return result;
    }
    // 更新avatarData
    if (result.outIsSuccess && result.outAvatarData) {
      this.avatarMap.set(result.outAvatarData.uid, result.outAvatarData);
    }
    return result;
  }

  /** 發送答題兼取題目封包
   * @param answerIndex 回答的選項index
   * @param usedSecond 花費秒數
   */
  public async sendRPCBrickBreakerPlayerGetNextQuestion(
    answerIndex: number,
    usedSecond: number
  ): Promise<RPCBrickBreakerPlayerGetNextQuestion | PTCLError> {
    const rpc = new RPCBrickBreakerPlayerGetNextQuestion();
    rpc.inAnswerInfo = {
      answerIndex,
      usedSecond,
    };
    return await this.sendRPC(rpc);
  }

  /** 通知server答題完畢, server回傳接下來要做的表演 */
  public async sendRPCBrickBreakerPlayerAnswerFinished(): Promise<RPCBrickBreakerPlayerAnswerFinished | PTCLError> {
    const rpc = new RPCBrickBreakerPlayerAnswerFinished();
    const result = await this.sendRPC(rpc);
    // rpc防呆
    if (result instanceof PTCLError) {
      return result;
    }
    // 更新avatarData
    if (result.avatarData) {
      this.avatarMap.set(result.avatarData.uid, result.avatarData);
    }
    return result;
  }
  //#endregion

  /** 處理收到的BrickBreakerAvatarUpdateData
   * @param updateData 更新類型
   * @param avatarDataList 要更新的avatarData清單
   */
  private onAvatarUpdate(updateData: BrickBreakerAvatarUpdateData, avatarDataList: BrickBreakerAvatarData[]): void {
    for (const avatarData of avatarDataList) {
      const uid = avatarData.uid;
      // 加入或更新玩家資訊
      if (
        updateData.updateType === BrickBreakerAvatarUpdateType.Join ||
        updateData.updateType === BrickBreakerAvatarUpdateType.AlreadyJoin ||
        this.avatarMap.has(uid)
      ) {
        // 更新玩家資訊
        this.avatarMap.set(uid, avatarData);
        // 通知外部表演
        this.clientInterface.onAvatarUpdate(updateData, avatarData);
      }
      // 收到不存在玩家的更新
      else {
        console.error(
          `handleAvatarUpdate() error, avatarData not found! uid = ${uid}, updateType: ${
            BrickBreakerAvatarUpdateType[updateData.updateType]
          }`
        );
      }
    }
  }

  /** 取得玩家當前能走的格子id
   * @param uid 玩家uid
   * @returns 能走的格子array
   */
  public getPossiblePositions(uid: number): number[] {
    const rtn: number[] = [];
    const playerInfo = this.getPlayerInfo(uid);
    // 防呆
    if (playerInfo === undefined) {
      console.error(`getPossiblePositions() error, uid ${uid} avataData undefined!`);
      return rtn;
    }
    // 取得合法十字格
    return this.getCrossGridId(playerInfo.currentGridId);
  }

  /** 根據gridId取得row
   * @param gridId
   */
  public getGridRow(gridId: number): number {
    return Math.floor(gridId / this.mapWidth);
  }

  /** 根據gridId取得column
   * @param gridId
   */
  public getGridColumn(gridId: number): number {
    return gridId % this.mapWidth;
  }

  //#region 尋找特定格子id array, 例如十字或九宮格
  /** 取得周圍十字格子編號
   * @param centerGridId 中心格子編號
   */
  public getCrossGridId(centerGridId: number): number[] {
    // 算出中心格子的行跟列
    const centerRow = this.getGridRow(centerGridId);
    const centerCol = this.getGridColumn(centerGridId);
    // 取上下左右
    const crossGridsRowCol: Array<{ row: number; col: number }> = [
      { row: centerRow - 1, col: centerCol },
      { row: centerRow + 1, col: centerCol },
      { row: centerRow, col: centerCol - 1 },
      { row: centerRow, col: centerCol + 1 },
    ];
    // 回傳九宮格內存在的格子
    return this.getExistGridIds(crossGridsRowCol);
  }

  /** 找出row & column合法的格子Id array
   * @param gridsRowCol <row,column> array
   * @returns 合法格子 gridId array
   */
  private getExistGridIds(gridsRowCol: Array<{ row: number; col: number }>): number[] {
    const existGridIds: number[] = [];
    // 逐一檢查對應行列的格子是否存在
    gridsRowCol.forEach((value) => {
      if (this.isGridExist(value.row, value.col)) {
        existGridIds.push(value.row * this.mapWidth + value.col);
      }
    });
    // 回傳行列合法的格子
    return existGridIds;
  }

  /** 對應行列的格子是否存在此地圖上(輸入之行列是否合法) */
  private isGridExist(row: number, column: number): boolean {
    if (row < 0 || row >= this.mapHeight) {
      return false;
    }
    if (column < 0 || column >= this.mapWidth) {
      return false;
    }
    return true;
  }
}
