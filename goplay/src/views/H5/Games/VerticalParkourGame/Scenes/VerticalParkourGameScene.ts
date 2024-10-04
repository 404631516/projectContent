import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import VerticalParkourGuiDialog from '../Dialogs/VerticalParkourGuiDialog';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import {
  TotalProps,
  ContestPlayerData,
  VerticalParkourGameData,
  VerticalParkourGameLog,
} from '@/helper/interface/Game';
import { GameType } from '@/helper/enum/Common';
import HeroManager from '@/manager/HeroManager';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import TableManager, {
  HeroData,
  VerticalParkourItemData,
  VerticalParkourObstacleWaveData,
  VerticalParkourSettingData,
} from '@/manager/TableManager';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import VerticalParkourBackgroundDialog from '../Dialogs/VerticalParkourBackgroundDialog';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { VerticalParkourHero } from '../Components/Hero/VerticalParkourHero';
import ItemDialog from '../../UIHelper/ItemDialog';
import VerticalParkourItem from '../Components/VerticalParkourItem';
import {
  VerticalParkourDepth,
  VerticalParkourGroup,
  VerticalParkourItemFunction,
  VerticalParkourNumber,
  VerticalParkourString,
} from '../Data/VerticalParkourConfig';
import { verticalParkourImgUrl } from '../Data/VerticalParkourResource';
import { Align } from '@/views/H5/Helper/MathHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import VerticalParkourGroups from '../Components/Groups/VerticalParkourGroups';
import DefaultMap from '@/views/H5/Helper/DefaultMap';
import TimeHelper from '@/views/H5/Helper/TimeHelper';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import UIHelper from '@/views/H5/Helper/UIHelper';

