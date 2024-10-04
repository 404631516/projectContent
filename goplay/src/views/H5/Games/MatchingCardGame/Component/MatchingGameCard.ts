import { MatchingCardObstructData } from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { Align } from '@/views/H5/Helper/MathHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import HorizontalLayout from '@/views/H5/Scripts/Components/HorizontalLayout';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { Scene } from 'phaser';
import {
  MatchingCardAudioType,
  MatchingCardNumber,
  MatchingCardObstructType,
  MatchingCardState,
  MatchingCardString,
} from '../Data/MatchingCardConfig';
import MatchingCardGameScene from '../Scenes/MatchingCardGameScene';
import { MatchingCardBuff } from './MatchingCardBuff';

type Vector2 = Phaser.Math.Vector2;

/** 翻翻牌-卡片 */
export default class MatchingGameCard extends Object2D {
  /** 翻翻牌遊戲場景 */
  public declare scene: MatchingCardGameScene;

  //#region readonly
  /** 干擾物節點 位置 */
  private readonly obstacleNodePosition: Vector2 = new Phaser.Math.Vector2(-1, -13);
  /** 上鎖點擊字圖 位置 */
  private readonly lockTouchImagePosition: Vector2 = new Phaser.Math.Vector2(0.5, 47);

  /** 干擾物剩餘秒數 位置 */
  private readonly obstacleRemainPosition: Vector2 = new Phaser.Math.Vector2(9.5, -1.5);
  /** 干擾物剩餘秒數-文字大小 */
  private readonly obstacleRemainFontSize: string = '28px';
  /** 干擾物剩餘秒數-文字色 */
  private readonly obstacleRemainColor: string = UIHelper.whiteString;

  /** 解鎖動畫-上鎖圖淡出 秒數 */
  private readonly lockImageFadeOutSec: number = 0.5;
  /** 解鎖動畫-上鎖圖放大比率 */
  private readonly lockImageScaleRate: number = 1.5;

  /** 瞄牌節點 位置 */
  private readonly seeThroughNodePosition: Vector2 = new Phaser.Math.Vector2(-0.5, 57);
  /** 瞄牌背景-填滿顏色 */
  private readonly seeThroughLayoutFillColor: number = 0x302d58;
  /** 瞄牌背景-填滿半徑 */
  private readonly seeThroughLayoutFillRadius: number = 10;
  /** 瞄牌背景-填滿透明度 */
  private readonly seeThroughLayoutFillAlpha: number = 0.8;
  /** 瞄牌背景-左右邊界間距 */
  private readonly seeThroughLayoutPaddingX: number = 10;
  /** 瞄牌剩餘秒數-文字大小 */
  private readonly seeThroughFontSize: string = '12px';
  /** 瞄牌剩餘秒數-文字色 */
  private readonly seeThroughTextColor: string = UIHelper.whiteString;

  /** 卡牌配對成功動畫: 卡牌-淡出秒數 */
  private readonly cardMatchCardFadeOutSec: number = 0.6;
  /** 配對成功字圖 位置 */
  private readonly cardMatchImagePosition: Vector2 = new Phaser.Math.Vector2(-0.5, -43);
  /** 配對成功字圖 上移位置 */
  private readonly cardMatchImageMoveUpY: number = -49;
  /** 配對成功字圖 淡入秒數 */
  private readonly cardMatchImageFadeInSec: number = this.cardMatchCardFadeOutSec;
  /** 配對成功字圖 縮放秒數 */
  private readonly cardMatchImageScaleSec: number = this.cardMatchCardFadeOutSec / 2;
  /** 配對成功字圖 放大比率 */
  private readonly cardMatchImageScaleRate: number = 1.2;
  //#endregion readonly

  //#region data
  /** 內容物圖片 */
  private contentImage!: Phaser.GameObjects.Image;
  /** 卡背圖片 */
  private backImage!: Phaser.GameObjects.Image;

  /** 干擾物-節點 */
  private obstacleNode!: Object2D;
  /** 上鎖圖片 */
  private lockImage!: Phaser.GameObjects.Image;
  /** 干擾物剩餘秒數 */
  private obstacleRemainSec!: Phaser.GameObjects.Text;

  /** 卡牌-配對成功字圖 */
  private cardMatchImage!: Phaser.GameObjects.Image;

  /** 瞄牌節點 */
  private seeThroughNode!: Object2D;
  /** 瞄牌剩餘秒數 */
  private seeThroughRemainSec!: Phaser.GameObjects.Text;
  /** 瞄牌動畫的計時器 */
  private seeThroughTimeEvent?: Phaser.Time.TimerEvent;

