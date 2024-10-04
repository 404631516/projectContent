import UIDialog from '../../../Scripts/Components/UIDialog';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { AdornmentDepth, AdornmentNumber, AdornmentString } from '../Data/AdornmentConfig';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import AdornmentComponent from '../Components/AdornmentComponent';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import AdornmentButtonLayout from '../Components/AdornmentButtonLayout';

/** 顯示 個人基地的資訊 */
export default class AdornmentMainDialog extends UIDialog {
  //#region readonly
  // 房間佈置-主畫面ui

  /** 左方鈕(佈置/我的房間) 位置 */
  private readonly leftBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(360, 730);
  /** 按鈕間隔X */
  private readonly btnGapX: number = 110;
  /** 商店鈕 位置 */
  private readonly storeBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1330, this.leftBtnPosition.y);
  /** 背包鈕 位置 */
  private readonly backpackBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    this.storeBtnPosition.x + this.btnGapX,
    this.leftBtnPosition.y
  );
  /** 同學列表鈕 位置 */
  private readonly classmateBtnPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    this.backpackBtnPosition.x + this.btnGapX,
    this.leftBtnPosition.y
  );

  /** 拜訪標題 位置 */
  private readonly visitTitlePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(960, 40);
  /** 拜訪同學的提示節點 位置 */
  private readonly visitHintPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    AdornmentNumber.phaserGameWidth / 2,
    AdornmentNumber.phaserGameHeight / 2
  );
  /** 拜訪同學的提示-綠底 位置 */
  private readonly visitHintGreenPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -150);
  /** 拜訪同學的提示-綠底 高度 */
  private readonly visitHintGreenHeight: number = 300;
  /** 拜訪同學的提示-標題 位置 */
  private readonly visitHintTitlePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -70);
  /** 拜訪同學的提示-線 位置 */
  private readonly visitHintLinePosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -20);
  /** 拜訪同學的提示-用戶名 位置 */
  private readonly visitHintUserPositionY: number = 60;
  /** 拜訪同學的提示-圖示 位置 */
  private readonly visitHintIconPositionY: number = this.visitHintUserPositionY - 5;
  /** 拜訪同學的提示-圖示/用戶名 間隔 */
  private readonly visitHintIconGapX: number = 20;
  /** 拜訪同學的提示動畫 滑入/出時間(秒) */
  private readonly visitHintAnimatSlideSec: number = 1;
  /** 拜訪同學的提示動畫 中間停留時間(秒) */
  private readonly visitHintAnimatStaySec: number = 1;
  /** 圖片陰影位置偏移量 */
  private readonly imageAlphaOffset: number = 2;
  /** 拜訪排行榜按鈕偏移 */
  private readonly visitRankBtnOffset: number = 12;
  //#endregion readonly

  //#region data
  // 房間佈置-主畫面ui
  /** 左方鈕(佈置/我的房間)-黑底 */
  public leftBtnFrame!: Phaser.GameObjects.Image;
  /** 右方按鈕(同學/背包/商店 or 同學)-黑底 */
  public rightBtnFrame!: Phaser.GameObjects.Image;

  /** 佈置模式鈕 */
  public editModebtn!: Phaser.GameObjects.Image;
  /** 我的房間鈕 */
  public selfRoomBtn!: Phaser.GameObjects.Image;
  /** 背包鈕 */
  public backpackBtn!: Phaser.GameObjects.Image;
  /** 商店鈕 */
  public storeBtn!: Phaser.GameObjects.Image;
  /** 同學列表鈕 */
  public classmateBtn!: Phaser.GameObjects.Image;
  /** 回排行榜按鈕 */
  public visitRankBtn?: AdornmentButtonLayout;

  /** 拆缷裝飾物的發亮效果圖片 */
  private tearDownLightImage!: Phaser.GameObjects.Image;
  /** 拆缷裝飾物的發亮效果圖片 的閃爍tween */
  private tearFlashTween!: Phaser.Tweens.Tween;
  //#endregion data

  /** 設定固定ui */
  protected setUI(): void {
    // 深度
    this.setDepth(AdornmentDepth.mainDialog);
  }

  /** 建立用戶自已的ui */
  public initSelfUI(): void {
    // 左方鈕(佈置/我的房間)-黑底
    this.leftBtnFrame = this.addImage(AdornmentString.blackFrame, this.leftBtnPosition.x, this.leftBtnPosition.y);

    // 佈置模式鈕
    this.editModebtn = this.addImage(AdornmentString.editModeButton, this.leftBtnPosition.x, this.leftBtnPosition.y);
    // 設置互動參教-可點擊
    this.editModebtn.setInteractive({ useHandCursor: true });

    // 3個按鈕(同學/背包/商店鈕)-黑底
    this.rightBtnFrame = this.addImage(
      AdornmentString.blackFrame2,
      this.backpackBtnPosition.x,
      this.backpackBtnPosition.y
    );

    // 背包鈕
    this.backpackBtn = this.addImage(
      AdornmentString.backpackButton,
      this.backpackBtnPosition.x,
      this.backpackBtnPosition.y
    );
    // 設置互動參教-可點擊
    this.backpackBtn.setInteractive({ useHandCursor: true });

    // 商店鈕
    this.storeBtn = this.addImage(AdornmentString.storeButton, this.storeBtnPosition.x, this.storeBtnPosition.y);
    // 設置互動參教-可點擊
    this.storeBtn.setInteractive({ useHandCursor: true });

    // 建立拆缷裝飾物的發亮效果圖片
    this.tearDownLightImage = this.addImage(AdornmentString.backgroundAdornmentLight, 0, 0);
    this.tearDownLightImage.alpha = 0;

    // 同學列表鈕
    this.classmateBtn = this.addImage(
      AdornmentString.classmateButton,
      this.classmateBtnPosition.x,
      this.classmateBtnPosition.y
    );
    // 設置互動參教-可點擊
    this.classmateBtn.setInteractive({ useHandCursor: true });
  }

  /** 建立拜訪模式的ui */
  public initVisitUI(): void {
    /** 拜訪標題-黑底 */
    this.addImage(AdornmentString.visitTitleBg, this.visitTitlePosition.x, this.visitTitlePosition.y);

    /** 拜訪標題 */
    let titleText = '';
    // 排名
    const rankNumber = StoreHelper.$$store.state.AdornmentModule.visitedBaseOwnerRank;
    // (同學模式)未給排名時，不顯示
    if (rankNumber > 0) {
      titleText += Localization.getText(LocalKeyType.Common, 'AdornmentVisitRank', [`${rankNumber}`]);
    }
    // 用戶名
    const userName = StoreHelper.$$store.state.AdornmentModule.visitedBaseOwnerName;
    titleText += Localization.getText(LocalKeyType.Common, 'AdornmentVisitTitle', [userName]);

    // 標題內容 EX: 排名第3名王小明的個人基地
    const contentText = this.addText(
      titleText,
      this.visitTitlePosition.x,
      this.visitTitlePosition.y + this.imageAlphaOffset,
      {
        color: UIHelper.yellowString,
        fontSize: '22px',
      }
    );

    // (同學模式)未給排名時，不顯示
    if (rankNumber > 0) {
      // 拜訪排行按鈕底圖
      this.visitRankBtn = new AdornmentButtonLayout(
        this.scene,
        // 標題黑底 - 文字寬度/2
        this.visitTitlePosition.x - contentText.width / 2,
        this.visitTitlePosition.y
      );

      // TODO Layout修改完中心點可以刪除
      // 重新給位置(X座標 - 按鈕寬度/2 - 偏移量)
      this.visitRankBtn.setPosition(
        this.visitRankBtn.x - this.visitRankBtn.backgroundWidth / 2 - this.visitRankBtnOffset,
        this.visitRankBtn.y
      );

      // 設置深度
      this.visitRankBtn.setDepth(AdornmentDepth.mainDialog);
      // 告訴場景增加物件
      this.scene.add.existing(this.visitRankBtn);
      // 開啟按鈕互動
      this.visitRankBtn.setInteractive({ useHandCursor: true });
    }

    // 左方鈕(佈置/我的房間)-黑底
    this.leftBtnFrame = this.addImage(AdornmentString.blackFrame, this.leftBtnPosition.x, this.leftBtnPosition.y);

    // 我的房間鈕
    this.selfRoomBtn = this.addImage(AdornmentString.selfRoomButton, this.leftBtnPosition.x, this.leftBtnPosition.y);

    // 同學鈕-黑底
    this.rightBtnFrame = this.addImage(
      AdornmentString.blackFrame,
      this.classmateBtnPosition.x,
      this.classmateBtnPosition.y
    );

    // 同學列表鈕
    this.classmateBtn = this.addImage(
      AdornmentString.classmateButton,
      this.classmateBtnPosition.x,
      this.classmateBtnPosition.y
    );

    // 播放拜訪提示動畫
    this.playVisitHintAnimation();
  }

  /** 建立拜訪的提示 */
  private async playVisitHintAnimation(): Promise<void> {
    // 節點
    const visitHintNode = this.addObject(this.visitHintPosition.x, this.visitHintPosition.y);

    // 黑底(全畫面)
    const blackFrame = visitHintNode.addImage(AdornmentString.visitHintBlackFrame, 0, 0);
    // 放大到全畫面
    UIHelper.scaleToTarget(blackFrame, AdornmentNumber.phaserGameWidth, AdornmentNumber.phaserGameHeight);

    // 綠底(同畫面寬度)
    const greenFrame = visitHintNode.addImage(
      AdornmentString.visitHintGreenFrame,
      this.visitHintGreenPosition.x,
      this.visitHintGreenPosition.y
    );
    // 放大到螢幕寬度，及足夠涵蓋文字的高度
    UIHelper.scaleToTarget(greenFrame, AdornmentNumber.phaserGameWidth, this.visitHintGreenHeight);

    // 文字節點
    const visitHintTextNode = visitHintNode.addObject(this.visitHintGreenPosition.x, this.visitHintGreenPosition.y);
    // 文字節點寬度 = 畫面寬度
    visitHintTextNode.width = AdornmentNumber.phaserGameWidth;

    // 標題
    visitHintTextNode.addText(
      Localization.getText(LocalKeyType.Common, 'AdornmentVisitHintTitle'),
      this.visitHintTitlePosition.x,
      this.visitHintTitlePosition.y,
      {
        color: '#A2FF9B',
        fontSize: '44px',
      }
    );

    // 白線
    visitHintTextNode.addImage(
      AdornmentString.visitHintWhiteLine,
      this.visitHintLinePosition.x,
      this.visitHintLinePosition.y
    );

    // 用戶名
    const userName = StoreHelper.$$store.state.AdornmentModule.visitedBaseOwnerName;
    const visitUserName = visitHintTextNode.addText(
      Localization.getText(LocalKeyType.Common, 'AdornmentVisitHintUserName', [`${userName}`]),
      0,
      this.visitHintUserPositionY,
      {
        color: UIHelper.whiteString,
        fontSize: '56px',
      }
    );

    // 圖示
    const icon = visitHintTextNode.addImage(AdornmentString.visitHintIcon, 0, this.visitHintIconPositionY);

    // icon及用戶名一起置中
    // 總寬度 = icon寬度+空隔+名字寬度
    const totalWidth = icon.width + this.visitHintIconGapX + visitUserName.width;
    // icon位置
    icon.x = (-1 * totalWidth) / 2 + icon.width / 2;
    // 用戶名位置
    visitUserName.x = totalWidth / 2 - visitUserName.width / 2;

    // 重置動畫
    visitHintNode.alpha = 1;
    // 移到左方
    visitHintTextNode.x = -1 * visitHintTextNode.width;

    // 文字向右滑到中間
    const slideInTween = this.scene.tweens.add({
      targets: visitHintTextNode,
      duration: this.visitHintAnimatSlideSec * 1000,
      x: 0, // 移到中間目的座標
    });
    // 等待播放結束
    await AsyncHelper.pendingUntil(() => slideInTween.totalProgress === 1);

    // 在中間等待幾秒
    await AsyncHelper.sleep(this.visitHintAnimatStaySec);

    // 防呆(離開phaser後會報錯)
    if (this.scene == null) {
      return;
    }

    // 全部淡出
    this.scene.tweens.add({
      targets: visitHintNode,
      duration: this.visitHintAnimatSlideSec * 1000,
      alpha: 0,
    });

    // 文字從中間向右滑出
    this.scene.tweens.add({
      targets: visitHintTextNode,
      duration: this.visitHintAnimatSlideSec * 1000,
      x: visitHintTextNode.width, // 移到右方目的座標
    });

    // 拜訪模式的按鈕, 設置互動參教-可點擊
    this.classmateBtn.setInteractive({ useHandCursor: true });
    this.selfRoomBtn.setInteractive({ useHandCursor: true });
  }

  /** 切換佈置模式
   * @param isEdit 是佈置模式
   */
  public switchEditMode(isEdit: boolean): void {
    // 顯示/隱藏自己的房間的按鈕(佈置模式/商店/背包/同學)
    this.leftBtnFrame.alpha = isEdit ? 0 : 1;
    this.editModebtn.alpha = this.leftBtnFrame.alpha;

    this.rightBtnFrame.alpha = isEdit ? 0 : 1;
    this.storeBtn.alpha = this.rightBtnFrame.alpha;
    this.backpackBtn.alpha = this.rightBtnFrame.alpha;
    this.classmateBtn.alpha = this.rightBtnFrame.alpha;
  }

  /** 設定發亮閃爍圖片 */
  public setTearDownLightImage(adornmentComponent: AdornmentComponent, isEdit: boolean): void {
    // 播放發亮閃爍tween
    if (isEdit) {
      // 顯示發亮圖片
      adornmentComponent.setLightImage(this.tearDownLightImage);

      // 播放tween (淡入/淡出，重覆/往返)
      this.tearDownLightImage.alpha = 0;
      this.tearFlashTween = this.scene.tweens.add({
        targets: this.tearDownLightImage,
        ease: 'easeInOutSine',
        duration: 1000,
        alpha: 1,
        loop: -1,
        yoyo: true,
      });
    }
    // 暫停tween
    else {
      this.tearDownLightImage.alpha = 0;
      this.tearFlashTween.remove();
    }
  }
}
