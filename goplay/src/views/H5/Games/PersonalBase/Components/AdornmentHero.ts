import { HeroData } from '@/manager/TableManager';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import { Scene } from 'phaser';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { AdornmentNumber, AdornmentString } from '../Data/AdornmentConfig';
import { randomBoolean, randomNumber } from '@/views/H5/Helper/MathHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import HeroManager from '@/manager/HeroManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';

/** 房間佈置-英雄 */
export default class AdornmentHero extends Object2D {
  //#region UI參數
  /** 對話維持時間 */
  private readonly talkFrameDuration: number = 2;
  /** 英雄停留時間 */
  private readonly heroStayDuration: number = 6 - this.talkFrameDuration;

  /** 對話框 位置 */
  private readonly talkFramePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-70, -90);
  /** 對話內容 位置 */
  private readonly talkContentPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -8);
  //#endregion UI參數

  //#region data
  /** 角色動畫圖 */
  private avatarSprite!: Phaser.GameObjects.Sprite;
  /** 對話框 */
  private talkFrameNode!: Object2D;
  /** 對話內文 */
  private talkContentText!: Phaser.GameObjects.Text;

  /** 英雄靜態表 */
  private heroData!: HeroData;
  /** 正在執行移動流程 */
  public isMoving: boolean = false;
  /** 是否顯示對話 */
  private isShowTalk: boolean = true;

  //#endregion data

  constructor(newScene: Scene, x: number, y: number, textureKey: string) {
    super(newScene, x, y);
    // 加入動畫圖(無物理)
    this.avatarSprite = this.addSprite(textureKey, 0, 0);
    // 縮放
    this.avatarSprite.setScale(AdornmentNumber.heroSpriteScale);

    // 建立對話框
    this.initTalkFrame();
  }

  /** 初始化英雄
   * @param heroData 英雄資料
   * @param isShowTalk 要顯示英雄對話
   */
  public initHero(heroData: HeroData, isShowTalk: boolean): void {
    // 從pool中取出後，要顯示英雄
    this.setActive(true);
    this.setVisible(true);
    this.alpha = 1;

    // 英雄靜態表
    this.heroData = heroData;
    // 播IDLE動畫
    this.playAnimation(CharacterAnimType.Idle);
    // 隱藏對話
    this.talkFrameNode.alpha = 0;
    // 要顯示英雄對話
    this.isShowTalk = isShowTalk;
  }

  /** 建立對話框 */
  private initTalkFrame(): void {
    this.talkFrameNode = this.addObject(this.talkFramePosition.x, this.talkFramePosition.y);
    // 底框
    this.talkFrameNode.addImage(AdornmentString.heroTalkFrame, 0, 0);

    // 對話內文
    this.talkContentText = this.talkFrameNode.addText('', this.talkContentPosition.x, this.talkContentPosition.y, {
      color: '#3E3E3E',
      fontSize: '22px',
      strokeThickness: 0,
    });
  }

  /** 播放動畫
   * @param animationType
   */
  private playAnimation(animationType: CharacterAnimType): boolean {
    // 防呆(離開phaser後會報錯)
    if (this.avatarSprite == null) {
      return false;
    }
    if (this.avatarSprite.anims == null) {
      return false;
    }
    // 播放動畫
    this.avatarSprite.anims.play(AnimationHelper.getCharacterAnimKey(this.heroData, animationType));
    return true;
  }

  /** 移動英雄
   * @param x 目標x座標
   * @param duration 播放時間(MS)
   */
  public async onHeroMove(x: number, duration: number): Promise<void> {
    // 正在執行移動流程
    this.isMoving = true;

    // 播WALK動畫
    this.playAnimation(CharacterAnimType.Walk);

    // 判斷面向(面向右，要flip)
    this.avatarSprite.flipX = this.x < x;

    // 建立tween
    const moveTween = this.scene.tweens.add({
      targets: this,
      duration,
      x,
    });

    // 等到tween結束
    await AsyncHelper.pendingUntil(() => moveTween.totalProgress === 1);

    // 播IDLE動畫
    if (this.playAnimation(CharacterAnimType.Idle) === false) {
      return;
    }

    // 若 要顯示對話 且 隨機決定要顯示對話
    if (this.isShowTalk && randomBoolean()) {
      // 取得對話框的世界座標轉換矩陣, 取得世界座標x(e)
      const worldTransformMatrix = this.talkFrameNode.getWorldTransformMatrix();

      // 取得對話框的範圍
      const talkFrameRect = this.talkFrameNode.getBounds();

      // 對話框左緣位置 = 世界座標x - 底圖width/2
      // 對話框左緣超出畫面左端時，不顯示對話
      if (worldTransformMatrix.e - talkFrameRect.width / 2 > 0) {
        // 更新對話內容
        this.changeTalkContent();
      }
    }

    // 對話顯示幾秒
    await AsyncHelper.sleep(this.talkFrameDuration);

    // 隱藏對話
    this.talkFrameNode.alpha = 0;

    // 英雄停留幾秒
    await AsyncHelper.sleep(this.heroStayDuration);

    // 結束執行移動流程
    this.isMoving = false;
  }

  /** 更新對話內容 */
  private changeTalkContent(): void {
    // 抽選HERO對話
    const heroKey = `${AdornmentString.heroTalkContentKey}${this.heroData.id}_${
      randomNumber(AdornmentNumber.heroTalkContentCount) + 1
    }`;

    // 取得英雄對話資料，以播放對話
    this.talkContentText.text = HeroManager.getHeroTalkContent(heroKey, 'AdornmentHeroDefaultTalkContent');

    // 顯示對話框
    this.talkFrameNode.alpha = 1;
  }
}