  /** 干擾類型 */
  private _obstructType: MatchingCardObstructType = MatchingCardObstructType.None;
  public get obstructType(): MatchingCardObstructType {
    return this._obstructType;
  }

  /** 干擾物負面狀態 */
  private obstacleDeBuff: MatchingCardBuff = new MatchingCardBuff();

  /** 取得內容物圖片key */
  public get contentImageKey(): string {
    return this.contentImage.texture.key;
  }

  /** 開啟中 */
  public get isOpen(): boolean {
    // 卡背的圖在翻牌中，或是瞄牌中
    return this.backImage.alpha !== MatchingCardState.Close;
  }

  /** 取得卡牌位置 */
  public get cardPosition(): Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y);
  }
  //#endregion data

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    // 新建內容物圖片
    this.contentImage = this.addImage('', 0, 0);

    // 建立卡背圖片
    this.initBackImage();

    // 建立瞄牌ui
    this.initSeeThroughUI();

    // 建立干擾物ui
    this.initObstacleUI();

    // 建立卡牌-配對成功字圖
    this.cardMatchImage = this.addImage(
      MatchingCardString.CardMatchImage,
      this.cardMatchImagePosition.x,
      this.cardMatchImagePosition.y
    );
  }

  /** 建立卡背圖片 */
  private initBackImage(): void {
    // 新建卡背圖片
    this.backImage = this.addImage(MatchingCardString.CardBackImage, 0, 0);
    // 卡背圖大小
    this.backImage.setDisplaySize(MatchingCardNumber.CardWidth, MatchingCardNumber.CardHeight);
    // 設置 玩家點擊卡背 event
    this.backImage.setInteractive({ useHandCursor: true });
    this.backImage.on(Phaser.Input.Events.POINTER_UP, () => {
      this.scene.onClickCardBack(this);
    });
  }

  /** 建立瞄牌ui */
  private initSeeThroughUI(): void {
    // 建立瞄牌節點
    this.seeThroughNode = this.addObject(this.seeThroughNodePosition.x, this.seeThroughNodePosition.y);
    this.seeThroughNode.visible = false;

    // 設置瞄牌背景Layout
    const seeThroughLayout = new HorizontalLayout(this.seeThroughNode);
    seeThroughLayout.setAlign(Align.Center);
    seeThroughLayout.fitElements = true;
    seeThroughLayout.setFill(
      this.seeThroughLayoutFillColor,
      this.seeThroughLayoutFillRadius,
      this.seeThroughLayoutFillAlpha
    );
    seeThroughLayout.setPadding(0, this.seeThroughLayoutPaddingX, 0, this.seeThroughLayoutPaddingX);

    // 建立瞄牌Icon
    const seeThroughIcon = this.seeThroughNode.addImage(MatchingCardString.CardSeeThroughIcon, 0, 0);

    // 建立瞄牌剩餘秒數
    this.seeThroughRemainSec = this.seeThroughNode.addText('00:00', 0, 0, {
      color: this.seeThroughTextColor,
      fontSize: this.seeThroughFontSize,
      strokeThickness: 0,
    });

    // 加入瞄牌背景Layout
    seeThroughLayout.addElements([seeThroughIcon, this.seeThroughRemainSec]);
    // 重算容器範圍及背景，排列容器內元件
    seeThroughLayout.draw();
  }

  /** 建立干擾物ui */
  private initObstacleUI(): void {
    // 干擾物節點
    this.obstacleNode = this.addObject(this.obstacleNodePosition.x, this.obstacleNodePosition.y);
    this.obstacleNode.visible = false;

    // 卡牌干擾物-上鎖圖
    this.lockImage = this.obstacleNode.addImage(MatchingCardString.ObstacleLockImage, 0, 0);
    // 卡牌干擾物-上鎖點擊字圖
    this.obstacleNode.addImage(
      MatchingCardString.LockTouchImage,
      this.lockTouchImagePosition.x,
      this.lockTouchImagePosition.y
    );

    // 干擾物剩餘秒數
    this.obstacleRemainSec = this.obstacleNode.addText(
      '',
      this.obstacleRemainPosition.x,
      this.obstacleRemainPosition.y,
      {
        color: this.obstacleRemainColor,
        fontSize: this.obstacleRemainFontSize,
        strokeThickness: 0,
      }
    );
  }

  /** 更新卡片
   * @param time 時間
   * @param delta 差值(MS)
   */
  public update(time: number, delta: number): void {
    // 干擾物失效
    if (this.obstacleDeBuff.isActive === false) {
      return;
    }

    // 更新干擾物-剩餘秒數
    this.obstacleDeBuff.update(delta);

    // 干擾物啟用時
    if (this.obstacleDeBuff.isActive) {
      // 更新干擾物-剩餘秒數文字
      this.obstacleRemainSec.text = `${this.obstacleDeBuff.remainSec}`;
    } else {
      // 清除卡片干擾物
      this.removeObstacle();
    }
  }

  /** 設定卡片資料
   * @param newContentImageKey 內容物圖片key
   */
  public setInfo(newContentImageKey: string): void {
    // 顯示圖片
    this.setActive(true);
    // 顯示卡片
    this.visible = true;
    // 隱藏卡背圖片
    this.backImage.alpha = MatchingCardState.Open;

    // 更換內容物圖片
    this.contentImage.setTexture(newContentImageKey);
    // 依卡背圖片大小縮放
    this.contentImage.setScale(this.backImage.scale);

    // 隱藏干擾物圖片
    this.obstacleNode.visible = false;

    // 清除卡片干擾物
    this.removeObstacle();

    // 隱藏 配對成功字圖
    this.cardMatchImage.alpha = 0;
  }

  /** 嘗試翻開卡片 */
  public tryOpenCard(): boolean {
    // 已翻開牌
    if (this.backImage.alpha === MatchingCardState.Open) {
      return false;
    }

    // 點擊鎖定的卡牌時，不可翻牌，但會扣除鎖定持續秒數，直到解除buff
    if (this._obstructType === MatchingCardObstructType.Lock) {
      // 點擊上鎖牌，扣秒數音效
      this.scene.playAudio(MatchingCardAudioType.ClickLockCardSound);

      // 減少干擾物負面狀態秒數
      this.obstacleDeBuff.minusBuff(this.scene.gameSetting.clickCardMinusLockSecond);

      // 干擾物失效就清除
      if (this.obstacleDeBuff.isActive === false) {
        this.removeObstacle();
      }
      return false;
    }

    // 取消瞄牌動畫
    this.cancelSeeThroughAnimation();

    return true;
  }

  //#region 干擾
  /** 設定卡片干擾物
   * @param obstructData 干擾資料
   */
  public setObstacle(obstructData: MatchingCardObstructData): void {
    // 設定新狀態
    this._obstructType = obstructData.obstructType;
    // 啟用干擾物負面狀態，並記錄 持續時間
    this.obstacleDeBuff.enableBuff(obstructData.obstructDurationSec, 0);
    // 顯示干擾物
    this.obstacleNode.visible = true;

    // 依照干擾物類型設置
    switch (this._obstructType) {
      case MatchingCardObstructType.Lock:
        // 顯示上鎖
        this.obstacleNode.visible = true;
        break;

      default:
        console.error(`setObstacle: undefine. type=${this._obstructType}`);
        break;
    }
  }

  /** 清除卡片干擾物 */
  public removeObstacle(): void {
    this._obstructType = MatchingCardObstructType.None;
    this.obstacleNode.visible = false;
    this.obstacleDeBuff.clearBuff();
  }

  /** 播放自動解鎖動畫 */
  public async playUnlockAnimation(): Promise<void> {
    // 播放上鎖圖放大/淡出動畫
    this.scene.tweens.chain({
      tweens: [
        // 上鎖圖片/剩餘秒數: 放大
        {
          targets: [this.lockImage, this.obstacleRemainSec],
          duration: this.lockImageFadeOutSec * 1000,
          scale: this.lockImageScaleRate,
        },
        // 上鎖圖片/剩餘秒數/上鎖點擊提示字圖: 淡出
        {
          // 同時播放
          offset: 0,
          targets: this.obstacleNode,
          duration: this.lockImageFadeOutSec * 1000,
          alpha: 0,
        },
      ],
    });

    // 等到動畫播完
    await AsyncHelper.pendingUntil(() => this.obstacleNode.alpha === 0);

    // 回復參數
    this.lockImage.scale = 1;
    this.obstacleRemainSec.scale = 1;
    this.obstacleNode.alpha = 1;
  }
  //#endregion 干擾

  //#region animation
  /** 播放翻開卡牌動畫
   * @param isOpen true:翻開
   * @param flipCardSecond 翻牌秒數
   */
  public async playFlipAnimation(isOpen: boolean, flipCardSecond: number): Promise<void> {
    // 將卡牌縮小
    this.scaleX = 1;
    const scaleBackTween = this.scene.tweens.add({
      targets: this,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      duration: (flipCardSecond * 1000) / 2,
      scaleX: 0,
    });
    // 等待播放結束
    await AsyncHelper.pendingUntil(() => scaleBackTween.totalProgress === 1);

    if (isOpen) {
      // 隱藏卡背圖，可看見內容物圖
      this.backImage.alpha = MatchingCardState.Open;
    } else {
      // 顯示卡背圖，遮著內容物圖
      this.backImage.alpha = MatchingCardState.Close;
    }

    // 將卡牌放大
    const scaleContentTween = this.scene.tweens.add({
      targets: this,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      duration: (flipCardSecond * 1000) / 2,
      scaleX: 1,
    });
    // 等待播放結束
    await AsyncHelper.pendingUntil(() => scaleContentTween.totalProgress === 1);
  }

  /** 播放移動卡牌位置動畫
   * @param targetPosition 目標位置
   */
  public async playMoveAnimation(targetPosition: Vector2): Promise<void> {
    // 將卡牌移到目的地
    const moveTween = this.scene.tweens.add({
      targets: this,
      duration: MatchingCardNumber.ShuffleMoveCardSecond * 1000,
      x: targetPosition.x,
      y: targetPosition.y,
    });
    // 等待播放結束
    await AsyncHelper.pendingUntil(() => moveTween.totalProgress === 1);
  }

  /** 卡牌配對成功動畫 */
  public async playMatchAnimation(): Promise<void> {
    this.scene.tweens.chain({
      tweens: [
        // Match字圖: 放大 > 縮小 一次
        {
          targets: this.cardMatchImage,
          duration: this.cardMatchImageScaleSec * 1000,
          scale: this.cardMatchImageScaleRate,
          yoyo: true,
        },
        // Match字圖: 淡入/上移
        {
          // 一開始同時播放
          offset: 0,
          targets: this.cardMatchImage,
          duration: this.cardMatchImageFadeInSec * 1000,
          alpha: 1,
          y: this.cardMatchImageMoveUpY,
        },
        // 內容物卡牌: 淡出
        {
          // 一開始同時播放
          offset: 0,
          targets: this.contentImage,
          duration: this.cardMatchCardFadeOutSec * 1000,
          alpha: 0,
        },
      ],
    });

    // 等待播放結束
    await AsyncHelper.pendingUntil(() => this.contentImage.alpha === 0);

    // 隱藏卡片
    this.visible = false;
    // 顯示內容物卡牌
    this.contentImage.alpha = 1;
    // 隱藏Match字圖
    this.cardMatchImage.alpha = 0;
    // 回復Match字圖位置
    this.cardMatchImage.y = this.cardMatchImagePosition.y;
  }

  /** 播放偷偷瞄牌動畫
   * @param durationSec 持續秒數
   */
  public async playSeeThroughAnimation(durationSec: number): Promise<void> {
    // 卡背圖 變 半透明
    this.backImage.alpha = MatchingCardState.SeeThrough;

    // 防呆
    if (durationSec % 1 !== 0) {
      console.error(`playSeeThroughAnimation: durationSec must be integer. durationSec=${durationSec}`);
    }

    // 顯示瞄牌節點
    this.seeThroughNode.visible = true;

    // 建立計時器，每隔1秒，刷新一次剩餘秒數
    let remainSec = durationSec;
    this.seeThroughTimeEvent = this.scene.time.addEvent({
      // 從1秒開始計時，會更新起始剩餘秒數
      startAt: 1000,
      /** 每隔1秒 */
      delay: 1000,
      // 計時器定期觸發要執行內容
      callback: () => {
        // 最後一次觸發
        if (remainSec <= 0) {
          // 瞄牌中，回到蓋牌
          if (this.backImage.alpha === MatchingCardState.SeeThrough) {
            this.backImage.alpha = MatchingCardState.Close;
          }
          // 取消瞄牌動畫
          this.cancelSeeThroughAnimation();
        } else {
          // 將剩餘秒數(無條件進位)後, 組成字串顯示(分分:秒秒)
          const ceilSec = Math.ceil(remainSec);

          // 將總秒數，轉為分:秒的文字，並在不足位數補上0。再更新剩餘秒數
          this.seeThroughRemainSec.text = UIHelper.toMinuteSecondText(ceilSec);

          // 減少秒數
          remainSec--;
        }
      },
      // callback中this的對像
      callbackScope: this,
      /** 重複數秒 (repeat=1會執行2次, 但start要多執行一次，故不-1) */
      repeat: durationSec,
    });
  }

  /** 取消瞄牌動畫 */
  private cancelSeeThroughAnimation(): void {
    // 防呆
    if (this.seeThroughTimeEvent == null) {
      return;
    }

    // 隱藏瞄牌節點
    this.seeThroughNode.visible = false;
    // 刪除計時器
    this.scene.time.removeEvent(this.seeThroughTimeEvent);
  }
  //#endregion animation
}
