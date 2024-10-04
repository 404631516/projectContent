import {
  AnimationTextureKey,
  SpaceInvadersEnemyMovementPattern,
  SpaceInvadersEnemyPatrolType,
  SpaceInvadersString,
} from '../Data/SpaceInvadersConfig';
import { AnimationType } from './Manager/SpaceInvadersAnimationFactory';
import { SpaceInvadersAnimDestroy } from './AnimObjects/SpaceInvadersAnimDestroy';
import SpaceInvadersGameScene from '../Scenes/SpaceInvadersGameScene';
import { SpaceInvadersGroupManager } from './Manager/SpaceInvadersGroupManager';
import {
  SpaceInvadersEnemyData,
  SpaceInvadersMovementPatternData,
  SpaceInvadersWaveData,
} from '@/manager/TableManager';
import { SpaceInvadersEnemyBullet } from './Bullets/SpaceInvadersEnemyBullet';
import SpaceInvadersEnemyFSM, { SpaceInvadersEnemyEventId } from './SpaceInvadersEnemyFSM';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import BaseBar from '@/views/H5/Scripts/Components/BaseBar';
import HeartBar from '@/views/H5/Scripts/Components/HeartBar';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';

export class SpaceInvadersEnemy extends Object2D {
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** 狀態機 */
  private fsm: SpaceInvadersEnemyFSM = new SpaceInvadersEnemyFSM(this);

  /** 資源管理器 */
  private groupManager: SpaceInvadersGroupManager;
  /** 敵人所屬波次資料 */
  private waveData: SpaceInvadersWaveData;
  /** 敵人移動模式 */
  private movementPatternData: SpaceInvadersMovementPatternData;
  /** 敵人資料 */
  private enemyData: SpaceInvadersEnemyData;

  /** 敵人圖片 */
  private sprite: Phaser.GameObjects.Sprite;
  /** 受傷動畫 */
  private hurtEffect: Phaser.GameObjects.Sprite;
  /** 受傷動畫是否顯示 */
  private isHurtEffectVisible: boolean = false;
  /** 受傷動畫隱藏時間 */
  private hurtEffectHideTime: number = 0;
  /** 受傷動畫顯示時間 */
  private readonly hurtEffectShowTime: number = 500;

  /** 子彈發射時間 */
  private bulletTime: number = 0;
  /** 原始動畫每幀毫秒數 */
  private originAnimFrameDuration: number;
  /** 血量 */
  private hp: number = 1;
  /** 血條 */
  private hpBar: BaseBar;

  /** 當前的移動tween, 用來給道具操控timeScale的 */
  private _currentMovingTweens: Phaser.Tweens.Tween[];
  private set currentMovingTween(value: Phaser.Tweens.Tween[]) {
    this._currentMovingTweens = value;
    // 判斷當前是否在緩慢道具持續時間內, 設定timeScale
    if (this.gameScene.isSlowDown) {
      this.setMovingTimeScale(this.gameScene.gameSetting.slowDownTimeScale);
    }
  }

  constructor(private gameScene: SpaceInvadersGameScene) {
    // 生成點必須在畫面外, 避免出生時被玩家看見, state machine update還需要幾個frame才會進入移動state
    super(gameScene, -100, -100);
  }

  /**
   * 初始化
   * @param groupManager 資源管理器
   * @param waveData 所屬波次資料
   * @param movementPatternData 移動模式資料
   */
  public init(
    groupManager: SpaceInvadersGroupManager,
    waveData: SpaceInvadersWaveData,
    movementPatternData: SpaceInvadersMovementPatternData,
    enemyData: SpaceInvadersEnemyData,
  ): void {
    this.groupManager = groupManager;
    this.waveData = waveData;
    this.movementPatternData = movementPatternData;
    this.enemyData = enemyData;
  }

  public update(time: number, delta: number): void {
    this.fsm.updateState(time, delta);

    if (time > this.bulletTime) {
      if (this.isInScene()) {
        this.fire();
      }
      // 隨機射擊間隔時間
      const fireInterval = Phaser.Math.RND.integerInRange(
        this.gameScene.gameSetting.enemyFireIntervalMin,
        this.gameScene.gameSetting.enemyFireIntervalMax,
      );
      // 設定下次射擊時間
      this.bulletTime = time + fireInterval;
    }

    // 受傷動畫隱藏
    if (this.isHurtEffectVisible && time > this.hurtEffectHideTime) {
      this.hurtEffect.setVisible(false);
      this.isHurtEffectVisible = false;
    }
  }

