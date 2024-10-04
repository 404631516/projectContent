import {
  ignoreInteractionTypes,
  InteractionEffect,
  InteractionType,
  specialInteractionTypes,
} from '@/helper/enum/Combat';
import { HeroData } from '@/manager/TableManager';
import { ICombatScene } from '../Combat';
import BattleUnit from './BattleUnit';

//#region interface
/** 逆塔防道具屬性運算列表 */
export interface ItemOperationList {
  /** 互動數值運算 */
  interactionValue: AttributeOperation;
  /** 發動速率運算 */
  launchRate: AttributeOperation;
  /** 偵測範圍運算 */
  range: AttributeOperation;
}

/** 無任何加乘的道具運算式 */
export const defaultItemOperationList: ItemOperationList = {
  interactionValue: { addition: 0, multiplication: 1 },
  launchRate: { addition: 0, multiplication: 1 },
  range: { addition: 0, multiplication: 1 },
};

/** 逆塔防屬性運算值 */
export interface AttributeOperation {
  /** 加值 */
  addition: number;
  /** 乘值 */
  multiplication: number;
}

/** 屬性影響 */
export interface AttributeInfluence {
  /** 被影響時顯示的道具圖標，'' = 不顯示 */
  itemNameKey: string;
  /** 擊中時觸發的特效id清單 */
  onHitEffectIdList: number[];
  /** 屬性受甚麼互動類型影響 */
  type: InteractionType;
  /** 互動類型的效果 */
  effect: InteractionEffect;
  /** 影響的數值 */
  value: number;
  /** 影響的時間 */
  duration: number;
  /** 累積影響的數值 */
  cumulativeValue: number;
}

/** 屬性影響對應特效 */
export interface InfluenceTypeEffect {
  /** 屬性影響開始特效 */
  startEffectIdList: number[];
  /** 屬性影響持續時間特效 */
  persistentEffectIdList: number[];
}
//#endregion interface

export default class Attribute {
  /** 屬性更新頻率，每0.1秒一次 */
  private readonly updateInterval: number = 0.1;

  /** 遊戲場景 */
  public scene: Phaser.Scene & ICombatScene;
  /** 戰鬥單位 */
  private battleUnit!: BattleUnit<HeroData>;
  /** 屬性增加 */
  private attributeAddition: AttributeInfluence[] = [];
  /** 屬性加乘 */
  private attributeMultiply: AttributeInfluence[] = [];
  /** 屬性效果結束(等到下一幀才做onLeave) */
  private influenceRemoveNextFrameList: AttributeInfluence[] = [];
  /** 屬性TimeEvent */
  private timeEvent!: Phaser.Time.TimerEvent;
  /** 是否有忽略任何負值狀態的influence */
  public get hasIgnore(): boolean {
    return (
      this.hasSpecialInteractionType(InteractionType.IgnoreFront) ||
      this.hasSpecialInteractionType(InteractionType.IgnoreProjectile) ||
      this.hasSpecialInteractionType(InteractionType.IgnoreNonProjectile)
    );
  }

  constructor(scene: Phaser.Scene & ICombatScene) {
    this.scene = scene;
  }

  /** 初始化
   * @param battleUnit 綁定的戰鬥單位
   */
  public init(battleUnit: BattleUnit<HeroData>): void {
    this.battleUnit = battleUnit;

    this.timeEvent = this.scene.time.addEvent({
      delay: 1000 * this.updateInterval,
      callback: () => {
        // 移除到期的影響
        this.removeInfluences();

        // 更新狀態影響，並標記需要被移除的影響
        this.attributeAddition = this.updateInfluences(this.attributeAddition, false);
        this.attributeMultiply = this.updateInfluences(this.attributeMultiply, true);
      },
      repeat: -1,
    });
  }

  /** 關閉功能，不再更新 */
  public disable(): void {
    // 清除所有狀態
    this.attributeAddition = [];
    this.attributeMultiply = [];
    this.influenceRemoveNextFrameList = [];

    // 移除事件
    this.timeEvent?.destroy();
  }

  /** 獲得該屬性數值
   * @param type 屬性類別
   * @param referenceValue 基準數值
   * @returns 以referenceValue為基準，經過計算後的屬性數值
   */
  public getAttributeValue(type: InteractionType, referenceValue: number): number {
    if (type === InteractionType.ClearNegative || type === InteractionType.Revive || type === InteractionType.Hp) {
      // 不在屬性清單裡
      console.error('ClearNegative、Revive、Energy不需計算數值');
      return 0;
    }

    // 總加值
    const addition = this.getAttributeAddition(type) + this.getAttributeAddition(InteractionType.AllPositive);
    // 總加乘值
    const multiply =
      1 + (this.getAttributeMultiply(type) + this.getAttributeMultiply(InteractionType.AllPositive)) / 100;

    return (referenceValue + addition) * multiply;
  }

  /** 獲得道具屬性運算列表
   * @returns 屬性運算值
   */
  public getItemOperationList(): ItemOperationList {
    const operationList: ItemOperationList = {
      interactionValue: this.getAttributeOperation(InteractionType.InteractionValue),
      launchRate: this.getAttributeOperation(InteractionType.LaunchRate),
      range: this.getAttributeOperation(InteractionType.Range),
    };

    return operationList;
  }

