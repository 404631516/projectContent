<template>
  <div class="h5-wrapper w-full h-full overflow-hidden">
    <div :id="containerId" class="flex items-center justify-center" />

    <!-- NPC對話視窗 -->
    <HeroUniverseNpcDialog
      v-model="showNpcDialog"
      :triggerLocation="triggerLocation"
      :handleTaskAutoTrigger="handleTaskAutoTrigger.bind(this)"
      @onReceiveTaskReward="onReceiveTaskReward"
    />

    <!-- 任務日誌 -->
    <HeroApiTaskDialog @onShowTaskDetails="onShowTaskDetails" @onCloseTaskDetails="onCloseTaskDetails" />

    <!-- 答題彈窗 -->
    <HeroApiQuizDialog ref="heroApiQuizDialog" />

    <!-- 原首頁任務小精靈 -->
    <DailyTaskDialog v-model="showDailyTaskDialog" @onOpenRewardDialog="onReceiveTaskReward" />
    <!-- 獎勵彈窗 -->
    <RewardDialog v-model="showRewardDialog" :rewardItemList="rewardList" />
  </div>
</template>

<script lang="ts">
import { HeroUniverseGame, IHeroUniverseWeb } from '@/views/H5/Games/Common/PhaserGameStrategy';
import { Component, Vue } from 'vue-property-decorator';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { AntiTDGameData, HeroUniverseGameData } from '@/helper/interface/Game';
import TableManager, { HeroData } from '@/manager/TableManager';
import { MenuName } from '@/helper/enum/MenuName';
import { PlanetWarType, ResponseState, UniverseEnergyType } from '@/helper/enum/Common';
import config from '@/config/setting';
import { HeroListData } from '@/helper/interface/Hero';
import { planetWarBattleAPI, planetWarLevelAPI } from '@/api/planetWar';
import { handleAPIError } from '@/helper/fnc/common';
import { PlanetWarLevelDetailResultDto } from '@/helper/interface/PlanetWar';
import { Load } from '@/helper/class/Common';
import { WebGameHelpName } from '@/helper/enum/WebGame';
import HeroApiQuizDialog from '../HeroApiQuiz/HeroApiQuizDialog.vue';
import { TaskConditionType } from '@/hero-api/entity/base-task.entity';
import HeroApiTaskDialog from './HeroApiTaskDialog.vue';
import DailyTaskDialog from '../Index/DailyTaskDialog.vue';
import RewardDialog from '../Public/RewardDialog.vue';
import { ContestGameAward } from '@/helper/interface/Contest';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import HeroUniverseNpcDialog from './HeroUniverseNpcDialog.vue';
import { UniverseTaskRunningInfo } from '@/store/module/HeroUniverse/HeroUniverseModule';
import HeroApiCompletedTaskDialog from './HeroApiCompletedTaskDialog.vue';

@Component({
  components: {
    HeroApiTaskDialog,
    HeroApiQuizDialog,
    DailyTaskDialog,
    RewardDialog,
    HeroUniverseNpcDialog,
    HeroApiCompletedTaskDialog,
  },
})
export default class HeroUniverseWebGame extends Vue implements IHeroUniverseWeb {
  /** 預設地圖ID */
  private readonly defaultMapId: number = 1001;
  /** 星球大戰關卡起算點 */
  private readonly learnLidShift: number = 30000;
  /** 每日任務NPC ID */
  private readonly dailyTaskNpcId: number = 9999;

  /** 遊戲表演座標 */
  private containerId: string = 'game-container';
  /** 遊戲本體 */
  private heroUniverseGame!: HeroUniverseGame;
  /** 目前所在地圖 */
  private currentMapId: number = this.defaultMapId;
  /** 英雄資料 */
  private _heroData!: HeroData;
  public get heroData(): HeroData {
    return this._heroData;
  }

  /** NPC對話視窗顯示 */
  public showNpcDialog: boolean = false;

  /** NPC對話視窗的觸發位置 */
  public triggerLocation: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  /** 每日任務顯示 */
  public showDailyTaskDialog: boolean = false;
  /** 每日任務獎勵顯示 */
  public showRewardDialog: boolean = false;
  /** 每日任務獎勵列表 */
  public rewardList: ContestGameAward[] = [];

  /** 答題視窗 */
  public $refs: {
    heroApiQuizDialog: HeroApiQuizDialog;
  };

  async mounted() {
    // 取網頁線上英雄資料
    const onlineHero = this.$$store.getters.onlineHero;
    if (onlineHero === undefined) {
      Helper.assert(ErrorId.OnlineHeroNotFound, `無法取得網頁線上英雄資料`);
      return;
    }

    // 取得遊戲英雄資料
    const heroData = TableManager.hero.findOne(onlineHero.heroId);
    if (heroData === undefined) {
      Helper.assert(ErrorId.OnlineHeroNotFound, `無法取得遊戲英雄資料，英雄id:${onlineHero.heroId}`);
      return;
    }
    this._heroData = heroData;

    // 更新任務狀態
    await this.$$store.dispatch('refreshUniverseTasksStatus');

    // 假如遊戲是暫停狀態，則回到前一個地圖
    if (this.$$store.getters.isSuspend) {
      this.$$store.commit('setIsSuspend', false);
      this.goBackToPreviousMap();
    } else {
      // 重新開始，初始化遊戲紀錄
      this.$$store.commit('initGameDataHistoryList');
      // 開始遊戲(預設第一張地圖)
      this.switchToNewGameScene({ mapId: this.defaultMapId });
    }

    // 更新任務列表位置
    this.updateTaskListPosition();
    // 註冊任務列表更新事件
    window.addEventListener('resize', this.updateTaskListPosition.bind(this));
  }