  /** 開火 */
  private fire(): void {
    const enemyBullet: SpaceInvadersEnemyBullet = this.groupManager.enemyBullets.get();
    if (enemyBullet) {
      enemyBullet.shoot(
        new Phaser.Math.Vector2(this.x, this.y),
        new Phaser.Math.Vector2(this.gameScene.player.x, this.gameScene.player.y),
        this.gameScene.gameSetting.enemyBulletSpeed,
      );
    }
  }

  /**
   * 取得敵人圖片key
   * @param enemyId 敵人id
   * @returns 敵人圖片key
   */
  private getTextureKeyByEnemyId(enemyId: number): string {
    // 紀錄textureKey
    const textureKey = 'animEnemy' + enemyId;
    // 驗證textureKey屬於enum AnimationKey
    if (!Object.values(AnimationTextureKey).includes(textureKey as AnimationTextureKey)) {
      console.error('Unknown textureKey:', textureKey);
      return AnimationTextureKey.AnimEnemy1;
    }
    return textureKey;
  }

  /**
   * 取得敵人動畫key
   * @param enemyId 敵人id
   * @returns 敵人動畫key
   */
  private getAnimationKeyByEnemyId(enemyId: number): string {
    const animationKey = 'enemyFly' + enemyId;
    // 驗證animationKey屬於enum AnimationType
    if (!Object.values(AnimationType).includes(animationKey as AnimationType)) {
      console.error('Unknown animationKey:', animationKey);
      return AnimationType.EnemyFly1;
    }
    return animationKey;
  }

  //#region 狀態機事件
  /** 設定出生點, 準備開始移動 */
  public onSpawnEnter(): void {
    // 設定圖片
    const textureKey = this.getTextureKeyByEnemyId(this.enemyData.id);
    this.sprite = this.addSprite(textureKey, 0, 0);
    this.sprite.setScale(this.waveData.enemySize);
    // 設定body大小 = 圖片大小
    const bodyWidth = this.sprite.width * this.waveData.enemySize;
    const bodyHeight = this.sprite.height * this.waveData.enemySize;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(-bodyWidth / 2, -bodyHeight / 2);
    // 設定動畫
    const animKey = this.getAnimationKeyByEnemyId(this.enemyData.id);
    this.sprite.play(animKey);
    // 紀錄原始動畫每幀毫秒數
    this.originAnimFrameDuration = this.sprite.anims.msPerFrame;
    // 更改動畫播放速度
    if (this.gameScene.isSlowDown) {
      this.setMovingTimeScale(this.gameScene.gameSetting.slowDownTimeScale);
    }
    // 加入受傷動畫, 大小跟隨敵人寬度調整
    this.hurtEffect = this.addSprite(SpaceInvadersString.Hurt, 0, 0);
    const hurtEffectWidth = this.sprite.width * this.enemyData.hurtScaleToWidth;
    this.hurtEffect.setDisplaySize(hurtEffectWidth, hurtEffectWidth);
    this.hurtEffect.setVisible(false);
    // 設定血量
    this.hp = this.enemyData.hp;
    this.hpBar = this.addObject(
      0,
      -bodyHeight / 2 - 10,
      HeartBar,
      BaseSceneString.HpBarBg,
      SpaceInvadersString.EnemyHp,
      0.5,
    );
    this.hpBar.resetValue(this.hp);

    // 設定隨機出生點
    const spawnPositionX = Phaser.Math.RND.integerInRange(
      this.movementPatternData.spawnRangeMinX,
      this.movementPatternData.spawnRangeMaxX,
    );
    const spawnPositionY = Phaser.Math.RND.integerInRange(
      this.movementPatternData.spawnRangeMinY,
      this.movementPatternData.spawnRangeMaxY,
    );
    this.setPosition(spawnPositionX, spawnPositionY);

    // 根據巡邏秒數, 決定移動目標
    let nextStateEvent: SpaceInvadersEnemyEventId;
    if (this.waveData.patrolSeconds > 0) {
      nextStateEvent = SpaceInvadersEnemyEventId.MoveToPatrolPosition;
    } else {
      nextStateEvent = SpaceInvadersEnemyEventId.MoveToExitPosition;
    }
    // 例外: 若是移動模式是不會離場的類型，則開始移動到巡邏點
    if (this.waveData.movementPattern === SpaceInvadersEnemyMovementPattern.TopToMiddlePatrol) {
      nextStateEvent = SpaceInvadersEnemyEventId.MoveToPatrolPosition;
    }
    // 例外: 若是移動模式是Z字向下，則開始Z字向下移動
    if (this.waveData.movementPattern === SpaceInvadersEnemyMovementPattern.TopToDownZigzag) {
      nextStateEvent = SpaceInvadersEnemyEventId.MoveZigzagDown;
    }

    this.fsm.triggerEvent(nextStateEvent);
  }

