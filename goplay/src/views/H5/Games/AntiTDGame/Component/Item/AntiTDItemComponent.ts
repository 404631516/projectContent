import { Scene } from 'phaser';
import { CombatItemData } from '@/manager/TableManager';
import { Size } from '../../../../Helper/PhaserHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import AntiTDItem from './AntiTDItem';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 逆塔防道具 */
export default class AntiTDItemComponent extends Object2D {
  /** 物件本身尺寸 */
  private readonly ordinarySize: Size = { width: 40, height: 60 };
  /** 道具尺寸 */
  private readonly ordinaryItemSize: Size = { width: 40, height: 40 };
  /** 魔力圖標尺寸 */
  private readonly energyIconSize: Size = { width: 10, height: 10 };
  /** 魔力圖標位置 */
  private readonly energyIconPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-18, 28);
  /** 魔力文字位置 */
  private readonly energyTextPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(6, 28);
  /** 魔力文字，可用時顏色提示 */
  private readonly energyTextAvailableColor: string = UIHelper.cyanString;
  /** 魔力文字，不可用時顏色提示 */
  private readonly energyTextNotAvailableColor: string = UIHelper.indianRedString;
  /** 魔力文字預設風格 */
  private readonly energyTextStyle: TextStyle = { color: this.energyTextNotAvailableColor, fontSize: '14px' };
  /** 無裝備道具覆蓋文字 */
  private readonly emptyItemCoverTextKey: string = 'antiTD_item_empty';
  /** 次要道具縮放值 */
  private readonly secondaryItemScale: number = 0.85;
  /** 次要道具透明度 */
  private readonly secondaryItemAlpha: number = 0.4;

  /** 主要道具 */
  private primaryItem!: AntiTDItem;
  /** 次要道具 */
  private secondaryItem?: AntiTDItem;
  /** 獲取目前主要道具 */
  public get item(): AntiTDItem {
    return this.primaryItem;
  }
  /** 魔力消耗數字 */
  private text: Phaser.GameObjects.Text;
  /** 現有魔力值 */
  private currentEnergy: number = 0;
  /** 是否正在切換道具中 */
  private isSwitch: boolean = false;
  /** 道具實際切換狀態 */
  private isSwitched: boolean = false;

  constructor(scene: Scene, x: number, y: number, size: Size, dataList: CombatItemData[]) {
    super(scene, x, y);
    // 設置本身尺寸
    this.setSize(this.ordinarySize.width, this.ordinarySize.height);
    // 有裝備一個以上道具
    if (dataList.length > 0) {
      // 生成次要道具
      this.secondaryItem = this.addObject(
        20,
        0,
        AntiTDItem,
        this.ordinaryItemSize,
        // 假如沒裝備次要道具，給空資料
        dataList[1] ?? { id: 0 },
        // 假如沒裝備次要道具，不顯示道具說明
        Localization.getText(LocalKeyType.Common, dataList[1] ? dataList[1].contentKey : '')
      );

      // 次要道具關閉說明文字顯示，並設定半透明
      this.secondaryItem.disableInteractive();
      this.secondaryItem.setAlpha(this.secondaryItemAlpha);
      this.secondaryItem.setScale(this.secondaryItemScale);
    }
    // 生成主要道具
    this.primaryItem = this.addObject(
      0,
      0,
      AntiTDItem,
      this.ordinaryItemSize,
      // 假如沒裝備主要道具，給空資料
      dataList[0] ?? { id: 0 },
      // 假如沒裝備主要道具，不顯示道具說明
      Localization.getText(LocalKeyType.Common, dataList[0] ? dataList[0].contentKey : ''),
      // 假如沒裝備主要道具，顯示無裝備道具
      Localization.getText(LocalKeyType.Common, dataList[0] ? '' : this.emptyItemCoverTextKey)
    );
    // 魔力消耗圖標
    const energyIcon = this.addImage(BaseSceneString.EnergyIcon, this.energyIconPosition.x, this.energyIconPosition.y);
    energyIcon.setDisplaySize(this.energyIconSize.width, this.energyIconSize.height);
    energyIcon.setVisible(this.primaryItem.itemData.id !== 0);
    // 魔力消耗數字
    this.text = this.addText(
      `${this.primaryItem.itemData.magic ?? ''}`,
      this.energyTextPosition.x,
      this.energyTextPosition.y,
      this.energyTextStyle
    );

    // 依比例調整大小
    this.setDisplaySize(size.width, size.height);
  }

  /** 顯示魔力值是否足夠使用此道具
   * @param currentEnergy 現有魔力值
   */
  public showAvailable(currentEnergy: number): void {
    this.currentEnergy = currentEnergy;
    this.text.setColor(
      this.currentEnergy >= this.primaryItem.itemData.magic
        ? this.energyTextAvailableColor
        : this.energyTextNotAvailableColor
    );
  }

  /** 設置滑鼠點擊、鍵盤輸入事件
   * @param inputEvent 鍵盤輸入事件
   * @param callback 點擊、輸入觸發callback
   */
  public setOnDownCallBack(inputEvent: string, callback: () => void): void {
    // 綁定點擊事件
    if (this.primaryItem.isEmpty === false) {
      this.primaryItem.on(Phaser.Input.Events.POINTER_DOWN, callback);
      // 綁定鍵盤輸入事件
      this.scene.input.keyboard!.on(inputEvent, callback);
    }
    // 綁定點擊事件
    if (this.secondaryItem?.isEmpty === false) {
      this.secondaryItem?.on(Phaser.Input.Events.POINTER_DOWN, callback);
    }
  }

  /** 切換主要/次要道具
   * @param isSwitched 切換狀態
   * @param switchDuration 切換時間
   */
  public switchItem(isSwitched: boolean, switchDuration: number = 100): void {
    // 沒有次要道具，不切換
    if (this.secondaryItem === undefined || this.secondaryItem.itemData.id === 0) {
      return;
    }
    // 切換狀態一致或正在切換中，不切換
    if (this.isSwitch === true || this.isSwitched === isSwitched) {
      return;
    }
    // 設置正在切換中
    this.isSwitch = true;
    // 設置切換狀態
    this.isSwitched = isSwitched;

    // 開始切換
    this.scene.tweens.chain({
      tweens: [
        {
          targets: this.primaryItem,
          duration: switchDuration,
          offset: 0,
          x: this.secondaryItem.x,
          scale: this.secondaryItemScale,
          alpha: this.secondaryItemAlpha,
          onStart: () => {
            // 暫停主要道具與滑鼠、鍵盤互動
            this.primaryItem.disableInteractive();
            // 手動關閉道具文字說明
            this.primaryItem.showContent(false);
            // 顯示順序交換
            this.moveAbove(this.secondaryItem!, this.primaryItem);
          },
        },
        {
          targets: this.secondaryItem,
          duration: switchDuration,
          offset: 0,
          x: this.primaryItem.x,
          scale: 1,
          alpha: 1,
          onComplete: () => {
            // 交換主要道具與次要道具
            const temp = this.primaryItem;
            this.primaryItem = this.secondaryItem!;
            this.secondaryItem = temp;
            // 重設道具魔力值
            this.text.setText(`${this.primaryItem.itemData.magic ?? ''}`);
            // 重設道具魔力值顏色
            this.text.setColor(
              this.currentEnergy >= this.primaryItem.itemData.magic
                ? this.energyTextAvailableColor
                : this.energyTextNotAvailableColor
            );
            // 恢復主要道具與滑鼠、鍵盤互動
            this.primaryItem.setInteractive();
            // 清除切換中flag
            this.isSwitch = false;
          },
        },
      ],
    });
  }
}
