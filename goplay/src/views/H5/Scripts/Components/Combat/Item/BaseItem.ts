import { CombatItemData, HeroData } from '@/manager/TableManager';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import BaseItemFSM from './BaseItemFSM';
import ItemDetectStrategy, { CircleDetect, FanDetect, SkipDetect } from './ItemDetectStrategy';
import ItemEffectStrategy, {
  InstantFillWithoutScaleEffect,
  InstantPlayWithoutScaleEffect,
  PendingUntillKeyFrameWithoutScaleEffect,
} from './ItemEffectStrategy';
import { InstantPlayEffect, PendingUntillKeyFrameEffect, SkipEffect } from './ItemEffectStrategy';
import ItemTargetStrategy, {
  CircleNearestTarget,
  CircleRandomProjectileAmountTarget,
  FanTeamTarget,
  HalfRectangleTarget,
  SkipTarget,
} from './ItemTargetStrategy';
import { CircleTarget, DeadTeammateTarget, EndangerTeammateTarget } from './ItemTargetStrategy';
import { FanTarget, SelfTarget, SelfTeamTarget } from './ItemTargetStrategy';
import ItemInteractionStrategy, {
  DiagonalTargetProjectileInteraction,
  DirectInteraction,
  ProjectileInteraction,
  SurroundProjectileInteraction,
  TargetProjectileInteraction,
  ParallelMinionInteraction,
} from './ItemInteractionStrategy';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import BaseProjectile from './Projectile/BaseProjectile';
import { CombatNumber, InteractionEffect, InteractionType, RangeType, SpawnOnHitType } from '@/helper/enum/Combat';
import ItemFollowStrategy, { OnlyPositionFollow, NormalFollow } from './ItemFollowStrategy';
import ItemBaseMinion from './Minion/ItemBaseMinion';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import { ItemOperationList } from '@/views/H5/Scripts/Components/Combat/Battle/Attribute';
import { filterHostileBattleUnits, ICombatScene } from '@/views/H5/Scripts/Components/Combat/Combat';
import ItemDetectHostileProjectileStrategy, {
  CenterCircleDetectProjectile,
  SkipDetectProjectile,
} from './ItemDetectHostileProjectileStrategy';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';

/** 逆塔防道具Config */
export interface BaseItemConfig {
  /** 道具資料 */
  itemData: CombatItemData;
  /** 發動者 */
  instigator: BattleUnit<HeroData>;
  /** 道具數值運算 */
  itemOperationList: ItemOperationList;
  /** 不跟隨發動者 */
  isIgnorefollow: boolean;
  /** 要重複發動幾次，-1是無限 */
  refreshTimes: number;
}

export default abstract class BaseItem extends Object2D {
  /** 戰鬥遊戲場景 */
  public declare scene: Phaser.Scene & ICombatScene;

