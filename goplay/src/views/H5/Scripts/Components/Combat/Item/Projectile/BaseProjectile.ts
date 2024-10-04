import { HeroData } from '@/manager/TableManager';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import BaseProjectileFSM, { BaseProjectileEventId } from './BaseProjectileFSM';
import {
  BodyType,
  CombatNumber,
  InteractionEffect,
  InteractionType,
  RangeType,
  SpawnOnHitType,
} from '@/helper/enum/Combat';
import ProjectileTargetStrategy, { DirectTarget, HomingTarget, TeamTarget } from './ProjectileTargetStrategy';
import MapObstacle from '../../Component/MapObstacle';
import ProjectileMoveStrategy, {
  BoomerangMove,
  CurveMove,
  FixedFrontMove,
  ForwardMove,
  SurroundMove,
  TraceMove,
} from './ProjectileMoveStrategy';
import ProjectileDetectTargetStrategy, {
  CenterCircleDetectTarget,
  HalfRectangleDetectTarget,
  SkipDetectTarget,
  TopCircleDetectTarget,
} from './ProjectileDetectTargetStrategy';
import ProjectileDetectObstacleStrategy, {
  CenterCircleDetectObstacle,
  SkipDetectObstacle,
  TopCircleDetectObstacle,
} from './ProjectileDetectObstacleStrategy';
import ProjectileDetectSurviveStrategy, {
  InBoundDetectSurvive,
  BoomerangDetectSurvive,
  SkipDetectSurvive,
  TargetAliveDetectSurvive,
} from './ProjectileDetectSurviveStrategy';
import { BaseItemConfig } from '../BaseItem';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import { filterHostileBattleUnits, ICombatScene } from '../../Combat';
import ProjectileBodyResizeStrategy, {
  ArrowBodyResize,
  BoltBodyResize,
  SkipBodyResize,
} from './ProjectileBodyResizeStrategy';
import ProjectileDetectHostileProjectileStrategy, {
  CenterCircleDetectProjectile,
  SkipDetectProjectile,
  TopCircleDetectProjectile,
} from './ProjectileDetectHostileProjectileStrategy';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';

export default abstract class BaseProjectile extends Object2D {
  //#region declare、readonly
  /** 遊戲場景 */
  public declare scene: Phaser.Scene & ICombatScene;
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;
  private readonly interactInterval = 500;
  //#endregion declare、readonly

