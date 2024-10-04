import { BattleUnitAttackMode, CombatEffectId, CombatNumber, HpPopUpType, InteractionType } from '@/helper/enum/Combat';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import { CombatItemData, HeroData } from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import Attribute, { AttributeInfluence, defaultItemOperationList } from './Attribute';
import { BattleTeam } from './BattleTeam';
import BattleUnitFSM, { BattleUnitEventId } from './BattleUnitFSM';
import UIHelper from '@/views/H5/Helper/UIHelper';
import AttributeHelper, { AttributeType } from '@/views/H5/Helper/AttributeHelper';
import FlashableSprite from '@/views/H5/Scripts/Components/FlashableSprite';
import PlanetWarHelper from '@/views/H5/Helper/PlanetWarHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { ICombatScene } from '../../../../Scripts/Components/Combat/Combat';
import BaseItem from '@/views/H5/Scripts/Components/Combat/Item/BaseItem';
import SoundPool from '@/views/H5/Games/Common/SoundPool';
import ItemBaseMinion from '@/views/H5/Scripts/Components/Combat/Item/Minion/ItemBaseMinion';
import { BaseSceneString } from '../../../Data/BaseSceneConfig';
import CombatPopUpNumberTween from '@/views/H5/Scripts/Components/Combat/Component/CombatPopUpNumberTween';
import BaseBar from '../../BaseBar';
import { CompassRad } from '@/views/H5/Helper/MathHelper';

//#region interface
/** 戰鬥單位類別 */
export enum BattleUnitType {
  /** 英雄 */
  Hero = 'Hero',
  /** 敵人 */
  Enemy = 'Enemy',
}

/** 道具擊中特效 */
export interface ItemOnHitTween {
  /** 甚麼道具引起的 */
  itemNameKey: string;
  /** 特效Tween清單 */
  effectTweenList: Phaser.Tweens.Tween[];
}
//#endregion interface

/** 角色單位，場上每一隻角色都繼承此Class */
export default abstract class BattleUnit<T extends HeroData> extends Object2D {
  /** 戰鬥遊戲場景 */
  public declare scene: Phaser.Scene & ICombatScene;

  //#region declare、readonly
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** battleUnit */
  protected readonly battleUnitSize: Size = { width: 64, height: 96 };
  /** hpBar尺寸 */
  protected readonly hpBarSize: Size = { width: 56, height: 12 };
  /** attributeIcon位置Y */
  protected readonly attributeIconY: number = -this.battleUnitSize.height / 2 - this.hpBarSize.height * 1.5;
  /** battleUnit上半身高度(含血條) */
  private readonly upHalfHeight =
    this.battleUnitSize.height / 2 + this.hpBarSize.height * 1.5 + this.hpBarSize.height / 2;
  /** battleUnit上半身顯示高度(含血條) */
  public get upHalfDisplayHeight(): number {
    return this.upHalfHeight * this.scale;
  }
  /** 角色左右轉的gap */
  private readonly characterRotateGap: number = 0.1;
  /** 補血閃爍顏色 */
  private readonly hpUpFlashingColor: number = 0x44ff9b;
  /** 清除負面狀態閃爍顏色 */
  private readonly clearNegativeFlashingColor: number = UIHelper.blueNumber;
  //#endregion declare、readonly

  //#region variable、properties
  /** 角色圖檔Y軸offset(為了配合美術圖，英雄與敵人的腳底位置偏差) */
  protected abstract readonly characterOffsetY: number;
  /** 死亡時角色圖檔Alpha */
  protected abstract readonly characterDeadAlpha: number;
  /** 是否顯示屬性Icon */
  protected abstract readonly isShowAttributeIcon: boolean;
  /** 是否顯示傷害數字 */
  protected abstract readonly hpPopUpType: HpPopUpType;
  /** 是否顯示血條 */
  protected abstract readonly isShowHpBar: boolean;
  /** 戰鬥單位類別 */
  public abstract readonly battleUnitType: BattleUnitType;

