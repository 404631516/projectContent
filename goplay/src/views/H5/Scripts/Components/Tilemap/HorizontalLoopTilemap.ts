import { Scene } from 'phaser';
import Object2D from '../../Components/Object2D';
import BaseTilemap from './BaseTilemap';

/** 捲動方向 */
export enum ScrollDirection {
  /** 不捲動 */
  None,
  /** 地圖往右移動 */
  Right,
  /** 地圖往左移動 */
  Left,
}

/** 無限捲動模式 */
export enum ScrollInfiniteMode {
  /** 不開啟無限捲動模式，往左或往右都是直接走到底 */
  None,
  /** 往左或往右都是無限捲動，無法走到底 */
  TwoWay,
  /** 往右是無限捲動，往左走可走到底 */
  RightInfinity,
  /** 往左是無限捲動，往右走可走到底 */
  LeftInfinity,
}

/** 水平無限循環捲動地圖 */
export default class HorizontalLoopTilemap<T extends BaseTilemap> extends Object2D {
  // #region 原始地圖資料
  /** 中段地圖Keys，主要負責隨機排序及無限循環 */
  private middleMapKeys: string[] = [];
  /** 最左地圖Key，在無限循環模式TwoWay、OneWayLeft下，此地圖會被隱藏 */
  private leftmostMapKey!: string;
  /** 最右地圖Key，在無限循環模式TwoWay、OneWayRight下，此地圖會被隱藏 */
  private rightmostMapKey!: string;

  /** 將中段地圖、最左地圖、最右地圖等Key，包裝進getOriginMapKey函式 */
  private getMapKey(index: number): string {
    // 用-1取最左地圖資料
    if (index < 0) {
      return this.leftmostMapKey;
      // 用middleMaps最大長度取最右地圖資料
    } else if (index >= this.middleMapKeys.length) {
      return this.rightmostMapKey;
    } else {
      return this.middleMapKeys[index];
    }
  }
  // #endregion

  //#region 暫存資料
  /** 客製型別 T 的 constructor */
  private ctor: new (scene: Scene, x: number, y: number, ...args: any) => T;
  /** 用來無限循環的客製Tilemap Objects */
  private mapObjects: T[] = [];
  /** 儲存Tilemap  Objects對應到的順序位置 */
  private mapObjectIndexes: Map<T, number> = new Map<T, number>();

  /** 地圖移動方向 */
  private moveDir: ScrollDirection = ScrollDirection.None;

  /** 是否為無限捲動模式 */
  private infiniteMode: ScrollInfiniteMode = ScrollInfiniteMode.None;
  /** 是否要隨機排序地圖(頭尾除外) */
  private isShuffleMiddleMode: boolean = false;
  /** 下一張地圖載入最右邊那張 */
  private nextMapRightmost: boolean = false;
  /** 下一張地圖載入最左邊那張 */
  private nextMapLeftmost: boolean = false;
  /** 地圖寬度 */
  private mapWidth: number = 0;
  //#endregion

  //#region property
  /** 螢幕寬度 */
  private get screenWidth(): number {
    return this.scene.game.canvas.width;
  }

  /** 所有地圖Key(中段、最左、最右)的總數 */
  private get mapKeyCount(): number {
    return this.middleMapKeys.length + 2;
  }

  /** 被創建出的Tilemap Objects總數 */
  private get mapObjectCount(): number {
    // this.list用來存取HorizontalLoopTilemap的Child Objects
    return this.list.length;
  }

  /** 是否已抵達中段地圖的最左側 */
  private get isReachLeftmostOfMiddleMaps(): boolean {
    return this.mapObjectIndexes.get(this.leftmostMapObject) === 0;
  }

  /** 是否已抵達中段地圖的最右側 */
  private get isReachRightmostOfMiddleMaps(): boolean {
    return this.mapObjectIndexes.get(this.rightmostMapObject) === this.middleMapKeys.length - 1;
  }

  /** 左側物件是否已抵達最左地圖資料 */
  private get isReachLeftmostMap(): boolean {
    // 最左地圖的index已被包裝成 -1
    return this.mapObjectIndexes.get(this.leftmostMapObject) === -1;
  }

