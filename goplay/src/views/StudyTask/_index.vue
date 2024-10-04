<template>
  <div class="bg-white">
    <!-- 橫幅 -->
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.teacherAward" />
    <StudentNameSelectBar
      :searchBarSetting="searchBarSetting"
      :isDisableSearch="isDisableSearch"
      @onSelectStudent="updateChosenStudentList"
      @onSearch="onSearch"
    />

    <div class="max-w-7xl w-11/12 flex flex-row mx-auto">
      <!-- 學生列表 -->
      <div class="w-full">
        <div class="award-list">
          <h3 class="text-white bg-[#fe6f21] text-left p-2 pl-[20px] rounded-tl-[10px] rounded-tr-[10px]">
            {{ textData.studentListForTasks }}
          </h3>
          <div class="warning-date text-black text-right bg-[#ffefe3] p-2 fs-[10px]">
            {{ textData.eachStudentReceivesSelectedPrize }}
            {{ textData.removeStudentByClickingX }}
          </div>
          <div>
            <div class="mt-3 flex flex-col">
              <div v-if="chosenStudentList.length === 0">
                {{ textData.studentNotSelectedYet }}
              </div>
              <div v-else class="flex flex-row flex-wrap">
                <button
                  v-for="student in chosenStudentList"
                  :key="student.uid"
                  class="rounded-3xl shadow-default max-w-24 mb-3 bg-black opacity-50 text-white px-3 py-1 mx-2"
                >
                  {{ student.name }}
                  <i class="el-icon-close" @click="removeChosenStudent(student)"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-start m-[20px]">
          {{ textData.remainingNumber }}{{ 50 - chosenStudentList.length }}/{{ 50 }}
        </div>
        <div v-if="50 - chosenStudentList.length < 0" class="flex justify-start m-[20px] text-red-500">
          {{ textData.maxStudents }}
        </div>
        <div class="flex justify-start ml-[20px">
          <el-checkbox v-model="isTaskCompletionRequiredForAward"></el-checkbox>
          {{ textData.isTaskCompletionRequiredForAward }}
        </div>
      </div>
    </div>

    <div v-if="isTaskCompletionRequiredForAward === true">
      <div class="max-w-7xl w-11/12 flex flex-col mx-auto mt-[20px]">
        <h3 class="sendTaskTitle">{{ textData.teacherSendTask }}</h3>
        <div m="t-3" p="t-3" border="t-1px solid #b2b2b2"></div>
        <div class="text-[#d69f05] flex m-2.5 whitespace-nowrap w-1/2 items-center">
          <div class="m-2.5 font-bold">{{ textData.taskName }}</div>
          <el-input v-model="taskNameInput" placeholder="任務名稱輸入框......" size="mini"></el-input>
        </div>
        <div class="text-[#d69f05] flex flex-col m-2.5 whitespace-nowrap">
          <div class="flex m-2.5 font-bold justify-start">{{ textData.taskDescription }}</div>
          <el-input
            v-model="taskDescriptionInput"
            placeholder="具體任務內容詳細描述......"
            type="textarea"
            size="medium"
          ></el-input>
        </div>
        <div class="flex justify-start m-[1s0px]">
          <!-- 後端尚未將剩餘最大次數的API寫好，先暫時寫死 -->
          {{ textData.remainingAssignmentsForThisWeek
          }}{{ studyTaskCountInfo.maxTaskCount - studyTaskCountInfo.usedStudyTaskCount }}/{{
            studyTaskCountInfo.maxTaskCount
          }}
        </div>
      </div>

      <div class="max-w-7xl w-11/12 flex flex-row mx-auto">
        <div>
          <div>
            <!-- 賽事卡片 -->
            <div class="world-content" v-if="contestListData.length !== 0">
              <GameCardList
                :contestDataList="contestListData"
                :isAddCard="false"
                :cardType="cardType"
                :hideContestType="hideContestType"
                @onClickTaskAdd="addContestToTaskCondition"
              />
              <!-- 分頁 -->
              <div class="page-box block flex-pos">
                <el-pagination
                  layout="prev, pager, next"
                  :total="contestListSize"
                  :page-size="contestPerPage"
                  :hide-on-single-page="true"
                  @current-change="onSwitchPage"
                ></el-pagination>
              </div>
            </div>
          </div>

          <!-- 答題遊戲 -->
          <div>
            <CourseSelect
              :subjectId="defaultSubject"
              @onSelectCourse="addCourseToTaskCondition"
              :buttonType="buttonType"
            />
          </div>
        </div>

        <div class="task-condition">
          <h3 class="text-white bg-[#fe6f21] text-left p-2 pl-[20px] rounded-tl-[10px] rounded-tr-[10px]">
            {{ textData.taskManagementInterface }}
          </h3>
          <ul>
            魔王賽條件：
            <div m="t-3" p="t-3" border="t-1px dashed #b2b2b2"></div>
            <li v-for="(contest, index) in selectedContests" :key="index">
              {{ contest }}
              <button class="el-icon-close" @click="removeContestFromTaskCondition(index)" />
            </li>
          </ul>
          <ul>
            答題遊戲課程條件：
            <div m="t-3" p="t-3" border="t-1px dashed #b2b2b2"></div>
            <li v-for="(course, index) in selectedCourses" :key="index">
              {{ course }}
              <button class="el-icon-close" @click="removeCourseFromTaskCondition(index)" />
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="max-w-7xl w-11/12 flex flex-col mx-auto items-center">
      <!-- 獎品清單 -->
      <AwardList ref="awardListRef" @updateAwardList="updateAwardList" :chosenStudentList="chosenStudentList" />

      <button
        m="3"
        class="flex yellowGradient rounded-3xl shadow-default max-w-[100px]"
        p="x-6 y-2"
        text="[#FFF] 1.5rem"
        @click="handleSubmit"
      >
        {{ textData.submit }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import { Component, Vue } from 'vue-property-decorator';
import {
  UserRole,
  CountyType,
  ContestSortType,
  ContestSortOrder,
  ResponseState,
  ContestCardType,
  SubjectType,
} from '@/helper/enum/Common';
import StudentNameSelectBar from '@/components/StudyTask/StudentNameSelectBar.vue';
import { searchOptionData } from '@/components/BackEndManagement/StatisticReport/SearchOptionData';
import StatisticChartList from '@/components/BackEndManagement/StatisticReport/StatisticChartList.vue';
import AwardList from '@/components/StudyTask/AwardList.vue';
import { SearchBarSetting, SearchData, StudentData } from '@/helper/interface/TeacherAdmin';
import { TeacherDeliveryAward } from '@/hero-api/dto/teacher-award-inventory.dto';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import GameCardList from '@/components/WorldContest/GameCardList.vue';
import { ContestListData, ContestOptions, GameDetail } from '@/helper/interface/Contest';
import { Load, Message } from '@/helper/class/Common';
import { contestListAPI } from '@/api/contest';
import CourseSelect from '@/views/CourseMenu/CourseSelect.vue';
import { CourseDetail } from '@/helper/interface/CourseMenu';
import { adlEduAPI } from '@/api/login';
import { handleAPIError } from '@/helper/fnc/common';
import { HeroApiStudyTaskAPI } from '@/api/heroApiStudyTask';
import { TeacherWeekDeliveryAwardAPI } from '@/api/TeacherAward';
import { ButtonType } from '@/components/CourseMenu/CourseBtnList.vue';
import { GetStudyTaskCountInfoResultDto } from '@/hero-api/dto/teacher-admin-resource.dto';

@Component({
  components: {
    GeneralBanner,
    StudentNameSelectBar,
    StatisticChartList,
    AwardList,
    GameCardList,
    CourseSelect,
  },
})
export default class StudyTask extends Vue {
  /** 搜尋欄設定 */
  private searchBarSetting: SearchBarSetting = {
    fixSchool: this.$$store.getters.userSchoolId,
    fixCounty: CountyType.None,
    searchOption: searchOptionData.filter((searchData) => searchData.userRole.includes(UserRole.TCH)),
  };
  /** 是否禁用搜尋 */
  private isDisableSearch = false;
  /** 圖片數據 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };
  /** 文字數據 */
  private textData = {
    teacherAward: '教師派任務系統',
    studentListForTasks: '欲發放任務的學生列表',
    eachStudentReceivesSelectedPrize: '*每個學生都可以得到一份底下所選的獎品',
    removeStudentByClickingX: '，按下X可以將學生從列表中移除',
    studentNotSelectedYet: '尚未選擇學生',
    submit: '送出',
    taskManagementInterface: '任務管理介面',
    taskDescription: '任務描述',
    availableBossBattlesWithinTime: '時間內可進行的魔王賽',
    quizGameSelectionArea: '答題遊戲選擇區',
    taskAdd: '新增任務',
    taskName: '任務名稱',
    teacherSendTask: '導師指派任務',
    isTaskCompletionRequiredForAward: '領獎是否需要先完成任務',
    remainingNumber: '剩餘人數：',
    remainingAssignmentsForThisWeek: '本週指派任務剩餘次數：',
    maxTaskConditions: '任務條件最多設定3個',
    maxStudents: '最多選擇50位學生！',
  };
  /** 被選擇的學生列表 */
  private chosenStudentList: StudentData[] = [];
  /** 選擇的獎品列表 */
  private selectedAwardList: TeacherDeliveryAward[] = [];

  /** 賽事清單資料 */
  private contestListData: ContestListData[] = [];
  /** 賽事總數 */
  private contestListSize = 0;
  /** 每頁顯示的賽事數量 */
  private readonly contestPerPage = 4;
  /** 當前頁數 */
  private currentPageIndex = 0;
  /** 賽事卡片類型 */
  private cardType: ContestCardType = ContestCardType.BackEndTaskCondition;
  /** 不想顯示的賽事類型(敲敲答答) */
  private readonly hideContestType: number = 19;

  /** 初始科目 */
  private defaultSubject: SubjectType = SubjectType.Chinese;
  /** 選中的答題遊戲 */
  private course!: GameDetail;
  /** 答題遊戲類型 */
  private buttonType: ButtonType = ButtonType.Plus;

  /** 選中的賽事名稱列表 */
  private selectedContests: string[] = [];
  /** 選中的課程名稱列表 */
  private selectedCourses: string[] = [];
  /** 需要送出的賽事和課程ID列表 */
  private sendOutItems: { contests: number[]; courses: number[] } = { contests: [], courses: [] };
  /** 選擇的日期範圍 */
  private selectedDate: { gameStartDayId: number; gameEndDayId: number } = { gameStartDayId: 0, gameEndDayId: 0 };
  /** 送出的選擇任務日期 */
  private selectedTaskDate!: { effectiveDate: Date; expiryDate: Date };
  /** 搜尋資料 */
  private searchData: SearchData = {} as SearchData;

  /** 任務名稱 */
  private taskNameInput = '';
  /** 任務描述 */
  private taskDescriptionInput = '';
  /** 切換獎勵是否顯示任務 */
  private isTaskCompletionRequiredForAward: boolean = false;
  /** 剩餘任務次數資訊 */
  private studyTaskCountInfo: GetStudyTaskCountInfoResultDto = new GetStudyTaskCountInfoResultDto(0, 0);

  async created() {
    if (!this.$$store.getters.hasSchool) {
      Helper.assert(ErrorId.InvalidIdentity, '請確認身份是否具備學校資訊，目前無所屬學校！');
    }
    this.getContestList();
    this.getRemainingTaskCount();
  }

  /** 取得賽事列表 */
  private async getContestList(): Promise<void> {
    const options: ContestOptions = {
      extraOptions: {
        numberOfPlayer: true,
        rankRewardState: true,
      },
      filterOptions: {
        teamType: [],
        gameType: [],
        subjectType: [],
        state: [],
        gradeFilter: [],
        onlyHaveScore: false,
        gameStartDayId: this.selectedDate.gameStartDayId,
        gameEndDayId: this.selectedDate.gameEndDayId,
      },
      pageOptions: {
        page: this.currentPageIndex,
        pageSize: this.contestPerPage,
      },
      sortOptions: {
        keywordType: ContestSortType.GameStart,
        sortType: ContestSortOrder.Descending,
      },
    };

    Load.use(true);

    try {
      const response: any = await contestListAPI.post(options);

      if (response.result === ResponseState.Success) {
        this.contestListData = response.contestList as ContestListData[];
        this.contestListSize = response.totalSize as number;
      } else {
        throw new Error(response.resMessage);
      }
    } catch (error) {
      Message.error(`${error}`);
    } finally {
      Load.use(false);
    }
  }

  /** 切換頁面
   * @param pageIndex 頁碼
   */
  private onSwitchPage(pageIndex: number): void {
    this.currentPageIndex = pageIndex - 1;
    this.getContestList();
  }

  /**
   * 添加賽事到任務條件列表
   * @param contestId 賽事ID
   */
  private addContestToTaskCondition(contestId: number): void {
    // 如果已經有三個條件了，就不再添加
    if (this.sendOutItems.contests.length + this.sendOutItems.courses.length >= 3) {
      Message.info(this.textData.maxTaskConditions);
      return;
    }
    const findContest = this.contestListData.find((contest) => contest.id === contestId);
    if (findContest && !this.sendOutItems.contests.includes(findContest.id)) {
      this.selectedContests.push(findContest.title);
      this.sendOutItems.contests.push(findContest.id);
    } else {
      Message.info('已經添加進入條件之中，請重新確認條件');
    }
  }

  /**
   * 從任務條件列表中移除賽事
   * @param index 賽事或課程的索引
   */
  private removeContestFromTaskCondition(index: number): void {
    if (index < this.sendOutItems.contests.length) {
      this.sendOutItems.contests.splice(index, 1);
      this.selectedContests.splice(index, 1);
    }
  }

  /**
   * 添加答題遊戲到任務條件列表
   * @param selectedCourse 新選擇的課程
   */
  private async addCourseToTaskCondition(selectedCourse: CourseDetail): Promise<void> {
    // 如果已經有三個條件了，就不再添加
    if (this.sendOutItems.contests.length + this.sendOutItems.courses.length >= 3) {
      Message.info(this.textData.maxTaskConditions);
      return;
    }
    const data = {
      game_link_id: selectedCourse.course.game_link_id,
    };

    try {
      const response: any = await adlEduAPI.fetch(data);
      if (response.result === ResponseState.Success) {
        if (!this.sendOutItems.courses.includes(response.contestId)) {
          this.selectedCourses.push(selectedCourse.course.unit_name);
          this.sendOutItems.courses.push(response.contestId);
        } else {
          Message.info('已經添加進入條件之中，請重新確認條件');
        }
      } else {
        handleAPIError(response.result, response.resMessage);
      }
    } catch (error) {
      Message.error(`${error}`);
    } finally {
      Load.use(false);
    }
  }

  /**
   * 從任務條件列表中移除課程
   * @param index 課程索引
   */
  private removeCourseFromTaskCondition(index: number): void {
    if (index < this.sendOutItems.courses.length) {
      this.sendOutItems.courses.splice(index, 1);
      this.selectedCourses.splice(index, 1);
    }
  }

  /**
   * 更新獎品數據列表
   * @param updatedAwardList 新的獎品數據列表
   */
  private updateAwardList(updatedAwardList: TeacherDeliveryAward[]): void {
    this.selectedAwardList = updatedAwardList;
  }

  /**
   * 更新被選擇的學生列表
   * @param receivedStudentList 從子組件接收到的學生列表
   */
  private updateChosenStudentList(receivedStudentList: StudentData[]): void {
    this.chosenStudentList = receivedStudentList;
  }

  /**
   * 從選擇的學生列表中移除特定學生
   * @param studentToRemove 需要移除的學生資料
   */
  private removeChosenStudent(studentToRemove: StudentData): void {
    const index = this.chosenStudentList.findIndex(
      (student) => student.name === studentToRemove.name && student.uid === studentToRemove.uid,
    );

    if (index !== -1) {
      this.chosenStudentList.splice(index, 1);
    }
  }

  /**
   * 開始搜尋
   * @param searchData
   */
  private onSearch(searchData: SearchData): void {
    this.searchData = searchData;

    // 更新選擇的日期範圍，並將字符串轉換為數字
    this.selectedDate = {
      gameStartDayId: this.convertDateToNumber(searchData.apiData.startDay),
      gameEndDayId: this.convertDateToNumber(searchData.apiData.endDay),
    };

    // 更新選擇的任務日期
    this.selectedTaskDate = {
      effectiveDate: this.convertToDate(this.selectedDate.gameStartDayId.toString()) as Date,
      expiryDate: this.convertToDate(this.selectedDate.gameEndDayId.toString()) as Date,
    };

    // 根據選擇的日期範圍重新篩選賽事列表
    this.getContestList();
  }

  /**
   * 將日期字符串轉換為數字格式，例如 '2024-07-04' 轉換為 20240704
   * @param dateStr 日期字符串，格式為 'YYYY-MM-DD'
   * @returns 數字格式的日期
   */
  private convertDateToNumber(dateStr: string): number {
    return parseInt(dateStr.replace(/-/g, ''), 10);
  }

  /**
   * 将 YYYYMMDD 格式的字符串转换为 Date 对象
   * @param dateString 形如 20240704 的日期字符串
   * @returns 转换后的 Date 对象
   */
  private convertToDate(dateString: string): Date | null {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // 月份从0开始计数
    const day = parseInt(dateString.substring(6, 8), 10);

    return new Date(year, month, day);
  }

  /**
   * 取得學習任務剩餘次數
   */
  private async getRemainingTaskCount(): Promise<void> {
    this.studyTaskCountInfo = await HeroApiStudyTaskAPI.getStudyTaskCountInfo();
    console.log(this.studyTaskCountInfo);
  }

  /**
   * 提交選擇的學生和獎品(教師派獎)
   */
  private async handleAwardSubmit(): Promise<void> {
    const studentIdList = this.chosenStudentList.map((student) => student.uid);
    try {
      const response: any = await TeacherWeekDeliveryAwardAPI.postTeacherAwardDelivery(
        studentIdList,
        this.selectedAwardList,
      );
      if (response.result === ResponseState.Success) {
        Message.info('已成功派獎');
        this.$router.go(0);
      } else {
        handleAPIError(response.result, response.resMessage);
      }
    } catch (error) {
      Message.error('派獎失敗');
    }
  }

  /**
   * 提交選擇的學生和獎品和任務(教師派任務)
   */
  private async handleStudyTaskSubmit(): Promise<void> {
    const studentIdList = this.chosenStudentList.map((student) => student.uid);
    const allSendOutItems = [...this.sendOutItems.contests, ...this.sendOutItems.courses] as number[];
    try {
      const response: any = await HeroApiStudyTaskAPI.postStudyTask(
        /** 學生列表 */
        studentIdList,
        /** 獎品列表 */
        this.selectedAwardList,
        /** 賽事ID列表 */
        allSendOutItems,
        /** 任務名稱 */
        this.taskNameInput,
        /** 任務描述 */
        this.taskDescriptionInput,
        /** 任務開始日期 */
        this.selectedTaskDate.effectiveDate,
        /** 任務結束日期 */
        this.selectedTaskDate.expiryDate,
      );
      if (response.result === ResponseState.Success) {
        Message.info('已成功派任務');
        this.$router.go(0);
      } else {
        handleAPIError(response.result, response.resMessage);
      }
    } catch (error) {
      Message.error('派任務失敗');
    }
  }

  /**
   * 按鈕提交處理
   */
  private handleSubmit(): void {
    // 如果有任務條件就使用派任務API，否則使用派獎API
    if (this.selectedContests.length > 0 || this.selectedCourses.length > 0) {
      this.handleStudyTaskSubmit();
    } else {
      this.handleAwardSubmit();
    }
  }
}
</script>

<style scoped>
.sendTaskTitle {
  display: flex;
  justify-content: flex-start;
  color: #fdb42d;
  font-size: 24px;
  font-weight: bold;
}
.award-list {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0 0 3px gray;
  margin: 20px;
}
.warning-date {
  color: black;
  background: #ffefe5;
}
.task-condition {
  display: flex;
  width: 200px;
  flex-direction: column;
  gap: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 0 3px gray;
  max-width: 480px;
  margin: 20px;
}
</style>
