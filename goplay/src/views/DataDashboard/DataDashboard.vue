<template>
  <div>
    <div class="dashboard-container">
      <!-- 圓餅圖 -->
      <div class="charts-container">
        <div class="chart-wrapper">
          <PieChart :title="chartLeftTitle" :data="chartLeftData" />
        </div>
        <div class="chart-wrapper">
          <PieChart :title="chartRightTitle" :data="chartRightData" />
        </div>
      </div>
      <div class="statistics-container">
        <!-- 統計數據 -->
        <Stats :stats="stats" />
        <div class="details-container">
          <!-- 各科答題次數及答題正確率 -->
          <SubjectAnswerInfoTable
            :title="answerInfoTitle"
            :subjectAnswerData="getSubjectData()"
            :titleBackgroundColor="answerInfoTitleBackgroundColor"
          />
          <!-- 柱狀圖 -->
          <BarChart
            :title="barChartTitle"
            :valueDescription="barChartValueDescription"
            :labelList="barChartLabelList"
            :valueList="barChartValueList"
            :titleBackgroundColor="barChartTitleBackgroundColor"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SubjectType } from '@/helper/enum/Common';
import PieChart from '@/components/DataDashboardOverview/PieChart.vue';
import Stats, { Stat } from '@/components/DataDashboardOverview/Stats.vue';
import SubjectAnswerInfoTable, {
  SubjectAnswerInfo,
} from '@/components/DataDashboardOverview/SubjectAnswerInfoTable.vue';
import BarChart from '@/components/DataDashboardOverview/BarChart.vue';
import Helper from '../H5/Helper/Helper';

@Component({
  components: {
    PieChart,
    Stats,
    SubjectAnswerInfoTable,
    BarChart,
  },
})
export default class DataDashboard extends Vue {
  /** 左邊圓餅圖標題 */
  @Prop()
  private chartLeftTitle: string = '';
  /** 右邊圓餅圖標題 */
  @Prop()
  private chartRightTitle: string = '';
  /** 左邊圓餅圖數據 */
  @Prop()
  private chartLeftData: Map<string, number> = new Map<string, number>();
  /** 右邊圓餅圖數據 */
  @Prop()
  private chartRightData: Map<string, number> = new Map<string, number>();

  /** 統計數據 */
  @Prop()
  private stats: Stat[] = [];

  /** 各科目答題正確率標題 */
  @Prop()
  private answerInfoTitle: string = '';
  /** 各科目答題正確率標題背景顏色 */
  @Prop()
  private answerInfoTitleBackgroundColor: string = '';
  /** 各科目答題正確率資料 */
  @Prop()
  private subjectAnswerJsonData: string = '';

  /** 柱狀圖標題 */
  @Prop()
  private barChartTitle: string = '';
  /** 柱狀圖值描述 */
  @Prop()
  private barChartValueDescription: string = '';
  /** 柱狀圖標籤列表 */
  @Prop()
  private barChartLabelList: string[] = [];
  /** 柱狀圖值列表 */
  @Prop()
  private barChartValueList: number[] = [];
  /** 柱狀圖標題背景顏色 */
  @Prop()
  private barChartTitleBackgroundColor: string = '';

  /**
   * 解析並格式化後端返回的科目答題數據
   * @param apiData 從後端返回的科目答題數據（JSON字串）
   */
  private getSubjectData(): Map<SubjectType, SubjectAnswerInfo> {
    if (this.subjectAnswerJsonData === '') {
      return new Map();
    }

    // 解析回傳資料
    const apiSubjectAnswerData = Helper.jsonParse<Record<SubjectType, SubjectAnswerInfo>>(this.subjectAnswerJsonData);
    if (apiSubjectAnswerData === undefined) {
      return new Map();
    }

    const subjectAnswerData = new Map<SubjectType, SubjectAnswerInfo>();
    // 轉換格式給答題正確率表格使用
    for (const [key, value] of Object.entries(apiSubjectAnswerData)) {
      subjectAnswerData.set(Number(key) as SubjectType, value);
    }

    return subjectAnswerData;
  }
}
</script>

<style scoped>
/* 數據分析頁面的樣式 */
.dashboard-container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto;
  gap: 10px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box; /* 包括填充和邊框在元素的總寬度和高度中 */
}

.charts-container {
  display: grid;
  background-color: #f4f4f4;
  grid-template-columns: 1fr;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chart-wrapper {
  border-radius: 8px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.statistics-container {
  display: grid;
  grid-template-rows: auto 1fr;
}

/** 排行榜及答題正確率排版 */
.details-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

/** 答題正確率表格背景 */
.background {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 30px;
}

::v-deep .el-table thead {
  color: #fff;
}

::v-deep.el-table th.el-table__cell {
  background: #007bff;
}

@media (max-width: 1568px) {
  .dashboard-container {
    display: grid;
    grid-template-columns: 1fr;
  }

  .charts-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .statistics-container {
    display: grid;
    grid-template-rows: 1fr;
  }

  .details-container {
    flex-direction: column;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .subjectChart-title {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 10px;
    padding-right: 50px;
    text-align: right;
  }

  .gradeChart-title {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 10px;
    padding-left: 50px;
    text-align: left;
  }

  .details-container {
    flex-direction: column;
  }

  .charts-container {
    display: grid;
    grid-template-columns: 1fr;
  }

  .stat-item {
    width: 100%;
  }

  .chart-title {
    font-size: 1em;
  }

  .content {
    width: 80%;
    height: 100%;
  }

  .content {
    width: 80%;
    height: 100%;
  }
}
</style>
