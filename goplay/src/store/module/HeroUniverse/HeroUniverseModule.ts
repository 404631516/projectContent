import { ActionContext, ReturnGetters } from '@/types/store';
import { HeroUniverseGameData } from '@/helper/interface/Game';
import { HeroUniverseTaskRunningEntity } from '@/hero-api/entity/hero-universe-task.entity';
import { HeroUniverseTaskAPI } from '@/api/heroUniverseTask';
import { TaskConditionType } from '@/hero-api/entity/base-task.entity';
import { HeroUniverseTaskItem } from '@/hero-api/json-entity/hero-universe-task.table';
import { TableManager as ServerTableManager } from '@/hero-api/json-entity/table.manager';
import DefaultMap from '@/views/H5/Helper/DefaultMap';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import TableManager from '@/manager/TableManager';
import Config from '@/config/setting';

/** 進行中任務資訊 */
export interface UniverseTaskRunningInfo {
  /** 靜態表獲取的資料(任務條件須完成次數) */
  taskItem: HeroUniverseTaskItem;
  /** API回傳的任務進度(任務條件完成的進度) */
  runningEntity: HeroUniverseTaskRunningEntity;
}

/** 目前對話中NPC */
export interface CurrentTalkingNpc {
  /** ID */
  id: number;
  /** 名稱 */
  name: string;
  /** 圖像 */
  image: string;
}

/** NPC特效圖路徑 */
const npcEffectBaseUrl: string = `${Config.imgUrl}/img/h5/heroUniverse/npcEffect/`;

interface HeroUniverseState {
  /** 任務條件UrlMap */
  readonly taskConditionUrlMap: Map<string, TaskConditionType[]>;

  /** 遊戲紀錄，用來記錄在英雄宇宙傳送時的遊戲紀錄 */
  gameDataHistoryList: HeroUniverseGameData[];
  /** 遊戲是否為暫停狀態，需回到暫停前的進度 */
  isSuspend: boolean;

  /** 進行中任務列表 */
  runningTaskList: HeroUniverseTaskRunningEntity[];

  /** 進行中任務對應完成次數列表 */
  universeTaskRunningInfoList: UniverseTaskRunningInfo[];
  /** 已完成任務列表 */
  universeCompletedTaskItemList: HeroUniverseTaskItem[];

  /** NPC 對應 可完成任務列表的Map */
  npcCompletableTaskMap: DefaultMap<number, HeroUniverseTaskItem[]>;
  /** NPC 對應 進行中任務列表的Map */
  npcInProgressTaskMap: DefaultMap<number, HeroUniverseTaskItem[]>;
  /** NPC 對應 可接受任務列表的Map */
  npcAcceptableTaskMap: DefaultMap<number, HeroUniverseTaskItem[]>;

  /** 目前對話中NPC */
  currentTalkingNpc: CurrentTalkingNpc;
}

const moduleState: HeroUniverseState = {
  /**
   * 任務條件UrlMap
   * key: `${url}-${method}`
   */
  taskConditionUrlMap: new Map<string, TaskConditionType[]>([
    [
      '/contestWebGame-post',
      [
        TaskConditionType.FinishAnswerGameCount,
        TaskConditionType.FinishAnswerGameSuccessCount,
        TaskConditionType.FinishWorldContestCount,
        TaskConditionType.FinishWorldContestSuccessCount,
        TaskConditionType.FinishChineseAnswerGameCount,
        TaskConditionType.FinishChineseAnswerGameSuccessCount,
        TaskConditionType.FinishMathAnswerGameCount,
        TaskConditionType.FinishMathAnswerGameSuccessCount,
        TaskConditionType.FinishScienceAnswerGameCount,
        TaskConditionType.FinishScienceAnswerGameSuccessCount,
        TaskConditionType.FinishEnglishAnswerGameCount,
        TaskConditionType.FinishEnglishAnswerGameSuccessCount,
        TaskConditionType.FinishSelfLearningAnswerGameCount,
        TaskConditionType.FinishSelfLearningAnswerGameSuccessCount,
      ],
    ],
    ['/planetWarBattle-post', [TaskConditionType.DialogueCombat]],
  ]),

  /** 遊戲紀錄，用來記錄在英雄宇宙傳送時的遊戲紀錄 */
  gameDataHistoryList: [],
  /** 遊戲是否為暫停狀態，需回到暫停前的進度 */
  isSuspend: false,

  /** 進行中任務列表 */
  runningTaskList: [],

  /** 進行中任務對應完成次數列表 */
  universeTaskRunningInfoList: [],
  /** 已完成任務列表 */
  universeCompletedTaskItemList: [],

  /** NPC 對應 可完成任務列表的Map */
  npcCompletableTaskMap: new DefaultMap<number, HeroUniverseTaskItem[]>(() => []),
  /** NPC 對應 進行中任務列表的Map */
  npcInProgressTaskMap: new DefaultMap<number, HeroUniverseTaskItem[]>(() => []),
  /** NPC 對應 可接受任務列表的Map */
  npcAcceptableTaskMap: new DefaultMap<number, HeroUniverseTaskItem[]>(() => []),

  /** 目前對話中NPC */
  currentTalkingNpc: {
    id: 0,
    name: '',
    image: '',
  },
};

