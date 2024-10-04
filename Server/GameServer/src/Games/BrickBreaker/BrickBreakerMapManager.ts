import TableManager from '../Table/TableManager';
import {
  BrickBreakerGrid,
  BrickBreakerGridType,
  BrickBreakerGridEventType,
  GridDestroyType,
} from '../../NetProtocol/BrickBreakerStructure';
import BrickBreakerHelper from './BrickBreakerHelper';
import mapJson1 from './Map/TankWarMap1.json';
import mapJson2 from './Map/TankWarMap2.json';
import mapJson3 from './Map/TankWarMap3.json';
import mapJson4 from './Map/TankWarMap4.json';
import mapJson5 from './Map/TankWarMap5.json';
import mapJson6 from './Map/TankWarMap6.json';
import mapJson7 from './Map/TankWarMap7.json';
import mapJson8 from './Map/TankWarMap8.json';
import mapJson9 from './Map/TankWarMap9.json';
import mapJson10 from './Map/TankWarMap10.json';

export default class BrickBreakerMapManager {
  /** 場上所有地圖格子資料, index即gridId */
  private allGrid: BrickBreakerGrid[] = [];

  /** 所有重生點位置 */
  private allRespawnPointGridId: number[] = [];

  /** 所有空地位置 */
  private allEmptyGridId: number[] = [];

  /** 要更新的grid, 累積一定時間後再用封包送出去一次更新 */
  private waitForUpdateGrids: BrickBreakerGrid[] = [];

  /** 區域解鎖條件人數
   * key: 玩家累積人數達多少時, value: 解鎖某個unlockAreaId
   */
  private unlockConditionMap = new Map<number, number>();

  private mapHeight: number = 0;
  private mapWidth: number = 0;

  private mapId: number = 1;
  public getMapId(): number {
    return this.mapId;
  }

  //#region init
  /** init
   * @param mapId 地圖id
   * @returns 是否成功init
   */
  public init(mapId: number): boolean {
    this.mapId = mapId;
    // 根據mapId取得地圖資料
    const mapData = this.getMapData(mapId);

    // 設定地圖資料
    this.mapHeight = mapData.height;
    this.mapWidth = mapData.width;
    // 防呆, 檢查格子數
    if (mapData.mapArray.length !== mapData.height * mapData.width) {
      console.error(
        `BrickBreakerMapManager.init() error, mapArray.length = ${mapData.mapArray.length}, height = ${mapData.height}, width = ${mapData.width}`
      );
      return false;
    }

    // 創建地圖
    for (let i = 0; i < mapData.mapArray.length; ++i) {
      const gridType = mapData.mapArray[i];
      // 防呆, 驗證BrickBreakerGridType
      const tableData = TableManager.brickBreakerGrid.findOne(gridType);
      if (tableData === undefined) {
        console.error(`BrickBreakerMapManager.init() error, gridType ${mapData.mapArray[i]} tableData not found!`);
        return false;
      }
      // 生成BrickBreakerGrid
      const grid: BrickBreakerGrid = {
        gridId: i,
        gridType,
        eventType: this.getGridEventType(gridType),
        isWaitForRegenerate: false,
        regenerateAt: 0,
        isDestroyPermenantly: false,
        unlockAreaId: mapData.unlockMapArray[i],
        isUnlock: false,
      };
      // 加入清單
      this.allGrid.push(grid);
      // 紀錄重生點位置
      if (gridType === BrickBreakerGridType.RespawnPoint) {
        this.allRespawnPointGridId.push(i);
      }
      // 紀錄空地位置
      if (gridType === BrickBreakerGridType.Empty) {
        this.allEmptyGridId.push(i);
      }
    }

    // 重生點位置排序規則, 重新依照解鎖地區順序排序
    this.allRespawnPointGridId.sort((gridIndexA, gridIndexB) => {
      return mapData.unlockMapArray[gridIndexA] - mapData.unlockMapArray[gridIndexB];
    });

    // 設定各解鎖區域對應的解鎖人數
    this.setUnlockConditionMap(mapData.unlockMapArray, this.allRespawnPointGridId);

    return true;
  }

