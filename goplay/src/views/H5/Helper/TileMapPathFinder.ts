import DebugConfig from '../Games/BomberMan/Data/BomberManDebugConfig';

type Vector2 = Phaser.Math.Vector2;

/** 方向類型 */
export enum PathDirectionType {
  None = 0,
  Left,
  Right,
  Up,
  Down,
  UpLeft,
  UpRight,
  DownLeft,
  DownRight,
  Max,
}

/** 路徑中父層節點(上一步)資料 */
class ParentKeyData {
  /** 父層格子座標字串 */
  public parentKey = '';
  /** 父層格子座標 */
  public parentPosition!: Phaser.Math.Vector2;
}

/** 各遊戲需自行定義哪個Tile可走, 以及哪些tiles算是neighbors */
export interface PathFindStrategy {
  /** 該點可否行走 */
  isWalkableTile(tile: Phaser.Tilemaps.Tile): boolean;
  /** 檢查此格為牆壁
   * @param tilePosition 格子座標
   */
  isWallTile(tilePosition: Vector2): boolean;

  /** 取得某節點在地圖上的相鄰節點 */
  getNeighborTileXYArray(currentTileXY: Phaser.Math.Vector2): Phaser.Math.Vector2[];
}

export class TileMapPathFinder {
  /** 尋路次數上限 */
  private readonly FIND_PATH_TIME_MAX = 1000;

  /** 使用的巡路strategy, 決定鄰居定義、決定節點可否行走 */
  private pathStrategy: PathFindStrategy;

  /** 指定地圖的TilemapLayer */
  private tilemapLayer: Phaser.Tilemaps.TilemapLayer;

  /** 建構式
   * @param pathStrategy 使用的巡路strategy
   * @param tilemapLayer 指定地圖的TilemapLayer
   */
  constructor(pathStrategy: PathFindStrategy, tilemapLayer: Phaser.Tilemaps.TilemapLayer) {
    this.pathStrategy = pathStrategy;
    this.tilemapLayer = tilemapLayer;
  }

  /** 地磚格子座標 轉字串(ex:1_2)
   * @param tileX 格子座標x
   * @param tileY 格子座標y
   */
  private indexToText(tileX: number, tileY: number): string {
    return `${tileX}_${tileY}`;
  }

