import TableManager, { AdornmentItemData, AdornmentRoomData } from '@/manager/TableManager';
import {
  AdornmentNumber,
  AdornmentString,
  AdornmentRoomSizeType,
  AdornmentRoomUnlockType,
} from '../Data/AdornmentConfig';
import { AdornmentRoomCellData, DropAdornmentData } from '../Data/AdornmentInterface';
import AdornmentComponent from './AdornmentComponent';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import AdornmentHero from './AdornmentHero';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import { AdornmentType } from '@/helper/enum/Adornment';
import { randomNumber, randomRange } from '@/views/H5/Helper/MathHelper';
import { Scene } from 'phaser';
import AdornmentGameScene from '../Scenes/AdornmentGameScene';

/** 房間內裝飾物相關物件 */
interface AdornmentUnit {
  /** 裝飾物 */
  adornmentComponent: AdornmentComponent;
  /** 拖放區圖片 */
  dropZoneImage: Phaser.GameObjects.Image;
  /** 可拖放區加號圖 */
  canDropPlusImage?: Phaser.GameObjects.Image;
  /** 拖放區域 */
  dropZone: Phaser.GameObjects.Zone;
}

/** 樓層內的 房間元件 */
export default class AdornmentRoomComponent extends Object2D {
  //#region UI參數
  /** 可解鎖提示 位置 */
  private readonly unlockHintPositionY: number = -38;
  /** 可解鎖提示-鎖頭 位置 */
  private readonly unlockHintLockPositionY: number = -20;
  /** 可解鎖提示-文字 位置 */
  private readonly unlockHintTextPositionY: number = 60;
  /** 不可解鎖提示 位置 */
  private readonly noUnlockHintPositionY: number = -38;
  /** 不可解鎖提示-文字 位置 */
  private readonly noUnlockHintTextPositionY: number = 60;
  /** 已解鎖動畫 位置 */
  private readonly unlockAnimatPositionY: number = -100;
  /** 已解鎖動畫-文字 偏移 */
  private readonly unlockAnimatTextOffsetY: number = 30;
  /** 已解鎖動畫 持續時間(ms) */
  private readonly unlockAnimatDuration: number = 2000;
  /** 已解鎖動畫 放大倍率 */
  private readonly unlockAnimatScale: number = 1.5;

  /** 英雄移動時間倍率 */
  private get randomMoveDurationRatio(): number {
    return 8 * (1 + Math.random() * 0.5);
  }
  //#endregion UI參數

  //#region data
  /** 已放置裝飾物map
   * key: 地圖索引
   * value: 裝飾物元件 */
  private adornmentMap: Map<number, AdornmentUnit> = new Map<number, AdornmentUnit>();
  /** 裝飾物分類map */
  private rowMap: Map<AdornmentType, AdornmentComponent[]> = new Map<AdornmentType, AdornmentComponent[]>();

  /** 房間資料-靜態表 */
  private roomTableData!: AdornmentRoomData;
  /** 可解鎖提示 */
  private canUnlockHintNode!: Object2D;
  /** 不可解鎖提示 */
  private noUnlockHintNode!: Object2D;
  /** 已解鎖提示 */
  private unlockAnimatNode!: Object2D;
  /** 已解鎖提示-文字清單 */
  private unlockAnimatTxtList: Phaser.GameObjects.Text[] = [];

  /** 英雄物件池 */
  private heroPool!: Phaser.GameObjects.Group;
  /** 已建立英雄清單 */
  private heroList: AdornmentHero[] = [];

  /** 等級解鎖 */
  public get unlockType(): AdornmentRoomUnlockType {
    const adornmentState = StoreHelper.$$store.state.AdornmentModule;

    // 已解鎖
    if (adornmentState.personalBaseList.find((dbRoom) => dbRoom.farmMapId === this.roomTableData.id)) {
      return AdornmentRoomUnlockType.Unlock;
    }

    // 可解鎖: 可解鎖額度 > 已解鎖房間數
    switch (this.roomTableData.roomSize) {
      case AdornmentRoomSizeType.Big:
        if (adornmentState.unlockBigRoomQuota > 0) {
          return AdornmentRoomUnlockType.CanUnlock;
        }
        break;
      case AdornmentRoomSizeType.Small:
        if (adornmentState.unlockSmallRoomQuota > 0) {
          return AdornmentRoomUnlockType.CanUnlock;
        }
        break;

      default:
        console.error(`unlockType: undefine. roomSize=${this.roomTableData.roomSize}`);
        break;
    }

    // 無解鎖額度
    return AdornmentRoomUnlockType.NoUnlock;
  }

