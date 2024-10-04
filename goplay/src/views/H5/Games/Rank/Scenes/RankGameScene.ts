import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import { RankNumber } from '../Data/RankConfig';
import RankInfoDialog from '../Dialogs/RankInfoDialog';
import { RankData } from '@/helper/interface/Rank';
import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import EnhancedCamera from '@/views/H5/Scripts/Components/Camera/EnhancedCamera';
import RankBaseDialog from '../Dialogs/RankBaseDialog';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import RankButtonDialog from '../Dialogs/RankButtonDialog';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';

/** 遊戲場景 */
export default class RankGameScene extends BaseGameScene {
  /** ui專用攝影機 */
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  /** 拖拉縮放攝影機 */
  private enhancedCamera!: EnhancedCamera;

  /** RankInfoDialog, 因為會頻繁呼叫所以存起來 */
  private infoDialog!: RankInfoDialog;

  /** 每隔x毫秒更新一次排行榜 */
  private readonly updateRankMilliSec: number = 5000;

  /** 下次更新時間 */
  private nextUpdateTime: number = 0;

  /** 是否抓取資料中 */
  private isUpdating: boolean = false;

  /** 上次取得的rank資料長度 */
  private lastRankLength: number = -1;

  /** 遊戲是否結束 */
  public isGameEnd: boolean = false;

  constructor() {
    super({ key: 'RankGameScene' });
  }

  preload() {
    // load英雄跑步圖片
    AnimationHelper.loadAllHeroSprite(this, CharacterAnimType.Run);

    // ui攝影機
    this.uiCamera = this.cameras.main;
    // 拖拉縮放攝影機
    this.enhancedCamera = new EnhancedCamera(this);
    this.enhancedCamera.dragComponent.setLock(false);
    this.enhancedCamera.wheelComponent.setLock(true);

    // 取得畫面寬高
    const canvas = this.game.canvas;
    const width = canvas.width;
    const height = canvas.height;
    // 設置攝影機照射範圍
    this.enhancedCamera.setBounds(0, 0, width, height);

    // 背景Dialog
    const baseDialog = UIManager.instance.openDialog(RankBaseDialog, this);
    this.enhancedCamera.ignore(baseDialog);

    // 排行榜Dialog
    this.infoDialog = UIManager.instance.openDialog(RankInfoDialog, this, false);
    this.infoDialog.setDepth(2);
    this.uiCamera.ignore(this.infoDialog);

    // RankButtonDialog
    const buttonDialog = UIManager.instance.openDialog(RankButtonDialog, this, false);
    this.enhancedCamera.ignore(buttonDialog);

    // loading dialog
    const loadingDialog = UIManager.instance.openDialog(LoadingDialog, this);
    this.uiCamera.ignore(loadingDialog);
  }

  create() {
    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  /** update, 每個frame執行一次 */
  fixedUpdate(time: number, delta: number) {
    // 下次更新時間到
    if (time > this.nextUpdateTime) {
      // 更新排行榜
      this.updateRankData();
      // 計算下次更新時間
      this.nextUpdateTime = time + this.updateRankMilliSec;
    }
  }

  /** 每x秒被呼叫一次, 取得排行榜資料並更新UI */
  private async updateRankData(): Promise<void> {
    // 防止重複更新
    if (this.isUpdating) {
      return;
    }
    this.isUpdating = true;

    // 去取排行資料(呼叫API)
    const rankData: RankData = await StoreHelper.$$store.dispatch('getContestRankScoreApi');
    if (rankData == null) {
      console.log('updateRankData Error: get rankData fail');
      return;
    }

    // 取得排行資料
    const rankList = rankData.rankList;
    // 取得排行規則
    const rankRule = StoreHelper.$$store.state.ImmediateRankModule.rankRuleType;
    // 更新排行資料
    this.infoDialog.onRankUpdate(rankList, rankRule);
    // 若資料長度有變
    if (this.lastRankLength !== rankList.length) {
      this.lastRankLength = rankList.length;
      // 調整攝影機可移動範圍
      const height = RankNumber.ItemOffsetY + RankNumber.ItemSpacingY * (rankList.length + 1);
      this.enhancedCamera.setBounds(0, 0, this.game.canvas.width, height);
    }

    this.isUpdating = false;
  }

  /** 返回最上方按鈕 */
  public async onBackToTopButton(): Promise<void> {
    // 鎖玩家操作
    this.enhancedCamera.dragComponent.setLock(true);
    // 攝影機移動秒數
    const tweenSec = 1;
    // 攝影機移動
    this.enhancedCamera.pan(this.game.canvas.width / 2, this.game.canvas.height / 2, tweenSec * 1000);
    // 等攝影機移動完成
    await AsyncHelper.sleep(tweenSec);
    // 解鎖玩家操作
    this.enhancedCamera.dragComponent.setLock(false);
  }
}