  /** 獲得該屬性運算
   * @param type 屬性類別
   * @returns 屬性運算值
   */
  private getAttributeOperation(type: InteractionType): AttributeOperation {
    if (type === InteractionType.ClearNegative || type === InteractionType.Revive || type === InteractionType.Hp) {
      // 不在屬性清單裡
      console.error('ClearNegative、Revive、Energy不需計算數值');
      return { addition: 0, multiplication: 1 };
    }

    // 總加值
    const addition = this.getAttributeAddition(type);
    // 總加乘值
    const multiplication = 1 + this.getAttributeMultiply(type) / 100;
    return { addition, multiplication };
  }

  /** 獲得該屬性加值
   * @param type 屬性類別
   * @returns 屬性加值
   */
  private getAttributeAddition(type: InteractionType): number {
    let addition: number = 0;
    this.attributeAddition.forEach((attributeInfluence: AttributeInfluence) => {
      if (attributeInfluence.type === type || attributeInfluence.type === InteractionType.AllPositive) {
        addition += attributeInfluence.value;
      }
    });
    return addition;
  }

  /** 獲得該屬性加乘值
   * @param type 屬性類別
   * @returns 屬性加乘值
   */
  private getAttributeMultiply(type: InteractionType): number {
    switch (type) {
      case InteractionType.LaunchRate:
        // 冰凍狀態 或 忽略前方攻擊 會使發動速率降至無限低
        if (
          this.hasSpecialInteractionType(InteractionType.Freeze) ||
          this.hasSpecialInteractionType(InteractionType.IgnoreFront)
        ) {
          return -Infinity;
        }
        break;
      case InteractionType.Speed:
        // 冰凍狀態 會使移動速度降至無限低
        if (this.hasSpecialInteractionType(InteractionType.Freeze)) {
          return -Infinity;
        }
        break;
    }

    let multiply: number = 0;
    this.attributeMultiply.forEach((attributeInfluence: AttributeInfluence) => {
      if (attributeInfluence.type === type || attributeInfluence.type === InteractionType.AllPositive) {
        multiply += attributeInfluence.value;
      }
    });
    return multiply;
  }

  /** 設置屬性影響
   * @param influence 屬性影響
   * @param isPercentage 是否為百分比加乘
   */
  public setAttributeInfluence(influence: AttributeInfluence, isPercentage: boolean): void {
    // 及時處理
    if (influence.duration <= 0.1) {
      this.influenceOnce(influence, isPercentage);
      return;
    }

    this.influenceOnEnter(influence, isPercentage);
  }

  /** 清除所有影響列表中負面的影響 */
  public clearAllNegativeInfluences(): void {
    this.attributeAddition = this.clearNegativeInfluences(this.attributeAddition);
    this.attributeMultiply = this.clearNegativeInfluences(this.attributeMultiply);
  }

  /** 清除指定影響列表中負面的影響
   *  @param influences 影響列表
   */
  private clearNegativeInfluences(influences: AttributeInfluence[]): AttributeInfluence[] {
    return influences.filter((influence: AttributeInfluence) => {
      if (influence.value < 0) {
        this.influenceRemoveNextFrameList.push(influence);
        return false;
      }

      return true;
    });
  }

  /** 清除所有影響列表中無視種類的影響 */
  public clearAllIgnoreInfluences(): void {
    this.attributeAddition = this.clearIgnoreInfluences(this.attributeAddition);
    this.attributeMultiply = this.clearIgnoreInfluences(this.attributeMultiply);
  }

  /** 清除指定影響列表中無視種類的影響
   *  @param influences 影響列表
   */
  private clearIgnoreInfluences(influences: AttributeInfluence[]): AttributeInfluence[] {
    return influences.filter((influence: AttributeInfluence) => {
      if (ignoreInteractionTypes.includes(influence.type)) {
        this.influenceRemoveNextFrameList.push(influence);
        return false;
      }

      return true;
    });
  }

  /** 移除過期的影響 */
  private removeInfluences(): void {
    // 被移除的狀態做onLeave處理
    this.influenceRemoveNextFrameList.forEach((influence: AttributeInfluence) => {
      this.influenceOnLeave(influence);
    });
    this.influenceRemoveNextFrameList = [];
  }

  /** 更新狀態影響，並標記需要被移除的影響
   * @param influences 影響列表
   * @returns 篩選後的影響列表
   */
  private updateInfluences(influences: AttributeInfluence[], isPercentage: boolean): AttributeInfluence[] {
    return influences.filter((influence: AttributeInfluence) => {
      if (this.updateInfluence(influence, isPercentage)) {
        return true;
      }

      this.influenceRemoveNextFrameList.push(influence);
      return false;
    });
  }

