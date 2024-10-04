import UIHelper from '@/views/H5/Helper/UIHelper';
import BasePopUpNumberTween from '@/views/H5/Scripts/Components/UI/BasePopUpNumberTween';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { Scene } from 'phaser';
import { AdornmentDepth } from '../Data/AdornmentConfig';

/** 裝飾物-上浮分數字 */
export class AdornmentPopUpNumberTween extends BasePopUpNumberTween {
  /** 能量圖示縮放 */
  protected readonly iconScale: number = 1;

  constructor(scene: Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      {
        fontSize: '36px',
        color: UIHelper.whiteString,
        stroke: UIHelper.whiteString,
        strokeThickness: 0,
      },
      {
        fontSize: '36px',
        color: UIHelper.redString,
        stroke: UIHelper.redString,
        strokeThickness: 0,
      }
    );

    // 背景框
    const plusBg = this.plusPopUpTween.addImage(BaseSceneString.PopupTweenFrame, 0, 0);
    this.plusPopUpTween.sendToBack(plusBg);

    const minusBg = this.minusPopUpTween.addImage(BaseSceneString.PopupTweenFrame, 0, 0);
    this.minusPopUpTween.sendToBack(minusBg);

    // 深度
    this.setDepth(AdornmentDepth.popupTextTween);
  }
}
