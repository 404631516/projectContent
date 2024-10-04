<template>
  <el-col class="analysis-chart"
            :class="{ 'analysischart-phonestyle': isShowPhone }">
    <el-row>
      <h2>{{ analysisChartTitle }}</h2>
      <div class="chart"></div>
      <!-- 圖表待補 -->
      <div class="instruction">
        <p>過去七天登入平台的總次數統計表</p>
        <p>（X軸：過去七天的日期，Ｙ軸：登入次數量）</p>
      </div>
    </el-row>
  </el-col>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
@Component
export default class AnalysisChart extends Vue {
  @Prop() public isShowPhone!: boolean; // 手機樣式
  @Prop() public analysisChartTitle!: string; // 標題
}
</script>
<style lang="scss" scoped>
.analysis-chart {
  width: 583px;
  height: auto;
  color: #fff;
  font-size: 16px;
  h2 {
    margin-top: 20px;
    font-size: 20px;
  }
  .chart {
    margin-top: 15px;
    height: 260px;
  }
  .instruction {
    margin-top: 28px;
    p {
      font-size: 18px;
      color: #DFDFDF;
    }
  }
}
.analysischart-phonestyle {
  width: 390px;
  height: auto;
  h2 {
    margin-top: 18px;
    font-size: 18px;
  }
  .chart {
    margin-top: 22px;
    height: 127px;
  }
  .instruction {
    margin-top: 12px;
    p {
      font-size: 14px;
      color: #DFDFDF;
    }
  }
}
</style>