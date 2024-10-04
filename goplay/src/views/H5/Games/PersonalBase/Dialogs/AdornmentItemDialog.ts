import { AdornmentType } from '@/helper/enum/Adornment';
import { ItemType } from '@/helper/enum/AnswerGame';
import { BackpackItem } from '@/helper/interface/Common';
import TableManager from '@/manager/TableManager';
import { Align } from '@/views/H5/Helper/MathHelper';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import UIDialog from '@/views/H5/Scripts/Components/UIDialog';
import AdornmentComponent from '../Components/AdornmentComponent';
import AdornmentItemCell from '../Components/AdornmentItemCell';
import AdornmentItemLayout from '../Components/AdornmentItemLayout';
import { AdornmentNumber, AdornmentString } from '../Data/AdornmentConfig';
import { AdornmentItem } from '../Data/AdornmentInterface';
import AdornmentGameScene from '../Scenes/AdornmentGameScene';

export type Rectangle = Phaser.Geom.Rectangle;

/** 佈置模式的背包dialog */
export default class AdornmentItemDialog extends UIDialog {
  //#region readonly

  /** cell容器高度 */
  private readonly containerHeight: number = 157;
  /** 類別鈕高度 */
  private readonly tabHeight: number = 33;
  /** dialog 大小 */
  private readonly dialogSize: Size = { width: 935, height: this.containerHeight + this.tabHeight };

  /** 裝飾物類型頁籤鈕 開始位置 */
  private readonly typeBtnStartPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(81, 16);
  /** 裝飾物類型頁籤鈕 x間隔 */
  private readonly typeBtnIntervalX: number = 100;