  /** 取得房間ID */
  public get roomID(): number {
    return this.roomTableData.id;
  }

  //#endregion data

  constructor(newScene: Scene, x: number, y: number) {
    super(newScene, x, y);

    // 建立英雄物件池
    this.heroPool = this.scene.add.group({
      classType: AdornmentHero,
      runChildUpdate: true,
    });

    // 初始化裝飾物分類表
    for (let adornmentType = AdornmentType.Wall; adornmentType < AdornmentType.Max; adornmentType++) {
      this.rowMap.set(adornmentType, []);
    }
  }

  /** 自動更新房間
   * @param time 時間
   * @param delta 差值(MS)
   */
  public update(time: number, delta: number): void {
    this.heroList.forEach((hero) => {
      // 移動流程結束時，再次執行
      if (hero.isMoving === false) {
        this.moveHero(hero);
      }
    });
  }

  /** 設定房間資料
   * @param newRoomCellData 房間資料
   * @param isLast 最後一間房間
   */
  public setRoomInfo(newRoomCellData: AdornmentRoomCellData, isLast: boolean): void {
    // 房間資料-靜態表
    this.roomTableData = newRoomCellData.roomData;

    // 設定房間寬度
    switch (this.roomTableData.roomSize) {
      case AdornmentRoomSizeType.Big:
        this.width = AdornmentNumber.largeRoomWidth;
        break;
      case AdornmentRoomSizeType.Small:
        this.width = AdornmentNumber.smallRoomWidth;
        break;
      default:
        console.error(`setRoomInfo: undefine. roomSize=${this.roomTableData.roomSize}`);
        this.width = 0;
        break;
    }

    // 初始全部裝飾物
    this.initAdornment(newRoomCellData);

    // 生成全部英雄，並排序z軸
    this.initAllHero(newRoomCellData.heroList);

    // 拜訪時, 建立拜訪時不可解鎖提示ui
    if (StoreHelper.$$store.state.AdornmentModule.isVisit) {
      this.initVisitNoUnlockHintUI();
    }
    // 主玩家自已, 建立主玩家自已的完整解鎖提示ui
    else {
      this.initSelfUnlockHintUI();
    }

    // 切換解鎖提示
    this.switchUnlockHint();

    // 建立隔間牆 (除了最後一間房間)
    if (isLast === false) {
      this.setPartition();
    }

    this.alpha = 1;
  }

  /** 初始房間內裝飾物
   * @param roomCellData 房間資料
   */
  private initAdornment(roomCellData: AdornmentRoomCellData): void {
    // 裝飾物只生成一次
    if (this.adornmentMap.size === 0) {
      // 生成所有可裝飾格子
      // 牆
      const wallComponent = this.initAdornmentComponent(AdornmentType.Wall, 0);
      // 設定預設背景圖片(毛胚屋)-牆
      wallComponent.createImageTileByName(AdornmentString.defaultWallImage, this.width, AdornmentNumber.wallHeight);

      // 地板
      const floorComponent = this.initAdornmentComponent(AdornmentType.Floor, 0);
      // 設定預設背景圖片(毛胚屋)-地板
      floorComponent.createImageTileByName(AdornmentString.defaultFloorImage, this.width, AdornmentNumber.floorHeight);

      // 後/中/前排物品
      for (let adornmentType = AdornmentType.BackItem; adornmentType < AdornmentType.Max; adornmentType++) {
        const itemCount = this.getRoomItemCount(roomCellData.roomData.roomSize, adornmentType);
        for (let i = 0; i < itemCount; i++) {
          this.initAdornmentComponent(adornmentType, i);
        }
      }
    }

    // 刷新未/已放置的裝飾物
    this.adornmentMap.forEach((adornmentUnit) => {
      // 取得裝飾物的地圖索引
      const mapIndex = adornmentUnit.adornmentComponent.mapIndex;
      // 取得已放置的裝飾物
      const findAdornmentPosition = roomCellData.putAdornmentList.find(
        (adornmentPosition) => adornmentPosition.mapIndex === mapIndex
      );

      // 已放置裝飾物
      if (findAdornmentPosition) {
        // 載入傢俱參數
        const itemAdornment = TableManager.adornmentItem.findOne(findAdornmentPosition.itemId);
        if (itemAdornment == null) {
          console.error(`itemAdornment: not found. id=${findAdornmentPosition.itemId}`);
          return;
        }

        // 更新裝飾物
        adornmentUnit.adornmentComponent.updateAdornment(itemAdornment, findAdornmentPosition);
        adornmentUnit.adornmentComponent.alpha = 1;
      }
      // 未放置裝飾物時, 清除裝飾物
      else {
        adornmentUnit.adornmentComponent.clearAdornment();
      }

      // 設定房間id
      adornmentUnit.adornmentComponent.farmMapId = this.roomID;
    });
  }

