<template>
  <div class="chart-space">
    <div v-if="title" class="chart-title">{{ title }}</div>
    <div ref="pieChart" class="chart"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as eCharts from 'echarts';

@Component({})
export default class PieChart extends Vue {
  /** 圓餅圖標題 */
  @Prop({ default: '' }) title: string;
  /** 圓餅圖數據 */
  @Prop({ default: () => new Map() }) data: Map<string, number>;
  /** 是否顯示圖例 */
  @Prop({ default: false }) showLegend: boolean;

  /** 圓餅圖實例 */
  private chart: eCharts.EChartsType;

  public $refs: {
    pieChart: HTMLDivElement;
  };

  mounted() {
    this.refreshPieChart();
    window.addEventListener('resize', this.handleResize);
  }

  /** 處理調整大小 */
  private handleResize(): void {
    this.chart?.resize?.();
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.chart?.dispose();
  }

  /** 初始化圓餅圖 */
  @Watch('data', { deep: true })
  private refreshPieChart(): void {
    this.chart = eCharts.init(this.$refs.pieChart);

    this.chart.setOption({
      tooltip: { trigger: 'item' },
      legend: {
        bottom: 1,
        type: 'scroll',
        left: 'center',
        data: this.showLegend ? Array.from(this.data, ([name, value]) => ({ name: name, value: value })) : [],
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: Array.from(this.data, ([name, value]) => ({ name: name, value: value })),
          center: ['50%', '50%'],
        },
      ],
    });
  }
}
</script>

<style scoped>
/* 數據分析頁面的樣式 */
.chart-space {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart {
  width: 400px;
  height: 400px;
}

.chart > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chart-title {
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  background-color: #007bff; /* 藍色背景 */
  color: white; /* 白色字體 */
  padding: 2px 25px;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 50%;
}

@media (max-width: 768px) {
  .chart {
    max-width: 300px;
  }
}
</style>