  /** 用來計算的速度基準 */
  public abstract get baseSpeed(): number;
  /** 用來計算的尺寸基準 */
  public abstract get baseScale(): number;
  /** 用來計算的血量基準 */
  public abstract get baseHp(): number;
  /** 用來計算的防禦基準 */
  public abstract get baseDefense(): number;
  /** 用來計算的防禦基準 */
  public abstract set baseDefense(num: number);

  /** 狀態機 */
  public abstract fsm: BattleUnitFSM<BattleUnit<HeroData>>;
  /** battleUnit資料 */
  protected battleUnitData!: T;
  /** battleUnit等級 */
  protected level!: number;
  /** 血量條 */
  protected hpBar!: BaseBar;
  /** 屬性Icon */
  protected attributeIcon: Phaser.GameObjects.Image;
  /** 角色屬性 */
  protected attributes!: Attribute;
  /** 能量文字動畫 */
  protected energyTweenTextGroup: Phaser.GameObjects.Group;
  /** 特效圖片 */
  protected effectTweenSpriteGroup: Phaser.GameObjects.Group;
  /** 特效圖片Tweens */
  protected itemOnHitTweenList: ItemOnHitTween[] = [];
  /** 使用中的道具Instance */
  protected inUseItemInstances: BaseItem[] = [];
  /** 補血閃爍事件 */
  protected flashingTimeEvent?: Phaser.Time.TimerEvent;
  /** 受傷音效 */
  private hpSfx: SoundPool;
  /** 補血音效 */
  private hpSfxNegative: SoundPool;
  /** 被標記數 */
  private markedAmount: number = 0;
  /** 各角度召喚物清單
   * @param number 召喚物角度，角度0時位於角色正前方
   * @param ItemBaseMinion[] 此角度的所有召喚物
   */
  protected allMinionList: Map<CombatNumber, ItemBaseMinion[]> = new Map();
  /** 取得移動速度 */
  public get speed(): number {
    const speed = this.attributes.getAttributeValue(InteractionType.Speed, this.baseSpeed);
    return Math.max(0, speed);
  }
  /** 取得防禦力 */
  private get defense(): number {
    const defense = this.attributes.getAttributeValue(InteractionType.Defense, this.baseDefense);
    return Math.max(0, defense);
  }
  /** 戰鬥單位id */
  public get unitId(): number {
    return this.battleUnitData.id;
  }
  /** 戰鬥單位屬性 */
  public get attribute(): AttributeType {
    return this.battleUnitData.attribute;
  }
  /** 高度比例 */
  public get heightScale(): number {
    return this.battleUnitData.heightScale;
  }
  /** battleTeam資料 */
  protected _battleTeam!: BattleTeam<BattleUnit<T>>;
  public get battleTeam(): BattleTeam<BattleUnit<T>> {
    return this._battleTeam;
  }
  /** 是否為主動攻擊型 */
  protected _attackMode: BattleUnitAttackMode = BattleUnitAttackMode.Active;
  public get attackMode(): BattleUnitAttackMode {
    return this._attackMode;
  }
  /** 是否為無敵 */
  public get isInvincible(): boolean {
    return this.attributes.hasSpecialInteractionType(InteractionType.Invincible);
  }
  /** 角色圖檔 */
  private flashableCharacter: FlashableSprite;
  /** 角色圖檔NameKey */
  public get characterSpriteNameKey(): string {
    return this.battleUnitData.nameKey;
  }
  /** 角色圖檔尺寸 */
  public get characterSpriteScale(): number {
    return this.baseScale * 0.5;
  }
  /** 隊伍排序順序 */
  protected _teamOrder!: number;
  public get teamOrder(): number {
    return this._teamOrder;
  }
  /** 是否忽略障礙物 */
  private _ignoreObstacle!: boolean;
  public get ignoreObstacle(): boolean {
    return this._ignoreObstacle;
  }
  /** battleUnit的面向
   * 此Container底下的物件(如道具)，會隨角色面向移動
   */
  protected _forward: Object2D;
  public get forward(): Object2D {
    return this._forward;
  }
  /** 取得血量
   * @returns 剩餘血量
   */
  public get hp(): number {
    return this.hpBar.value;
  }
  public get fullHp(): number {
    return this.hpBar.fullValue;
  }
  /** 是否還活著 */
  public get isAlive(): boolean {
    return this.hpBar.isEmpty === false && this.active === true;
  }
  /** 是否滿血 */
  public get isFullHp(): boolean {
    return this.hpBar.isFull;
  }
  /** 綁定的普攻道具 */
  protected _bindingItem?: BaseItem;
  public get bindingItem(): BaseItem | undefined {
    return this._bindingItem;
  }
  /** 綁定的普攻道具Id */
  protected _bindingItemId!: number;
  public get bindingItemId(): number {
    return this._bindingItemId;
  }
  /** 取得面對水平角度(rad) */
  public get horizontalRotation(): CompassRad {
    return this.flashableCharacter.flipX === false ? CompassRad.Left : CompassRad.Right;
  }