  //#region properties
  /** 發起的戰鬥單位 */
  public get instigator(): BattleUnit<HeroData> {
    return this.itemConfig.instigator;
  }
  /** 追蹤的目標 */
  private _target?: BattleUnit<HeroData>;
  public get target(): BattleUnit<HeroData> | undefined {
    return this._target;
  }
  /** 投射物存活時間 */
  public get survivalTime(): number {
    return this.itemConfig.itemData.spawnObjectSurvivalTime;
  }
  /** 投射物尺寸 */
  private get size(): number {
    return this.itemConfig.itemData.spawnObjectSize;
  }
  /** 投射物速度 */
  public get speed(): number {
    return this.itemConfig.itemData.spawnObjectSpeed;
  }
  /** 道具範圍 */
  public get itemRange(): number {
    return this.itemConfig.itemData.range;
  }
  /** 投射物尖端圓圈半徑 */
  private get topCircleRadius(): number {
    return this.size / 8;
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
  /** 是否在世界邊界內 */
  public get isInBounds(): boolean {
    return this.scene.physics.world.bounds.contains(this.x, this.y);
  }
  //#endregion properties

  //#region abstract
  /** 旋轉lerp量 */
  protected abstract rotateLerp: number;
  /** 是否開啟物理動態body */
  protected abstract physicsEnable: boolean;
  /** 投射物物理body尺寸調整Strategy */
  protected abstract bodyResizeStrategy: ProjectileBodyResizeStrategy;
  /** 投射物移動Strategy */
  protected abstract moveStrategy: ProjectileMoveStrategy;
  /** 投射物偵測範圍內是否有投射物Strategy */
  protected abstract detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy;
  /** 投射物偵測範圍內是否有目標Strategy */
  protected abstract detectTargetStrategy: ProjectileDetectTargetStrategy;
  /** 投射物偵測範圍內是否有障礙物Strategy */
  protected abstract detectObstacleStrategy: ProjectileDetectObstacleStrategy;
  /** 投射物偵測是否符合存活條件Strategy */
  protected abstract detectSurviveStrategy: ProjectileDetectSurviveStrategy;
  /** 投射物鎖定目標Strategy */
  protected abstract targetStrategy: ProjectileTargetStrategy;
  //#endregion abstract

  //#region 元件與暫存
  /** 狀態機 */
  private baseProjectileFSM: BaseProjectileFSM;
  /** 特效圖片群組 */
  private effectTweenSpriteGroup: Phaser.GameObjects.Group;
  /** 特效圖片Tweens */
  protected projectileEffectTweenList: Phaser.Tweens.Tween[] = [];
  /** 道具資料Config */
  private itemConfig!: BaseItemConfig;
  /** 與目標互動紀錄map<互動對象, 互動時間點> */
  private interactRecords!: Map<BattleUnit<HeroData>, number>;
  /** 是否往回，向發動者移動 */
  public isReturn: boolean = false;
  //#endregion 元件與暫存

  //#region constructor、Phaser function
  constructor(scene: Phaser.Scene & ICombatScene, x: number, y: number) {
    super(scene, x, y);
    // 創建狀態機
    this.baseProjectileFSM = new BaseProjectileFSM(this);
    // 設置深度
    this.setDepth(this.scene.worldTopEdgeY);
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

  public update(time: number, delta: number) {
    this.baseProjectileFSM.update(time, delta);
  }
  //#endregion constructor、Phaser function

  //#region fsm
  /** 強制投射物執行完成 */
  public finish(): void {
    this.baseProjectileFSM.stateMachine.triggerEvent(BaseProjectileEventId.Finish);
  }

  public onActiveEnter(): void {
    // 開啟物理body，調整大小
    this.body.enable = this.physicsEnable;
    this.bodyResizeStrategy.resize(this);

    // 設置投射物特效
    if (this.itemConfig.itemData.effectIdList.length === 0) {
      console.error(`無法獲取特效資料，投射物所使用的特效資料清單長度不該為0。itemData: ${this.itemConfig.itemData}`);
      return;
    }
    this.itemConfig.itemData.effectIdList.forEach((effectId: number) => this.setEffect(effectId));
    // 初始化與敵人互動紀錄
    this.interactRecords = new Map();
    // 初始化移動路徑
    this.moveStrategy.init(this);
  }

  /** 當投射物啟動時
   * @param time 遊戲時間
   * @param delta 幀間隔
   * @returns 是否完成啟動狀態該完成的任務
   */
  public onActiveUpdate(time: number, delta: number): boolean {
    // 投射物朝路徑移動
    this.moveStrategy.move(this, delta);

    // 撞到障礙物，結束啟動狀態
    const obstacle = this.detectObstacleStrategy.detect(this);
    if (obstacle !== undefined) {
      // 表演碰撞障礙物特效
      obstacle.playHitByProjectileEffectTween(this.x, this.y, this.itemConfig.itemData.onHitObstacleEffectIdList);
      // 投射物撞到障礙物，取消擊中後生成
      this.cancelSpawnOnHitItem();
      return true;
    }

    // 撞到敵方投射物，雙方結束啟動狀態
    const hostileProjectile = this.detectHostileProjectileStrategy.detect(this);
    if (hostileProjectile) {
      // 敵對可穿透的投射物不銷毀
      if (hostileProjectile.itemConfig.itemData.spawnObjectPenetration <= 1) {
        hostileProjectile.finish();
      }
      // 自己還可穿透不銷毀
      if (this.itemConfig.itemData.spawnObjectPenetration <= 1) {
        return true;
      }
    }

    // 檢查投射物生存條件
    if (this.detectSurviveStrategy.detect(this) === false) {
      // 投射物無法存活，取消擊中後生成
      this.cancelSpawnOnHitItem();
      return true;
    }

    // 偵測目標
    const detectTarget = this.detectTargetStrategy.detect(this);
    if (detectTarget === undefined) {
      // 未完成，持續偵測敵人
      return false;
    }

    // 確認目標群
    const targets = this.targetStrategy.target(this, detectTarget);
    if (targets.length === 0) {
      // 偵測到的目標群不符合條件，不攻擊
      return false;
    }

    // 短時間內重複偵測到相同目標群，不攻擊
    const index = targets.findIndex((target: BattleUnit<HeroData>) => {
      const lastInteractTime = this.interactRecords.get(target);
      return lastInteractTime === undefined || time - lastInteractTime > this.interactInterval;
    });
    if (index === -1) {
      return false;
    }

    // 對目標群發動攻擊
    this.interactTargets(targets);
    // 可穿透數下降
    this.itemConfig.itemData.spawnObjectPenetration -= 1;
    // 投射物尚可穿透敵人，持續運作
    if (this.itemConfig.itemData.spawnObjectPenetration > 0) {
      // 紀錄互動時間
      targets.forEach((target: BattleUnit<HeroData>) => this.interactRecords.set(target, time));
      return false;
    }

    return true;
  }

  /** 當投射物執行完成 */
  public onFinishEnter(): void {
    // 完成移動路徑
    this.moveStrategy.finish(this);
    // 關閉物理body
    this.body.enable = false;
    // 關閉投射物特效
    this.projectileEffectTweenList.forEach((tween: Phaser.Tweens.Tween) => tween.complete());
    this.projectileEffectTweenList = [];
    // 將自己回收
    this.scene.combatGroups.hideMemberFromGroup(this.itemConfig.itemData.spawnObjectFunction, this);
    // 有spawnOnStrikeItem，在該位置發動道具
    if (this.itemConfig.itemData.spawnOnHitType === SpawnOnHitType.SpawnObject) {
      this.scene.combatComponent.spawnOnHitItem(this.x, this.y, this.itemConfig, 0);
    } else {
      console.error(
        `spawnOnHitType = ${this.itemConfig.itemData.spawnOnHitType}, 使得投射物無法創建擊中生成道具. 道具Id = ${this.itemConfig.itemData.id}`
      );
    }
  }
  //#endregion fsm

  //#region 投射物功能
  /** 初始化投射物
   * @param itemConfig 道具Config
   * @param target 目標戰鬥單位
   */
  public init(itemConfig: BaseItemConfig, target?: BattleUnit<HeroData>): void {
    // 資料暫存
    this.itemConfig = itemConfig;
    this._target = target;

    // 啟動投射物
    this.setVisible(true);
    this.setActive(true);
    this.baseProjectileFSM.start();
  }

  /** 調整物理body
   *  @param bodyType 物理body形狀種類
   */
  public resizeBody(bodyType: BodyType) {
    switch (bodyType) {
      case BodyType.Arrow:
        this.body.setSize(this.size, this.size / 2);
        this.body.setOffset(-this.size / 2, -this.size / 4);
        break;
      case BodyType.Bolt:
        this.body.setSize(this.size, this.size);
        this.body.setOffset(-this.size / 2, -this.size / 2);
        break;
      case BodyType.None:
        this.body.setSize(0, 0);
        break;
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

  /** 投射物範圍內的敵方戰鬥單位
   * @param rangeType 範圍類型
   * @returns 範圍內的body
   */
  private getRangeHostileUnits(rangeType: RangeType): Array<BattleUnit<HeroData>> {
    const bodies = this.getRangeEnabledBodies(rangeType);
    return filterHostileBattleUnits(this.instigator, bodies);
  }

  /** 範圍內最近的敵方戰鬥單位
   * @param rangeType 範圍類型
   * @returns 目標
   */
  public getRangeNearestHostileProjectiles(rangeType: RangeType): BaseProjectile | undefined {
    const projectiles = this.getRangeHostileProjectiles(rangeType);
    const nearestProjectile = PhaserHelper.getRangeNearestObject2D(this.x, this.y, projectiles) as BaseProjectile;
    return nearestProjectile ?? undefined;
  }

  /** 投射物範圍內的敵對投射物
   * @param rangeType 範圍類型
   * @returns 範圍內的敵對投射物
   */
  public getRangeHostileProjectiles(rangeType: RangeType): BaseProjectile[] {
    // 投射物範圍內的敵對投射物
    const bodies = this.getRangeEnabledBodies(rangeType);
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

  /** 投射物範圍內的障礙物
   * @param rangeType 範圍類型
   * @returns 範圍內的障礙物
   */
  public getRangeObstacle(rangeType: RangeType): MapObstacle | undefined {
    // 投射物圓圈範圍內的障礙物
    const bodies = this.getRangeEnabledBodies(rangeType);
    const obstacleBodies = bodies.filter(
      (body: Phaser.Physics.Arcade.Body) => body.gameObject instanceof MapObstacle === true
    );

    // 檢查此投射物是否會範圍內障礙物碰撞
    const obstacles = obstacleBodies.map((body: Phaser.Physics.Arcade.Body) => body.gameObject as MapObstacle);
    const hitObstacle = obstacles.find(
      (obstacle: MapObstacle) => obstacle.isPass(this.itemConfig.itemData.spawnObjectFunction) === false
    );
    // 回傳遞一個碰撞到的障礙物
    return hitObstacle;
  }

  /** 投射物範圍內的Bodies
   * @param rangeType 範圍類型
   * @returns 範圍內的Bodies
   */
  private getRangeEnabledBodies(rangeType: RangeType): Phaser.Physics.Arcade.Body[] {
    let rangeBodies: Phaser.Physics.Arcade.Body[] = [];
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
        rangeBodies = bodies.filter(
          (value: Phaser.Physics.Arcade.Body, index: number) => bodies.indexOf(value) === index
        );
      case RangeType.CenterCircle:
      case RangeType.TopCircle:
        const isTopCirCle = rangeType === RangeType.TopCircle;
        rangeBodies = this.scene.physics.overlapCirc(
          isTopCirCle ? this.topCircleCenterX : this.x,
          isTopCirCle ? this.topCircleCenterY : this.y,
          isTopCirCle ? this.topCircleRadius : this.size / 2,
          true,
          false
        ) as Phaser.Physics.Arcade.Body[];
    }
    return rangeBodies.filter((body: Phaser.Physics.Arcade.Body) => body.enable);
  }

  /** 面向目標戰鬥單位
   * @param battleUnit 目標戰鬥單位
   * @param delta 幀數間隔
   */
  public faceBattleUnit(battleUnit: BattleUnit<HeroData>, delta: number): void {
    // 計算夾角
    const includedRotation = this.rotation - Phaser.Math.Angle.Between(this.x, this.y, battleUnit.x, battleUnit.y);
    // 目標角度
    const targetRotation = this.rotation - Phaser.Math.Angle.Wrap(includedRotation);
    // 旋轉
    this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, targetRotation, this.rotateLerp * (delta / 1000));
  }

  /** 從投射物面向角度向前移動
   * @param delta 幀數間隔
   */
  public moveByRotation(delta: number): void {
    this.x +=
      Math.cos(this.rotation) *
      this.itemConfig.itemData.spawnObjectSpeed *
      ((delta * this.scene.time.timeScale) / 1000);
    this.y +=
      Math.sin(this.rotation) *
      this.itemConfig.itemData.spawnObjectSpeed *
      ((delta * this.scene.time.timeScale) / 1000);
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
        itemData.onHitEffectIdList
      );
      this.interactTarget(target, itemData.interactionType2, itemData.interactionValue2, itemData.isPercentage2);
    });
  }

