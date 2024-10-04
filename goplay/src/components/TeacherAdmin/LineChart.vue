<
<template>
  <!-- 圖表框 -->
  <div ref="LineChart" style="width: 400px; height: 300px"></div>
</template>

<script lang="ts">
import { Component, Ref, Vue, Prop, Watch } from 'vue-property-decorator';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
} from 'echarts/components';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChartData } from '@/helper/interface/TeacherAdmin';
import { TopLevelFormatterParams } from 'echarts/types/dist/shared';
import { Load } from '@/helper/class/Common';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | GridComponentOption | LineSeriesOption
>;

@Component({
  components: {},
})
export default class LineAnalysisChart extends Vue {
  /**HTML 元素 */
  @Ref('LineChart') readonly chartBox!: HTMLDivElement;
  /**圖表資料 */
  @Prop({default: undefined}) readonly chartData: LineChartData | undefined;
  /**圖表標題 */
  @Prop({ type: String, default: '' }) readonly title!: string;
  /**圖表 */
  private initChart!: echarts.ECharts;

  mounted() {
    this.initChart = echarts.init(this.chartBox);
    this.initChart.showLoading('default', {
      maskColor: 'transparent',
      textColor: '#878787',
      fontSize: 20,
      text: 'loading ...',
    });
  }

  @Watch('chartData')
  private onChartData(chartData: LineChartData | undefined) {
    // 清除舊資料
    this.initChart.clear();
    // Load 圖示
    this.initChart.showLoading('default', {
      maskColor: 'transparent',
      textColor: '#878787',
      fontSize: 20,
      text: 'loading ...',
    });
    if (!chartData) {
      return;
    }
    const that = this;
    // 設置圖示
    const option: EChartsOption = {
      title: {
        text: this.title,
        left: 'center',
        textStyle: {
          color: '#878787',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (p: TopLevelFormatterParams) => {
          if (Array.isArray(p)) {
            let tooltip = `<div>${p[0].name}</div>`;
            p.map((item) => {
              tooltip += `<div style="display: flex; align-items: center;justify-content: space-between">${item.marker}<span>${item.seriesName}</span><span> ${item.data}   ${that.chartData?.tooltipUnit}</span></div>`;
            });
            return tooltip;
          }
          return '';
        },
      },
      grid: {
        left: '1%',
        width: '90%',
        height: '80%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData?.x,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: chartData?.yUnit,
        },
      },
      series: chartData?.yData,
    };
    this.initChart.setOption(option);
    // 關掉 Load
    this.initChart.hideLoading();
  }
}
</script>
