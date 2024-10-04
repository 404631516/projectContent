import { Scene } from 'phaser';
import ParkourHeroFSM, { ParkourHeroEventID, ParkourHeroStateID } from './ParkourHeroFSM';
import PhaserHelper, { ParticleEmitterData, Size } from '@/views/H5/Helper/PhaserHelper';
import { ParkourDepth, ParkourNumber, ParkourString } from '../Data/ParkourConfig';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { ParkourSettingData, ParkourItemData, HeroData } from '@/manager/TableManager';
import SoundPool from '../../Common/SoundPool';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';

// Hero prefab
export default class ParkourHero extends Object2D {
  //#region variable and property
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** 英雄尺寸 */
  private readonly heroSize: Size = { width: 64, height: 96 };
  /** 預設英雄倍數大小 */
  private readonly originalScale: number = 1;
  /** 預設英雄圖示大小 */
  private readonly heroSpriteScale: number = 0.5;
  /** 英雄飛行位置X */
  private readonly heroFlyY = 115;
  /** 英雄飛行位置Y */
  private readonly heroFlyX = 300;
  /** 英雄起飛動畫時間 */
  private readonly heroFlyTakeOffDuration = 1000;
  /** 英雄巨大化變身預計時間ms */
  private readonly giantTweenEstimatedDuration = 300;
  /** 受傷特效位置 */
  private readonly hurtFxPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 受傷特效縮放 */
  private readonly hurtFxScale: number = 2.5;

  /** 飛行粒子特效資料 */
  private readonly flyFxEmitterDatas: ParticleEmitterData[] = [
    {
      imageKey: ParkourString.ImageParticlesRed,
      name: ParkourString.ParticleEmitterFly,
      jsonKey: ParkourString.ParticleEmitterConfigs,
    },
    {
      imageKey: ParkourString.ImageParticlesYellow,
      name: ParkourString.ParticleEmitterFly,
      jsonKey: ParkourString.ParticleEmitterConfigs,
    },
  ];
  /** 玩家加速粒子特效資料 */
  private readonly speedUpHeroFxEmitterData: ParticleEmitterData = {
    imageKey: ParkourString.ImageParticlesBlue,
    name: ParkourString.ParticleEmitterSpeedUp,
    jsonKey: ParkourString.ParticleEmitterConfigs,
  };

  /** Hero狀態機 */
  private heroFSM: ParkourHeroFSM;

  /** HeroSprite */
  private heroSprite: Phaser.GameObjects.Sprite;

  /** 跳躍力道 */
  private jumpForce: number;

  /** 飛行持續時間 */
  public flyduration: Readonly<number> = 0;

  /** 暫存遊戲參數 */
  private settingData: ParkourSettingData;
  /** 暫存英雄資料參數 */
  private heroData: HeroData;

  /** 起飛動畫 */
  private flyTakeOffTween!: Phaser.Tweens.Tween;
  /** 飛行的特效 */
  private flyFxParticleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  /** 加速的特效 */
  private speedUpFxParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  /** 受傷的特效 */
  private hurtFx!: Phaser.GameObjects.Sprite;
  /** 巨大化TweenChain */
  private giantTweenChain?: Phaser.Tweens.TweenChain;

  /** 跳躍音效 */
  private jumpSoundPool?: SoundPool;
  /** 受傷音效 */
  private hurtSoundPool?: SoundPool;
  /** 飛行音效 */
  private flySoundPool?: SoundPool;
  /** 巨大音效 */
  private giantSoundPool?: SoundPool;
  /** 加速音效 */
  private speedUpSoundPool?: SoundPool;

  /** 加速倍數 */
  // private _speedMultiplier: ParkourNumber = 1;
  private _speedMultiplier: number = 1;

  public get speedMultiplier(): number {
    return this._speedMultiplier;
  }

  /** 當前移動速度 (如果使用加速道具，速度有倍數加成) */
  // private _movingSpeed: ParkourNumber = 0;
  private _movingSpeed: number = 0;
  public get movingSpeed(): number {
    // -1是因為速度要反向用來捲動地圖
    return this._movingSpeed * this._speedMultiplier * -1;
  }

  /** 現在是否為巨大化狀態 */
  public get isGiant(): boolean {
    return this.scale > this.originalScale;
  }

  /** 現在是否為飛行狀態 */
  public get isFly(): boolean {
    return this.heroFSM.isCurrentState(ParkourHeroStateID.Fly);
  }

  /** 現在是否為重生狀態 */
  public get isRespawn(): boolean {
    return this.heroFSM.isCurrentState(ParkourHeroStateID.Respawn);
  }

  /** 現在是否為加速狀態 */
  public get isSpeedUp(): boolean {
    return this._speedMultiplier > 1;
  }
  //#endregion