  /** 對角線投射物位置offset */
  private readonly diagonalProjectilePosOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    -this.scene.game.canvas.width / 4,
    -this.scene.game.canvas.height
  );
  /** 對角線投射物位置offset長度 */
  private readonly diagonalProjectilePosOffsetLength: number = this.diagonalProjectilePosOffset.length();
  /** 對角線投射物角度 */
  private readonly diagonalProjectileAngle = Phaser.Math.Angle.Between(
    this.diagonalProjectilePosOffset.x,
    this.diagonalProjectilePosOffset.y,
    0,
    0
  );
  /** 填滿特效總數量 */
  private readonly fillEffectAmount = 4;

  //#region abstract function
  /** 偵測Strategy */
  protected abstract detectStrategy: ItemDetectStrategy;
  /** 偵測時的跟隨Strategy */
  protected abstract detectFollowStrategy: ItemFollowStrategy;
  /** 偵測敵對投射物Strategy */
  protected abstract detectHostileProjectileStrategy: ItemDetectHostileProjectileStrategy;
  /** 發動時的跟隨Strategy */
  protected abstract activeFollowStrategy: ItemFollowStrategy;
  /** 處理特效Strategy */
  protected abstract effectStrategy: ItemEffectStrategy;
  /** 獲取目標Strategy */
  protected abstract targetStrategy: ItemTargetStrategy;
  /** 與目標互動Strategy */
  protected abstract interactionStrategy: ItemInteractionStrategy;
  /** 是否等待投射物存活時間結束才回收此道具 */
  protected abstract isAwaitSpawnObjectSurvivalTime: boolean;
  /** 是否等待互動影響時間結束才回收此道具 */
  protected abstract isAwaitInteractionTime: boolean;
  //#endregion abstract function

  //#region 元件、暫存
  /** 道具狀態機 */
  private baseItemFSM: BaseItemFSM;
  /** 特效圖片群組 */
  private effectTweenSpriteGroup: Phaser.GameObjects.Group;
  /** 道具發動期間的timeEvent */
  private activeTimeEvent?: Phaser.Time.TimerEvent;
  /** 道具資料Config */
  private itemConfig!: BaseItemConfig;
  /** 經過的冷卻時間 */
  private elapsedCooldownTime: number = 0;
  /** 處理常駐特效不縮放Strategy(道具active期間會持續顯示) */
  private continousEffectWithoutScaleStrategy: ItemEffectStrategy = new InstantPlayWithoutScaleEffect();
  /** 處理常駐特效有縮放Strategy(道具active期間會持續顯示) */
  private continousEffectStrategy: ItemEffectStrategy = new InstantPlayEffect();
  /** 處理施法特效Strategy */
  private channelEffectStrategy: ItemEffectStrategy = new PendingUntillKeyFrameWithoutScaleEffect();
  /** 處理填滿特效Strategy(目前僅有光環使用) */
  private fillEffectStrategy: ItemEffectStrategy = new InstantFillWithoutScaleEffect();
  //#endregion 元件、暫存

  //#region properties
  /** 投射物數量 */
  public get projectileAmount(): number {
    return this.itemConfig.itemData.spawnObjectAmount;
  }
  /** 道具發動持續時間 */
  private get activeDuration(): number {
    return this.itemConfig.itemData.activeDuration;
  }
  /** 道具發動時間間隔 */
  private get activeInterval(): number {
    return this.itemConfig.itemData.activeInterval;
  }
  /** 道具冷卻時間 */
  private get cooldown(): number {
    const itemOperationList = this.itemConfig.itemOperationList;
    const addition = itemOperationList.launchRate.addition;
    const multiplication = itemOperationList.launchRate.multiplication;
    // 初始冷卻時間就已經小或等於0(冷卻時間不應該是負數)，回傳冷卻時間無限大
    if (this.itemConfig.itemData.cooldown < 0) {
      return Infinity;
    }
    // 初始冷卻時間就等於0(沒有冷卻時間)，不受發動速率影響
    if (this.itemConfig.itemData.cooldown === 0) {
      return 0;
    }
    // 發動速率加乘值小或等於0(每秒發動攻擊次數百分比小或等於0)，回傳冷卻時間無限大
    if (multiplication <= 0) {
      return Infinity;
    }
    // 發動速率加值小或等於0(每秒發動攻擊次數小或等於0)，回傳冷卻時間無限大
    const launchRateAddition = 1 / this.itemConfig.itemData.cooldown + addition;
    if (launchRateAddition <= 0) {
      return Infinity;
    }
    // 計算攻擊發動速率
    const launchRate = launchRateAddition * multiplication;
    // 回傳冷卻時間 = 1 / 發動速率
    return 1 / launchRate;
  }
  /** 道具範圍 */
  private get range(): number {
    const itemOperationList = this.itemConfig.itemOperationList;
    const addition = itemOperationList.range.addition;
    const multiplication = itemOperationList.range.multiplication;
    return Math.max(0, (this.itemConfig.itemData.range + addition) * multiplication);
  }
  /** 發動者 */
  public get instigator(): BattleUnit<HeroData> {
    return this.itemConfig.instigator;
  }
  /** 是否忽略跟隨 */
  public get isIgnorefollow(): boolean {
    return this.itemConfig.isIgnorefollow;
  }
  /** 尖端圓圈半徑 */
  private get topCircleRadius(): number {
    return this.itemConfig.itemData.range / 4;
  }
  /** 前端1/4處，半徑為長度1/8的圓圈中心點x */
  private get topCircleCenterX(): number {
    return this.x + this.topCircleRadius * 3 * Math.cos(this.rotation);
  }
  /** 前端1/4處，半徑為長度1/8的圓圈中心點y */
  private get topCircleCenterY(): number {
    return this.y + this.topCircleRadius * 3 * Math.sin(this.rotation);
  }
  /** 前端2/4處，半徑為長度1/8的圓圈中心點x */
  private get secondTopCircleCenterX(): number {
    return this.x + this.topCircleRadius * 1 * Math.cos(this.rotation);
  }
  /** 前端2/4處，半徑為長度1/8的圓圈中心點y */
  private get secondTopCircleCenterY(): number {
    return this.y + this.topCircleRadius * 1 * Math.sin(this.rotation);
  }
  //#endregion properties

  //#region constructor、Phaser function
  constructor(scene: Phaser.Scene & ICombatScene, x: number, y: number) {
    super(scene, x, y);

    // 設置表演圖片群組
    this.effectTweenSpriteGroup = this.scene.add.group({
      classType: Phaser.GameObjects.Sprite,
      createCallback: (sprite: Phaser.GameObjects.GameObject) => {
        // 生成的物件都加到container底下
        this.add(sprite);
      },
    });
    // 預先創建2張圖片以供立即取用
    for (let index = 0; index < 2; index++) {
      this.effectTweenSpriteGroup.create(0, 0, undefined, undefined, false, false);
    }
    // 創建狀態機
    this.baseItemFSM = new BaseItemFSM(this);
    // 設置深度
    this.setDepth(this.scene.worldTopEdgeY);
  }

  public update(time: number, delta: number): void {
    this.baseItemFSM.update(delta);
  }
  //#endregion constructor、Phaser function

  //#region FSM
  /** 偵測狀態update
   * @returns true 跳下一階段，false持續偵測
   */
  public onDectectUpdate(): boolean {
    this.detectFollowStrategy.follow(this);
    // 如果攻擊速率被降至0，則無法發動
    if (this.cooldown === Infinity) {
      return false;
    }
    return this.detectStrategy.detect(this);
  }

  /** 發動狀態Enter */
  public async onActiveEnter(): Promise<void> {
    // 施法特效，播動畫到可以開始攻擊的點
    await this.channelEffectStrategy.playEffect(this, this.itemConfig.itemData.channelEffectIdList);
    // 播放音效
    this.playAudio();

    // 攻擊特效，播動畫到可以開始攻擊的點
    await this.effectStrategy.playEffect(this, this.itemConfig.itemData.effectIdList);

    // 執行一次攻擊
    if (this.activeDuration <= 0 || this.activeInterval <= 0) {
      // 執行攻擊時要做的事件
      this.attackAction();

      // 等待投射物存活時間結束才回收此道具
      if (this.isAwaitSpawnObjectSurvivalTime) {
        await AsyncHelper.sleep(this.itemConfig.itemData.spawnObjectSurvivalTime);
      }

      // 等待互動影響時間結束才回收此道具
      if (this.isAwaitInteractionTime) {
        await AsyncHelper.sleep(this.itemConfig.itemData.interactionTime);
      }
    }
    // 執行多次攻擊
    else {
      // 技能時間內持續發動，配合Aura
      this.activeTimeEvent = this.scene.time.addEvent({
        delay: this.activeInterval * 1000,
        startAt: this.activeInterval * 1000,

        callback: () => {
          // 執行攻擊時要做的事件
          this.attackAction();
          // 填滿特效
          this.fillEffectStrategy.playEffect(this, this.itemConfig.itemData.fillEffectIdList);
        },

        repeat: Math.floor(this.activeDuration / this.activeInterval - 1),
      });

      // 等待攻擊事件完成
      await AsyncHelper.pendingUntil(
        () => this.activeTimeEvent === undefined || this.activeTimeEvent.getOverallProgress() === 1
      );
      this.activeTimeEvent?.remove();
      this.activeTimeEvent = undefined;

      this.effectStrategy.completeEffect();
      this.fillEffectStrategy.completeEffect();
    }

    // 等待特效播放完成
    await AsyncHelper.pendingUntil(() => this.effectStrategy.isPlaying === false);
  }

  /** 執行攻擊時要做的事件 */
  private attackAction(): void {
    // 偵測敵方投射物並消除
    const hostileProjectiles = this.detectHostileProjectileStrategy.detect(this);
    if (hostileProjectiles.length !== 0) {
      hostileProjectiles.forEach((hostileProjectile: BaseProjectile) => hostileProjectile.finish());
    }
    // 篩選目標
    const targetList = this.targetStrategy.getTargets(this);
    // 執行攻擊
    this.interactionStrategy.interact(this, targetList);
  }

  /** 發動狀態Update */
  public onActiveUpdate(): void {
    this.activeFollowStrategy.follow(this);
  }

  /** 完成狀態Enter */
  public onFinishEnter(): void {
    // 重置經過時間
    this.elapsedCooldownTime = 0;

    // 有設置擊中生成道具且擊中生成道具Id不為-1
    if (this.itemConfig.itemData.spawnOnHitType === SpawnOnHitType.Item) {
      this.scene.combatComponent.spawnOnHitItem(this.x, this.y, this.itemConfig, 0);
    }

    if (this.itemConfig.refreshTimes === 0) {
      // 重複次數 = 0，不自動刷新
      this.killAndHide();
    }

    // 重複次數-1
    if (this.itemConfig.refreshTimes > 0) {
      this.itemConfig.refreshTimes -= 1;
    }
  }

  /** 完成狀態update
   * @param delta 每幀間隔
   * @returns true 跳下一階段，false持續檢測
   */
  public onFinishUpdate(delta: number): void {
    this.elapsedCooldownTime += delta / 1000;

    if (this.elapsedCooldownTime > this.cooldown) {
      this.refresh();
    }
  }
  //#endregion FSM

  //#region 道具功能
  /** 初始化道具
   * @param itemConfig 道具Config
   */
  public init(itemConfig: BaseItemConfig): void {
    // 暫存資料
    this.itemConfig = itemConfig;
    this.rotation = 0;

    const itemData = this.itemConfig.itemData;
    // 計算最大出現特效數量
    const maximumEffectQuantity =
      itemData.channelEffectIdList.length + itemData.effectIdList.length + itemData.fillEffectIdList.length > 0
        ? this.fillEffectAmount * 3
        : 0;
    // 目前特效物件池的長度
    const effectGroupLength = this.effectTweenSpriteGroup.getLength();
    // 預先生成特效物件直到滿足最大出現特效數量
    for (let index = effectGroupLength; index < maximumEffectQuantity; index++) {
      this.effectTweenSpriteGroup.create(0, 0, undefined, undefined, false, false);
    }

    // 顯示常駐特效
    this.continousEffectWithoutScaleStrategy.playEffect(
      this,
      this.itemConfig.itemData.continuousEffectWithoutScaleIdList
    );
    this.continousEffectStrategy.playEffect(this, this.itemConfig.itemData.continuousEffectIdList);

    // 啟動道具
    this.refresh();
  }

  /** 重置/刷新道具使用 */
  public refresh(): void {
    this.setVisible(true);
    this.setActive(true);
    this.baseItemFSM.start();
  }

  /** 跟隨發動者
   * @param isFollowPosition 是否跟隨位置
   * @param isFollowRotation 是否跟隨角度
   */
  public followInstigator(isFollowPosition: boolean, isFollowRotation: boolean): void {
    // 跟隨發動者位置
    if (isFollowPosition) {
      this.x = this.instigator.x;
      this.y = this.instigator.y;
    }

    // 跟隨發動者角度
    if (isFollowRotation) {
      this.rotation = this.instigator.forwardRotation;
    }
  }

  /** 範圍內最近的敵方戰鬥單位
   * @param rangeType 範圍類型
   * @returns 目標
   */
  public getRangeNearestHostileUnit(rangeType: RangeType): BattleUnit<HeroData> | undefined {
    // 這裡可以strategy
    const units = this.getRangeHostileUnits(rangeType);
    const nearestUnit = PhaserHelper.getRangeNearestObject2D(this.x, this.y, units) as BattleUnit<HeroData>;
    return nearestUnit ?? undefined;
  }

  /** 偵測夾角角度內範圍敵方戰鬥單位
   * @param rangeType 範圍類型
   * @param withinIncludedRotation 指定夾角角度
   * @returns 範圍內的敵方戰鬥單位
   */
  public getWithinRotationRangeHostileUnits(
    rangeType: RangeType,
    withinIncludedRotation: number
  ): Array<BattleUnit<HeroData>> {
    const units = this.getRangeHostileUnits(rangeType).filter((unit: BattleUnit<HeroData>) => {
      const includedRotation = this.getBattleUnitIncludedRotation(unit);

      // 夾角小於指定夾角角度，返回目標
      return Math.abs(includedRotation) < withinIncludedRotation;
    });

    return units;
  }

  /** 範圍內的敵方戰鬥單位
   * @param rangeType 範圍類型
   * @returns 範圍內的body
   */
  public getRangeHostileUnits(rangeType: RangeType): Array<BattleUnit<HeroData>> {
    const bodies = this.getRangeBodies(rangeType);
    return filterHostileBattleUnits(this.instigator, bodies);
  }

  /** 投射物範圍內的敵對投射物
   * @param rangeType 範圍類型
   * @returns 範圍內的敵對投射物
   */
  public getRangeHostileProjectiles(rangeType: RangeType): BaseProjectile[] {
    // 投射物範圍內的敵對投射物
    const bodies = this.getRangeBodies(rangeType);
    const hostileProjectileBodies = bodies.filter((body: Phaser.Physics.Arcade.Body) => {
      // 非投射物，返回false
      if (body.gameObject instanceof BaseProjectile === false) {
        return false;
      }

      const projectile = body.gameObject as BaseProjectile;
      // 判斷投射物發起者是否為敵對
      return projectile.instigator.battleUnitType !== this.instigator.battleUnitType;
    });

    // 轉換成投射物後返回
    return hostileProjectileBodies.map((body: Phaser.Physics.Arcade.Body) => body.gameObject as BaseProjectile);
  }

  /** 範圍內的Bodies
   * @param rangeType 範圍類型
   * @returns 範圍內的Bodies
   */
  private getRangeBodies(rangeType: RangeType): Phaser.Physics.Arcade.Body[] {
    switch (rangeType) {
      // 因ArcadePhysic正方形無法旋轉，因此使用兩個圓圈來替代
      case RangeType.HalfRectangle:
        // 長方形上半圓圈
        const topCircleBodies = this.scene.physics.overlapCirc(
          this.topCircleCenterX,
          this.topCircleCenterY,
          this.topCircleRadius,
          true,
          false
        ) as Phaser.Physics.Arcade.Body[];
        // 長方形下半圓圈
        const secondTopCircleBodies = this.scene.physics.overlapCirc(
          this.secondTopCircleCenterX,
          this.secondTopCircleCenterY,
          this.topCircleRadius,
          true,
          false
        ) as Phaser.Physics.Arcade.Body[];

        // 合併並刪除重複Body
        const bodies = [...topCircleBodies, ...secondTopCircleBodies];
        const uniqueBodies = bodies.filter(
          (value: Phaser.Physics.Arcade.Body, index: number) => bodies.indexOf(value) === index
        );
        return uniqueBodies;
      case RangeType.CenterCircle:
      case RangeType.TopCircle:
        const isTopCirCle = rangeType === RangeType.TopCircle;
        return this.scene.physics.overlapCirc(
          isTopCirCle ? this.topCircleCenterX : this.x,
          isTopCirCle ? this.topCircleCenterY : this.y,
          isTopCirCle ? this.topCircleRadius : this.range,
          true,
          false
        ) as Phaser.Physics.Arcade.Body[];
    }
  }

  /** 計算與戰鬥單位間的夾角
   * @param battleUnit 戰鬥單位
   * @returns 夾角
   */
  public getBattleUnitIncludedRotation(battleUnit: BattleUnit<HeroData>): number {
    // 夾角
    const includedRotation = this.rotation - Phaser.Math.Angle.Between(this.x, this.y, battleUnit.x, battleUnit.y);

    return Phaser.Math.Angle.Wrap(includedRotation);
  }

  /** 播放道具動畫特效
   * @param effectIdList 特效資料清單
   * @param pendingUntilKeyTime 是否等待到關鍵時間點
   * @param isScaleWithRange 是否隨道具範圍縮放
   * @returns 動畫或undefined
   */
  public async playEffectTween(
    effectIdList: number[],
    pendingUntilKeyTime: boolean,
    isScaleWithRange: boolean
  ): Promise<Phaser.Tweens.Tween[]> {
    const promiseList = effectIdList.map((effectId: number) =>
      this.playTween(effectId, pendingUntilKeyTime, isScaleWithRange, 0, 0, false)
    );

    // 等待到關鍵時間點
    const tweenList: Phaser.Tweens.Tween[] = [];
    for (const promise of promiseList) {
      const result = await promise;
      if (result !== undefined) {
        tweenList.push(result);
      }
    }

    return tweenList;
  }

  /** 到放道具動畫特效
   * @param effectIdList 特效資料清單
   * @returns 動畫或undefined
   */
  public async playFillEffectTween(effectIdList: number[]): Promise<Phaser.Tweens.Tween[]> {
    if (effectIdList.length === 0) {
      return [];
    }

    const promiseList: Array<Promise<Phaser.Tweens.Tween | undefined>> = [];
    // 在範圍內平均取點並播放特效
    for (let index = 0; index < this.fillEffectAmount; index++) {
      let relativeX = 0;
      let relativeY = 0;

      // 在圓圈右方，長方形範圍隨機取點
      relativeX = Phaser.Math.RND.between(this.range / 4, (this.range / 4) * 3);
      relativeY = Phaser.Math.RND.between(-this.range / 4, this.range / 4);

      // 依照fillEffectAmount計算平均角度間隔
      const rotation = (6.28318531 / this.fillEffectAmount) * index;
      // 將取點做角度間隔偏移，使取點平均散佈在圓圈之中
      const x = relativeX * Math.cos(rotation) - relativeY * Math.sin(rotation);
      const y = relativeX * Math.sin(rotation) + relativeY * Math.cos(rotation);

      const effectId = Phaser.Math.RND.pick(effectIdList);
      promiseList.push(this.playTween(effectId, false, false, x, y, true));
    }

    // 等待到關鍵時間點
    const tweenList: Phaser.Tweens.Tween[] = [];
    for (const promise of promiseList) {
      const result = await promise;
      if (result !== undefined) {
        // 些微調整動畫播放速率，讓填滿的特效有交錯感
        result.setTimeScale(Math.random() / 2 + 0.5);
        tweenList.push(result);
      }
    }

    return tweenList;
  }

  /** 播放特效
   * @param effectId 特效Id
   * @param pendingUntilKeyTime 是否等待到關鍵時間點
   * @param isScaleWithRange 是否隨道具範圍縮放
   * @param x 位置X
   * @param y 位置Y
   * @returns 動畫或undefined
   */
  private async playTween(
    effectId: number,
    pendingUntilKeyTime: boolean,
    isScaleWithRange: boolean,
    x: number,
    y: number,
    yoyoAlphaScale: boolean
  ): Promise<Phaser.Tweens.Tween | undefined> {
    // 獲取特效資料
    const effectData = this.scene.combatComponent.getEffectData(effectId);
    if (effectData === undefined) {
      return undefined;
    }
    // 設置道具本身顯示深度來顯示在角色上方或底下
    this.setDepth(effectData.aboveCharacter ? this.scene.worldBottomEdgeY : this.scene.worldTopEdgeY);

    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    if (effectSprite === null) {
      console.error(`BaseItem playEffectTween error: this.effectTweenSpriteGroup 物件池讀取錯誤.`);
      return undefined;
    }
    effectSprite.setPosition(x, y);
    effectSprite.setActive(true);
    // 設置圖片
    effectSprite.setTexture(effectData.nameKey);
    effectSprite.setScale(isScaleWithRange && this.range > 0 ? (this.range * 2) / effectData.bodySize : 1);
    // 設置動畫並回傳
    return await AnimationHelper.setTween(effectSprite, effectData, pendingUntilKeyTime, yoyoAlphaScale);
  }

  /** 播放音效 */
  public playAudio(): void {
    this.scene.combatComponent.playAudio(this.itemConfig.itemData.audioId);
  }

  /** 將自己setActive(false)、setVisible(false)、清除暫存 */
  public killAndHide(): void {
    this.activeTimeEvent?.remove();
    this.activeTimeEvent = undefined;
    this.effectStrategy.completeEffect();
    // 關閉常駐特效
    this.continousEffectWithoutScaleStrategy.completeEffect();
    this.continousEffectStrategy.completeEffect();

    this.scene.combatGroups.hideMemberFromGroup(this.itemConfig.itemData.itemFunction, this);
  }

  /** 與目標互動
   * @param targets 目標戰鬥單位
   */
  public interactTargets(targets: Array<BattleUnit<HeroData>>): void {
    const itemData = this.itemConfig.itemData;

    targets.forEach((target: BattleUnit<HeroData>) => {
      this.interactTarget(
        target,
        itemData.interactionType,
        itemData.interactionValue,
        itemData.isPercentage,
        itemData.nameKey,
        this.itemConfig.itemData.onHitEffectIdList
      );
      this.interactTarget(
        target,
        itemData.interactionType2,
        itemData.interactionValue2,
        itemData.isPercentage2,
        // 特效在第一次攻擊時已經處理完成，第二次攻擊只處理數值不播特效
        '',
        []
      );
    });
  }

  /** 範圍內圓形區域隨機取點(世界位置) */
  public getRangeRandomWorldPosition(): Phaser.Math.Vector2 {
    const relativePosition = this.getRangeRandomRelativePosition();
    // 限制在世界範圍內
    const worldX = Phaser.Math.Clamp(
      this.x + relativePosition.x,
      this.scene.worldLeftEdgeX,
      this.scene.worldRightEdgeX
    );
    const worldY = Phaser.Math.Clamp(
      this.y + relativePosition.y,
      this.scene.worldTopEdgeY,
      this.scene.worldBottomEdgeY
    );
    return new Phaser.Math.Vector2(worldX, worldY);
  }

  /** 範圍內圓形區域隨機取點(相對位置) */
  private getRangeRandomRelativePosition(): Phaser.Math.Vector2 {
    let relativeX = 0;
    let relativeY = 0;
    const powRadius = Math.pow(this.range, 2);

    do {
      relativeX = Phaser.Math.RND.between(-this.range, this.range);
      relativeY = Phaser.Math.RND.between(-this.range, this.range);
    } while (Math.pow(relativeX, 2) + Math.pow(relativeY, 2) > powRadius);

    return new Phaser.Math.Vector2(relativeX, relativeY);
  }

  /** 與目標做互動
   * @param target 目標
   * @param interactionType 互動類型
   * @param interactionValue 互動數值
   * @param isPercentage 是否為百分比
   * @param itemNameKey 目標被影響時顯示的道具圖標，'' = 不顯示
   * @param onHitEffectIdList 目標被擊中時觸發的特效，[] = 無特效
   */
  public interactTarget(
    target: BattleUnit<HeroData>,
    interactionType: InteractionType,
    interactionValue: number,
    isPercentage: boolean,
    itemNameKey: string,
    onHitEffectIdList: number[]
  ): void {
    switch (interactionType) {
      // 無任何影響
      case InteractionType.None:
        break;
      // 清除負面類型
      case InteractionType.ClearNegative:
        target.clearNegativeInfluences();
        break;
      // 清除無視類型
      case InteractionType.ClearIgnore:
        target.clearIgnoreInfluences();
        break;
      // 復活
      case InteractionType.Revive:
        target.revive();
        break;
      // 對周圍目標進行吸引
      case InteractionType.Absorb:
        target.absorb(this.x, this.y, interactionValue, false);
        break;
      // 對目標進行血量傷害
      case InteractionType.Hp:
        let valueMultiplyByAttribute = 1;
        if (this.instigator.isAttributeAdvantage(target)) {
          valueMultiplyByAttribute = 1.5;
        }

        target.interact(
          this.x,
          this.y,
          {
            type: interactionType,
            effect: interactionValue >= 0 ? InteractionEffect.Buff : InteractionEffect.DeBuff,
            // 互動數值會經過算式運算
            value: this.getInteractionValue(interactionValue) * valueMultiplyByAttribute,
            duration: this.itemConfig.itemData.interactionTime,
            cumulativeValue: 0,
            itemNameKey,
            onHitEffectIdList,
          },
          isPercentage,
          false
        );
        break;
      // 對目標進行屬性影響
      default:
        target.interact(
          this.x,
          this.y,
          {
            type: interactionType,
            effect: interactionValue >= 0 ? InteractionEffect.Buff : InteractionEffect.DeBuff,
            // 互動數值會經過算式運算
            value: this.getInteractionValue(interactionValue),
            duration: this.itemConfig.itemData.interactionTime,
            cumulativeValue: 0,
            itemNameKey,
            onHitEffectIdList,
          },
          isPercentage,
          false
        );
        break;
    }
  }

  /** 取得攻擊數值
   * @param baseInteractionValue 基礎攻擊數值
   * @returns 計算過後的攻擊數值
   */
  public getInteractionValue(baseInteractionValue: number): number {
    const itemOperationList = this.itemConfig.itemOperationList;

    // 假如道具沒有被綁定為普攻，則不會即時運算
    const addition = itemOperationList.interactionValue.addition;
    const multiplication = itemOperationList.interactionValue.multiplication;

    const interactionValueAdd =
      baseInteractionValue > 0 ? baseInteractionValue + addition : (Math.abs(baseInteractionValue) + addition) * -1;

    return interactionValueAdd * multiplication;
  }

  /** 向所有目標發射投射物
   * @param targets 目標戰鬥單位們
   */
  public spawnProjectilesByTargets(targets: Array<BattleUnit<HeroData>>): void {
    // 假如沒有目標，向前方發射投射物
    if (targets.length === 0) {
      this.spawnProjectiles(this.rotation);
      return;
    }

    // 瞄準目標發射投射物
    targets.forEach((target: BattleUnit<HeroData>) => {
      this.spawnProjectiles(this.rotation - this.getBattleUnitIncludedRotation(target), target);
    });
  }

  /** 生成所有投射物
   * @param rotation 生成的角度
   * @param target 目標
   */
  private spawnProjectiles(rotation: number, target?: BattleUnit<HeroData>): void {
    let projectileAmount = this.itemConfig.itemData.spawnObjectAmount;
    const projectileSpawnRad = this.itemConfig.itemData.spawnObjectAngle;
    // 假如投射物數量為奇數，先往正前方發射一發
    if (projectileAmount % 2 === 1) {
      this.spawnProjectile(rotation, target);
      projectileAmount -= 1;

      // 剩下的投射物數量確定為偶數，一次發射一對
      const pairProjectileAmount = projectileAmount / 2;
      const rotationStep = projectileSpawnRad / pairProjectileAmount / 2;
      for (let index = 1; index <= pairProjectileAmount; index++) {
        this.spawnProjectile(rotation + rotationStep * index, target);
        this.spawnProjectile(rotation - rotationStep * index, target);
      }
    } else {
      // 扇形平均發射投射物
      const startRotation = rotation - projectileSpawnRad / 2;
      const rotationStep = projectileSpawnRad / (projectileAmount - 1);
      for (let index = 0; index < projectileAmount; index++) {
        this.spawnProjectile(startRotation + rotationStep * index, target);
      }
    }
  }

  /** 在目標群身上掛上環繞投射物
   * @param targets 目標群
   */
  public spawnSurroundProjectilesByTargets(targets: Array<BattleUnit<HeroData>>): void {
    targets.forEach((target: BattleUnit<HeroData>) => {
      // 360度平均分布
      const rotationStep = CombatNumber.Rad_360_Degree / this.itemConfig.itemData.spawnObjectAmount;
      for (let index = 1; index <= this.itemConfig.itemData.spawnObjectAmount; index++) {
        this.spawnProjectile(this.rotation + rotationStep * index, target);
      }
    });
  }

  /** 生成單一投射物
   * @param rotation 生成的角度
   * @param target 目標
   */
  private spawnProjectile(rotation: number, target?: BattleUnit<HeroData>): BaseProjectile | undefined {
    const itemConfig = {
      itemData: Object.assign({}, this.itemConfig.itemData),
      instigator: this.itemConfig.instigator,
      itemOperationList: this.itemConfig.itemOperationList,
      isIgnorefollow: this.itemConfig.isIgnorefollow,
      refreshTimes: this.itemConfig.refreshTimes,
    };
    const projectile = this.scene.combatGroups.getMemberFromGroup<BaseProjectile>(
      this.itemConfig.itemData.spawnObjectFunction
    );
    projectile?.setPosition(this.x, this.y);
    projectile?.setRotation(rotation);
    projectile?.init(itemConfig, target);
    return projectile;
  }

  /** 直接在目標位置生成投射物(瞬間必中)，若沒有目標則隨機在地圖上播放擊中特效
   * @param targets 目標們
   */
  public spawnProjectilesAtTargets(targets: Array<BattleUnit<HeroData>>): void {
    // 假如沒有目標，隨機位置表演擊中特效
    for (let index = 0; index < this.itemConfig.itemData.spawnObjectAmount - targets.length; index++) {
      const randomPosition = this.getRangeRandomWorldPosition();
      this.itemConfig.itemData.onHitEffectIdList.forEach((effectId: number) =>
        this.scene.combatComponent.playEffectOnMap(randomPosition.x, randomPosition.y, effectId)
      );
    }

    // 在目標位置生成投射物
    targets.forEach((target: BattleUnit<HeroData>) => {
      this.spawnProjectileAt(target.x, target.y, 0, this.itemConfig.itemData.spawnObjectSurvivalTime, target);
    });
  }

  /** 直接在目標位置左上角螢幕外生成投射物並追蹤，若沒有目標則隨機在地圖左上角螢幕外生成投射物
   * @param targets 目標們
   */
  public spawnDiagonalProjectilesAtTargets(targets: Array<BattleUnit<HeroData>>): void {
    // 假如沒有目標，隨機地圖左上角螢幕外生成投射物
    for (let index = 0; index < this.itemConfig.itemData.spawnObjectAmount - targets.length; index++) {
      // 限制投射物存活時間 路徑長度/投射物速度(模擬撞擊地面)
      const survivalTime = this.diagonalProjectilePosOffsetLength / this.itemConfig.itemData.spawnObjectSpeed;
      const randomPosition = this.getRangeRandomWorldPosition();
      this.spawnProjectileAt(
        randomPosition.x - this.scene.game.canvas.width / 4,
        randomPosition.y - this.scene.game.canvas.height,
        this.diagonalProjectileAngle,
        survivalTime
      );
    }

    // 在目標位置左上角螢幕外生成投射物並追蹤
    targets.forEach((target: BattleUnit<HeroData>) => {
      // 限制投射物存活時間 (路徑長度+緩衝的目標高度)/投射物速度
      const survivalTime =
        (this.diagonalProjectilePosOffsetLength + target.displayHeight) / this.itemConfig.itemData.spawnObjectSpeed;

      this.spawnProjectileAt(
        target.x - this.scene.game.canvas.width / 4,
        target.y - this.scene.game.canvas.height,
        this.diagonalProjectileAngle,
        survivalTime,
        target
      );
    });
  }

  /** 在特定位置生成投射物
   * @param x 位置X
   * @param y 位置Y
   * @param rotation 角度
   * @param survivalTime 投射物存活時間
   * @param target 目標
   */
  private spawnProjectileAt(
    x: number,
    y: number,
    rotation: number,
    survivalTime: number,
    target?: BattleUnit<HeroData>
  ): void {
    const itemConfig = {
      itemData: Object.assign({}, this.itemConfig.itemData),
      instigator: this.itemConfig.instigator,
      itemOperationList: this.itemConfig.itemOperationList,
      isIgnorefollow: this.itemConfig.isIgnorefollow,
      refreshTimes: this.itemConfig.refreshTimes,
    };
    itemConfig.itemData.spawnObjectSurvivalTime = survivalTime;
    const projectile = this.scene.combatGroups.getMemberFromGroup<BaseProjectile>(
      this.itemConfig.itemData.spawnObjectFunction
    );
    projectile?.setPosition(x, y);
    projectile?.setRotation(rotation);
    projectile?.init(itemConfig, target);
  }

  /** 召喚分身並排在目標群左右，右邊優先生成
   * @param targets 目標群
   */
  public spawnParallelMinionByTargets(targets: Array<BattleUnit<HeroData>>): void {
    targets.forEach((target: BattleUnit<HeroData>) => {
      // 設置召喚物Config
      const minionItemConfig: BaseItemConfig = {
        itemData: Object.assign({}, this.itemConfig.itemData),
        instigator: this.itemConfig.instigator,
        itemOperationList: this.itemConfig.itemOperationList,
        isIgnorefollow: this.itemConfig.isIgnorefollow,
        refreshTimes: this.itemConfig.refreshTimes,
      };
      // 是否複製目標道具
      if (minionItemConfig.itemData.spawnOnHitItemId === -1) {
        minionItemConfig.itemData.spawnOnHitItemId = target.bindingItemId;
      }

      // 生成召喚物並加入至目標單位下
      for (let index = 1; index <= this.itemConfig.itemData.spawnObjectAmount; index++) {
        const minion = this.scene.combatGroups.getMemberFromGroup<ItemBaseMinion>(
          this.itemConfig.itemData.spawnObjectFunction
        );
        if (minion === undefined) {
          return;
        }
        minion.init(minionItemConfig);

        // 是否複製目標影像
        if (minionItemConfig.itemData.effectIdList.length === 0) {
          minion.cloneMinionEffect(target.characterSpriteNameKey, target.characterSpriteScale);
        } else {
          minion.itemMinionEffect();
        }

        // 加入至戰鬥單位下
        target.addMinionParallel(minion);
      }
    });
  }

  /** 更新道具數值運算 */
  public updateItemOperationList(itemOperationList: ItemOperationList): void {
    this.itemConfig.itemOperationList = itemOperationList;
  }
  //#endregion 道具功能
}

