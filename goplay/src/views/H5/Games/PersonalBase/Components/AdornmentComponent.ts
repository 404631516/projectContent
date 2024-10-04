import { AdornmentType } from '@/helper/enum/Adornment';
import { AdornmentPosition } from '@/helper/interface/Adornment';
import { AdornmentItemData } from '@/manager/TableManager';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { DirectionType, AdornmentNumber, AdornmentString } from '../Data/AdornmentConfig';
import AdornmentGameScene from '../Scenes/AdornmentGameScene';

export type Vector2 = Phaser.Math.Vector2;

/** 裝飾物 或是 裝飾空位 */
export default class AdornmentComponent extends Object2D {
  //#region data
  /** 房間傢俱圖片(png，分為後/中/前排)
   * 因為phaser bug: SetTexture不會更新點擊區大小(hit area)，所以會用第一次的area作偵測，故要改成每次重建image
   */
  private itemImage?: Phaser.GameObjects.Image;
  /** 房間背景裝飾物圖片(拚接圖片，分為牆/地板) */
  private itemTileSprite?: Phaser.GameObjects.TileSprite;

  /** 裝飾類型 */
  public adornmentType: AdornmentType = AdornmentType.None;

  /** 裝飾物-靜態表 */
  private adornmentItemData?: AdornmentItemData;

  /** 裝飾物-動態表 */
  private adornmentPosition?: AdornmentPosition;
  /** 房間id */
  private _farmMapId: number = -1;
  public set farmMapId(value: number) {
    this._farmMapId = value;
  }

  /** 地圖索引 */
  private _mapIndex: number = -1;
  public get mapIndex(): number {
    return this._mapIndex;
  }

  /** 取得裝飾物名稱 */
  public get adornmentItemName(): string {
    return Localization.getText(LocalKeyType.Common, this.adornmentItemData?.nameKey ?? '');
  }

  /** 未放裝飾物 */
  public get isEmpty(): boolean {
    return this.adornmentItemData == null;
  }

  /** 取得itemid */
  public get itemID(): number {
    return this.adornmentItemData?.id ?? AdornmentNumber.invalidID;
  }

  /** 檢查可放置物品 */
  public get canPutItem(): boolean {
    // 牆/地板
    if (this.isTileSpriteItem) {
      // 一律顯示可放置區
      return true;
    }
    // 後/中/前排物品: 已放物品時顯示不可放置，否則為可放置
    else {
      // 已放物品時顯示不可放置，否則為可放置
      return this.isEmpty;
    }
  }

  /** 計算裝飾物中心的座標 */
  public get worldPosition(): Vector2 {
    const pos = UIHelper.calcWorldPosition(this);
    // 物品y軸偏移，以定位傢俱位置
    pos.y += this.adornmentItemData?.itemOffsetY ?? 0;
    return pos;
  }

  /** 是拚接型裝飾物 */
  public get isTileSpriteItem(): boolean {
    return this.itemTileSprite != null;
  }
  //#endregion data

  /** 初始化裝飾物元件
   * @param adornmentType 裝飾類型
   * @param farmMapId 房間id
   * @param mapIndex 地圖索引
   */
  public init(adornmentType: AdornmentType, farmMapId: number, mapIndex: number): void {
    this.adornmentType = adornmentType;
    this._farmMapId = farmMapId;
    this._mapIndex = mapIndex;
  }

  /** 更新裝飾物
   * @param adornment 裝飾物物件
   * @param adornmentItemData 裝飾物靜態表
   */
  public updateAdornment(adornmentItemData: AdornmentItemData, dbAdornment: AdornmentPosition): void {
    // 更新圖片
    // 牆/地板
    if (this.isTileSpriteItem) {
      this.setImageTile(adornmentItemData);
    }
    // 後排物品/中間物品/前排物品
    else {
      // 更新裝飾物
      this.setImage(adornmentItemData, dbAdornment.directionType);
    }

    // 裝飾物-動態表
    this.adornmentPosition = dbAdornment;
  }

  /** 設定背景裝飾物
   * @param nameKey 裝飾物圖片key
   * @param width 寬
   * @param height 高
   */
  public createImageTileByName(nameKey: string, width: number, height: number): void {
    // 防呆
    if (nameKey.length === 0) {
      console.error(`setImageTile: nameKey is empty`);
      return;
    }

    // 防呆-重覆生成
    if (this.itemTileSprite) {
      console.error(`setImageTileByName: itemTileSprite is exist.`);
      return;
    }

    // 生成TileSprite
    this.itemTileSprite = this.addTileSprite(
      nameKey,
      0,
      0,
      // 先縮小image，拼貼圖片
      width / AdornmentNumber.originImageScale,
      height / AdornmentNumber.originImageScale
    );

    // 再放大image，以符合比例
    this.itemTileSprite.setScale(AdornmentNumber.originImageScale);
    this.itemTileSprite.alpha = 1;

    // 設置互動參教-可點擊
    this.itemTileSprite.setInteractive({ useHandCursor: true });
    // 設置 拆缷鈕 event;
    this.itemTileSprite.on(Phaser.Input.Events.POINTER_UP, () => {
      // 拆缷房間用的裝飾物
      AdornmentGameScene.instance.onShowTearDownAdornmentUI(this);
    });
  }