  destroyed() {
    // 關閉時摧毀遊戲
    this.heroUniverseGame?.destroyGame();
    // 移除任務列表更新事件
    window.removeEventListener('resize', this.updateTaskListPosition.bind(this));
  }

  //#region 傳送、導向
  /** 重新導向到別的網址
   * @param path 路徑
   */
  public async redirect(path: string): Promise<void> {
    let name = path;
    let params = {};

    // 表/裏宇宙為同一個路由，因此需額外做處理，來控制要導向到表/裏宇宙
    if (name === 'PlanetWar-Outter' || name === 'PlanetWar-Inner') {
      name = MenuName.PlanetWar;
      params = { id: name === 'PlanetWar-Outter' ? `${PlanetWarType.Outter}` : `${PlanetWarType.Inner}` };
    }

    // 重新導向
    this.$router.push({ name, params });
  }

  /** 傳送到別張地圖
   * @param mapId 地圖ID
   * @param location 觸發位置
   */
  public transport(mapId: number, location: Phaser.Types.Math.Vector2Like): void {
    // 儲存遊戲記錄
    this.recordGameHistory(location);

    // 切到新場景
    this.switchToNewGameScene({ mapId });
  }

  /** 觸發戰鬥
   * @param learnLid 觸發的戰鬥關卡Id(對應學習關卡)
   * @param location 觸發位置
   */
  private async battle(learnLid: number, location: Phaser.Types.Math.Vector2Like) {
    // API 發送封包
    const planetWarLevelDetail: PlanetWarLevelDetailResultDto = await planetWarLevelAPI.getLevelDetail({ learnLid });
    if (planetWarLevelDetail.result !== ResponseState.Success) {
      // 顯示錯誤訊息
      handleAPIError(planetWarLevelDetail.result, planetWarLevelDetail.resMessage);
    }

    // 只取得逆塔防隊長(因雄宇宙只能帶一隻隊長進入逆塔防)
    const heroListDataList = this.$$store.getters.antiTDHeroTeam
      .filter((hero): hero is HeroListData => hero !== undefined)
      .slice(0, 1);

    // 設定逆塔防遊戲資料
    const gameData: AntiTDGameData = {
      heroListDataList,
      mapId: planetWarLevelDetail.targetId,
      heroLevelCap: planetWarLevelDetail.heroLevelCap,
      enemies: planetWarLevelDetail.enemyWaves,
    };

    this.$$store.commit('setAntiTDGameData', gameData);

    // 消耗宇宙能量
    const isUseEnergy = await this.$$store.dispatch('useUniverseEnergy', UniverseEnergyType.PlanetWar);
    if (isUseEnergy === false) {
      return;
    }

    // 預備開始封包
    const data = {
      learnLid: planetWarLevelDetail.learnLid,
      hid: this.$$store.getters.onlineHeroHId,
    };

    // 開啟讀取中
    Load.use(true);

    // API 開始星球大戰
    const planetWarBattleResponse: any = await planetWarBattleAPI.fetch(data);
    if (planetWarBattleResponse.result !== ResponseState.Success) {
      // 顯示錯誤訊息
      handleAPIError(planetWarBattleResponse.result, planetWarBattleResponse.resMessage);
    }

    // 設定星球大戰資訊
    this.$$store.commit('setPlanetWarLearnLid', planetWarLevelDetail.learnLid);
    this.$$store.commit('setPlanetWarLearnLogId', planetWarBattleResponse.learnLogId);
    this.$$store.commit('setPlanetWarType', PlanetWarType.HeroUniverse);

    // 儲存遊戲記錄
    this.recordGameHistory(location);
    // 暫停遊戲Flag，切換頁面回來時會判斷並照上次的地圖繼續遊戲
    this.$$store.commit('setIsSuspend', true);

    // 開啟顯示遊戲顯示
    this.$router.replace({
      name: `${WebGameHelpName.PlanetGameHelp}`,
      params: { id: `${planetWarLevelDetail.learnLid}` },
    });

    // 關閉讀取中
    Load.use(false);
  }

  /** 回到前一個地圖 */
  public async goBackToPreviousMap(): Promise<void> {
    // 取得前一個遊戲記錄
    const gameDataHistory: HeroUniverseGameData = await this.$$store.dispatch('popGameDataHistory');
    // 如果沒有任何遊戲紀錄，則返回首頁
    if (gameDataHistory.mapId === -1) {
      location.replace(`${config.homePath}`);
      return;
    }

    // 切到新場景
    this.switchToNewGameScene(gameDataHistory);
  }

