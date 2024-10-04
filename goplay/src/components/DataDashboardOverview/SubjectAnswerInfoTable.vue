<template>
  <div class="background">
    <div class="content">
      <div class="title" :style="{ backgroundColor: titleBackgroundColor }">{{ title }}</div>
      <el-table :data="getSubjectAnswerDataList()">
        <el-table-column prop="subject" :label="textData.subject" align="center"> </el-table-column>
        <el-table-column prop="quizAnswerCount" :label="textData.quizAnswerCount" align="center"></el-table-column>
        <el-table-column prop="quizCorrectRate" :label="textData.quizCorrectCount" align="center"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
/** 科目答題資訊 */
export interface SubjectAnswerInfo {
  quizAnswerCount: number;
  quizCorrectCount: number;
}

import { SubjectType } from '@/helper/enum/Common';
import TableManager from '@/manager/TableManager';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class SubjectAnswerInfoTable extends Vue {
  /** 標題內容 */
  @Prop({ required: true, type: String }) title!: string;
  /** 標題背景顏色 */
  @Prop({ required: false, type: String }) titleBackgroundColor!: string;
  /** 傳入表格資料 */
  @Prop({ required: true, type: Array }) subjectAnswerData: Map<SubjectType, SubjectAnswerInfo> = new Map();

  private textData = {
    subject: '科目',
    quizAnswerCount: '答題次數',
    quizCorrectCount: '答題正確率',
  };

  /** 取得科目答題資訊 */
  private getSubjectAnswerDataList() {
    // 取得所有科目資料
    const subjectAnswerDataList = TableManager.subject.getAll().map((subject) => {
      const subjectAnswerInfo = this.subjectAnswerData.get(subject.id);
      const quizAnswerCount = subjectAnswerInfo?.quizAnswerCount || 0;
      const quizCorrectCount = subjectAnswerInfo?.quizCorrectCount || 0;
      // 計算答題正確率
      const quizCorrectRate = quizAnswerCount > 0 ? Math.round((quizCorrectCount / quizAnswerCount) * 100) : 0;

      return {
        subject: subject.subject_groupings_name,
        quizAnswerCount,
        quizCorrectRate,
      };
    });

    // 將答題正確率由高到低排序
    return subjectAnswerDataList.sort((a, b) => b.quizCorrectRate - a.quizCorrectRate);
  }
}
</script>

<style scoped>
/** 答題正確率表格背景 */
.background {
  display: flex;
  justify-content: center;
  height: 100%; /* 使背景填滿整個視窗高度 */
  padding-top: 30px;
  margin-right: 10px;
}

.content {
  width: 90%;
  height: 100%;
  max-height: 800px;
}

.title {
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  color: white; /* 白色字體 */
  padding: 2px 25px;
  border-radius: 5px;
  margin-bottom: 10px;
}

::v-deep .el-table thead {
  color: #fff;
}

::v-deep.el-table th.el-table__cell {
  font-size: 24px;
  background: #007bff;
  border: 1px solid #000;
}

::v-deep.el-table .el-table__cell.is-center {
  font-size: 24px;
  height: 100px;
  border: 1px solid #000;
}

::v-deep.el-table .el-table__body-wrapper {
  height: 600px;
  overflow: auto;
}

::v-deep .el-table .el-table__header-wrapper .el-table__header {
  border-collapse: separate;
  border-spacing: 2px;
  width: auto !important;
}

::v-deep .el-table .el-table__body-wrapper .el-table__body {
  border-collapse: separate;
  border-spacing: 2px;
  width: auto !important;
}

@media (max-width: 768px) {
  .content {
    width: 80%;
    height: 100%;
  }
}
</style>