  /** 取得battleUnit角度 */
  public get forwardRotation(): number {
    return this._forward.rotation;
  }
  /** 設置battleUnit角度
   * @param rotation 角度(rad)
   */
  public set forwardRotation(rotation: number) {
    // 只有forwardContainer會旋轉，其他物件如 character 不會旋轉，僅會依角度面向左或右
    this._forward.rotation = rotation;
    // 絕對角度 =90 表示向上或向下， <89 表示向右， >91 表示向左
    const absRotation = Math.abs(this._forward.rotation);
    // 如果不是向正上方走或向正下方走
    if (absRotation > CompassRad.Down + this.characterRotateGap) {
      // 角色圖轉向左
      this.flashableCharacter.setFlipX(false);
    } else if (absRotation < CompassRad.Down - this.characterRotateGap) {
      // 角色圖轉向右
      this.flashableCharacter.setFlipX(true);
    }
    // 更新召喚物特效
    this.updateAllMinionEffect();
  }
  //#endregion variable、properties

  //#region constructor、Phaser function
  constructor(scene: Phaser.Scene & ICombatScene, x: number, y: number) {
    super(scene, x, y);

    // 初始化身體尺寸
    this.setSize(this.battleUnitSize.width, this.battleUnitSize.height);

    // 初始化容器
    this._forward = this.addObject(0, 0, Object2D);
    this._forward.angle = 0;

    // 初始化角色圖
    this.flashableCharacter = this.addObject(0, 0, FlashableSprite, '');

    // 初始化屬性Icon
    this.attributeIcon = this.addImage(AttributeHelper.getAttributeIconImgKey(AttributeType.Star), 0, 0);
    this.attributeIcon.setScale(0.3);
    this.attributeIcon.setX(-this.hpBarSize.width / 2 - (this.attributeIcon.displayWidth * 0.6) / 2);
    this.attributeIcon.setY(this.attributeIconY);

    // 受傷音效
    this.hpSfx = new SoundPool(this.scene, BaseSceneString.HpSfx);
    // 補血音效
    this.hpSfxNegative = new SoundPool(this.scene, BaseSceneString.HpSfxNegative);

    // 角色屬性
    this.attributes = new Attribute(this.scene);

    // 設置表演文字群組
    this.energyTweenTextGroup = this.scene.add.group({
      classType: CombatPopUpNumberTween,
      createCallback: (popUpTween: Phaser.GameObjects.GameObject) => {
        // 生成的物件都加到container底下
        if (popUpTween) {
          this.add(popUpTween);
        }
      },
    });

    // 設置表演圖片群組
    this.effectTweenSpriteGroup = this.scene.add.group({
      classType: Phaser.GameObjects.Sprite,
      createCallback: (sprite: Phaser.GameObjects.GameObject) => {
        // 生成的物件都加到container底下
        this.add(sprite);
      },
    });
    // 預先創建3張圖片以供立即取用
    for (let index = 0; index < 3; index++) {
      this.effectTweenSpriteGroup.create(0, 0, undefined, undefined, false, false);
    }
  }

  update(time: number, delta: number): void {
    this.fsm.update(time, delta);
  }
  //#endregion constructor、Phaser function

