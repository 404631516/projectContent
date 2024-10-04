<template>
  <div>
    <div class="regress-title">{{ textData.ComparisonOfAnIndividualStudentQuizPerformance }}</div>
    <div class="select-bar" p="y-5" text="center">
      <!-- 年度篩選 -->
      <div class="select-item" text="2xl [#666666]">
        <el-select
          class="w-40 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="true"
          filterable
          :placeholder="textData.year"
          v-model="academicYearId"
          @change="handleYearChange"
        >
          <el-option :key="-1" :label="textData.allYear" :value="-1"></el-option>
          <el-option
            v-for="schoolClass in schoolClassList"
            :key="schoolClass.academicYearId"
            :label="schoolClass.academicYearTitle"
            :value="schoolClass.academicYearId"
          ></el-option>
        </el-select>
      </div>
      <!-- 年級篩選 -->
      <div class="select-item" text="2xl [#666666]">
        <el-select
          class="w-40 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="true"
          filterable
          :placeholder="textData.grade"
          v-model="grade"
          @change="handleGradeChange"
        >
          <el-option :key="-1" :label="textData.allGrade" :value="-1"></el-option>
          <el-option
            v-for="grade in getGradeChildren()"
            :key="grade.grade"
            :label="grade.gradeString"
            :value="grade.grade"
          ></el-option>
        </el-select>
      </div>
      <!-- 班級篩選 -->
      <div class="select-item" text="2xl [#666666]">
        <el-select
          class="w-40 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="true"
          filterable
          :placeholder="textData.class"
          v-model="classId"
        >
          <el-option :key="-1" :label="textData.allClass" :value="-1"></el-option>
          <el-option
            v-for="classItem in getClassChildren()"
            :key="classItem.classId"
            :label="classItem.classString"
            :value="classItem.classId"
          ></el-option>
        </el-select>
      </div>

      <div class="vertical-line"></div>

      <!-- 科目篩選 -->
      <div class="select-right-item" text="2xl [#666666]">
        <el-select
          class="w-40 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="true"
          filterable
          :placeholder="textData.subject"
          v-model="boxPlotDto.subjectType"
        >
          <el-option
            v-for="subject in getSubjectTypeOptions()"
            :key="subject.value"
            :label="subject.label"
            :value="subject.value === -1 ? undefined : subject.value"
          ></el-option>
        </el-select>
      </div>
      <!-- 答題正確率篩選 -->
      <div class="select-right-item" text="2xl [#666666]">
        <el-select
          class="w-40 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="true"
          filterable
          :placeholder="textData.quizAccuracy"
          v-model="accuracy"
        >
          <el-option
            v-for="option in getAccuracyOptions(accuracyMin, accuracyMax, accuracyStep)"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </div>
      <!-- 班內比較篩選 -->
      <div class="select-right-item" text="2xl [#666666]">
        <el-select
          class="w-40 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="true"
          filterable
          :placeholder="textData.classComparison"
          v-model="comparisonScope"
        >
          <el-option
            v-for="option in getComparisonScopeOptions()"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </div>
      <Button class="analysis-button" @click="initChartList">{{ textData.analysis }}</Button>
    </div>

    <div class="send-task">
      {{ textData.assignTaskTo }}
      <el-select
        class="w-40 rounded-[5px] shadow-default"
        m="l-2 <sm:0"
        border="1px solid [#a5a5a5]"
        :popper-append-to-body="true"
        filterable
        v-model="assignAccuracy"
      >
        <el-option
          v-for="option in getAccuracyOptions(assignAccuracyMin, assignAccuracyMax, assignAccuracyStep, false)"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        ></el-option> </el-select
      >{{ textData.studentsOf
      }}<Button class="send-task-button" @click="assignTask">{{ textData.oneClickAssignment }}</Button>
    </div>

    <div class="chart-grid">
      <div
        v-for="(player, index) in boxPlotData.playerRates"
        :key="player.playerId"
        class="chart-container"
        :data-key="index"
      >
        <div class="student-name">{{ userInfoMap.get(player.playerId)?.userName }}</div>
        <div :ref="`chart-${index}`" :data-key="index" style="width: 100%; height: 500px"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import * as eCharts from 'echarts';
