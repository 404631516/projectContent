<template>
  <!-- 圖表渲染 -->
  <div ref="barChart" style="width: 400px; height: 300px"></div>
</template>

<script lang="ts">
import { Component, Ref, Vue, Prop, Watch } from 'vue-property-decorator';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
} from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChartData } from '@/helper/interface/TeacherAdmin';
import { TopLevelFormatterParams } from 'echarts/types/dist/shared';
echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);
type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | GridComponentOption | BarSeriesOption
>;

@Component({
  components: {},
})
export default class BarAnalysisChart extends Vue {
  /**渲染圖表元素 */
  @Ref('barChart') readonly chartBox!: HTMLDivElement;
  /**圖表資料 */
  @Prop({ default: undefined }) readonly chartData: BarChartData | undefined;
  /**圖表標題 */
  @Prop({ type: String, default: '' }) readonly title!: string;
  /** 圖表 */
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
  private onChartData(chartData: BarChartData | undefined) {
    /**清除舊資料 */
    this.initChart.clear();
    const that = this;
    this.initChart.showLoading('default', {
      maskColor: 'transparent',
      textColor: '#878787',
      fontSize: 20,
      text: 'loading ...',
    });
    if (!chartData) {
      return;
    }
    /**設定圖表資料 */
    this.initChart.setOption({
      title: {
        left: 'center',
        textStyle: {
          color: '#878787',
        },
        text: this.title,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (p: TopLevelFormatterParams) => {
          if (Array.isArray(p)) {
            let tooltip = `<div>${p[0].name}</div>`;
            p.map((item) => {
              tooltip += `<div style="display: flex; align-items: center;justify-content: space-between">${item.marker}<span>${item.seriesName}  ${item.data}   ${that.chartData?.tooltipUnit}</span></div>`;
            });
            return tooltip;
          }
          return '';
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      textStyle: {
        color: '#878787',
      },
      xAxis: {
        data: chartData?.x,
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        axisLabel: {
          formatter: chartData?.yUnit,
        },
        type: 'value',
      },
      series: chartData?.yData,
    } as EChartsOption);
    /**關掉 Loading */
    this.initChart.hideLoading();
  }
}
</script>
