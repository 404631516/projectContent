<template>
  <div class="learning-analysis"
        :class="{ 'phone-style': isShowPhone }">
    <div class="top-area top-mid-2">
      <p>學情分析</p>
    </div>
    <div class="middle-area">
      <div class="analysis-item flex-pos">
        <AnalysisChart :analysisChartTitle="'使用者登入次數'"
                        :isShowPhone="isShowPhone"/>
      </div>
      <div class="analysis-item flex-pos">
        <AnalysisChart :analysisChartTitle="'賽事使用次數'"
                        :isShowPhone="isShowPhone"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { ScreenType } from '@/helper/enum/Common';
import { handleScreen } from '@/helper/fnc/common';
import AnalysisChart from '@/components/LearningAnalysis/LearningAnalysisChart.vue'; // 學習成果分析圖表
@Component({
  components: {
    AnalysisChart,
  },
})
export default class Index extends Vue {
  private isShowPhone: boolean = false; // 手機樣式
  private mounted() {
    this.isShowPhone = handleScreen(ScreenType.Phone);
  }
}
</script>
<style lang="scss" scoped>
.learning-analysis {
  background-color: #000;
  .top-area {
    background-color: #616365;
    p {
      width: 493px;
      line-height: 83px;
      color: #fff;
      font-size: 60px;
      text-align: left;
      padding-top: 116px;
      margin-left: 176px;
      border-bottom: 1px solid #fff;
    }
  }
  .middle-area{
    width: 1371px;
    margin: 0 auto;
    font-size: 20px;
    color: #fff;
    .analysis-item {
      width: 1371px;
      height: 460px;
      background: #4B4B4B 0% 0%;
      box-shadow: 0px 2px 7px #26262663;
      border-radius: 10px;
      margin-top: 48px;
      &:nth-child(2) {
        margin-top: 34px;
        margin-bottom: 120px;
      }
    }
  }
}


@media (min-width: 426px) and (max-width: 1024px) {
  .learning-analysis {
    .top-area {
      p {
        padding-top: 107px;
        margin-left: 90px;
        border-bottom: 1px solid #fff;
      }
    }
    .middle-area{
      width: 980px;
      .analysis-item {
        width: 980px;
        height: 460px;
        margin-top: 23px;
        &:nth-child(2) {
          margin-top: 26px;
        }
      }
    }
  }
}

.phone-style {
  .top-area {
    p {
      width: 363px;
      height: 80px;
      line-height: 80px;
      color: #fff;
      padding-top: 70px;
      margin-left: 37px;
      border-bottom: 1px solid #fff;
    }
  }
  .middle-area{
    width: 399px;
    font-size: 18px;
    .analysis-item {
      width: 399px;
      height: 271px;
      border-radius: 10px;
      margin-top: 10px;
      &:nth-child(2) {
        margin-top: 15px;
      }
    }
  }
}
</style>
