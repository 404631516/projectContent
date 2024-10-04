import { BossItemData, MatchingCardSettingData } from '@/manager/TableManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import EnergyBar from '@/views/H5/Scripts/Components/UI/EnergyBar';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import PopUpHintLayout from '@/views/H5/Scripts/Components/UI/PopUpHintLayout';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import WaveLayout from '@/views/H5/Scripts/Components/UI/WaveLayout';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { Tweens } from 'phaser';
import UIDialog from '../../../Scripts/Components/UIDialog';
import { AvoidNotMatchPenaltyLayout, FlipSpeedUpLayout } from '../Component/MatchingCardRemainHintLayout';
import {
  MatchingCardAudioType,
  MatchingCardNumber,
  MatchingCardObstructType,
  MatchingCardString,
} from '../Data/MatchingCardConfig';
import MatchingCardGameScene from '../Scenes/MatchingCardGameScene';

type Vector2 = Phaser.Math.Vector2;
type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 翻翻牌 小遊戲-主UI */
export default class MatchingCardGuiDialog extends UIDialog {
  /** 翻翻牌遊戲場景 */
  public declare scene: MatchingCardGameScene;

  //#region data
  /** 波次顯示 */
  private waveLayout!: WaveLayout;
  /** 能量條 */
  private energyBar!: EnergyBar;
  /** 目標顯示 */
  private targetLayout!: ScoreLayout;

  /** 英雄圖片 */
  private heroImage!: Phaser.GameObjects.Image;
  /** 英雄受擊圖片 */
  private heroDamageImage!: Phaser.GameObjects.Image;

  /** 敵人動畫圖 */
  private enemyImage!: Phaser.GameObjects.Image;
  /** 敵人原始位置 (敵人移入動畫-起點位置) */
  private enemyOriginPosition: Vector2 = new Phaser.Math.Vector2(0, 0);

  /** 敵人對話節點 */
  private enemyTalkNode!: Object2D;
  /** 敵人對話 */
  private enemyTalkContent!: Phaser.GameObjects.Text;
  /** 敵人發射物件圖片(因為要帶重力，故用物理圖片) */
  private enemyLaunchObjectImage!: Phaser.Physics.Arcade.Image;

  /** 敵人凍結節點 */
  private frozenEnemyNode!: Object2D;
  /** 敵人凍結剩餘秒數節點 */
  private frozenEnemyRemainNode!: Object2D;
  /** 敵人凍結剩餘秒數 */
  private frozenEnemyRemainSec!: Phaser.GameObjects.Text;
  /** 敵人凍結動畫的計時器 */
  private frozenEnemyTimeEvent?: Phaser.Time.TimerEvent;

  /** 避免配對失敗處罰-剩餘數量顯示元件 */
  private avoidNotMatchPenaltyLayout!: AvoidNotMatchPenaltyLayout;
  /** 翻牌加速-剩餘數量顯示元件 */
  private flipSpeedUpLayout!: FlipSpeedUpLayout;
  /** 上浮圖示及文字提示-上方題示 */
  private topTextPopUpHintLayout!: PopUpHintLayout;
  private topIconPopUpHintLayout!: PopUpHintLayout;
  /** 上方題示-滑出目標位置 */
  private readonly topHintSlideTargetX: number = 0;

  /** 敵人攻擊TweenChain動畫 */
  private enemyAttackTweenChain?: Tweens.TweenChain;
  /** 敵人攻擊玩家動畫的等待佇列 */
  private enemyAttackAnimationList: MatchingCardObstructType[] = [];
  /** 正在播放敵人攻擊動畫 */
  private isEnemyAttackAnimationPlaying = false;

  /** 放飛敵人TweenChain動畫 */
  private exileEnemyTweenChain?: Tweens.TweenChain;
  //#endregion data

  //#region readonly
  /** 波次顯示元件 */
  private readonly waveLayoutPosition: Vector2 = new Phaser.Math.Vector2(this.centerX, 90);

  /** 能量條位置 */
  private readonly energyBarPosition: Vector2 = new Phaser.Math.Vector2(240, 490);
  /** 能量條縮放 */
  private readonly energyBarScale: number = 0.7;
  /** 目標元件位置 */
  private readonly targetLayoutPosition: Vector2 = new Phaser.Math.Vector2(this.width - 75, 30);
  /** 目標圖示大小 */
  private readonly targetIconSize: number = 46;