  /** 進入死亡狀態客製(需在此處將自己回收 active = false) */
  public abstract onDeadEnterCustom(): void;
  //#region fsm
  /** 進入戰鬥狀態 */
  public onActiveEnter(): void {
    // 綁定普攻道具
    this.bindItemByUnitData();
  }
  /** 戰鬥狀態Update */
  public onActiveUpdate(): void {
    this.allMinionList.forEach((minionList: ItemBaseMinion[], rotation: number) => {
      const filterMinionList = minionList.filter((minion: ItemBaseMinion, order: number) => {
        // 移除死亡的召喚物
        if (minion.isDead) {
          minion.killAndHide();
          return false;
        }
        // 更新召喚物位置
        else {
          const offset = ++order * (minion.halfDisplayHeight + this.displayHeight / 2);
          const x = offset * Math.cos(this.forwardRotation + rotation);
          const y = offset * Math.sin(this.forwardRotation + rotation);
          minion.updatePosition(x, y, this.forwardRotation);
          return true;
        }
      });
      this.allMinionList.set(rotation, filterMinionList);
    });
  }
  /** 進入死亡狀態 */
  public onDeadEnter(): void {
    // 關閉及清除重置
    this.attributes.disable();
    this.clearMarkedAmount();
    this.clearAllMinion();
    this.flashingTimeEvent?.remove(true);
    this.inUseItemInstances.forEach((item: BaseItem) => item.killAndHide());
    this.inUseItemInstances = [];
    this.hpBar.setValue(0);
    this.hpBar.setVisible(false);
    this.attributeIcon.setVisible(false);
    this.bindingItem?.killAndHide();
    this.flashableCharacter.setAlpha(this.characterDeadAlpha);
    this.itemOnHitTweenList.forEach((itemOnHitTween: ItemOnHitTween) =>
      itemOnHitTween.effectTweenList.forEach((tween: Phaser.Tweens.Tween) => tween.complete())
    );
    this.itemOnHitTweenList = [];

    this.onDeadEnterCustom();

    this.battleTeam.onUnitDie(this);
  }

  /** 觸發戰鬥狀態 */
  public activate(): void {
    this.fsm.stateMachine.triggerEvent(BattleUnitEventId.Active);
  }
  /** 觸發死亡狀態 */
  public dead(): void {
    this.fsm.stateMachine.triggerEvent(BattleUnitEventId.Dead);
  }
  //#endregion fsm

  //#region battle unit 功能
  /** 初始化battleUnit
   * @param data 角色資料
   * @param level 等級
   * @param teamOrder 隊伍先後順序
   * @param attackMode 攻擊模式
   * @param ignoreObstacle 是否可以穿透障礙物
   */
  public init(
    data: T,
    level: number,
    teamOrder: number,
    attackMode: BattleUnitAttackMode,
    ignoreObstacle: boolean
  ): void {
    // 複製資料，避免修改到靜態表
    this.battleUnitData = Object.assign({}, data);
    // 暫存資料
    this._teamOrder = teamOrder;
    this.level = level;
    this._attackMode = attackMode;
    this._ignoreObstacle = ignoreObstacle;

    // 初始化血量
    const hp = PlanetWarHelper.getHpByPlanetWarLevel(this.baseHp, this.level);

    // 根據屬性決定血條顏色
    this.hpBar.resetValue(hp);
    this.hpBar.resetValueColor([{ ratio: 1, color: AttributeHelper.getAttributeColor(this.battleUnitData.attribute) }]);
    this.hpBar.setVisible(this.isShowHpBar);
    // 設置屬性Icon
    this.attributeIcon.setTexture(AttributeHelper.getAttributeIconImgKey(this.battleUnitData.attribute));
    this.attributeIcon.setVisible(this.isShowAttributeIcon);

    // 初始化防禦
    this.baseDefense = PlanetWarHelper.getDefenseByPlanetWarLevel(this.baseDefense, this.level);

    // 設置角色
    this.flashableCharacter.setPosition(0, this.characterOffsetY);
    // 設置動畫
    const animKey = AnimationHelper.getCharacterAnimKey(this.battleUnitData, CharacterAnimType.Walk);
    this.flashableCharacter.setTexture(animKey);
    this.flashableCharacter.playAnims(animKey);
    this.flashableCharacter.setAlpha(1);

    // 設置角色比例
    this.flashableCharacter.setScale(0.5);

    // 設置角色面向
    this.flashableCharacter.setFlipX(Math.abs(this._forward.angle) <= 90);

    // 設置碰撞區塊
    this.body.setSize(this.width, this.height * this.battleUnitData.heightScale);
    // 依身高比例調整碰撞區塊，以腳底為基準
    this.body.offset = new Phaser.Math.Vector2(0, this.height - this.body.height);

    // 設置人物大小縮放
    this.setScale(this.baseScale);

    // 初始化屬性
    this.attributes.init(this);
    this._bindingItem = undefined;
    // 清除被標記數
    this.clearMarkedAmount();
    // 清除召喚物
    this.clearAllMinion();
    // 啟動
    this.setActive(true);
    this.setVisible(true);
    this.fsm.start();
  }