import { AnswerBoxPlotDto, AnswerBoxPlotResultDto, PlayerRate } from '@/hero-api/dto/data-dashboard.dto';
import { MenuName } from '@/helper/enum/MenuName';
import { DataDashboardAPI } from '@/api/dataDashboard';
import { getSchoolClassList, getSubjectTypeOptions } from '@/helper/fnc/common';
import { ClassItem, GradeItem, SchoolClass, StudentData } from '@/helper/interface/TeacherAdmin';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { SelectOption } from '@/helper/interface/Common';
import { UserInfoAPI } from '@/api/userInfo';
import { MssrSimpleUserInfo } from '@/hero-api/module/mssr/bridge/dto/bridge-user.dto';
import { Message } from '@/helper/class/Common';
import { heroj7GetStudentList } from '@/api/TeacherAdmin';

/** 比較範圍 */
enum ComparisonScope {
  /** 全國 */
  Country = -1,
  /** 全校 */
  School = 1,
  /** 全班 */
  Class = 2,
}

@Component({})
export default class BoxPlotChart extends Vue {
  /** 取得科目選項 */
  private getSubjectTypeOptions = getSubjectTypeOptions;

  /** 文字數據 */
  private readonly textData = {
    allYear: '請選擇年度',
    allGrade: '請選擇年級',
    allClass: '請選擇班級',
    allAccuracy: '全正確率',
    year: '年度',
    grade: '年級',
    class: '班級',
    subject: '科目',
    quizAccuracy: '答題正確率',
    classComparison: '班內比較',
    analysis: '分析',
    assignTaskTo: '派任務給',
    studentsOf: '的學生',
    oneClickAssignment: '一鍵派送',
    ComparisonOfAnIndividualStudentQuizPerformance: '單一班級答題表現與全班、全校、全國之比較',
  };

  /** 比較範圍標籤 */
  private readonly comparisonScopeLabel: Record<ComparisonScope, string> = {
    [ComparisonScope.Country]: '全國',
    [ComparisonScope.School]: '全校',
    [ComparisonScope.Class]: '全班',
  };

  /** 圖表篩選正確率範圍 */
  private readonly accuracyMin = 10;
  private readonly accuracyStep = 10;
  private readonly accuracyMax = 90;

  /** 派任務給學生的正確率範圍 */
  private readonly assignAccuracyMin = 10;
  private readonly assignAccuracyStep = 10;
  private readonly assignAccuracyMax = 30;

  /** 派任務給學生的正確率 */
  private assignAccuracy: number = 10;

  /** 存放圖表實例的引用 */
  private chartMap: Map<HTMLDivElement, eCharts.ECharts> = new Map();

  /** 年度 */
  private academicYearId: number = -1;
  /** 年級 */
  private grade: number = -1;
  /** 班級 */
  private classId: number = -1;
  /** 答題正確率 */
  private accuracy: number = 1;
  /** 比較範圍 */
  private comparisonScope: ComparisonScope = ComparisonScope.Country;

  /** 箱型圖參數 */
  private boxPlotDto: AnswerBoxPlotDto = {
    playerId: [],
    subjectType: undefined,
    classId: undefined,
    schoolId: undefined,
  };

  /** 箱型圖回傳資料 */
  private boxPlotData: AnswerBoxPlotResultDto = {
    quartiles: {
      Q1: 0,
      median: 0,
      Q3: 0,
    },
    IQR: 0,
    averageRate: 0,
    playerRates: [],
    outliers: [],
    result: '',
  };

  /** 學校班級列表 */
  private schoolClassList: SchoolClass[] = [];

  /** 學生資訊對照表 */
  private userInfoMap: Map<number, MssrSimpleUserInfo> = new Map();

  /**
   * 元件掛載後初始化圖表
   * 並添加 window resize 事件監聽
   */
  async mounted() {
    this.schoolClassList = await getSchoolClassList(this.$$store.getters.userSchoolId);
    this.schoolClassList.forEach((item) => {
      item.gradeChildren = item.gradeChildren.filter((grade) => grade.grade > 0);
    });

    // 添加 resize 事件監聽器
    window.addEventListener('resize', this.handleResize);
  }