  /** 倒數計時 */
  private readonly countDownTime: number = 3;
  /** 遊戲準備提示文字 */
  private readonly readyTextKey: string = 'ready';
  private readonly startTextKey: string = 'start';
  /** 遊戲準備提示文字樣式 */
  private readonly readyTextStyle: TextStyle = { fontSize: '96px', color: UIHelper.yellowString };

  /** 敵人(boss)圖大小(含透明區的全身圖，EX:boss_1.png) */
  private readonly enemySpriteSize: number = 512;

  /** 敵人移入動畫-偏移位置 */
  private readonly enemyMoveInOffsetPos: Vector2 = new Phaser.Math.Vector2(-34, 0);

  /** 敵人旋轉動畫開始角度 */
  private readonly enemyRotateStartAngle: number = 0;
  /** 敵人旋轉動畫結束角度 */
  private readonly enemyRotateEndAngle: number = -20;

  /** 放飛敵人時，移入動畫時間 */
  private readonly exileEnemyMoveDuration: number = 300;
  /** 放飛敵人時，丟出敵人動畫終點位置 */
  private readonly throwEnemyEndPos: Vector2 = new Phaser.Math.Vector2(600, -200);
  /** 放飛敵人時，丟出敵人移動時間 */
  private readonly throwEnemyMoveDuration: number = 800;
  /** 放飛敵人時，丟出敵人動畫結束角度 */
  private readonly throwEnemyEndAngle: number = 720;
  /** 放飛敵人時，丟出敵人旋轉時間 */
  private readonly throwEnemyRotateDuration: number = 1200;

  /** 敵人對話框-偏移位置 */
  private readonly enemyTalkFrameOffset: Vector2 = new Phaser.Math.Vector2(-58, -146);
  /** 敵人對話框 旋轉角度 */
  private readonly enemyTalkFrameAngle: number = 0;
  /** 敵人對話內容 位置 */
  private readonly enemyTalkContentPosition: Vector2 = new Phaser.Math.Vector2(3, -7);
  /** 敵人對話內容-文字大小 */
  private readonly enemyTalkContentFontSize: string = '24px';
  /** 敵人對話內容-文字色 */
  private readonly enemyTalkContentColor: string = UIHelper.blackString;

  /** 敵人攻擊時，移入動畫時間 */
  private readonly enemyAttackMoveDuration: number = 180;
  /** 敵人發射物件縮放比率 */
  private readonly enemyLaunchObjectScale: number = 0.5;
  /** 敵人發射物件起點位置 */
  private readonly enemyLaunchObjectStartPos: Vector2 = new Phaser.Math.Vector2(this.width - 100, 400);
  /** 敵人發射物件終點位置 */
  private readonly enemyLaunchObjectEndPos: Vector2 = new Phaser.Math.Vector2(130, 550);
  /** 敵人發射物件移動距離 = 終點位置 - 起點位置 */
  private readonly enemyLaunchObjectDistance: Vector2 = new Phaser.Math.Vector2(
    this.enemyLaunchObjectEndPos.x - this.enemyLaunchObjectStartPos.x,
    this.enemyLaunchObjectEndPos.y - this.enemyLaunchObjectStartPos.y
  );
  /** 敵人發射物件 x速度(像素/秒) */
  private readonly enemyLaunchObjectVelocityX = -600;
  /** 敵人發射物件 移動秒數 = x距離 / x速度 */
  private readonly enemyLaunchObjectSec: number = this.enemyLaunchObjectDistance.x / this.enemyLaunchObjectVelocityX;
  /** 敵人發射物件 y速度(像素/秒) = (y距離 - 重力需要表演的距離) / 移動秒數 */
  private readonly enemyLaunchObjectVelocityY: number =
    (this.enemyLaunchObjectDistance.y - MatchingCardNumber.Gravity) / this.enemyLaunchObjectSec;

  /** 英雄受擊發亮圖 顏色 */
  private readonly heroDamageLightImageColor: number = 0xff4c76;
  /** 英雄受擊發亮圖 閃爍時間 */
  private readonly heroDamageLightImageDuration: number = 200;