  /** 設定背景裝飾物
   * @param nameKey 裝飾物圖片key
   */
  public setImageTileByName(nameKey: string): void {
    // 防呆
    if (nameKey.length === 0) {
      console.error(`setImageTile: nameKey is empty`);
      return;
    }

    if (this.itemTileSprite == null) {
      console.error(`setImageTileByName: itemTileSprite is null.`);
      return;
    }
    // 更換tile
    this.itemTileSprite.setTexture(nameKey);
    // 顯示圖片
    this.itemTileSprite.alpha = 1;
  }

  /** 設定背景裝飾物
   * @param adornmentItemData 裝飾物靜態表
   */
  public setImageTile(adornmentItemData: AdornmentItemData): void {
    // 儲存靜態表
    this.adornmentItemData = adornmentItemData;

    // 設定背景裝飾物
    this.setImageTileByName(adornmentItemData.nameKey);
  }

  /** 設定傢俱裝飾物
   * @param adornmentItemData 裝飾物靜態表
   * @param directionType 方向
   */
  private setImage(adornmentItemData: AdornmentItemData, directionType: DirectionType): void {
    // 裝飾物靜態表
    this.adornmentItemData = adornmentItemData;

    // 刪除舊圖
    if (this.itemImage) {
      this.itemImage.destroy();
    }

    // 新建atlas圖片 (圖片y軸要偏移以定位傢俱)
    this.itemImage = this.addImage(AdornmentString.adornmentAtlas, 0, adornmentItemData.itemOffsetY, `${adornmentItemData.url}.png`);

    // 設置互動參教-可點擊
    this.itemImage.setInteractive({ useHandCursor: true });

    // 向左，不翻轉
    this.itemImage.flipX = directionType !== DirectionType.Left;

    // 縮放圖片
    this.itemImage.setScale(AdornmentNumber.originImageScale);
    // 顯示
    this.itemImage.alpha = 1;

    // 設置 拆除鈕 event;
    this.itemImage.on(Phaser.Input.Events.POINTER_UP, () => {
      // 拆缷房間用的裝飾物
      AdornmentGameScene.instance.onShowTearDownAdornmentUI(this);
    });
  }

  /** 顯示發亮圖片
   * @param lightImage 發亮圖
   */
  public setLightImage(lightImage: Phaser.GameObjects.Image): void {
    if (this.adornmentItemData == null) {
      return;
    }

    if (this.itemImage) {
      lightImage.setTexture(AdornmentString.adornmentAtlas, `${this.adornmentItemData.url}.png`);

      // 縮放和物品圖相同
      lightImage.setScale(this.itemImage.scale);
      // 左右翻轉
      lightImage.flipX = this.itemImage.flipX;
      // 將圖染到全白
      lightImage.setTintFill(0xffffff);
    } else {
      // TILE型用白圖即可
      lightImage.setTexture(AdornmentString.backgroundAdornmentLight);
      // 縮放到全部牆/地板範圍
      UIHelper.scaleToTarget(lightImage, this.width, this.height);
    }

    // 計算裝飾物中心的座標
    const worldPosCenter = this.worldPosition;
    // 位置對齊原圖
    lightImage.x = worldPosCenter.x;
    lightImage.y = worldPosCenter.y;

    // 顯示發亮圖
    lightImage.alpha = 1;
  }

  /** 清除裝飾物 */
  public clearAdornment(): void {
    // 清除背景
    if (this.itemTileSprite) {
      // 設定牆/地板的 預設背景圖片(毛胚屋)
      if (this.adornmentType === AdornmentType.Wall) {
        this.setImageTileByName(AdornmentString.defaultWallImage);
      } else {
        this.setImageTileByName(AdornmentString.defaultFloorImage);
      }
    }
    if (this.itemImage) {
      this.itemImage.alpha = 0;
    }

    // 清除靜態表
    this.adornmentItemData = undefined;
    // 清除動態表
    this.adornmentPosition = undefined;
  }

  /** 取得新的裝飾物動態表資料
   * @param newItemID 裝飾物id
   */
  public getNewAdornmentPosition(newItemID: number): AdornmentPosition {
    return {
      /** 裝飾物位置UID (拆缷需要) */
      farmMapUnitUid: this.adornmentPosition?.farmMapUnitUid ?? AdornmentNumber.invalidID,
      /** 使用者UID */
      uid: this.adornmentPosition?.uid ?? AdornmentNumber.invalidID,
      /** 基地頁面UID */
      farmMapUid: this.adornmentPosition?.farmMapUid ?? AdornmentNumber.invalidID,
      /** 基地頁面ID(房間id) (放置需要) */
      farmMapId: this._farmMapId,
      /** 裝飾物在頁面上的位置 (放置需要) */
      mapIndex: this._mapIndex,
      /** 方向 (放置需要) (新放置的物品，預設向左) */
      directionType: this.adornmentPosition?.directionType ?? DirectionType.Left,
      /** 道具ID */
      itemId: newItemID,
    };
  }
}
