<template>
  <div>
    <div class="radar">
      <div class="title">{{ textData.subjectAndMiniGameWeighting }}</div>
      <div class="content">
        <div ref="subjectRadarChart" id="subject-radar-chart" style="width: 100%; height: 400px"></div>
        <div ref="gameRadarChart" id="game-radar-chart" style="width: 100%; height: 400px"></div>
      </div>
    </div>

    <div class="student-radar">
      <div class="title">{{ textData.teacherTaskCompletionRate }}</div>
      <div class="chart-item">
        <div ref="subjectPieChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import * as eCharts from 'echarts';
import { DataDashboardAPI } from '@/api/dataDashboard';
import { StudentOverviewDataResultDto } from '@/hero-api/dto/data-dashboard-overview.dto';
import { JsonHelper } from '@/hero-api/dto/json.helper';
import { HeroJ7GameType, GameTypeName } from '@/helper/enum/Common';
import TableManager from '@/manager/TableManager';
import { CompleteStatusType, GetStudyTaskCompletionResultDto } from '@/hero-api/dto/study-task.dto';

@Component({})
export default class StudentRadarChart extends Vue {
  /** 儲存所有圖表的實例 */
  private radarCharts: echarts.ECharts[] = [];
  /** 儲存餅圖的實例 */
  private pieCharts: Record<string, echarts.ECharts> = {};

  /** 後端獲取儀表板資訊 */
  private studentOverview: StudentOverviewDataResultDto;
  private studentTaskCompletion: GetStudyTaskCompletionResultDto;

  /** 文字數據 */
  private textData = {
    subjectAndMiniGameWeighting: '各學科及小遊戲比重',
    teacherTaskCompletionRate: '教師任務完成比例',
  };

  /** 元件掛載後初始化圖表 */
  mounted() {
    // 取得API資料並設定圖表
    this.getStudentDataDashboardData();
    // 監聽視窗大小變化事件
    window.addEventListener('resize', this.handleResize);
  }

  /** 從後端獲取初始的總覽列表 */
  private async getStudentDataDashboardData(): Promise<void> {
    this.studentOverview = await DataDashboardAPI.getStudentOverview();
    this.studentTaskCompletion = await DataDashboardAPI.getStudentStudyTaskCompletion();
    this.initRadarCharts();
    this.initPieChart();
  }

