import UIDialog from '../../../Scripts/Components/UIDialog';
import Slider from '../../../Scripts/Components/Slider';
import StoreItemMenu from '../../UIHelper/StoreItemMenu';
import TableManager, { ItemData } from '@/manager/TableManager';
import { HamsterString, HamsterNumber } from '../Data/HamsterConfig';
import { HamsterDefenseItemData, HamsterHitItemData } from '@/manager/TableManager';
import { Size } from '../../../Helper/PhaserHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import UIHelper from '@/views/H5/Helper/UIHelper';
import StoreItem from '../../UIHelper/StoreItem';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';

export default class HamsterMainDialog extends UIDialog {
  /** 殲滅的地鼠數量 */
  public killCount: Readonly<number> = 0;
  private countText!: Phaser.GameObjects.Text;
  private energyBar!: Slider;
  private currentEnergyText!: Phaser.GameObjects.Text;
  /** 道具menu */
  private allItemMenu!: StoreItemMenu;

  /** 防禦道具清單 */
  private defenseItemMap: Map<number, StoreItem<HamsterDefenseItemData>> = new Map();

  /** 攻擊道具清單 */
  private hitItemMap: Map<number, StoreItem<HamsterHitItemData>> = new Map();

  /** 道具icon顯示寬高 */
  private readonly itemSize: Size = { width: 60, height: 60 };

  protected setUI(): void {
    // 目標分數 背景
    this.addImage(HamsterString.Gradient, this.width * 0.9, this.height * 0.1);
    // 目標分數 標題
    this.addText(`目標`, this.width * 0.9, this.height * 0.1, {
      color: UIHelper.yellowString,
    });
    // 目標分數 分數
    this.countText = this.addText(
      `${this.killCount}/${HamsterNumber.TargetKillCount}`,
      this.width * 0.95,
      this.height * 0.1
    );
    // 目標分數 icon
    this.addImage(HamsterString.TargetIcon, this.width * 0.87, this.height * 0.1);

    // 顯示能量
    this.energyBar = this.addObject(this.width * 0.35, this.height * 0.9, Slider, HamsterNumber.BaseEnergy);
    this.energyBar.setValueColor({
      value: 1,
      color: UIHelper.energyBarColor,
    });
    this.energyBar.setBarSize(300, 30, 2, 4, 5);
    // "當前魔力值"字樣
    this.energyBar.addText('當前魔力值', 0, -30);
    // "0/1000" 當前魔力字樣
    this.currentEnergyText = this.energyBar.addText(`${0}/${HamsterNumber.BaseEnergy}`, 0, 0);

    // StoreItemMenu, 道具列表UI
    this.allItemMenu = new StoreItemMenu(this.addObject(this.width * 0.7, this.height * 0.91), this.itemSize);
    // 建立防禦道具清單
    this.defenseItemMap = new Map<number, StoreItem<HamsterDefenseItemData>>();
    // 建立攻擊道具清單
    this.hitItemMap = new Map<number, StoreItem<HamsterHitItemData>>();

    // 顯示icon
    this.addImage(HamsterString.Icon, this.width * 0.18, this.height * 0.9);

    // 設置音訊開關按鈕
    this.addImage('', this.width * 0.95, this.height * 0.9, '', MuteIcon);
  }

  /** 增加防禦道具
   * @param itemId 防禦道具id
   * @param count 防禦道具增加數量
   */
  public addDefenseItem(itemId: number, count: number): void {
    // 取得該道具資訊
    let item = this.defenseItemMap.get(itemId);
    if (item === undefined) {
      // 取得靜態表資訊
      const itemData = TableManager.hamsterDefense.findOne(itemId);
      // 防呆
      if (itemData == null) {
        console.error('HamsterMainDialog.AddDefenseItem() error, itemData not found! itemId = ' + itemId);
        return;
      }
      // 生成icon, 加入StoreItemMenu
      item = this.createItem(itemData, count);
      // 加入defenseItemMap
      this.defenseItemMap.set(itemId, item);
      return;
    }
    // 更新道具數量
    item.gainItem(count);
  }