  constructor(scene: Scene, position: Phaser.Math.Vector2, settingData: ParkourSettingData, heroData: HeroData) {
    super(scene, position.x, position.y);
    scene.physics.add.existing(this);

    this.settingData = settingData;
    // 設定跳躍力道
    this.jumpForce = this.settingData.heroJumpForce;
    this._movingSpeed = this.settingData.heroRunSpeed;

    // 身體尺寸
    this.setSize(this.heroSize.width, this.heroSize.height);
    // 碰撞尺寸依身高比例縮減
    this.body.setSize(this.width, this.height * heroData.heightScale);
    // 碰撞區塊切齊腳底
    this.body.setOffset(0, this.height - this.body.height);
    this.body.setGravity(0, PhaserHelper.gravity);
    // 暫存英雄資料
    this.heroData = heroData;
    // 加入英雄動畫圖
    this.heroSprite = this.addSprite(heroData.nameKey, 0, 0);
    this.heroSprite.setScale(this.heroSpriteScale);
    // 面向右邊
    this.heroSprite.setFlip(true, false);

    // 永遠顯示在最前
    this.setDepth(ParkourDepth.Hero);

    // 設置特效
    this.setFlyFxCompnent();
    this.setSpeedUpFxCompnent();
    this.setHurtFxCompnent();

    // 設置音效
    this.jumpSoundPool = new SoundPool(this.scene, ParkourString.AudioJump);
    this.hurtSoundPool = new SoundPool(this.scene, ParkourString.AudioHurt);
    this.flySoundPool = new SoundPool(this.scene, ParkourString.AudioFly);
    this.giantSoundPool = new SoundPool(this.scene, ParkourString.AudioGiant);
    this.speedUpSoundPool = new SoundPool(this.scene, ParkourString.AudioSpeedUp);

    // 啟動狀態機
    this.heroFSM = new ParkourHeroFSM(this);
    this.heroFSM.start();
  }

  /** 更新英雄狀態 */
  public update(delta: number): void {
    this.heroFSM.update(delta);
  }

  //#region 操控
  /** 跑步 */
  public run(): void {
    this.heroFSM.stateMachine.triggerEvent(ParkourHeroEventID.Run);
  }

  /** 跳躍 */
  public jump(): void {
    this.heroFSM.stateMachine.triggerEvent(ParkourHeroEventID.Jump);
  }

  /** 飛行 */
  public fly(itemData: ParkourItemData): void {
    this.flyduration = itemData.duration;
    this.heroFSM.stateMachine.triggerEvent(ParkourHeroEventID.Fly);
  }

  /** 英雄重生 */
  public respawn(): void {
    this.heroFSM.stateMachine.triggerEvent(ParkourHeroEventID.Respawn);
  }

  /** 英雄死亡 */
  public dead(): void {
    this.heroFSM.stateMachine.triggerEvent(ParkourHeroEventID.Dead);
  }

  /** 若要做物理碰撞偵測，一定要有一方擁有加速度，否則碰撞不會發生 */
  public setCollisionVelocity(): void {
    // 為了與地圖做碰撞所需的加速度
    this.body.setVelocityX(0.01);

    // 校正玩家在螢幕中位置
    if (this.x < 300) {
      this.body.setVelocityX(50);
    }
  }

  /** 巨大化 */
  public async onGiant(itemData: ParkourItemData): Promise<void> {
    // 播放音效
    this.giantSoundPool?.play();

    // 計算持續時間秒數ms
    const duration = itemData.duration * 1000;
    // 持續時間秒數是否充裕到可以淡入淡出
    const isDurationEnough = duration > this.giantTweenEstimatedDuration * 2;
    // 時間充裕時表演淡入淡出(不充裕時淡入淡出秒數為0)
    const giantTweenDuration = isDurationEnough ? this.giantTweenEstimatedDuration : 0;

    // 把先前的giantTweenChain先刪除
    this.giantTweenChain?.destroy();

    // 創建TweenChain
    this.giantTweenChain = this.scene.tweens.chain({
      tweens: [
        // 播放巨大化動畫
        {
          targets: this,
          scale: this.originalScale * itemData.multiply,
          y: this.y - this.height / 2,
          duration: giantTweenDuration,
        },
        // 維持一段時間
        {
          targets: this,
          scale: this.originalScale * itemData.multiply,
          duration: duration - giantTweenDuration * 2,
        },
        // 播放縮小動畫
        {
          targets: this,
          scale: this.originalScale,
          duration: giantTweenDuration,
        },
      ],
    });
    await AsyncHelper.pendingUntil(() => (this.giantTweenChain ? this.giantTweenChain.isFinished() : true));
  }

  /** 進入加速狀態 */
  public async onSpeedUp(itemData: ParkourItemData): Promise<void> {
    // 播放音效
    this.speedUpSoundPool?.play();

    // 開啟加速特效
    this.speedUpFxParticleEmitter.setVisible(true);

    // 開啟加速加成
    this._speedMultiplier = itemData.multiply;

    // 延遲發動，結束狀態
    const timeEvent = this.scene.time.addEvent({
      delay: itemData.duration * 1000,
      callback: () => {
        // 關閉加速特效
        this.speedUpFxParticleEmitter.setVisible(false);

        // 關閉加速加成
        this._speedMultiplier = 1;

        this.scene.time.removeEvent(timeEvent);
      },
    });

    await AsyncHelper.pendingUntil(() => this.isSpeedUp === false);
  }

