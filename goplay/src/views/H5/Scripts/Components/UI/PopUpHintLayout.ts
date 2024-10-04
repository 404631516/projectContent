import UIHelper from '@/views/H5/Helper/UIHelper';
import { BaseSceneString } from '../../Data/BaseSceneConfig';
import HorizontalLayout from '../HorizontalLayout';
import Localization, { LocalKeyType } from '../Localization';
import Object2D from '../Object2D';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 會移動的圖示及文字提示 */
export default class PopUpHintLayout extends Object2D {
  /** 提示文字顏色 */
  private readonly hintTextStyle: TextStyle = { color: UIHelper.whiteString, fontSize: '22px' };

  /** 淡入持續秒數 */
  private readonly showDuration: number = 250;
  /** 顯示持續秒數 */
  private readonly stayDuration: number = 750;
  /** 淡出持續秒數 */
  private readonly hideDuration: number = 1000;

  /** tweenChain */
  private tweenChain?: Phaser.Tweens.TweenChain;
  /** 提示文字元件 */
  private hintText: Phaser.GameObjects.Text;
  /** layout元件 */
  private layout: HorizontalLayout;

  /** 建構式
   * @param scene 場景
   * @param x 位置x
   * @param y 位置y
   * @param hintIconKey 圖示key，若無則不顯示
   * @param iconSize 圖示尺寸
   * @param backgroundKey 背景key，若無則不顯示
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    hintIconKey: string = '',
    iconSize: number = 40,
    backgroundKey: string = BaseSceneString.GradientGreen
  ) {
    super(scene, x, y);

    // 背景框
    this.addImage(backgroundKey, 0, 0).setScale(0.8);

    // 創建Layout
    this.layout = new HorizontalLayout(this);
    this.layout.fitElements = true;
    // 設置元素間隔
    this.layout.setSpacing(10);

    // 假如有設置提示圖示
    if (hintIconKey !== '') {
      // 提示圖示
      const icon = this.addImage(hintIconKey, 0, 0);
      // 提示圖示尺寸
      icon.setDisplaySize(iconSize, iconSize);

      // 加入Layout
      this.layout.addElement(icon);
    }

    // 標題文字
    this.hintText = this.addText('', 0, 0, this.hintTextStyle);
    // 加入Layout
    this.layout.addElement(this.hintText);

    // 重算排列
    this.layout.draw();

    // 預設隱藏
    this.setAlpha(0);
  }

  /** 播放上浮提示
   * @param hintTextKey 提示文字Key
   */
  public playPopupTween(hintTextKey: string): void {
    // 播放提示動畫
    this.playHintTween(hintTextKey, this.x);
  }

  /** 播放滑出提示
   * @param hintTextKey 提示文字Key
   */
  public playSlideTween(hintTextKey: string, targetPositionX: number): void {
    // 播放提示動畫
    this.playHintTween(hintTextKey, targetPositionX);
  }

  /** 播放提示動畫
   * @param hintTextKey 提示文字Key
   */
  private playHintTween(hintTextKey: string, targetPositionX: number): void {
    // 設置提示文字
    this.setHintText(hintTextKey);

    // 移除先前動畫
    if (this.tweenChain !== undefined) {
      this.tweenChain.destroy();
    }

    // 備份原始位置
    const originPositionX = this.x;

    // 建立，並播放TweenChain動畫
    this.tweenChain = this.scene.tweens.chain({
      tweens: [
        // 淡入
        {
          targets: this,
          alpha: 1,
          duration: this.showDuration,
          // 停留幾秒後繼續
          hold: this.stayDuration,
        },
        // 滑出/淡出
        {
          targets: this,
          alpha: 0,
          x: targetPositionX,
          duration: this.hideDuration,
          onComplete: () => {
            // 滑出後，回到原始位置
            this.x = originPositionX;
          },
        },
      ],
    });
  }

  /** 播放左移提示
   * @param hintTextKey 提示字key
   */
  private setHintText(hintTextKey: string): void {
    // 設置提示文字
    this.hintText.setText(Localization.getText(LocalKeyType.Common, hintTextKey));
    // 重算排列
    this.layout.draw();
  }
}
