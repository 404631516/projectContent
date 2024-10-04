<template>
  <div class="background">
    <div class="content">
      <div class="title" :style="{ backgroundColor: titleBackgroundColor }">{{ title }}</div>
      <div ref="barChart" class="chart"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as eCharts from 'echarts';

@Component
export default class BarChart extends Vue {
  /** 標題 */
  @Prop({ required: true }) title: string;
  /** 標題背景顏色 */
  @Prop({ required: false, type: String }) titleBackgroundColor!: string;

  /** 標籤列表 */
  @Prop({ required: true }) labelList: string[];
  /** 數值列表 */
  @Prop({ required: true }) valueList: number[];
  /** 數值描述 */
  @Prop({ required: true }) valueDescription: string;

  /** 圖表 */
  private chart: eCharts.EChartsType;

  public $refs: {
    barChart: HTMLDivElement;
  };

  mounted() {
    this.refreshChart();
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize(): void {
    this.chart?.resize?.();
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.chart?.dispose();
  }

  /** 重新繪製圖表 */
  @Watch('labelList', { deep: true, immediate: true })
  @Watch('valueList', { deep: true, immediate: true })
  private refreshChart(): void {
    this.chart = eCharts.init(this.$refs.barChart);

    this.chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: {
        left: '20%', // 增加左側空間
        right: '10%', // 保持右側的間距
        top: '10%', // 保持上側的間距
        bottom: '10%', // 保持下側的間距
      },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: this.labelList,
      },
      series: [
        {
          color: '#a80efe',
          name: this.valueDescription,
          type: 'bar',
          data: this.valueList,
        },
      ],
    });
  }
}
</script>

<style scoped>
/* 數據分析頁面的樣式 */
.chart {
  width: 100%;
  height: 800px; /* 固定图表容器的高度，确保在resize时不改变 */
}

.chart > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/** 排行榜及答題正確率排版 */
.background {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 30px;
}

.content {
  width: 100%;
  height: 100%;
}

.title {
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  background-color: #a08efe; /* 橘色背景 */
  color: white; /* 白色字體 */
  padding: 2px 25px;
  border-radius: 5px;
  margin-bottom: 10px;
}

::v-deep .el-table thead {
  color: #fff;
}

::v-deep.el-table th.el-table__cell {
  background: #007bff;
}

@media (max-width: 1568px) {
  .content {
    width: 90%;
    height: 100%;
  }
}

@media (max-width: 768px) {
  .content {
    width: 80%;
    height: 100%;
  }
}
</style>