  /** 單次播放特效不紀錄
   * @param effectIdList 特效Id清單
   */
  public playEffectOnce(effectIdList: number[]): void {
    effectIdList.forEach((effectId: number) => this.playEffectTween(effectId));
  }

  /** 播放特效並記錄。目前await沒有作用，受限於typescript寫法才用。
   * @param itemNameKey 道具nameKey
   * @param effectIdList  特效Id清單
   */
  public async playEffect(itemNameKey: string, effectIdList: number[]): Promise<void> {
    // 表演特效 並 記錄特效對應的道具名稱
    const effectTweenList: Phaser.Tweens.Tween[] = [];
    for (const effectId of effectIdList) {
      const effectTween = await this.playEffectTween(effectId);
      if (effectTween) {
        effectTweenList.push(effectTween);
      }
    }
    this.itemOnHitTweenList.push({ itemNameKey, effectTweenList });

    // 表演特效時呼叫(繼承類別客製行為)
    this.onPlayEffect(itemNameKey);
  }

  /** 關閉道具對應特效
   * @param itemNameKey 道具nameKey
   */
  public closeEffect(itemNameKey: string): void {
    // 找到對應道具特效Index
    const index = this.itemOnHitTweenList.findIndex(
      (itemOnHitTween: ItemOnHitTween) => itemOnHitTween.itemNameKey === itemNameKey
    );
    if (index === -1) {
      return;
    }

    // 關閉該特效並去除
    this.itemOnHitTweenList[index].effectTweenList.forEach((tween: Phaser.Tweens.Tween) => tween.complete());
    this.itemOnHitTweenList.splice(index, 1);
    // 表顯特效時，繼承類別客製行為
    this.onCloseEffect(itemNameKey);
  }

  /** 播放特效Tween。目前await沒有作用，受限於typescript寫法才用。
   * @param effectId 特效id
   * @returns tween
   */
  private async playEffectTween(effectId: number): Promise<Phaser.Tweens.Tween | undefined> {
    // 獲取特效資料
    const effectData = this.scene.combatComponent.getEffectData(effectId);
    if (effectData === undefined) {
      return undefined;
    }
    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    if (effectSprite === null) {
      return undefined;
    }
    effectSprite.setActive(true);
    // 設置是否顯示在角色之上
    effectData.aboveCharacter
      ? this.moveAbove<Phaser.GameObjects.GameObject>(effectSprite, this.flashableCharacter)
      : this.moveBelow<Phaser.GameObjects.GameObject>(effectSprite, this.flashableCharacter);
    // 設置特效Tween
    return await AnimationHelper.setTweenFromEffectData(effectSprite, effectData, false);
  }

  /** 暫停播放動畫並回復第x幀
   *  @param frameIndex 停在第幾幀
   */
  public pauseAnim(frameIndex?: number): void {
    // 暫停角色動畫
    this.flashableCharacter.pauseAnimsAtFrame(frameIndex);
    // 更新召喚物特效
    this.updateAllMinionEffect();
  }

