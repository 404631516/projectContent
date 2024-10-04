<template>
  <div>
    <!-- 加派任務一鍵派送 -->
    <div class="bg-gray-100 shadow-md">
      <div class="py-4 w-4/5 mx-auto">
        <h1 class="text-3xl font-bold -mb-[5px] text-[#D69F05] text-left">{{ textData.studentTaskProgress }}</h1>
        <p class="text-gray-400 text-left">{{ textData.singleTaskDetail }}</p>
        <hr class="border-black my-2" />

        <!-- 派送篩選區域 -->
        <div class="flex justify-center items-center">
          <span class="mr-2 font-bold">{{ textData.assignMoreTasks }}</span>
          <el-select class="mr-2" v-model="assignTaskType" @change="handleAssignTaskTypeChange">
            <el-option :label="textData.correctAnswerRate" :value="AssignTaskType.CorrectRate" />
            <el-option :label="textData.taskCompletionRate" :value="AssignTaskType.TaskCompletion" />
          </el-select>
          <span class="mr-2 font-bold">{{ textData.below }}</span>
          <el-select class="mr-2" v-model="assignTaskRate">
            <el-option
              v-for="option in getAssignTaskRateOption().entries()"
              :key="option[0]"
              :value="option[1]"
              :label="option[0]"
            />
          </el-select>
          <span class="mr-2 font-bold">{{ textData.ofStudents }}</span>
          <button class="sendButton" @click="handleAssignTask">
            {{ textData.oneClickAssign }}
          </button>
        </div>
      </div>
    </div>

    <!-- 任務說明與列表 -->
    <div class="w-4/5 mx-auto text-left py-3">
      <ul class="list-disc text-left">
        <li>
          <strong class="text-[#4898FF]">{{ textData.taskCompletionRate }}：</strong>
          <span class="text-gray-400">{{ textData.unitCompletionRate }}</span>
        </li>
        <li>
          <strong class="text-[#4898FF]">{{ textData.accuracyRate }}</strong>
          <span class="text-gray-400">{{ textData.studentCorrectAnswerPercentage }}</span>
        </li>
        <hr class="border-black my-2" />
      </ul>
    </div>

    <!-- 已派任務與完成度查詢 -->
    <div class="listDataGrid">
      <!-- 左側區域：已派任務列表 -->
      <div class="leftArea">
        <h2 class="text-md font-bold py-1 text-white bg-[#FF6F22] rounded-t-md">
          {{ textData.assignedTaskList }}
        </h2>

        <!-- 已派任務列表 -->
        <div style="border: 1px solid #ccc">
          <ul>
            <li
              v-for="task in deliveredTaskListDataResult.entities"
              :key="task.logUid"
              class="p-2 cursor-pointer hover:bg-gray-100"
              @click="showTaskDetailListData(task)"
            >
              <h2
                class="text-md font-bold py-1 px-2 text-white rounded-md w-full flex items-center"
                :class="logUid === task.logUid ? 'bg-[#4898FF]' : 'bg-[#9E9E9E]'"
              >
                <span class="flex-shrink-0">▶</span>
                <span class="flex-grow text-center">{{ task.taskName }}</span>
              </h2>
            </li>
          </ul>

          <el-pagination
            v-if="deliveredTaskListDataResult.total > deliveredTaskListDataDto.pageSize"
            class="pb-3"
            @current-change="handleDeliveredTaskPageChange"
            :current-page.sync="deliveredTaskListDataDto.page"
            :page-size="deliveredTaskListDataDto.pageSize"
            :total="deliveredTaskListDataResult.total"
            layout="prev, pager, next"
            :pager-count="3"
            prev-text="上一頁"
            next-text="下一頁"
          />
        </div>

        <!-- 任務完成度圓餅圖 -->
        <div v-if="pieChartData.size !== 0" class="status-pieChart">
          <PieChart :data="pieChartData" :showLegend="true" />
        </div>
      </div>

      <!-- 右側區域：任務詳細描述與完成度列表 -->
      <div class="rightArea">
        <!-- 標題文字 -->
        <div class="flex items-center bg-[#4898FF] text-white rounded-t-md h-[30px] text-left">
          <span class="px-2">▶</span>
          <span>{{ currentDeliveryLog?.taskName }}</span>
        </div>
        <!-- 詳細描述內容框 -->
        <div class="flex-grow overflow-y-auto mt-1 min-h-[100px] text-left px-2 py-1" style="border: 1px solid #ccc">
          {{ currentDeliveryLog?.taskDescription }}
        </div>
        <!-- 下方的 DataGrid -->
        <DataGrid
          class="dataGrid"
          v-if="logUid != 0"
          :fetchApi="getStudentTaskStatusApi"
          :columns="StudentCompleteStatusColumns"
          :isShowFilterBlock="false"
          :tableHeaderCellStyle="tableHeaderCellStyle"
          :tableCellStyle="tableCellStyle"
        >
        </DataGrid>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/** 定義派送任務類型 */