  /** 與目標做互動
   * @param target 目標
   * @param interactionType 互動類型
   * @param interactionValue 互動數值
   * @param isPercentage 是否為百分比
   * @param itemNameKey 目標被影響時顯示的道具圖標，'' = 不顯示
   * @param onHitEffectId 目標被擊中時觸發的特效，-1 = 無特效
   */
  public interactTarget(
    target: BattleUnit<HeroData>,
    interactionType: InteractionType,
    interactionValue: number,
    isPercentage: boolean,
    itemNameKey: string = '',
    onHitEffectIdList: number[] = []
  ): void {
    switch (interactionType) {
      // 無任何影響
      case InteractionType.None:
        break;
      // 清除負面類型
      case InteractionType.ClearNegative:
        target.clearNegativeInfluences();
        break;
      // 復活
      case InteractionType.Revive:
        target.revive();
        break;
      // 對周圍目標進行吸引
      case InteractionType.Absorb:
        target.absorb(this.x, this.y, interactionValue, true);
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
          true
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
          true
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

  /** 清除追蹤目標 */
  public clearTarget(): void {
    this._target = undefined;
  }

  /** 設置投射物特效
   * @param effectId 特效id
   */
  private async setEffect(effectId: number): Promise<void> {
    const effectData = this.scene.combatComponent.getEffectData(effectId);
    if (effectData === undefined) {
      return;
    }
    // 特效是否顯示在角色之上
    this.setDepth(effectData.aboveCharacter ? this.scene.worldBottomEdgeY : this.scene.worldTopEdgeY);

    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    if (effectSprite === null) {
      return;
    }

    effectSprite.setTexture(effectData.nameKey);
    effectSprite.anims.play(effectData.nameKey);
    effectSprite.setScale(this.size / effectData.bodySize);
    effectSprite.setAlpha(1);
    effectSprite.setRotation(0);
    effectSprite.setPosition(0, 0);
    // 設置特效Tween
    const effectTween = await AnimationHelper.setTweenFromEffectData(effectSprite, effectData, false);
    this.projectileEffectTweenList.push(effectTween);
  }

  /** 取消擊中後生成道具 */
  public cancelSpawnOnHitItem(): void {
    this.itemConfig.itemData.spawnOnHitItemId = -1;
  }
  //#endregion 投射物功能
}

/** 弓箭
 * 以弓箭前端1/4處，半徑為弓箭長度1/8的圓圈，作為攻擊判定範圍
 */
export class Arrow extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new ForwardMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new TopCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new TopCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 物理弓箭(物理版Arrow)
 * 以弓箭前端1/4處，半徑為弓箭長度1/8的圓圈，作為攻擊判定範圍
 */
export class PhysicsArrow extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = true;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new ArrowBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new ForwardMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new TopCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new TopCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new TopCircleDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 拋物線弓箭
 * 以弓箭前端1/4處，半徑為弓箭長度1/8的圓圈，作為攻擊判定範圍
 */
export class CurveArrow extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = true;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new ArrowBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new CurveMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new TopCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new TopCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new TopCircleDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 追蹤弓箭
 * 只會攻擊目標，其他敵方單位都會被忽略
 * 以弓箭前端1/4處，半徑為弓箭長度1/8的圓圈，作為攻擊判定範圍
 */
export class HomingArrow extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new TraceMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new TopCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new TopCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new HomingTarget();
}

/** 全體弓箭
 * 攻擊目標整隊隊伍
 * 以弓箭前端1/4處，半徑為弓箭長度1/8的圓圈，作為攻擊判定範圍
 */
export class TeamArrow extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new ForwardMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new TopCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new TopCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new TeamTarget();
}