  /** 設定裝飾物
   * @param adornmentType 裝飾物類型
   * @param indexOfRoom 房間內裝飾物索引
   */
  private initAdornmentComponent(adornmentType: AdornmentType, indexOfRoom: number): AdornmentComponent {
    // 裝飾物類型 / 房間內裝飾物索引 轉 地圖索引
    const mapIndex = adornmentType * AdornmentNumber.mapIndexInterval + indexOfRoom;

    // 防呆-重覆生成
    const checkAdornmentUnit = this.adornmentMap.get(mapIndex);
    if (checkAdornmentUnit != null) {
      console.error(`setAdornment: duplicated! mapIndex=${mapIndex}`);
      return checkAdornmentUnit.adornmentComponent;
    }

    // 取得可放置裝飾物格子的座標
    const pos = this.getAdornmentPos(adornmentType, indexOfRoom, this.width);

    // 裝飾物放置區圖片
    let dropZoneImage: Phaser.GameObjects.Image;
    let canDropPlusImage: Phaser.GameObjects.Image | undefined;
    let dropHintImage: Phaser.GameObjects.Image | undefined;
    // 牆/地板，用大綠框+加號
    if (adornmentType === AdornmentType.Wall || adornmentType === AdornmentType.Floor) {
      // 建立拖放區圖片(蓋在在全部裝飾物上)
      dropZoneImage = this.addImage(AdornmentString.canPutBackgroundIcon, pos.x, pos.y);
      canDropPlusImage = this.addImage(AdornmentString.canPutFurniturePlus, pos.x, pos.y);
      canDropPlusImage.alpha = 0;

      // 拖放提示圖
      dropHintImage = this.addImage(AdornmentString.dropBackgroundImage, pos.x, pos.y);
    }
    // 後/中/前排物件，用單一圖(有加號綠框/紅框)
    else {
      // 建立拖放區圖片(蓋在在全部裝飾物上)
      dropZoneImage = this.addImage(AdornmentString.noPutFurnitureIcon, pos.x, pos.y);

      // 拖放提示圖
      dropHintImage = this.addImage(AdornmentString.dropFurnitureIcon, pos.x, pos.y);
    }

    // 縮放拖放區，並隱藏
    const zoneSize = this.getDropAreaSize(adornmentType, this.width);
    dropZoneImage.scaleX = zoneSize.width / dropZoneImage.width;
    dropZoneImage.scaleY = zoneSize.height / dropZoneImage.height;
    dropZoneImage.alpha = 0;
    // 縮放拖放提示圖，並隱藏
    dropHintImage.scaleX = dropZoneImage.scaleX;
    dropHintImage.scaleY = dropZoneImage.scaleY;
    dropHintImage.alpha = 0;

    // 新增裝飾物元件
    const adornmentComponent = this.addObject<AdornmentComponent>(pos.x, pos.y, AdornmentComponent);
    adornmentComponent.width = zoneSize.width;
    adornmentComponent.height = zoneSize.height;

    // 初始化裝飾物元件
    adornmentComponent.init(adornmentType, this.roomTableData.id, mapIndex);

    // 設置可拖放裝飾物的資料, 拖動裝飾物時會判斷此值存在與否, 來決定能否設置裝飾物
    const dropData: DropAdornmentData = {
      adornmentComponent,
      dropZoneImage,
      dropHintImage,
    };

    // 創建裝飾物放置區域
    const dropZone = this.createZone(zoneSize, dropData);

    // 加入已放置裝飾物map
    const adornmentUnit: AdornmentUnit = {
      adornmentComponent,
      dropZoneImage,
      canDropPlusImage,
      dropZone,
    };
    this.adornmentMap.set(mapIndex, adornmentUnit);

    // 加入分類的裝飾物map
    this.rowMap.get(adornmentType)?.push(adornmentComponent);

    return adornmentComponent;
  }

