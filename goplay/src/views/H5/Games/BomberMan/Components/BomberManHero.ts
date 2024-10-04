import { BomberManNumber, BomberManItemFunction, BomberManString, BomberManDepth } from '../Data/BomberManConfig';
import { BomberManSettingData, HeroData } from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { BomberHeroBuff } from './BomberHeroBuff';
import BomberManGameScene from '../Scenes/BomberManGameScene';
import { BomberManAvatar, CharMoveState } from './BomberManAvatar';
import { BomberManHeroPathStrategy } from './Move/BomberManHeroPathStrategy';
import BomberManTilemap, { Vector2 } from './BomberManTilemap';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import { ParticleEmitterData } from '@/views/H5/Helper/PhaserHelper';
import SoundPool from '../../Common/SoundPool';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';

/** 防護罩效果類型 */
enum shieldEffectType {
  AntiBlast,
  Invincible,
}

/** 噴酒粒子特效類型 */
enum SprayFxType {
  ThroughWall,
  ThroughBomb,
}

/** 炸彈超人-玩家英雄(物理) */
export default class BomberManHero extends BomberManAvatar {
  //#region readonly
  /** 護盾位置 */
  private readonly shieldPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 護盾縮放 */
  private readonly shieldScale: number = 0.3;
  /** 護盾漸入漸出預計時間ms */
  private readonly shieldFadeEstimatedDuration: number = 300;

  /** 防護罩效果圖清單 */
  private readonly shieldEffectList: string[] = [BomberManString.AntiBlastEffect, BomberManString.InvincibleEffect];

  /** 噴酒粒子特效位置 */
  private readonly sprayFxEmitterPos: Vector2 = new Phaser.Math.Vector2(-10, 25);
  /** 噴酒粒子特效縮放 */
  private readonly sprayFxEmitterScale: Vector2 = new Phaser.Math.Vector2(0.5, 0.5);
  /** 噴酒粒子特效資料 */
  private readonly sprayFxEmitterDatas: ParticleEmitterData[] = [
    {
      imageKey: BomberManString.ImageParticleThroughBomb,
      name: BomberManString.ParticleEmitterSpray,
      jsonKey: BomberManString.ParticleEmitterConfigs,
    },
    {
      imageKey: BomberManString.ImageParticleThroughWall,
      name: BomberManString.ParticleEmitterSpray,
      jsonKey: BomberManString.ParticleEmitterConfigs,
    },
  ];
  //#endregion readonly

  //#region data
  /** 移動速度 */
  public get speed(): number {
    return this.getHeroItemLv(BomberManItemFunction.MoveSpeed);
  }

  /** 取得碰撞區大小 */
  public get boundingBoxSize(): number {
    return BomberManNumber.heroColliderSize;
  }
  /** 深度 */
  public get avatarDepth(): number {
    return BomberManDepth.hero;
  }
  /** 縮放 */
  public get avatarScale(): number {
    return BomberManNumber.heroSpriteShowScale;
  }
  /** 圖片偏移 */
  public get avatarSpriteOffset(): Vector2 {
    return new Phaser.Math.Vector2(0, BomberManNumber.heroSpriteOffsetY);
  }

  /** 記錄已接受傷害，再定時清除，以達成一定時間間隔造成傷害
   * 來自: 爆風/敵人
   */
  private _isDamaged: boolean = false;
  public get isDamaged(): boolean {
    return this._isDamaged;
  }

  /** 英雄道具能力清單 */
  private heroBuffMap: Map<BomberManItemFunction, BomberHeroBuff> = new Map<BomberManItemFunction, BomberHeroBuff>();

  /** 英雄道具等級清單 */
  private heroItemLvMap: Map<BomberManItemFunction, number> = new Map<BomberManItemFunction, number>();

  // 使用道具效果
  /** 防護罩效果圖 */
  private shieldList: Phaser.GameObjects.Image[] = [];
  /** 噴酒粒子特效 */
  private sprayFxParticleEmitterList: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  // 音效物件池
  /** 使用道具音效物件池-穿越磚塊 */
  private throughWallSoundPool!: SoundPool;
  /** 使用道具音效物件池-穿越炸彈 */
  private throughBombSoundPool!: SoundPool;
  /** 使用道具音效物件池-爆風護盾 */
  private antiBlastSoundPool!: SoundPool;
  /** 使用道具音效物件池-無敵 */
  private invincibleSoundPool!: SoundPool;
  /** 英雄資料 */
  private heroData!: HeroData;
  //#endregion data

  /** 初始化英雄
   * @param gameSetting 遊戲設定
   * @param newTilemap 地圖
   */
  public initHero(heroData: HeroData, gameSetting: BomberManSettingData, newTilemap: BomberManTilemap): void {
    // 紀錄英雄資料
    this.heroData = heroData;
    // 初始化角色
    this.initAvatar(new BomberManHeroPathStrategy(newTilemap), newTilemap);
    // 初始道具lv
    this.plusHeroItemLv(BomberManItemFunction.Blast, gameSetting.heroBaseBlastLv);
    this.plusHeroItemLv(BomberManItemFunction.BombCount, gameSetting.heroBaseBombCountLv);
    this.plusHeroItemLv(BomberManItemFunction.MoveSpeed, gameSetting.heroBaseMoveSpeed);

    // 播idle動畫
    this.avatarSprite.play(AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Idle));

