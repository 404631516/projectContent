<template>
  <!-- 圖表資料 -->
  <div ref="pieChart" style="width: 400px; height: 300px"></div>
</template>

<script lang="ts">
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  TooltipComponentOption,
} from 'echarts/components';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { PieChartData } from '@/helper/interface/TeacherAdmin';
echarts.use([
  TitleComponent,
  TooltipComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
]);
type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | PieSeriesOption
>;
@Component({
  components: {},
})
export default class PieAnalysisChart extends Vue {
  /**HTML元素 */
  @Ref('pieChart') readonly chartBox!: HTMLDivElement;
  /**圖表資料 */
  @Prop({default: undefined}) readonly chartData: PieChartData | undefined;
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
  private onChartData(chartData: PieChartData | undefined) {
    /**清除圖表資料 */
    this.initChart.clear();
    /**load 圖示 */
    this.initChart.showLoading('default', {
      maskColor: 'transparent',
      textColor: '#878787',
      fontSize: 20,
      text: 'loading ...',
    });
    if (!chartData) {
      return;
    }
    /**關掉 load */
    this.initChart.hideLoading();
    /**空的要設定不同資料 */
    if (chartData?.isEmpty) {
      this.initChart.setOption({
        title: {
          text: this.title,
          left: 'center',
          textStyle: {
            color: '#878787',
          },
          subtext: '此區間無數據',
          subtextStyle: {
            color: '#878787',
            fontSize: 25,
            lineHeight: 250,
            hight: 230,
          },
        },
      });
      return;
    }
    /**圖表設定 */
    this.initChart.setOption({
      title: {
        text: this.title,
        left: 'center',
        textStyle: {
          color: '#878787',
        },
      },
      textStyle: {
        color: '#878787',
      },
      tooltip: {
        trigger: 'item',
        formatter: chartData?.tooltipUnit,
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: chartData?.data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    } as EChartsOption);
  }
}
</script>