  /** 繼續播放播放動畫 */
  public resumeAnim(): void {
    // 繼續播放角色動畫
    this.flashableCharacter.resumeAnims();
    // 更新召喚物特效
    this.updateAllMinionEffect();
  }

  /** 依百分比更新自身血量顯示
   * @param value 變更的值
   */
  public updateHpByPercentage(value: number): void {
    // 依百分比計算變化量
    this.updateHp(this.hpBar.fullValue * (value / 100), false);
  }

  /** 依百分比更新自身血量(無傷害數字顯示)
   * @param value 變更的值
   */
  public updateHpByPercentageWithoutPopUp(value: number): void {
    // 依百分比計算變化量
    this.updateHp(this.hpBar.fullValue * (value / 100), true);
  }

  /** 數值扣減防禦力後更新自身血量顯示
   * @param value 變更的值
   */
  public updateHpByValue(value: number): void {
    // 非百分比的攻擊力要扣抵掉防禦力
    this.updateHp(value < 0 ? Math.min(value + this.defense, 0) : value, false);
  }

  /** 更新自身血量顯示
   * @param value 變更的值
   */
  private updateHp(value: number, forceHidePopUp: boolean): void {
    // 更新血量
    this.hpBar.updateValue(value);

    // 血量變化特效
    this.hpChangeEffect(value);

    // 血量變化跳數字
    let isShowPopUp: boolean;
    switch (this.hpPopUpType) {
      case HpPopUpType.All:
        isShowPopUp = true;
        break;
      case HpPopUpType.IgnorePositive:
        isShowPopUp = value <= 0;
        break;
      case HpPopUpType.IgnoreNegative:
        isShowPopUp = value >= 0;
        break;
      case HpPopUpType.None:
        isShowPopUp = false;
        break;
      default:
        console.error(`血量popUp種類設定錯誤,不存在的種類 = ${this.hpPopUpType}`);
        return;
    }
    if (isShowPopUp && forceHidePopUp !== true) {
      const tweenText: CombatPopUpNumberTween = this.energyTweenTextGroup.get(0, -this.displayHeight / 2);
      if (tweenText == null) {
        console.warn('取不到血量popUp物件!');
        return;
      }
      // 避免顯示小數點
      tweenText.popUpNumber(Math.trunc(value));
    }

    // 繼承類別客製化處理
    this.onUpdateHp();
    // 血量若歸零則觸發死亡
    if (this.hp <= 0) {
      this.dead();
    }
  }

  /** 血量變化特效
   * @param value 血量變化值
   */
  public hpChangeEffect(value: number): void {
    if (value > 0) {
      this.flashableCharacter.flashing(this.hpUpFlashingColor);
      this.hpSfx.play();
    } else if (value < 0) {
      this.hpSfxNegative.play();
    }
  }

  /** 清除所有負面狀態 */
  public clearNegativeInfluences(): void {
    // 角色閃藍表演
    this.flashableCharacter.flashing(this.clearNegativeFlashingColor);
    // 清除負面影響
    this.attributes.clearAllNegativeInfluences();
  }

  /** 清除所有無視狀態 */
  public clearIgnoreInfluences(): void {
    // 清除無視種類影響
    this.attributes.clearAllIgnoreInfluences();
  }

  /** 復活 */
  public revive(): void {
    if (this.isAlive) {
      return;
    }

    // 重置
    this.init(this.battleUnitData, this.level, this.teamOrder, this._attackMode, this._ignoreObstacle);
    // 血量重置，復活血30%
    this.hpBar.setValue(0);
    this.updateHpByPercentage(30);

    // 重整隊伍
    this.battleTeam.sortTeamOrder();
  }

  /** 設置戰鬥隊伍
   * @param battleTeam 戰鬥隊伍
   */
  public setTeam(battleTeam: BattleTeam<BattleUnit<T>>): void {
    this._battleTeam = battleTeam;
  }