  /** 初始化全圖表 */
  private async initChartList(): Promise<void> {
    if (this.classId === -1) {
      Message.warn('請先選擇要分析的班級');
      return;
    }

    // 獲取資料
    const boxPlotResultDto = await this.getBoxPlotData(this.accuracy);

    // 取得學生資訊
    await this.fetchUserInfo(boxPlotResultDto.playerRates);

    // 更新 boxPlotData
    this.boxPlotData = boxPlotResultDto;

    // 等待元件渲染完畢
    await this.$nextTick();

    // 初始化每個圖表
    this.boxPlotData.playerRates.forEach((player, index) => {
      const chartDom = (this.$refs[`chart-${index}`] as HTMLDivElement[])?.[0];
      this.initBoxPlatChart(chartDom, player);
    });
  }

  /** 取得箱型圖資料 */
  private async getBoxPlotData(accuracy: number): Promise<AnswerBoxPlotResultDto> {
    // 設定篩選條件
    switch (this.comparisonScope) {
      case ComparisonScope.Country:
        this.boxPlotDto.schoolId = undefined;
        this.boxPlotDto.classId = undefined;
        break;
      case ComparisonScope.School:
        this.boxPlotDto.schoolId = this.$$store.getters.userSchoolId;
        this.boxPlotDto.classId = undefined;
        break;
      case ComparisonScope.Class:
        this.boxPlotDto.schoolId = undefined;
        this.boxPlotDto.classId = this.classId;
        break;
    }

    // 取得學生資料
    const response: any = await heroj7GetStudentList.fetch({
      classId: this.classId,
    });
    const studentList = response.studentList as StudentData[];

    // 設定學生UID
    this.boxPlotDto.playerId = studentList.map((student) => student.uid);
    const boxPlotResultDto = await DataDashboardAPI.getBoxPlot(this.boxPlotDto);

    // 篩選正確率
    boxPlotResultDto.playerRates = boxPlotResultDto.playerRates.filter((player) => player.rate <= accuracy);
    return boxPlotResultDto;
  }

  /** 獲取學生資訊 */
  private async fetchUserInfo(playerRates: PlayerRate[]): Promise<void> {
    const searchCids = playerRates.map((player) => player.playerId.toString());
    const userInfoList = await UserInfoAPI.getSimpleUserInfo({ searchCids });
    userInfoList.forEach((userInfo) => {
      this.userInfoMap.set(userInfo.cid, userInfo);
    });
  }

