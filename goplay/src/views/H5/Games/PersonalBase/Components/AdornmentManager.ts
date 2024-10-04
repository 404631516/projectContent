import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { AdornmentNumber } from '../Data/AdornmentConfig';
import { AdornmentFloorCellData, AdornmentRoomCellData } from '../Data/AdornmentInterface';
import { Scene } from 'phaser';
import TableManager, { AdornmentItemData } from '@/manager/TableManager';
import { CellRange, ILoopScroll } from '@/views/H5/Scripts/Components/LoopScroll/ILoopScroll';
import VerticalLoopScroll from '@/views/H5/Scripts/Components/LoopScroll/VerticalLoopScroll';
import AdornmentFloorCell from './AdornmentFloorCell';
import { AdornmentGameData } from '@/helper/interface/Game';
import { randomNumber } from '@/views/H5/Helper/MathHelper';

/** 裝飾物管理者 */
export default class AdornmentManager extends Object2D {
  //#region data
  /** singleton */
  private static _instance: AdornmentManager;
  public static get instance(): AdornmentManager {
    return this._instance;
  }

  /** 樓層無限循環清單
   * 層級:
   * 樓層 AdornmentFloorCell
   * ->房間 AdornmentRoomComponent
   * ->裝飾物 AdornmentComponent
   */
  private _floorLoopScroll!: VerticalLoopScroll<AdornmentFloorCellData>;
  public get floorLoopScroll(): VerticalLoopScroll<AdornmentFloorCellData> {
    return this._floorLoopScroll;
  }

  /** 點擊螢幕(拖曳樓層時) */
  public isMouseDownByDragFloor: boolean = false;
  /** 鎖定拖曳樓層 */
  public set isLockDragFloor(isLock: boolean) {
    this._floorLoopScroll.isForbidDrag = isLock;
  }

  //#endregion data