  /** 綁定指定道具
   * @param itemData 道具資料
   * @param refreshTimes 重複使用次數
   */
  public bindItemByItemData(itemData: CombatItemData, refreshTimes: number): BaseItem | undefined {
    // 取得道具Instance並記錄
    return (this._bindingItem = this.scene.combatComponent.getItemInstance(this.x, this.y, {
      itemData,
      instigator: this,
      itemOperationList: this.attributes.getItemOperationList(),
      isIgnorefollow: false,
      refreshTimes,
    }));
  }

  /** 綁定普攻道具 */
  public bindItemByUnitData(): void {
    // 獲取道具資料
    const itemData = this.scene.getBattleUnitItemData(this.battleUnitData, this.level);
    if (itemData === undefined) {
      return;
    }
    // 取得道具Instance並記錄
    this._bindingItem = this.scene.combatComponent.getItemInstance(this.x, this.y, {
      itemData,
      instigator: this,
      itemOperationList: this.attributes.getItemOperationList(),
      isIgnorefollow: false,
      refreshTimes: -1,
    });
  }

  /** 解除綁定道具 */
  public unbindItem(): void {
    this._bindingItem?.killAndHide();
    this._bindingItem = undefined;
  }

  /** 使用道具
   * @param itemData 道具資料
   */
  public async useItem(itemData: CombatItemData): Promise<void> {
    // 取得道具Instance
    const itemInstance = this.scene.combatComponent.getItemInstance(this.x, this.y, {
      itemData,
      instigator: this,
      itemOperationList: defaultItemOperationList,
      isIgnorefollow: false,
      refreshTimes: 0,
    });
    if (itemInstance === undefined) {
      return;
    }

    // 紀錄正在使用中的道具
    this.inUseItemInstances.push(itemInstance);
    await AsyncHelper.pendingUntil(() => itemInstance.active === false);
    // 移除正在使用中的道具紀錄
    const index = this.inUseItemInstances.indexOf(itemInstance);
    if (index !== -1) {
      this.inUseItemInstances.splice(index, 1);
    }
  }

  /** 與此角色進行屬性影響
   * @param instagatorX 發動者位置x
   * @param instagatorY 發動者位置y
   * @param influence 屬性影響
   * @param isPercentage 是否依百分比計算
   * @param isProjectile 是否是投射物
   */
  public interact(
    instagatorX: number,
    instagatorY: number,
    influence: AttributeInfluence,
    isPercentage: boolean,
    isProjectile: boolean
  ): void {
    if (this.attributes.hasIgnore && this.isIgnore(instagatorX, instagatorY, influence.value, isProjectile)) {
      influence.value = 0;
      influence.duration = 0;
    }

    this.attributes.setAttributeInfluence(influence, isPercentage);
  }

  /** 吸引
   * @param instagatorX 發動者位置x
   * @param instagatorY 發動者位置y
   * @param absorbValue 吸引力度值
   * @param isProjectile 是否是投射物
   */
  public absorb(instagatorX: number, instagatorY: number, absorbValue: number, isProjectile: boolean): void {
    // 有無視且符合無視類型
    if (this.attributes.hasIgnore && this.isIgnore(instagatorX, instagatorY, absorbValue, isProjectile)) {
      return;
    }

    this.body.setVelocity((instagatorX - this.x) * -absorbValue, (instagatorY - this.y) * -absorbValue);
  }

  /** 檢查是否要忽略此屬性影響
   * @param instagatorX 發動者位置x
   * @param instagatorY 發動者位置y
   * @param influenceValue 屬性影響數值
   * @param isProjectile 是否是投射物
   * @returns 是否要忽略
   */
  private isIgnore(instagatorX: number, instagatorY: number, influenceValue: number, isProjectile: boolean): boolean {
    // 對方發動的屬性影響是正值狀態
    if (influenceValue > 0) {
      return false;
    }

    // 假如無視從前方來的負值狀態
    if (this.attributes.hasSpecialInteractionType(InteractionType.IgnoreFront)) {
      // 計算夾角
      const includedRotation =
        this.forwardRotation - Phaser.Math.Angle.Between(this.x, this.y, instagatorX, instagatorY);
      const wrapIncludedRotation = Phaser.Math.Angle.Wrap(includedRotation);
      const absWrapIncludedRotation = Math.abs(wrapIncludedRotation);
      // 夾角小於90度等於在前方
      return absWrapIncludedRotation < CombatNumber.Rad_90_Degree;
    }

    // 假如無視投射物
    if (this.attributes.hasSpecialInteractionType(InteractionType.IgnoreProjectile) && isProjectile) {
      return true;
    }

    // 假如無視非投射物
    if (this.attributes.hasSpecialInteractionType(InteractionType.IgnoreNonProjectile) && isProjectile === false) {
      return true;
    }

    return false;
  }