  /**
   * 初始化圖表
   * @param chartDiv - 圖表 DOM 元素
   * @param playerRate - 玩家評分數據
   */
  private initBoxPlatChart(chartDiv: HTMLDivElement, playerRate: PlayerRate) {
    if (chartDiv === undefined) {
      Helper.assert(ErrorId.VariableUndefined, 'chart is undefined');
      return;
    }

    // 初始化 eChart 圖表
    let eChart = this.chartMap.get(chartDiv);
    if (eChart === undefined) {
      eChart = eCharts.init(chartDiv);
      this.chartMap.set(chartDiv, eChart);
    }

    // boxplot 繪圖數據
    const boxplotDataValue = [
      this.boxPlotData.outliers[0], // 最小值（使用最小異常值）
      this.boxPlotData.quartiles.Q1,
      this.boxPlotData.quartiles.median,
      this.boxPlotData.quartiles.Q3,
      this.boxPlotData.outliers[1], // 最大值（使用最大異常值）
    ];

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: ['All Players'],
        boundaryGap: true,
        nameGap: 30,
        splitArea: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Correct Rate',
        min: 0,
        max: 1,
        splitArea: {
          show: true,
        },
      },
      series: [
        {
          name: '箱型圖',
          type: 'boxplot',
          data: [boxplotDataValue],
        },
        {
          name: 'Player Rate',
          type: 'line',
          markLine: {
            data: [
              {
                name: '學生正確率',
                yAxis: playerRate.rate,
                label: {
                  position: 'end',
                },
                lineStyle: {
                  type: 'dashed',
                  color: 'red',
                },
              },
            ],
          },
        },
        {
          name: 'Mean Rate',
          type: 'line',
          markLine: {
            data: [
              {
                name: '平均正確率',
                yAxis: this.boxPlotData.averageRate,
                label: {
                  position: 'end',
                },
                lineStyle: {
                  type: 'solid',
                  color: 'black',
                },
              },
            ],
          },
        },
      ],
    };

    eChart.setOption(option);
  }

  /** 跳轉到教師派任務頁面 */
  private async assignTask(): Promise<void> {
    if (this.classId === -1) {
      Message.warn('請先選擇要分析的班級');
      return;
    }

    const assignResult = await this.getBoxPlotData(this.assignAccuracy);

    // 取得學生資訊
    await this.fetchUserInfo(assignResult.playerRates);

    // 取得選中的學生列表
    const selectedStudentList = assignResult.playerRates
      .map((player) => {
        return this.userInfoMap.get(player.playerId);
      })
      .filter((userInfo): userInfo is MssrSimpleUserInfo => userInfo !== undefined);

    // 更新 store 中的 assignStudentsInfo
    this.$$store.commit('updateAssignStudentsInfo', {
      year: this.academicYearId,
      grade: this.grade,
      class: this.classId,
      studentList: selectedStudentList,
    });

    // 跳轉到教師派任務頁面
    this.$router.push({ path: `/${MenuName.TeacherAdmin}/${MenuName.StudyTask}` });
  }

  /** 處理年度變更 */
  private handleYearChange(): void {
    if (this.academicYearId === -1) {
      this.grade = -1;
      this.classId = -1;
    } else {
      this.grade = this.getGradeChildren()[0].grade!;
      this.classId = this.getClassChildren()[0].classId!;
    }
  }

  /** 處理年級變更 */
  private handleGradeChange(): void {
    if (this.grade === -1) {
      this.classId = -1;
    } else {
      this.classId = this.getClassChildren()[0].classId!;
    }
  }

  /** 取得年級列表 */
  private getGradeChildren(): GradeItem[] {
    return this.schoolClassList.find((item) => item.academicYearId === this.academicYearId)?.gradeChildren || [];
  }

  /** 取得班級列表 */
  private getClassChildren(): ClassItem[] {
    return this.getGradeChildren().find((item) => item.grade === this.grade)?.classChildren || [];
  }

  /** 取得比較範圍選項 */
  private getComparisonScopeOptions(): SelectOption[] {
    return Object.entries(this.comparisonScopeLabel)
      .map(([key, value]) => ({
        label: value,
        value: parseInt(key),
      }))
      .sort((a, b) => b.label.localeCompare(a.label)); // 用 value 排序
  }

  /** 取得正確率列表 */
  private getAccuracyOptions(
    min: number,
    max: number,
    step: number,
    includeAllAccuracy: boolean = true,
  ): SelectOption[] {
    const options: SelectOption[] = [];
    if (includeAllAccuracy) {
      options.push({
        label: this.textData.allAccuracy,
        value: 1,
      });
    }

    for (let i = min; i <= max; i += step) {
      options.push({
        label: `${i}% 以下`,
        value: i / 100,
      });
    }

    return options;
  }

  /**
   * 處理窗口 resize 事件，重新調整圖表大小
   */
  private handleResize() {
    this.chartMap.forEach((chart) => chart.resize());
  }

  /**
   * 在元件卸載時移除窗口 resize 事件監聽
   */
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.chartMap.forEach((chart) => chart.dispose());
  }
}
</script>

<style scoped>
.chart-container {
  margin: 20px;
  border: 1px solid black;
}

.vertical-line {
  width: 1px;
  height: 40px; /* 可根據需要調整 */
  background-color: #000; /* 直線顏色，可根據需要調整 */
}

.regress-title {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 20px;
  padding-top: 20px;
  background-color: #f4f4f4;
}

.select-bar {
  display: flex;
  justify-content: center;
  background-color: #f4f4f4;
  box-shadow: 0px 2px 10%;
}

.select-item {
  display: flex;
  margin-right: 40px;
}

.select-right-item {
  display: flex;
  margin-left: 40px;
}

.send-task-button,
.analysis-button {
  margin-left: 20px;
  background: #f7a21b;
  font-weight: bold;
  font-size: 20px;
  color: #fff;
  border-radius: 5px;
  padding: 5px 30px;
  box-shadow: 2px 2px 10px #888888;
}

.student-name {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 2px;
  padding-top: 2px;
  color: #fff;
  background: #4689ff;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 1500px; /* 限制最大寬度 */
  margin: 0 auto; /* 置中 */
  padding: 20px; /* 添加一些内边距，确保内容不会紧贴边缘 */
}

.send-task {
  padding: 20px;
  border-block-end: 1px solid #000;
}

@media (max-width: 768px) {
  .vertical-line {
    width: 0;
    height: 0;
  }

  .select-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .select-item {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .select-right-item {
    margin-left: 0px;
    margin-bottom: 20px;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
