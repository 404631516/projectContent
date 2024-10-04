import PhaserHelper, { Size } from '@/views/H5/Helper/PhaserHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import {
  VerticalParkourAnimation,
  VerticalParkourDepth,
  VerticalParkourString,
} from '../../Data/VerticalParkourConfig';
import VerticalParkourHeroFSM, { VerticalParkourHeroEventId } from '../Hero/VerticalParkourHeroFSM';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { JoystickDirectionMode, VirtualJoystick } from '@/views/H5/Scripts/Components/UserInput/VirtualJoystick';
import { CompassRad } from '@/views/H5/Helper/MathHelper';
import TimeHelper from '@/views/H5/Helper/TimeHelper';
import { HeroData } from '@/manager/TableManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';

export class VerticalParkourHero extends Object2D {
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** 鍵盤操控 */
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  /** 虛擬搖桿 */
  private virtualJoystick: VirtualJoystick;
  /** 狀態機 */
  private fsm: VerticalParkourHeroFSM = new VerticalParkourHeroFSM(this);
  /** 角色資料 */
  public heroData: HeroData;

  /** 滑板圖 */
  public skateboard: Phaser.GameObjects.Sprite;
  /** 角色圖 */
  public character: Phaser.GameObjects.Sprite;
  /** 角色速度 */
  public speed: number = 0;

  /** 受傷特效 */
  private hurtEffect: Phaser.GameObjects.Sprite;
  /** 解鎖特效 */
  private unlockEffect: Phaser.GameObjects.Sprite;
  /** 解鎖特效 */
  private unlockTreasure: Phaser.GameObjects.Sprite;
  /** 無敵特效 */
  private invincibleEffect!: Phaser.GameObjects.Sprite;
  /** 是否無敵 */
  public get isInvincible(): boolean {
    return this.invincibleEffect.visible;
  }
  /** 炸彈特效 */
  private bombEffect: Phaser.GameObjects.Sprite;
  /** 是否正在使用炸彈 */
  public get isBomb(): boolean {
    return this.bombEffect.anims.isPlaying;
  }