  /** 更新屬性影響
   * @param influence 要被更新的屬性影響
   * @param isPercentage 是否為百分比影響
   * @returns 更新後是否保留
   */
  private updateInfluence(influence: AttributeInfluence, isPercentage: boolean): boolean {
    // 屬性影響onUpdate
    this.influenceOnUpdate(influence, isPercentage);

    // 扣除影響時間，時間用盡時觸發onLeave
    influence.duration -= this.updateInterval;
    // 只返回還有剩餘影響時間的
    return influence.duration >= this.updateInterval;
  }

  /** 屬性影響即時處理
   * @param influence 屬性影響
   * @param isPercentage 是否為百分比影響
   */
  private influenceOnce(influence: AttributeInfluence, isPercentage: boolean): void {
    switch (influence.type) {
      case InteractionType.Hp:
        // 血量扣減
        const damage = this.calculateHpChangeValue(influence.value, 0);
        isPercentage ? this.battleUnit.updateHpByPercentage(damage) : this.battleUnit.updateHpByValue(damage);
        break;
    }

    // 表演一次擊中特效
    this.battleUnit.playEffectOnce(influence.onHitEffectIdList);
  }

  /** 屬性影響OnEnter
   * @param influence 屬性影響
   * @param isPercentage 是否為百分比影響
   */
  private influenceOnEnter(influence: AttributeInfluence, isPercentage: boolean): void {
    // 儲存至對應的列表
    isPercentage ? this.attributeMultiply.push(influence) : this.attributeAddition.push(influence);
    // 更新道具攻擊力
    this.battleUnit.bindingItem?.updateItemOperationList(this.getItemOperationList());
    // 開啟擊中特效
    this.battleUnit.playEffect(influence.itemNameKey, influence.onHitEffectIdList);
    // 獲取對應特效
    const influenceTypeEffect = this.getInfluenceTypeEffect(influence.type, influence.effect);
    if (influenceTypeEffect === undefined) {
      return;
    }
    // 播放狀態起始特效
    this.battleUnit.playEffectOnce(influenceTypeEffect.startEffectIdList);
    // 開啟狀態特效
    this.battleUnit.playEffect(`${influence.itemNameKey}+State`, influenceTypeEffect.persistentEffectIdList);
  }

  /** 獲取互動類型動應特效
   * @param type 互動類型
   * @param effect 互動效果
   * @returns 屬性影響特效
   */
  private getInfluenceTypeEffect(type: InteractionType, effect: InteractionEffect): InfluenceTypeEffect | undefined {
    const interactionEffectList = this.scene.combatInfluenceTypeEffectMap.get(type);
    if (interactionEffectList === undefined || interactionEffectList.length !== InteractionEffect.MAX) {
      console.error(`${type} 狀態特效陣列未設置，或陣列長度不符合`);
      return undefined;
    }
    return interactionEffectList[effect];
  }

  /** 屬性影響OnUpdate
   * @param influence 屬性影響
   * @param isPercentage 是否為百分比影響
   */
  private influenceOnUpdate(influence: AttributeInfluence, isPercentage: boolean): void {
    switch (influence.type) {
      case InteractionType.Hp:
        // 血量隨時間扣減
        const damage = this.calculateHpChangeValue(influence.value, influence.duration);
        influence.value -= damage;
        influence.cumulativeValue += damage;
        // 在每次duration小數點為0.1時一次扣抵累積的血量
        if ((influence.duration - 0.1) % 1.0 < 0.01) {
          isPercentage
            ? this.battleUnit.updateHpByPercentage(influence.cumulativeValue)
            : this.battleUnit.updateHpByValue(influence.cumulativeValue);
          influence.cumulativeValue = 0;
        }
        break;
    }
  }

  /** 屬性影響OnLeave
   * @param influence 屬性影響
   */
  private influenceOnLeave(influence: AttributeInfluence): void {
    // 更新道具攻擊力
    this.battleUnit.bindingItem?.updateItemOperationList(this.getItemOperationList());
    // 關閉擊中特效
    this.battleUnit.closeEffect(influence.itemNameKey);
    // 獲取對應特效
    const influenceTypeEffect = this.getInfluenceTypeEffect(influence.type, influence.effect);
    if (influenceTypeEffect === undefined) {
      return;
    }
    // 關閉狀態特效
    this.battleUnit.closeEffect(`${influence.itemNameKey}+State`);
  }

  /** 計算血量隨時間流逝的量
   * @param value 總值
   * @param duration 總持續時間
   * @returns 當下受到的傷害
   */
  private calculateHpChangeValue(value: number, duration: number): number {
    // 無敵狀態不扣血
    if (this.hasSpecialInteractionType(InteractionType.Invincible)) {
      return 0;
    }

    let damage = 0;
    if (duration <= this.updateInterval) {
      damage = value;
    } else {
      damage = value / (duration / this.updateInterval);
    }

    return damage;
  }

  /** 是否被特殊互動類別影響
   * @param type 互動類別
   * @returns 是否被影響
   */
  public hasSpecialInteractionType(type: InteractionType): boolean {
    if (specialInteractionTypes.includes(type)) {
      return this.getAttributeAddition(type) > 0;
    }

    console.error(`${type} 並不是特殊狀態，不適用 Attribute.hasSpecialInteractionType `);
    return false;
  }
}