  /** 生成全部英雄，並排序z軸
   * @param newHeroList 擁有英雄
   */
  private initAllHero(newHeroList: number[]): void {
    // 將英雄返回物件池
    this.heroList.forEach((hero) => {
      this.heroPool.killAndHide(hero);
    });
    this.heroList = [];

    // 剩餘英雄
    const remainHeroList: number[] = Phaser.Math.RND.shuffle([...newHeroList]);

    // 英雄 前排
    remainHeroList
      // 隨機 0~剩餘英雄數量 的數量，再生成英雄
      .splice(0, randomNumber(remainHeroList.length + 1))
      .forEach((heroID) => {
        this.spawnHero(AdornmentNumber.heroPositionYFront, heroID, true);
      });

    const frontItemList = this.rowMap.get(AdornmentType.FrontItem) ?? [];
    // 前排(下) (反向排列，使左方物品在後排)
    frontItemList
      .slice()
      .reverse()
      .forEach((adornmentComponent) => {
        if (adornmentComponent.y !== AdornmentNumber.frontUpItemOffsetY) {
          this.sendToBack(adornmentComponent);
        }
      });

    // 英雄 中間
    remainHeroList
      // 隨機 0~剩餘英雄數量 的數量，再生成英雄
      .splice(0, randomNumber(remainHeroList.length + 1))
      .forEach((heroID) => {
        this.spawnHero(AdornmentNumber.heroPositionYMiddle, heroID, true);
      });

    // 前排(上) (反向排列，使左方物品在後排)
    frontItemList
      .slice()
      .reverse()
      .forEach((adornmentComponent) => {
        if (adornmentComponent.y === AdornmentNumber.frontUpItemOffsetY) {
          this.sendToBack(adornmentComponent);
        }
      });

    // 英雄 後排
    remainHeroList
      // 生成 剩餘全部英雄
      .forEach((heroID) => {
        // 後排hero不說話
        this.spawnHero(AdornmentNumber.heroPositionYBack, heroID, false);
      });

    // 依序針對 中排~牆
    for (let adornmentType = AdornmentType.MiddleItem; adornmentType >= AdornmentType.Wall; adornmentType--) {
      // 排列各類型物品的z軸 (反向排列，使左方物品在後排)
      const itemList = this.rowMap.get(adornmentType) ?? [];
      itemList
        .slice()
        .reverse()
        .forEach((adornmentComponent) => {
          this.sendToBack(adornmentComponent);
        });
    }
  }

  /** 生成英雄
   * @param y y座標
   * @param heroID 英雄id
   * @param isShowTalk 要顯示英雄對話
   */
  private spawnHero(y: number, heroID: number, isShowTalk: boolean): void {
    // 取得英雄靜態表
    const heroData = TableManager.hero.findOne(heroID);
    if (heroData == null) {
      console.error(`spawnHero: heroData == null, id=${heroID}`);
      return;
    }

    // 從物件池取出物件
    const hero: AdornmentHero = this.heroPool.get(
      randomRange(AdornmentNumber.moveMarginIndent, this.width - AdornmentNumber.moveMarginIndent),
      y,
      heroData.nameKey + CharacterAnimType.Idle
    );
    if (hero == null) {
      console.error(`spawnHero: hero == null`);
      return;
    }
    // 加入房間container
    this.add(hero);

    // 設定英雄資料
    hero.initHero(heroData, isShowTalk);

    // 加入英雄清單
    this.heroList.push(hero);

    // 移到最下層
    this.sendToBack(hero);
  }

