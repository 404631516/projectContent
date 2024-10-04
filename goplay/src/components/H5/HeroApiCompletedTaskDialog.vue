<template>
  <div>
    <!-- 已完成任務詳情對話框 -->
    <div v-if="isDialogVisible" class="task-details-overlay">
      <div class="task-details-container">
        <!-- 背景圖片 -->
        <div class="background-images">
          <!-- 上方圖片 -->
          <img :src="imgPath.universeFrameCornerC" class="corner-image top-left" alt="左上背景" />
          <img :src="imgPath.universeFrameMC" class="top-middle" alt="上方中間背景" />
          <img :src="imgPath.universeFrameCornerC" class="corner-image top-right" alt="右上背景" />

          <!-- 中間圖片 -->
          <img :src="imgPath.universeFrame50x400C" class="side-image left" alt="左側中間背景" />
          <img :src="imgPath.universeFrameBg02" class="center-image" alt="中央背景" />
          <img :src="imgPath.universeFrame50x400C" class="side-image right" alt="右側中間背景" />

          <!-- 下方圖片 -->
          <img :src="imgPath.universeFrameCornerC" class="corner-image bottom-left" alt="左下背景" />
          <img :src="imgPath.universeFrameMC" class="bottom-middle" alt="下方中間背景" />
          <img :src="imgPath.universeFrameCornerC" class="corner-image bottom-right" alt="右下背景" />
        </div>

        <!-- 內容 -->
        <div class="content-container">
          <!-- 左半邊顯示所有任務列表 -->
          <div class="task-list-container">
            <!-- 宇宙任務清單 -->
            <div class="universe-task-list">
              <div class="task-header">
                <img :src="imgPath.universeLeftTopBgC" alt="Universe Task Background" class="task-header-bg" />
                <div class="task-header-title">
                  {{ textData.universeTask }}
                </div>
              </div>
              <ul class="task-items" style="background-color: #3d3f3f">
                <div class="flex justify-center items-center">
                  <img :src="imgPath.universeLine252x2C" alt="Task Image" class="w-[90%]" />
                </div>
                <li
                  class="task-item"
                  v-for="taskItem in paginatedUniverseTaskList"
                  :key="taskItem.id"
                  @click="showUniverseTaskDetails(taskItem)"
                  :style="{
                    color:
                      taskDetailType == TaskDetailType.UniverseTask && detailTaskItem.id === taskItem.id
                        ? '#54b5e7'
                        : 'white',
                  }"
                >
                  <img :src="imgPath.universeIcon01LargeC" alt="Task Icon" class="task-icon" />
                  <span>{{ taskItem.taskName }}</span>
                </li>
              </ul>
              <div class="task-pagination-container">
                <img :src="imgPath.universeLeftBottomBgC" alt="Pagination Background" class="pagination-bg" />
                <el-pagination
                  class="task-pagination"
                  @current-change="handleUniverseTaskPageChange"
                  :current-page.sync="universeTaskCurrentPage"
                  :page-size="universeTaskPageSize"
                  layout="prev, pager, next"
                  :total="universeCompletedTaskItemList.length"
                >
                </el-pagination>
              </div>
            </div>
            <!-- 教師任務清單 -->
            <div class="teacher-task-list">
              <div class="task-header">
                <img :src="imgPath.universeLeftTopBgC" alt="Universe Task Background" class="task-header-bg" />
                <div class="task-header-title">
                  {{ textData.teacherTask }}
                </div>
              </div>
              <ul class="task-items" style="background-color: #3d3f3f">
                <div class="flex justify-center items-center">
                  <img :src="imgPath.universeLine252x2C" alt="Task Image" class="w-[90%]" />
                </div>
                <li
                  class="task-item"
                  v-for="{
                    studyTaskCompleteLog,
                    studyTaskTeacherDeliveryLog,
                  } in studyCompletedTaskPagedResult.entities"
                  :key="studyTaskCompleteLog.dataLogId"
                  @click="
                    showStudyTaskDetails({
                      studyTaskCompleteLog,
                      studyTaskTeacherDeliveryLog,
                    })
                  "
                  :style="{
                    color:
                      taskDetailType == TaskDetailType.StudyTask &&
                      detailStudyTaskCompleteLog.dataLogId === studyTaskCompleteLog.dataLogId
                        ? '#54b5e7'
                        : 'white',
                  }"
                >
                  <img :src="imgPath.universeIcon01LargeC" alt="Task Icon" class="task-icon" />
                  <span>{{ studyTaskTeacherDeliveryLog.taskName }}</span>
                </li>
              </ul>
              <div class="task-pagination-container" style="margin-bottom: 0px">
                <img :src="imgPath.universeLeftBottomBgC" alt="Pagination Background" class="pagination-bg" />
                <el-pagination
                  class="task-pagination"
                  @current-change="handleStudyTaskPageChange"
                  :current-page.sync="studyCompletedTaskPagedDto.page"
                  :page-size="studyCompletedTaskPagedDto.pageSize"
                  layout="prev, pager, next"
                  :total="studyCompletedTaskPagedResult.total"
                >
                </el-pagination>
              </div>
            </div>
          </div>
          <!-- 右半邊顯示任務詳情 -->
          <div class="task-details-right">
            <!-- 宇宙任務詳情 -->
            <div v-if="taskDetailType === TaskDetailType.UniverseTask" class="task-details-grid">
              <!-- 標題 -->
              <div class="task-title">
                <img :src="imgPath.universeRightTopBgC" alt="Task Log Background" class="task-title-bg" />
                <h2 class="task-title-text">
                  {{ textData.taskLog }}
                </h2>
              </div>
              <!-- 任務名稱與描述 -->
              <div class="task-info-container task-name-description" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">{{ detailTaskItem.taskName }}</div>
                  <div class="task-info-content">{{ detailTaskItem.taskDescription }}</div>
                </div>
              </div>
              <!-- 任務完成條件 -->
              <div class="task-info-container" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskCompletionCriteria }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <li v-for="(criteria, index) in getUniverseTaskCriteria(detailTaskItem)" :key="index">
                        <span class="gray-bullet">•</span> {{ criteria }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 回報NPC -->
              <div class="task-info-container" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.reportNpc }}</div>
                  <div class="task-info-content">{{ getNpcData(detailTaskItem.turnInNpcId) }}</div>
                </div>
              </div>
              <!-- 獎勵 -->
              <div class="task-info-container" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskAward }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <li v-for="award in getUniverseAwardList(detailTaskItem)" :key="award.itemType">
                        <span class="gray-bullet">•</span> {{ RewardManager.getTeacherAwardItemName(award) }} *
                        {{ award.count }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 任務操作按鈕 -->
              <div class="task-action-buttons" style="background-color: #3d3f3f">
                <div class="button-wrapper">
                  <img :src="imgPath.universeBtn150x40C" alt="Button background" class="button-bg" />
                  <button class="custom-button" @click="closeTaskDetails">
                    <img :src="imgPath.universeArrow" alt="Confirm Icon" class="button-icon" />
                    <span>{{ textData.confirm }}</span>
                  </button>
                </div>
              </div>
              <div class="task-footer">
                <img :src="imgPath.universeRightBottomBgC" alt="Task Log Background" class="task-footer-bg" />
              </div>
            </div>
            <!-- 教師任務詳情 -->
            <div v-if="taskDetailType === TaskDetailType.StudyTask" class="task-details-grid">
              <!-- 標題 -->
              <div class="task-title">
                <img :src="imgPath.universeRightTopBgC" alt="Task Log Background" class="task-title-bg" />
                <h2 class="task-title-text">
                  {{ textData.taskLog }}
                </h2>
              </div>
              <!-- 任務名稱與描述 -->
              <div class="task-info-container task-name-description" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">
                    {{ detailStudyTaskTeacherDeliveryLog.taskName }}
                  </div>
                  <div class="task-info-content">
                    {{ detailStudyTaskTeacherDeliveryLog.taskDescription }}
                  </div>
                </div>
              </div>
              <!-- 任務完成條件 -->
              <div class="task-info-container" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskCompletionCriteria }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <!-- 無任務條件 -->
                      <li v-if="studyTaskCriteriaList.length === 0">
                        <span class="gray-bullet">•</span> {{ textData.noTaskCondition }}
                      </li>
                      <!-- 有任務條件 -->
                      <li v-for="(studyTaskCriteria, index) in studyTaskCriteriaList" :key="index">
                        <span class="gray-bullet">•</span> {{ studyTaskCriteria.criteria }}
                        <div v-if="studyTaskCriteria.contestId" class="contest-button-container">
                          <img :src="imgPath.universeBtn150x40C" alt="Button background" class="contest-button-bg" />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 任務時間 -->
              <div class="task-info-container" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskTime }}</div>
                  <div class="task-info-content">
                    <div>
                      {{ textData.taskStart }}:
                      {{ TimeHelper.formatToAsiaTaipeiLocaleString(detailStudyTaskCompleteLog.takeAt, false) }}
                    </div>
                    <div>
                      {{ textData.taskEnd }}:
                      {{ TimeHelper.formatToAsiaTaipeiLocaleString(detailStudyTaskCompleteLog.finishedAt, false) }}
                    </div>
                  </div>
                </div>
              </div>
              <!-- 獎勵 -->
              <div class="task-info-container" style="background-color: #3d3f3f">
                <div class="task-info-row">
                  <div class="task-info-label">{{ textData.taskAward }}</div>
                  <div class="task-info-content">
                    <ul class="task-criteria-list">
                      <li v-for="award in getStudyTaskAwardList(detailStudyTaskCompleteRecord)" :key="award.itemType">
                        <span class="gray-bullet">•</span> {{ RewardManager.getTeacherAwardItemName(award) }} *
                        {{ award.count }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- 任務操作按鈕 -->
              <div class="task-action-buttons" style="background-color: #3d3f3f">
                <div class="button-wrapper">
                  <img :src="imgPath.universeBtn150x40C" alt="Button background" class="button-bg" />
                  <button class="custom-button" @click="closeTaskDetails">
                    <img :src="imgPath.universeArrow" alt="Confirm Icon" class="button-icon" />
                    <span>{{ textData.confirm }}</span>
                  </button>
                </div>
              </div>
              <div class="task-footer">
                <img :src="imgPath.universeRightBottomBgC" alt="Task Log Background" class="task-footer-bg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, ModelSync } from 'vue-property-decorator';
import { HeroUniverseTaskItem } from '@/hero-api/json-entity/hero-universe-task.table';
import { MultiDataTaskConditionType, TaskConditionType } from '@/hero-api/entity/base-task.entity';
import TableManager from '@/manager/TableManager';
import { Award, ContestAwardItemTypeEnum } from '@/hero-api/dto/award.dto';
import RewardManager from '@/manager/RewardManager';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { StudyTaskCompleteLog, StudyTaskTeacherDeliveryLog } from '@/hero-api/entity/study-task.entity';
import { contestDetailAPI } from '@/api/contest';
import { ContestDetailData } from '@/helper/interface/Contest';
import TimeHelper from '@/views/H5/Helper/TimeHelper';
import { StudyTaskCriteria, TaskDetailType } from './HeroApiTaskDialog.vue';
import imgPath from '@/config/imgPath/imgPath';
import HeroUniverseHelper from '@/views/H5/Helper/HeroUniverseHelper';
import { HeroApiListDataAPI } from '@/api/heroApiListData';
import { StudyGetCompletedTaskPagedResultDto, TaskCompletionRecord } from '@/hero-api/dto/study-task.dto';
import { ListDataDto } from '@/hero-api/dto/core.dto';

@Component({})
export default class HeroApiCompletedTaskDialog extends Vue {
  /** Import RewardManager.getTeacherAwardItemName 給vue(html)使用 */
  protected RewardManager = RewardManager;
  protected TaskDetailType = TaskDetailType;
  protected TimeHelper = TimeHelper;
  protected imgPath = imgPath;

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
    universeTaskList: '宇宙任務清單',
    teacherTaskList: '教師任務清單',
    taskTime: '任務時間',
    taskStart: '起始',
    taskEnd: '完成',
    noTaskCondition: '無任務條件',
    confirm: '確認',
  };

  /** 是否開啟任務詳情對話框 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  protected isDialogVisible!: boolean;
  /** 任務詳情類型 */
  protected taskDetailType: TaskDetailType = TaskDetailType.UniverseTask;

  /** 宇宙任務詳情 */
  protected detailTaskItem: HeroUniverseTaskItem = new HeroUniverseTaskItem({
    taskName: '',
    taskDescription: '',
    conditionType1: TaskConditionType.None,
    conditionType2: TaskConditionType.None,
    conditionType3: TaskConditionType.None,
    awardItemType1: ContestAwardItemTypeEnum.None,
    awardItemType2: ContestAwardItemTypeEnum.None,
    awardItemType3: ContestAwardItemTypeEnum.None,
  });

  /** 教師任務詳情 */
  protected detailStudyTaskCompleteRecord: TaskCompletionRecord = {
    studyTaskCompleteLog: new StudyTaskCompleteLog(),
    studyTaskTeacherDeliveryLog: new StudyTaskTeacherDeliveryLog(),
  };
  protected get detailStudyTaskCompleteLog(): StudyTaskCompleteLog {
    return this.detailStudyTaskCompleteRecord.studyTaskCompleteLog;
  }
  protected get detailStudyTaskTeacherDeliveryLog(): StudyTaskTeacherDeliveryLog {
    return this.detailStudyTaskCompleteRecord.studyTaskTeacherDeliveryLog;
  }

  /** 教師任務詳情-完成條件 */
  protected studyTaskCriteriaList: StudyTaskCriteria[] = [];

  /** 因雄宇宙已完成任務列表 */
  protected get universeCompletedTaskItemList(): HeroUniverseTaskItem[] {
    return this.$$store.getters.universeCompletedTaskItemList;
  }

  /** 宇宙任務分頁相關 */
  protected universeTaskCurrentPage: number = 1;
  protected universeTaskPageSize: number = 3;
  protected get paginatedUniverseTaskList(): HeroUniverseTaskItem[] {
    const startIndex = (this.universeTaskCurrentPage - 1) * this.universeTaskPageSize;
    const endIndex = startIndex + this.universeTaskPageSize;
    return this.universeCompletedTaskItemList.slice(startIndex, endIndex);
  }

  protected handleUniverseTaskPageChange(page: number): void {
    this.universeTaskCurrentPage = page;
  }

  protected studyCompletedTaskPagedDto: ListDataDto = {
    page: 1,
    pageSize: 10,
  };

  /** 教師任務已完成任務Page資料 */
  protected studyCompletedTaskPagedResult: StudyGetCompletedTaskPagedResultDto =
    new StudyGetCompletedTaskPagedResultDto({
      page: 1,
      pageSize: 3,
      total: 0,
      entities: [],
    });

  protected async handleStudyTaskPageChange(): Promise<void> {
    this.studyCompletedTaskPagedResult = await HeroApiListDataAPI.studyGetCompletedTaskListData(
      this.studyCompletedTaskPagedDto,
    );
  }

  /** 組件掛載後 */
  protected async mounted(): Promise<void> {
    // 初始化教師任務進行中任務列表
    await this.handleStudyTaskPageChange();
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
  protected getStudyTaskAwardList(taskCompletionRecord: TaskCompletionRecord): Award[] {
    return taskCompletionRecord.studyTaskTeacherDeliveryLog.getAwardList();
  }

  /** 取得宇宙任務完成條件名稱
   * @param detailInformation 任務詳情
   */
  protected getUniverseTaskCriteria(taskItem: HeroUniverseTaskItem): string[] {
    const criteriaList = [];
    for (let i = 1; i <= this.numOfCondition; i++) {
      const type = taskItem[`conditionType${i}` as keyof HeroUniverseTaskItem] as TaskConditionType;

      if (type === TaskConditionType.None) {
        continue;
      }

      const taskValue = taskItem[`conditionValue${i}` as keyof HeroUniverseTaskItem] as number;
      criteriaList.push([type, taskValue]);
    }

    const criteriaToTextList = criteriaList.map(([type, taskValue]) => {
      const progress = `${taskValue}/${taskValue}`;
      return HeroUniverseHelper.getUniverseTaskCriteriaText(type, progress);
    });

    return criteriaToTextList.length > 0 ? criteriaToTextList : ['無任務條件'];
  }

  /** 取得教師派獎任務完成條件 */
  protected async getStudyTaskCriteria(taskCompletionRecord: TaskCompletionRecord): Promise<void> {
    const criteriaList = [];

    const taskConditionDetails = taskCompletionRecord.studyTaskTeacherDeliveryLog.getTaskConditionDetails();
    if (taskConditionDetails.multiDataTaskConditionType !== MultiDataTaskConditionType.None) {
      const dataIds = taskConditionDetails.multiDataTaskDataIds || [];
      const runningValues = taskConditionDetails.multiDataTaskValues || [];

      if (dataIds.length !== runningValues.length) {
        Helper.assert(ErrorId.VariableUndefined, `dataIds 和 values 長度不相等`);
      }

      for (let i = 0; i <= dataIds.length; i++) {
        if (dataIds[i] === undefined || runningValues[i] === undefined) {
          continue;
        }
        criteriaList.push([taskConditionDetails.multiDataTaskConditionType, dataIds[i], runningValues[i]]);
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
              criteria: `完成 ${contestDetailData.contest.title}`,
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
  protected showUniverseTaskDetails(taskItem: HeroUniverseTaskItem): void {
    this.detailTaskItem = taskItem;
    this.taskDetailType = TaskDetailType.UniverseTask;
    this.isDialogVisible = true;
  }

  /** 顯示教師任務詳情 */
  @Emit('onShowTaskDetails')
  protected showStudyTaskDetails(taskCompletionRecord: TaskCompletionRecord): void {
    const studyTaskCompleteLog = Object.assign(new StudyTaskCompleteLog(), taskCompletionRecord.studyTaskCompleteLog);
    const studyTaskTeacherDeliveryLog = Object.assign(
      new StudyTaskTeacherDeliveryLog(),
      taskCompletionRecord.studyTaskTeacherDeliveryLog,
    );

    this.detailStudyTaskCompleteRecord = {
      studyTaskCompleteLog,
      studyTaskTeacherDeliveryLog,
    };

    this.detailStudyTaskCompleteLog.takeAt = new Date(this.detailStudyTaskCompleteLog.takeAt);
    this.detailStudyTaskCompleteLog.finishedAt = new Date(this.detailStudyTaskCompleteLog.finishedAt);

    this.getStudyTaskCriteria(this.detailStudyTaskCompleteRecord);
    this.taskDetailType = TaskDetailType.StudyTask;
    this.isDialogVisible = true;
  }

  /** 關閉任務詳情 */
  @Emit('onCloseTaskDetails')
  protected closeTaskDetails(): void {
    this.isDialogVisible = false;
  }
}
</script>

<style lang="scss" scoped>
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
