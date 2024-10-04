import { HpPopUpType, InteractionEffect, InteractionType } from '@/helper/enum/Combat';
import { HeroData, PiggyEnemyData } from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import BaseBar from '@/views/H5/Scripts/Components/BaseBar';
import BattleUnit, { BattleUnitType } from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BattleUnitFSM from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnitFSM';
import HeartBar from '@/views/H5/Scripts/Components/HeartBar';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { PiggyNumber } from '../Data/PiggyConfig';
import PiggyGameScene from '../Scenes/PiggyGameScene';
import PiggyEnemyFSM from './PiggyEnemyFSM';
import { CompassRad } from '@/views/H5/Helper/MathHelper';

export default class PiggyEnemy extends BattleUnit<PiggyEnemyData> {
  /** 小豬防遊戲場景 */
  public declare scene: PiggyGameScene;

  //#region 繼承屬性
  protected characterOffsetY: number = 30;
  protected characterDeadAlpha: number = 0;
  protected hpBar: BaseBar = this.addObject(
    0,
    -this.battleUnitSize.height / 3,
    HeartBar,
    BaseSceneString.HpBarBg,
    BaseSceneString.HpHeartValue,
    50,
  );
  protected isShowAttributeIcon: boolean = false;
  protected hpPopUpType: HpPopUpType = HpPopUpType.None;
  protected isShowHpBar: boolean = true;
  public battleUnitType: BattleUnitType = BattleUnitType.Enemy;
  public get baseSpeed(): number {
    return PiggyNumber.EnemyBaseSpeed;
  }
  public get baseScale(): number {
    return 0.9;
  }
  public get baseHp(): number {
    return this.battleUnitData.antiTDHp;
  }
  public get baseDefense(): number {
    return 0;
  }
  public set baseDefense(num: number) {
    return;
  }
  /** 取得近戰攻擊道具 */
  public get meleeItemId(): number {
    return this.battleUnitData.meleeItemId;
  }
  /** 取得是否為不可被攻擊敵人 */
  public get isCannotBeHit(): boolean {
    return this.battleUnitData.magic < 0;
  }
  /** 是否被冰凍中 */
  public get isFreezed(): boolean {
    return this.attributes.hasSpecialInteractionType(InteractionType.Freeze);
  }
  public fsm: BattleUnitFSM<BattleUnit<HeroData>> = new PiggyEnemyFSM(this);
  public async onDeadEnterCustom(): Promise<void> {
    await AsyncHelper.pendingUntil(() => this.bindingItem === undefined);

    this.setActive(false);
  }
  protected onUpdateHp(): void {
    // 被打死時變動魔力/分數(跳popUp)
    if (this.hp <= 0) {
      this.scene.enemyKilled(
        this.battleUnitData.score,
        this.battleUnitData.magic,
        new Phaser.Math.Vector2(this.x, this.y),
      );
    }
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

  /** 降落 */
  public onLand(): void {
    // 取消敵人投射物攻擊
    this.unbindItem();

    // 加入對我方投射物無敵
    this.interact(
      0,
      0,
      {
        itemNameKey: '',
        onHitEffectIdList: [],
        type: InteractionType.IgnoreProjectile,
        effect: InteractionEffect.Buff,
        value: 1,
        duration: 999,
        cumulativeValue: 0,
      },
      false,
      false,
    );
    // 免疫非投射物效果(避免被爆炸苦瓜扣血)
    this.interact(
      0,
      0,
      {
        itemNameKey: '',
        onHitEffectIdList: [],
        type: InteractionType.IgnoreNonProjectile,
        effect: InteractionEffect.Buff,
        value: 1,
        duration: 999,
        cumulativeValue: 0,
      },
      false,
      false,
    );
  }

  /** 排隊 */
  public onWait(): void {
    // 清除身上免疫效果
    this.clearIgnoreInfluences();

    // 免疫非投射物效果
    this.interact(
      0,
      0,
      {
        itemNameKey: '',
        onHitEffectIdList: [],
        type: InteractionType.IgnoreNonProjectile,
        effect: InteractionEffect.Buff,
        value: 1,
        duration: 999,
        cumulativeValue: 0,
      },
      false,
      false,
    );

    // 轉身
    this.forwardRotation = CompassRad.Right;
  }

  /** 偷襲 */
  public bindMeleeItem(): void {
    // 綁近戰攻擊
    const itemData = this.scene.getItemData(this.battleUnitData.meleeItemId);
    if (itemData === undefined) {
      return;
    }
    this.bindItemByItemData(itemData, this.battleUnitData.meleeTimes - 1);
  }
}