enum AssignTaskType {
  CorrectRate = 0,
  TaskCompletion = 1,
}

import { Component, Vue } from 'vue-property-decorator';
import { Column } from '@/helper/interface/DataGrid';
import { FilterType } from '@/helper/enum/DataGrid';
import DataGrid from '@/components/DataGrid/DataGrid.vue';
import { StudyTaskTeacherDeliveryLog } from '@/hero-api/entity/study-task.entity';
import { HeroApiStudyTaskAPI } from '@/api/heroApiStudyTask';
import {
  GetDeliveredTasksPagedResultDto,
  GetStudentCompleteStatusListDataDto,
  GetStudentCompleteStatusPagedResultDto,
  StudentTaskStatus,
} from '@/hero-api/dto/study-task.dto';
import { ListDataDto, PagedResultDto } from '@/hero-api/dto/core.dto';
import { MssrSimpleUserInfo } from '@/hero-api/module/mssr/bridge/dto/bridge-user.dto';
import { StudyTaskDetail } from '@/hero-api/entity/base-task.entity';
import { HeroApiListDataAPI } from '@/api/heroApiListData';
import { cellCallbackParams } from 'element-ui/types/table';
import { MenuName } from '@/helper/enum/MenuName';
import PieChart from '@/components/DataDashboardOverview/PieChart.vue';
import { Message } from '@/helper/class/Common';
import Helper, { ErrorId } from '../H5/Helper/Helper';
import { contestNameListAPI } from '@/api/contestGame';

@Component({
  components: {
    DataGrid,
    PieChart,
  },
})
export default class DeliveredTaskListDataGrid extends Vue {
  /** 派送任務類型 */
  private readonly AssignTaskType = AssignTaskType;
  /** 完成度欄位範圍 */
  private readonly completedColumnIndexRange = [3, 5];
  /** 單次詳細任務最大的學生數量 */
  private readonly maxStudentCountPerTask = 50;
  /** 文字數據 */
  private readonly textData = {
    studentTaskProgress: '學生完成任務進度',
    singleTaskDetail: '單次派任務的詳細資料',
    assignMoreTasks: '加派任務給',
    correctAnswerRate: '答題正確率',
    taskCompletionRate: '任務完成度',
    below: '低於',
    ofStudents: '的學生',
    oneClickAssign: '一鍵派送',
    unitCompletionRate: '學生完成指定單元的數量比例',
    accuracyRate: '答對率：',
    studentCorrectAnswerPercentage: '學生在所有已完成單元中答對題目的百分比',
    assignedTaskList: '已派任務列表',
  };

  /** 指定之派送任務logUid */
  private logUid: number = 0;
  /** 目前已派任務記錄 */
  private currentDeliveryLog: StudyTaskTeacherDeliveryLog | null = null;

  /** 已派任務列表資料DTO */
  private deliveredTaskListDataDto: ListDataDto = {
    page: 1,
    pageSize: 10,
  };
  /** 已派任務列表資料結果 */
  private deliveredTaskListDataResult: GetDeliveredTasksPagedResultDto = new GetDeliveredTasksPagedResultDto({
    entities: [],
    page: 1,
    pageSize: 10,
    total: 0,
  });

  /** 圓餅圖數據 */
  private pieChartData = new Map<string, number>();

  /** 派送任務類型 */
  private assignTaskType: AssignTaskType = AssignTaskType.CorrectRate;
  private assignTaskRate: number = 0.1;

  /** 目前學生任務資料列表 */
  private currentStudentCompleteStatusListDataResult: GetStudentCompleteStatusPagedResultDto =
    new GetStudentCompleteStatusPagedResultDto({
      entities: [],
      page: 1,
      pageSize: this.maxStudentCountPerTask,
      total: 0,
    });