  /** 移動英雄
   * @param hero 英雄
   */
  private moveHero(hero: AdornmentHero): void {
    // 在房間內選擇目標
    const targetX = randomRange(AdornmentNumber.moveMarginIndent, this.width - AdornmentNumber.moveMarginIndent);

    // 計算時間
    const duration = Math.abs(targetX - hero.x) * this.randomMoveDurationRatio;

    // 移動
    hero.onHeroMove(targetX, duration);
  }

  /** 取得可放置裝飾物格子的座標 (不考慮實物大小)
   * @param adornmentType 裝飾物類型
   * @param indexOfRoom 房間內物品索引
   * @param roomWidth 房間寬度
   */
  private getAdornmentPos(adornmentType: AdornmentType, indexOfRoom: number, roomWidth: number): Phaser.Math.Vector2 {
    // x間隔 = 放置格子間隔x
    const offsetX = AdornmentNumber.furniturePutGridGapX;

    // 計算各類型裝飾物的位置
    switch (adornmentType) {
      // 牆/地板
      case AdornmentType.Wall:
      case AdornmentType.Floor: {
        return new Phaser.Math.Vector2(
          roomWidth / 2,
          adornmentType === AdornmentType.Wall ? AdornmentNumber.wallOffsetY : AdornmentNumber.floorOffsetY
        );
      }

      // 後排物品/中間物品
      case AdornmentType.BackItem:
      case AdornmentType.MiddleItem: {
        let itemCount = 0;
        let offsetY = 0;
        if (adornmentType === AdornmentType.BackItem) {
          itemCount = this.getRoomItemCount(this.roomTableData.roomSize, adornmentType);
          offsetY = AdornmentNumber.backItemOffsetY;
        } else {
          itemCount = this.getRoomItemCount(this.roomTableData.roomSize, adornmentType);
          offsetY = AdornmentNumber.middleItemOffsetY;
        }

        // 將格子相連並排，左右留空
        // 左邊內縮距離 = (房間寬度 - 格子總寬度) / 2
        const leftIndent = (roomWidth - offsetX * itemCount) / 2;
        // x位置 = 左邊內縮距離 + 前面格子寬度 + 一格寬度/2
        const posX = leftIndent + indexOfRoom * offsetX + offsetX / 2;
        return new Phaser.Math.Vector2(posX, offsetY);
      }

      // 前排物品:
      case AdornmentType.FrontItem: {
        // 可放物品數
        const itemCount = this.getRoomItemCount(this.roomTableData.roomSize, adornmentType);
        // 上半部可放物品數 = 可放物品數 / 2 (進位)
        const upperItemCount = Math.ceil(itemCount / 2);
        let posX = 0;
        let posY = 0;

        // 將格子相連並排，左右留空
        // 上半部 (0~N/2)
        if (indexOfRoom < upperItemCount) {
          // 左邊內縮距離 = (房間寬度 - 格子總寬度) / 2
          const leftIndent = (roomWidth - offsetX * upperItemCount) / 2;
          // x位置 = 左邊內縮距離 + 前面格子寬度 + 一格寬度/2
          posX = leftIndent + indexOfRoom * offsetX + offsetX / 2;
          posY = AdornmentNumber.frontUpItemOffsetY;
        }
        // 下半部
        else {
          // 左邊內縮距離 = (房間寬度 - 格子總寬度) / 2
          const leftIndent = (roomWidth - offsetX * (itemCount - upperItemCount)) / 2;
          // x位置 = 左邊內縮距離 + 前面格子寬度 + 一格寬度/2
          posX = leftIndent + (indexOfRoom - upperItemCount) * offsetX + offsetX / 2;
          posY = AdornmentNumber.frontDownItemOffsetY;
        }
        return new Phaser.Math.Vector2(posX, posY);
      }

      default:
        console.error('getAdornmentPosition() error, unexpected adornmentType: ' + adornmentType);
        return Phaser.Math.Vector2.ZERO;
    }
  }