  /** 避免配對失敗處罰-額度顯示元件 位置 */
  private readonly avoidNotMatchPenaltyLayoutPosition: Vector2 = new Phaser.Math.Vector2(0, 89);
  /** 翻牌加速-顯示元件 位置 */
  private readonly flipSpeedUpLayoutPosition: Vector2 = new Phaser.Math.Vector2(0, 145);
  /** 上方提示位置 */
  private readonly topHintPopupPosition: Vector2 = new Phaser.Math.Vector2(this.centerX, 90);
  /** 上方提示圖示大小 */
  private readonly topHintIconSize: number = 71;

  /** 敵人凍結節點 位置 */
  private readonly frozenEnemyNodePosition: Vector2 = new Phaser.Math.Vector2(973.5, 429.5);
  /** 敵人凍結剩餘秒數節點 位置 */
  private readonly frozenEnemyRemainNodePosition: Vector2 = new Phaser.Math.Vector2(-59.4, -102.2);
  /** 敵人凍結剩餘秒數 文字大小 */
  private readonly frozenEnemyRemainSecFontSize: string = '15px';
  /** 敵人凍結剩餘秒數 文字色 */
  private readonly frozenEnemyRemainColor: string = UIHelper.whiteString;

  /** 靜音按鈕 位置 */
  private readonly muteIconPosition: Vector2 = new Phaser.Math.Vector2(953.5, 476);
  //#endregion readonly

  //#region getter
  /** 取得敵人移入目標位置 */
  private get enemyMoveInTargetPosition(): Vector2 {
    return new Phaser.Math.Vector2(
      this.enemyOriginPosition.x + this.enemyMoveInOffsetPos.x,
      this.enemyOriginPosition.y + this.enemyMoveInOffsetPos.y
    );
  }
  /** 取得敵人對話位置 */
  private get enemyTalkNodePosition(): Vector2 {
    return new Phaser.Math.Vector2(
      this.enemyMoveInTargetPosition.x + this.enemyTalkFrameOffset.x,
      this.enemyMoveInTargetPosition.y + this.enemyTalkFrameOffset.y
    );
  }
  //#endregion getter

  protected setUI(): void {
    // 設定波次元件
    this.waveLayout = this.addObject(this.waveLayoutPosition.x, this.waveLayoutPosition.y, WaveLayout);

    // 加入英雄圖片
    this.heroImage = this.addImage('', 0, 0);
    // 縮放
    this.heroImage.scale = MatchingCardNumber.HeroSpriteScale;
    // 翻轉面向右(全身圖是朝左)
    this.heroImage.flipX = true;

    // 英雄受擊圖片
    this.heroDamageImage = this.addImage(MatchingCardString.HeroImageKey, 0, 0);
    // 縮放和物品圖相同
    this.heroDamageImage.setScale(this.heroImage.scale);
    // 左右翻轉
    this.heroDamageImage.flipX = this.heroImage.flipX;
    // 設定alpha>0的像素的顏色，使英雄圖變成剪影
    this.heroDamageImage.setTintFill(this.heroDamageLightImageColor);
    // 隱藏受擊圖
    this.heroDamageImage.alpha = 0;

    // 能量條
    this.energyBar = this.addObject(this.energyBarPosition.x, this.energyBarPosition.y, EnergyBar);
    // 縮放
    this.energyBar.scale = this.energyBarScale;

    // 設置目標元件
    this.targetLayout = this.addObject(
      this.targetLayoutPosition.x,
      this.targetLayoutPosition.y,
      ScoreLayout,
      MatchingCardString.CardBackIcon, // 圖示
      this.targetIconSize, // 圖示尺寸
      '' // 無標題
    );

    // 設置敵人ui
    this.setEnemyUI();

    // 建立敵人凍結ui
    this.initFrozenEnemyUI();

    // 設置layout顯示元件
    this.setLayoutComponent();

    // 設置音訊開關按鈕
    this.addImage('', this.muteIconPosition.x, this.muteIconPosition.y, '', MuteIcon);
  }

  update(time: number, delta: number): void {
    // 佇列播放敵人攻擊動畫
    this.dequeueEnemyAttackAnimation();
  }