  async mounted() {
    this.handleDeliveredTaskPageChange();
  }

  /** 當任務列表分頁變更時，根據新頁碼加載對應的已派任務數據 */
  private async handleDeliveredTaskPageChange() {
    this.deliveredTaskListDataResult = await HeroApiListDataAPI.getDeliveredTaskListData(this.deliveredTaskListDataDto);
  }

  /** 取得學生任務完成度於dataGrid中顯示 */
  protected async getStudentTaskStatusApi(listDataDto: ListDataDto): Promise<PagedResultDto<StudentTaskStatus>> {
    const dto = Object.assign(new GetStudentCompleteStatusListDataDto(), listDataDto);

    // 防呆
    if (this.currentDeliveryLog == null) {
      throw new Error('deliveryLog is null');
    }
    const taskConditionDetails = this.currentDeliveryLog.getTaskConditionDetails();
    if (taskConditionDetails == null) {
      throw new Error('taskConditionDetails is null');
    }
    const multiDataTaskDataIds = taskConditionDetails.multiDataTaskDataIds;
    if (multiDataTaskDataIds == null) {
      throw new Error('multiDataTaskDataIds is null');
    }

    // 取得賽事名稱
    const contestNames = (await contestNameListAPI.post({
      contestIds: multiDataTaskDataIds,
    })) as string[];

    // 重新設定欄位名稱
    const defaultContestName = '未指定';
    Vue.set(this.StudentCompleteStatusColumns[3], 'label', contestNames[0] || defaultContestName);
    Vue.set(this.StudentCompleteStatusColumns[4], 'label', contestNames[1] || defaultContestName);
    Vue.set(this.StudentCompleteStatusColumns[5], 'label', contestNames[2] || defaultContestName);

    // 夾帶logUid
    dto.logUid = this.logUid;
    return HeroApiStudyTaskAPI.listStudentsCompleteStatus(dto);
  }

  /** 資料表欄位 */
  protected StudentCompleteStatusColumns: Column[] = [
    {
      label: '姓名',
      key: 'simpleUserInfo',
      sortable: true,
      filterType: FilterType.Text,
      transform: (simpleUserInfo: MssrSimpleUserInfo) => {
        return simpleUserInfo.userName;
      },
    },
    {
      label: '任務完成度',
      key: 'multiDataTaskValues',
      sortable: true,
      filterType: FilterType.Text,
      transform: (multiDataTaskValues: number[]) => {
        // 計算已完成的條件數量
        const completeCount = multiDataTaskValues.filter((value) => value === 0).length;
        return `${completeCount}/${multiDataTaskValues.length}`;
      },
    },
    {
      label: '答對率',
      key: 'detail',
      sortable: true,
      filterType: FilterType.Text,
      transform: (detail: string) => {
        if (detail == null || detail === '') {
          return '-';
        }
        // 顯示答對率百分比, 並四捨五入到小數點第二位
        const correctRate = this.calculateCorrectRate(detail);
        return (correctRate * 100).toFixed(2) + '%';
      },
    },
    {
      label: '指定單元1',
      key: 'multiDataTaskValues',
      sortable: true,
      filterType: FilterType.Text,
      transform: (multiDataTaskValues: number[]) => {
        if (multiDataTaskValues[0] == null) {
          return '-';
        }
        const isContestComplete = multiDataTaskValues[0] === 0;
        return isContestComplete ? '完成' : '未完成';
      },
    },
    {
      label: '指定單元2',
      key: 'multiDataTaskValues',
      sortable: true,
      filterType: FilterType.Text,
      transform: (multiDataTaskValues: number[]) => {
        if (multiDataTaskValues[1] == null) {
          return '-';
        }
        const isContestComplete = multiDataTaskValues[1] === 0;
        return isContestComplete ? '完成' : '未完成';
      },
    },
    {
      label: '指定單元3',
      key: 'multiDataTaskValues',
      sortable: true,
      filterType: FilterType.Text,
      transform: (multiDataTaskValues: number[]) => {
        if (multiDataTaskValues[2] == null) {
          return '-';
        }
        const isContestComplete = multiDataTaskValues[2] === 0;
        return isContestComplete ? '完成' : '未完成';
      },
    },
  ];