const moduleGetters = {
  isSuspend: (state: HeroUniverseState): boolean => state.isSuspend,

  runningTaskList: (state: HeroUniverseState): HeroUniverseTaskRunningEntity[] => state.runningTaskList,

  universeTaskRunningInfoList: (state: HeroUniverseState): UniverseTaskRunningInfo[] =>
    state.universeTaskRunningInfoList,
  universeCompletedTaskItemList: (state: HeroUniverseState): HeroUniverseTaskItem[] =>
    state.universeCompletedTaskItemList,

  npcCompletableTaskMap: (state: HeroUniverseState): DefaultMap<number, HeroUniverseTaskItem[]> =>
    state.npcCompletableTaskMap,
  npcInProgressTaskMap: (state: HeroUniverseState): DefaultMap<number, HeroUniverseTaskItem[]> =>
    state.npcInProgressTaskMap,
  npcAcceptableTaskMap: (state: HeroUniverseState): DefaultMap<number, HeroUniverseTaskItem[]> =>
    state.npcAcceptableTaskMap,

  currentTalkingNpc: (state: HeroUniverseState): CurrentTalkingNpc => state.currentTalkingNpc,
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 初始化遊戲紀錄 */
  initGameDataHistoryList(state: HeroUniverseState): void {
    state.gameDataHistoryList = [];
  },

  /** 設定遊戲是否為暫停狀態，需回到暫停前的進度
   * @param isSuspend 遊戲是否為暫停狀態，需回到暫停前的進度
   */
  setIsSuspend(state: HeroUniverseState, isSuspend: boolean): void {
    state.isSuspend = isSuspend;
  },

  /** 設定目前對話中NPC */
  setCurrentTalkingNpc(state: HeroUniverseState, currentTalkingNpcId: number): void {
    // 對話的NPC
    const npcData = TableManager.heroUniverseNpc.findOne(currentTalkingNpcId);
    // 防呆
    if (npcData == null) {
      Helper.assert(ErrorId.TableDataNotFound, `npcImg: npcData == null, id=${currentTalkingNpcId}`);
      return;
    }

    // NPC特效圖
    const npcEffect = TableManager.heroUniverseNpcEffect.findOne(npcData.effectId);
    // 防呆
    if (npcEffect == null) {
      Helper.assert(ErrorId.TableDataNotFound, `npcImg: npcEffect == null, id=${npcData.effectId}`);
      return;
    }

    state.currentTalkingNpc = {
      id: currentTalkingNpcId,
      name: npcData.name,
      image: `${npcEffectBaseUrl}${npcEffect.url}`,
    };
  },
};