  /** 左翻頁鈕 位置 */
  private readonly leftPageBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(23, 107);
  /** 右翻頁鈕 位置 */
  private readonly rightPageBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    this.dialogSize.width - 23,
    this.leftPageBtnPosition.y
  );
  /** 翻頁鈕 縮放 */
  private readonly pageBtnScale: number = 1.2;

  /** 每頁cell數 */
  private readonly cellCountPerPage: number = 7;

  /** 佈置完成鈕 位置 */
  private readonly exitEditModeBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(847, -5);

  /** 無物品提示 位置 */
  private readonly emptyPromptPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(467, 69);
  /** 無物品跳轉鈕 位置 */
  private readonly emptyBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 50);
  //#endregion readonly

  //#region data
  /** 道具cell水平排列容器 */
  private itemMenu!: AdornmentItemLayout;

  /** 道具CELL物件池 */
  private itemCellList: AdornmentItemCell[] = [];

  /** 裝飾物類型頁籤鈕-底框清單 */
  private typeTabBgList: Phaser.GameObjects.Image[] = [];

  /** 背包翻頁箭頭鈕清單(0左1右) */
  private pageBtnList: Object2D[] = [];

  /** 佈置完成鈕 */
  public exitEditModeBtn!: Phaser.GameObjects.Image;

  /** 無物品提示節點 */
  private emptyPromptNode!: Object2D;
  /** 無物品提示字 */
  private emptyPromptText!: Phaser.GameObjects.Text;
  /** 無物品跳轉鈕 */
  private emptyBtn!: Phaser.GameObjects.Image;

  /** 目前裝飾物類型 */
  private currAdornmentType: AdornmentType = AdornmentType.None;
  /** 目前頁面 */
  private currPageIdx: number = 0;

  /** 全部擁有的道具資料 */
  private currItemList: AdornmentItem[] = [];

  //#endregion data

  /** 查出此類型的最大頁面 */
  private get maxPageByType(): number {
    // 總數/每頁數量 (捨去)
    return Math.ceil(this.currItemList.length / this.cellCountPerPage);
  }

  /** 取得背包ui範圍 */
  public get dialogRect(): Rectangle {
    // 背包ui左上位置
    const dialogWorldPos = UIHelper.calcWorldPosition(this);
    return new Phaser.Geom.Rectangle(dialogWorldPos.x, dialogWorldPos.y, this.dialogSize.width, this.dialogSize.height);
  }

  /** 取得裝飾物類型名稱
   * @param adornmentType 裝飾物類型
   */
  private getAdornmentTypeName(adornmentType: AdornmentType): string {
    return Localization.getText(LocalKeyType.Common, `AdornmentType_${adornmentType}`);
  }

  /** 建立元件 */
  protected setUI(): void {
    // 背包容器底框
    const containerBg = this.addImage(AdornmentString.backpackContainerBg, 0, 0);
    containerBg.x = containerBg.width / 2;
    containerBg.y = AdornmentNumber.itemDialogMenuPositionY;

    // 建立裝飾物類型頁籤鈕
    this.initTypeTabBtn();

    // 建立翻頁鈕
    this.initPageBtn();

    // 佈置完成鈕
    this.exitEditModeBtn = this.addImage(
      AdornmentString.exitEditModeButton,
      this.exitEditModeBtnPosition.x,
      this.exitEditModeBtnPosition.y
    );
    // 設置按下按鈕event
    this.exitEditModeBtn.setInteractive({ useHandCursor: true });

    // 無物品跳轉鈕-節點
    this.emptyPromptNode = this.addObject(this.emptyPromptPosition.x, this.emptyPromptPosition.y);
    this.emptyPromptNode.alpha = 0;

    // 無物品提示文字
    this.emptyPromptText = this.emptyPromptNode.addText('', 0, 0, {
      color: '#FFF',
      fontSize: '22px',
    });

    // 無物品跳轉鈕
    this.emptyBtn = this.emptyPromptNode.addImage(
      AdornmentString.backpackEmptyBtn,
      this.emptyBtnPosition.x,
      this.emptyBtnPosition.y
    );
    // 設置按下按鈕event
    this.emptyBtn.setInteractive({ useHandCursor: true });
    // 設置 無物品跳轉鈕 event;
    this.emptyBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      // 按下 商店鈕
      AdornmentGameScene.instance.onClickStoreBtn();
    });
    // 按鈕文字
    this.emptyPromptNode.addText(
      Localization.getText(LocalKeyType.Common, 'AdornmentBackpack_EmptyBtn'),
      this.emptyBtnPosition.x,
      this.emptyBtnPosition.y,
      {
        color: '#FFF',
        fontSize: '22px',
      }
    );
  }

  /** 建立裝飾物類型頁籤鈕 */
  private initTypeTabBtn(): void {
    // 建立 裝飾物類型頁籤鈕-底框清單
    for (let adornmentType = AdornmentType.None + 1; adornmentType < AdornmentType.Max; adornmentType++) {
      const posX = this.typeBtnStartPosition.x + (adornmentType - 1) * this.typeBtnIntervalX;

      const node = this.addObject(posX, this.typeBtnStartPosition.y);

      // 頁籤鈕底框
      const tabBgBtn = node.addImage(AdornmentString.backpackTypeTab, 0, 0);
      tabBgBtn.setInteractive({ useHandCursor: true });
      // 觸控放開事件-切換類型
      tabBgBtn.on(Phaser.Input.Events.POINTER_UP, () => {
        this.onClickTypeTab(adornmentType);
      });

      // 設定裝飾物類型名稱
      node.addText(this.getAdornmentTypeName(adornmentType), 0, 0, {
        color: '#FFFFFF',
        fontSize: '22px',
      });

      this.typeTabBgList.push(tabBgBtn);
    }
  }

  /** 建立翻頁鈕 */
  private initPageBtn(): void {
    // 背包翻頁箭頭鈕-左
    const leftPageBtnNode = this.addObject(this.leftPageBtnPosition.x, this.leftPageBtnPosition.y);
    const leftPageBtn = leftPageBtnNode.addImage(AdornmentString.backpackPageBtn, 0, 0);
    leftPageBtn.flipX = true;
    leftPageBtn.scale = this.pageBtnScale;
    leftPageBtn.setInteractive({ useHandCursor: true });
    // 觸控放開事件-切換類型
    leftPageBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickPageButton(true);
    });
    this.pageBtnList.push(leftPageBtnNode);

    // 背包翻頁箭頭鈕-右
    const rightPageBtnNode = this.addObject(this.rightPageBtnPosition.x, this.rightPageBtnPosition.y);
    const rightPageBtn = rightPageBtnNode.addImage(AdornmentString.backpackPageBtn, 0, 0);
    rightPageBtn.scale = this.pageBtnScale;
    rightPageBtn.setInteractive({ useHandCursor: true });
    // 觸控放開事件-切換類型
    rightPageBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickPageButton(false);
    });
    this.pageBtnList.push(rightPageBtnNode);
  }

  /** 初始化並設置道具列 */
  public init(): void {
    // 創建 道具cell水平排列容器
    this.itemMenu = new AdornmentItemLayout(this.addObject(
      AdornmentNumber.itemDialogMenuPositionX, AdornmentNumber.itemDialogMenuPositionY)
    );

    // 建立cell的物件池
    for (let index = 0; index < this.cellCountPerPage; index++) {
      // 生成道具cell
      const newItem = this.addObject(
        0,
        0,
        AdornmentItemCell,
        {
          width: AdornmentNumber.itemCellWidth,
          height: AdornmentNumber.itemCellHeight,
        },
        undefined,
        0,
        ''
      );

      // 道具cell 加入清單
      this.itemCellList.push(newItem);
      // 加進layout
      this.itemMenu.addElements(newItem);
    }

    // 重算容器範圍及背景，排列容器內元件
    this.itemMenu.draw();
  }

  /** 開啟背包 */
  public async openDialog(): Promise<void> {
    // 顯示佈置模式背包-選擇預設類型:牆
    this.onClickTypeTab(AdornmentType.Wall);
  }

  /** 切換裝飾物類型頁籤
   * @param adornmentType 裝飾物類型
   * @param itemID 物品id
   */
  private async refreshDialog(adornmentType: AdornmentType, itemID: number): Promise<void> {
    // 記錄類型，並回到第一頁
    this.currAdornmentType = adornmentType;

    // 設定已選擇的tab，alpha=0.5, 否則為1
    for (let index = 0; index < this.typeTabBgList.length; index++) {
      const tabBg = this.typeTabBgList[index];
      tabBg.alpha = index === this.currAdornmentType - 1 ? 1 : 0.75;
    }

    // 依照選擇條件，過濾道具
    await this.filterItemList();

    // 找出該物品的索引
    const itemIndex = this.currItemList.findIndex((item) => itemID === item.itemData.id);
    // 若找不到物品，顯示第一頁; 否則，由物品索引轉頁面索引 (捨去)
    const pageIdx = itemIndex === -1 ? 0 : Math.floor(itemIndex / this.cellCountPerPage);

    // 刷新頁面內裝飾物
    this.refreshPage(pageIdx);
  }

  /** 刷新頁面內裝飾物
   * @param pageIndex 頁數
   */
  private refreshPage(pageIndex: number): void {
    this.currPageIdx = pageIndex;

    // 刷新道具物件池的item cell
    this.refreshItemCellList();
  }

  /** 刷新目前頁面 */
  public async refreshCurrentPage(): Promise<void> {
    // 取得指定類型裝飾物
    await this.filterItemList();
    // 刷新道具物件池的item cell
    this.refreshItemCellList();
  }

  /** 點擊裝飾物類型頁籤鈕
   * @param adornmentType 裝飾物類型
   */
  private async onClickTypeTab(adornmentType: AdornmentType): Promise<void> {
    // 取得裝飾物類型名稱
    const typeName = this.getAdornmentTypeName(adornmentType);
    // 無物品提示文字
    // 訊息: 你目前沒有任何#0喔！
    this.emptyPromptText.text = Localization.getText(LocalKeyType.Common, 'AdornmentBackpack_EmptyHint', [typeName]);

    // 播放音效
    AdornmentGameScene.instance.buttonSoundPool.play();

    // 切換裝飾物類型頁籤
    await this.refreshDialog(adornmentType, AdornmentNumber.invalidID);
  }

  /** 點擊裝飾物類型頁籤鈕
   * @param isPrev 按上一頁
   */
  private onClickPageButton(isPrev: boolean): void {
    // 播放音效
    AdornmentGameScene.instance.buttonSoundPool.play();

    // 向前翻，最小為0
    if (isPrev) {
      // 已到第一頁
      if (this.currPageIdx === 0) {
        return;
      }
      this.currPageIdx--;
    }
    // 向後翻，最大為max
    else {
      // 已到最後頁
      if (this.currPageIdx === this.maxPageByType - 1) {
        return;
      }
      this.currPageIdx++;
    }

    // 刷新道具物件池的item cell
    this.refreshItemCellList();
  }

  /** 佈置模式中刷新背包
   * @param adornmentComponent 裝飾物
   */
  public onAdornmentUpdate(adornmentComponent: AdornmentComponent): void {
    // 移除
    if (adornmentComponent.itemID === AdornmentNumber.invalidID) {
      // 不是目前頁面，不刷新
      if (this.currAdornmentType !== adornmentComponent.adornmentType) {
        return;
      }
      // 刷新目前頁面
      else {
        this.refreshCurrentPage();
      }
    }
    // 放置
    else {
      // 暫存目前頁面
      const pageIndex = this.currPageIdx;
      // 刷新全部道具
      this.refreshDialog(this.currAdornmentType, adornmentComponent.itemID);
      // 從後面的頁面，切換到第一頁(找不到item)
      if (pageIndex > 0 && this.currPageIdx === 0) {
        // 回到原來頁面的上一頁
        this.refreshPage(pageIndex - 1);
      }
    }
  }

  /** 切換到目標道具id的分類及頁面
   * @param itemID 裝飾物id
   */
  public async switchToTargetItemPage(itemID: number): Promise<void> {
    // 裝飾物靜態表
    const itemData = TableManager.adornmentItem.findOne(itemID);
    if (itemData == null) {
      console.error(`switchToTargetItemPage: itemData == null. itemID=${itemID}`);
      return;
    }

    // 依目前道具的類型，切換裝飾物類型頁籤
    await this.refreshDialog(itemData.adornmentType, itemID);
  }

  /** 刷新翻頁按鈕 */
  private refreshPageButton(): void {
    const prevPageBtn = this.pageBtnList[0];
    const nextPageBtn = this.pageBtnList[1];

    // 按鈕先正常顯示
    prevPageBtn.alpha = 1;
    nextPageBtn.alpha = 1;

    // 此類型無物品
    const isEmpty = this.currItemList.length === 0;

    // 此類型無物品 OR 上一頁沒有資料了，設為半透明
    if (isEmpty || this.currPageIdx === 0) {
      prevPageBtn.alpha = 0.5;
    }
    // 此類型無物品 OR 下一頁沒有資料了，設為半透明
    if (isEmpty || this.currPageIdx === this.maxPageByType - 1) {
      nextPageBtn.alpha = 0.5;
    }
  }

  /** 依照選擇條件，過濾道具 */
  private async filterItemList(): Promise<void> {
    // 取得裝飾物背包
    const allItemList: BackpackItem[] = await StoreHelper.$$store.dispatch('getItemList', ItemType.AdornmentItem);

    // 找出指定類型裝飾物
    this.currItemList = [];
    allItemList.forEach((backpackItem) => {
      // 取得裝飾物靜態表
      const itemTable = TableManager.adornmentItem.findOne(backpackItem.itemId);
      if (itemTable == null) {
        console.error(`filterItemList: itemTable == null. id=${backpackItem.itemId}`);
        return false;
      }

      // 比對裝飾物類型
      if (itemTable.adornmentType === this.currAdornmentType) {
        this.currItemList.push({
          itemData: itemTable,
          count: backpackItem.useNum,
        });
      }
    });

    // 背包無物品提示
    const isHadItem = this.currItemList.length > 0;
    this.emptyPromptNode.alpha = isHadItem ? 0 : 1;
    this.itemMenu.container.setAlpha(isHadItem ? 1 : 0);
  }

  /** 刷新道具物件池的item cell */
  private refreshItemCellList(): void {
    // 計算頁面對應的索引
    const startIndex = this.currPageIdx * this.cellCountPerPage;
    const endIndex = startIndex + this.cellCountPerPage;

    // 取出開始~結束(不含)索引的道具資料
    const currPageItemList = this.currItemList.slice(startIndex, endIndex + 1);

    // 刷新cell的物件池
    for (let index = 0; index < this.itemCellList.length; index++) {
      const itemCell = this.itemCellList[index];
      // 無資料，清除
      if (index >= currPageItemList.length) {
        itemCell.clearData();
      }
      // 有資料，刷新物品資訊
      else {
        itemCell.setItemInfo(currPageItemList[index]);
      }
    }

    // 刷新翻頁按鈕
    this.refreshPageButton();
  }

  /** 指定座標在dialog範圍內
   * @param pointer 座標
   */
  public isInsideDialog(pointer: Phaser.Input.Pointer): boolean {
    const dialogTop = this.y;
    const dialogLeft = this.x;
    return (
      pointer.x >= dialogLeft &&
      pointer.y >= dialogTop &&
      pointer.x <= dialogLeft + this.dialogSize.width &&
      pointer.y <= dialogTop + this.dialogSize.height
    );
  }
}
