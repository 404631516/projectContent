import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { ParticleEmitterData, ParticleEmitter } from '@/views/H5/Helper/PhaserHelper';
import { BrickBreakerEffectKey } from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { PopUpNumberTween } from '@/views/H5/Scripts/Components/UI/BasePopUpNumberTween';
import { BrickBreakerString } from '../../Data/BrickBreakerConfig';
import BrickBreakerGameScene from '../../Scenes/BrickBreakerGameScene';
import BrickBreakerBossPositionHint from './BrickBreakerBossPositionHint';
import BrickBreakerPopUpTween from './BrickBreakerPopUpTween';
import GridComponent from './GridComponent';

export default class BrickBreakerEffectLayer extends Object2D {
  /** 指定為BrickBreakerGameScene使用 */
  public declare scene: BrickBreakerGameScene;

  /** 魔王所在位置提示圖案 */
  private bossPosHint!: BrickBreakerBossPositionHint;

  /** 血量數字動畫 */
  protected popUpNumberTweenGroup: Phaser.GameObjects.Group;
  /** 提示文字動畫 */
  protected popUpStringTweenGroup: Phaser.GameObjects.Group;
  /** 特效圖片 */
  protected effectTweenSpriteGroup: Phaser.GameObjects.Group;

  //#region particle emitter相關設定
  /** 粒子特效(碎石) Particle emitter設定 */
  private readonly breakBrickParticleData: ParticleEmitterData = {
    imageKey: BrickBreakerString.ParticleBreakBrickImg,
    name: BrickBreakerString.ParticleEmitterBreakBrick,
    jsonKey: BrickBreakerString.ParticleEmitterConfigs,
  };
  /** 粒子特效(解凍) Particle emitter設定 */
  private readonly unfreezeParticleData: ParticleEmitterData = {
    imageKey: BrickBreakerString.ParticleUnfreezeImg,
    name: BrickBreakerString.ParticleEmitterUnfreeze,
    jsonKey: BrickBreakerString.ParticleEmitterConfigs,
  };

  /** 粒子特效 */
  private breakBrickParticleEmitter?: ParticleEmitter;
  /** 粒子特效 */
  private unfreezeParticleEmitter?: ParticleEmitter;
  //#endregion

  /** 磚塊生成動畫, 要掉下來的距離 */
  private readonly brickDropDistance = 40;

  constructor(scene: BrickBreakerGameScene) {
    super(scene);

    // 設置表演文字群組(數字)
    this.popUpNumberTweenGroup = this.scene.add.group({
      classType: PopUpNumberTween,
      maxSize: 10,
      createCallback: (popUpTween: Phaser.GameObjects.GameObject) => {
        // 生成的物件都加到container底下
        this.add(popUpTween);
      },
    });

    // 設置表演文字群組(文字提示)
    this.popUpStringTweenGroup = this.scene.add.group({
      classType: BrickBreakerPopUpTween,
      maxSize: 10,
      createCallback: (popUpTween: Phaser.GameObjects.GameObject) => {
        // 生成的物件都加到container底下
        this.add(popUpTween);
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

    // 創建粒子(碎石)
    this.breakBrickParticleEmitter = this.addParticleEmitter(this.breakBrickParticleData);
    // 創建粒子(解凍)
    this.unfreezeParticleEmitter = this.addParticleEmitter(this.unfreezeParticleData);
  }

  /** init
   * @param bossId 魔王id
   */
  public init(bossId: number): void {
    // 魔王所在位置提示圖案
    const bossComponent = this.scene.gridManager.getBossComponent();
    this.bossPosHint = new BrickBreakerBossPositionHint(this.scene, bossId, this.scene.mapViewCamera, bossComponent);
    this.scene.effectLayer.add(this.bossPosHint);
  }

  /** update */
  public update(): void {
    this.bossPosHint?.update();
  }

  /** 使此playerComponent播放特效
   * @param effectKey 特效Key
   * @param x 座標x
   * @param y 座標y
   * @returns 特效Tween
   */
  public async playEffectTween(
    effectKey: BrickBreakerEffectKey,
    x: number,
    y: number
  ): Promise<Phaser.Tweens.Tween | undefined> {
    // 從特效Sprite物件池中獲取Sprite
    const sprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    // 避免sprite在同一幀被重複抓取
    sprite.setActive(true);
    // 獲取特效資料
    const effectData = this.scene.effectDataMap.get(effectKey);
    if (effectData === undefined) {
      return undefined;
    }

    const customEffectData = Object.assign({}, effectData);
    // 修改特效位置
    customEffectData.fromX = x + customEffectData.fromX;
    customEffectData.toX = x + customEffectData.toX;
    // 修改特效位置
    customEffectData.fromY = y + customEffectData.fromY;
    customEffectData.toY = y + customEffectData.toY;
    // 依照給予的特效資料設置Tween
    return await AnimationHelper.setTweenFromEffectData(sprite, customEffectData, false);
  }

  /** 播放數字pop up
   * @param contentNumber 要顯示的數字
   * @param x 座標x
   * @param y 座標y
   */
  public playPopUpNumber(contentNumber: number, x: number, y: number): void {
    // 跳pop up數字
    const tweenText: PopUpNumberTween = this.popUpNumberTweenGroup.get(x, y);
    tweenText?.popUpNumber(contentNumber);
  }

  /** 播放文字pop up
   * @param content 要顯示的文字
   * @param x 座標x
   * @param y 座標y
   */
  public playPopUpString(content: string, x: number, y: number): void {
    // 跳pop up文字
    const tweenText: BrickBreakerPopUpTween = this.popUpStringTweenGroup.get(x, y);
    tweenText?.setDisplay(content);
    tweenText?.playTween();
  }

  /** 播放碎石特效
   * @param x 座標x
   * @param y 座標y
   */
  public async playBrickDestroyEffect(x: number, y: number): Promise<void> {
    this.breakBrickParticleEmitter?.explode(10, x, y);
  }

  /** 播放解凍特效
   * @param x 座標x
   * @param y 座標y
   */
  public async playUnfreezeEffect(x: number, y: number): Promise<void> {
    this.unfreezeParticleEmitter?.explode(10, x, y);
  }

  /** 播grid重新生成動畫, gridImage從上往下掉
   * @param gridImage 要下落的圖片
   * @param parent 動畫播放結束後, 圖片要指定回原本的parent底下
   */
  public playGridRegenerate(gridImage: Phaser.GameObjects.Image, parent: GridComponent): void {
    // 把render順序拉到最上層
    this.add(gridImage);
    // 設定起始位置
    gridImage.x = parent.x;
    gridImage.y = parent.y - this.brickDropDistance;
    // tween往下掉
    this.scene.add.tween({
      targets: gridImage,
      x: parent.x,
      y: parent.y,
      ease: Phaser.Math.Easing.Circular.In,
      duration: 500,
      onComplete: () => {
        // 加回parent底下
        parent.add(gridImage);
        gridImage.x = 0;
        gridImage.y = 0;
      },
    });
  }

  /** 將圖片或container加進Effect這層Layer, 設定座標
   * @param targetObject 目標物件
   * @param x 座標x
   * @param y 座標y
   */
  public addObjectToEffectLayer(
    targetObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | Phaser.GameObjects.Image,
    x: number,
    y: number
  ): void {
    this.add(targetObject);
    targetObject.x = x;
    targetObject.y = y;
  }
}
