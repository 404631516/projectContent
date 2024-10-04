import TableManager, { CombatItemData, EffectData, HeroData } from '@/manager/TableManager';
import BaseItem, { BaseItemConfig } from './Item/BaseItem';
import CombatGroups from './CombatGroups';
import BattleUnit from './Battle/BattleUnit';
import BaseGameScene from '../BaseGameScene';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import SoundPool from '@/views/H5/Games/Common/SoundPool';
import { InteractionType } from '@/helper/enum/Combat';
import { InfluenceTypeEffect } from './Battle/Attribute';

/** 戰鬥系統元件(實現共用功能)、建議在scene.create時才做初始化 */
export class CombatComponent {
  /** 場景特效圖片群組 */
  public effectSpriteGroup!: Phaser.GameObjects.Group;

  constructor(private scene: BaseGameScene & ICombatScene) {
    // 設置表演圖片群組
    this.effectSpriteGroup = this.scene.add.group({ classType: Phaser.GameObjects.Sprite });
  }

  /** 獲取特效資料
   * @param effectId 特效id
   */
  public getEffectData(effectId: number): EffectData | undefined {
    const effectData = TableManager.combatEffect.findOne(effectId);
    if (effectData === undefined) {
      console.error(`無法從 TableManager.piggyEffect 中獲取 effectId = ${effectId} 的特效資料`);
    }
    return effectData;
  }

  /** 在遊戲地圖上播放特效
   * @param x 位置X
   * @param y 位置Y
   * @param effectId 特效id
   */
  public async playEffectOnMap(x: number, y: number, effectId: number): Promise<Phaser.Tweens.Tween | undefined> {
    // 獲取特效資料
    const effectData = this.getEffectData(effectId);
    if (effectData === undefined) {
      return;
    }
    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectSpriteGroup.get(x, y);
    if (effectSprite === null) {
      console.error(`playEffectOnMap error: this.effectSpriteGroup 物件池讀取錯誤.`);
      return;
    }
    // 播放特效
    effectSprite.setDepth(y);
    effectSprite.setActive(true);
    return AnimationHelper.setTweenFromEffectData(effectSprite, effectData, false);
  }

  /** 取得道具Instance
   * @param x 位置x
   * @param y 位置y
   * @param itemConfig 道具Config
   * @returns 道具Instance
   */
  public getItemInstance(x: number, y: number, itemConfig: BaseItemConfig): BaseItem | undefined {
    // 創建道具Instance
    const itemInstance = this.scene.combatGroups.getMemberFromGroup<BaseItem>(itemConfig.itemData.itemFunction);
    if (itemInstance === undefined) {
      console.error(`AntiTDGameScene.getItemInstance 無法創建道具Instance.`);
      return undefined;
    }
    // 設定道具地點
    itemInstance.setPosition(x, y);
    // 初始化道具
    itemInstance.init(itemConfig);
    return itemInstance;
  }

  /** 生成擊中生成的道具
   * @param x 位置x
   * @param y 位置y
   * @param itemConfig 道具Config
   * @param refreshTimes 道具重複使用次數
   */
  public spawnOnHitItem(x: number, y: number, itemConfig: BaseItemConfig, refreshTimes: number): BaseItem | undefined {
    // spawnOnHitItemId = -1 為不生成道具
    if (itemConfig.itemData.spawnOnHitItemId === -1) {
      return;
    }
    // 取得要生成的道具資料
    const itemData = this.scene.getItemData(itemConfig.itemData.spawnOnHitItemId);
    if (itemData === undefined) {
      return;
    }
    // 要生成的道具Config
    const newItemConfig = {
      itemData,
      instigator: itemConfig.instigator,
      itemOperationList: itemConfig.itemOperationList,
      isIgnorefollow: true,
      refreshTimes,
    };

    // 取得道具Instance
    return this.getItemInstance(x, y, newItemConfig);
  }

  /** 播放音效
   * @param audioId 音效id
   */
  public playAudio(audioId: number): void {
    const audio = this.scene.audioMap.get(audioId);
    if (audio == null) {
      console.error('請載入音效並設置audioMap');
    }
    audio?.play();
  }
}

/** 使用戰鬥系統的場景需要繼承 */
export interface ICombatScene {
  /** 戰鬥系統元件 */
  combatComponent: CombatComponent;
  /** 戰鬥相關群組管理 */
  combatGroups: CombatGroups;
  /** 戰鬥音效Map */
  audioMap: Map<number, SoundPool>;
  /** 狀態特效對應表
   * InteractionType 特效對應到什麼狀態
   * InfluenceTypeEffect[] 長度2，InfluenceTypeEffect[0]是Buff時的效果、InfluenceTypeEffect[1]是Debuff時的效果。
   * InfluenceTypeEffect.startEffectIdList 觸發的當下要播的特效。
   * InfluenceTypeEffect.persistentEffectIdList 狀態持續時重複播放的特效
   */
  combatInfluenceTypeEffectMap: Map<InteractionType, InfluenceTypeEffect[]>;

  /** 世界上邊緣Y */
  worldTopEdgeY: number;
  /** 世界下邊緣Y */
  worldBottomEdgeY: number;
  /** 世界左邊緣X */
  worldLeftEdgeX: number;
  /** 世界右邊緣X */
  worldRightEdgeX: number;

  /** 獲取道具資料
   * @param itemId 道具id
   */
  getItemData(itemId: number): CombatItemData | undefined;

  /** 獲取戰鬥單位道具資料
   * @param unitData 戰鬥單位資料
   * @param level 等級(自定義計算)
   * @returns 道具資料
   */
  getBattleUnitItemData(unitData: HeroData, level: number): CombatItemData | undefined;

  /** 請在scene.preload中載入戰鬥系統所需特效資源 */
  preloadEffect(): void;
  /** 請在scene.preload中載入戰鬥系統所需音效資源 */
  preloadAudio(): void;
  /** 設置戰鬥系統中角色走路動畫、道具特效等.. */
  createEffect(): void;
  /** 設置戰鬥系統中道具發動音效SoundPool並存入audioMap */
  createAudio(): void;
}

/** 將Bodies過濾出敵對戰鬥單位並返回
 * @param instigator 發起單位
 * @param bodies 要過濾的目標
 * @returns 敵對戰鬥單位們
 */
export function filterHostileBattleUnits(
  instigator: BattleUnit<HeroData>,
  bodies: Phaser.Physics.Arcade.Body[]
): Array<BattleUnit<HeroData>> {
  const hostileBodies = bodies.filter((body: Phaser.Physics.Arcade.Body) => {
    // 非戰鬥單位，返回false
    if (body.gameObject instanceof BattleUnit === false) {
      return false;
    }

    const battleUnit = body.gameObject as BattleUnit<HeroData>;
    // 目標已死亡，返回false
    if (battleUnit.isAlive === false) {
      return false;
    }

    // 返回是否為敵對關係
    return instigator.battleUnitType !== battleUnit.battleUnitType;
  });

  // 轉換成BattleUnit後返回
  return hostileBodies.map((body: Phaser.Physics.Arcade.Body) => body.gameObject as BattleUnit<HeroData>);
}