  /** 中間物件是否已抵達正中間地圖資料 */
  public get hasReachedCenterMap(): boolean {
    // 偶數時中間取靠左
    return (this.mapObjectIndexes.get(this.centerMapObject) ?? -1) >= Math.floor((this.middleMapKeys.length - 1) / 2);
  }

  /** 右側物件是否已抵達最右地圖資料 */
  private get isReachRightmostMap(): boolean {
    // 最右地圖的index已被包裝成 this.middleMaps.length
    return this.mapObjectIndexes.get(this.rightmostMapObject) === this.middleMapKeys.length;
  }

  /** 是否已抵達最右地圖資料的最右緣 */
  public get isReachEdgeOfRightmostMap(): boolean {
    // 是否已抵達最右地圖資料 且 地圖右緣小或等於螢幕右緣
    if (this.isReachRightmostMap && this.getTilemapObjectRight(this.rightmostMapObject) <= this.screenWidth) {
      return true;
    }

    return false;
  }

  /** 取得最左邊Tilemap Object */
  private get leftmostMapObject(): T {
    return this.mapObjects[0];
  }

  /** 取得正中間Tilemap Object(離螢幕中心點最近) */
  private get centerMapObject(): T {
    const centerX = this.scene.game.canvas.width / 2;

    let nearestDistance = Infinity;
    let center: T = this.leftmostMapObject;

    this.mapObjects.forEach((object: T) => {
      // object x orgin 是 0
      const distance = Math.abs(centerX - (object.x + this.mapWidth / 2));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        center = object;
      }
    });

