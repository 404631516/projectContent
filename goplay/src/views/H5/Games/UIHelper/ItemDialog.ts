import { Scene } from 'phaser';
import UIDialog from '../../Scripts/Components/UIDialog';
import StoreItemMenu from './StoreItemMenu';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import { ItemData } from '@/manager/TableManager';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import StoreItem from './StoreItem';
import InfoBox from '../../Scripts/Components/InfoBox';
import { TotalProps } from '@/helper/interface/Game';
import { Align } from '../../Helper/MathHelper';
import { BaseSceneString } from '../../Scripts/Data/BaseSceneConfig';

/** 綁定使用的鍵盤 */
export enum BindKeyMapEnum {
  None = -1,
  One = 0,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  ZERO,
}

/** 數字鍵的字碼(鍵盤上1~0) */
const keyMap = [
  BaseSceneString.ItemKey1,
  BaseSceneString.ItemKey2,
  BaseSceneString.ItemKey3,
  BaseSceneString.ItemKey4,
  BaseSceneString.ItemKey5,
  BaseSceneString.ItemKey6,
  BaseSceneString.ItemKey7,
  BaseSceneString.ItemKey8,
  BaseSceneString.ItemKey9,
  BaseSceneString.ItemKey0,
];

export default class ItemDialog<T extends StoreItem<ItemData>> extends UIDialog {
  /** 道具列 */
  private itemMenu!: StoreItemMenu;

  /** 道具尺寸 */
  private itemSize!: Size;

  /** 道具靜態表
   * @param key 道具Id
   * @param value 道具資料
   */
  private itemDataMap!: Map<number, ItemData>;

  /** 鍵盤綁定起始按鍵(None為不啟用) */
  private keyBindStart: BindKeyMapEnum = BindKeyMapEnum.One;

  /** 道具資料Map
   * @param key 道具Id
   * @param value 客製化道具格式
   */
  private storeItemMap: Map<number, T> = new Map<number, T>();

  protected setUI(): void {
    /** */
  }