  /** 初始化
   * @param gameSetting 遊戲參數
   */
  public init(gameSetting: MatchingCardSettingData, heroPosition: Vector2): void {
    // 初始能量
    this.updateEnergyBar(gameSetting.maxEnergyAmount, gameSetting.maxEnergyAmount);
    // 更新目標顯示
    this.updateTargetCount(0, gameSetting.targetMatchCount);

    // 設定英雄圖片
    this.heroImage.setTexture(MatchingCardString.HeroImageKey);
    // 英雄位置
    this.heroImage.x = heroPosition.x;
    this.heroImage.y = heroPosition.y;
    // 英雄受擊圖片位置
    this.heroDamageImage.x = this.heroImage.x;
    this.heroDamageImage.y = this.heroImage.y;

    // 顯示 避免配對失敗處罰 額度
    this.showAvoidNotMatchPenaltyQuota(gameSetting.avoidNotMatchPenaltyQuota);
  }

  /** 設置敵人ui */
  private setEnemyUI(): void {
    // 加入敵人動畫圖
    this.enemyImage = this.addImage('', 0, 0);
    this.enemyImage.visible = false;

    // 敵人對話節點
    this.enemyTalkNode = this.addObject(0, 0);
    // 傾斜
    this.enemyTalkNode.angle = this.enemyTalkFrameAngle;
    // 底框
    this.enemyTalkNode.addImage(MatchingCardString.EnemyTalkFrame, 0, 0);
    // 敵人對話內容
    this.enemyTalkContent = this.enemyTalkNode.addText(
      '',
      this.enemyTalkContentPosition.x,
      this.enemyTalkContentPosition.y,
      {
        color: this.enemyTalkContentColor,
        fontSize: this.enemyTalkContentFontSize,
        strokeThickness: 0,
      }
    );

    // 敵人發射物件圖片
    this.enemyLaunchObjectImage = this.addPhysicsImage(MatchingCardString.EnemyLaunchObjectImage, 0, 0);
    // 縮小
    this.enemyLaunchObjectImage.scale = this.enemyLaunchObjectScale;
    // 設定y重力
    this.enemyLaunchObjectImage.setGravityY(MatchingCardNumber.Gravity);

    // 隱藏/停止 敵人攻擊物件
    this.showEnemyAttackObject(false);
  }

  /** 建立敵人凍結ui */
  private initFrozenEnemyUI(): void {
    // 建立敵人凍結節點
    this.frozenEnemyNode = this.addObject(this.frozenEnemyNodePosition.x, this.frozenEnemyNodePosition.y);
    this.frozenEnemyNode.visible = false;
    // 建立敵人凍結圖
    this.frozenEnemyNode.addImage(MatchingCardString.FrozenEnemyImage, 0, 0);

    // 建立敵人凍結剩餘秒數節點
    this.frozenEnemyRemainNode = this.frozenEnemyNode.addObject(
      this.frozenEnemyRemainNodePosition.x,
      this.frozenEnemyRemainNodePosition.y
    );
    // 建立敵人凍結剩餘秒數BG
    this.frozenEnemyRemainNode.addImage(MatchingCardString.FrozenEnemyRemainBg, 0, 0);
    // 建立敵人凍結剩餘秒數
    this.frozenEnemyRemainSec = this.frozenEnemyRemainNode.addText('', 0, 0, {
      color: this.frozenEnemyRemainColor,
      fontSize: this.frozenEnemyRemainSecFontSize,
      strokeThickness: 0,
    });
  }

  /** 設置 layout顯示元件 */
  private setLayoutComponent(): void {
    // 避免配對失敗處罰
    this.avoidNotMatchPenaltyLayout = this.addObject(
      this.avoidNotMatchPenaltyLayoutPosition.x,
      this.avoidNotMatchPenaltyLayoutPosition.y,
      AvoidNotMatchPenaltyLayout
    );
    // 文字: 無消耗翻牌，剩n次
    this.avoidNotMatchPenaltyLayout.setUI(
      MatchingCardString.LeftHintAvoidNotMatchPenaltyBG,
      MatchingCardString.CardBackIcon,
      MatchingCardNumber.RemainLayoutIconSize,
      'matchingCard_avoidNotMatchPenalty_Title',
      false,
      'remain',
      'times'
    );

    // 翻牌加速
    this.flipSpeedUpLayout = this.addObject(
      this.flipSpeedUpLayoutPosition.x,
      this.flipSpeedUpLayoutPosition.y,
      FlipSpeedUpLayout
    );
    // 隱藏
    this.flipSpeedUpLayout.visible = false;
    // 文字: 速戰速決，剩n秒
    this.flipSpeedUpLayout.setUI(
      MatchingCardString.LeftHintFlipSpeedUpBG,
      MatchingCardString.FlipSpeedUpIcon,
      MatchingCardNumber.RemainLayoutIconSize,
      'matchingCard_flipSpeedUp_Title',
      true,
      'remain',
      'second'
    );

    // 建立 上浮圖示及文字提示
    this.topTextPopUpHintLayout = this.addObject(
      this.topHintPopupPosition.x,
      this.topHintPopupPosition.y,
      PopUpHintLayout
    );
    this.topIconPopUpHintLayout = this.addObject(
      this.topHintPopupPosition.x,
      this.topHintPopupPosition.y,
      PopUpHintLayout,
      MatchingCardString.FlipSpeedUpIcon, // 圖示key
      this.topHintIconSize // 圖示尺寸
    );
  }