  /** 取得裝飾物的放置數量
   * @param roomSize
   * @param adornmentType
   * @returns
   */
  private getRoomItemCount(roomSize: AdornmentRoomSizeType, adornmentType: AdornmentType): number {
    switch (adornmentType) {
      // 後排物品
      case AdornmentType.BackItem:
        return roomSize === AdornmentRoomSizeType.Big
          ? AdornmentNumber.BigRoomBackItemCount
          : AdornmentNumber.SmallRoomBackItemCount;
      // 中間物品
      case AdornmentType.MiddleItem:
        return roomSize === AdornmentRoomSizeType.Big
          ? AdornmentNumber.BigRoomMiddleItemCount
          : AdornmentNumber.SmallRoomMiddleItemCount;
      // 前排物品
      case AdornmentType.FrontItem:
        return roomSize === AdornmentRoomSizeType.Big
          ? AdornmentNumber.BigRoomFrontItemCount
          : AdornmentNumber.SmallRoomFrontItemCount;
      default:
        console.error(`getRommItemCount: adornmentType=${adornmentType}`);
        return 0;
    }
  }

  /** 創建裝飾物放置區域
   * @param zoneSize 拖放區大小
   * @param dropData 拖放裝飾物資料
   */
  private createZone(zoneSize: Size, dropData: DropAdornmentData): Phaser.GameObjects.Zone {
    // 加入拖放區域
    const dropZone = this.addZone(
      dropData.adornmentComponent.x,
      dropData.adornmentComponent.y,
      zoneSize.width,
      zoneSize.height
    );
    // 設定拖放互動
    dropZone.setInteractive({ draggable: true, dropZone: true });
    // 設置可拖放裝飾物的資料, 拖動裝飾物時會判斷此值存在與否, 來決定能否設置裝飾物
    dropZone.setData(AdornmentString.ItemDropInfo, dropData);

    // 關閉拖放區zone物件
    dropZone.active = false;
    // 停止event
    dropZone.disableInteractive();

    return dropZone;
  }

  /** 決定拖放區的大小
   * @param adornmentType 裝飾物類型
   * @param roomWidth 房間寬度
   */
  private getDropAreaSize(adornmentType: AdornmentType, roomWidth: number): Size {
    switch (adornmentType) {
      // 牆
      case AdornmentType.Wall:
        return {
          width: roomWidth,
          height: AdornmentNumber.wallHeight,
        };
      // 地板
      case AdornmentType.Floor:
        return {
          width: roomWidth,
          height: AdornmentNumber.floorHeight,
        };
      // 後排物品/中間物品/前排物品
      case AdornmentType.BackItem:
      case AdornmentType.MiddleItem:
      case AdornmentType.FrontItem:
        return {
          width: AdornmentNumber.adornmentOriginWidthMax,
          height: AdornmentNumber.adornmentOriginHeightMax,
        };
      default:
        console.error(`getDropAreaSize: undefine. type=${adornmentType}`);
        return {
          width: 0,
          height: 0,
        };
    }
  }

  /** 建立隔間牆 */
  private setPartition(): void {
    const partitionWallImage = this.addImage(AdornmentString.partitionWall, 0, 0);
    // 位置
    partitionWallImage.x = this.width - AdornmentNumber.partitionWallWidth / 2;
    partitionWallImage.y = AdornmentNumber.partitionPosY;
    // 水平放大
    partitionWallImage.scaleY = AdornmentNumber.partitionWallHeight / partitionWallImage.height;
  }

