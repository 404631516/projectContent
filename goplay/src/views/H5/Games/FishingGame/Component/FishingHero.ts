import { Scene } from 'phaser';
import { FishingSettingData, FishingItemData, HeroData } from '@/manager/TableManager';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { FishingString, FishingDepth } from '../Data/FishingConfig';
import FishingheroFSM, { FishingHeroEventId, FishingHeroStateId } from './FishingHeroFSM';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import SoundPool from '../../Common/SoundPool';
import FishingItem from './FishingItem';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';

// Hero prefab
export default class FishingHero extends Object2D {
  //#region readonly
  /** 尺寸 */
  private readonly size: Size = { width: 128, height: 160 };
  /** 英雄比例大小 */
  private readonly heroScale = 0.4;
  /** 英雄位置 */
  private readonly heroPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(8, 27);
  /** 漁船位置 */
  private readonly boatPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 漁船縮放 */
  private readonly boatScale: number = 1.5;
  /** 釣魚線位置 */
  private readonly fishingLinePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(70, -40);
  /** 釣魚網位置 */
  private readonly fishingNetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 釣魚網比例區間 */
  private readonly minfishingNetScale: number = 0.2;
  /** 加速特效位置 */
  private readonly speedUpFxPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-115, 30);
  /** 加速特效縮放 */
  private readonly speedUpFxScale: number = 0.75;
  /** 身體強化特效位置 */
  private readonly invincibleFxPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(10, -25);
  /** 身體強化特效縮放 */
  private readonly invincibleFxScale: number = 0.75;
  /** 受傷特效位置 */
  private readonly hurtFxPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 受傷特效縮放 */
  private readonly hurtFxScale: number = 0.5;
  //#endregion

  //#region variable and property
  /** 英雄初始移動速度 */
  private originalHeroMoveSpeed: number;
  /** 釣魚線初始速度 */
  private originalFishingLineMoveSpeed: number;
  /** 釣魚網初始速度 */
  private originalFishingNetMoveSpeed: number;
  /** 英雄狀態機 */
  private heroFSM: FishingheroFSM;
  /** 漁船圖片 */
  private _fishBoat!: Phaser.Physics.Arcade.Image;
  /** 漁網圖片 */
  private _fishingNet!: Phaser.Physics.Arcade.Image;
  /** 漁網最大縮放比例 */
  private maxfishingNetScale: number = 1;
  /** 釣魚線 */
  private _fishingLine!: Phaser.Physics.Arcade.Image;
  /** 釣魚線Y軸比例 */
  private fishingLineScaleY: number = 0;
  /** 釣魚網比例 */
  private fishingNetScale: number = 0;
  /** 表演受傷的特效 */
  private hurtFx!: Phaser.GameObjects.Sprite;
  /** 表演加速的特效 */
  private speedUpFx!: Phaser.GameObjects.Sprite;
  /** 表演身體強化的特效 */
  private invincibleFx!: Phaser.GameObjects.Sprite;
  /** 英雄移動速度 */
  private heroMoveSpeed: number;
  /** 釣魚線速度 */
  private fishingLineMoveSpeed: number;
  /** 釣魚網速度 */
  private fishingNetMoveSpeed: number;
  /** 是否為無敵狀態 */
  private _isInvincible: boolean = false;

  /** 受傷音效 */
  private hurtSoundPool?: SoundPool;
  /** 發射魚鉤音效 */
  private castSoundPool?: SoundPool;
  /** 漁網音效 */
  private fishingNetSoundPool?: SoundPool;
  /** 身體強化音效 */
  private invisibleSoundPool?: SoundPool;
  /** 加速音效 */
  private speedUpSoundPool?: SoundPool;
  /** 鍵盤操控 */
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  /** 收竿事件 */
  public onPullUpLeaveEvent?: () => void;

  /** 玩家底部Y */
  public get heroBottomY(): number {
    return this.y + this.height / 2;
  }

  /** 釣魚鉤的位置Y */
  public get hookPositionY(): number {
    return this.y + (this._fishingLine.getBottomCenter().y ?? 0);
  }

  /** 釣魚鉤的位置X */
  public get hookPositionX(): number {
    return this.x + this._fishingLine.x * this.scaleX;
  }

  /** 釣魚線 */
  public get fishingLine(): Phaser.Physics.Arcade.Image {
    return this._fishingLine;
  }

  /** 漁網 */
  public get fishingNet(): Phaser.Physics.Arcade.Image {
    return this._fishingNet;
  }

  /** 漁網的位置Y */
  public get fishingNetPositionY(): number {
    return this.y + (this._fishingNet.getCenter().y ?? 0);
  }

  /** 漁網的位置X */
  public get fishingNetPositionX(): number {
    return this.x + this._fishingNet.x * this.scaleX;
  }

  /** 魚船 */
  public get fishBoat(): Phaser.Physics.Arcade.Image {
    return this._fishBoat;
  }

  /** 是否加速中 */
  public get isSpeedUp(): boolean {
    return this.heroMoveSpeed > this.originalHeroMoveSpeed;
  }

  /** 是否無敵中 */
  public get isInvincible(): boolean {
    return this._isInvincible;
  }

  /** 現在是否為移動狀態 */
  public get isMove(): boolean {
    return this.heroFSM.isCurrentState(FishingHeroStateId.Move);
  }

  /** 現在是否為發射魚竿狀態 */
  public get isCast(): boolean {
    return this.heroFSM.isCurrentState(FishingHeroStateId.Cast);
  }

  /** 現在是否為拉起魚竿狀態 */
  public get isPullUp(): boolean {
    return this.heroFSM.isCurrentState(FishingHeroStateId.PullUp);
  }

  /** 現在是否為發射魚網狀態 */
  public get isCastNet(): boolean {
    return this.heroFSM.isCurrentState(FishingHeroStateId.CastNet);
  }

  /** 現在是否為拉起魚網狀態 */
  public get isPullUpNet(): boolean {
    return this.heroFSM.isCurrentState(FishingHeroStateId.PullUpNet);
  }
  //#endregion

  constructor(scene: Scene, position: Phaser.Math.Vector2, heroData: HeroData, settingData: FishingSettingData) {
    super(scene, position.x, position.y);
    scene.add.existing(this);

    // 設定初始移動速度
    this.originalHeroMoveSpeed = settingData.heroMoveSpeed;
    this.heroMoveSpeed = this.originalHeroMoveSpeed;

    // 設定初始釣魚速度
    this.originalFishingLineMoveSpeed = settingData.fishingLineSpeed;
    this.originalFishingNetMoveSpeed = settingData.fishingNetSpeed;
    this.fishingLineMoveSpeed = this.originalFishingLineMoveSpeed;
    this.fishingNetMoveSpeed = this.originalFishingNetMoveSpeed;

    // 設定深度
    this.setDepth(FishingDepth.Hero);

    // 初始化
    this.setHero(heroData);
    this.setBoat(FishingString.Boat);
    this.setfishingLine(FishingString.String);
    this.setfishingNet(FishingString.FishingNet);
    this.setFxCompnent();

    this.width = this.size.width;
    this.height = this.size.height;
    scene.physics.add.existing(this);

    // 設置音效
    this.hurtSoundPool = new SoundPool(this.scene, FishingString.AudioHurt);
    this.castSoundPool = new SoundPool(this.scene, FishingString.AudioCast);
    this.fishingNetSoundPool = new SoundPool(this.scene, FishingString.AudioFishingNet);
    this.invisibleSoundPool = new SoundPool(this.scene, FishingString.AudioInvisible);
    this.speedUpSoundPool = new SoundPool(this.scene, FishingString.AudioSpeedUp);

    // 啟動狀態機
    this.heroFSM = new FishingheroFSM(this);
    this.heroFSM.start();

    // 啟動方向鍵輸入偵測
    this.cursorKeys = this.scene.input.keyboard!.createCursorKeys();
  }

  /** 更新英雄狀態 */
  public update(delta: number): void {
    this.heroFSM.update(delta);
  }

  //#region 操控
  /** 英雄移動 */
  public move(): void {
    this.heroFSM.stateMachine.triggerEvent(FishingHeroEventId.Move);
  }
  /** 英雄發射魚鉤 */
  public cast(): void {
    this.heroFSM.stateMachine.triggerEvent(FishingHeroEventId.Cast);
  }
  /** 英雄發射魚網 */
  public castNet(item: FishingItem): void {
    this.maxfishingNetScale = item.itemData.multiply;
    this.heroFSM.stateMachine.triggerEvent(FishingHeroEventId.CastNet);
  }
  /** 英雄拉起魚鉤 */
  public pullUp(): void {
    this.heroFSM.stateMachine.triggerEvent(FishingHeroEventId.PullUp);
  }
  /** 英雄死亡 */
  public dead(): void {
    this.heroFSM.stateMachine.triggerEvent(FishingHeroEventId.Dead);
  }

  /** 開啟加速模式 */
  public async onSpeedUp(itemData: FishingItemData): Promise<void> {
    // 播放音效
    this.speedUpSoundPool?.play();
    // 播放特效
    this.speedUpFx?.setVisible(true);

    // 2倍數
    this.heroMoveSpeed = this.originalHeroMoveSpeed * itemData.multiply;
    this.fishingLineMoveSpeed = this.originalFishingLineMoveSpeed * itemData.multiply;
    this.fishingNetMoveSpeed = this.originalFishingNetMoveSpeed * itemData.multiply;

    // 道具持續時間
    const timeEvent = this.scene.time.addEvent({
      delay: itemData.duration * 1000,
      callback: () => {
        this.heroMoveSpeed = this.originalHeroMoveSpeed;
        this.fishingLineMoveSpeed = this.originalFishingLineMoveSpeed;
        this.fishingNetMoveSpeed = this.originalFishingNetMoveSpeed;

        this.scene.time.removeEvent(timeEvent);
      },
    });

    // 等待事件完成
    await AsyncHelper.pendingUntil(() => this.heroMoveSpeed === this.originalHeroMoveSpeed);

    // 關閉特效
    this.speedUpFx?.setVisible(false);
  }

  /** 開啟無敵模式
   * @param itemData 無敵道具資料
   */
  public async onInvincible(itemData: FishingItemData): Promise<void> {
    // 播放音效
    this.invisibleSoundPool?.play();
    // 播放特效
    this.invincibleFx.setVisible(true).play(FishingString.AnimInvincible);
    // 標記無敵
    this._isInvincible = true;

    // 道具持續時間
    const timeEvent = this.scene.time.addEvent({
      delay: itemData.duration * 1000,
      callback: () => {
        // 關閉特效
        this.invincibleFx.setVisible(false);
        this._isInvincible = false;
        this.scene.time.removeEvent(timeEvent);
      },
    });

    // 等待道具持續結束，且防護罩完全關閉
    await AsyncHelper.pendingUntil(() => this._isInvincible === false);
  }

  /** 表演受傷特效觸發特效 */
  public onHurt(): void {
    // 播放音效
    this.hurtSoundPool?.play();
    // 播放受傷特效
    this.hurtFx?.play(FishingString.AnimHurt);
  }
  //#endregion

  //#region 狀態機
  /** 偵測玩家是否控制移動 */
  public onMoveUpdate(delta: number): void {
    // 假如按下鍵盤下
    if (this.cursorKeys.down.isDown) {
      // 發射魚鉤
      this.cast();
      return;
    }

    // 假如按下鍵盤左
    if (this.cursorKeys.left.isDown && this.x + (this._fishBoat.getLeftCenter().x ?? 0) > 0) {
      // 向左移動
      this.x -= this.heroMoveSpeed * (delta / 1000);
      this.setFlip(true, false);
      return;
    }

    // 假如按下鍵盤右
    if (
      this.cursorKeys.right.isDown &&
      this.x + (this._fishBoat.getRightCenter().x ?? 0) < this.scene.game.canvas.width
    ) {
      // 向右移動
      this.x += this.heroMoveSpeed * (delta / 1000);
      this.setFlip(false, false);
      return;
    }

    // 假如按下滑鼠
    if (
      this.scene.input.activePointer.isDown &&
      this.scene.input.activePointer.y < this.y + (this.fishBoat.getBottomCenter().y ?? 0)
    ) {
      // 鼠標高於玩家角色且位於玩家角色左、右側一定距離時移動
      if (this.scene.input.activePointer.x > this.x + (this._fishBoat.getRightCenter().x ?? 0)) {
        this.x += this.heroMoveSpeed * (delta / 1000);
        this.setFlip(false, false);
      } else if (this.scene.input.activePointer.x < this.x + (this._fishBoat.getLeftCenter().x ?? 0)) {
        this.x -= this.heroMoveSpeed * (delta / 1000);
        this.setFlip(true, false);
      }
    }
  }

  /** 準備拋竿 */
  public onCastEnter(): void {
    // 播放音效
    this.castSoundPool?.play();

    this._fishingLine.visible = true;
    this.fishingLineScaleY = 0;
  }

  /** 拋竿 */
  public onCastUpdate(delta: number): boolean {
    this.fishingLineScaleY += this.fishingLineMoveSpeed * (delta / 1000);
    this._fishingLine.scaleY = this.fishingLineScaleY;

    return this.hookPositionY < this.scene.game.canvas.height;
  }

  /** 收竿 */
  public onPullUpUpdate(delta: number): boolean {
    if (this.fishingLineScaleY > 0.001) {
      this.fishingLineScaleY -= this.fishingLineMoveSpeed * (delta / 1000);
      this._fishingLine.scaleY = this.fishingLineScaleY;
      return true;
    } else {
      // 釣魚線回收到最短時，關閉釣魚線顯示，並使釣出海面的魚往上飛
      this.fishingLineScaleY = 0;
      this._fishingLine.scaleY = this.fishingLineScaleY;
      this._fishingLine.visible = false;
      return false;
    }
  }

  /** 收竿完觸發事件 */
  public onPullUpLeave(): void {
    this.onPullUpLeaveEvent?.();
  }

  /** 準備拋網 */
  public onCastNetEnter(): void {
    // 撥放魚網音效
    this.fishingNetSoundPool?.play();

    this.fishingNetScale = this.minfishingNetScale;
  }

  /** 拋網 */
  public onCastNetUpdate(delta: number): boolean {
    this.fishingNetScale += this.fishingNetMoveSpeed * (delta / 1000);
    this._fishingNet.scale = this.fishingNetScale;

    return this.fishingNetScale < this.maxfishingNetScale;
  }

  /** 收網 */
  public onPullUpNetUpdate(delta: number): boolean {
    if (this.fishingNetScale > this.minfishingNetScale) {
      this.fishingNetScale -= this.fishingNetMoveSpeed * (delta / 1000);
      this._fishingNet.scale = this.fishingNetScale;
      return true;
    } else {
      // 釣魚網回收到最短時，使釣出海面的魚往上飛
      this.fishingNetScale = this.minfishingNetScale;
      this._fishingNet.scale = this.fishingNetScale;
      return false;
    }
  }
  //#endregion

  //#region 初始化
  /** 設置英雄
   * @param heroData 英雄資料
   */
  private setHero(heroData: HeroData): void {
    const hero = this.addSprite(
      AnimationHelper.getCharacterAnimKey(heroData, CharacterAnimType.Idle),
      this.heroPosition.x,
      this.heroPosition.y
    );
    hero.anims.play(AnimationHelper.getCharacterAnimKey(heroData, CharacterAnimType.Idle));

    hero.setOrigin(0.5, 1);
    hero.flipX = true;
    hero.setScale(this.heroScale);
  }

  /** 設置漁船
   * @param key 漁船Key
   */
  private setBoat(key: string): void {
    this._fishBoat = this.addPhysicsImage(key, this.boatPosition.x, this.boatPosition.y);
    this._fishBoat.setScale(this.boatScale);
  }

  /** 設置釣魚線
   * @param key 釣魚線Key
   */
  private setfishingLine(key: string): void {
    this._fishingLine = this.addPhysicsImage(key, this.fishingLinePosition.x, this.fishingLinePosition.y, false);

    this._fishingLine.setFlipY(true);
    this._fishingLine.setOrigin(0.5, 0);
    this._fishingLine.setVisible(false);
    this._fishingLine.setScale(1, 0);
  }

  /** 設置釣魚網
   * @param key 釣魚網Key
   */
  private setfishingNet(key: string): void {
    this._fishingNet = this.addPhysicsImage(key, this.fishingNetPosition.x, this.fishingNetPosition.y);
    this._fishingNet.setOrigin(0.5, 0);
    this._fishingNet.setScale(this.minfishingNetScale);
    // 移到容器最底層
    this.moveTo(this._fishingNet, 0);
  }

  /** 設置特效元件 */
  private setFxCompnent(): void {
    // 創建加速特效
    this.speedUpFx = this.addSprite(FishingString.SpeedUpFx, this.speedUpFxPosition.x, this.speedUpFxPosition.y);
    this.speedUpFx.setScale(this.speedUpFxScale).setFlipX(true);
    this.speedUpFx.setVisible(false).play(FishingString.AnimSpeedUp);

    // 創建身體強化特效
    this.invincibleFx = this.addSprite(
      FishingString.InvincibleFx,
      this.invincibleFxPosition.x,
      this.invincibleFxPosition.y
    );
    this.invincibleFx.setScale(this.invincibleFxScale).setFlipX(true);
    this.invincibleFx.setVisible(false);

    // 創建受傷特效
    this.hurtFx = this.addSprite(FishingString.BoomFX, this.hurtFxPosition.x, this.hurtFxPosition.y);
    this.hurtFx.setScale(this.hurtFxScale);
  }
  //#endregion
}
