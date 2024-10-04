<template>
  <div>
    <div id="task-list" class="task-list">
      <!-- 上半部 -->
      <div class="bg-black bg-opacity-50 border-solid border border-[#316590] p-[10px] rounded-l-md flex">
        <button
          v-if="!isShowTaskList"
          class="bg-gradient-to-b from-[#61c8fd] to-[#017dbd] text-white font-bold rounded-md text-[16px] leading-[1.5] whitespace-nowrap flex items-center justify-center min-h-[50px] min-w-[50px] m-[-5px]"
          @click="isShowTaskList = true"
        >
          <span class="flex items-center justify-center w-full h-full" v-html="textData.expand"></span>
        </button>
        <button
          v-if="isShowTaskList"
          class="bg-gradient-to-b from-[#61c8fd] to-[#017dbd] text-white font-bold rounded-md text-[16px] leading-[1.5] whitespace-nowrap flex items-center justify-center min-h-[50px] w-[44px]"
          @click="isShowTaskList = false"
        >
          <span class="flex items-center justify-center w-full h-full">{{ textData.shrink }}</span>
        </button>
        <div v-if="isShowTaskList" class="ml-4">
          <div
            class="mb-[4px] text-white font-bold border-solid border border-[#316590] rounded-full leading-[1.5] px-6"
          >
            {{ textData.universeTaskList }}
          </div>
          <ul class="list-none p-0">
            <li
              class="mb-[4px] cursor-pointer text-white flex items-center bg-[#316590] rounded-full leading-[1.5] w-full"
              v-for="taskInformation in universeTaskRunningInfoList.slice(0, 3)"
              :key="taskInformation.taskItem.id"
              @click="showUniverseTaskDetails(taskInformation)"
            >
              <img :src="imgPath.universeIconSmall" alt="Task Icon" class="ml-[8px]" />
              <span class="flex-1 text-center pl-[4px] pr-[8px] leading-[1.5] text-[14px] py-[2px]">{{
                taskInformation.taskItem.taskName
              }}</span>
            </li>
          </ul>
          <div
            class="my-[4px] text-white font-bold border-solid border border-[#316590] rounded-full leading-[1.5] px-6"
          >
            {{ textData.teacherTaskList }}
          </div>
          <ul class="list-none p-0">
            <li
              class="mb-[4px] cursor-pointer text-white flex items-center bg-[#316590] rounded-full leading-[1.5] w-full"
              v-for="task in studyTaskRunningList.slice(0, 3)"
              :key="task.runningTaskUid"
              @click="showStudyTaskDetails(task)"
            >
              <img :src="imgPath.universeIconSmall" alt="Task Icon" class="ml-[8px]" />
              <span class="flex-1 text-center pl-[4px] pr-[8px] leading-[1.5] text-[14px] py-[2px]">{{
                task.taskName
              }}</span>
            </li>
          </ul>
        </div>
      </div>
      <!-- 下半部 -->
      <div class="flex justify-center mt-[4px]">
        <button
          v-if="isShowTaskList"
          class="bg-gradient-to-b from-[#f67d7d] to-[#9f0404] text-white font-bold rounded-md text-[16px] whitespace-nowrap flex items-center justify-center py-[6px] w-[196px] border-solid border border-white"
          @click="viewCompleted"
        >
          <span class="flex items-center justify-center w-full h-full text-[16px]">{{ textData.viewCompleted }}</span>
        </button>
      </div>
    </div>

    <!-- 任務詳情對話框 -->
    <div v-if="isTaskDetailsVisible" class="task-details-overlay">
      <div class="task-details-container">
        <!-- 背景圖片 -->
        <div class="background-images">
          <!-- 上方圖片 -->
          <img :src="imgPath.universeFrameCorner" class="corner-image top-left" alt="左上背景" />
          <img :src="imgPath.universeFrameM" class="top-middle" alt="上方中間背景" />
          <img :src="imgPath.universeFrameCorner" class="corner-image top-right" alt="右上背景" />

          <!-- 中間圖片 -->
          <img :src="imgPath.universeFrame50x400" class="side-image left" alt="左側中間背景" />
          <img :src="imgPath.universeFrameBg02" class="center-image" alt="中央背景" />
          <img :src="imgPath.universeFrame50x400" class="side-image right" alt="右側中間背景" />

          <!-- 下方圖片 -->
          <img :src="imgPath.universeFrameCorner" class="corner-image bottom-left" alt="左下背景" />
          <img :src="imgPath.universeFrameM" class="bottom-middle" alt="下方中間背景" />
          <img :src="imgPath.universeFrameCorner" class="corner-image bottom-right" alt="右下背景" />
        </div>

        <!-- 內容 -->
        <div class="content-container">
          <!-- 左半邊顯示所有任務列表 -->
          <div class="task-list-container">
            <!-- 宇宙任務清單 -->
            <div class="universe-task-list">
              <div class="task-header">
                <img :src="imgPath.universeLeftTopBg" alt="Universe Task Background" class="task-header-bg" />
                <div class="task-header-title">
                  {{ textData.universeTask }}
                </div>
              </div>
              <ul class="task-items">
                <div class="flex justify-center items-center">
                  <img :src="imgPath.universeLine252x2" alt="Task Image" class="w-[90%]" />
                </div>
                <li
                  class="task-item"
                  v-for="taskInformation in paginatedUniverseTaskList"
                  :key="taskInformation.taskItem.id"
                  @click="showUniverseTaskDetails(taskInformation)"
                  :style="{
                    color:
                      taskDetailType == TaskDetailType.UniverseTask &&
                      detailInformation.taskItem.id === taskInformation.taskItem.id
                        ? '#ff9019'
                        : 'white',
                  }"
                >
                  <img :src="imgPath.universeIcon01Large" alt="Task Icon" class="task-icon" />
                  <span>{{ taskInformation.taskItem.taskName }}</span>
                </li>
              </ul>
              <div class="task-pagination-container">
                <img :src="imgPath.universeLeftBottomBg" alt="Pagination Background" class="pagination-bg" />
                <el-pagination
                  class="task-pagination"
                  @current-change="handleUniverseTaskPageChange"
                  :current-page.sync="universeTaskCurrentPage"
                  :page-size="universeTaskPageSize"
                  layout="prev, pager, next"
                  :total="universeTaskRunningInfoList.length"
                >
                </el-pagination>
              </div>
            </div>
            <!-- 教師任務清單 -->
            <div class="teacher-task-list">
              <div class="task-header">
                <img :src="imgPath.universeLeftTopBg" alt="Universe Task Background" class="task-header-bg" />
                <div class="task-header-title">
                  {{ textData.teacherTask }}
                </div>
              </div>
              <ul class="task-items">
                <div class="flex justify-center items-center">
                  <img :src="imgPath.universeLine252x2" alt="Task Image" class="w-[90%]" />
                </div>
                <li
                  class="task-item"
                  v-for="task in paginatedStudyTaskList"
                  :key="task.runningTaskUid"
                  @click="showStudyTaskDetails(task)"
                  :style="{
                    color:
                      taskDetailType == TaskDetailType.StudyTask &&
                      detailStudyTask.runningTaskUid === task.runningTaskUid
                        ? '#ff9019'
                        : 'white',
                  }"
                >
                  <img :src="imgPath.universeIcon01Large" alt="Task Icon" class="task-icon" />
                  <span>{{ task.taskName }}</span>
                </li>
              </ul>
              <div class="task-pagination-container">
                <img :src="imgPath.universeLeftBottomBg" alt="Pagination Background" class="pagination-bg" />
                <el-pagination
                  class="task-pagination"
                  @current-change="handleStudyTaskPageChange"
                  :current-page.sync="studyTaskCurrentPage"
                  :page-size="studyTaskPageSize"
                  layout="prev, pager, next"
                  :total="studyTaskRunningList.length"
                >
                </el-pagination>
              </div>
            </div>
            <!-- 按鈕區域 -->
            <div class="button-container">
              <img :src="imgPath.universeBtnBg266x72" alt="Button Background" class="button-bg" />
              <button class="view-completed-button" @click="viewCompleted">
                <img :src="imgPath.universeBtn150x40" alt="Button Background" class="button-inner-bg" />
                <img :src="imgPath.universeArrow" alt="View Completed Icon" class="relative w-auto h-[100%] ml-[5px]" />
                <span class="button-text">{{ textData.viewCompleted }}</span>
              </button>
            </div>
          </div>
          <!-- 右半邊顯示任務詳情 -->
          <div class="task-details-right">
            <!-- 宇宙任務詳情 -->
            <div v-if="taskDetailType === TaskDetailType.UniverseTask" class="task-details-grid">
              <!-- 標題 -->
              <div class="task-title">
                <img :src="imgPath.universeRightTopBg" alt="Task Log Background" class="task-title-bg" />
                <h2 class="task-title-text">
                  {{ textData.taskLog }}
                </h2>
              </div>
              <!-- 任務名稱與描述 -->
              <div class="task-info-container task-name-description">
                <div class="task-info-row">
                  <div class="task-info-label">{{ detailInformation.taskItem.taskName }}</div>
                  <div class="task-info-content">{{ detailInformation.taskItem.taskDescription }}</div>
                </div>
              </div>
              <!-- 任務完成條件 -->
              <div class="task-info-container">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskCompletionCriteria }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <li v-for="(criteria, index) in getUniverseTaskCriteria(detailInformation)" :key="index">
                        <span class="bullet">•</span> {{ criteria }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 回報NPC -->
              <div class="task-info-container">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.reportNpc }}</div>
                  <div class="task-info-content">{{ getNpcData(detailInformation.taskItem.turnInNpcId) }}</div>
                </div>
              </div>
              <!-- 獎勵 -->
              <div class="task-info-container">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskAward }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <li v-for="award in getUniverseAwardList(detailInformation.taskItem)" :key="award.itemType">
                        <span class="bullet">•</span> {{ RewardManager.getTeacherAwardItemName(award) }} *
                        {{ award.count }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 任務操作按鈕 -->
              <div class="task-action-buttons">
                <div class="button-wrapper">
                  <img :src="imgPath.universeBtn150x40" alt="Button background" class="button-bg" />
                  <button class="custom-button" @click="closeTaskDetails">
                    <img :src="imgPath.universeArrow" alt="Confirm Icon" class="button-icon" />
                    <span>{{ textData.confirm }}</span>
                  </button>
                </div>
              </div>
              <div class="task-footer">
                <img :src="imgPath.universeRightBottomBg" alt="Task Log Background" class="task-footer-bg" />
              </div>
            </div>
            <!-- 教師任務詳情 -->
            <div v-if="taskDetailType === TaskDetailType.StudyTask" class="task-details-grid">
              <!-- 標題 -->
              <div class="task-title">
                <img :src="imgPath.universeRightTopBg" alt="Task Log Background" class="task-title-bg" />
                <h2 class="task-title-text">
                  {{ textData.taskLog }}
                </h2>
              </div>
              <!-- 任務名稱與描述 -->
              <div class="task-info-container task-name-description">
                <div class="task-info-row">
                  <div class="task-info-label">{{ detailStudyTask.taskName }}</div>
                  <div class="task-info-content">{{ detailStudyTask.taskDescription }}</div>
                </div>
              </div>
              <!-- 任務完成條件 -->
              <div class="task-info-container">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskCompletionCriteria }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <!-- 無任務條件 -->
                      <li v-if="studyTaskCriteriaList.length === 0">
                        <span class="bullet">•</span> {{ textData.noTaskCondition }}
                      </li>
                      <!-- 有任務條件 -->
                      <li v-for="(studyTaskCriteria, index) in studyTaskCriteriaList" :key="index">
                        <span class="bullet">•</span> {{ studyTaskCriteria.criteria }}
                        <div v-if="studyTaskCriteria.contestId" class="contest-button-container">
                          <img :src="imgPath.universeBtnBgAW" alt="Button background" class="contest-button-bg" />
                          <button class="contest-button" @click="goToContest(studyTaskCriteria)">
                            <img
                              :src="imgPath.universeArrow2"
                              alt="Confirm Icon"
                              class="button-icon contest-button-icon"
                            />
                            <span>{{ textData.goToContest }}</span>
                          </button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 任務時間 -->
              <div class="task-info-container">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskTime }}</div>
                  <div class="task-info-content">
                    <div>
                      {{ textData.taskStart }}:
                      {{ TimeHelper.formatToAsiaTaipeiLocaleString(detailStudyTask.effectiveDate, false) }}
                    </div>
                    <div>
                      {{ textData.taskEnd }}:
                      {{ TimeHelper.formatToAsiaTaipeiLocaleString(detailStudyTask.expiryDate, false) }}
                    </div>
                  </div>
                </div>
              </div>
              <!-- 獎勵 -->
              <div class="task-info-container">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskAward }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <li v-for="award in getStudyTaskAwardList(detailStudyTask)" :key="award.itemType">
                        <span class="bullet">•</span> {{ RewardManager.getTeacherAwardItemName(award) }} *
                        {{ award.count }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 任務操作按鈕 -->
              <div class="task-action-buttons">
                <div class="button-wrapper" v-if="canGiveUpTask(detailStudyTask)">
                  <img :src="imgPath.universeBtn150x40" alt="Button background" class="button-bg" />
                  <button class="custom-button" @click="giveUpTask(detailStudyTask.runningTaskUid)">
                    <img :src="imgPath.universeArrow" alt="Confirm Icon" class="button-icon" />
                    <span>{{ textData.abandon }}</span>
                  </button>
                </div>
                <div
                  class="button-wrapper"
                  v-if="canGiveUpTask(detailStudyTask) === false && canReportTask(detailStudyTask)"
                >
                  <img :src="imgPath.universeBtn150x40" alt="Button background" class="button-bg" />
                  <button class="custom-button" @click="completeTask(detailStudyTask.runningTaskUid)">
                    <img :src="imgPath.universeArrow" alt="Confirm Icon" class="button-icon" />
                    <span>{{ textData.report }}</span>
                  </button>
                </div>
                <div class="button-wrapper">
                  <img :src="imgPath.universeBtn150x40" alt="Button background" class="button-bg" />
                  <button class="custom-button" @click="closeTaskDetails">
                    <img :src="imgPath.universeArrow" alt="Confirm Icon" class="button-icon" />
                    <span>{{ textData.confirm }}</span>
                  </button>
                </div>
              </div>
              <div class="task-footer">
                <img :src="imgPath.universeRightBottomBg" alt="Task Log Background" class="task-footer-bg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { HeroUniverseTaskItem } from '@/hero-api/json-entity/hero-universe-task.table';
import { HeroUniverseTaskRunningEntity } from '@/hero-api/entity/hero-universe-task.entity';
import { MultiDataTaskConditionType, TaskConditionType } from '@/hero-api/entity/base-task.entity';
import TableManager from '@/manager/TableManager';
import { Award, ContestAwardItemTypeEnum } from '@/hero-api/dto/award.dto';
import RewardManager from '@/manager/RewardManager';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { StudyTaskRunning } from '@/hero-api/entity/study-task.entity';
import { contestDetailAPI } from '@/api/contest';
import { ContestDetailData } from '@/helper/interface/Contest';
import TimeHelper from '@/views/H5/Helper/TimeHelper';
import { HeroApiStudyTaskAPI } from '@/api/heroApiStudyTask';
import { UniverseTaskRunningInfo } from '@/store/module/HeroUniverse/HeroUniverseModule';
import { MenuName } from '@/helper/enum/MenuName';
import { StudyTaskCriteria, TaskDetailType } from './HeroApiTaskDialog.vue';
import imgPath from '@/config/imgPath/imgPath';
import HeroUniverseHelper from '@/views/H5/Helper/HeroUniverseHelper';

@Component({})
export default class HeroApiRunningTaskDialog extends Vue {
  /** Import RewardManager.getTeacherAwardItemName 給vue(html)使用 */
  protected RewardManager = RewardManager;
  protected TaskDetailType = TaskDetailType;
  protected TimeHelper = TimeHelper;
  protected imgPath = imgPath;

  /** 教師任務進行中任務列表 */
  protected studyTaskRunningList: StudyTaskRunning[] = [];

  /** 任務獎勵數量 */
  protected readonly numOfAward: number = 3;
  /** 任務條件數量 */
  protected readonly numOfCondition: number = 3;

  /** 文字資料 */
  protected readonly textData = {
    reportNpc: '回報人',
    taskAward: '獎勵',
    taskCompletionCriteria: '完成條件',
    taskLog: '任務日誌',
    universeTask: '魔王宇宙任務',
    teacherTask: '老師發送任務',
    expand: '任務<br>列表',
    shrink: '縮小',
    universeTaskList: '宇宙任務清單',
    teacherTaskList: '教師任務清單',
    taskTime: '任務時間',
    taskStart: '起始',
    taskEnd: '到期',
    abandon: '放棄',
    report: '回報',
    noTaskCondition: '無任務條件',
    goToContest: '前往賽事',
    viewCompleted: '已完成任務',
    confirm: '確認',
  };

  /** 是否開啟任務詳情對話框 */
  protected isTaskDetailsVisible: boolean = false;
  /** 任務詳情類型 */
  protected taskDetailType: TaskDetailType = TaskDetailType.UniverseTask;

  protected isShowTaskList: boolean = false;

  /** 宇宙任務詳情 */
  protected detailInformation: UniverseTaskRunningInfo = {
    taskItem: new HeroUniverseTaskItem({
      taskName: '',
      taskDescription: '',
      conditionType1: TaskConditionType.None,
      conditionType2: TaskConditionType.None,
      conditionType3: TaskConditionType.None,
      awardItemType1: ContestAwardItemTypeEnum.None,
      awardItemType2: ContestAwardItemTypeEnum.None,
      awardItemType3: ContestAwardItemTypeEnum.None,
    }),
    runningEntity: new HeroUniverseTaskRunningEntity(),
  };

  /** 教師任務詳情 */
  protected detailStudyTask: StudyTaskRunning = new StudyTaskRunning();
  /** 教師任務詳情-完成條件 */
  protected studyTaskCriteriaList: StudyTaskCriteria[] = [];

  /** 進行中任務列表 */
  protected get universeTaskRunningInfoList(): UniverseTaskRunningInfo[] {
    return this.$$store.getters.universeTaskRunningInfoList;
  }

  /** 宇宙任務分頁相關 */
  protected universeTaskCurrentPage: number = 1;
  protected universeTaskPageSize: number = 3;
  protected get paginatedUniverseTaskList(): UniverseTaskRunningInfo[] {
    const startIndex = (this.universeTaskCurrentPage - 1) * this.universeTaskPageSize;
    const endIndex = startIndex + this.universeTaskPageSize;
    return this.universeTaskRunningInfoList.slice(startIndex, endIndex);
  }

  /** 教師任務分頁相關 */
  protected studyTaskCurrentPage: number = 1;
  protected studyTaskPageSize: number = 3;
  protected get paginatedStudyTaskList(): StudyTaskRunning[] {
    const startIndex = (this.studyTaskCurrentPage - 1) * this.studyTaskPageSize;
    const endIndex = startIndex + this.studyTaskPageSize;
    return this.studyTaskRunningList.slice(startIndex, endIndex);
  }

  protected handleUniverseTaskPageChange(page: number): void {
    this.universeTaskCurrentPage = page;
  }

  protected handleStudyTaskPageChange(page: number): void {
    this.studyTaskCurrentPage = page;
  }

  /** 組件掛載後 */
  protected async mounted(): Promise<void> {
    // 取得教師任務進行中任務列表
    this.studyTaskRunningList = await this.$$store.dispatch('refreshRunningStudyTaskList');
  }

  /**
   * 根據宇宙任務生成獎勵清單
   * @param task 任務項目
   * @returns 獎品數組
   */
  protected getUniverseAwardList(task: HeroUniverseTaskItem): Award[] {
    const awards: Award[] = [];

    for (let i = 1; i <= this.numOfAward; i++) {
      const itemType = task[`awardItemType${i}` as keyof HeroUniverseTaskItem] as ContestAwardItemTypeEnum;
      const itemId = task[`awardItemId${i}` as keyof HeroUniverseTaskItem] as number;
      const count = task[`awardItemCount${i}` as keyof HeroUniverseTaskItem] as number;

      if (itemType !== ContestAwardItemTypeEnum.None) {
        awards.push({ itemType, itemId, count });
      }
    }

    return awards;
  }

  /** 根據教師任務生成獎勵清單
   * @param task 教師任務
   * @returns 獎品數組
   */
  protected getStudyTaskAwardList(task: StudyTaskRunning): Award[] {
    return task.getAwardList() || [];
  }

  /** 取得宇宙任務完成條件名稱
   * @param detailInformation 任務詳情
   */
  protected getUniverseTaskCriteria(detailInformation: UniverseTaskRunningInfo): string[] {
    const criteriaList = [];

    for (let i = 1; i <= this.numOfCondition; i++) {
      const taskItem = detailInformation.taskItem;
      const runningEntity = detailInformation.runningEntity;

      const type = taskItem[`conditionType${i}` as keyof HeroUniverseTaskItem] as TaskConditionType;

      if (type === TaskConditionType.None) {
        continue;
      }

      const taskValue = taskItem[`conditionValue${i}` as keyof HeroUniverseTaskItem] as number;
      const runningValue = runningEntity[`conditionValue${i}` as keyof HeroUniverseTaskRunningEntity] as number;
      criteriaList.push([type, taskValue, runningValue]);
    }

    const criteriaToTextList = criteriaList.map(([type, taskValue, runningValue]) => {
      const progress = `${taskValue - runningValue}/${taskValue}`;
      return HeroUniverseHelper.getUniverseTaskCriteriaText(type, progress);
    });

    return criteriaToTextList.length > 0 ? criteriaToTextList : ['無任務條件'];
  }

  /** 取得教師派獎任務完成條件 */
  protected async getStudyTaskCriteria(detailStudyTask: StudyTaskRunning): Promise<void> {
    const criteriaList = [];

    if (detailStudyTask.multiDataTaskConditionType !== MultiDataTaskConditionType.None) {
      const dataIds = detailStudyTask.getMultiDataTaskDataIds();
      const runningValues = detailStudyTask.getMultiDataTaskValues();

      if (dataIds.length !== runningValues.length) {
        Helper.assert(ErrorId.VariableUndefined, `dataIds 和 values 長度不相等`);
      }

      for (let i = 0; i <= dataIds.length; i++) {
        if (dataIds[i] === undefined || runningValues[i] === undefined) {
          continue;
        }
        criteriaList.push([detailStudyTask.multiDataTaskConditionType, dataIds[i], runningValues[i]]);
      }
    }

    this.studyTaskCriteriaList = await Promise.all(
      criteriaList.map(async ([type, dataId, runningValue]): Promise<StudyTaskCriteria> => {
        switch (type) {
          case MultiDataTaskConditionType.FinishMultiContestWebGame:
            // API 取得賽事資訊
            const response: any = await contestDetailAPI.post({
              contestId: dataId,
              extraOptions: {
                numberOfPlayer: false,
              },
            });

            // 取得賽事資訊
            const contestDetailData = response as ContestDetailData;

            return {
              criteria: `完成 ${contestDetailData.contest.title}(${runningValue === 0 ? '已完成' : '未完成'})`,
              isBoss: contestDetailData.bossData !== null,
              contestId: contestDetailData.contest.id,
            };
          default:
            Helper.assert(ErrorId.VariableUndefined, `沒有此類型: ${type}`);
            return {
              criteria: '',
              isBoss: false,
              contestId: 0,
            };
        }
      }),
    );
  }

  /** 前往賽事 */
  protected goToContest(studyTaskCriteria: StudyTaskCriteria): void {
    this.$router.push({
      name: `${studyTaskCriteria.isBoss ? MenuName.BossContestInfoDetail : MenuName.ContestInfoDetail}`,
      params: { id: `${studyTaskCriteria.contestId}` },
    });
  }

  /**
   * 檢查任務是否可以放棄
   * @param {StudyTaskRunning} detailStudyTask - 任務詳情
   */
  protected canGiveUpTask(detailStudyTask: StudyTaskRunning): boolean {
    return detailStudyTask.expiryDate < new Date();
  }

  /**
   * 檢查任務是否可以回報
   * @param {StudyTaskRunning} detailStudyTask - 任務詳情
   */
  protected canReportTask(detailStudyTask: StudyTaskRunning): boolean {
    return detailStudyTask.isTaskCompleted(detailStudyTask);
  }

  /**
   * 放棄任務
   * @param {number} runningTaskUid - 任務的唯一標識符
   */
  protected async giveUpTask(runningTaskUid: number): Promise<void> {
    await HeroApiStudyTaskAPI.giveUpExpiredTask(runningTaskUid);
    this.afterTaskAction();
  }

  /**
   * 完成任務
   * @param {number} runningTaskUid - 任務的唯一標識符
   */
  protected async completeTask(runningTaskUid: number): Promise<void> {
    await HeroApiStudyTaskAPI.completeTask(runningTaskUid);
    this.afterTaskAction();
  }

  /**
   * 任務操作後執行的動作
   * @returns {Promise<void>}
   */
  private async afterTaskAction(): Promise<void> {
    this.closeTaskDetails();
    // 取得教師任務進行中任務列表
    this.studyTaskRunningList = await this.$$store.dispatch('refreshRunningStudyTaskList');
  }

  /**
   * 取得NPC資料
   * @param id NPC ID
   * @returns NPC資料
   */
  public getNpcData(npcId: number): string {
    const npcName = TableManager.heroUniverseNpc.findOne(npcId)?.name ?? '';
    return npcName;
  }

  /** 顯示宇宙任務詳情 */
  @Emit('onShowTaskDetails')
  protected showUniverseTaskDetails(information: UniverseTaskRunningInfo): void {
    this.detailInformation = information;
    this.taskDetailType = TaskDetailType.UniverseTask;
    this.isShowTaskList = false;
    this.isTaskDetailsVisible = true;
  }

  /** 顯示教師任務詳情 */
  @Emit('onShowTaskDetails')
  protected showStudyTaskDetails(studyTask: StudyTaskRunning): void {
    this.detailStudyTask = Object.assign(new StudyTaskRunning(), studyTask);
    this.detailStudyTask.effectiveDate = new Date(this.detailStudyTask.effectiveDate);
    this.detailStudyTask.expiryDate = new Date(this.detailStudyTask.expiryDate);

    this.getStudyTaskCriteria(this.detailStudyTask);
    this.taskDetailType = TaskDetailType.StudyTask;
    this.isTaskDetailsVisible = true;
  }

  /** 關閉任務詳情 */
  @Emit('onCloseTaskDetails')
  protected closeTaskDetails(): void {
    this.isTaskDetailsVisible = false;
  }

  @Emit('onViewCompleted')
  viewCompleted(): void {
    this.isShowTaskList = false;
    this.isTaskDetailsVisible = false;
  }
}
</script>

<style lang="scss" scoped>
.task-list {
  position: fixed;
  z-index: 100;
  top: 50%;
  right: 0 !important; /* 確保它位於視窗右側 */
  transform: translateY(-50%);
  transition: right 0.3s; /* 增加平滑的視覺過渡 */
}

// Customize el-pagination styles if needed
::v-deep .el-pagination {
  .btn-prev,
  .btn-next,
  .el-pager li {
    background-color: transparent;
    color: white;
    border: none;
  }

  .el-pager li.active {
    color: #409eff;
  }
}
</style>
