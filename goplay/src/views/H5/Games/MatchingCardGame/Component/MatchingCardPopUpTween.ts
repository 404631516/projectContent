import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import BasePopUpNumberTween from '@/views/H5/Scripts/Components/UI/BasePopUpNumberTween';
import { Scene } from 'phaser';
import { MatchingCardString, MatchingCardDepth } from '../Data/MatchingCardConfig';

/** 翻翻牌-獲得能量上浮字 */
export class MatchingCardGainEnergyPopUpTween extends BasePopUpNumberTween {
  /** 能量圖示縮放 */
  protected readonly iconScale: number = 0.5;

  constructor(scene: Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      {
        fontSize: '20px',
        color: '#6EFFFF',
        stroke: UIHelper.blackString,
        strokeThickness: 3,
      },
      {
        fontSize: '20px',
        color: UIHelper.redString,
        stroke: UIHelper.redString,
        strokeThickness: 3,
      }
    );

    // 背景框
    const plusBg = this.plusPopUpTween.addImage(MatchingCardString.MatchGainEnergyBG, 0, 0);
    this.plusPopUpTween.sendToBack(plusBg);

    const minusBg = this.minusPopUpTween.addImage(MatchingCardString.MatchGainEnergyBG, 0, 0);
    this.minusPopUpTween.sendToBack(minusBg);

    // 深度
    this.setDepth(MatchingCardDepth.PopupTextTween);
  }
}

/** 翻翻牌-配對失敗懲罸上浮字 */
export class MatchingCardPenaltyPopUpTween extends BasePopUpNumberTween {
  /** 原因-文字大小 */
  private readonly reasonTextFontSize: string = '13px';
  /** 原因-文字key */
  private readonly reasonTextKey: string = 'matchingCard_notMatchPenalty';

  /** 能量圖示-縮放 */
  protected readonly iconScale: number = 0.3;

  /** 理由文字 */
  protected reasonText: Phaser.GameObjects.Text;

  /** 建構子
   * @param scene 場景
   * @param x 位置
   * @param y 位置
   */
  constructor(scene: Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      {
        fontSize: '16px',
        color: UIHelper.whiteString,
        stroke: UIHelper.whiteString,
        strokeThickness: 3,
      },
      {
        fontSize: '12px',
        color: '#FFDA48',
        stroke: '#FF4106',
        strokeThickness: 3,
      }
    );

    // 背景框
    const plusBg = this.plusPopUpTween.addImage(MatchingCardString.MatchGainEnergyBG, 0, 0);
    this.plusPopUpTween.sendToBack(plusBg);

    const minusBg = this.minusPopUpTween.addImage(MatchingCardString.NotMatchPenaltyEnergyBG, 0, 0);
    this.minusPopUpTween.sendToBack(minusBg);

    // 理由文字
    this.reasonText = this.addText(Localization.getText(LocalKeyType.Common, this.reasonTextKey), 0, 0, {
      fontSize: this.reasonTextFontSize,
      strokeThickness: 0,
    });

    // 深度
    this.setDepth(MatchingCardDepth.PopupTextTween);
  }

  /** 播放翻翻牌數值動畫
   * @param value 數值
   * @param iconKey 數值的圖示，若不給就不會顯示
   */
  public playMatchingCardTween(value: number, iconKey: string): void {
    // 開啟自身
    this.setActive(true);

    // 依照正負數設置顯示並播放popUp動畫
    if (value > 0) {
      this.plusPopUpTween.setDisplay(`+${value}`, iconKey, this.iconScale);
      this.plusPopUpTween.layout.addElementAtFront(this.reasonText);
      this.plusPopUpTween.playTween();
    } else {
      this.minusPopUpTween.setDisplay(`${value}`, iconKey, this.iconScale);
      this.minusPopUpTween.layout.addElementAtFront(this.reasonText);
      this.minusPopUpTween.playTween();
    }

    // 動畫播放完畢後關閉自身
    AsyncHelper.pendingUntil(() => this.plusPopUpTween.active === false && this.minusPopUpTween.active === false);
    this.setActive(false);
  }
}
