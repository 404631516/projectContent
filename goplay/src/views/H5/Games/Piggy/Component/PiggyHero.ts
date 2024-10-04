import PiggyheroFSM from './PiggyHeroFSM';
import BattleUnit, { BattleUnitType } from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import { HeroData } from '@/manager/TableManager';
import BattleUnitFSM from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnitFSM';
import PiggyGameScene from '../Scenes/PiggyGameScene';
import { ICombatScene } from '@/views/H5/Scripts/Components/Combat/Combat';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import BaseBar from '@/views/H5/Scripts/Components/BaseBar';
import HealthBar from '@/views/H5/Scripts/Components/HealthBar';
import { HpPopUpType } from '@/helper/enum/Combat';
import { PiggyNumber } from '../Data/PiggyConfig';

// Hero prefab
export default class PiggyHero extends BattleUnit<HeroData> {
  /** 遊戲場景 */
  public declare scene: Phaser.Scene & ICombatScene & PiggyGameScene;
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  //#region 繼承屬性
  protected characterOffsetY: number = 0;
  protected characterDeadAlpha: number = 0;
  protected hpBar: BaseBar = this.addObject(0, 0, HealthBar, BaseSceneString.HpBarBg, BaseSceneString.HpBarValue);
  protected isShowAttributeIcon: boolean = false;
  protected hpPopUpType: HpPopUpType = HpPopUpType.IgnorePositive;
  protected isShowHpBar: boolean = false;
  public battleUnitType: BattleUnitType = BattleUnitType.Hero;
  public fsm: BattleUnitFSM<BattleUnit<HeroData>> = new PiggyheroFSM(this);
  public get baseSpeed(): number {
    return PiggyNumber.HeroBaseSpeed;
  }
  public get baseScale(): number {
    return 0.6;
  }
  public get baseHp(): number {
    return PiggyNumber.HeroBaseHp;
  }
  public get baseDefense(): number {
    return 0;
  }
  public set baseDefense(num: number) {
    return;
  }
  public onDeadEnterCustom(): void {
    return;
  }
  protected onUpdateHp(): void {
    // 同步能量顯示
    this.scene.syncEnergyBarUI(this.hp);
    return;
  }
  protected onPlayEffect(itemNameKey: string): void {
    return;
  }
  protected onCloseEffect(itemNameKey: string): void {
    return;
  }
  public isAttributeAdvantage(target: BattleUnit<HeroData>): boolean {
    return false;
  }
  //#endregion 繼承屬性
}
