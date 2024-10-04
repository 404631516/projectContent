<template>
  <div>
    <!-- banner -->
    <GeneralBanner :bannerImg="imgPath.orangeBannerBaseUrl" :title="textData.dataDashboard" />
    <!-- 使用 Element UI 的標籤頁組件來顯示不同的頁面內容 -->
    <el-tabs value="overview" class="tabs">
      <!-- 總覽標籤頁 -->
      <el-tab-pane :label="textData.overview" name="overview">
        <TeacherOverview></TeacherOverview>
      </el-tab-pane>

      <!-- 學生學習表現標籤頁 -->
      <el-tab-pane :label="textData.studentPerformance" name="student-performance">
        <BoxPlotChart></BoxPlotChart>
      </el-tab-pane>

      <!-- 學習歷程查詢標籤頁 -->
      <el-tab-pane :label="textData.learningHistory" name="learning-history"
        ><LearningRecordStatistic></LearningRecordStatistic>
      </el-tab-pane>

      <!-- 自訂數據查詢標籤頁 -->
      <el-tab-pane :label="textData.customData" name="custom-data">
        <TeacherAdmin></TeacherAdmin>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import TeacherAdmin from '../StatisticReport/Index.vue';
import LearningRecordStatistic from '../../BackEndManagement/StatisticReport/Index.vue';
import TeacherOverview from './Overview/TeacherOverview.vue';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import BoxPlotChart from './BoxPlotChart.vue';

@Component({
  components: {
    TeacherAdmin,
    LearningRecordStatistic,
    TeacherOverview,
    GeneralBanner,
    BoxPlotChart,
  },
})
export default class TeacherDataDashboard extends Vue {
  /** 宣告給Vue使用 */
  private imgPath = imgPath;

  /** 文字資料 */
  private textData = {
    dataDashboard: '數據儀表板',
    overview: '總覽',
    studentPerformance: '學生學習表現',
    learningHistory: '學習歷程查詢',
    customData: '自訂數據查詢',
  };
}
</script>

<style scoped>
/* 數據分析頁面的樣式 */
.tabs {
  padding: 10px;
}

::v-deep .el-tabs__active-bar {
  background-color: #fbc336;
  margin-bottom: 10px;
  margin-top: 10px;
}

::v-deep .el-tabs__item.is-active,
::v-deep .el-tabs__item:hover {
  color: #fbc336;
}

::v-deep .el-tabs__nav is-top {
  margin-bottom: 10px;
}

::v-deep .el-tabs__item {
  font-weight: bold;
  font-size: 24px;
  color: #909090;
  padding: 0 40px;
  margin-bottom: 10px;
}

::v-deep .el-tabs__header {
  box-shadow: 0px 2px 10%;
  margin: 0;
}

::v-deep .el-tabs__nav-scroll {
  padding-left: 170px;
}
</style>