  /** 儲存遊戲記錄
   * @param location 觸發位置
   */
  private recordGameHistory(location: Phaser.Types.Math.Vector2Like) {
    // 儲存前一個遊戲記錄
    const gameDataHistory: HeroUniverseGameData = {
      mapId: this.currentMapId,
      location,
    };
    this.$$store.dispatch('pushGameDataHistory', gameDataHistory);
  }

  /** 切換到新場景並刪除舊場景
   * @param gameData 遊戲資料
   */
  private switchToNewGameScene(gameData: HeroUniverseGameData): void {
    // 創建新場景;
    const newGame = new HeroUniverseGame(gameData, this);
    newGame.startGame(this.containerId, this.$$store.getters.isMute);

    if (this.heroUniverseGame) {
      // 切換場景並刪除舊場景
      this.heroUniverseGame.heroUniverseGameScene.scene.switch(newGame.heroUniverseGameScene);
      this.heroUniverseGame.destroyGame();
    }

    // 記錄目前場景、地圖
    this.heroUniverseGame = newGame;
    this.currentMapId = gameData.mapId;
  }
  //#endregion 傳送、導向

  //#region NPC
  /** 開啟NPC對話
   * @param npcId NPC id
   * @param location 觸發位置
   */
  public async openNpcDialog(npcId: number, location: Phaser.Math.Vector2): Promise<void> {
    // 特殊NPC: 每日任務小精靈
    if (npcId === this.dailyTaskNpcId) {
      this.showDailyTaskDialog = true;
      await AsyncHelper.pendingUntil(() => this.showDailyTaskDialog === false);
      return;
    }

    this.$$store.commit('setCurrentTalkingNpc', npcId);
    this.triggerLocation = location;
    this.showNpcDialog = true;

    await AsyncHelper.pendingUntil(() => this.showNpcDialog === false);
    return;
  }

  /** 處理任務自動觸發的事件
   * @param taskInformation 任務資訊
   * @param location 觸發位置
   */
  private async handleTaskAutoTrigger(
    taskInformation: UniverseTaskRunningInfo,
    location: Phaser.Types.Math.Vector2Like,
  ) {
    switch (taskInformation.taskItem.conditionType1) {
      // 答題
      case TaskConditionType.DialogueAnswer:
        await this.$refs.heroApiQuizDialog.startHeroUniverseTaskAnswer(taskInformation.runningEntity.runningTaskUid);
        break;
      // 戰鬥
      case TaskConditionType.DialogueCombat:
        await this.battle(taskInformation.taskItem.combatStageId, location);
        break;
    }
  }

  /**
   * 是否有可完成任務
   * @param npcId NPC id
   */
  public hasCompletableTasks(npcId: number): boolean {
    return (
      this.$$store.getters.npcCompletableTaskMap.has(npcId) &&
      this.$$store.getters.npcCompletableTaskMap.get(npcId)!.length > 0
    );
  }

  /**
   * 是否有進行中任務
   * @param npcId NPC id
   */
  public hasInProgressTasks(npcId: number): boolean {
    return (
      this.$$store.getters.npcInProgressTaskMap.has(npcId) &&
      this.$$store.getters.npcInProgressTaskMap.get(npcId)!.length > 0
    );
  }

  /**
   * 是否有可接受任務
   * @param npcId NPC id
   */
  public hasAcceptableTasks(npcId: number): boolean {
    return (
      this.$$store.getters.npcAcceptableTaskMap.has(npcId) &&
      this.$$store.getters.npcAcceptableTaskMap.get(npcId)!.length > 0
    );
  }
  //#endregion NPC

  //#region 任務
  /** 更新任務列表位置置遊戲畫面右側 */
  private updateTaskListPosition(): void {
    this.$nextTick(() => {
      // 確保 DOM 已更新
      const rect = document.getElementById('game-container')!.querySelector('canvas')!.getBoundingClientRect();
      (document.getElementById('task-list')! as HTMLElement).style.right = `${window.innerWidth - rect.right}px`;
    });
  }

  /**打開獎勵彈窗
   * @param rewardList 獎勵資料
   */
  protected onReceiveTaskReward(rewardList: ContestGameAward[]): void {
    // 記錄獎勵資料，以轉傳給獎勵ui
    this.rewardList = rewardList;
    // 顯示獎勵ui
    this.showRewardDialog = true;
  }

  /** 顯示任務詳情 */
  protected onShowTaskDetails(taskInformation: UniverseTaskRunningInfo): void {
    this.heroUniverseGame.heroUniverseGameScene.pauseScene();
  }

  /** 關閉任務詳情 */
  protected onCloseTaskDetails(): void {
    this.heroUniverseGame.heroUniverseGameScene.resumeScene();
  }
  //#endregion 任務
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__wrapper {
  text-align: center;
  white-space: nowrap;
  overflow: auto;

  &:after {
    content: '';
    display: inline-block;
    vertical-align: middle;
    height: 100%;
  }

  .el-dialog {
    margin: 30px auto !important;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    white-space: normal;
  }
}
</style>