  /** 顯示遊戲開始動畫 */
  public async showOpeningGameText(): Promise<void> {
    const sound = this.scene.sound.add(BaseSceneString.CountDownSound);
    sound.play('', { delay: 1 });
    await AnimationHelper.playOpeningCountDown(
      this,
      this.countDownTime,
      this.readyTextKey,
      this.startTextKey,
      this.readyTextStyle,
      -this.x,
      -this.y
    );
  }

  /** 顯示波數
   * @param wave 波數
   */
  public async showWavePrompt(wave: number): Promise<void> {
    await this.waveLayout.showWavePrompt(wave, this.scene.gameSetting.initViewSecond);
  }

  /** 更新魔力條 */
  public updateEnergyBar(currentEnergy: number, maximumEnergy: number): void {
    this.energyBar.updateEnergy(currentEnergy, maximumEnergy);
  }

  /** 更新目標顯示
   * @param current 現在數值
   * @param target 目標數值
   */
  public updateTargetCount(current: number, target: number) {
    this.targetLayout.setScoreText(`${current} / ${target}`);
  }

  /** 設定敵人
   * @param bossData 魔王表
   */
  public setEnemy(bossData: BossItemData): void {
    // 取消放飛敵人動畫
    if (this.exileEnemyTweenChain) {
      this.exileEnemyTweenChain.stop();
      this.exileEnemyTweenChain = undefined;
    }
    // 取消敵人凍結動畫
    this.cancelFrozenEnemyAnimation();

    // 換圖
    this.enemyImage.setTexture(bossData.bossNameKey);
    // 顯示敵人
    this.enemyImage.visible = true;
    // 縮放
    this.enemyImage.scale = bossData.matchingCardScale;

    // 偏移量 = 大小 / 2 * 縮放
    const offsetDistance = (this.enemySpriteSize / 2) * this.enemyImage.scale;
    // 計算敵人位置
    this.enemyOriginPosition.x = bossData.matchingCardLeft + offsetDistance;
    this.enemyOriginPosition.y = bossData.matchingCardTop + offsetDistance;
    // 位置
    this.enemyImage.x = this.enemyOriginPosition.x;
    this.enemyImage.y = this.enemyOriginPosition.y;

    // 角度
    this.enemyImage.angle = this.enemyRotateStartAngle;

    // 修改對話位置
    this.enemyTalkNode.x = this.enemyTalkNodePosition.x;
    this.enemyTalkNode.y = this.enemyTalkNodePosition.y;
  }

  /** 加入敵人攻擊動畫佇列
   * @param obstructType 卡片干擾方式
   */
  public enqueueEnemyAttackAnimation(obstructType: MatchingCardObstructType): void {
    this.enemyAttackAnimationList.push(obstructType);
  }

  /** 播放佇列中敵人攻擊動畫 */
  private dequeueEnemyAttackAnimation(): void {
    // 若未播放
    if (this.isEnemyAttackAnimationPlaying === false) {
      // 若有等待中動畫，播放排隊中的第一個動畫, 並刪除
      const obstructType = this.enemyAttackAnimationList.pop();
      if (obstructType) {
        this.playEnemyAttackAnimation(obstructType);
      }
    }
  }