export default class VerticalParkourGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  //#region 靜態表資料
  /** 遊戲設定資料 */
  private settingData: VerticalParkourSettingData;
  /** 障礙物波數資料 */
  private obstacleWaveData: VerticalParkourObstacleWaveData[];
  /** 道具資料 */
  private itemDataList: VerticalParkourItemData[];
  //#endregion

  //#region Dialog
  private backgroundDialog!: VerticalParkourBackgroundDialog;
  /** 介面Dialog : 分數、生命、道具數量 */
  private guiDialog!: VerticalParkourGuiDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<VerticalParkourItem>;
  //#endregion

  //#region variables and properties
  /** 英雄資料 */
  private heroData!: HeroData;
  /** 英雄 */
  public hero: VerticalParkourHero;

  /** 遊戲物件群組管理 */
  private groups: VerticalParkourGroups;
  /** 波次TimeEvent */
  private waveTimeEvent?: Phaser.Time.TimerEvent;

  /** 魔力數 */
  private currentEnergy: number = VerticalParkourNumber.MaxEnergy;
  /** 分數累計 */
  private scoreCount: number = 0;

  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 使用道具紀錄, key是道具ID, value是使用次數 */
  private usePropsMap: DefaultMap<number, number> = new DefaultMap(() => 0);

  /** 檢查遊戲是否結束
   * @returns true = 結束
   */
  public get isGameEnd(): boolean {
    return this.currentEnergy <= 0 || this.isTimeOut;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    // 魔力值小於續命標準 或 已抵達過地圖正中間點 或 到續命時間
    return this.currentEnergy <= this.settingData.reviveEnergy || this.isReviveTime;
  }
  //#endregion variables and properties

  //#region constructor、Phaser function
  constructor(private gameData: VerticalParkourGameData, private gameWeb: IAnswerWeb) {
    super({ key: 'VerticalParkourGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 獲取英雄資料
    const heroData = HeroManager.getHeroData(this.gameData.heroListData.heroId);
    // 檢查資料並顯示錯誤
    if (heroData === undefined) {
      await InfoBox.defaultMessage([this], `英雄資料讀取失敗! 英雄ID: ${this.gameData.heroListData.heroId}`);
      this.scene.stop();
      return;
    }
    this.heroData = heroData;
    // 動態載入英雄閒置動畫圖
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Idle);
    // 動態載入英雄跑步動畫圖
    AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, CharacterAnimType.Run);

    // 獲取遊戲設定資料
    const settingData = TableManager.verticalParkourSetting.findOne(1);
    if (settingData === undefined) {
      Helper.assert(ErrorId.TableDataNotFound, 'settingData');
      return;
    }
    this.settingData = settingData;

    // 獲取障礙物波數資料
    const obstacleWaveData = TableManager.verticalParkourObstacleWave.getAll();
    if (obstacleWaveData === undefined) {
      Helper.assert(ErrorId.TableDataNotFound, 'obstacleWaveData');
      return;
    }
    this.obstacleWaveData = obstacleWaveData;

    // 抓取道具靜態表
    this.itemDataList = TableManager.verticalParkourItem.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${verticalParkourImgUrl}/${data.url}`);
    });
  }

  async create() {
    // 創建英雄閒置動畫
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Idle);
    // 創建英雄跑步動畫
    AnimationHelper.createCharacterAnim(this, this.heroData, CharacterAnimType.Run);
    // 設置英雄
    this.hero = new VerticalParkourHero(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height - 50,
      this.settingData.heroMoveSpeed,
      this.heroData,
    );

    // 設置遊戲物件群組
    this.groups = new VerticalParkourGroups(this);
    this.groups.init();

    // 設置時間事件
    this.setTimeEvent();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.updateEnergy(-this.settingData.baseConsumption);
      },
      callbackScope: this,
      loop: true,
    });

    // 調整遊戲物件碰撞邊界
    this.physics.world.setBounds(
      VerticalParkourNumber.LeftEdge,
      0,
      VerticalParkourNumber.RightEdge - VerticalParkourNumber.LeftEdge,
      this.cameras.main.height,
    );

    // 設置Dialog
    await this.setDialog();
  }

  fixedUpdate(time: number, delta: number) {
    // 更新英雄
    this.hero?.update(time, delta);
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }
  //#endregion

  //#region 初始化 function
  /** 設置時間事件 */
  private setTimeEvent(): void {
    // 設置寶箱生成事件
    this.time.addEvent({
      delay: this.settingData.treasureInterval * TimeHelper.millisecondPerSecond,
      callback: this.groups.createGroupObject,
      callbackScope: this.groups,
      args: [
        VerticalParkourGroup.TreasureGroup,
        this.settingData.heroMoveSpeed,
        VerticalParkourNumber.LeftEdge,
        VerticalParkourNumber.RightEdge,
      ],
      loop: true,
    });

    // 設置鑰匙生成事件
    this.time.addEvent({
      delay: this.settingData.keyInterval * TimeHelper.millisecondPerSecond,
      callback: this.groups.createGroupObject,
      callbackScope: this.groups,
      args: [
        VerticalParkourGroup.KeyGroup,
        this.settingData.heroMoveSpeed,
        VerticalParkourNumber.LeftEdge,
        VerticalParkourNumber.RightEdge,
      ],
      loop: true,
    });

    // 設置金幣生成事件
    this.time.addEvent({
      delay: this.settingData.coinInterval * TimeHelper.millisecondPerSecond,
      callback: this.groups.createGroupObject,
      callbackScope: this.groups,
      args: [
        VerticalParkourGroup.CoinGroup,
        this.settingData.heroMoveSpeed,
        VerticalParkourNumber.LeftEdge,
        VerticalParkourNumber.RightEdge,
      ],
      loop: true,
    });

    // 設置障礙物生成事件
    this.obstacleWaveData.forEach((wave) => {
      this.time.addEvent({
        // 在指定的時間開始波數
        delay: wave.time * TimeHelper.millisecondPerSecond,
        callback: () => {
          // 移除上一波次的時間事件
          if (this.waveTimeEvent) {
            this.waveTimeEvent.remove();
          }
          // 設置新的波次時間事件
          this.waveTimeEvent = this.time.addEvent({
            delay: wave.interval * TimeHelper.millisecondPerSecond,
            callback: this.groups.createGroupObject,
            callbackScope: this.groups,
            args: [
              VerticalParkourGroup.ObstacleGroup,
              VerticalParkourNumber.BackgroundSpeed,
              VerticalParkourNumber.LeftEdge,
              VerticalParkourNumber.RightEdge,
            ],
            loop: true,
          });
        },
        callbackScope: this,
      });
    });
  }

  /** 初始化所有Dialog顯示 */
  private async setDialog(): Promise<void> {
    // 開啟背景 Dialog
    this.backgroundDialog = UIManager.instance.openDialog(VerticalParkourBackgroundDialog, this);
    this.backgroundDialog.setDepth(VerticalParkourDepth.Background);

    // 開啟Gui Dialog
    this.guiDialog = UIManager.instance.openDialog(VerticalParkourGuiDialog, this);
    this.guiDialog.setDepth(VerticalParkourDepth.UI);
    this.guiDialog.updateEnergyBar(this.currentEnergy, VerticalParkourNumber.MaxEnergy);
    this.guiDialog.updateScoreCount(this.scoreCount, this.settingData.targetScore);

    // 開啟道具 Dialog
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<VerticalParkourItem>>(ItemDialog, this);
    this.itemDialog.setDepth(VerticalParkourDepth.UI);
    this.itemDialog.init(
      this.itemDataList,
      { width: 60, height: 60 },
      new Phaser.Math.Vector2(this.itemDialog.width - 150, this.itemDialog.height - 40),
      Align.RightCenter,
    );
    await this.itemDialog.addItems(this.gameData.totalProps, VerticalParkourItem, this.useItem.bind(this));

    // 關閉載入場景
    UIManager.instance.closeDialog(LoadingDialog, this);
  }
  //#endregion 初始化 function

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 暫停時間事件
    this.time.paused = true;
    // 暫停動畫事件
    this.tweens.pauseAll();

    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 暫停時間事件
    this.time.paused = false;
    // 暫停動畫事件
    this.tweens.resumeAll();

    // 設置Timer計時
    this.setTimerDialog(180, VerticalParkourDepth.UI);
    this.timerDialog?.layoutTitle.setPosition(this.game.canvas.width - 150, this.game.canvas.height - 150);
    this.timerDialog?.layout.container.setPosition(this.game.canvas.width - 90, this.game.canvas.height - 150);
    this.timerDialog?.layoutBackground.setVisible(false);
    this.timerDialog?.timeText.setColor(UIHelper.whiteString);
    this.setTimerEvent(
      () => {
        // 時間到
        this.isTimeOut = true;
      },

      // 剩餘30秒強制續命
      new Map([
        [
          30,
          () => {
            this.isReviveTime = true;
          },
        ],
      ]),
    );

    // 英雄可以開始移動
    this.hero.move();
  }

  /** 遊戲進行中
   * @param delta 每一幀的間隔
   */
  public onGameUpdate(delta: number): void {
    /** */
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 暫停背景音樂
    this.bgm?.pause();
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 將道具加到itemDialog
    await this.itemDialog.addItems(rewardProp, VerticalParkourItem, this.useItem.bind(this));
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();

    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 遊戲結束 */
  public onEndingEnter(): ContestPlayerData {
    // 更新魔力顯示
    this.guiDialog.updateEnergyBar(this.currentEnergy, VerticalParkourNumber.MaxEnergy);

    // 設定跑酷結算資料
    const gameLog: VerticalParkourGameLog = {
      gameScore: this.scoreCount,
      gameMode: GameType.WebParkour,
      browser: navigator.userAgent,
      coinCount: 0,
      // 使用道具次數
      useProps: Array.from(this.usePropsMap, ([id, count]) => ({ id, count })).sort((a, b) => a.id - b.id),
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.scoreCount >= this.settingData.targetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  //#region 遊戲邏輯
  /** 獲得金幣 */
  public gainCoin(): void {
    // 播放金幣音效
    this.sound.play(VerticalParkourString.AudioCoin);

    this.increaseScore(this.settingData.coinScore);
  }

  /** 解鎖寶箱 */
  public async unlockTreasure(): Promise<void> {
    // 播放解鎖音效
    this.sound.play(VerticalParkourString.AudioTreasure);
    // 英雄進入解鎖狀態
    await this.hero.unlock(this.settingData.treasureUnlockTime);

    this.updateEnergy(this.settingData.treasureEnergy);
    this.increaseScore(this.settingData.treasureScore);
  }

  /** 英雄受傷 */
  public heroHurt(): void {
    // 播放受傷音效
    this.sound.play(VerticalParkourString.AudioHurt);
    // 英雄受傷
    this.hero.playHurtEffect();
    // 減少魔力
    this.updateEnergy(-this.settingData.obstacleDamage);
  }

  /** 增加分數
   * @param value 增加分數
   */
  private increaseScore(value: number): void {
    this.scoreCount += value;
    this.guiDialog.updateScoreCount(this.scoreCount, this.settingData.targetScore);
  }

  /** 更新魔力值
   * @param value 魔力值
   */
  private async updateEnergy(value: number): Promise<void> {
    if (this.currentEnergy + value <= 0) {
      await this.hero.die();
    }

    this.currentEnergy = Phaser.Math.Clamp(this.currentEnergy + value, 0, VerticalParkourNumber.MaxEnergy);
    this.guiDialog.updateEnergyBar(this.currentEnergy, VerticalParkourNumber.MaxEnergy);
  }

  /** 增加鑰匙數量 */
  public increaseKey(): void {
    // 播放鑰匙音效
    this.sound.play(VerticalParkourString.AudioKey);
    this.guiDialog.increaseKeyAmount(1);
  }

  /** 使用鑰匙 */
  public useKey(): boolean {
    return this.guiDialog.decreaseKeyAmount(1);
  }

  /** 使用道具
   * @param item 道具
   */
  public useItem(item: VerticalParkourItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    let isItemUsed = false;

    switch (item.itemData.itemFunction) {
      case VerticalParkourItemFunction.Invincible:
        isItemUsed = this.useInvincibleItem(item);
        break;
      case VerticalParkourItemFunction.Magnet:
        isItemUsed = this.useMagnetItem(item);
        break;
      case VerticalParkourItemFunction.Avatar:
        isItemUsed = this.useAvatarItem(item);
        break;
      case VerticalParkourItemFunction.Bomb:
        isItemUsed = this.hero.isBomb === false;
        this.useBombItem(item);
        break;
    }

    // 紀錄使用道具
    if (isItemUsed) {
      const usedCount = this.usePropsMap.get(item.itemData.id);
      this.usePropsMap.set(item.itemData.id, usedCount + 1);
    }
  }

  /** 使用無敵道具 */
  private useInvincibleItem(item: VerticalParkourItem): boolean {
    if (this.hero.isInvincible) {
      return false;
    }

    // 使用道具
    item.useItem();
    this.hero.playInvincibleEffect(item.itemData.value);

    // 播放無敵音效
    this.sound.play(VerticalParkourString.AudioInvincible);

    // 開啟無敵道具
    this.itemDialog.setCountDownPendingUntil(
      item,
      item.itemData.value,
      AsyncHelper.pendingUntil(() => this.hero.isInvincible === false),
    );
    return true;
  }

  /** 使用磁鐵道具 */
  private useMagnetItem(item: VerticalParkourItem): boolean {
    if (this.groups.isMagnet) {
      return false;
    }

    // 使用道具
    item.useItem();
    this.groups.magnet(item.itemData.value);

    // 播放磁鐵音效
    this.sound.play(VerticalParkourString.AudioMagnet);

    // 開啟磁鐵道具
    this.itemDialog.setCountDownPendingUntil(
      item,
      item.itemData.value,
      AsyncHelper.pendingUntil(() => this.groups.isMagnet === false),
    );
    return true;
  }

  /** 使用分身道具 */
  private useAvatarItem(item: VerticalParkourItem): boolean {
    // 使用道具
    item.useItem();
    this.groups.createGroupObject(
      VerticalParkourGroup.AvatarGroup,
      item.itemData.value,
      VerticalParkourNumber.LeftEdge,
      VerticalParkourNumber.RightEdge,
    );

    // 播放分身音效
    this.sound.play(VerticalParkourString.AudioAvatar);
    return true;
  }

  /** 使用炸彈道具 */
  private async useBombItem(item: VerticalParkourItem): Promise<void> {
    if (this.hero.isBomb) {
      return;
    }

    // 播放炸彈音效
    this.sound.play(VerticalParkourString.AudioBomb);

    // 使用道具
    item.useItem();
    this.itemDialog.setHighlightPendingUntil(
      item,
      AsyncHelper.pendingUntil(() => this.hero.isBomb === false),
    );

    await this.hero.playBombEffect(item.itemData.value);
    this.groups.bomb(item.itemData.value);
  }
  //#endregion
}
