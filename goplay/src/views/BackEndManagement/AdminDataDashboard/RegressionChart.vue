<template>
  <div>
    <div class="regress-title">{{ textData.regressionAnalysisForAnswerCountAndAccuracy }}</div>
    <div class="select-bar" p="y-5" text="center">
      <!-- 縣市篩選 -->
      <div class="select-item" text="2xl [#666666]">
        <el-select
          class="w-50 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="false"
          filterable
          :placeholder="textData.allCounties"
          v-model="regressionAnalysisDto.countyId"
        >
          <el-option
            v-for="option in getCountyOptions()"
            :key="option.value"
            :label="option.label"
            :value="option.value === -1 ? undefined : option.value"
          />
        </el-select>
      </div>
      <!-- 年級篩選 -->
      <div class="select-item" text="2xl [#666666]">
        <el-select
          class="w-50 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="false"
          filterable
          :placeholder="textData.allGrades"
          v-model="regressionAnalysisDto.gradeNum"
        >
          <el-option
            v-for="option in getGradeOptions()"
            :key="option.value"
            :label="option.label"
            :value="option.value === -1 ? undefined : option.value"
          />
        </el-select>
      </div>
      <!-- 版本篩選 -->
      <div class="select-item" text="2xl [#666666]">
        <el-select
          class="w-50 rounded-[5px] shadow-default"
          m="l-2 <sm:0"
          border="1px solid [#a5a5a5]"
          :popper-append-to-body="false"
          filterable
          :placeholder="textData.allSubjects"
          v-model="regressionAnalysisDto.subjectType"
        >
          <el-option
            v-for="option in getSubjectTypeOptions()"
            :key="option.value"
            :label="option.label"
            :value="option.value === -1 ? undefined : option.value"
          />
        </el-select>
      </div>
      <Button class="analysis-button" @click="initializeChart">{{ textData.analysis }}</Button>
    </div>

    <div class="chart-title">Trend of Correct Rate and Entry Count Over Game Numbers</div>
    <div ref="chart" style="width: 100%; height: 500px"></div>

    <div>{{ textData.answerCountRangeSelection }}</div>
    <!-- 滑動條控制區域範圍 -->
    <div class="slider">
      <Slider
        class="w-[90%]"
        v-model="sliderValue"
        range
        :step="sliderStep"
        :marks="sliderMarks"
        :min="0"
        :max="sliderRangeMax"
      ></Slider>
    </div>
    <Button class="slider-button" @click="updateChartData">Go</Button>
    <!-- 分析說明 -->
    <div class="analysis">{{ textData.positiveCorrelationBetweenAccuracyAndAnswerCount }}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import * as eCharts from 'echarts';
import { Slider } from 'element-ui';
import { DataDashboardAPI } from '@/api/dataDashboard';
import { AnswerRegressionAnalysisDto, GameData } from '@/hero-api/dto/data-dashboard.dto';
import { getCountyOptions, getGradeOptions, getSubjectTypeOptions } from '@/helper/fnc/common';
import { Load } from '@/helper/class/Common';

@Component({
  components: {
    RegressionChart,
    Slider,
  },
})
export default class RegressionChart extends Vue {
  /** 圖表元素 */
  public $refs: {
    chart: HTMLDivElement;
  };

  // #region 宣告給Vue使用
  /** 取得縣市選項 */
  private getCountyOptions = getCountyOptions;
  /** 取得年級選項 */
  private getGradeOptions = getGradeOptions;
  /** 取得科目選項 */
  private getSubjectTypeOptions = getSubjectTypeOptions;
  // #endregion

  /** 文字數據 */
  private readonly textData = {
    regressionAnalysisForAnswerCountAndAccuracy: '「答題次數」與「答題正確率」的迴歸分析',
    allCounties: '所有縣市',
    allGrades: '所有年級',
    allSubjects: '所有科目',
    analysis: '分析',
    answerCountRangeSelection: '答題次數區間選擇',
    sampleCountForGamesOver10: '取遊戲次數>10次以上的樣本數',
    positiveCorrelationBetweenAccuracyAndAnswerCount: '經由分析可知答題正確率與答題數量呈現正相關',
  };

