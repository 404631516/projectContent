import TableManager from '@/manager/TableManager';
import Slider from '@/views/H5/Scripts/Components/Slider';
import UIDialog from '../../../Scripts/Components/UIDialog';
import { BejeweledNumber, BejeweledString } from '../Data/BejeweledConfig';
import UIHelper from '@/views/H5/Helper/UIHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';

export default class BejeweledInfoDialog extends UIDialog {
  /** 能量條 */
  private energyBar?: Slider;
  /** 能量icon */
  private energyIcon?: Phaser.GameObjects.Sprite;
  /** 能量數值文字 */
  private currentEnergyText?: Phaser.GameObjects.Text;
  /** 魔王圖片 */
  private bossImg?: Phaser.GameObjects.Image;
  /** 魔王圖片 */
  private throwBossObject?: Phaser.GameObjects.Image;
  /** 操作提示文字 */
  private descriptionText?: Phaser.GameObjects.Text;
  /**受傷特效 */
  private damageEffect?: Phaser.GameObjects.Sprite;
  /** 已清除寶石提示後方的背景 */
  private gemCountBG?: Phaser.GameObjects.Image;
  /** '已清除寶石'提示 */
  private gemCountHintText?: Phaser.GameObjects.Text;
  /** 當前已清除寶石數 */
  private currentGemCountText?: Phaser.GameObjects.Text;

  /** 是否有顯示魔王 */
  private hasBoss = false;

  /** 魔王位置 */
  private bossPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(820, 210);

  /** 攻擊的動畫名稱 */
  private readonly damageAnimKey: string = 'damageAnim';