//#region inherit class
/** 發動圓形攻擊 */
export class Aura extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new CenterCircleDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new PendingUntillKeyFrameEffect();
  public targetStrategy: ItemTargetStrategy = new CircleTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 發動前方長方形攻擊，攻擊時角度會隨發動者移動 */
export class Spray extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new NormalFollow();
  // TODO: 形狀尚未實作 HalfRectangle
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new NormalFollow();
  public effectStrategy: ItemEffectStrategy = new InstantPlayEffect();
  public targetStrategy: ItemTargetStrategy = new HalfRectangleTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 發動扇形攻擊，前方180度 */
export class Slash extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new NormalFollow();
  // TODO: 形狀尚未實作 Fan
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new PendingUntillKeyFrameEffect();
  public targetStrategy: ItemTargetStrategy = new FanTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 當敵人靠近扇形範圍內時發動扇形攻擊，現固定為180度 */
export class AuraSlash extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new FanDetect();
  public detectFollowStrategy: ItemFollowStrategy = new NormalFollow();
  // TODO: 形狀尚未實作 Fan
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new PendingUntillKeyFrameEffect();
  public targetStrategy: ItemTargetStrategy = new FanTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 發動扇形內整隊攻擊，現固定為160度 */
export class TeamSlash extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new NormalFollow();
  // TODO: 形狀尚未實作 Fan
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new PendingUntillKeyFrameEffect();
  public targetStrategy: ItemTargetStrategy = new FanTeamTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 當敵人靠近圓形範圍內時，對距離最近敵人發射投射物 */