    // 設置特效
    this.setSprayFxCompnent();
    // 道具視覺效果
    this.setShield();
    // 初始化音效
    this.initSoundPool();
  }

  /** 角色移動狀態變換
   * @param moveState 移動狀態
   */
  public onCharMoveStateChange(moveState: CharMoveState): void {
    // 面向右時，翻轉動畫 (上下移動時不處理)
    if (this.targetTileXY.x !== this.startTileXY.x) {
      this.setFlip(this.targetTileXY.x > this.startTileXY.x, false);
    }

    // 組合動作 = HeroWalkLeft 或 HeroIdle
    const animationKey = AnimationHelper.getCharacterAnimKey(
      this.heroData,
      moveState === CharMoveState.Walk ? CharacterAnimType.Walk : CharacterAnimType.Idle
    );

    // 若動作相同，就不播放
    if (this.avatarSprite.anims.currentAnim && animationKey === this.avatarSprite.anims.currentAnim.key) {
      return;
    }

    // 播動畫
    this.avatarSprite.anims.play(animationKey);
  }

  /** 當走下一格之前 */
  public onBeforeNextMove(): void {
    return;
  }

  /** 當沒有移動路徑
   * @param currentTileXY 目前座標
   */
  public onNoPath(currentTileXY: Vector2): void {
    BomberManGameScene.instance.mainDialog.showForbidMovePrompt();
  }

  /** 檢查英雄buff啟用中
   * @param itemFunction 物品功能類型
   */
  public hasHeroBuff(itemFunction: BomberManItemFunction): boolean {
    return this.heroBuffMap.get(itemFunction)?.isActive ?? false;
  }

  /** 啟用英雄buff
   * @param itemFunction 物品功能類型
   * @param durationSec 持續時間
   */
  public async addHeroBuff(itemFunction: BomberManItemFunction, durationSec: number): Promise<void> {
    let buff = this.heroBuffMap.get(itemFunction);
    // 未擁有，新增buff
    if (buff == null) {
      // 新增buff
      buff = new BomberHeroBuff(this.scene);
      // 存入map
      this.heroBuffMap.set(itemFunction, buff);
    }

    // 啟用buff，並記錄 使用道具時間
    await buff.enableBuff(durationSec);
  }

  /** 取得英雄道具等級
   * @param itemFunction 物品功能類型
   */
  public getHeroItemLv(itemFunction: BomberManItemFunction): number {
    return this.heroItemLvMap.get(itemFunction) ?? 0;
  }

  /** 增加英雄道具等級
   * @param itemFunction 物品功能類型
   * @param plus 增加等級
   */
  public plusHeroItemLv(itemFunction: BomberManItemFunction, plus: number): void {
    // 取出原有等級
    const originLv = this.getHeroItemLv(itemFunction);
    // 存入map
    this.heroItemLvMap.set(itemFunction, originLv + plus);
  }

  /** 記錄傷害，並在一段時間內阻擋傷害 */
  public async setBlockDamage(): Promise<void> {
    // 記錄受傷中
    this._isDamaged = true;

    // 定時清除flag-阻擋爆風傷害
    await AsyncHelper.sleep(BomberManNumber.damageIntervalSec);

    // 取消受傷中
    this._isDamaged = false;
  }

  /** 播放閃爍效果 */
  public async playFlickerTween(): Promise<void> {
    const stepSec = 0.1;
    const step = Math.floor(BomberManNumber.damageIntervalSec / stepSec);

    for (let index = 0; index < step; index++) {
      this.alpha = 0;
      await AsyncHelper.sleep(stepSec);
      this.alpha = 1;
      await AsyncHelper.sleep(stepSec);
    }
  }

  //#region effect
  /** 設置護盾 */
  private setShield(): void {
    this.shieldEffectList.forEach((imageKey: string) => {
      const shield = this.addImage(imageKey, this.shieldPosition.x, this.shieldPosition.y);
      shield.setScale(this.shieldScale);
      shield.setAlpha(0);
      // 護盾渲染在最上層
      this.bringToTop(shield);
      // 加入清單
      this.shieldList.push(shield);
    });
  }
  /** 播放防護罩效果
   * @param shieldType 防護罩效果類型
   * @param durationSec 持續時間
   */
  private async playShieldEffect(shieldType: shieldEffectType, durationSec: number): Promise<void> {
    // 取得效果
    if (shieldType < 0 || shieldType >= this.shieldList.length) {
      console.error(`shieldType=${shieldType} out of range`);
      return;
    }
    const shield = this.shieldList[shieldType];

    // 計算持續時間秒數ms
    const duration = durationSec * 1000;
    // 持續時間秒數是否充裕到可以淡入淡出
    const isDurationEnough = duration > this.shieldFadeEstimatedDuration * 2;
    // 時間充裕時表演淡入淡出(不充裕時淡入淡出秒數為0)
    const shieldFadeDuration = isDurationEnough ? this.shieldFadeEstimatedDuration : 0;

    // 創建tweenChain
    const shieldTweenChain = this.scene.tweens.chain({
      tweens: [
        // 防護罩展開動畫
        {
          targets: shield,
          duration: shieldFadeDuration,
          alpha: 1,
        },
        // 等到能力接近結束
        {
          targets: shield,
          // 減去淡入淡出時間
          duration: duration - shieldFadeDuration * 2,
          alpha: 1,
        },
        // 防護罩關閉動畫
        {
          targets: shield,
          duration: shieldFadeDuration,
          alpha: 0,
          onComplete: () => {
            shieldTweenChain.destroy();
          },
        },
      ],
    });
  }

  /** 播放無敵效果
   * @param durationSec 持續時間
   */
  public async playAntiBlastEffect(durationSec: number): Promise<void> {
    // 播音效
    this.antiBlastSoundPool.play();

    // 播放防護罩效果
    this.playShieldEffect(shieldEffectType.AntiBlast, durationSec);
  }
  /** 播放無敵效果
   * @param durationSec 持續時間
   */
  public async playInvincibleEffect(durationSec: number): Promise<void> {
    // 播音效
    this.invincibleSoundPool.play();

    // 播放防護罩效果
    this.playShieldEffect(shieldEffectType.Invincible, durationSec);
  }

  /** 設置噴酒粒子特效元件 */
  private setSprayFxCompnent(): void {
    this.sprayFxEmitterDatas.forEach((value: ParticleEmitterData) => {
      // 創建噴酒特效粒子
      const fxParticle = this.addParticleEmitter(value);
      // 特效偏移
      fxParticle.setPosition(this.sprayFxEmitterPos.x, this.sprayFxEmitterPos.y);
      // 縮放
      fxParticle.setScale(this.sprayFxEmitterScale.x, this.sprayFxEmitterScale.y);
      // 加入管理清單
      this.sprayFxParticleEmitterList.push(fxParticle);
    });
  }
  /** 播放噴酒粒子特效
   * @param durationSec 持續時間
   */
  private async playSparyEffect(sprayType: SprayFxType, durationSec: number): Promise<void> {
    // 取得特效
    if (sprayType < 0 || sprayType >= this.sprayFxParticleEmitterList.length) {
      console.error(`sprayType=${sprayType} out of range`);
      return;
    }
    const particleEmitter = this.sprayFxParticleEmitterList[sprayType];

    // 開啟特效
    particleEmitter.setVisible(true);
    // particleEmitter.emitters.each((emitter: Phaser.GameObjects.Particles.ParticleEmitter) => {
    //   emitter.setVisible(true);
    // });

    // 等到能力結束
    await AsyncHelper.sleep(durationSec);

    // 關閉特效
    // particleEmitter.emitters.each((emitter: Phaser.GameObjects.Particles.ParticleEmitter) => {
    //   emitter.setVisible(false);
    // });
    particleEmitter.setVisible(false);
  }

  /** 播放穿牆效果
   * @param durationSec 持續時間
   */
  public async playThroughWallEffect(durationSec: number): Promise<void> {
    // 播音效
    this.throughWallSoundPool.play();

    // 播放噴酒粒子特效
    this.playSparyEffect(SprayFxType.ThroughWall, durationSec);
  }
  /** 播放穿炸彈牆效果
   * @param durationSec 持續時間
   */
  public async playThroughBombEffect(durationSec: number): Promise<void> {
    // 播音效
    this.throughBombSoundPool.play();

    // 播放噴酒粒子特效
    this.playSparyEffect(SprayFxType.ThroughBomb, durationSec);
  }

  //#endregion effect

  /** 初始化音效 */
  private initSoundPool(): void {
    // 設置音效
    this.throughWallSoundPool = new SoundPool(this.scene, BomberManString.AudioThroughWall);
    if (this.throughWallSoundPool == null) {
      console.error('throughWallSoundPool == null');
      return;
    }

    this.throughBombSoundPool = new SoundPool(this.scene, BomberManString.AudioThroughBomb);
    if (this.throughBombSoundPool == null) {
      console.error('throughBombSoundPool == null');
      return;
    }

    this.antiBlastSoundPool = new SoundPool(this.scene, BomberManString.AudioAntiBlast);
    if (this.antiBlastSoundPool == null) {
      console.error('antiBlastSoundPool == null');
      return;
    }

    this.invincibleSoundPool = new SoundPool(this.scene, BomberManString.AudioInvincible);
    if (this.invincibleSoundPool == null) {
      console.error('invincibleSoundPool == null');
      return;
    }
  }
}