  /** 尋找路徑 (不算權重，因為會從短的路徑開始偵測，一旦到達就會反算路徑)
   * @param startTileXY 起點格子座標
   * @param targetTileXY 終點格子座標
   * @param groundLayer 地形的layer
   * @return 找到路徑格子座標陣列，尋路失敗時回傳[]
   */
  public findPath(startTileXY: Phaser.Math.Vector2, targetTileXY: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
    // 取得對應tile
    const targetTile = this.tilemapLayer.getTileAt(targetTileXY.x, targetTileXY.y);

    // 若玩家選了不存在的地磚，就不尋找路徑(EX: 地圖外區域，分數等等)
    if (targetTile == null) {
      if (DebugConfig.isLogMove) {
        console.log(`TileMapPathFinder.findPath: targetTile == null`);
      }
      return [];
    }

    // 若玩家選了不可走格子，就不尋找路徑(EX: 不可走地形，可摧毀牆)
    if (false === this.pathStrategy.isWalkableTile(targetTile)) {
      if (DebugConfig.isLogMove) {
        console.log(`TileMapPathFinder.findPath: targetTile is not walkable`);
      }
      return [];
    }

    const openQueue: Phaser.Math.Vector2[] = [];
    // 記錄 父節點map:  [鄰居idx] = {key:父層idx，pos:父層座標}
    const parentKeyMap: Map<string, ParentKeyData> = new Map();

    const startKey = this.indexToText(startTileXY.x, startTileXY.y);
    const targetKey = this.indexToText(targetTileXY.x, targetTileXY.y);

    // 將起點index座標放入
    const parentKeyData = new ParentKeyData();
    parentKeyData.parentKey = '';
    parentKeyData.parentPosition = new Phaser.Math.Vector2(-1, -1);
    parentKeyMap.set(startKey, parentKeyData);
    if (DebugConfig.isLogMove) {
      console.log(`add parentKeyMap, k=${startKey}, v.k=empty, v.v=-1,-1, size=${JSON.stringify(parentKeyMap.size)}`);
    }

    // 將 起點index座標 放入 開放列表
    openQueue.push(startTileXY);
    if (DebugConfig.isLogMove) {
      console.log(`openQueue=${JSON.stringify(openQueue)}`);
    }

    let findTime = 0;

    // 計算起點到終點的所有節點 (次數為可走區的格數)
    // 若open列表還有節點時，繼續找
    if (DebugConfig.isLogMove) {
      console.log(`finding`);
    }
    while (openQueue.length > 0) {
      if (findTime++ > this.FIND_PATH_TIME_MAX) {
        console.error(
          `findPath: search target, reach max time=${findTime}, please check solution, ` +
            `startTileXY=${JSON.stringify(startTileXY)}, targetTileXY=${JSON.stringify(targetTileXY)}`
        );
        return [];
      }

      // 取出/去除open列表的第一個
      const currentTilePos = openQueue.shift()!;
      const currentIndex = new Phaser.Math.Vector2(currentTilePos.x, currentTilePos.y);
      if (DebugConfig.isLogMove) {
        console.log(`openQueue=${JSON.stringify(openQueue)}`);
      }

      // 目前檢查的idx座標 (字串)
      const currentKeyInFind = this.indexToText(currentIndex.x, currentIndex.y);
      if (DebugConfig.isLogMove) {
        console.log(`currentKey=${currentKeyInFind}`);
      }

      // 若走到目標，中止
      if (currentKeyInFind === targetKey) {
        if (DebugConfig.isLogMove) {
          console.log(`found target`);
        }

        break;
      }

      // 鄰點的idx座標
      const neighbors = this.pathStrategy.getNeighborTileXYArray(currentIndex);

      // 依序檢查鄰點
      if (DebugConfig.isLogMove) {
        console.log(`check neighbors=${JSON.stringify(neighbors)}`);
      }
      for (const neighbor of neighbors) {
        // 取得鄰點的地磚
        const neighborTile = this.tilemapLayer.getTileAt(neighbor.x, neighbor.y);
        // 找不到鄰點
        if (neighborTile == null) {
          if (DebugConfig.isLogMove) {
            console.log(`neighbors no tile`);
          }
          continue;
        }

        // 若鄰點有牆壁 (起點有wall是可走的)
        if (false === this.pathStrategy.isWalkableTile(neighborTile)) {
          // 父節點/鄰格都是wall時，不要停止 (可以wall到wall)
          if (
            this.pathStrategy.isWallTile(currentIndex) === false ||
            this.pathStrategy.isWallTile(neighbor) === false
          ) {
            continue;
          }
        }

        const neiKey = this.indexToText(neighbor.x, neighbor.y);

        // 若鄰點是父節點(上一步)，不訪問
        if (parentKeyMap.has(neiKey)) {
          if (DebugConfig.isLogMove) {
            console.log(`neighbors is parent`);
          }
          continue;
        }

        // 記錄 [鄰居idx] = key:父層idx
        const parentKeyDataInFind = new ParentKeyData();
        parentKeyDataInFind.parentKey = currentKeyInFind;
        parentKeyDataInFind.parentPosition = new Phaser.Math.Vector2(currentIndex.x, currentIndex.y);
        parentKeyMap.set(neiKey, parentKeyDataInFind);
        if (DebugConfig.isLogMove) {
          console.log(
            `add parentKeyMap, k=${neiKey}, v.k=${currentKeyInFind} , v.v=${currentIndex.x},${currentIndex.y}` +
              `, size=${JSON.stringify(parentKeyMap.size)}`
          );
        }

        // 把鄰居記錄開放列表
        openQueue.push(neighbor);
        if (DebugConfig.isLogMove) {
          console.log(`openQueue=${JSON.stringify(openQueue)}`);
        }
      }
    }
    if (DebugConfig.isLogMove) {
      console.log(`parentKeyMap, size=${JSON.stringify(parentKeyMap.size)}`);
    }
    // console.log(`findPath: search target, findTime=${findTime}`);

    if (DebugConfig.isLogMove) {
      console.log(`clac path`);
    }
    // 記錄終點->起點的路徑
    const path: Phaser.Math.Vector2[] = [];

    // 先計算目的座標
    let currentKey = targetKey;
    if (DebugConfig.isLogMove) {
      console.log(`currentKey=${JSON.stringify(currentKey)}`);
    }
    // 若找不到key，表示無法到達的目標
    if (false === parentKeyMap.has(targetKey)) {
      if (DebugConfig.isLogMove) {
        console.log(`can't reach targetKey=${targetKey}!!!`);
      }
      return [];
    }

    // path第一個節點是終點
    let currentPos = new Phaser.Math.Vector2(targetTileXY.x, targetTileXY.y);

    findTime = 0;

    // 從終點反算到起點座標: 再依序計算 父節點map 上一步座標, 直到起點中止
    while (currentKey !== startKey) {
      if (findTime++ > this.FIND_PATH_TIME_MAX) {
        console.error(
          `findPath: calc target to start, reach max time, please check solution, ` +
            `startTileXY=${startTileXY}, targetTileXY=${targetTileXY}`
        );
        return [];
      }

      // 記錄到路徑座標
      path.push(currentPos);
      if (DebugConfig.isLogMove) {
        console.log(`add path=${JSON.stringify(path)}`);
      }

      // 若找不到key
      if (false === parentKeyMap.has(currentKey)) {
        console.error(`not found currentKey=${currentKey} in parentKeyMap`);
        return [];
      }
      // 取得上一步座標
      const keyData = parentKeyMap.get(currentKey);
      if (keyData == null) {
        console.error(`not found currentKey=${currentKey} in parentKeyMap`);
        return [];
      }
      currentKey = keyData.parentKey;
      currentPos = keyData.parentPosition;

      if (DebugConfig.isLogMove) {
        console.log(`next currentKey=${currentKey}, currentPos=${JSON.stringify(currentPos)}`);
      }
    }
    // console.log(`findPath: calc target to start, findTime=${findTime}`);

    if (DebugConfig.isLogMove) {
      console.log(`path=${JSON.stringify(path)}`);
    }

    // 將路徑反向(起點到終點)
    return path.reverse();
  }
}
