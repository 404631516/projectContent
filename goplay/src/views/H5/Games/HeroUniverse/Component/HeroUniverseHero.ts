import { HeroData } from '@/manager/TableManager';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import HeroUniverseGameScene from '../Scenes/HeroUniverseGameScene';
import PhaserHelper, { Size } from '@/views/H5/Helper/PhaserHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import HeroUniverseHeroFSM, { HeroUniverseHeroEventId } from './HeroUniverseHeroFSM';
import { HeroUniverseString } from '../Data/HeroUniverseConfig';
import { CompassRad } from '@/views/H5/Helper/MathHelper';
import { HeroUniverseEvent } from './HeroUniverseTilemap';
import { WebGameName } from '@/helper/enum/WebGame';

/** 英雄 */
export class HeroUniverseHero extends Object2D {
  /** 因雄宇宙遊戲場景 */
  public declare scene: HeroUniverseGameScene;
  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** 預設人物Size */
  protected readonly size: Size = { width: 64, height: 96 };
  /** 因英雄與怪物的基準點有偏差，估需此參數調整offset */
  protected readonly characterOffsetY: number = 0;
  /** 角色左右轉的gap，超過才會左右轉，避免顫動 */
  private readonly characterRotateGap: number = 0.1;
  /** 角色圖縮放比例 */
  private readonly characterSpriteScale: number = 0.5;
  /** 飛船移動速度 */
  private readonly shipSpeed: number = 400;

  /** 英雄本身靜態資料 */
  private heroData!: HeroData;

  /** 角色圖，因避免角色跟著旋轉，因此額外控制 */
  private character: Phaser.GameObjects.Sprite;
  /** 飛船圖，跟著旋轉，朝向要移動的方向 */
  private ship: Phaser.GameObjects.Sprite;
  /** 面對的方向(用於移動) */
  public readonly forward: Object2D;
  /** 鍵盤操控 */
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  /** 狀態機 */
  public fsm: HeroUniverseHeroFSM = new HeroUniverseHeroFSM(this);

  /** 借用逆塔防移動速度 */
  private get speed(): number {
    return this.ship.visible ? this.shipSpeed : this.heroData.antiTDSpeed;
  }

  /** 滑鼠是否停留在英雄身上 */
  private get isPointerOnTop(): boolean {
    return this.getDistanceToPointer() < this.width / 4;
  }

  constructor(scene: HeroUniverseGameScene, x: number, y: number) {
    super(scene, x, y);
    // 初始化鍵盤
    this.cursorKeys = this.scene.input.keyboard!.createCursorKeys();

    // 初始化身體尺寸
    this.setSize(this.size.width, this.size.height);

    // 初始化面向物件
    this.forward = this.addObject(0, 0, Object2D);
    this.forward.angle = 0;

    // 初始化飛船圖片
    this.ship = this.addImage(HeroUniverseString.Ship, 0, 0);
    this.ship.setVisible(false);

    // 初始化角色圖
    this.character = this.addSprite('', 0, 0);
    this.character.setVisible(false);
  }

  public init(heroData: HeroData): void {
    // 暫存資料
    this.heroData = heroData;
    // 設置角色位置
    this.character.setPosition(0, this.characterOffsetY);
    // 設置動畫
    const animKey = AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Walk);
    this.character.setTexture(animKey);
    this.character.anims.play(animKey);

    // 設置角色比例
    this.character.setScale(this.characterSpriteScale);

    // 設置角色面向
    this.character.setFlipX(Math.abs(this.forward.angle) <= 90);

    // 設置碰撞區塊
    this.body.setSize(this.width, this.height * this.heroData.heightScale);
    // 依身高比例調整碰撞區塊，以腳底為基準
    this.body.offset = new Phaser.Math.Vector2(0, this.height - this.body.height);