  /** 計算答對率 */
  protected calculateCorrectRate(detail: string): number {
    // json parse
    const taskDetail: StudyTaskDetail = Helper.jsonParse(detail);
    // 計算答對率
    let totalCorrectCount = 0;
    let totalAnswerCount = 0;
    taskDetail.contestWebGameTaskDetails.forEach((contestWebGameTaskDetail) => {
      totalCorrectCount += contestWebGameTaskDetail.quizCorrectCount;
      totalAnswerCount += contestWebGameTaskDetail.quizAnswerCount;
    });

    return totalAnswerCount === 0 ? 0 : totalCorrectCount / totalAnswerCount;
  }

  /**
   * 顯示任務的詳細資料(學生完成任務進度)
   * @param log 任務資料
   */
  protected async showTaskDetailListData(log: StudyTaskTeacherDeliveryLog): Promise<void> {
    // 強制刷新頁面
    this.logUid = 0;
    await this.$nextTick();

    // 更新目前顯示的任務詳細資料
    this.logUid = log.logUid;
    this.currentDeliveryLog = new StudyTaskTeacherDeliveryLog();
    Object.assign(this.currentDeliveryLog, log);

    // 獲取全學生任務完成度以利更新圖表數據及一鍵派送功能
    this.currentStudentCompleteStatusListDataResult = await HeroApiStudyTaskAPI.listStudentsCompleteStatus({
      logUid: this.logUid,
      page: 1,
      pageSize: this.maxStudentCountPerTask,
    });

    // 更新圖表數據
    this.updatePieChartData();
  }

  /** 取得學生任務完成度並更新圖表數據 */
  private async updatePieChartData(): Promise<void> {
    // 初始化完成與未完成數量
    let completedCount = 0;
    let uncompletedCount = 0;

    this.currentStudentCompleteStatusListDataResult.entities.forEach((studentTaskStatus) => {
      // 使用 some 方法檢查是否有任何值大於 0 表示未完成
      const isAnyTaskIncomplete = studentTaskStatus.multiDataTaskValues.some((value) => value > 0);

      if (isAnyTaskIncomplete) {
        uncompletedCount++;
      } else {
        completedCount++;
      }
    });

    // 將結果存到 pieChartData，更新圖表
    this.pieChartData = new Map<string, number>([
      ['完成', completedCount],
      ['未完成', uncompletedCount],
    ]);
  }

  /** 表格標題Cell樣式 */
  protected tableHeaderCellStyle(cell: cellCallbackParams): object {
    return { backgroundColor: '#4898ff', color: '#fff' };
  }