  /** 移動到巡邏點 */
  public onMoveToPatrolPositionEnter(): void {
    const patrolPositionX = Phaser.Math.RND.integerInRange(
      this.movementPatternData.patrolRangeMinX,
      this.movementPatternData.patrolRangeMaxX,
    );
    const patrolPositionY = Phaser.Math.RND.integerInRange(
      this.movementPatternData.patrolRangeMinY,
      this.movementPatternData.patrolRangeMaxY,
    );

    // 移動速度
    const moveSpeed = 0.1;
    // 移動距離
    const moveDistance = Phaser.Math.Distance.Between(this.x, this.y, patrolPositionX, patrolPositionY);

    this.currentMovingTween = [
      this.gameScene.tweens.add({
        targets: this,
        ease: Phaser.Math.Easing.Quartic.InOut,
        duration: moveDistance / moveSpeed,
        x: patrolPositionX,
        y: patrolPositionY,
        paused: false,
        onComplete: () => {
          this.fsm.triggerEvent(SpaceInvadersEnemyEventId.Patrol);
        },
      }),
    ];
  }

  /** 取得巡邏狀態的持續時間 */
  public getPatrolStateDuration(): number {
    // 定義巡邏持續時間
    let duration = this.waveData.patrolSeconds * 1000;
    // 若是移動模式是不會離場的類型，則巡邏時間為180秒
    if (this.waveData.movementPattern === SpaceInvadersEnemyMovementPattern.TopToMiddlePatrol) {
      duration = 180 * 1000;
    }
    return duration;
  }

  /** 巡邏 */
  public onPatrolEnter(): void {
    // 開始巡邏
    switch (this.waveData.patrolType) {
      case SpaceInvadersEnemyPatrolType.None:
        // 原地不動
        break;
      case SpaceInvadersEnemyPatrolType.LeftRight:
        this.currentMovingTween = [
          this.gameScene.tweens.add({
            targets: this,
            ease: Phaser.Math.Easing.Linear,
            duration: 2000 / this.waveData.enemySpeed,
            x: '+=200',
            paused: false,
            // delay,
            yoyo: true,
            repeat: -1,
            onComplete: () => {
              this.fsm.triggerEvent(SpaceInvadersEnemyEventId.MoveToExitPosition);
            },
          }),
        ];
        break;
      case SpaceInvadersEnemyPatrolType.LeftRightZigzag:
        this.currentMovingTween = [
          this.gameScene.tweens.add({
            targets: this,
            ease: Phaser.Math.Easing.Quartic.InOut,
            duration: 4000 / this.waveData.enemySpeed,
            x: '+=200',
            paused: false,
            yoyo: true,
            repeat: -1,
            onComplete: () => {
              this.fsm.triggerEvent(SpaceInvadersEnemyEventId.MoveToExitPosition);
            },
          }),
          this.gameScene.tweens.add({
            targets: this,
            ease: Phaser.Math.Easing.Linear,
            duration: 800 / this.waveData.enemySpeed,
            y: '+=50',
            paused: false,
            yoyo: true,
            repeat: -1,
          }),
        ];
        break;
      default:
        console.error('Unknown enemy patrolType:', this.waveData.patrolType);
        break;
    }
  }