    // 啟動
    this.setActive(true);
  }

  // 透過group的update來更新
  update(time: number, delta: number): void {
    this.fsm.updateState(time, delta);
  }

  //#region FSM
  /** 停止移動並暫停動畫 */
  public onIdleEnter(): void {
    this.body.setVelocity(0);
    this.character.anims.pause();
  }

  /** 當有輸入時切換到移動狀態 */
  public onIdleUpdate(): void {
    if (
      this.cursorKeys.left.isDown ||
      this.cursorKeys.up.isDown ||
      this.cursorKeys.right.isDown ||
      this.cursorKeys.down.isDown
    ) {
      this.fsm.triggerEvent(HeroUniverseHeroEventId.Move);
    } else if (this.scene.input.activePointer.isDown && this.isPointerOnTop === false) {
      this.fsm.triggerEvent(HeroUniverseHeroEventId.Move);
    }
  }

  /** 開始播放移動動畫 */
  public onMoveEnter(): void {
    this.character.anims.resume();
  }

  /** 處理移動 */
  public onMoveUpdate(): void {
    if (this.ship.visible) {
      // 飛船狀態，顯示在最上層，不會被任何物件阻擋
      this.setDepth(this.scene.worldBottomEdgeY);
    } else {
      // 角色狀態，隨著y軸變化顯示深度
      this.setDepth(this.y);
    }

    // 8 方向移動
    const cursorKeyRotation = PhaserHelper.getCursorKeyDirectionRad(this.cursorKeys);

    // 假如有按任何方向鍵，完全忽略鼠標
    if (cursorKeyRotation !== CompassRad.None) {
      // 設置面向的角度
      this.moveForward(cursorKeyRotation);
      return;
    }

    // 取得鼠標
    const pointer = this.scene.input.activePointer;

    // 如果鼠標在遊戲UI或網頁UI上，則不處理
    if (this.scene.gui.isPointerAboveUI(pointer) || pointer.event.target !== this.scene.game.canvas) {
      return;
    }

    // 或鼠標放開時，或滑鼠離英雄很靠近時，暫停移動
    if (pointer.isDown === false || this.isPointerOnTop) {
      this.fsm.triggerEvent(HeroUniverseHeroEventId.Idle);
      return;
    }

    // 當鼠標按著
    // 計算轉向，面對鼠標
    const leaderPosition = this.getPositionOnScreen();
    const pointerRotation = Math.atan2(pointer.y - leaderPosition.y, pointer.x - leaderPosition.x);

    // 設置面向的角度
    this.moveForward(pointerRotation);

    // 當沒有任何移動操作時，切換到Idle
    if (this.body.velocity.length() === 0) {
      this.fsm.triggerEvent(HeroUniverseHeroEventId.Idle);
    }
  }
  //#endregion FSM

  /** 向前方移動 */
  private moveForward(rotation: number): void {
    // 只有forwardContainer會旋轉，其他物件如 character 不會旋轉，僅會依角度面向左或右
    this.forward.rotation = rotation;
    // 絕對角度 =90 表示向上或向下， <89 表示向右， >91 表示向左
    const absRotation = Math.abs(this.forward.rotation);
    // 如果不是向正上方走或向正下方走
    if (absRotation > CompassRad.Down + this.characterRotateGap) {
      // 角色圖轉向左
      this.character.setFlipX(false);
    } else if (absRotation < CompassRad.Down - this.characterRotateGap) {
      // 角色圖轉向右
      this.character.setFlipX(true);
    }

    // 設置速度
    this.body.velocity = this.scene.physics.velocityFromRotation(this.forward.rotation, this.speed);
  }

  /** 取得在螢幕中相對位置
   * @returns 在螢幕中相對位置
   */
  private getPositionOnScreen(): Phaser.Math.Vector2 {
    // 遊戲主攝影機
    const camera = this.scene.cameras.main;
    // 將世界座標轉換成螢幕座標
    const position = new Phaser.Math.Vector2(
      (this.body.center.x - camera.worldView.x) * camera.zoom,
      (this.body.center.y - camera.worldView.y) * camera.zoom,
    );
    return position;
  }

  /** 取得與鼠標之間距離
   * @returns 與鼠標之間距離
   */
  private getDistanceToPointer(): number {
    const position = this.getPositionOnScreen();

    return Phaser.Math.Distance.Between(
      position.x,
      position.y,
      this.scene.input.activePointer.x,
      this.scene.input.activePointer.y,
    );
  }

  /** 設置英雄要顯示角色或是飛船
   * @param heroType 英雄類型
   */
  public setHeroType(heroType: HeroUniverseEvent): void {
    switch (heroType) {
      case HeroUniverseEvent.Character:
        this.character.setVisible(true);
        break;
      case HeroUniverseEvent.Ship:
        this.ship.setVisible(true);
        // 開啟與pointer互動
        this.ship.setInteractive({ useHandCursor: true });
        // 綁定點擊事件
        this.ship.on(Phaser.Input.Events.POINTER_DOWN, async (pointer: Phaser.Input.Pointer, x: number, y: number) => {
          this.scene.pauseScene();
          await this.scene.heroUniverseWeb.redirect(`${WebGameName.PersonalBaseGame}`);
          this.scene.resumeScene();
        });
        break;
    }
  }
}
