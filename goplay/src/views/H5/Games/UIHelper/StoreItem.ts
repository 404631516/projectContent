import Object2D from '../../Scripts/Components/Object2D';
import { Scene } from 'phaser';
import { Size } from '../../Helper/PhaserHelper';
import HorizontalLayout from '../../Scripts/Components/HorizontalLayout';
import { Align } from '@/views/H5/Helper/MathHelper';
import TextDialog from './TextDialog';
import { ItemData } from '@/manager/TableManager';
import { BaseSceneString } from '../../Scripts/Data/BaseSceneConfig';
import UIHelper from '../../Helper/UIHelper';
import Localization, { LocalKeyType } from '../../Scripts/Components/Localization';

/** 遊戲道具UI物件 */
export default class StoreItem<T extends ItemData> extends Object2D {
  /** 數量文字背景填滿顏色 */
  private readonly countLayoutFillColor: number = 0x302d58;
  /** 數量文字背景填滿半徑 */
  private readonly countLayoutFillRadius: number = 10;
  /** 數量文字背景填滿透明度 */
  private readonly countLayoutFillAlpha: number = 0.8;
  /** 道具背景顏色 */
  private readonly backgroundGraphicColor: number = UIHelper.blackNumber;
  /** 道具背景透明度 */
  private readonly backgroundGraphicAlpha: number = 1;
  /** 道具外框粗細 */
  private readonly frameThin = 3;
  /** 道具外框顏色 */
  private readonly frameColor = UIHelper.whiteNumber;
  /** 道具外框透明度 */
  private readonly frameAlpha = 0.8;
  /** 道具阻擋顏色 */
  private readonly blockGraphicColor: number = UIHelper.blackNumber;
  /** 道具阻擋透明度 */
  private readonly blockGraphicAlpha: number = 0.5;
  /** 道具阻擋文字Style */
  private readonly blockTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    color: UIHelper.yellowString,
    fontSize: '32px',
  };
  /** 道具數量不足圖形顏色 */
  private readonly lackGraphicColor: number = UIHelper.blackNumber;
  /** 道具數量不足圖形透明度 */
  private readonly lackGraphicAlpha: number = 0.75;
  /** 道具數量不足文字Key */
  private readonly lackTextKey: string = 'runOut';
  /** 道具數量不足文字Style */
  private readonly lackTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    color: '#68EBCE',
    fontSize: '13px',
    stroke: '#68EBCE',
    strokeThickness: 0.05,
  };

  /** 道具背景圖形 */
  private backgroundGraphic: Phaser.GameObjects.Graphics;
  /** 道具外框圖形 */
  private frameGraphic: Phaser.GameObjects.Graphics;
  /** 道具圖示 */
  private icon: Phaser.GameObjects.Image;
  /** 道具等級 */
  private itemLevel: Phaser.GameObjects.Image;
  /** 道具額外圖標(自由調整尺寸位置) */
  protected itemExtraInfo: Phaser.GameObjects.Image;
  /** 道具格擋圖形 */
  private blockGraphic: Phaser.GameObjects.Graphics;
  /** 道具格擋文字 */
  private blockText: Phaser.GameObjects.Text;
  /** 道具數量不足提示物件 */
  protected lackHintObject: Object2D;
  /** high light icon */
  private highLightIcon: Phaser.GameObjects.Image;

  /** 道具靜態資料表 */
  public itemData: Readonly<T>;
  /** 道具數量 */
  public itemCount: Readonly<number> = 0;
  /** 道具數量文字顯示 */
  private countText?: Phaser.GameObjects.Text;
  /** 懸浮說明視窗 */
  private textDialog?: TextDialog;
  /** 按鍵事件英文名稱 (ex: keydown-ONE) */
  private _keyName: string = '';
  public get keyName(): string {
    return this._keyName;
  }

  /** 道具數量是否充足 */
  public get isLackItem(): boolean {
    return this.itemCount <= 0;
  }
  /** 是否處於Highlight狀態 */
  public get isHighlight(): boolean {
    return this.highLightIcon.visible;
  }
  /** 是否處阻擋狀態 */
  public get isBlock(): boolean {
    return this.blockGraphic.visible;
  }

  constructor(scene: Scene, x: number, y: number, size: Size, data: T, count: number = -1, content: string = '') {
    super(scene, x, y);
    this.setSize(size.width, size.height);
    // 紀錄靜態資料
    this.itemData = data;

    // 假如數量不是-1
    if (count !== -1) {
      // 顯示數量文字
      this.itemCount = count;
      this.countText = this.addText(`x ${count}`, 0, 0);

      // 設置數量文字Layout
      const countLayout = new HorizontalLayout(this.addObject(0, -size.height * 0.6));
      countLayout.setAlign(Align.BottomCenter);
      countLayout.setElementSize(size.width, this.countText.height);
      countLayout.setFill(this.countLayoutFillColor, this.countLayoutFillRadius, this.countLayoutFillAlpha);
      countLayout.addElements(this.countText);
      // 重算容器範圍及背景，排列容器內元件
      countLayout.draw();
    }

    // 開啟道具input
    this.setInteractive({ useHandCursor: true });
    // 假如有說明文字，建立道具的說明
    if (content !== '') {
      this.textDialog = this.addObject(0, -this.height, TextDialog);
      this.textDialog.setText(content);
      this.textDialog.setVisible(false);

      // 當滑鼠懸浮，顯示說明文字
      this.on(Phaser.Input.Events.POINTER_OVER, () => {
        this.showContent(true);
      });
      this.on(Phaser.Input.Events.POINTER_OUT, () => {
        this.showContent(false);
      });
    }

    this.backgroundGraphic = this.addGraphics(0, 0);
    this.backgroundGraphic.fillStyle(this.backgroundGraphicColor, this.backgroundGraphicAlpha);
    this.backgroundGraphic.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    this.backgroundGraphic.setVisible(false);

    this.frameGraphic = this.addGraphics(0, 0);
    this.frameGraphic.lineStyle(this.frameThin, this.frameColor, this.frameAlpha);
    this.frameGraphic.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    this.frameGraphic.setVisible(false);

    // 創建道具圖示
    this.icon = this.addImage(this.itemData.nameKey, 0, 0);

    // 創建道具等級
    this.itemLevel = this.addImage(BaseSceneString.ItemLv0, 0, 0);
    this.itemLevel.setVisible(false);

    // 創建Highlight圖示
    this.highLightIcon = this.addImage(BaseSceneString.ItemHighlight, 0, 0);
    this.highLightIcon.setVisible(false);

    // 創建道具格擋圖形
    this.blockGraphic = this.addGraphics(0, 0);
    this.blockGraphic.fillStyle(this.blockGraphicColor, this.blockGraphicAlpha);
    this.blockGraphic.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    this.blockGraphic.setVisible(false);

    // 創建道具格擋文字
    this.blockText = this.addText('', 0, 0, this.blockTextStyle);

    // 創建道具數量不足提示物件
    this.lackHintObject = this.addObject(0, 0, Object2D);
    this.lackHintObject.setVisible(false);

    // 創建道具數量不足提示圖形
    const lackGraphic = this.lackHintObject.addGraphics(0, 0);
    lackGraphic.fillStyle(this.lackGraphicColor, this.lackGraphicAlpha);
    lackGraphic.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // 創建道具數量不足提示文字
    this.lackHintObject.addText(Localization.getText(LocalKeyType.Common, this.lackTextKey), 0, 0, this.lackTextStyle);

    // 創建道具左上角額外圖標
    this.itemExtraInfo = this.addImage('', 0, 0);
    this.itemExtraInfo.setVisible(false);
  }

  /** 使用一次道具
   * @returns true:使用成功
   */
  public useItem(): boolean {
    // 道具數量不足，使用失敗!
    if (this.isLackItem) {
      return false;
    }

    // 道具阻擋中，使用失敗!
    if (this.isBlock) {
      return false;
    }

    // 道具數量-1
    this.itemCount -= 1;

    // 更新數量顯示
    this.countText?.setText(`x ${this.itemCount}`);
    // 更新道具數量不足提示
    this.setLackHint();
    return true;
  }

  /** 獲得道具 */
  public gainItem(amount: number): void {
    // 道具數量增加
    this.itemCount += amount;

    // 更新數量顯示
    this.countText?.setText(`x ${this.itemCount}`);
    // 更新道具數量不足提示
    this.setLackHint();
  }

  /** 設置是否顯示文字描述
   * @param isShow 是否顯示
   */
  public showContent(isShow: boolean): void {
    this.textDialog?.setVisible(isShow);
  }

  /** 綁定按鍵事件
   * @param keyName 按鍵事件英文名稱
   * @param callback 按鍵事件callback
   */
  public setKeyBind(keyName: string, callback: () => void): void {
    // 記錄按鍵事件英文名稱
    this._keyName = keyName;

    // 設置按鍵Callback
    this.on(Phaser.Input.Events.POINTER_DOWN, callback);
    this.scene.input.keyboard!.on(`keydown-${this._keyName}`, callback);
  }

  /** 設定是否顯示背景
   * @param isShowBackground 是否顯示背景
   */
  public setBackground(isShowBackground: boolean): void {
    this.backgroundGraphic.setVisible(isShowBackground);
  }

  /** 設定是否顯示外框
   * @param isShowFrame 是否顯示外框
   */
  public setFrame(isShowFrame: boolean): void {
    this.frameGraphic.setVisible(isShowFrame);
  }

  /** 顯示/隱藏highlight
   * @param isHighlight 顯示/隱藏
   */
  public setHighlight(isHighlight: boolean): void {
    this.highLightIcon.setVisible(isHighlight);
  }

  /** 開啟/關閉道具阻擋圖形
   * @param isBlock 是否阻擋
   */
  public setBlock(isBlock: boolean): void {
    this.blockGraphic.setVisible(isBlock);
  }

  /** 設置道具阻擋文字
   * @param blockText 顯示的文字
   */
  public setBlockText(blockText: string): void {
    this.blockText.setText(blockText);
  }

  /** 更新道具數量不足提示 */
  public setLackHint(): void {
    this.lackHintObject.setVisible(this.isLackItem);
  }

  /** 設置道具圖示尺寸
   * @param width 寬
   * @param height 高
   */
  public setIconSize(width: number, height: number): void {
    // 計算icon寬高, 長邊維持, 短邊等比例縮小
    if (this.icon.width > this.icon.height) {
      height = height * (this.icon.height / this.icon.width);
    } else if (this.icon.width < this.icon.height) {
      width = width * (this.icon.width / this.icon.height);
    }

    // 設置icon寬高
    this.icon.setDisplaySize(width, height);
  }

  /** 設置道具左上角的額外圖標
   * @param key 圖標key
   * @param width 寬
   * @param height 高
   * @param x 位置x
   * @param y 位置y
   */
  public setExtraInfo(key: string, width: number, height: number, x: number, y: number): void {
    this.itemExtraInfo.setTexture(key);
    this.itemExtraInfo.setDisplaySize(width, height);
    this.itemExtraInfo.setPosition(x, y);
    this.itemExtraInfo.setVisible(true);
  }

  /** 設定道具等級
   * @param level 等級，-1為不顯示
   * @param width 寬
   * @param height 高
   * @param x 位置x
   * @param y 位置y
   */
  public setItemLevel(level: number, width: number, height: number, x: number, y: number): void {
    if (level === -1) {
      this.itemLevel.setVisible(false);
      return;
    }

    this.itemLevel.setTexture(BaseSceneString.ItemLv + level.toString());
    this.itemLevel.setDisplaySize(width, height);
    this.itemLevel.setPosition(x, y);
    this.itemLevel.setVisible(true);
  }

  /** 設置Highlight圖示尺寸
   * @param width 寬
   * @param height 高
   */
  public setHighlightIconSize(width: number, height: number): void {
    this.highLightIcon.setDisplaySize(width, height);
    this.highLightIcon.setVisible(false);
  }
}