  protected setUI(): void {
    // 能量值 bar
    this.energyBar = this.addObject(320, 18, Slider, BejeweledNumber.MaxEnergy);
    this.energyBar.setValueColor({
      value: 1,
      color: UIHelper.energyBarColor,
    });
    this.energyBar.setBarSize(280, 20, 1, 2);
    // "當前魔力值"字樣
    this.addText('當前魔力值', 100, 18, {
      fontSize: '14px',
      stroke: '#000000',
      strokeThickness: 3,
    });
    // 魔力icon
    this.energyIcon = this.addSprite(BejeweledString.EnergyIcon, 160, 18);
    this.energyIcon.scale = 0.7;

    // 說明文字顯示
    this.descriptionText = this.addText('選擇1顆英雄方塊和炸彈進行交換', this.bossPosition.x, 100, {
      fontSize: '20px',
      color: '#F7E735',
      stroke: '#000000DB',
      strokeThickness: 3,
      padding: {
        left: 30,
        right: 30,
        top: 10,
        bottom: 10,
      },
      backgroundColor: '#000000',
    });
    this.descriptionText.alpha = 0.7;

    // 魔王傷害表演, 用於投擲魔王的物體
    this.throwBossObject = this.addImage(BejeweledString.ThrowBossObject, 0, 0);
    this.throwBossObject.visible = false;
    this.throwBossObject.scale = 0.3;

    // 魔王傷害表演, 傷害特效
    this.damageEffect = this.addSprite(BejeweledString.EnemyDamageEffect, this.bossPosition.x, this.bossPosition.y);
    this.damageEffect.anims.create({
      key: this.damageAnimKey,
      frames: BejeweledString.EnemyDamageEffect,
      frameRate: 15,
      showOnStart: true,
      hideOnComplete: true,
    });

    // 消除寶石數提示BG
    this.gemCountBG = this.addImage(BejeweledString.GradientOverlay, this.bossPosition.x, 220);
    // 消除寶石數提示
    this.gemCountHintText = this.addText('已消除方塊數', this.bossPosition.x, 180, {
      fontSize: '28px',
      stroke: '#000000',
      strokeThickness: 3,
    });
    // 消除寶石數
    this.currentGemCountText = this.addText('0', this.bossPosition.x, 240, {
      fontSize: '80px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });

    // 設置音訊開關按鈕
    this.addImage('', this.width * 0.95, this.height * 0.87, '', MuteIcon);
  }

  /** 設定魔王及操作提示 */
  public setBossData(bossId: number): void {
    // bossId = -1為正常情況, 表示不需要顯示魔王
    if (bossId === -1) {
      return;
    }

    // 取得魔王靜態資料
    const bossTableData = TableManager.boss.findOne(bossId);
    // 防呆
    if (bossTableData === undefined) {
      console.error('BejeweledInfoDialog.setBossData() error, bossTableData not found! bossId = ' + bossId);
      return;
    }

    // 設定hasBoss flag, 決定是否需要做魔王受傷表演
    this.hasBoss = true;

    // 魔王外型
    this.bossImg = this.addImage(bossTableData.bossNameKey, this.bossPosition.x, this.bossPosition.y);
    this.bossImg.setScale(0.5);

    // 操作提示 & 受傷特效 要在魔王之上
    if (this.descriptionText) {
      this.bringToTop(this.descriptionText);
    }
    if (this.damageEffect) {
      this.bringToTop(this.damageEffect);
    }

    // 已清除寶石數 換位置
    if (this.gemCountBG) {
      // 背景
      this.gemCountBG.setPosition(this.bossPosition.x, 350);
      this.gemCountBG.setScale(0.5);
    }
    if (this.gemCountHintText) {
      // 提示
      this.gemCountHintText.setPosition(this.bossPosition.x, 335);
      this.gemCountHintText.setFontSize(14);
    }
    if (this.currentGemCountText) {
      // 清除寶石數字
      this.currentGemCountText.setPosition(this.bossPosition.x, 360);
      this.currentGemCountText.setFontSize(40);
    }
  }

  /** 更新能量值 & UI
   * @param currentEnergy 目標能量值
   */
  public setCurrentEnergy(currentEnergy: number): void {
    // 更新UI
    this.energyBar?.setValue(currentEnergy);
    this.currentEnergyText?.setText(`${currentEnergy} / ${BejeweledNumber.MaxEnergy}`);
  }

  /** 更新當前消除寶石數文字
   * @param currentGemCount 當前消除寶石數
   */
  public updateCurrentGemCount(currentGemCount: number): void {
    if (this.currentGemCountText) {
      this.currentGemCountText.text = currentGemCount.toString();
      this.scene.add.tween({
        targets: this.currentGemCountText,
        scale: 1.2,
        duration: 50,
        yoyo: true,
      });
    }
  }

  /** 播放攻擊魔王特效 */
  public playAttackBossAnimation(): void {
    // 沒顯示魔王就不用表演
    if (this.hasBoss === false) {
      return;
    }
    // 防呆
    if (this.damageEffect === undefined) {
      console.error('playAttackBossAnimation() error, damageEffect is undefined!');
      return;
    }
    if (this.throwBossObject === undefined) {
      console.error('playAttackBossAnimation() error, throwBossObject is undefined!');
      return;
    }
    if (this.damageEffect.anims.isPlaying === true) {
      return;
    }

    // 朝魔王丟東西
    this.throwBossObject.visible = true;
    this.throwBossObject.setPosition(650, 180);
    // 移動tween 並帶旋轉
    this.scene.add.tween({
      targets: this.throwBossObject,
      x: this.bossPosition.x,
      y: this.bossPosition.y,
      rotation: `+=${Phaser.Math.PI2}`,
      duration: 100,
      onComplete: () => {
        if (this.throwBossObject === undefined) {
          return;
        }
        this.throwBossObject.visible = false;
        // 播放傷害特效
        this.damageEffect?.anims.play(this.damageAnimKey);
        // 魔王震動
        this.scene.add.tween({
          targets: this.bossImg,
          y: `-=5`,
          duration: 50,
          repeat: 2,
          yoyo: true,
        });
      },
    });
  }
}