  /** 根據地圖Id取得地圖資料
   * @param mapId 地圖Id
   */
  private getMapData(mapId: number): { mapArray: number[]; unlockMapArray: number[]; height: number; width: number } {
    // 依據mapId 取得map資料
    let mapData;
    switch (mapId) {
      case 1:
        mapData = mapJson1;
        break;
      case 2:
        mapData = mapJson2;
        break;
      case 3:
        mapData = mapJson3;
        break;
      case 4:
        mapData = mapJson4;
        break;
      case 5:
        mapData = mapJson5;
        break;
      case 6:
        mapData = mapJson6;
        break;
      case 7:
        mapData = mapJson7;
        break;
      case 8:
        mapData = mapJson8;
        break;
      case 9:
        mapData = mapJson9;
        break;
      case 10:
        mapData = mapJson10;
        break;
      default:
        console.error(`BrickBreakerMapManager.getMapData() error, unexpected mapId: ${mapId}`);
        mapData = mapJson2;
        break;
    }

    return {
      mapArray: mapData.layers[0].data ?? [],
      unlockMapArray: mapData.layers[1].data ?? [],
      height: mapData.layers[0].height,
      width: mapData.layers[0].width,
    };
  }

  /** 計算並設定 unlockConditionMap
   * @param unlockMapArray 所有地圖節點array(值為解鎖區域編號)
   * @param allRespawnPointGridId 所有重生點
   */
  private setUnlockConditionMap(unlockMapArray: number[], allRespawnPointGridId: number[]): void {
    // 計算每個解鎖區域有幾個重生點
    const allUnlockAreaPlayerCount = new Map<number, number>();
    allRespawnPointGridId.forEach((respawnPointGridId) => {
      // 取得此重生點對應的解鎖區域
      const unlockAreaId = unlockMapArray[respawnPointGridId];
      let respawnPointCount = allUnlockAreaPlayerCount.get(unlockAreaId);
      // 該解鎖區域的重生點數量+1
      if (respawnPointCount === undefined) {
        allUnlockAreaPlayerCount.set(unlockAreaId, 1);
      } else {
        allUnlockAreaPlayerCount.set(unlockAreaId, ++respawnPointCount);
      }
    });

    // 取得排序後的UnlockAreaId
    const allUnlockAreaId = Array.from(allUnlockAreaPlayerCount.keys());
    allUnlockAreaId.sort((a, b) => a - b);

    // 計算各unlockArea的解鎖條件人數
    let totalPlayerCount: number = 0;
    for (const unlockAreaId of allUnlockAreaId) {
      // 對應解鎖區域的解鎖人數 = 之前所有解鎖區域累積人數+1
      this.unlockConditionMap.set(totalPlayerCount + 1, unlockAreaId);
      // 人數向上累積
      const unlockAreaPlayerCount = allUnlockAreaPlayerCount.get(unlockAreaId);
      if (unlockAreaPlayerCount === undefined) {
        console.error('unlockAreaPlayerCount is undefined!! unlockAreaId = ' + unlockAreaId);
        break;
      }
      totalPlayerCount += unlockAreaPlayerCount;
    }
  }
  //#endregion

  /** update
   * @param allPlayerStandingGrid 所有有人站在上面的格子
   * @returns 需要廣播更新的格子
   */
  public update(allPlayerStandingGrid: number[]): BrickBreakerGrid[] {
    // 檢查格子重生
    // 篩選需要重生的格子
    const waitForRegenerateGrids = this.allGrid.filter((grid) => {
      return grid.isWaitForRegenerate;
    });

    const now = Date.now();
    // 檢查是否已符合重生條件, 若是, 則重生並廣播
    for (const grid of waitForRegenerateGrids) {
      // 排除上面有站人的格子
      if (allPlayerStandingGrid.includes(grid.gridId)) {
        continue;
      }
      // 防呆, 重生時間未到
      if (now < grid.regenerateAt) {
        continue;
      }

      // 格子重生
      grid.isWaitForRegenerate = false;
      grid.regenerateAt = 0;
      grid.eventType = this.getGridEventType(grid.gridType);

      // broadcast
      this.waitForUpdateGrids.push(grid);
    }

    // 複製waitForUpdateGrids以便回傳
    const rtn = [...this.waitForUpdateGrids];
    // waitForUpdateGrids清空
    this.waitForUpdateGrids = [];
    // 回傳需要發送update封包的格子
    return rtn;
  }