  /** 初始化並設置道具列
   * @param itemDataList 道具靜態資料表(從Table獲得)
   * @param itemSize 道具的Size
   * @param menuPosition 道具列位置
   * @param menuAlign 道具列對齊方式
   * @param keyBindStart 鍵盤綁定起始按鍵(None為不啟用)
   */
  public init(
    itemDataList: ItemData[],
    itemSize: Size = { width: 60, height: 60 },
    menuPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.centerX, this.height - 40),
    menuAlign: Align = Align.Center,
    keyBindStart: BindKeyMapEnum = BindKeyMapEnum.One
  ): void {
    // 儲存道具靜態表
    this.itemDataMap = new Map(itemDataList.map((itemData: ItemData) => [itemData.id, itemData]));
    // 儲存道具尺寸
    this.itemSize = itemSize;
    // 創建道具列
    this.itemMenu = new StoreItemMenu(this.addObject(menuPosition.x, menuPosition.y), itemSize);
    // 設置對齊點
    this.itemMenu.setAlign(menuAlign);

    // 啟用鍵盤使用道具
    this.keyBindStart = keyBindStart;
  }

  /** 添加道具至道具列
   * @param totalProps 道具數量表(從Web端獲得)
   * @param type 道具客製Type
   * @param onPointerDownCallBack 點擊按鈕的回呼函式
   */
  public async addItems(
    totalProps: TotalProps[],
    type: new (scene: Scene, x: number, y: number, ...args: any) => T,
    onPointerDownCallBack: (item: T) => void
  ): Promise<void> {
    for (const totalProp of totalProps) {
      const itemData = this.itemDataMap.get(totalProp.id);
      if (itemData === undefined) {
        console.error(`道具資料有誤, 無法取得id = ${totalProp.id} 的道具資料`);
        await InfoBox.defaultMessage([this.scene], `道具資料有誤, 無法取得id = ${totalProp.id} 的道具資料`);
        continue;
      }

      // 若道具列已經有此道具，直接加數量
      const oldItem = this.storeItemMap.get(itemData.id);
      if (oldItem) {
        oldItem.gainItem(totalProp.count);
        continue;
      }

      // 沒有則生成道具
      const newItem = this.addObject(
        0,
        0,
        type,
        this.itemSize,
        itemData,
        totalProp.count,
        Localization.getText(LocalKeyType.Common, itemData.contentKey)
      );

      // item 加入清單
      this.storeItemMap.set(itemData.id, newItem);
      // 加進layout
      this.itemMenu.addElements(newItem);

      // 若道具數量超出按鈕表數量，則無法綁定鍵盤
      if (this.storeItemMap.size + this.keyBindStart > keyMap.length) {
        console.error(`storeItemCount(${this.storeItemMap.size}) > BindKeyMapLength(${keyMap.length})`);
        continue;
      }

      // 綁定鍵盤事件
      if (this.keyBindStart === BindKeyMapEnum.None) {
        continue;
      }

      // 綁定按鍵事件
      newItem.setKeyBind(keyMap[this.storeItemMap.size - 1 + this.keyBindStart], () => {
        this.onClickItem(newItem, onPointerDownCallBack);
      });
    }

    // 重算容器範圍及背景，排列容器內元件
    this.itemMenu.draw();
  }

  /** 設定全部道具按鍵圖 */
  public setAllKeyImage(): void {
    // 依序處理每一個道具
    this.storeItemMap.forEach((storeItem) => {
      // 利用extraInfo，顯示快捷鍵文字圖
      storeItem.setExtraInfo(
        storeItem.keyName,
        this.itemSize.width / 2,
        this.itemSize.height / 2,
        (-1 * this.itemSize.width) / 2,
        (-1 * this.itemSize.height) / 2
      );
    });
  }

  private onClickItem(item: T, onPointerDownCallBack: (item: T) => void) {
    if (item.isLackItem) {
      const itemName = Localization.getText(LocalKeyType.Common, item.itemData.nameKey);
      InfoBox.warn([this.scene], `沒有${itemName}的道具囉`);
    } else {
      onPointerDownCallBack(item);
    }
  }

  /** 設置對應道具Highlight
   * @param item 道具
   * @param isHighlight 要設置的Highlight
   */
  public setHighlight(item: T, isHighlight: boolean): void {
    item.setHighlight(isHighlight);
  }

  /** 在功能執行完前設置對應道具Highlight
   * @param item 道具
   * @param pendingFunc 等待要執行的功能，之後取消設置的Highlight
   */
  public async setHighlightPendingUntil(item: T, pendingFunc: Promise<void>): Promise<void> {
    item.setHighlight(true);
    // 等待條件達成
    await pendingFunc;
    // 取消設置的Highlight
    item.setHighlight(false);
  }

  /** 在功能執行完前設置對應道具Highlight及倒數。等待功能執行完，同時關閉Highlight與倒數。
   * @param item 道具
   * @param second 倒數開始的秒數
   * @param pendingFunc 等待要執行的功能
   */
  public async setCountDownPendingUntil(item: T, second: number, pendingFunc: Promise<void>): Promise<void> {
    if (second <= 0) {
      console.error(
        `second: ${second} 秒數錯誤，不應該小或等於0。請確認資料是否有誤，或改為使用setHighlightPendingUntil.`
      );
    }

    // 無條件進位
    item.setBlock(true);
    item.setBlockText(Math.ceil(second).toString());

    // 每0.1秒檢查一次，但倒數只顯示個位數，不顯示小數點
    const timeEvent = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        second -= 0.1;
        // 無條件進位
        item.setBlockText(Math.ceil(second).toString());

        // 當秒數小於1，不再做更新，等待功能執行完成
        if (second < 1) {
          timeEvent.paused = true;
        }
      },
      repeat: second * 10 - 1,
    });

    // 等待功能執行完成
    await this.setHighlightPendingUntil(item, pendingFunc);

    // 關閉道具阻擋
    item.setBlock(false);
    // 清除阻擋文字
    item.setBlockText('');
    // 摧毀timeEvent
    timeEvent.destroy();
  }

  /** 找出當前選擇的選項，顯示highLight，並關閉其他道具Highlight
   * @param item 道具
   */
  public setOnlyHighlight(item: T): void {
    // 設定highLight
    this.storeItemMap.forEach((value, key) => {
      value.setHighlight(key === item.itemData.id);
    });
  }

  /** 找出全部道具並控制highLight
   * @param isHighlight 是否顯示
   */
  public setAllHighlight(isHighlight: boolean): void {
    // 設定highLight
    this.storeItemMap.forEach((value) => {
      value.setHighlight(isHighlight);
    });
  }
  //#endregion

  /** 取得道具按鈕
   * @param itemID 道具id
   */
  public getItem(itemID: number): T | undefined {
    return this.storeItemMap.get(itemID);
  }

  /** 取出道具按鈕
   * @param index 道具索引
   */
  public getItemBtnByIndex(index: number): T | null {
    // 找出指定索引的按鈕
    let isBreak = false;
    let foundBtn = null;
    let findIndex = 0;
    this.storeItemMap.forEach((itemBtn) => {
      if (isBreak) {
        return;
      }
      if (index === findIndex) {
        isBreak = true;
        foundBtn = itemBtn;
      }

      findIndex++;
    });
    return foundBtn;
  }

  /** 取得指定道具以外的其他道具
   *  @returns 其他道具
   */
  public getOtherItems(currentItem: T): T[] {
    const otherItems: T[] = [];
    this.storeItemMap.forEach((item: StoreItem<ItemData>) => {
      if (item !== currentItem) {
        otherItems.push(item as T);
      }
    });
    return otherItems;
  }
}