  /** 圖表選項 */
  private readonly chartOptions: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['Correct Rate', 'Entry Count'],
      left: 'left',
    },
    xAxis: {
      name: 'Game Number 單一知識點的答題次數',
      type: 'value',
      min: 'dataMin',
      max: 'dataMax',
    },
    yAxis: [
      {
        name: 'Correct Rate 單一知識點的答題正確率',
        type: 'value',
        min: 'dataMin',
        max: 'dataMax',
        position: 'left',
        axisLine: {
          lineStyle: {
            color: 'blue',
          },
        },
      },
      {
        name: 'Entry Count 在因數鏈接平台上的總答題次數',
        type: 'value',
        position: 'right',
        axisLine: {
          lineStyle: {
            color: 'green',
          },
        },
      },
    ],
    series: [
      {
        name: 'Correct Rate',
        type: 'line',
        data: [] as [number, number][],
        yAxisIndex: 0,
        smooth: true,
        markLine: {
          data: [{ type: 'average', name: 'Mean Correct Rate' }],
          lineStyle: {
            color: 'red',
          },
        },
      },
      {
        name: 'Entry Count',
        type: 'bar',
        data: [] as [number, number][],
        yAxisIndex: 1,
        itemStyle: {
          color: 'rgba(0, 128, 0, 0.3)',
        },
      },
    ],
  };

  /** ECharts 實例 */
  private chartInstance: echarts.ECharts | null = null;

  /** 迴歸分析的參數 */
  private regressionAnalysisDto: AnswerRegressionAnalysisDto = {
    countyId: undefined,
    gradeNum: undefined,
    subjectType: undefined,
  };

  /** 迴歸分析的結果 */
  private analysisResult: GameData[] = [];

  //#region Slider
  /** Slider 的初始值 */
  private sliderValue: number[] = [0, 0];
  /** Slider 的步長 */
  private sliderStep = 1;
  /** Slider 範圍最大值 */
  private sliderRangeMax = 0;
  /** Slider 的標記 */
  private sliderMarks: Record<number, string> = { 0: '0' };
  //#endregion

  /** 元件掛載後初始化圖表 */
  async mounted() {
    // 初始化 ECharts 實例
    this.chartInstance = eCharts.init(this.$refs.chart);

    // 添加 resize 事件監聽器
    window.addEventListener('resize', this.handleResize);
  }

  /** 初始化圖表 */
  private async initializeChart() {
    // 讀取畫面
    Load.use(true);

    // 取得迴歸分析結果
    const result = await DataDashboardAPI.getRegressionAnalysis(this.regressionAnalysisDto);
    this.analysisResult = result.data;

    // 設定 Slider
    this.sliderRangeMax = Math.max(...this.analysisResult.map((item) => item.gameNumber));
    this.sliderValue = [0, this.sliderRangeMax];
    this.sliderMarks = { 0: '0', [this.sliderRangeMax]: this.sliderRangeMax.toString() };

    // 更新圖表資料
    this.updateChartData();

    // 調整圖表大小
    this.handleResize();

    // 關閉讀取畫面
    Load.use(false);
  }

  /** 獲取圖表選項 */
  private updateChartData(): void {
    // 取得圖表資料選項
    const SeriesOption = this.chartOptions.series as eCharts.SeriesOption[];

    // 取得正確率與答題次數的索引
    const CorrectRateIndex = 0;
    const EntryCountIndex = 1;

    // 更新正確率資料
    SeriesOption[CorrectRateIndex].data = this.analysisResult
      .filter((item) => item.gameNumber >= this.sliderValue[0] && item.gameNumber <= this.sliderValue[1])
      .map((item) => [item.gameNumber, item.correctRate]);

    // 更新答題次數資料
    SeriesOption[EntryCountIndex].data = this.analysisResult
      .filter((item) => item.gameNumber >= this.sliderValue[0] && item.gameNumber <= this.sliderValue[1])
      .map((item) => [item.gameNumber, item.entryCount]);

    // 設置圖表選項
    this.chartInstance?.setOption(this.chartOptions);
  }

  /** 處理窗口大小調整 */
  private handleResize() {
    this.chartInstance?.resize();
  }

  /** 元件銷毀前清理資源 */
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.chartInstance?.dispose();
  }
}
</script>

<style scoped>
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

.analysis-button,
.slider-button {
  margin-left: 20px;
  background: #f7a21b;
  font-weight: bold;
  font-size: 20px;
  color: #fff;
  border-radius: 5px;
  padding: 5px 30px;
  box-shadow: 2px 2px 10px #888888;
}

.chart-title {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 20px;
  padding-top: 20px;
}

.slider {
  display: flex;
  width: 100%;
  height: 100px;
  justify-content: center;
}

.tooltip {
  background-color: #ffe599; /* 設定提示框背景顏色 */
  color: #000; /* 設定提示框文字顏色 */
}

::v-deep .el-slider__button {
  border: 2px solid #f7a21b;
  background-color: #f7a21b;
  color: #f7a21b;
}

::v-deep .el-slider__bar {
  background-color: #f7a21b;
}

.analysis {
  margin-top: 20px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .select-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .select-item {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .block {
    width: 100%;
    margin: 10px auto; /* 讓滑動條在頁面中水平居中 */
    padding: 10px; /* 增加內部間距，使滑動條與邊框有一定距離 */
  }

  .slider {
    display: flex;
    width: 100%;
    height: 100px;
    flex-direction: column;
    align-items: center;
  }
}
</style>