  /** 元件銷毀前移除事件監聽並銷毀圖表實例 */
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.radarCharts.forEach((chart) => chart.dispose());
  }

  /** 初始化雷達圖 */
  private initRadarCharts() {
    this.$nextTick(() => {
      const subjectRadarChartDom = this.$refs.subjectRadarChart as HTMLDivElement;
      const gameRadarChartDom = this.$refs.gameRadarChart as HTMLDivElement;

      if (subjectRadarChartDom) {
        const subjectRadarChart = eCharts.init(subjectRadarChartDom);
        this.radarCharts.push(subjectRadarChart);
        this.setSubjectRadarOption(subjectRadarChart);
      }

      if (gameRadarChartDom) {
        const gameRadarChart = eCharts.init(gameRadarChartDom);
        this.radarCharts.push(gameRadarChart);
        this.setGameRadarOption(gameRadarChart);
      }
    });
  }

  /** 設定學科比重雷達圖的選項
   * @param chart 雷達圖實例
   */
  private setSubjectRadarOption(chart: echarts.ECharts) {
    // 轉換來自後端的學科比重資料
    const subjectData = JsonHelper.parseFromJson<{ [key: string]: number }>(
      this.studentOverview.totalStudentSubjectPlayCount,
    );
    if (subjectData === undefined || Object.keys(subjectData).length === 0) {
      // 空資料時顯示空圖表
      const emptyOption: echarts.EChartsOption = {
        title: { text: '學科比重' },
        radar: {
          indicator: [{ name: 'None', max: 1 }],
          shape: 'circle',
        },
        series: [
          {
            name: '學科比重',
            type: 'radar',
            data: [{ value: [0] }],
          },
        ],
      };
      chart.setOption(emptyOption);
      return;
    }

    // 找出最大值
    const max = Math.max(...Object.values(subjectData));
    // 設定雷達圖的指標與資料值
    const indicator = Object.keys(subjectData).map((key) => {
      const subjectType = Number(key); // 將字串轉換為數字
      const subjectTableData = TableManager.subject.findOne(subjectType);
      const subjectName = subjectTableData?.subject_groupings_name ?? `學科${key}`;
      return { name: subjectName, max };
    });
    // 取得資料值
    const dataValues = Object.values(subjectData);

    // 設定雷達圖的選項
    const option: echarts.EChartsOption = {
      title: { text: '學科比重' },
      radar: {
        // name & max 這兩個屬性是必須的
        indicator: indicator,
        shape: 'circle',
      },
      series: [
        {
          name: '學科比重',
          type: 'radar',
          data: [{ value: dataValues }],
        },
      ],
    };
    chart.setOption(option);
  }

  /** 設定小遊戲比重雷達圖的選項
   * @param chart 雷達圖實例
   */
  private setGameRadarOption(chart: echarts.ECharts) {
    const gameModeData = JsonHelper.parseFromJson<{ [key: string]: number }>(
      this.studentOverview.totalStudentGameModePlayCount,
    );
    // 空資料時顯示空圖表
    if (gameModeData === undefined || Object.keys(gameModeData).length === 0) {
      const emptyOption: echarts.EChartsOption = {
        title: { text: '小遊戲比重' },
        radar: {
          indicator: [{ name: 'None', max: 1 }],
          shape: 'polygon',
        },
        series: [
          {
            name: '小遊戲比重',
            type: 'radar',
            data: [{ value: [0] }],
          },
        ],
      };
      chart.setOption(emptyOption);
      return;
    }
    // 找出最大值
    const max = Math.max(...Object.values(gameModeData));
    // 設定雷達圖的指標與資料值
    const indicator = Object.keys(gameModeData).map((key) => {
      // 取得小遊戲名稱
      const gameType = Number(key); // 將字串轉換為數字
      const gameName = GameTypeName[HeroJ7GameType[gameType] as keyof typeof GameTypeName];
      return { name: gameName, max };
    });
    // 取得資料值
    const dataValues = Object.values(gameModeData);

    // 設定雷達圖的選項
    const option: echarts.EChartsOption = {
      title: { text: '小遊戲比重' },
      radar: {
        indicator: indicator,
        shape: 'polygon',
        splitNumber: 5,
      },
      series: [
        {
          name: '小遊戲比重',
          type: 'radar',
          data: [{ value: dataValues }],
        },
      ],
    };
    chart.setOption(option);
  }

  /** 初始化學習任務完成度比例餅圖 */
  private initPieChart() {
    const chartDom = this.$refs.subjectPieChart as HTMLDivElement;
    if (!chartDom) {
      return;
    }

    // 設定餅圖的資料
    const dataCompletion = [
      { value: this.studentTaskCompletion.completedTaskCount, name: '完成' },
      { value: this.studentTaskCompletion.expiredFailTaskCount, name: '逾期' },
      { value: this.studentTaskCompletion.runningTaskCount, name: '進行中' },
    ];

    this.pieCharts.subjectPieChart = eCharts.init(chartDom);
    this.pieCharts.subjectPieChart.setOption({
      tooltip: { trigger: 'item' },
      series: [
        {
          name: '完成比例',
          type: 'pie',
          radius: '50%',
          color: ['#5dcfff', '#ff6464', '#34AF90'],
          data: dataCompletion,
          label: {
            // 圓餅圖上的顯示文字, 排除掉數值為0的部分
            formatter: (params: { value: number; name: string }) => {
              return params.value > 0 ? params.name : '';
            },
            position: 'inside', // 顯示在餅圖內部
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
          },
        },
      ],
      legend: {
        bottom: '5%',
        left: '40%',
      },
    });
  }

  /** 處理視窗大小變化事件，重新調整圖表大小 */
  private handleResize() {
    this.radarCharts.forEach((chart) => chart.resize());
    Object.values(this.pieCharts).forEach((chart) => chart.resize());
  }
}
</script>

<style scoped>
#subjectRadarChart,
#gameRadarChart {
  width: 100%;
  height: 400px;
}

.student-radar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-item {
  width: 50%;
  height: 100%;
  border-radius: 8px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.chart {
  width: 100%;
  top: 50%;
  left: -25%;
  height: 400px;
  /* 固定圖表容器的高度，確保在resize時不改變 */
}

/** 排行榜及答題正確率排版 */
.radar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content {
  display: flex;
  flex-direction: row;
  width: 50%;
  height: 100%;
}

.title {
  width: 50%;
  height: 100%;
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  background-color: #fd8523;
  /* 橘色背景 */
  color: white;
  /* 白色字體 */
  padding: 2px 25px;
  border-radius: 5px;
  margin-bottom: 20px;
  margin-top: 20px;
}

.radarType {
  width: 50%;
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  padding-bottom: 10px;
  margin-bottom: 20px;
  border-block-end: 1px solid #000;
}

@media (max-width: 768px) {
  .student-radar {
    grid-template-columns: 1fr;
    grid-gap: 10px;
  }

  .title {
    width: 80%;
  }

  .content {
    width: 80%;
    flex-direction: column;
  }

  .chart-item {
    width: 80%;
    height: 100%;
    padding: 30px;
  }

  .chart {
    left: 5%;
    height: 400px;
    /* 固定圖表容器的高度，確保在resize時不改變 */
  }
}
</style>