  /** 死亡動畫表演毫秒數 */
  private dieDurationMilliSecs: number = 1000;

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number, heroData: HeroData) {
    super(scene, x, y);
    this.heroData = heroData;
    // 開啟物理特性
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // 與邊界做碰撞
    this.body.setCollideWorldBounds(true);

    this.speed = speed;
    this.setDepth(VerticalParkourDepth.Hero);

    // 設置方向鍵操控
    this.cursorKeys = this.scene.input.keyboard!.createCursorKeys();
    // 設置虛擬搖桿
    const canvas = this.scene.game.canvas;
    this.virtualJoystick = new VirtualJoystick(
      this.scene,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width,
      canvas.height,
      JoystickDirectionMode.Eight,
      true,
    ).setDepth(VerticalParkourDepth.UI);

    // 設置滑板圖
    this.skateboard = this.addSprite(VerticalParkourString.Skateboard, 0, 0);
    this.skateboard.setOrigin(0.5);
    // 設置碰撞範圍
    this.body.setSize(this.skateboard.displayWidth, this.skateboard.displayHeight);
    this.body.setOffset(-this.skateboard.displayWidth / 2, -this.skateboard.displayHeight / 2);

    // 設置解鎖特效, 由於要顯示在角色下方, 所以要在角色之前設置
    this.unlockTreasure = this.addSprite(VerticalParkourString.Treasure, 0, -this.height / 2)
      .setScale(2)
      .setVisible(false);
    this.unlockEffect = this.addSprite(VerticalParkourString.Unlock, 0, -this.height / 2)
      .setScale(4)
      .setVisible(false);
    this.unlockEffect.anims.create({
      key: VerticalParkourAnimation.Unlock,
      frames: VerticalParkourString.Unlock,
      frameRate: 7,
      repeat: -1,
    });

    // 設置角色圖, 固定顯示Idle動畫的第一幀, 不必播放
    const characterSpriteKey = AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Idle);
    this.character = this.addSprite(characterSpriteKey, 0, -43);
    this.character.setOrigin(0.5);
    this.character.setScale(0.44);

    // 設置受傷特效
    this.hurtEffect = this.addSprite(VerticalParkourString.Hurt, 0, -this.character.displayHeight / 2 - 43).setVisible(
      false,
    );

    // 設置無敵特效
    this.invincibleEffect = this.addSprite(VerticalParkourString.Invincible, 0, -53).setVisible(true).setScale(4);
    this.invincibleEffect.anims.create({
      key: VerticalParkourAnimation.Invincible,
      frames: VerticalParkourString.Invincible,
      frameRate: 21,
      repeat: -1,
    });
    this.invincibleEffect.play(VerticalParkourAnimation.Invincible).setVisible(false);
    // 設置炸彈特效
    this.bombEffect = this.addSprite(VerticalParkourString.Bomb, 0, 0);
    this.bombEffect.anims.create({
      key: VerticalParkourAnimation.Bomb,
      frames: VerticalParkourString.Bomb,
      frameRate: 24,
      hideOnComplete: true,
      showOnStart: true,
    });
  }

  public update(time: number, delta: number): void {
    this.fsm.updateState(time, delta);
  }

  /** 受傷特效 */
  public playHurtEffect(): void {
    this.hurtEffect.setVisible(true);
    this.scene.time.delayedCall(1500, () => {
      this.hurtEffect.setVisible(false);
    });
  }

  /**
   * 無敵特效
   * @param duration 持續時間
   */
  public playInvincibleEffect(duration: number): void {
    this.invincibleEffect.setVisible(true);
    this.scene.time.delayedCall(duration * TimeHelper.millisecondPerSecond, () => {
      this.invincibleEffect.setVisible(false);
    });
  }

  /** 炸彈特效 */
  public async playBombEffect(diameter: number): Promise<void> {
    this.bombEffect.setDisplaySize(diameter, diameter);
    this.bombEffect.play(VerticalParkourAnimation.Bomb);
    await AsyncHelper.pendingUntil(() => this.bombEffect.anims.getProgress() >= 0.5);
  }

  /** 進入移動狀態 */
  public move(): void {
    this.fsm.triggerEvent(VerticalParkourHeroEventId.Move);
  }

  /** 進入解鎖狀態  */
  public async unlock(duration: number): Promise<void> {
    this.fsm.triggerEvent(VerticalParkourHeroEventId.Unlock);
    this.scene.time.delayedCall(duration * TimeHelper.millisecondPerSecond, () => {
      this.fsm.triggerEvent(VerticalParkourHeroEventId.Move);
    });
    await AsyncHelper.pendingUntil(() => this.fsm.isMoveState());
  }

  /** 進入死亡狀態 */
  public async die(): Promise<void> {
    this.fsm.triggerEvent(VerticalParkourHeroEventId.Die);
    await AsyncHelper.sleep(this.dieDurationMilliSecs / 1000);
  }

  /** 偵測英雄移動 */
  public onMoveUpdate(): void {
    // 預設停止
    this.body.setVelocity(0);

    // 取得方向鍵輸入
    const cursorKeyDirection = PhaserHelper.getCursorKeyDirectionRad(this.cursorKeys);
    if (cursorKeyDirection !== CompassRad.None) {
      this.body.velocity = this.scene.physics.velocityFromRotation(cursorKeyDirection, this.speed);
      return;
    }

    // 取得虛擬搖桿輸入
    const joystickDirection = this.virtualJoystick.getDirection();
    if (joystickDirection !== CompassRad.None) {
      this.body.velocity = this.scene.physics.velocityFromRotation(joystickDirection, this.speed);
      return;
    }
  }

  /** 解鎖開始 */
  public onUnlockEnter(): void {
    // 顯示解鎖特效
    this.unlockEffect.setVisible(true);
    this.unlockEffect.play(VerticalParkourAnimation.Unlock);
    this.unlockTreasure.setVisible(true);
    // 停在原地
    this.body.setVelocity(0, 0);
  }

  /** 解鎖完成 */
  public onUnlockLeave(): void {
    // 隱藏特效
    this.unlockEffect.setVisible(false);
    this.unlockTreasure.setVisible(false);
  }

  /** 進入死亡狀態 */
  public async onDieEnter(): Promise<void> {
    // tween, skateboard向左上飛出
    this.scene.tweens.add({
      targets: this.skateboard,
      x: this.skateboard.x - 20,
      y: this.skateboard.y - 20,
      duration: this.dieDurationMilliSecs,
      ease: 'Power2',
    });

    // tween, skateboard逆時針旋轉
    this.scene.tweens.add({
      targets: this.skateboard,
      angle: -420,
      duration: this.dieDurationMilliSecs,
      ease: 'Power2',
    });

    // tween, character向右上飛出
    this.scene.tweens.add({
      targets: this.character,
      x: this.character.x + 20,
      y: this.character.y - 20,
      duration: this.dieDurationMilliSecs,
      ease: 'Power2',
    });

    // tween, character順時針旋轉
    this.scene.tweens.add({
      targets: this.character,
      angle: 60,
      duration: this.dieDurationMilliSecs,
      ease: 'Power2',
    });

    await AsyncHelper.sleep(this.dieDurationMilliSecs / 1000);
  }
}
