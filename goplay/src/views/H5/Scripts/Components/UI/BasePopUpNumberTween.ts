import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { Scene } from 'phaser';
import Object2D from '../Object2D';
import { PopUpTween } from './BasePopUpTween';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 上浮數字(抽象) */
export default abstract class BasePopUpNumberTween extends Object2D {
  /** 能量圖示縮放 */
  protected abstract readonly iconScale: number;

  /** 正數popUp */
  protected plusPopUpTween: PopUpTween;
  /** 負數popUp */
  protected minusPopUpTween: PopUpTween;

  /** Constructor
   * @param scene 場景
   * @param x 位置
   * @param y 位置
   * @param plusPopUpStyle 正數popUp文字風格
   * @param minusPopUpStyle 負數popUp文字風格
   */
  constructor(scene: Scene, x: number, y: number, plusPopUpStyle: TextStyle, minusPopUpStyle: TextStyle) {
    super(scene, x, y);
    // 創建正數popUp
    this.plusPopUpTween = this.addObject(0, 0, PopUpTween, plusPopUpStyle);
    this.plusPopUpTween.setActive(false);
    this.plusPopUpTween.setVisible(false);

    // 創建負數popUp
    this.minusPopUpTween = this.addObject(0, 0, PopUpTween, minusPopUpStyle);
    this.minusPopUpTween.setActive(false);
    this.minusPopUpTween.setVisible(false);
  }

  /** 播放數值跳動
   * @param value 數值
   */
  public popUpNumber(value: number): void {
    this.playNumberTween(value, '');
  }

  /** 播放數值跳動，後綴加上單位
   * @param value 數值
   * @param unit 單位
   */
  public popUpNumberUnit(value: number, unit: string): void {
    this.playNumberTween(value, unit);
  }

  /** 播放數值跳動，前綴加上圖示
   * @param value 數值
   * @param iconKey 圖示key
   */
  public popUpNumberIcon(value: number, iconKey: string): void {
    this.playNumberTween(value, '', iconKey);
  }

  /** 播放PopUp動畫
   * @param value 數值
   * @param unit 數值的單位
   * @param iconKey 數值的圖示，若不給就不會顯示
   */
  private async playNumberTween(value: number, unit: string, iconKey?: string): Promise<void> {
    // 開啟自身
    this.setActive(true);
    this.setVisible(true);

    // 依照正負數設置顯示並播放popUp動畫
    if (value > 0) {
      this.plusPopUpTween.setDisplay(`+${value}` + unit, iconKey, this.iconScale);
      this.plusPopUpTween.playTween();
    } else {
      this.minusPopUpTween.setDisplay(`${value}` + unit, iconKey, this.iconScale);
      this.minusPopUpTween.playTween();
    }

    // 動畫播放完畢後關閉自身
    await AsyncHelper.pendingUntil(() => this.plusPopUpTween.active === false && this.minusPopUpTween.active === false);
    this.setActive(false);
    this.setVisible(false);
  }
}

/** 上浮數字 */
export class PopUpNumberTween extends BasePopUpNumberTween {
  /** 能量圖示縮放 */
  protected iconScale: number = 0.5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      {
        fontSize: '24px',
        color: UIHelper.yellowString,
        stroke: UIHelper.blackString,
        strokeThickness: 3,
      },
      {
        fontSize: '24px',
        color: UIHelper.redString,
        stroke: UIHelper.blackString,
        strokeThickness: 3,
      }
    );
  }
}