  /** 當英雄受傷 */
  public onHurt(): void {
    // 播放受傷音效
    this.hurtSoundPool?.play();
    // 播放受傷特效
    this.hurtFx?.play(ParkourString.AnimHurt);
  }
  //#endregion

  //#region 狀態機
  /** 準備時播放動畫並設置速度為0 */
  public onReadyEnter(): void {
    this.heroSprite.anims.play(AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Idle));
    this._movingSpeed = 0;
  }

  /** 開始跑步時播放動畫並設置為跑步速度 */
  public onRunEnter(): void {
    this.heroSprite.anims.play(AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Run));
    this._movingSpeed = this.settingData.heroRunSpeed;
  }

  /** 開始跳躍時提供向上作用力並播放動畫 */
  public onJumpEnter(): void {
    // 播跳躍音效
    this.jumpSoundPool?.play();
    // 執行跳躍動作
    this.body.setVelocityY(-this.jumpForce);
    this.heroSprite.anims.play(AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Jump));
    this._movingSpeed = this.settingData.heroRunSpeed;
  }

  /** 開始飛行時 */
  public onFlyEnter(): void {
    // 播放飛行音效
    this.flySoundPool?.play();

    // 開啟飛行特效
    for (const particle of this.flyFxParticleEmitters) {
      particle.setVisible(true);
    }

    // 設置0重力
    this.body.setVelocity(0, 0);
    this.body.setGravityY(0);

    // 速度調整為飛行速度
    this.heroSprite.anims.play(ParkourString.AnimHeroFly);
    this._movingSpeed = this.settingData.heroFlySpeed;

    // 播放起飛動畫
    this.flyTakeOffTween = this.scene.tweens.add({
      targets: this,
      y: this.heroFlyY,
      x: this.heroFlyX,
      duration: this.heroFlyTakeOffDuration,
    });
  }

  /** 結束飛行時 */
  public onFlyLeave(): void {
    // 添加重力
    this.body.setGravityY(PhaserHelper.gravity);

    // 關閉飛行特效
    for (const particle of this.flyFxParticleEmitters) {
      particle.setVisible(false);
    }

    // 清除起飛動畫
    this.scene.tweens.remove(this.flyTakeOffTween);
  }

  /** 英雄重生時緩速 */
  public async onRespawnEnter(): Promise<void> {
    // 畫面左上角
    this.heroSprite.play(ParkourString.AnimHeroFly);
    // 速度降低
    this._movingSpeed = this.settingData.heroRespawnSpeed;
  }

  /** 英雄在重生狀態時，會慢慢回升跑步速度 */
  public onRespawnUpdate(delta: number): void {
    if (this._movingSpeed === this.settingData.heroRunSpeed) {
      return;
    }

    // 慢慢回復到跑步速度
    if (this._movingSpeed < this.settingData.heroRunSpeed) {
      this._movingSpeed += this.settingData.heroRespawnRecoverySpeed * (delta / 1000);
    } else {
      this._movingSpeed = this.settingData.heroRunSpeed;
    }
  }

  /** 英雄死亡時 */
  public onDeadEnter(): void {
    this._movingSpeed = 0;
    this.setVisible(false);
  }
  //#endregion

  //#region 初始化
  /** 設置飛行道具特效元件 */
  private setFlyFxCompnent(): void {
    this.flyFxEmitterDatas.forEach((value: ParticleEmitterData) => {
      // 創建飛行特效粒子
      const flyFxParticleEmitter = this.addParticleEmitter(value);
      // 英雄飛行特效跟隨英雄移動
      flyFxParticleEmitter.setPosition(0, this.body.offset.y / 2);
      // 設置顯示深度
      this.moveBelow<Phaser.GameObjects.GameObject>(flyFxParticleEmitter, this.heroSprite);
      // 加入管理清單
      this.flyFxParticleEmitters.push(flyFxParticleEmitter);
    });
  }

  /** 設置加速道具特效元件 */
  private setSpeedUpFxCompnent(): void {
    // 創建英雄加速特效粒子
    this.speedUpFxParticleEmitter = this.addParticleEmitter(this.speedUpHeroFxEmitterData);
    // 英雄加速特效跟隨英雄移動
    this.speedUpFxParticleEmitter.setPosition(-this.width / 2, this.body.offset.y / 2);
    // 設置顯示深度
    this.moveBelow<Phaser.GameObjects.GameObject>(this.speedUpFxParticleEmitter, this.heroSprite);
  }

  /** 設置受傷特效元件 */
  private setHurtFxCompnent(): void {
    // 創建受傷動圖
    this.hurtFx = this.addSprite(ParkourString.BoomFX, this.hurtFxPosition.x, this.hurtFxPosition.y);
    this.hurtFx.setVisible(false);
    this.hurtFx.setScale(this.hurtFxScale);
  }
  //#endregion
}