  /** 增加攻擊道具
   * @param itemId 攻擊道具id
   * @param count 攻擊道具增加數量
   */
  public addHitItem(itemId: number, count: number): void {
    // 取得該道具資訊
    let item = this.hitItemMap.get(itemId);
    if (item === undefined) {
      // 取得靜態表資訊
      const itemData = TableManager.hamsterHit.findOne(itemId);
      // 防呆
      if (itemData == null) {
        console.error('HamsterMainDialog.AddHitItem() error, itemData not found! itemId = ' + itemId);
        return;
      }
      // 生成icon, 加入StoreItemMenu
      item = this.createItem(itemData, count);
      // 加入hitItemMap
      this.hitItemMap.set(itemId, item);
      return;
    }
    // 更新道具數量
    item.gainItem(count);
  }

  /** 新增或減少分數
   * @param score 分數變化量
   */
  public addKillCount(score: number): void {
    this.killCount += score;
    this.countText.setText(`${this.killCount}/${HamsterNumber.TargetKillCount}`);
  }

  /** 新增或減少魔力
   * @param currentEnergy
   */
  public setEnergy(currentEnergy: number): void {
    // 更新 魔力條
    this.energyBar.setValue(currentEnergy);
    // 更新 魔力字樣
    this.currentEnergyText.setText(`${currentEnergy}/${HamsterNumber.BaseEnergy}`);
  }

  /** 防禦, 減少防禦道具數量, 若道具不夠則回傳false
   * @param itemId 需求防禦道具id
   * @returns 是否防禦成功
   */
  public tryUseDefenseItem(itemId: number): boolean {
    // 取得該道具資訊
    const item = this.defenseItemMap.get(itemId);
    if (item === undefined) {
      return false;
    }
    // 數量不夠扣除則回傳false
    if (item.itemCount <= 0) {
      return false;
    }
    // 更新道具數量
    item.useItem();
    return true;
  }

  /** 使用攻擊道具提升打擊次數以及回傳攻擊道具的key
   * @param hp 地鼠剩餘血量
   * @returns hits: 扣除的血量, hitKey: 使用的攻擊圖片key
   */
  public tryUseHitItem(hp: number): { hits: number; hitSpriteKey: string } {
    // 取得使用者手上的攻擊道具
    const iterator = this.hitItemMap.values();

    // 檢查是否有符合攻擊數的道具
    for (const hitItem of iterator) {
      const tableHits = hitItem.itemData.hits;
      // 當道具的攻擊數符合地鼠的剩餘血量, 則使用該道具, 回傳對應的扣血數及攻擊圖片
      if (tableHits === hp && hitItem.itemCount > 0) {
        hitItem.useItem();
        return {
          hits: tableHits,
          hitSpriteKey: hitItem.itemData.spriteKey,
        };
      }
    }
    // 若沒有合適道具, 則回傳預設的扣血數及攻擊圖片
    return {
      hits: 1,
      hitSpriteKey: HamsterString.NormalHit,
    };
  }

  /** 建立道具並加入StoreItemMenu
   * @param itemData 道具資料
   * @param count 道具數量
   * @returns StoreItem
   */
  private createItem<T extends ItemData>(itemData: T, count: number): StoreItem<T> {
    // 建立道具資訊，沒有道具數量則為零
    const item = this.addObject(
      0,
      0,
      StoreItem,
      this.itemSize,
      itemData,
      count ?? 0,
      Localization.getText(LocalKeyType.Common, itemData.nameKey)
    );

    // 設置道具圖片尺寸
    item.setIconSize(80, 80);

    /** 加進道具列表UI */
    this.allItemMenu.addElements(item);
    // 重算容器範圍及背景，排列容器內元件
    this.allItemMenu.draw();

    return item;
  }
}