  /** 建立主玩家自已的完整解鎖提示ui */
  private initSelfUnlockHintUI(): void {
    // 房間中央
    const roomCenterX = this.width / 2;

    //#region 可解鎖提示
    if (this.canUnlockHintNode == null) {
      this.canUnlockHintNode = this.addObject(roomCenterX, this.unlockHintPositionY);
      // 黃底-解鎖按鈕
      const canUnlockFrameBtn = this.canUnlockHintNode.addImage(AdornmentString.canUnlockBg, 0, 0);
      canUnlockFrameBtn.scaleX = this.width / canUnlockFrameBtn.width;
      // 設置解鎖按鈕event
      canUnlockFrameBtn.setInteractive({ useHandCursor: true });
      canUnlockFrameBtn.on(Phaser.Input.Events.POINTER_UP, async () => {
        // 解鎖房間
        AdornmentGameScene.instance.onClickUnlockRoomButton(this);
      });

      // 可解鎖的鎖頭Icon/光芒
      this.canUnlockHintNode.addImage(AdornmentString.canUnlock, 0, this.unlockHintLockPositionY);

      // 可解鎖的字
      this.canUnlockHintNode.addText('解鎖這間房間', 0, this.unlockHintTextPositionY, {
        color: UIHelper.whiteString,
        fontSize: '29px',
      });
    }
    //#endregion 可解鎖提示

    //#region 不可解鎖提示
    if (this.noUnlockHintNode == null) {
      this.noUnlockHintNode = this.addObject(roomCenterX, this.noUnlockHintPositionY);
      // 黑底
      const noUnlockFrame = this.noUnlockHintNode.addImage(AdornmentString.noUnlockHintBg, 0, 0);
      noUnlockFrame.scaleX = this.width / noUnlockFrame.width;

      // 鎖頭Icon
      this.noUnlockHintNode.addImage(AdornmentString.noUnlock, 0, 0);

      // 計算解鎖需要的積分
      let requirePoint = 0;
      switch (this.roomTableData.roomSize) {
        case AdornmentRoomSizeType.Big:
          requirePoint = StoreHelper.$$store.state.AdornmentModule.unlockBigRoomNeedHeroPoint;
          break;
        case AdornmentRoomSizeType.Small:
          requirePoint = StoreHelper.$$store.state.AdornmentModule.unlockSmallRoomNeedHeroPoint;
          break;

        default:
          console.error(`setUnlockHintUI: undefine. roomSize=${this.roomTableData.roomSize}`);
          break;
      }

      this.noUnlockHintNode.addText(`積分達到${requirePoint}可選擇解鎖`, 0, this.noUnlockHintTextPositionY, {
        color: '#00FDFF',
        fontSize: '29px',
      });
    }
    //#endregion 不可解鎖提示

    //#region 已解鎖房間動畫
    if (this.unlockAnimatNode == null) {
      this.unlockAnimatNode = this.addObject(roomCenterX, this.unlockAnimatPositionY);
      this.unlockAnimatNode.alpha = 0;
      const unlockAnimatBg = this.unlockAnimatNode.addImage(AdornmentString.unlockAnimatBg, 0, 0);
      unlockAnimatBg.scaleX = this.width / unlockAnimatBg.width;
      this.unlockAnimatTxtList.push(
        this.unlockAnimatNode.addText(`房間解鎖！`, 0, -1 * this.unlockAnimatTextOffsetY, {
          color: '#FFFFFF',
          fontSize: '48px',
        })
      );
      this.unlockAnimatTxtList.push(
        this.unlockAnimatNode.addText(`恭喜擴大房間！可以佈置更多家具了！`, 0, this.unlockAnimatTextOffsetY, {
          color: '#F1D103',
          fontSize: '20px',
        })
      );
    }
    //#endregion 已解鎖房間動畫
  }

  /** 建立拜訪時不可解鎖提示ui */
  private initVisitNoUnlockHintUI(): void {
    // 房間中央
    const roomCenterX = this.width / 2;

    if (this.noUnlockHintNode == null) {
      this.noUnlockHintNode = this.addObject(roomCenterX, this.noUnlockHintPositionY);
      // 黑底
      const noUnlockFrame = this.noUnlockHintNode.addImage(AdornmentString.noUnlockHintBg, 0, 0);
      noUnlockFrame.scaleX = this.width / noUnlockFrame.width;
    }
  }

  /** 清除房間 */
  public clearRoom(): void {
    // HIDE已放置裝飾物
    this.adornmentMap.forEach((adornment) => {
      adornment.adornmentComponent.alpha = 0;
    });
    this.alpha = 0;
  }

  /** 切換佈置模式
   * @param isEdit 是佈置模式
   * @param dropItemTableData 要放置物品的裝飾物類型
   */
  public switchPutItemArea(isEdit: boolean, dropItemTableData: AdornmentItemData): void {
    // 檢查每一個裝飾物
    this.adornmentMap.forEach((adornmentUnit) => {
      const adornmentComponent = adornmentUnit.adornmentComponent;
      const adornmentType = adornmentComponent.adornmentType;
      const isShow = isEdit && dropItemTableData.adornmentType === adornmentType;

      // 顯示放置區
      if (isShow) {
        this.showPutItemArea(adornmentComponent.canPutItem, adornmentUnit, adornmentType);
      }
      // 隱藏放置區
      else {
        this.hidePutItemArea(adornmentUnit);
      }
    });
  }