  /** 表格內容Cell樣式 */
  protected tableCellStyle(cell: cellCallbackParams): object {
    const defaultCss: { [key: string]: string } = { border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' };

    // 一般欄位不調整CSS
    if (cell.columnIndex < this.completedColumnIndexRange[0] || cell.columnIndex > this.completedColumnIndexRange[1]) {
      return defaultCss;
    }

    // 完成度欄位調整CSS
    const row = cell.row as { multiDataTaskValues?: number[] };
    const taskValue = row.multiDataTaskValues?.[cell.columnIndex - this.completedColumnIndexRange[0]];

    if (taskValue !== undefined) {
      // 0: 完成, 1: 未完成
      defaultCss.color = taskValue === 0 ? '#3BC1FA' : '#FF6464';
    }

    return defaultCss;
  }

  /** 派送任務類型變更 */
  private handleAssignTaskTypeChange(value: AssignTaskType) {
    // 重新設定派送率選項
    this.assignTaskRate = this.getAssignTaskRateOption().values().next().value;
  }

  /** 派送任務類型對應的派送率 */
  private getAssignTaskRateOption(): Map<string, number> {
    if (this.assignTaskType === AssignTaskType.CorrectRate) {
      return new Map([
        ['10%', 0.1],
        ['20%', 0.2],
        ['30%', 0.3],
      ]);
    } else if (this.assignTaskType === AssignTaskType.TaskCompletion) {
      return new Map([
        ['1/3', 0.34],
        ['2/3', 0.67],
        ['3/3', 1],
      ]);
    }
    return new Map();
  }

  /** 一鍵派送功能 */
  private async handleAssignTask(): Promise<void> {
    if (this.logUid === 0) {
      Message.info('請先選擇一個任務');
      return;
    }

    let filteredStudentTaskStatusList: StudentTaskStatus[] = [];

    if (this.assignTaskType === AssignTaskType.CorrectRate) {
      // 篩選答題正確率低於選擇的比例的學生
      filteredStudentTaskStatusList = this.currentStudentCompleteStatusListDataResult.entities.filter(
        (studentTaskStatus) => {
          if (studentTaskStatus.detail == null || studentTaskStatus.detail === '') {
            return false;
          }

          // 解析任務詳細資料
          const taskDetail: StudyTaskDetail = Helper.jsonParse(studentTaskStatus.detail);

          // 計算答對率
          const correctRate = this.calculateCorrectRate(studentTaskStatus.detail);
          return correctRate < this.assignTaskRate;
        },
      );
    } else if (this.assignTaskType === AssignTaskType.TaskCompletion) {
      // 篩選任務完成度低於選擇的比例的學生
      filteredStudentTaskStatusList = this.currentStudentCompleteStatusListDataResult.entities.filter(
        (studentTaskStatus) => {
          // 計算已完成的單元數量（值為0表示完成）
          const completedUnits = studentTaskStatus.multiDataTaskValues.filter((value) => value === 0).length;
          // 計算總單元數量
          const totalUnits = studentTaskStatus.multiDataTaskValues.length;
          // 計算完成率
          const completionRate = totalUnits > 0 ? completedUnits / totalUnits : 0;
          // 如果完成率低於閾值，則包含在篩選結果中
          return completionRate < this.assignTaskRate;
        },
      );
    }

    if (filteredStudentTaskStatusList.length === 0) {
      Message.info('沒有符合條件的學生');
      return;
    }

    // 將處理後的 updatedFilteredStudents 資料存到 updatedStudentData
    // 使用預設值 -1 來代表不指定年級、班級、年度
    this.$$store.commit('updateAssignStudentsInfo', {
      year: -1,
      grade: -1,
      class: -1,
      studentList: filteredStudentTaskStatusList.map((studentTaskStatus) => studentTaskStatus.simpleUserInfo),
    });

    // 跳轉到教師派任務頁面
    this.$router.push({ path: `/${MenuName.TeacherAdmin}/${MenuName.StudyTask}` });
  }
}
</script>

<style scoped>
.status-pieChart {
  border: 1px solid #d9d9d9;
  margin-top: 5px;
  margin-bottom: 5px;
}

::v-deep .el-pagination .btn-prev,
::v-deep .el-pagination .btn-next {
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 0 4px;
  height: 26px;
  line-height: 26px;
}

::v-deep .el-pagination .el-pager li {
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  margin: 0 2px;
  min-width: 26px;
  line-height: 26px;
  height: 26px;
  color: #4898ff;
}

::v-deep .el-pagination .el-pager li.active {
  background-color: #4898ff;
  color: #fff;
  border-color: #4898ff;
}

::v-deep .el-table .el-table__header-wrapper .el-table__header {
  border-collapse: separate;
  border-spacing: 2px;
  width: auto !important;
}

::v-deep .el-table .el-table__body-wrapper .el-table__body {
  border-collapse: separate;
  border-spacing: 2px;
  width: auto !important;
}

::v-deep .sort-caret.ascending {
  border-bottom-color: #fff;
}

::v-deep .sort-caret.descending {
  border-top-color: #fff;
}

::v-deep .ascending .sort-caret.ascending {
  border-bottom-color: #030303;
}

::v-deep .descending .sort-caret.descending {
  border-top-color: #030303;
}

.sendButton {
  background: #ffb02e;
  color: #fff;
  font-weight: 700;
  padding: 0.25rem 20px;
  border-radius: 0.25rem; /* 4px */
  line-height: 1.25;
  box-shadow: 2px 2px 5px #888888;
}

.sendButton:hover {
  background: #d69f05;
}

.listDataGrid {
  display: flex;
  width: 80%;
  margin: auto;
}

.leftArea {
  width: 28.571429%;
  margin-right: 16px;
  min-width: 220px;
}

.rightArea {
  width: 71.428571%;
  flex-grow: 1;
}

.dataGrid {
  margin-left: -22px;
  margin-right: -22px;
  margin-top: -20px;
}

@media (max-width: 768px) {
  .listDataGrid {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .leftArea {
    width: 80%;
    margin-left: 0;
    margin-bottom: 10px;
  }

  .rightArea {
    width: 80%;
    margin-left: 0;
  }

  .dataGrid {
    margin-left: 0;
    margin-right: 0;
    margin-top: 0;
  }
}
</style>
