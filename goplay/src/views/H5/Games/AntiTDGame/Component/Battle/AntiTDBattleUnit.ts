import { AntiTDEnemyData, HeroData } from '@/manager/TableManager';
import AntiTDGameScene from '../../Scenes/AntiTDGameScene';
import AttributeHelper, { AttributeRelation } from '@/views/H5/Helper/AttributeHelper';
import BattleUnitFSM from '../../../../Scripts/Components/Combat/Battle/BattleUnitFSM';
import AntiTDBattleUnitFSM from './AntiTDBattleUnitFSM';
import BattleUnit, { BattleUnitType } from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BaseBar from '@/views/H5/Scripts/Components/BaseBar';
import HealthBar from '@/views/H5/Scripts/Components/HealthBar';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { HpPopUpType } from '@/helper/enum/Combat';

/** 英雄 */
export class AntiTDHero extends BattleUnit<HeroData> {
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;

  public readonly battleUnitType: BattleUnitType = BattleUnitType.Hero;
  protected readonly characterOffsetY: number = 0;
  protected readonly characterDeadAlpha: number = 0.5;
  protected hpBar: BaseBar = this.addObject(
    0,
    -this.battleUnitSize.height / 2 - this.hpBarSize.height * 1.5,
    HealthBar,
    BaseSceneString.HpBarBg,
    BaseSceneString.HpBarValue
  );
  protected isShowAttributeIcon: boolean = true;
  protected hpPopUpType: HpPopUpType = HpPopUpType.None;
  protected isShowHpBar: boolean = true;
  public get baseSpeed(): number {
    return this.battleUnitData.antiTDSpeed;
  }
  public get baseScale(): number {
    return this.battleUnitData.antiTDSizeScale;
  }
  public get baseHp(): number {
    return this.battleUnitData.antiTDHp;
  }
  public get baseDefense(): number {
    return this.battleUnitData.antiTDDefense;
  }
  public set baseDefense(num: number) {
    this.battleUnitData.antiTDDefense = num;
  }

  public fsm: BattleUnitFSM<BattleUnit<HeroData>> = new AntiTDBattleUnitFSM(this);

  public onDeadEnterCustom(): void {
    this.scene.clearHeroItemStateIcon(this);
    this.setActive(false);
  }

  protected onPlayEffect(itemNameKey: string): void {
    // 沒有itemNameKey，或itemNameKey的Icon不存在就不開啟圖示
    if (itemNameKey === '' || this.scene.textures.exists(itemNameKey) === false) {
      return;
    }

    // 開啟英雄圖示
    this.scene.showHeroItemStateIcon(this, itemNameKey);
  }
  protected onCloseEffect(itemNameKey: string): void {
    // 關閉英雄圖示
    this.scene.hideHeroItemStateIcon(this, itemNameKey);
  }

  protected onUpdateHp(): void {
    // 更新英雄道具UI血條
    this.scene.updateHeroItems([this]);
  }

  public isAttributeAdvantage(target: BattleUnit<HeroData>): boolean {
    // 同屬性攻擊佔有優勢
    return AttributeHelper.attributeRelationship(this.attribute, target.attribute) === AttributeRelation.Advantage;
  }
}

/** 敵人 */
export class AntiTDEnemy extends BattleUnit<AntiTDEnemyData> {
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;

  public readonly battleUnitType: BattleUnitType = BattleUnitType.Enemy;
  protected readonly characterOffsetY: number = 30;
  protected readonly characterDeadAlpha: number = 0;
  protected hpBar: BaseBar = this.addObject(
    0,
    -this.battleUnitSize.height / 2 - this.hpBarSize.height * 1.5,
    HealthBar,
    BaseSceneString.HpBarBg,
    BaseSceneString.HpBarValue
  );
  protected isShowAttributeIcon: boolean = true;
  protected hpPopUpType: HpPopUpType = HpPopUpType.All;
  protected isShowHpBar: boolean = true;
  public get baseSpeed(): number {
    return this.battleUnitData.antiTDSpeed;
  }
  public get baseScale(): number {
    return this.battleUnitData.antiTDSizeScale;
  }
  public get baseHp(): number {
    return this.battleUnitData.antiTDHp;
  }
  public get baseDefense(): number {
    return this.battleUnitData.antiTDDefense;
  }
  public set baseDefense(num: number) {
    this.battleUnitData.antiTDDefense = num;
  }

  public fsm: BattleUnitFSM<BattleUnit<HeroData>> = new AntiTDBattleUnitFSM(this);

  public onDeadEnterCustom(): void {
    this.body.setVelocity(0);

    // 生成魔力球
    this.scene.spawnEnergyBall(this.x, this.y, this.battleUnitData.magic);
    // 更新分數
    this.scene.updateScore(this.battleUnitData.score);
    // 更新擊殺數
    this.scene.updateEnemyKills(this.battleUnitData.id);

    // 每0.1秒檢查一次
    const timeEvent = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        // 等待傷害數字播放完成
        if (this.energyTweenTextGroup.getTotalUsed() === 0) {
          // 將自己回收
          this.scene.combatGroups.hideMemberFromGroup(AntiTDEnemy.name, this);
          // 摧毀timeEvent
          timeEvent.destroy();
        }
      },
      repeat: -1,
    });
  }

  protected onPlayEffect(): void {
    /** */
  }
  protected onCloseEffect(): void {
    /** */
  }
  protected onUpdateHp(): void {
    /** */
  }

  public isAttributeAdvantage(target: BattleUnit<HeroData>): boolean {
    // 不論對象為何，都不具有優勢
    return false;
  }
}