export class Projectile extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new NormalFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new NormalFollow();
  public effectStrategy: ItemEffectStrategy = new SkipEffect();
  public targetStrategy: ItemTargetStrategy = new CircleNearestTarget();
  public interactionStrategy: ItemInteractionStrategy = new ProjectileInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 不偵測敵人固定往發射者面向發射投射物 */
export class ForwardProjectile extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new NormalFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new NormalFollow();
  public effectStrategy: ItemEffectStrategy = new SkipEffect();
  public targetStrategy: ItemTargetStrategy = new SkipTarget();
  public interactionStrategy: ItemInteractionStrategy = new ProjectileInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 當敵人靠近圓形範圍內時，對距離最近敵人發射投射物 */
export class AuraProjectile extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new CircleDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new SkipEffect();
  public targetStrategy: ItemTargetStrategy = new CircleNearestTarget();
  public interactionStrategy: ItemInteractionStrategy = new ProjectileInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 發射投射物圍繞在角色周遭 */
export class SurroundProjectile extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new SkipEffect();
  public targetStrategy: ItemTargetStrategy = new SelfTarget();
  public interactionStrategy: ItemInteractionStrategy = new SurroundProjectileInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = true;
  public isAwaitInteractionTime: boolean = false;
}

/** 依照投射物數量在敵人位置生成投射物(必中) */
export class TargetProjectile extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new SkipEffect();
  public targetStrategy: ItemTargetStrategy = new CircleRandomProjectileAmountTarget();
  public interactionStrategy: ItemInteractionStrategy = new TargetProjectileInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 依照投射物數量在敵人左上螢幕外位置生成投射物 */
