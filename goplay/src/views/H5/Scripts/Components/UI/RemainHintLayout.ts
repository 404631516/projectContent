import { Align } from '@/views/H5/Helper/MathHelper';
import HorizontalLayout from '../HorizontalLayout';
import Layout from '../Layout';
import Localization, { LocalKeyType } from '../Localization';
import Object2D from '../Object2D';
import VerticalLayout from '../VerticalLayout';

/** 剩餘數量顯示元件 */
export default abstract class RemainHintLayout extends Object2D {
  //#region readonly
  /** layout的文字x軸間隔 */
  protected abstract readonly textSpacingX: number;

  /** 標題文字顏色 */
  protected abstract readonly titleTextColor: string;
  /** 標題文字大小 */
  protected abstract readonly titleTextFontSize: number;

  /** 剩餘文字顏色 */
  protected abstract readonly remainTextColor: string;
  /** 單位文字顏色 */
  protected abstract readonly unitTextColor: string;
  /** 剩餘/單位文字大小 */
  protected abstract readonly remainUnitTextFontSize: number;
  /** 剩餘/單位文字y軸錨點 */
  protected abstract readonly remainUnitOriginY: number;

  /** 數量文字顏色 */
  protected abstract readonly amountTextColor: string;
  /** 數量文字大小 */
  protected abstract readonly amountTextFontSize: number;
  //#endregion readonly

  /** 數量文字 */
  private amountText!: Phaser.GameObjects.Text;

  /** 排列icon */
  private iconLayout!: HorizontalLayout;
  /** 排列標題 */
  private titleLayout!: Layout;
  /** 排列剩餘數量 */
  private remainLayout!: HorizontalLayout;

  /** 設置ui
   * @param bgKey 背景圖key
   * @param iconKey 圖示key
   * @param iconSize 圖示大小
   * @param titleKey 標題文字多國Key
   * @param isHorizontal true:標題及剩n秒以水平排列
   * @param remainKey 剩餘文字多國Key
   * @param unitKey 單位文字多國Key
   */
  public setUI(
    bgKey: string,
    iconKey: string,
    iconSize: number,
    titleKey: string,
    isHorizontal: boolean,
    remainKey: string,
    unitKey: string
  ): void {
    // 背景
    const bg = this.addImage(bgKey, 0, 0);
    // 背景左端對齊原點
    bg.x = bg.width / 2;
    // 圖示節點
    const iconNode = this.addObject(0, 0);
    // 水平排列 圖示 及 title等
    this.iconLayout = new HorizontalLayout(iconNode);
    this.iconLayout.fitElements = true;
    // 物件左端對齊原點
    this.iconLayout.setAlign(Align.LeftCenter);
    // 圖示
    const icon = iconNode.addImage(iconKey, 0, 0);
    icon.setDisplaySize(iconSize, iconSize);
    this.iconLayout.addElement(icon);

    // 標題節點
    const titleNode = this.addObject(0, 0);
    this.iconLayout.addElement(titleNode);

    // 排列標題及剩n秒，可選擇水平或垂直
    if (isHorizontal) {
      this.titleLayout = new HorizontalLayout(titleNode);
    } else {
      this.titleLayout = new VerticalLayout(titleNode);
    }
    this.titleLayout.fitElements = true;
    // 元件x軸間隔
    this.titleLayout.setSpacing(this.textSpacingX);

    // 標題文字
    this.titleLayout.addElement(
      this.addText(Localization.getText(LocalKeyType.Common, titleKey), 0, 0, {
        color: this.titleTextColor,
        fontSize: `${this.titleTextFontSize}px`,
        strokeThickness: 0,
      })
    );

    // 設置剩餘ui (ex: 剩n次)
    const remainNode = this.setRemainNodeUI(remainKey, unitKey);
    // 加入標題排列
    this.titleLayout.addElement(remainNode);

    // 重算排列(由後往前算)
    this.remainLayout.draw();
    this.titleLayout.draw();
    this.iconLayout.draw();
  }

  /** 設置剩餘節點ui
   * @param remainKey 剩餘文字key
   * @param unitKey 單位文字key
   * @returns 容器物件
   */
  private setRemainNodeUI(remainKey: string, unitKey: string): Object2D {
    // 剩餘數量節點
    const remainNode = this.addObject(0, 0);

    // 水平排列剩餘數量layout
    this.remainLayout = new HorizontalLayout(remainNode);
    this.remainLayout.fitElements = true;
    // 元件x軸間隔
    this.remainLayout.setSpacing(this.textSpacingX);

    // 剩餘文字
    const remainText = this.addText(Localization.getText(LocalKeyType.Common, remainKey), 0, 0, {
      color: this.remainTextColor,
      fontSize: `${this.remainUnitTextFontSize}px`,
      strokeThickness: 2,
    });

    // 數量文字
    this.amountText = this.addText('0', 0, 0, {
      color: this.amountTextColor,
      fontSize: `${this.amountTextFontSize}px`,
      strokeThickness: 0,
    });

    // 單位文字
    const unitText = this.addText(Localization.getText(LocalKeyType.Common, unitKey), 0, 0, {
      color: this.unitTextColor,
      fontSize: `${this.remainUnitTextFontSize}px`,
      strokeThickness: 2,
    });

    // 設定origin以讓"剩n秒"的中文部份為下標字
    remainText.setOrigin(0.5, this.remainUnitOriginY);
    unitText.setOrigin(0.5, this.remainUnitOriginY);

    // 水平排列
    this.remainLayout.addElements([remainText, this.amountText, unitText]);

    // 重算容器範圍及背景，排列容器內元件
    this.remainLayout.draw();
    return remainNode;
  }

  /** 設置數量文字
   * @param amount 要顯示的數量文字
   */
  public setAmountText(amount: string): void {
    // 更新數量文字
    this.amountText.setText(amount);
    // 重算排列
    this.remainLayout.draw();
    this.titleLayout.draw();
    this.iconLayout.draw();
  }
}