/** 魔法彈
 * 中心發出圓形作為判定
 */
export class Bolt extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new ForwardMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new CenterCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 有物理body的魔法彈
 * 中心發出圓形作為判定
 */
export class PhysicsBolt extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = true;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new BoltBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new ForwardMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new CenterCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy =
    new CenterCircleDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 追蹤魔法彈
 * 只會攻擊目標，其他敵方單位都會被忽略
 * 中心發出圓形作為判定
 */
export class HomingBolt extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new TraceMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new CenterCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new HomingTarget();
}

/** 必中追蹤魔法彈
 * 只會攻擊目標，其他敵方單位都會被忽略
 * 中心發出圓形作為判定
 * 穿透障礙物且可在界外存活
 */
export class TargetHomingBolt extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new TraceMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new SkipDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new SkipDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new HomingTarget();
}

/** 全體魔法彈
 * 攻擊目標整隊隊伍
 * 中心發出圓形作為判定
 */
export class TeamBolt extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new ForwardMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new CenterCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new InBoundDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new TeamTarget();
}

/** 斧頭
 * 環繞目標移動，穿牆
 */
export class Axe extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new SurroundMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new SkipDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new TargetAliveDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 矛
 * 弓箭判定範圍，穿牆
 */
export class Spear extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new ForwardMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new HalfRectangleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new SkipDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new SkipDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 盾
 * 不移動，穿牆
 */
