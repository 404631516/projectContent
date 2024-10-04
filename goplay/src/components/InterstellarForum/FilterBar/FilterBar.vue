<template>
  <div class="filter-bar shadow-default" border="t-6 solid [#fdc221]" bg="[#FFF]">
    <!-- 下拉選單 -->
    <div class="w-6/10 <lg:w-[98%] flex justify-between" m="x-auto" p="y-3">
      <div class="flex">
        <div font="bold" text="18px [#707070]">
          <!-- 科目 -->
          {{ textData.subject }}
          <el-select
            class="w-35"
            v-model="subject"
            :popper-append-to-body="false"
            :placeholder="textData.subject"
            @change="handleSubject"
          >
            <el-option v-for="(subject, index) in subjectOptions" :key="index" :value="subject"> </el-option>
          </el-select>
        </div>
        <div m="l-2" font="bold" text="18px [#707070]">
          <!-- 年級 -->
          {{ textData.grade }}
          <el-select
            class="w-25"
            v-model="grade"
            :popper-append-to-body="false"
            :placeholder="textData.grade"
            @change="handleGrade"
          >
            <el-option v-for="(grade, index) in gradeOptions" :key="index" :value="grade"> </el-option>
          </el-select>
        </div>
      </div>
      <div class="flex items-center rounded-[30px]" p="x-6 y-1" m="y-auto" bg="[#00000099]" text="lg [#FFF]">
        {{ textData.askCount }}
        <span m="l-1" text="[#2CEAEC]">{{ `${answerCount}/${answerMax}` }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import TableManager from '@/manager/TableManager';
import { SubjectData } from '@/manager/TableManager';

@Component({
  components: {},
})
export default class FilterBar extends Vue {
  /**目前科目 */
  private subject: string = '';
  /**目前年級 */
  private grade: string = '';
  /** 剩餘求助次數 */
  private answerCount: number = 0;
  /**中文年級對照表 */
  private gradeOptions: string[] = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三'];

  /**文字資料 */
  private textData = {
    subject: '科目',
    grade: '年級',
    askCount: '今日回答次數',
  };

  /**目前靜態表開放科目 */
  private get subjectOptions() {
    const data = TableManager.subject.getAll();
    return data.map((item: SubjectData) => {
      return item.subject_groupings_name;
    });
  }

  /** 每日挑戰上限 */
  private get answerMax(): number {
    return this.$$store.state.InterstellarForumModule.answerMax;
  }

  async created() {
    this.answerCount = await this.$$store.dispatch('getAdlForumUserRecord');
  }

  /**選年級觸發 */
  @Emit('handleGrade')
  private handleGrade() {
    return this.grade;
  }

  /**選科目觸發 */
  @Emit('handleSubject')
  private handleSubject() {
    return this.subject;
  }
}
</script>

<style scoped>
::v-deep .el-input__inner {
  background: #f3edd5;
  color: #666666;
  font-weight: 700;
  font-size: 18px;
}
::v-deep .el-input__inner::placeholder {
  font-weight: 700;
  color: #666666;
}
::v-deep .el-input__icon::before {
  color: #dfbf73;
  content: '\e78f';
  font-size: 20px;
}
::v-deep .el-select-dropdown__list {
  box-shadow: 0px 3px 6px #00000066;
  text-align: left;
}
::v-deep .el-select-dropdown__item {
  font-weight: 700;
  font-size: 18px;
  margin: 0 10px;
  border-radius: 5px;
}
::v-deep .el-select-dropdown__item:hover {
  background-color: #f3edd5;
}
::v-deep .el-select-dropdown__item.selected {
  background: #f3edd5;
  color: #666666;
}
</style>
