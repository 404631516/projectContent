import { AsyncHelper } from '../../Helper/AsyncHelper';
import { BossString } from '../BossConfig';
import BossGameHeroComponent, { BossGameHeroData } from '../Components/BossGameHeroComponent';
import UIDialog from '../../Scripts/Components/UIDialog';
import { randomNumber } from '../../Helper/MathHelper';
import AnimationHelper from '../../Helper/AnimationHelper';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export default class BossGameDialog extends UIDialog {
  /** 魔王受傷文字風格 */
  private readonly bossDamageTextStyle: TextStyle = { color: '#2CEAEC', fontSize: '30px' };
  /** 魔王受傷特效 Animation key */
  private readonly damageAnimKey: string = 'damageAnimKey';

  /** 魔王圖片 */
  private bossImage!: Phaser.GameObjects.Image;
  /** 魔王受傷特效 */
  private damageEffect!: Phaser.GameObjects.Sprite;

  /** 玩家英雄Component */
  private playerHero!: BossGameHeroComponent;
  /** 隊員英雄Component清單 */
  private teammateHeroList: BossGameHeroComponent[] = [];

  /** 魔王圖片位置 */
  private bossPosition!: Phaser.Math.Vector2;

  /** 攻擊音效 */
  public attackSounds: Phaser.Sound.BaseSound[] = [
    this.scene.game.sound.add(BossString.AttackSound1),
    this.scene.game.sound.add(BossString.AttackSound2),
  ];

  protected setUI(): void {
    //
  }

  /** 初始化
   * @param bossPosition 魔王位置
   */
  public init(bossPosition: Phaser.Math.Vector2): void {
    // 設定魔王位置
    this.bossPosition = bossPosition;

    // 新增新的背景物件
    const canvasWidth = this.scene.game.canvas.width;
    const canvasHeight = this.scene.game.canvas.height;
    const background = this.addTileSprite(
      BossString.Background,
      canvasWidth * 0.5,
      canvasHeight * 0.5,
      canvasWidth,
      canvasHeight
    );
    // 調整圖片長寬, 對應當前gamescene設定大小
    background.displayWidth = canvasWidth;
    background.displayHeight = canvasHeight;
  }

  /** 創建玩家及隊員英雄
   * @param playerHeroData
   * @param teammateBossGameHeroDataList
   */
  public setHeroTeam(playerHeroData: BossGameHeroData, teammateHeroDataList: BossGameHeroData[]): void {
    // 生成隊友
    this.teammateHeroList = teammateHeroDataList.map<BossGameHeroComponent>((heroData) => {
      const teammateHeroComp = new BossGameHeroComponent(this.scene, heroData.position.x, heroData.position.y);
      teammateHeroComp.init(heroData);
      return teammateHeroComp;
    });

    // 生成玩家
    this.playerHero = new BossGameHeroComponent(this.scene, playerHeroData.position.x, playerHeroData.position.y);
    this.playerHero.init(playerHeroData);

    // 加上self tag
    const selfTag = this.playerHero.addImage(BossString.SelfTag, 0, -80);
    selfTag.setScale(0.4);
    const selfTagArrow = this.playerHero.addImage(BossString.SelfTagArrow, 0, -60);
    selfTagArrow.setScale(0.4);
  }

  /** 創建魔王 */
  public setBoss(): void {
    // 顯示魔王
    this.bossImage = this.addImage(BossString.BossImgKey, this.bossPosition.x, this.bossPosition.y);
    this.bossImage.setInteractive({ useHandCursor: true });
    this.bossImage.setScale(0.5);
    // 魔王傷害表演, 傷害特效
    this.damageEffect = this.addSprite(BossString.EnemyDamageEffect, this.bossPosition.x, this.bossPosition.y);
    this.damageEffect.anims.create({
      key: this.damageAnimKey,
      frames: BossString.EnemyDamageEffect,
      frameRate: 15,
      showOnStart: true,
      hideOnComplete: true,
    });
  }

  /** 任一隊員攻擊魔王 */
  public teammateAttackBoss(): void {
    // 骰隨機隊員
    const randomTeamMemberIndex = randomNumber(this.teammateHeroList.length);
    // 攻擊
    this.heroAttack(this.teammateHeroList[randomTeamMemberIndex], false);
  }

  /** 玩家攻擊魔王 */
  public playerAttackBoss(): void {
    this.heroAttack(this.playerHero, false);
  }

  /** 播放攻擊魔王特效
   * @param hero
   * @param isPlayHitSound
   */
  private async heroAttack(hero: BossGameHeroComponent, isPlayHitSound: boolean): Promise<void> {
    // 英雄攻擊
    await hero.fire(this.bossPosition);

    // 播放魔王傷害特效
    this.damageEffect.anims.play(this.damageAnimKey);
    // 魔王震動
    this.scene.add.tween({
      targets: this.bossImage,
      y: this.bossPosition.y - 5,
      duration: 50,
      repeat: 2,
      yoyo: true,
      onComplete: () => {
        this.bossImage.y = this.bossPosition.y;
      },
    });

    // 播放音效
    if (isPlayHitSound) {
      const randomIndex = randomNumber(this.attackSounds.length);
      this.attackSounds[randomIndex].play();
    }
  }

  /** 播放結束動畫流程
   * @param bossDamage
   */
  public async playEnding(bossDamage: number): Promise<void> {
    await AsyncHelper.sleep(1);

    // 所有隊員輪流攻擊
    for (const teammate of this.teammateHeroList) {
      this.heroAttack(teammate, true);
      await AsyncHelper.sleep(0.2);
    }

    // 玩家英雄攻擊
    await this.heroAttack(this.playerHero, true);
    await AsyncHelper.sleep(1.2);

    // 魔王扣血
    const bossDamageText = this.addText(
      `${-bossDamage}`,
      this.bossPosition.x + 20,
      this.bossPosition.y - 90,
      this.bossDamageTextStyle
    );

    this.scene.add.tween({
      targets: bossDamageText,
      x: this.bossPosition.x + 30,
      y: this.bossPosition.y - 120,
      scale: 1.5,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        bossDamageText.destroy();
      },
    });
    await AsyncHelper.sleep(0.8);
  }
}