export class Shield extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new FixedFrontMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new SkipDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new SkipDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new TargetAliveDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 迴力鏢
 * 到達道具範圍外後，返回發動者身上
 */
export class Boomerang extends BaseProjectile {
  public rotateLerp: number = CombatNumber.NormalLerp;
  public physicsEnable: boolean = false;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new SkipBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new BoomerangMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new CenterCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy = new SkipDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new BoomerangDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}

/** 物理迴力鏢(直去直回)
 * 到達道具範圍外後，返回發動者身上
 */
export class PhysicsBoomerang extends BaseProjectile {
  public rotateLerp: number = CombatNumber.StraightLerp;
  public physicsEnable: boolean = true;
  public bodyResizeStrategy: ProjectileBodyResizeStrategy = new BoltBodyResize();
  public moveStrategy: ProjectileMoveStrategy = new BoomerangMove();
  public detectTargetStrategy: ProjectileDetectTargetStrategy = new CenterCircleDetectTarget();
  public detectObstacleStrategy: ProjectileDetectObstacleStrategy = new CenterCircleDetectObstacle();
  public detectHostileProjectileStrategy: ProjectileDetectHostileProjectileStrategy =
    new CenterCircleDetectProjectile();
  public detectSurviveStrategy: ProjectileDetectSurviveStrategy = new BoomerangDetectSurvive();
  public targetStrategy: ProjectileTargetStrategy = new DirectTarget();
}