const actions = {
  /** 儲存遊戲紀錄
   * @param gameDataHistory 遊戲紀錄
   */
  pushGameDataHistory(context: ActionContext<HeroUniverseState, Getters>, gameDataHistory: HeroUniverseGameData): void {
    context.state.gameDataHistoryList.push(gameDataHistory);
  },

  /** 取出遊戲紀錄
   * @returns 遊戲紀錄
   */
  popGameDataHistory(context: ActionContext<HeroUniverseState, Getters>): HeroUniverseGameData {
    return context.state.gameDataHistoryList.pop() || { mapId: -1 };
  },

  /** 取得進行中任務列表 */
  async refreshRunningTaskList(
    context: ActionContext<HeroUniverseState, Getters>,
  ): Promise<HeroUniverseTaskRunningEntity[]> {
    const response = await HeroUniverseTaskAPI.getRunningTaskList();
    context.state.runningTaskList = response.runningTaskList;
    return context.state.runningTaskList;
  },

  /** 取得與指定Url相關的進行中任務Id列表
   * @param url 相關的Url
   * @returns 進行中任務Id列表
   */
  getUrlRelatedRunningTaskIdList(context: ActionContext<HeroUniverseState, Getters>, url: string): number[] {
    const taskConditionTypeList = context.state.taskConditionUrlMap.get(url);
    // 不相關的Url
    if (taskConditionTypeList === undefined) {
      return [];
    }

    // 相關，過濾出符合條件的任務
    const relatedRunningTaskList = context.state.runningTaskList.filter((task) => {
      if (taskConditionTypeList.includes(task.conditionType1)) {
        return true;
      }

      if (taskConditionTypeList.includes(task.conditionType2)) {
        return true;
      }

      if (taskConditionTypeList.includes(task.conditionType3)) {
        return true;
      }

      return false;
    });

    // 返回Id列表
    return relatedRunningTaskList.map((task) => task.runningTaskUid);
  },

  /** 刷新任務狀態 */
  async refreshUniverseTasksStatus(context: ActionContext<HeroUniverseState, Getters>): Promise<void> {
    // 清空暫存數據
    context.state.universeTaskRunningInfoList.length = 0;
    context.state.npcCompletableTaskMap.clear();
    context.state.npcInProgressTaskMap.clear();
    context.state.npcAcceptableTaskMap.clear();

    // 已完成任務 ID 列表
    const completedTaskIdSet = await HeroUniverseTaskAPI.getCompletedTaskIdSet();
    // 轉換成已完成任務列表
    context.state.universeCompletedTaskItemList = ServerTableManager.heroUniverseTaskTable
      .getDataArray()
      .filter((task) => {
        return completedTaskIdSet.has(task.id);
      });

    // 進行中任務 ID 列表
    const runningTaskIdSet = new Set<number>();

    // 取得進行中任務列表
    const runningTaskList: HeroUniverseTaskRunningEntity[] = await context.dispatch('refreshRunningTaskList');
    runningTaskList.forEach((runningEntity) => {
      const taskItem = ServerTableManager.heroUniverseTaskTable.getItem(runningEntity.dataId);
      if (taskItem === undefined) {
        Helper.assert(ErrorId.TableDataNotFound, `找不到對應的進行中任務資料，id:${runningEntity.dataId}`);
        return;
      }

      // 設定進行中任務列表以便顯示
      context.state.universeTaskRunningInfoList.push({
        taskItem,
        runningEntity,
      });

      // 檢查任務是否可以完成
      if (
        runningEntity.conditionValue1 <= 0 &&
        runningEntity.conditionValue2 <= 0 &&
        runningEntity.conditionValue3 <= 0
      ) {
        // 可完成
        context.state.npcCompletableTaskMap.get(taskItem.turnInNpcId).push(taskItem);
        // 可完成但進行任務與交付任務的NPC不同，表示該NPC有進行中任務
        if (taskItem.npcId !== taskItem.turnInNpcId) {
          context.state.npcInProgressTaskMap.get(taskItem.npcId).push(taskItem);
        }
      } else {
        // 進行中
        context.state.npcInProgressTaskMap.get(taskItem.npcId).push(taskItem);
      }

      runningTaskIdSet.add(taskItem.id);
    });

    // 取得可接取任務列表
    const acceptableTaskList = ServerTableManager.heroUniverseTaskTable.getDataArray().filter((task) => {
      // 排除已完成
      if (completedTaskIdSet.has(task.id)) {
        return false;
      }

      // 排除進行中
      if (runningTaskIdSet.has(task.id)) {
        return false;
      }

      // 除階段1任務以外都為自動接取的任務
      if (task.stage !== 1) {
        return false;
      }

      // 排除英雄解鎖數量不足
      if (task.prerequisiteUnlockHeroCount > context.rootGetters.heroCount) {
        return false;
      }

      // 排除前置任務未完成
      if (task.prerequisiteTaskId !== 0 && completedTaskIdSet.has(task.prerequisiteTaskId) === false) {
        return false;
      }

      return true;
    });

    // 轉換成 NPC 對應 可接受任務列表的Map
    acceptableTaskList.forEach((task) => {
      context.state.npcAcceptableTaskMap.get(task.npcId).push(task);
    });
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
