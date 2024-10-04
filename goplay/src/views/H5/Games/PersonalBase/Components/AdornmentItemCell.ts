import { AdornmentType } from '@/helper/enum/Adornment';
import { AdornmentItemData } from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { Scene } from 'phaser';
import { AdornmentNumber, AdornmentString } from '../Data/AdornmentConfig';
import { AdornmentItem, DropAdornmentData } from '../Data/AdornmentInterface';
import AdornmentGameScene from '../Scenes/AdornmentGameScene';
import AdornmentManager from './AdornmentManager';

/** 佈置模式的背包dialog 的 道具cell */
export default class AdornmentItemCell extends Object2D {
  //#region readonly
  // 佈置模式的背包-位置
  /** 物品圖 位置 */
  private readonly itemIconPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -10);
  /** 裝飾積分 位置 */
  private readonly adornmentScorePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-16, -47);
  /** 佔用格子數 位置 */
  private readonly itemSizePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-33, -30);
  /** 物品數量 位置 */
  private readonly itemCountPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 26);
  /** 物品名稱 位置 */
  private readonly itemNamePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 60);

  /** 拖放物品的提示動畫 淡入/出時間(秒) */
  private readonly dropHintTweenSec: number = 1;
  /** 拖放物品的提示動畫 放大倍率 */
  private readonly dropHintTweenScale: number = 1.5;
  //#endregion readonly

  //#region data
  /** 物品圖 */
  private itemIcon!: Phaser.GameObjects.Image;
  /** 裝飾積分 */
  private adornmentScore!: Phaser.GameObjects.Text;
  /** 佔用格子數-節點 */
  private itemSizeNode!: Object2D;
  /** 佔用格子數-文字 */
  private itemSizeText!: Phaser.GameObjects.Text;
  /** 物品數量 */
  private itemCount!: Phaser.GameObjects.Text;
  /** 物品數量 */
  private itemName!: Phaser.GameObjects.Text;
  /** 背包拖拉物品的選取框 */
  private dragFrame!: Phaser.GameObjects.Image;

  /** 物品靜態表 */
  private itemData?: AdornmentItemData;

  /** 拖拉區域 */
  private dragArea!: Phaser.GameObjects.Image;
  /** 拖拉中裝飾物圖
   * 因為phaser bug: SetTexture不會更新點擊區大小(hit area)，所以會用第一次的area作偵測，故要改成每次重建image
   * bug會導致drop時不能正確阻擋point_up事件
   */
  private dragingHint!: Phaser.GameObjects.Image;

  /** 拖拉中提示物件位置偏移X */
  private get draggingHintOffsetX(): number {
    // 將滑鼠位罝 - 背包ui位置 - cell容器開始位置 - cell位置 - 圖大小/原圖縮放/2
    return (
      -1 *
      (AdornmentNumber.itemDialogPositionX +
        AdornmentNumber.itemDialogMenuPositionX +
        this.x +
        this.itemIcon.width / AdornmentNumber.originImageScale / 2)
    );
  }

  /** 拖拉中提示物件位置偏移Y */
  private get draggingHintOffsetY(): number {
    return (
      -1 *
      (AdornmentNumber.itemDialogPositionY +
        AdornmentNumber.itemDialogMenuPositionY +
        this.y +
        this.itemIcon.height / AdornmentNumber.originImageScale / 2)
    );
  }

  //#endregion data

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    // 建立元件
    this.setUI();
  }

  /** 清除資料 */
  public clearData(): void {
    this.alpha = 0;
    this.itemData = undefined;
  }

  /** 建立元件 */
  public setUI(): void {
    // 佈置模式的背包-建立元件
    // 背包物品cell底框
    this.addImage(AdornmentString.backpackCellBg, this.itemIconPosition.x, this.itemIconPosition.y);

    // 物品圖
    this.itemIcon = this.addImage(AdornmentString.transparentFrame, this.itemIconPosition.x, this.itemIconPosition.y);

    // 裝飾積分
    this.addImage(AdornmentString.backpackItemScoreBg, this.adornmentScorePosition.x, this.adornmentScorePosition.y);
    const scoreIcon = this.addImage(
      AdornmentString.adornmentScoreIcon,
      this.adornmentScorePosition.x - 15,
      this.adornmentScorePosition.y
    );
    scoreIcon.setScale(0.6);
    this.adornmentScore = this.addText(`0`, this.adornmentScorePosition.x + 10, this.adornmentScorePosition.y, {
      color: '#50FFB9',
      fontSize: '20px',
    });

    // 佔用格子數
    this.itemSizeNode = this.addObject(this.itemSizePosition.x, this.itemSizePosition.y);
    this.itemSizeNode.addImage(AdornmentString.backpackItemSizeBg, 0, 0);
    this.itemSizeText = this.itemSizeNode.addText(`0x0`, 0, 0, {
      color: UIHelper.whiteString,
      fontSize: '18px',
    });

    // 物品數量
    this.addImage(AdornmentString.backpackItemCountBg, this.itemCountPosition.x, this.itemCountPosition.y);
    const countIcon = this.addImage(
      AdornmentString.backpackItemCount,
      this.itemCountPosition.x - 24,
      this.itemCountPosition.y - 2
    );
    countIcon.setScale(1.2);
    this.itemCount = this.addText(`${0}`, this.itemCountPosition.x + 10, this.itemCountPosition.y - 2, {
      color: UIHelper.whiteString,
      fontSize: '22px',
    });

    // 物品名稱
    this.itemName = this.addText('', this.itemNamePosition.x, this.itemNamePosition.y, {
      color: UIHelper.whiteString,
      fontSize: '22px',
    });

    // 背包拖拉物品的選取框
    this.dragFrame = this.addImage(
      AdornmentString.backpackCellDragFrame,
      this.itemIconPosition.x,
      this.itemIconPosition.y
    );
    this.dragFrame.alpha = 0;

    // 設定拖拉區域
    this.dragArea = this.addImage(AdornmentString.transparentFrame, 0, 0);
    // 設定拖拉區域，會覆蓋到整個道具格子
    this.dragArea.setScale(AdornmentNumber.itemCellWidth / this.dragArea.width);

    // 建立裝飾物拖曳事件
    this.dragArea.setInteractive({
      draggable: true,
      useHandCursor: true,
    });
    // 點選時新增裝飾物，讓原本的裝飾物物件變成可拖曳的物件
    this.dragArea.on(Phaser.Input.Events.DRAG_START, this.onAdornmentDragStart.bind(this));
    // 拖曳中-拖曳提示跟隨鼠標
    this.dragArea.on(Phaser.Input.Events.DRAG, this.onAdornmentDrag.bind(this));
    // 拖曳進入其他物件
    this.dragArea.on(Phaser.Input.Events.DRAG_ENTER, this.onAdornmentDragEnter.bind(this));
    // 拖曳離開其他物件
    this.dragArea.on(Phaser.Input.Events.DRAG_LEAVE, this.onAdornmentDragLeave.bind(this));
    // 拖放裝飾物
    this.dragArea.on(Phaser.Input.Events.DROP, this.onAdornmentDrop.bind(this));
    // 結束拖曳
    this.dragArea.on(Phaser.Input.Events.DRAG_END, this.onAdornmentDragEnd.bind(this));
  }

  /** 刷新物品資訊
   * @param adornmentItem 擁有的裝飾物
   */
  public setItemInfo(adornmentItem: AdornmentItem): void {
    // 記錄道具表
    this.itemData = adornmentItem.itemData;

    switch (adornmentItem.itemData.adornmentType) {
      // 牆/地板
      case AdornmentType.Wall:
      case AdornmentType.Floor:
        // 用png繪製裝飾物
        this.itemIcon.setTexture(adornmentItem.itemData.nameKey);
        // 不顯示物品大小
        this.itemSizeNode.alpha = 0;
        break;
      // 後排物品/中間物品/前排物品
      case AdornmentType.BackItem:
      case AdornmentType.MiddleItem:
      case AdornmentType.FrontItem:
        // 使用ui atlas繪製裝飾物
        this.itemIcon.setTexture(AdornmentString.adornmentAtlas, `${adornmentItem.itemData.url}.png`);
        // 顯示物品大小
        this.itemSizeText.text = `${adornmentItem.itemData.itemWidth}x${adornmentItem.itemData.itemHeight}`;
        this.itemSizeNode.alpha = 1;
        break;
      default:
        console.error(`undefine. type=${adornmentItem.itemData.adornmentType}`);
        return;
    }

    // 縮放物品圖
    this.setItemIconScale(this.itemIcon);

    // 裝飾積分
    this.adornmentScore.text = `${adornmentItem.itemData.adornmentScore}`;

    // 物品數量
    this.itemCount.text = `${adornmentItem.count}`;

    // 物品名稱
    this.itemName.text = Localization.getText(LocalKeyType.Common, adornmentItem.itemData.nameKey);

    this.alpha = 1;
  }

  /** 設定 佈置中背包的裝飾物圖片縮放比
   * @param targetIcon 目標圖片
   */
  private setItemIconScale(targetIcon: Phaser.GameObjects.Image): void {
    // 取出高/寬的較大者
    const maxLength = Math.max(targetIcon.width, targetIcon.height);
    // 圖片縮放 = 道具圖片可顯示區域寬度 / 物品圖大小
    let scale = AdornmentNumber.itemCellItemIconAreaWidth / maxLength;
    // 放大上限 為 房間內裝飾物放大比率
    scale = Math.min(scale, AdornmentNumber.originImageScale);
    // 設定圖片縮放
    targetIcon.setScale(scale);
  }

  //#region drag
  /** 開始拖曳裝飾物
   * @param pointer 座標
   */
  private onAdornmentDragStart(pointer: Phaser.Input.Pointer): void {
    // 防呆
    if (this.itemData == null) {
      console.error(`onAdornmentDragStart: itemTableData == null`);
      return;
    }

    // 組成圖檔名稱
    const frameName = `${this.itemData.url}.png`;
    // 若frames中有該圖檔名，表是它是atlas
    if (this.itemIcon.texture.getFrameNames().includes(frameName)) {
      // 使用ui atlas繪製裝飾物
      this.dragingHint = this.addImage(AdornmentString.adornmentAtlas, 0, 0, frameName);
    }
    // 否則是單張png
    else {
      this.dragingHint = this.addImage(this.itemData.nameKey, 0, 0);
    }

    // 建立裝飾物事件(阻擋pointer up)
    this.dragingHint.setInteractive({
      useHandCursor: true,
    });

    // 縮放拖曳圖片，和房間內顯示的道具圖相同
    this.dragingHint.setScale(AdornmentNumber.originImageScale);

    // 顯示拖曳選取框
    this.dragFrame.alpha = 1;

    // 將現在的(被拖動的選單裝飾物圖案)拉到最上層
    this.bringToTop(this.dragingHint);

    // 將目前的物品格拉到最上層
    this.parentContainer.bringToTop(this);

    // 開啟放置區域顯示
    AdornmentManager.instance.switchPutItemArea(true, this.itemData);
  }

  /** 裝飾物拖曳中
   * @param pointer 座標
   */
  private onAdornmentDrag(pointer: Phaser.Input.Pointer): void {
    this.dragingHint.x = pointer.x + this.draggingHintOffsetX;
    this.dragingHint.y = pointer.y + this.draggingHintOffsetY;
  }

  /** 拖曳進入其他物件
   * @param pointer 座標
   * @param zoneObj 被重疊的zone物件
   */
  private onAdornmentDragEnter(pointer: Phaser.Input.Pointer, zoneObj: Phaser.GameObjects.GameObject): void {
    // 取得可放置裝飾物的位置資料，若沒有代表不是在可放置的位置
    const dropData = zoneObj.getData(AdornmentString.ItemDropInfo) as DropAdornmentData;
    const zone = zoneObj as Phaser.GameObjects.Zone;

    // 若背包蓋在zone的上面，略過放置流程
    if (AdornmentGameScene.instance.isOverlayDialog(zone)) {
      return;
    }

    // 播放拖放提示動畫
    this.playDropHintAnimation(dropData);
  }

  /** 拖曳離開其他物件
   * @param pointer 座標
   * @param zoneObj 被重疊的zone物件
   */
  private onAdornmentDragLeave(pointer: Phaser.Input.Pointer, zoneObj: Phaser.GameObjects.GameObject): void {
    // 取得可放置裝飾物的位置資料，若沒有代表不是在可放置的位置
    const dropData = zoneObj.getData(AdornmentString.ItemDropInfo) as DropAdornmentData;

    // 停止動畫
    this.stopDropHintAnimation(dropData);
  }

  /** 拖放裝飾物
   * @param pointer 座標
   * @param zoneObj 被重疊的zone物件
   */
  private onAdornmentDrop(pointer: Phaser.Input.Pointer, zoneObj: Phaser.GameObjects.GameObject): void {
    // 取得可放置裝飾物的位置資料，若沒有代表不是在可放置的位置
    const dropData = zoneObj.getData(AdornmentString.ItemDropInfo) as DropAdornmentData;
    const zone = zoneObj as Phaser.GameObjects.Zone;

    // 若背包蓋在zone的上面，略過放置流程
    if (AdornmentGameScene.instance.isOverlayDialog(zone)) {
      return;
    }

    // 跳過失效的zone(不可拖放的區域:紅色格子)
    if (zoneObj.active === false) {
      return;
    }

    // 防呆
    if (this.itemData == null) {
      console.error(`onAdornmentDrop: itemData == null.`);
      return;
    }

    // 停止動畫
    this.stopDropHintAnimation(dropData);

    // 放置新裝飾物
    AdornmentGameScene.instance.onPlaceAdornment(dropData.adornmentComponent, this.itemData);
  }

  /** 結束拖曳裝飾物
   * @param pointer 座標
   */
  private async onAdornmentDragEnd(pointer: Phaser.Input.Pointer): Promise<void> {
    // 防呆
    if (this.itemData == null) {
      console.error(`onAdornmentDragEnd: itemTableData == null`);
      return;
    }

    // 拖曳結束，才能刪掉舊圖
    this.dragingHint.destroy();

    // 隱藏拖曳選取框
    this.dragFrame.alpha = 0;

    // 關閉放置區域顯示
    AdornmentManager.instance.switchPutItemArea(false, this.itemData);
  }
  //#endregion drag

  /** 播放拖放提示動畫
   * @param dropData 拖放裝飾物資料
   */
  private async playDropHintAnimation(dropData: DropAdornmentData): Promise<void> {
    // 關掉可放置提示圖
    dropData.dropZoneImage.alpha = 0;

    // 放置提示圖移到上層
    dropData.dropHintImage.parentContainer.bringToTop(dropData.dropHintImage);

    // 只有傢俱裝飾物要播動畫，背景都直接顯示提示圖
    if (dropData.adornmentComponent.isTileSpriteItem) {
      dropData.dropHintImage.alpha = 1;
    } else {
      // 重置動畫
      dropData.dropHintImage.alpha = 1;
      dropData.dropHintImage.setScale(1);

      // 放大
      this.scene.tweens.add({
        targets: dropData.dropHintImage,
        duration: this.dropHintTweenSec * 1000,
        scaleX: this.dropHintTweenScale,
        scaleY: this.dropHintTweenScale,
      });
    }
  }

  /** 停止播放拖放提示動畫
   * @param dropData 拖放裝飾物資料
   */
  private stopDropHintAnimation(dropData: DropAdornmentData): void {
    // 停止動畫
    this.scene.tweens.killTweensOf(dropData.dropHintImage);
    // 隱藏拖曳中提示動畫
    dropData.dropHintImage.alpha = 0;

    // 有點擊螢幕時，顯示可放置提示圖
    dropData.dropZoneImage.alpha = 1;
  }
}