  /** 播放敵人攻擊動畫
   * @param obstructType 卡片干擾方式
   */
  private playEnemyAttackAnimation(obstructType: MatchingCardObstructType): void {
    // 記錄播放中
    this.isEnemyAttackAnimationPlaying = true;

    // 敵人對話
    this.enemyTalkContent.text = Localization.getText(
      LocalKeyType.Common,
      `${MatchingCardString.EnemyTalkContentKey}${MatchingCardObstructType[obstructType]}`
    );

    // 建立敵人攻擊TweenChain動畫
    this.enemyAttackTweenChain = this.scene.tweens.chain({
      tweens: [
        // 敵人 左移/左轉20度
        {
          targets: this.enemyImage,
          // tween持續: 移入時間
          duration: this.enemyAttackMoveDuration,
          x: this.enemyMoveInTargetPosition.x,
          y: this.enemyMoveInTargetPosition.y,
          angle: this.enemyRotateEndAngle,
          // 移入結束時
          onComplete: async () => {
            // 敵人攻擊發射物件音效
            this.scene.playAudio(MatchingCardAudioType.EnemyLaunchObjectSound);

            // 敵人發射物件圖片動畫
            // 開始位置
            this.enemyLaunchObjectImage.setPosition(this.enemyLaunchObjectStartPos.x, this.enemyLaunchObjectStartPos.y);
            // 設定速度
            this.enemyLaunchObjectImage.setVelocity(this.enemyLaunchObjectVelocityX, this.enemyLaunchObjectVelocityY);

            // 顯示/啟用 敵人攻擊物件
            this.showEnemyAttackObject(true);
          },
        },
        // 將 英雄受擊圖片 淡入/淡出
        {
          targets: this.heroDamageImage,
          // 等待 物件到達英雄位置時間 才播tween
          delay: this.enemyLaunchObjectSec * 1000,
          // tween持續: 閃爍時間
          duration: this.heroDamageLightImageDuration,
          ease: Phaser.Math.Easing.Sine.InOut,
          alpha: 1,
          yoyo: true,
          // 閃爍開始時
          onStart: () => {
            // 擊中英雄時, 隱藏/停用敵人攻擊物件
            this.showEnemyAttackObject(false);
          },
        },
        // 敵人 右移/右轉20度
        {
          targets: this.enemyImage,
          // 等待 敵人移入 才播tween
          offset: this.enemyAttackMoveDuration,
          // tween持續: 移出時間
          duration: this.enemyAttackMoveDuration,
          x: this.enemyOriginPosition.x,
          y: this.enemyOriginPosition.y,
          angle: this.enemyRotateStartAngle,
          // 移出結束時
          onComplete: () => {
            // 記錄播放結束
            this.isEnemyAttackAnimationPlaying = false;
          },
        },
      ],
    });
  }

  /** 顯示/啟用敵人攻擊物件
   * @param isShow true:顯示/啟用
   */
  private showEnemyAttackObject(isShow: boolean): void {
    // 顯示 對話
    this.enemyTalkNode.visible = isShow;
    // 顯示/啟用 敵人發射物件
    this.enemyLaunchObjectImage.visible = isShow;
    this.enemyLaunchObjectImage.active = isShow;
  }

  /** 取消敵人攻擊動畫 */
  private cancelEnemyAttackAnimation(): void {
    // 清除 敵人攻擊玩家動畫的等待佇列
    this.enemyAttackAnimationList = [];
    // 暫停敵人攻擊動畫
    if (this.enemyAttackTweenChain) {
      this.enemyAttackTweenChain.stop();
      this.enemyAttackTweenChain = undefined;
    }
    // 記錄播放結束
    this.isEnemyAttackAnimationPlaying = false;

    // 回復敵人位置
    this.enemyImage.x = this.enemyOriginPosition.x;
    this.enemyImage.y = this.enemyOriginPosition.y;
    // 回復敵人角度
    this.enemyImage.angle = this.enemyRotateStartAngle;

    // 隱藏/停用敵人攻擊物件
    this.showEnemyAttackObject(false);
  }