  /** 根據gridType決定觸發的eventType
   * @param gridType
   */
  private getGridEventType(gridType: BrickBreakerGridType): BrickBreakerGridEventType {
    switch (gridType) {
      // 空地, 直接走上去
      case BrickBreakerGridType.Empty:
        return BrickBreakerGridEventType.Move;
      // 可破壞磚塊, 從可能的隨機事件中骰一個回傳
      case BrickBreakerGridType.BreakableBrick1:
      case BrickBreakerGridType.BreakableBrick2:
      case BrickBreakerGridType.BreakableBrick3:
      case BrickBreakerGridType.DisposableBrick:
        return BrickBreakerHelper.instance.getBrickRandomEvent();
      // 不可破壞磚塊, 玩家停留在原地
      case BrickBreakerGridType.UnbreakableBrick1:
      case BrickBreakerGridType.UnbreakableBrick2:
      case BrickBreakerGridType.UnbreakableBrick3:
        return BrickBreakerGridEventType.UnbreakableBrick;
      // 遠程武器, 答題後攻擊魔王 */
      case BrickBreakerGridType.Attack:
        return BrickBreakerGridEventType.Attack;
      // 魔王觸手, 答題後防禦來自魔王的攻擊 */
      case BrickBreakerGridType.Defense:
        return BrickBreakerGridEventType.Defense;
      // 寶物, 直接獲得寶物 */
      case BrickBreakerGridType.Treasure:
        return BrickBreakerHelper.instance.getTreasureRandomEvent();
      // 寶箱, 答題後獲得寶物 */
      case BrickBreakerGridType.AnswerTreasure:
        return BrickBreakerGridEventType.AnswerTreasure;
      // 出生點 */
      case BrickBreakerGridType.RespawnPoint:
        return BrickBreakerGridEventType.Move;
      // 魔王 */
      case BrickBreakerGridType.Boss:
        return BrickBreakerGridEventType.Boss;
      default:
        console.error('BrickBreakerMapManager.getEventType() error, unexpected gridType: gridData.gridType');
        return BrickBreakerGridEventType.UnbreakableBrick;
    }
  }

  /** 取得地圖高 */
  public getMapHeight(): number {
    return this.mapHeight;
  }

  /** 取得地圖寬 */
  public getMapWidth(): number {
    return this.mapWidth;
  }

  /** 取得地圖重生點數量 */
  public getPlayerRespawnPointCount(): number {
    return this.allRespawnPointGridId.length;
  }

  /** 取得玩家重生點位置
   * @param playerIndex 玩家編號(此玩家是第幾個加入遊戲的)
   */
  public getPlayerRespawnPoint(playerIndex: number): number {
    // 根據使用者加入順序, 決定重生點
    const respawnPointIndex = playerIndex % this.allRespawnPointGridId.length;
    // 回傳重生點gridId
    return this.allRespawnPointGridId[respawnPointIndex];
  }

  /** 若人數達到要求條件, 則解鎖地圖區域
   * @param playerCount 當前玩家總數
   */
  public tryUnlockArea(playerCount: number): void {
    const unlockAreaId = this.unlockConditionMap.get(playerCount);
    if (unlockAreaId === undefined) {
      return;
    }
    // 解鎖地圖
    this.allGrid.forEach((grid) => {
      if (grid.unlockAreaId === unlockAreaId) {
        grid.isUnlock = true;
        // broadcast格子更新
        this.waitForUpdateGrids.push(grid);
      }
    });
  }

  /** 取得當前整張地圖 */
  public getAllGrid(): BrickBreakerGrid[] {
    return this.allGrid;
  }

  /** 檢查使用者所在位置是否可觸發目標grid
   * @param userPosition 使用者所在位置
   * @param targetGridId 目標grid
   * @returns 是否可觸發
   */
  public isGridDistanceTriggerable(userPosition: number, targetGridId: number): boolean {
    // 取得合法十字格
    const crossGridIds = this.getCrossGridId(userPosition);
    // 其中是否包含targetGridId
    return crossGridIds.includes(targetGridId);
  }

  /** 根據gridId取得對應row
   * @param gridId
   */
  private getGridRow(gridId: number): number {
    return Math.floor(gridId / this.mapWidth);
  }

  /** 根據gridId取得對應column
   * @param gridId
   */
  private getGridColumn(gridId: number): number {
    return gridId % this.mapWidth;
  }

  /** 取得瞬移目標gridId */
  public getTeleportTargetGridId(): number {
    // 找出已解鎖區域中的空地
    const unlockEmptyGridIds: number[] = [];
    this.allEmptyGridId.forEach((emptyGridId) => {
      const emptyGrid = this.allGrid[emptyGridId];
      if (emptyGrid.isUnlock) {
        unlockEmptyGridIds.push(emptyGridId);
      }
    });
    // 隨機骰index
    const randomIndex = Math.floor(Math.random() * unlockEmptyGridIds.length);
    // 回傳
    return unlockEmptyGridIds[randomIndex];
  }

