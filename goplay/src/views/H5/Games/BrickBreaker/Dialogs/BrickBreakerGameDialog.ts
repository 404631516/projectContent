import bossImgPath from '@/config/imgPath/_boss';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import TableManager from '@/manager/TableManager';
import UIHelper from '@/views/H5/Helper/UIHelper';
import {
  BrickBreakerAvatarData,
  BrickBreakerBossData,
  BrickBreakerItemType,
  getBrickBreakerAvatarScore,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import { MemberType } from '@/views/H5/Net/NetProtocol/CommonStructure';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Slider from '@/views/H5/Scripts/Components/Slider';
import UIDialog from '../../../Scripts/Components/UIDialog';
import { BrickBreakerString } from '../Data/BrickBreakerConfig';
import BrickBreakerGameScene from '../Scenes/BrickBreakerGameScene';

export default class BrickBreakerGameDialog extends UIDialog {
  //#region UI 魔王資訊
  /** 魔王資訊 魔王圖案 */
  private bossInfoBossIcon!: Phaser.GameObjects.Image;
  /** 魔王資訊 魔王名稱 */
  private bossInfoNameText!: Phaser.GameObjects.Text;
  /** 魔王資訊 hp */
  private bossInfoHpText!: Phaser.GameObjects.Text;
  /** 魔王資訊 hp slider */
  private bossInfoHpSlider!: Slider;
  //#endregion

  //#region UI 玩家資訊
  /** 玩家資訊 英雄 */
  private playerInfoHeroIcon!: Phaser.GameObjects.Image;
  /** 玩家資訊 姓名 */
  private playerInfoNameText!: Phaser.GameObjects.Text;
  /** 玩家資訊 綜合分數 */
  private playerInfoGameScoreText!: Phaser.GameObjects.Text;

  /** 玩家資訊 造成傷害 */
  private playerInfoBossDamageText!: Phaser.GameObjects.Text;
  /** 玩家資訊 七連擊次數 */
  private playerInfoBossHitSuccessText!: Phaser.GameObjects.Text;
  /** 玩家資訊 答對數 */
  private playerInfoCorrectText!: Phaser.GameObjects.Text;
  /** 玩家資訊 號角 */
  private playerInfoHornText!: Phaser.GameObjects.Text;
  /** 玩家資訊 防禦 */
  private playerInfoDefenseText!: Phaser.GameObjects.Text;
  /** 玩家資訊 寶箱 */
  private playerInfoAnswerTreasureText!: Phaser.GameObjects.Text;
  /** 玩家資訊 寶物 */
  private playerInfoTreasureText!: Phaser.GameObjects.Text;
  /** 玩家資訊 敲磚 */
  private playerInfoBrickBreakText!: Phaser.GameObjects.Text;

  /** 玩家資訊 持有道具icon */
  private playerInfoItemShield!: Phaser.GameObjects.Image;
  /** 玩家資訊 持有道具icon */
  private playerInfoItemAxe!: Phaser.GameObjects.Image;
  /** 玩家資訊 持有道具icon */
  private playerInfoItemFreezePrevent!: Phaser.GameObjects.Image;

  /** 玩家資訊 持有道具功能說明(背景) */
  private playerInfoItemDetailImage!: Phaser.GameObjects.Image;
  /** 玩家資訊 持有道具功能說明(文字) */
  private playerInfoItemDetailText!: Phaser.GameObjects.Text;
  //#endregion

  /** 指定為BrickBreakerGameScene使用 */
  public declare scene: BrickBreakerGameScene;

  /** 定位按鈕位置 */
  private readonly locateBtnPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(230, 395);
  /** 地圖放大按鈕位置 */
  private readonly zoomInBtnPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(230, 440);
  /** 地圖縮小按鈕位置 */
  private readonly zoomOutBtnPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(230, 485);

  /** GameStart表演時間 */
  private readonly playGameStartSec = 2;

  //#region  setUI
  protected setUI(): void {
    // 設置地圖控制元件
    this.setMapControlComponent();

    // 設置魔王資訊
    this.setBossInfoUI();

    // 遊戲玩法提示
    this.setHowToPlayHintUI();

    // 設置玩家資訊
    if (this.scene.memberType === MemberType.Player) {
      this.setPlayerInfoUI();
    }

    // 觀戰UI
    if (this.scene.memberType === MemberType.Spectator) {
      this.setSpectatorUI();
    }
  }

  /** 設置地圖控制元件 */
  private setMapControlComponent(): void {
    // 玩家才需要locateBtn
    if (this.scene.memberType === MemberType.Player) {
      const locateBtn = this.addImage(BrickBreakerString.LocateIcon, this.locateBtnPos.x, this.locateBtnPos.y);
      locateBtn.setScale(0.5);
      locateBtn.setInteractive({ useHandCursor: true });
      locateBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.scene.onClickLocateButton();
      });
    }

    const zoomInBtn = this.addImage(BrickBreakerString.ZoomInIcon, this.zoomInBtnPos.x, this.zoomInBtnPos.y);
    zoomInBtn.setScale(0.5);
    zoomInBtn.setInteractive({ useHandCursor: true });
    zoomInBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // 縮近攝影機
      this.scene.mapViewCamera.wheelComponent.zoomOnce(true);
    });

    const zoomOutBtn = this.addImage(BrickBreakerString.ZoomOutIcon, this.zoomOutBtnPos.x, this.zoomOutBtnPos.y);
    zoomOutBtn.setScale(0.5);
    zoomOutBtn.setInteractive({ useHandCursor: true });
    zoomOutBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // 放遠攝影機
      this.scene.mapViewCamera.wheelComponent.zoomOnce(false);
    });
  }

  /** 設置魔王資訊UI */
  private setBossInfoUI(): void {
    // 背景
    const bgImg = this.addImage(BrickBreakerString.BossBG, 110, 30);
    bgImg.setScale(1.6);
    bgImg.setInteractive({ useHandCursor: true });
    // 魔王圖片
    this.bossInfoBossIcon = this.addImage(BrickBreakerString.BossIcon, 50, 44);
    this.bossInfoBossIcon.setScale(-0.2, 0.2);

    // 魔王遮罩
    const maskGraphic = new Phaser.GameObjects.Graphics(this.scene);
    // 圖形要用世界座標
    maskGraphic.fillRect(0, 0, 200, 65);
    // 把圖形轉變成遮罩
    const mask = maskGraphic.createGeometryMask();
    // 對圖片設置遮罩(遮罩是反向的)
    this.bossInfoBossIcon.setMask(mask);

    // 魔王icon
    const bossIcon = this.addImage(BrickBreakerString.BossIcon, 90, 26);
    bossIcon.setScale(0.5);

    // 魔王名稱
    this.bossInfoNameText = this.addText('', 104, 26, {
      fontSize: '12px',
    });
    this.bossInfoNameText.setOrigin(0, 0.5);
    // 調整text scale, 靠縮放大小限制顯示範圍
    UIHelper.setScaleFill(this.bossInfoNameText, 18, 84);
    // 魔王血條
    this.bossInfoHpSlider = this.addObject(134, 46, Slider, 1000);
    this.bossInfoHpSlider.setBarSize(110, 18);
    // 魔王血條(文字)
    this.bossInfoHpText = this.addText('0/0', 134, 46, {
      fontSize: '12px',
    });
  }

  /** 設置玩家資訊UI */
  private setPlayerInfoUI(): void {
    // 背景
    const bgImg = this.addImage(BrickBreakerString.FramePlayerInfo, 110, 196);
    bgImg.setScale(0.52, 0.54);
    bgImg.setInteractive({ useHandCursor: true });
    // 個人資訊
    const headFrame = this.addImage(BrickBreakerString.FrameHead, 46, 104);
    headFrame.setScale(0.56);
    this.playerInfoHeroIcon = this.addImage('', 46, 104);
    this.playerInfoHeroIcon.setScale(0.56);
    this.playerInfoNameText = this.addText('', 68, 98, { fontSize: '10px' });
    this.playerInfoNameText.setOrigin(0, 0.5);
    this.playerInfoGameScoreText = this.addText('', 68, 110, {
      fontSize: '12px',
      color: UIHelper.yellowString,
    });
    this.playerInfoGameScoreText.setOrigin(0, 0.5);
    // 各項個人遊戲資訊
    this.playerInfoBossDamageText = this.createPlayerInfoText(0);
    this.playerInfoBossHitSuccessText = this.createPlayerInfoText(1);
    this.playerInfoCorrectText = this.createPlayerInfoText(2);
    this.playerInfoHornText = this.createPlayerInfoText(3);
    this.playerInfoDefenseText = this.createPlayerInfoText(4);
    this.playerInfoAnswerTreasureText = this.createPlayerInfoText(5);
    this.playerInfoTreasureText = this.createPlayerInfoText(6);
    this.playerInfoBrickBreakText = this.createPlayerInfoText(7);
    // 持有道具icon 傷害護盾
    this.playerInfoItemShield = this.addImage(BrickBreakerString.ItemShield, 40, 300);
    this.playerInfoItemShield.setScale(0.6);
    this.playerInfoItemShield.setInteractive({ useHandCursor: true });
    this.playerInfoItemShield.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.showPlayerInfoItemDetail(this.playerInfoItemShield, BrickBreakerItemType.Shield);
    });
    this.playerInfoItemShield.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.hidePlayerInfoItemDetail();
    });
    // 持有道具icon 攻擊力上升
    this.playerInfoItemAxe = this.addImage(BrickBreakerString.ItemAxe, 60, 300);
    this.playerInfoItemAxe.setScale(0.6);
    this.playerInfoItemAxe.setInteractive({ useHandCursor: true });
    this.playerInfoItemAxe.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.showPlayerInfoItemDetail(this.playerInfoItemAxe, BrickBreakerItemType.Axe);
    });
    this.playerInfoItemAxe.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.hidePlayerInfoItemDetail();
    });
    // 持有道具icon 寒冰護盾
    this.playerInfoItemFreezePrevent = this.addImage(BrickBreakerString.ItemFreezePrevent, 80, 300);
    this.playerInfoItemFreezePrevent.setScale(0.6);
    this.playerInfoItemFreezePrevent.setInteractive({ useHandCursor: true });
    this.playerInfoItemFreezePrevent.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.showPlayerInfoItemDetail(this.playerInfoItemFreezePrevent, BrickBreakerItemType.FreezePrevent);
    });
    this.playerInfoItemFreezePrevent.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.hidePlayerInfoItemDetail();
    });
    // 道具說明框
    this.playerInfoItemDetailImage = this.addImage(BrickBreakerString.FrameInfo, 0, 0);
    this.playerInfoItemDetailImage.setScale(0.5);
    // 道具說明框文字
    this.playerInfoItemDetailText = this.addText('', 0, 0, {
      fontSize: '12px',
      color: UIHelper.blackString,
      strokeThickness: 0,
    });
    this.playerInfoItemDetailText.setOrigin(0, 0.5);
    // 隱藏道具說明
    this.hidePlayerInfoItemDetail();
  }

  /** create各項個人遊戲資訊Text
   * @param index 遊戲資訊顯示順序index
   */
  private createPlayerInfoText(index: number): Phaser.GameObjects.Text {
    // 文字統一設定格式
    const playerInfoTextConfig: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '36px',
      strokeThickness: 0,
    };
    const textYBase = 140;
    const textYOffset = 20;

    const newText = this.addText('', 30, textYBase + textYOffset * index, playerInfoTextConfig);
    newText.setOrigin(0, 0.5);
    newText.setScale(0.4);

    return newText;
  }

  /** 顯示道具說明
   * @param itemIcon 對應的道具icon
   * @param itemType 對應的道具類型
   */
  private showPlayerInfoItemDetail(itemIcon: Phaser.GameObjects.Image, itemType: BrickBreakerItemType): void {
    // setVisible
    this.playerInfoItemDetailImage.setVisible(true);
    this.playerInfoItemDetailText.setVisible(true);
    // setPosition
    this.playerInfoItemDetailImage.setPosition(itemIcon.x + 60, itemIcon.y + 30);
    this.playerInfoItemDetailText.setPosition(itemIcon.x - 10, itemIcon.y + 30);
    // setText
    const localKey = 'brickBreaker_gameDialog_playerInfoItem_' + itemType;
    this.playerInfoItemDetailText.text = Localization.getText(LocalKeyType.Common, localKey);
  }

  /** 隱藏道具說明 */
  private hidePlayerInfoItemDetail(): void {
    this.playerInfoItemDetailImage.setVisible(false);
    this.playerInfoItemDetailText.setVisible(false);
  }

  /** 玩法說明UI */
  private setHowToPlayHintUI(): void {
    const howToPlayButton = this.addImage(BrickBreakerString.FrameHowToPlay, 96, 340);
    howToPlayButton.setScale(0.54);
    const howToPlayIcon = this.addImage(BrickBreakerString.QuestionMarkIcon, 50, 334);
    howToPlayIcon.setScale(0.54);
    const howToPlayText = this.addText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_howToPlay'),
      62,
      338,
      {
        fontSize: '12px',
      }
    );
    howToPlayText.setOrigin(0, 0.5);
    // 設定按鈕事件
    howToPlayButton.setInteractive({ useHandCursor: true });
    howToPlayButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // 通知BrickBreakerGameScene
      this.scene.onClickHowToPlayButton();
    });
  }

  /** 設置觀戰UI */
  private setSpectatorUI(): void {
    const leaveBgX = this.centerX;
    const leaveBgY = 480;

    // 背景
    const bg = this.addImage(BrickBreakerString.GradientOverlay, leaveBgX, leaveBgY);
    bg.setScale(0.5);

    // 觀戰提示文字
    this.addText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_spectatorMode'),
      leaveBgX,
      leaveBgY - 12,
      {
        fontSize: '20px',
      }
    );

    // 離開遊戲按鈕
    const leaveBtn = this.addImage(BrickBreakerString.RedButton, leaveBgX, leaveBgY + 14);
    leaveBtn.setScale(0.5);
    leaveBtn.setInteractive({ useHandCursor: true });
    leaveBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // 通知BrickBreakerGameScene
      this.scene.onClickSpectatorLeaveButton();
    });

    // 按鈕上方箭頭圖案
    const arrowIcon = this.addImage(BrickBreakerString.ButtonArrow, leaveBgX - 30, leaveBgY + 12);
    arrowIcon.setScale(0.5);

    // 離開遊戲文字
    this.addText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_spectatorLeaveBtn'),
      leaveBgX + 10,
      leaveBgY + 13,
      {
        fontSize: '12px',
      }
    );
  }
  //#endregion setUI

  /** init
   * @param bossData 魔王資訊
   */
  public setBoss(bossData: BrickBreakerBossData): void {
    // 設定魔王圖片
    const bossTableData = TableManager.boss.findOne(bossData.bossId);
    if (bossTableData === undefined) {
      console.error('gameDialog.setBoss() error, bossTableData is null! bossId = ' + bossData.bossId);
      return;
    }
    // 載入資源
    this.scene.load.image(bossTableData.bossNameKey, `${bossImgPath.bossBaseUrl}${bossTableData.imgUrl}.png`);
    this.scene.load.start();
    this.scene.load.once(
      'complete',
      () => {
        // 資源載好後設定圖片
        this.bossInfoBossIcon.setTexture(bossTableData.bossNameKey);
      },
      this
    );
    this.bossInfoNameText.text = bossTableData.bossName;

    // 設定魔王血量
    this.updateBossHp(bossData);
  }

  /** 刷新個人資訊UI
   * @param avatarData 目標avatarData
   */
  public updatePlayerInfo(avatarData: BrickBreakerAvatarData): void {
    // 尋找對應heroData
    const heroData = HeroManager.getHeroData(avatarData.heroId);
    if (heroData === undefined) {
      console.error('gameDialog.setTargetAvatarData() error, heroData undefined, ' + 'heroId = ' + avatarData.heroId);
      return;
    }

    // 更新UI
    this.playerInfoHeroIcon.setTexture(`${heroData.nameKey}${HeroImgType.Head}`);
    this.playerInfoNameText.setText(avatarData.name);
    // 更新持有道具
    this.playerInfoItemShield.setVisible(avatarData.itemList[BrickBreakerItemType.Shield] > 0);
    this.playerInfoItemAxe.setVisible(avatarData.itemList[BrickBreakerItemType.Axe] > 0);
    this.playerInfoItemFreezePrevent.setVisible(avatarData.itemList[BrickBreakerItemType.FreezePrevent] > 0);
    // 更新UI分數
    const gameScore = getBrickBreakerAvatarScore(avatarData);
    this.playerInfoGameScoreText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_gameScore', [gameScore.toString()])
    );
    this.playerInfoBossDamageText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_bossDamage', [
        avatarData.bossDamage.toString(),
      ])
    );
    this.playerInfoBossHitSuccessText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_bossHitSuccess', [
        avatarData.bossHitSuccessCount.toString(),
      ])
    );
    this.playerInfoHornText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_horn', [avatarData.hornCount.toString()])
    );
    this.playerInfoDefenseText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_defense', [avatarData.defenseCount.toString()])
    );
    this.playerInfoAnswerTreasureText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_answerTreasure', [
        avatarData.answerTreasureCount.toString(),
      ])
    );
    this.playerInfoTreasureText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_treasure', [
        avatarData.treasureCount.toString(),
      ])
    );
    this.playerInfoBrickBreakText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_brickBreak', [
        avatarData.brickBreakCount.toString(),
      ])
    );
    this.playerInfoCorrectText.setText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_gameDialog_correct', [avatarData.correctCount.toString()])
    );
  }

  /** 刷新魔王資訊UI
   * @param bossData 魔王資訊
   */
  public updateBossHp(bossData: BrickBreakerBossData): void {
    this.bossInfoHpText.setText(`${bossData.hp}/${bossData.totalHp}`);
    this.bossInfoHpSlider.setValue(bossData.hp, bossData.totalHp);
  }
}