    return center;
  }

  /** 取得最右邊Tilemap Object */
  private get rightmostMapObject(): T {
    return this.mapObjects[this.mapObjects.length - 1];
  }
  //#endregion

  /** 建構式
   * @param scene 遊戲主場景
   * @param ctor 客製型別 T 的 constructor
   * @param mapWidth 地圖寬度
   * @param x 初始位置，預設0
   * @param y 初始位置，預設0
   */
  constructor(
    scene: Scene,
    ctor: new (scene: Scene, x: number, y: number, ...args: any) => T,
    mapWidth: number,
    x?: number,
    y?: number
  ) {
    super(scene, x, y);
    this.ctor = ctor;
    this.mapWidth = mapWidth;
  }

  /** 初始化或重置LoopTilemaps
   * @param mapKeys 地圖key，頭跟尾會自動設定為起點與終點，若小於2則無法運作
   * @param isShuffleMiddle 是否將中斷地圖隨機排序
   * @param infiniteMode 無限循環模式設定
   */
  public resetList(
    mapKeys: string[],
    isShuffleMiddle: boolean = false,
    infiniteMode: ScrollInfiniteMode = ScrollInfiniteMode.None
  ): void {
    if (mapKeys.length < 2) {
      console.error('地圖數量(mapKeys)小於2，HorizontalLoopTilemap無法運作');
      return;
    }

    // 紀錄隨機排序模式
    this.isShuffleMiddleMode = isShuffleMiddle;
    // 如果中段地圖數量小或等於1，就不能隨機排序
    if (mapKeys.length <= 3 && this.isShuffleMiddleMode) {
      this.isShuffleMiddleMode = false;
      console.error('地圖(maps)數量太少，無法設置Shuffle模式');
    }

    // 紀錄無限循環模式
    this.infiniteMode = infiniteMode;
    // 如果中段地圖數量小或等於1，就不能無限循環
    if (mapKeys.length <= 3 && this.infiniteMode !== ScrollInfiniteMode.None) {
      this.infiniteMode = ScrollInfiniteMode.None;
      console.error('地圖(maps)數量太少，無法設置Shuffle模式');
    }

    // 原始地圖Key重置
    this.leftmostMapKey = mapKeys.shift()!;
    this.rightmostMapKey = mapKeys.pop()!;

    // 若設定isShuffleMiddleMode === true，則中段地圖會在產生地圖前先行隨機排序一次
    if (this.isShuffleMiddleMode === true) {
      mapKeys = Phaser.Utils.Array.Shuffle(mapKeys);
    }
    this.middleMapKeys = mapKeys;

    // Tilemap Object重置
    this.mapObjects = [];
    // 清除標記的Tilemap Object Index
    this.mapObjectIndexes.clear();

    // 累計寬度
    let sumWidth = 0;

    const count = Math.max(this.mapObjectCount, this.mapKeyCount);
    for (let i = 0; i < count; i++) {
      // 資料量超出HorizontalLoopTilemap的Child Objects數量
      if (i >= this.mapObjectCount) {
        // 超出螢幕所可以顯示的範圍, 不再生出新的Object
        if (sumWidth > this.screenWidth + this.mapWidth) {
          return;
        }

        // 生成新的Child Object至HorizontalLoopTilemap底下，預設tilemap為leftmostMap
        this.addObject(0, 0, this.ctor, this.leftmostMapKey);
      }

      // 取得Tilemap Object，清除舊有資料(clear)後添加至運作中mapObjects列表
      const tilemap = this.list[i] as T;
      this.mapObjects.push(tilemap);

      // 設定資料，地圖總數為this.middleMaps.length加上最左、最右
      if (i < this.mapKeyCount) {
        // 當設無限循環模式為不循環(None)、向右單方向循環(OneWayRight)時
        // HorizontalLoopTilemap會從leftmostMap開始捲動
        // 否則會從middleMaps的第1張地圖開始
        let index = i;
        if (this.infiniteMode === ScrollInfiniteMode.None || this.infiniteMode === ScrollInfiniteMode.RightInfinity) {
          index--;
        }

        // 以原始資料重置Tilemap Object，並記錄對應的index
        tilemap.resetTilemap(this.getMapKey(index));
        this.mapObjectIndexes.set(tilemap, index);
        tilemap.active = true;
      } else {
        tilemap.clear();
        tilemap.active = false;
      }

      // 設定tilemap x軸位置
      tilemap.setPositionXY(sumWidth);

      // 累加寬度
      sumWidth += this.mapWidth;
    }
  }

  /** 滾動地圖
   * @param deltaX 滾動量
   * @param deltaTime update提供的deltaTime，避免位移出現卡頓、順移等現象
   * @param scrollLimit 滾動量限制，每秒最高滾動量
   */
  public scroll(deltaX: number, deltaTime: number = 1000, scrollLimit: number = 15): void {
    // 過度滾動防呆
    deltaX = this.clampMovingDistance(deltaX);

    // 判斷移動方向
    if (deltaX === 0) {
      this.moveDir = ScrollDirection.None;
    } else if (deltaX > 0) {
      this.moveDir = ScrollDirection.Right;
    } else if (deltaX < 0) {
      this.moveDir = ScrollDirection.Left;
    }

    // 移動mapObjects位置
    if (this.moveDir !== ScrollDirection.None) {
      // 當客戶端過度卡頓，造成地圖進行大幅度移動時，限制其滾動量。
      const movingDistance = Phaser.Math.Clamp(deltaX * (deltaTime / 1000), -scrollLimit, scrollLimit);
      for (const tilemap of this.mapObjects) {
        tilemap.setPositionXY(tilemap.x + movingDistance);
      }
    }

    // 暫存
    const originalLeftmostObject = this.leftmostMapObject;
    const originalRightmostObject = this.rightmostMapObject;

    // 內容向左捲動
    if (this.moveDir === ScrollDirection.Left) {
      // 若最左側Tilemap Object還沒完全超出螢幕左緣，不做替換
      if (this.getTilemapObjectRight(originalLeftmostObject) >= 0) {
        return;
      }

      // 已抵達最右地圖資料，再往右沒有任何地圖，不做替換
      if (this.isReachRightmostMap === true) {
        return;
      }

      // 將originalLeftmostObject移到List最後
      this.mapObjects.shift();
      this.mapObjects.push(originalLeftmostObject);

      // 取得下一張要顯示的地圖資料index
      const rightmostObjectDataIndex = this.getTilemapObjectIndex(originalRightmostObject);
      const nextDataIndex = this.getNextDataIndex(rightmostObjectDataIndex);

      // 將originalLeftmostObject替換成新資料
      originalLeftmostObject.resetTilemap(this.getMapKey(nextDataIndex));

      // 標記所在Index
      this.mapObjectIndexes.set(originalLeftmostObject, nextDataIndex);

      // 將originalLeftmostObject位置移動至最底
      originalLeftmostObject.setPositionXY(this.getTilemapObjectRight(originalRightmostObject));
    } else if (this.moveDir === ScrollDirection.Right) {
      // 若最右側Tilemap Object還沒完全超出螢幕右緣，不做替換
      if (this.getTilemapObjectLeft(originalRightmostObject) <= this.screenWidth) {
        return;
      }

      // 已抵達最左地圖資料，再往左沒有任何地圖，不做替換
      if (this.isReachLeftmostMap === true) {
        return;
      }

      // 將originalRightmostObject移到List最前面
      this.mapObjects.pop();
      this.mapObjects.unshift(originalRightmostObject);

      // 取得下一張要顯示的地圖資料index
      const leftmostObjectDataIndex = this.getTilemapObjectIndex(originalLeftmostObject);
      const nextDataIndex = this.getNextDataIndex(leftmostObjectDataIndex);

      // 將originalRightmostObject替換成新資料
      originalRightmostObject.resetTilemap(this.getMapKey(nextDataIndex));

      // 標記所在Index
      this.mapObjectIndexes.set(originalRightmostObject, nextDataIndex);

      // 將originalRightmostObject位置移動至最前面
      originalRightmostObject.setPositionXY(this.getTilemapObjectLeft(originalLeftmostObject) - this.mapWidth);
    }
  }

  /** 根據情況限制移動量(ex: 移動至邊界等)
   * @param deltaX 原先移動量
   * @returns 修正後移動量
   */
  private clampMovingDistance(deltaX: number): number {
    // 如果可以一次顯示所有資料, 不滑動
    if (this.getTilemapObjectRight(this.rightmostMapObject) < this.screenWidth) {
      deltaX = 0;
    }

    // 檢查超出邊界
    if (deltaX < 0) {
      // 內容向左捲動，data捲到右緣，中止
      if (this.isReachRightmostOfMiddleMaps) {
        // 檢查滑動是否會超出
        if (this.getTilemapObjectRight(this.rightmostMapObject) + deltaX < this.screenWidth) {
          // 調整滾動量，避免破圖
          deltaX = this.screenWidth - this.getTilemapObjectRight(this.rightmostMapObject);
        }
      }
    } else {
      // 內容向右捲動，data捲到左緣，中止
      if (this.isReachLeftmostOfMiddleMaps) {
        // 檢查滑動是否會超出
        if (this.getTilemapObjectLeft(this.leftmostMapObject) + deltaX > 0) {
          // 調整滾動量，避免破圖
          deltaX = 0 - this.getTilemapObjectLeft(this.leftmostMapObject);
        }
      }
    }
    return deltaX;
  }

  /** 設置無限模式
   * @param infiniteMode 無限捲動的模式
   */
  public setInfiniteMode(mode: ScrollInfiniteMode): void {
    if (this.infiniteMode === mode) {
      return;
    }

    // 從右邊無限切換成不無限時，會直接跳到最右邊那張地圖
    if (this.infiniteMode === ScrollInfiniteMode.RightInfinity || this.infiniteMode === ScrollInfiniteMode.TwoWay) {
      this.nextMapRightmost = mode !== ScrollInfiniteMode.RightInfinity && mode !== ScrollInfiniteMode.TwoWay;
    }

    // 從左邊無限切換成不無限時，會直接跳到最左邊那張地圖
    if (this.infiniteMode === ScrollInfiniteMode.LeftInfinity || this.infiniteMode === ScrollInfiniteMode.TwoWay) {
      this.nextMapLeftmost = mode !== ScrollInfiniteMode.LeftInfinity && mode !== ScrollInfiniteMode.TwoWay;
    }

    this.infiniteMode = mode;
  }

  /** 設置隨機排序模式
   * @param isShuffleMiddle 是否開啟隨機排序模式
   */
  public setShuffleMiddleMode(isShuffleMiddle: boolean): void {
    this.isShuffleMiddleMode = isShuffleMiddle;
  }

  /** 取得要獲取的Tilemap Object右緣座標X
   * @param tilemapObject 要獲取的Tilemap Object
   * @returns x
   */
  private getTilemapObjectRight(tilemapObject: T): number {
    return tilemapObject.x + this.mapWidth;
  }

  /** 取得要獲取的Tilemap Object左緣座標X
   * @param tilemapObject 要獲取的Tilemap Object
   * @returns x
   */
  private getTilemapObjectLeft(tilemapObject: T): number {
    return tilemapObject.x;
  }

  /** 取得Tilemap Object排序Index
   * @param tilemapObject 要獲取的Tilemap Object
   * @returns Index
   */
  private getTilemapObjectIndex(tilemapObject: T): number {
    if (this.mapObjectIndexes.has(tilemapObject) === false) {
      console.error('HorizontalLoopTilemap.allTilemapIndex missing');
    }

    return this.mapObjectIndexes.get(tilemapObject) ?? 0;
  }

  /** 取得下一個DataIndex
   * @param currentIndex 目前DataIndex
   * @returns nextDataIndex
   */
  private getNextDataIndex(currentIndex: number): number {
    let nextDataIndex: number = 0;

    if (this.moveDir === ScrollDirection.Left) {
      nextDataIndex = currentIndex + 1;

      // 如果要載入最右邊那張
      if (this.nextMapRightmost === true) {
        this.nextMapRightmost = false;
        return this.middleMapKeys.length;
      }

      // 如果往右可以走到底(沒有無線捲動)，則直接回傳下一張地圖
      if (this.infiniteMode === ScrollInfiniteMode.None || this.infiniteMode === ScrollInfiniteMode.LeftInfinity) {
        return nextDataIndex;
      }

      // 如果為無限模式，且中段地圖已經輪過一遍
      if (nextDataIndex === this.middleMapKeys.length) {
        // 暫存目前地圖
        const currentOriginData = this.getMapKey(currentIndex);

        // 進行隨機排序
        if (this.isShuffleMiddleMode) {
          this.middleMapKeys = Phaser.Utils.Array.Shuffle(this.middleMapKeys);
        }

        // 重新從第1個開始循環
        nextDataIndex = 0;
        // 若剛好重複，與目前地圖為同一張則跳過
        if (currentOriginData === this.getMapKey(nextDataIndex)) {
          nextDataIndex += 1;
        }
      }
      return nextDataIndex;
    } else if (this.moveDir === ScrollDirection.Right) {
      nextDataIndex = currentIndex - 1;

      // 如果要載入最左邊那張
      if (this.nextMapLeftmost === true) {
        this.nextMapLeftmost = false;
        return -1;
      }

      // 如果往左可以走到底(沒有無線捲動)，則直接回傳下一張地圖
      if (this.infiniteMode === ScrollInfiniteMode.None || this.infiniteMode === ScrollInfiniteMode.RightInfinity) {
        return nextDataIndex;
      }

      // 如果為無限模式，且中段地圖已經輪過一遍
      if (nextDataIndex === -1) {
        // 暫存目前地圖
        const currentOriginData = this.getMapKey(currentIndex);

        // 進行隨機排序
        if (this.isShuffleMiddleMode) {
          this.middleMapKeys = Phaser.Utils.Array.Shuffle(this.middleMapKeys);
        }

        // 重新從倒數第2個開始循環
        nextDataIndex = this.middleMapKeys.length - 1;
        // 若剛好重複，與目前地圖為同一張則跳過
        if (currentOriginData === this.getMapKey(nextDataIndex)) {
          nextDataIndex -= 1;
        }
      }
      return nextDataIndex;
    }

    console.error('無法計算nextDataIndex');
    return 0;
  }
}