  /** 顯示放置區
   * @param isCanPut 可放置
   * @param adornmentUnit
   * @param adornmentType
   */
  private showPutItemArea(isCanPut: boolean, adornmentUnit: AdornmentUnit, adornmentType: AdornmentType): void {
    // 可/不可放置裝飾物
    // 牆/地板，用大綠框+加號
    if (adornmentUnit.adornmentComponent.isTileSpriteItem) {
      if (adornmentUnit.canDropPlusImage) {
        adornmentUnit.canDropPlusImage.alpha = 1;
      }
    }
    // 後/中/前排物件，用單一圖(有加號綠框/紅框)
    else {
      adornmentUnit.dropZoneImage.setTexture(
        isCanPut ? AdornmentString.canPutFurnitureIcon : AdornmentString.noPutFurnitureIcon
      );
    }

    // 顯示放置區圖片
    adornmentUnit.dropZoneImage.alpha = 1;

    // 將放置區圖片拉到房間的最上層
    this.bringToTop(adornmentUnit.dropZoneImage);
    if (adornmentUnit.canDropPlusImage) {
      this.bringToTop(adornmentUnit.canDropPlusImage);
    }

    // 可拖放時，才啟用拖放區zone物件
    adornmentUnit.dropZone.active = isCanPut;
    // 啟用/停止event
    if (isCanPut) {
      adornmentUnit.dropZone.setInteractive();
    } else {
      adornmentUnit.dropZone.disableInteractive();
    }

    // zone移而最上方
    this.bringToTop(adornmentUnit.dropZone);
  }

  /** 關閉放置區
   * @param adornmentUnit
   */
  private hidePutItemArea(adornmentUnit: AdornmentUnit): void {
    if (adornmentUnit.canDropPlusImage) {
      adornmentUnit.canDropPlusImage.alpha = 0;
    }
    adornmentUnit.dropZoneImage.alpha = 0;
    // 關閉拖放區zone物件
    adornmentUnit.dropZone.active = false;
    // 停止event
    adornmentUnit.dropZone.disableInteractive();
  }

  /** 切換解鎖提示 */
  public switchUnlockHint(): void {
    // 檢查解鎖類型
    const currUnlockType = this.unlockType;

    // 拜訪時顯示不可解鎖提示
    if (this.canUnlockHintNode == null) {
      this.noUnlockHintNode.alpha = currUnlockType === AdornmentRoomUnlockType.Unlock ? 0 : 1;
      return;
    }

    // 主玩家自己，會顯示完整的解鎖ui
    switch (currUnlockType) {
      /** 不可解鎖 */
      case AdornmentRoomUnlockType.NoUnlock:
        this.canUnlockHintNode.alpha = 0;
        this.noUnlockHintNode.alpha = 1;
        break;
      /** 可解鎖 */
      case AdornmentRoomUnlockType.CanUnlock:
        this.canUnlockHintNode.alpha = 1;
        this.noUnlockHintNode.alpha = 0;
        break;
      /** 已解鎖 */
      case AdornmentRoomUnlockType.Unlock:
        this.canUnlockHintNode.alpha = 0;
        this.noUnlockHintNode.alpha = 0;
        break;
      default:
        console.error(`switchUnlockHint: undefine: ${this.unlockType}`);
        break;
    }
  }

  /** 播放解鎖房間動畫 */
  public playUnlockAnimation(): void {
    // 重置動畫
    this.unlockAnimatNode.alpha = 1;
    this.unlockAnimatTxtList.forEach((txt) => {
      txt.setScale(1);
    });

    // 全部淡出
    this.scene.tweens.add({
      targets: this.unlockAnimatNode,
      duration: this.unlockAnimatDuration,
      alpha: 0,
    });
    // 文字放大
    this.scene.tweens.add({
      targets: this.unlockAnimatTxtList,
      duration: this.unlockAnimatDuration,
      scaleX: this.unlockAnimatScale,
      scaleY: this.unlockAnimatScale,
    });
  }
}