export class DiagonalTargetProjectile extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new SkipEffect();
  public targetStrategy: ItemTargetStrategy = new CircleRandomProjectileAmountTarget();
  public interactionStrategy: ItemInteractionStrategy = new DiagonalTargetProjectileInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = false;
}

/** 對自己發動 */
export class Self extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new InstantPlayEffect();
  public targetStrategy: ItemTargetStrategy = new SelfTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = true;
}

/** 並排在目標左右的召喚物 */
export class ParallelMinion extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new SkipEffect();
  public targetStrategy: ItemTargetStrategy = new SelfTarget();
  public interactionStrategy: ItemInteractionStrategy = new ParallelMinionInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = true;
  public isAwaitInteractionTime: boolean = false;
}

/** 對我方隊伍發動 */
export class SelfTeam extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new InstantPlayEffect();
  public targetStrategy: ItemTargetStrategy = new SelfTeamTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = true;
}

/** 對血量最低隊友發動 */
export class EndangerTeammate extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new InstantPlayEffect();
  public targetStrategy: ItemTargetStrategy = new EndangerTeammateTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = true;
}

/** 對死亡隊友發動 */
export class DeadTeammate extends BaseItem {
  public detectStrategy: ItemDetectStrategy = new SkipDetect();
  public detectFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public detectHostileProjectileStrategy = new SkipDetectProjectile();
  public activeFollowStrategy: ItemFollowStrategy = new OnlyPositionFollow();
  public effectStrategy: ItemEffectStrategy = new InstantPlayEffect();
  public targetStrategy: ItemTargetStrategy = new DeadTeammateTarget();
  public interactionStrategy: ItemInteractionStrategy = new DirectInteraction();
  public isAwaitSpawnObjectSurvivalTime: boolean = false;
  public isAwaitInteractionTime: boolean = true;
}
//#endregion inherit class
