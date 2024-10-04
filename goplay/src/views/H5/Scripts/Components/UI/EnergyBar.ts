import Slider from '@/views/H5/Scripts/Components/Slider';
import { Scene } from 'phaser';
import UIHelper from '../../../Helper/UIHelper';
import { BaseSceneString } from '../../Data/BaseSceneConfig';
import Localization, { LocalKeyType } from '../Localization';

export default class EnergyBar extends Slider {
  /** 標題文字 */
  private readonly titleText: string = Localization.getText(LocalKeyType.Common, 'currentEnergy');

  /** 魔力值文字 */
  private text: Phaser.GameObjects.Text;

  /** 魔力條icon */
  public energyIcon: Phaser.GameObjects.Sprite;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 0);
    // 魔力條顏色
    this.setValueColor({ value: 1, color: UIHelper.energyBarColor });
    // 魔力條尺寸
    this.setBarSize(200, 30, 1, 2);

    // 魔力條icon
    this.energyIcon = this.addSprite(BaseSceneString.EnergyIcon, -120, 0).setScale(0.7);
    // 魔力條數值文字
    this.text = this.addText(`0/0`, 0, 0);

    // 魔力條標題
    this.addText(this.titleText, 0, -25);
  }

  /** 設置魔力值文字，更新魔力條比例與文字
   * @param currentEnergy 目前魔力
   * @param maximumEnergy 最大魔力
   */
  public updateEnergy(currentEnergy: number, maximumEnergy: number) {
    this.setValue(currentEnergy, maximumEnergy);
    this.text.setText(`${currentEnergy} / ${maximumEnergy}`);
  }
}