  /** 播放敵人凍結動畫
   * @param durationSec 持續秒數
   */
  public playFrozenEnemyAnimation(durationSec: number): void {
    // 回復播放敵人攻擊動畫
    this.cancelEnemyAttackAnimation();

    // 顯示 敵人凍結UI
    this.frozenEnemyNode.visible = true;

    // 建立計時器，每隔1秒，刷新一次剩餘秒數
    let remainSec = durationSec;
    this.frozenEnemyTimeEvent = this.scene.time.addEvent({
      // 從1秒開始計時，會更新起始剩餘秒數
      startAt: 1000,
      /** 每隔1秒 */
      delay: 1000,
      // 計時器定期觸發要執行內容
      callback: () => {
        // 最後一次觸發要執行內容
        if (remainSec <= 0) {
          // 播敵人解凍音效
          this.scene.playAudio(MatchingCardAudioType.UnfreezeEnemySound);
          // 取消敵人凍結動畫
          this.cancelFrozenEnemyAnimation();
        } else {
          // 將剩餘秒數(無條件進位)後, 組成字串顯示(分分:秒秒)
          const ceilSec = Math.ceil(remainSec);

          // 將總秒數，轉為分:秒的文字，並在不足位數補上0。再更新剩餘秒數
          this.frozenEnemyRemainSec.text = UIHelper.toMinuteSecondText(ceilSec);

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

  /** 取消敵人凍結動畫 */
  private cancelFrozenEnemyAnimation(): void {
    // 防呆
    if (this.frozenEnemyTimeEvent == null) {
      return;
    }

    // 隱藏 敵人凍結UI
    this.frozenEnemyNode.visible = false;
    // 刪除計時器
    this.scene.time.removeEvent(this.frozenEnemyTimeEvent);
  }

  /** 播放放飛敵人動畫 */
  public playExileEnemyAnimation(): void {
    // 回復播放敵人攻擊動畫
    this.cancelEnemyAttackAnimation();

    // 建立放飛敵人TweenChain動畫
    this.exileEnemyTweenChain = this.scene.tweens.chain({
      tweens: [
        // 先移入敵人(左移/左轉)
        {
          targets: this.enemyImage,
          duration: this.exileEnemyMoveDuration,
          x: this.enemyMoveInTargetPosition.x,
          y: this.enemyMoveInTargetPosition.y,
          angle: this.enemyRotateEndAngle,
          onComplete: () => {
            // 放飛敵人的丟敵人音效
            this.scene.playAudio(MatchingCardAudioType.ExileThrowEnemySound);
          },
        },
        // 接著把敵人向左上移動並旋轉
        // 敵人 右轉一圈
        {
          // 移入後同時播放
          offset: this.exileEnemyMoveDuration,
          targets: this.enemyImage,
          duration: this.throwEnemyRotateDuration,
          angle: this.throwEnemyEndAngle,
        },
        // 敵人 左移/上移
        {
          // 移入後同時播放
          offset: this.exileEnemyMoveDuration,
          targets: this.enemyImage,
          duration: this.throwEnemyMoveDuration,
          x: this.throwEnemyEndPos.x,
          y: this.throwEnemyEndPos.y,
        },
      ],
    });
  }

  /** 顯示 避免配對失敗處罰額度
   * @param quota 額度
   */
  public showAvoidNotMatchPenaltyQuota(quota: number): void {
    this.avoidNotMatchPenaltyLayout.setAmountText(`${quota}`);
  }

  /** 播放翻牌加速動畫
   * @param durationSec 持續秒數
   */
  public showFlipSpeedUp(durationSec: number): void {
    // 顯示
    this.flipSpeedUpLayout.visible = true;

    // 建立計時器，每隔1秒，刷新一次剩餘秒數
    let remainSec = durationSec;
    const timeEvent = this.scene.time.addEvent({
      // 從1秒開始計時，會更新起始剩餘秒數
      startAt: 1000,
      /** 每隔1秒 */
      delay: 1000,
      // 計時器定期觸發要執行內容
      callback: () => {
        // 最後一次觸發要執行內容
        if (remainSec <= 0) {
          // 隱藏 翻牌加速秒數
          this.flipSpeedUpLayout.visible = false;
          // 刪除計時器
          this.scene.time.removeEvent(timeEvent);
        } else {
          // 顯示 翻牌加速秒數(無條件進位)
          this.flipSpeedUpLayout.setAmountText(`${remainSec}`);
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

  /** 播放文字上方提示
   * @param hintTextKey 提示字key
   */
  public playTopTextPopUpHintLayout(hintTextKey: string): void {
    // 播放滑出Tween
    this.topTextPopUpHintLayout.playSlideTween(hintTextKey, this.topHintSlideTargetX);
  }
  /** 播放圖示+文字上方提示
   * @param hintTextKey 提示字key
   */
  public playTopIconPopUpHintLayout(hintTextKey: string): void {
    // 播放滑出Tween
    this.topIconPopUpHintLayout.playSlideTween(hintTextKey, this.topHintSlideTargetX);
  }
}