  /** 增加被標記數，並判斷是否開啟被標記特效 */
  public addMarkedAmount(): void {
    this.markedAmount += 1;
    // 0 -> 1 開啟標記特效
    if (this.markedAmount === 1) {
      this.playEffect('marked', [CombatEffectId.MarkedEffectId]);
    }
  }

  /** 減少被標記數，並判斷是否關閉被標記特效 */
  public reduceMarkedAmount(): void {
    this.markedAmount -= 1;
    // 1 -> 0 關閉標記特效
    if (this.markedAmount === 0) {
      this.closeEffect('marked');
    }
  }

  /** 清除所有被標記數並清除特效 */
  protected clearMarkedAmount(): void {
    this.closeEffect('marked');
    this.markedAmount = 0;
  }

  /** 新增並行召喚物 */
  public addMinionParallel(minion: ItemBaseMinion): void {
    // 角色左右平均新增召喚物，右邊優先
    const rightMinionList = this.allMinionList.get(CombatNumber.Rad_90_Degree);
    const leftMinionList = this.allMinionList.get(-CombatNumber.Rad_90_Degree);
    const rightMinionListLength = rightMinionList ? rightMinionList.length : 0;
    const leftMinionListLength = leftMinionList ? leftMinionList.length : 0;
    rightMinionListLength <= leftMinionListLength
      ? this.addMinion(minion, CombatNumber.Rad_90_Degree)
      : this.addMinion(minion, -CombatNumber.Rad_90_Degree);
  }

  /** 將召喚物加至戰鬥單位下
   * @param minion 召喚物
   * @param rotation 召喚物位置角度，0為角色正前方
   */
  public addMinion(minion: ItemBaseMinion, rotation: number): void {
    // 召喚物加至此Container
    this.add(minion);
    // 讓召喚物顯示在最底下
    this.moveTo(minion, 0);
    // 初始化召喚物特效
    minion.updateEffect(this.flashableCharacter);
    // 記錄目前擁有的召喚物
    const minionList = this.allMinionList.get(rotation);
    if (minionList) {
      minionList.push(minion);
    } else {
      this.allMinionList.set(rotation, [minion]);
    }
  }

  /** 更新戰鬥單位下所有召喚物特效 */
  protected updateAllMinionEffect(): void {
    this.allMinionList.forEach((minionList: ItemBaseMinion[]) => {
      minionList.forEach((minion: ItemBaseMinion) => {
        minion.updateEffect(this.flashableCharacter);
      });
    });
  }

  /** 清除戰鬥單位下所有召喚物 */
  protected clearAllMinion(): void {
    this.allMinionList.forEach((minionList: ItemBaseMinion[]) => {
      minionList.forEach((minion: ItemBaseMinion) => {
        // 回收召喚物
        minion.killAndHide();
      });
    });
    // 清除召喚物紀錄
    this.allMinionList.clear();
  }
  //#endregion battle unit 功能

  /** 當血量更新 */
  protected abstract onUpdateHp(): void;

  /** 當播放特效
   * @param itemNameKey 觸發特效的道具名稱
   */
  protected abstract onPlayEffect(itemNameKey: string): void;

  /** 當關閉特效
   * @param itemNameKey 觸發特效的道具名稱
   */
  protected abstract onCloseEffect(itemNameKey: string): void;

  /** 判斷對目標單位是否帶有屬性優勢
   * @param target 目標單位
   */
  public abstract isAttributeAdvantage(target: BattleUnit<HeroData>): boolean;
}