  /** 玩家觸發格子事件
   * @param gridId 觸發的格子gridId
   * @returns 觸發的格子&事件類型
   */
  public triggerGrid(gridId: number): { gridType: BrickBreakerGridType; eventType: BrickBreakerGridEventType } {
    let gridType = BrickBreakerGridType.Empty;
    let eventType = BrickBreakerGridEventType.TriggerFailed;
    const grid = this.allGrid[gridId];
    if (grid === undefined) {
      return { gridType, eventType };
    }
    // 若本格子處在未解鎖區域, 則視作不可破壞牆壁處理
    if (grid.isUnlock === false) {
      eventType = BrickBreakerGridEventType.UnbreakableBrick;
      return { gridType, eventType };
    }
    // 若本格子已被觸發過, 並還沒重生, 則當作空地處理
    if (grid.isWaitForRegenerate) {
      eventType = BrickBreakerGridEventType.Move;
      return { gridType, eventType };
    }
    // 若本格子已被觸發過, 並不會重生, 則當作空地處理
    if (grid.isDestroyPermenantly) {
      eventType = BrickBreakerGridEventType.Move;
      return { gridType, eventType };
    }

    // 破壞格子
    this.destroyGrid(grid);

    // broadcast格子更新
    this.waitForUpdateGrids.push(grid);

    // 回傳觸發的格子及事件類型
    gridType = grid.gridType;
    eventType = grid.eventType;
    return { gridType, eventType };
  }

  /** 破壞附近十字的格子
   * @param centerGridId 十字的中心
   */
  public crossBrickBreak(centerGridId: number): void {
    // 找出周圍十字格子
    const crossGridIds = this.getCrossGridId(centerGridId);
    // 找出對應格子, 若為磚塊則破壞
    for (const gridId of crossGridIds) {
      const grid = this.allGrid[gridId];
      switch (grid.gridType) {
        case BrickBreakerGridType.BreakableBrick1:
        case BrickBreakerGridType.BreakableBrick2:
        case BrickBreakerGridType.BreakableBrick3:
        case BrickBreakerGridType.DisposableBrick:
          const isDestroySuccess = this.destroyGrid(grid);
          if (isDestroySuccess) {
            this.waitForUpdateGrids.push(grid);
          }
          break;
        default:
          break;
      }
    }
  }

  /** 破壞格子
   * @param grid 破壞目標
   * @returns 是否成功破壞
   */
  private destroyGrid(grid: BrickBreakerGrid): boolean {
    // 防呆
    if (grid === undefined) {
      return false;
    }
    if (grid.isUnlock === false) {
      return false;
    }
    if (grid.isWaitForRegenerate) {
      return false;
    }
    if (grid.isDestroyPermenantly) {
      return false;
    }
    const gridTableData = TableManager.brickBreakerGrid.findOne(grid.gridType);
    // 防呆, 不可能有這種情況, 因為map init時有驗證過了
    if (gridTableData === undefined) {
      console.error(`BrickBreakerMapManager.destroyGrid() error, gridType ${grid.gridType} tableData not found!`);
      return false;
    }

    // 根據格子破壞類型決定要做的處理
    switch (gridTableData.gridDestroyType) {
      case GridDestroyType.Regenerate:
        // 格子設為已觸發, 計算重生時間
        grid.isWaitForRegenerate = true;
        grid.regenerateAt = Date.now() + gridTableData.regenerateTime * 1000;
        return true;
      case GridDestroyType.DestroyPermenantly:
        // 一次性磚塊的hasDestroyed設為true
        grid.isDestroyPermenantly = true;
        return true;
    }
    return false;
  }

  //#region 尋找特定格子id array, 例如十字或九宮格
  /** 取得周圍十字格子編號
   * @param centerGridId 中心格子編號
   */
  private getCrossGridId(centerGridId: number): number[] {
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

  /** 取得周圍九宮格格子編號
   * @param centerGridId 中心格子編號
   */
  public getAroundGridId(centerGridId: number): number[] {
    // 算出中心格子的行跟列
    const centerRow = this.getGridRow(centerGridId);
    const centerCol = this.getGridColumn(centerGridId);
    // 取九宮格
    const aroundGridsRowCol: Array<{ row: number; col: number }> = [
      { row: centerRow - 1, col: centerCol - 1 },
      { row: centerRow - 1, col: centerCol },
      { row: centerRow - 1, col: centerCol + 1 },
      { row: centerRow, col: centerCol - 1 },
      { row: centerRow, col: centerCol + 1 },
      { row: centerRow + 1, col: centerCol - 1 },
      { row: centerRow + 1, col: centerCol },
      { row: centerRow + 1, col: centerCol + 1 },
    ];
    // 回傳九宮格內存在的格子
    return this.getExistGridIds(aroundGridsRowCol);
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

  /** 對應行列的格子是否存在此地圖上(輸入之行列是否合法)
   * @param row
   * @param column
   */
  private isGridExist(row: number, column: number): boolean {
    if (row < 0 || row >= this.mapHeight) {
      return false;
    }
    if (column < 0 || column >= this.mapWidth) {
      return false;
    }
    return true;
  }
  //#endregion
}