  /** 當前滑鼠位置 */
  private get currentMousePos(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.scene.input.activePointer.x, this.scene.input.activePointer.y);
  }

  constructor(scene: Scene) {
    super(scene);
    AdornmentManager._instance = this;

    // 滑鼠按下事件
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.floorLoopScroll.onTouchStart(this.currentMousePos);
    });

    // 滑鼠滑動事件
    this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
      // 拖曳樓層
      this.floorLoopScroll.onTouchMove(this.currentMousePos);
    });

    // 滑鼠放開事件
    this.scene.input.on(Phaser.Input.Events.POINTER_UP, () => {
      this.floorLoopScroll.onTouchEnd(this.currentMousePos);
    });
  }

  /** 初始化
   * @param gameData
   */
  public init(gameData: AdornmentGameData): void {
    // 建立樓層的無限循環清單

    // 樓層資料清單
    const floorCellList: AdornmentFloorCellData[] = [];
    // 全部樓層大小的參數
    const allFloorRangeList: CellRange[] = [];
    // 最大樓層
    let maxFloor: number = 0;
    // 樓層id -> 樓層無限捲軸資料 的map
    const floorCellMap = new Map<number, AdornmentFloorCellData>();

    // 已解鎖英雄
    const shuffleHeroList = Phaser.Math.RND.shuffle(gameData.heroList);

    // 抽選幾個房間的英雄數量
    const roomHeroList: number[][] = [];
    gameData.personalBaseList.forEach(() => {
      // 已沒有剩餘英雄了，數量填0
      if (shuffleHeroList.length <= 0) {
        roomHeroList.push([]);
        return;
      }
      // 每間房間抽選英雄的上限 (不超出擁有數)
      const slotHeroMaxCount = Math.min(AdornmentNumber.heroMaxCountPerRoom, shuffleHeroList.length);

      // 抽選英雄數量(0~max)
      const slotHeroCount = randomNumber(slotHeroMaxCount + 1);
      // 分配已解鎖英雄: 從第0個位置，切割數個英雄, 放到房間中
      roomHeroList.push(shuffleHeroList.splice(0, slotHeroCount));
    });

    // 再洗牌一次，決定每個已解鎖房間要生成hero數
    const shuffleRoomHeroList = Phaser.Math.RND.shuffle(roomHeroList);

    // 檢查每一個房間的靜態表
    const roomTableList = TableManager.adornmentRoom.getAll();
    roomTableList.forEach((roomTable) => {
      // 找出最大樓層
      if (roomTable.floor > maxFloor) {
        maxFloor = roomTable.floor;
      }

      let floorCellData = floorCellMap.get(roomTable.floor);
      // 沒有樓層資料，新建
      if (floorCellData == null) {
        const floorData: AdornmentFloorCellData = {
          roomCellDataList: [],
          isBottom: false,
        };
        floorCellData = floorData;
        floorCellMap.set(roomTable.floor, floorData);
      }

      // 找到該房間的裝飾物資料
      const dbAdornmentList = gameData.adornmentPositionList.get(roomTable.id) ?? [];

      // 是否已解鎖
      const isUnlock = gameData.personalBaseList.find((dbRoom) => dbRoom.farmMapId === roomTable.id) != null;

      // 已解鎖房間，填入英雄列表，並從清單移除
      let heroList: number[] = [];
      if (isUnlock) {
        heroList = shuffleRoomHeroList.pop() ?? [];
      }

      // 將房間加入樓層
      const roomCellData: AdornmentRoomCellData = {
        roomData: roomTable,
        putAdornmentList: dbAdornmentList,
        heroList,
      };
      floorCellData.roomCellDataList.push(roomCellData);
    });

    // 靜態表不可少填樓層
    if (floorCellMap.size < maxFloor) {
      console.error(
        `createRoomLoopList: miss floor data. floorCellMap.size=${floorCellMap.size} < maxFloor=${maxFloor}`
      );
      return;
    }

    // 整理各樓層的房間
    for (let floorID = maxFloor; floorID >= 1; floorID--) {
      const floorCell = floorCellMap.get(floorID);
      if (floorCell == null) {
        console.error(`createFloorLoopList: floorCell == null. id=${floorID}`);
        return;
      }

      // 排序房間清單
      floorCell.roomCellDataList.sort(this.compareRoomCellData);

      // 加入一個樓層的資料
      floorCellList.push(floorCell);

      const floorRange: CellRange = {
        cellWidth: 1,
        cellHeight: AdornmentNumber.roomHeight,
      };
      allFloorRangeList.push(floorRange);
    }

    // 加入最底層-空樓層
    const bottomFloorData: AdornmentFloorCellData = {
      roomCellDataList: [],
      isBottom: true,
    };
    floorCellList.push(bottomFloorData);

    // 最下層-樓層大小
    const bottomFloorRange: CellRange = {
      cellWidth: 1,
      cellHeight: AdornmentNumber.bottomFloorHeight,
    };
    allFloorRangeList.push(bottomFloorRange);

    // 建立房間的無限循環清單
    const iLoopScroll: ILoopScroll = {
      rightMargin: 0,
      bottomMargin: AdornmentNumber.scrollHeight,
      poolSize: 4,
      cellSpace: 0,
      cellRangeList: allFloorRangeList,
      scrollConfig: {
        classType: AdornmentFloorCell,
        runChildUpdate: true,
      } as Phaser.Types.GameObjects.Group.GroupConfig,
    };
    this._floorLoopScroll = new VerticalLoopScroll(this.scene, 0, 0, iLoopScroll);
    this._floorLoopScroll.resetList(floorCellList);

    // 無限循環捲到最下層
    this._floorLoopScroll.scrollToDataIndex(maxFloor);

    // 滑鼠滾輪事件
    this.scene.input.on(
      Phaser.Input.Events.POINTER_WHEEL,
      this.floorLoopScroll.onMouseWheel.bind(this.floorLoopScroll)
    );
  }

  /** 排序房間的比較函式(order: slot)
   * @param room1 陣列元素1
   * @param room2 陣列元素2
   */
  private compareRoomCellData(room1: AdornmentRoomCellData, room2: AdornmentRoomCellData): number {
    // order相同，不交換; 回傳-1，項目1會排在前面; 回傳1，項目1會排在後面
    return room1.roomData.slot - room2.roomData.slot;
  }

  /** 切換放置區域顯示
   * @param isEdit 是佈置模式
   * @param itemTableData 裝飾物靜態表
   */
  public switchPutItemArea(isEdit: boolean, itemTableData: AdornmentItemData): void {
    this._floorLoopScroll.loopCellList.forEach((cell) => {
      const floorCell = cell as AdornmentFloorCell;
      floorCell.switchPutItemArea(isEdit, itemTableData);
    });

    // 鎖定拖曳樓層
    this.isLockDragFloor = isEdit;
  }
}