  /** 移動到離場點 */
  public onMoveToExitPositionEnter(): void {
    const exitPositionX = Phaser.Math.RND.integerInRange(
      this.movementPatternData.exitRangeMinX,
      this.movementPatternData.exitRangeMaxX,
    );
    const exitPositionY = Phaser.Math.RND.integerInRange(
      this.movementPatternData.exitRangeMinY,
      this.movementPatternData.exitRangeMaxY,
    );

    // 移動速度
    const moveSpeed = 0.2;
    // 移動距離
    const moveDistance = Phaser.Math.Distance.Between(this.x, this.y, exitPositionX, exitPositionY);

    this.currentMovingTween = [
      this.gameScene.tweens.add({
        targets: this,
        ease: Phaser.Math.Easing.Linear,
        duration: moveDistance / moveSpeed,
        x: exitPositionX,
        y: exitPositionY,
        paused: false,
        onComplete: () => {
          this.fsm.triggerEvent(SpaceInvadersEnemyEventId.Exit);
        },
      }),
    ];
  }

  /** Z字移動向下 */
  public onMoveZigzagDownEnter(): void {
    // 移動速度
    const moveSpeed = 0.1;
    // 移動距離
    const moveDistance = 1000;
    const exitPositionY = this.scene.game.canvas.height + moveDistance;
    // 左右搖擺
    this.currentMovingTween = [
      this.gameScene.tweens.add({
        targets: this,
        ease: Phaser.Math.Easing.Linear,
        duration: 1000 / this.waveData.enemySpeed,
        x: '+=100',
        paused: false,
        yoyo: true,
        repeat: -1,
      }),
      // 下移
      this.gameScene.tweens.add({
        targets: this,
        ease: Phaser.Math.Easing.Linear,
        duration: moveDistance / moveSpeed,
        y: exitPositionY,
        paused: false,
        onComplete: () => {
          this.fsm.triggerEvent(SpaceInvadersEnemyEventId.Exit);
        },
      }),
    ];
  }

  /** 離開場外 */
  public onExitEnter(): void {
    this.destroy();
  }
  //#endregion

  /**
   * 檢查是否在畫面內
   * @returns
   */
  public isInScene(): boolean {
    return (
      this.y >= 0 && this.y <= this.scene.game.canvas.height && this.x >= 0 && this.x <= this.scene.game.canvas.width
    );
  }

  /** 設定移動tween速度scale */
  public setMovingTimeScale(timeScale: number): void {
    if (this._currentMovingTweens) {
      this._currentMovingTweens.forEach((tween) => {
        tween.timeScale = timeScale;
      });
    }
    // 更改動畫播放速度
    this.sprite.anims.msPerFrame = this.originAnimFrameDuration / timeScale;
  }

  /**
   * 受到攻擊
   * @param damage 傷害值
   * @param instantKill 是否即死攻擊
   * @returns 是否死亡
   */
  public onHit(damage: number, instantKill: boolean = false): boolean {
    // 判斷是否為即死攻擊
    if (instantKill) {
      this.hp = 0;
    } else {
      // 血量減少
      this.hp -= damage;
      this.hpBar.setValue(this.hp);
    }

    // 若血量大於0，表演受傷動畫
    if (this.hp > 0) {
      // 表演受傷動畫
      this.isHurtEffectVisible = true;
      this.hurtEffectHideTime = this.scene.time.now + this.hurtEffectShowTime;
      this.hurtEffect.setVisible(true);
      // 播放音效
      this.scene.sound.play(SpaceInvadersString.AudioEnemyHurt);

      return false;
    }
    // 若血量小於等於0，表演死亡動畫
    else {
      // 表演死亡動畫
      const explosion: SpaceInvadersAnimDestroy = this.groupManager.animDestroy.get();
      if (explosion) {
        explosion.setActive(true);
        explosion.setX(this.x);
        explosion.setY(this.y);
        explosion.play(AnimationType.DestroyExplode);
        explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          explosion.setActive(false);
        });
        // 播放音效
        this.scene.sound.play(SpaceInvadersString.AudioEnemyKilled);
      }
      this.destroy();
      return true;
    }
  }
}
