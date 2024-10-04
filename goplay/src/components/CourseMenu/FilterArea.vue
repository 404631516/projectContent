<template>
  <div class="flex" p="y-5" text="left">
    <!-- 學年篩選 -->
    <div class="flex items-center <sm:(flex-col items-start)" m="l-1" text="2xl [#666666]">
      {{ textData.academicYear }}
      <el-select
        class="w-25 rounded-[5px] shadow-default"
        m="l-2 <sm:0"
        border="1px solid [#a5a5a5]"
        :popper-append-to-body="false"
        v-model="selectedAcademicYear"
        filterable
        placeholder="學年"
        @change="handleSelectAcademicYear"
      >
        <el-option
          v-for="(academicYear, academicYearIndex) in academicYearOptions"
          :key="academicYearIndex"
          :value="academicYearIndex"
          :label="`${academicYear}`"
        >
        </el-option>
      </el-select>
    </div>
    <!-- 年級篩選 -->
    <div class="flex items-center <sm:(flex-col items-start)" m="l-1" text="2xl [#666666]">
      {{ textData.grade }}
      <el-select
        class="w-25 rounded-[5px] shadow-default"
        m="l-2 <sm:0"
        border="1px solid [#a5a5a5]"
        :popper-append-to-body="false"
        v-model="selectedGrade"
        filterable
        placeholder="年級"
        @change="handleSelectGrade"
      >
        <el-option
          v-for="(grade, gradeIndex) in gradeOptions"
          :key="gradeIndex"
          :value="gradeIndex"
          :label="getGradeName(grade)"
        >
        </el-option>
      </el-select>
    </div>
    <!-- 版本篩選 -->
    <div class="flex items-center <sm:(flex-col items-start)" m="l-1" text="2xl [#666666]">
      {{ textData.version }}
      <el-select
        class="w-50 rounded-[5px] shadow-default"
        m="l-2 <sm:0"
        border="1px solid [#a5a5a5]"
        :popper-append-to-body="false"
        v-model="selectedPublisher"
        filterable
        placeholder="版本"
        @change="handleSelectPublisher"
      >
        <el-option
          v-for="(publisher, publisherIndex) in publisherOptions"
          :key="publisherIndex"
          :value="publisherIndex"
          :label="`${publisher.publisher_name}`"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>
<script lang="ts">
import { GradeType } from '@/helper/enum/Common';
import { PublisherData } from '@/helper/interface/CourseMenu';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';

@Component({})
export default class FilterArea extends Vue {
  /** 學年篩選選項 */
  @Prop(Array) private academicYearOptions!: number[];
  /** 年級篩選選項 */
  @Prop(Array) private gradeOptions!: GradeType[];
  /** 版本篩選選項 */
  @Prop(Array) private publisherOptions!: PublisherData[];
  /** 父層當前過濾學年 */
  @Prop(String) private academicYearValue!: number;
  /** 父層當前過濾年級 */
  @Prop() private gradeValue!: GradeType;
  /** 父層當前過濾版本 */
  @Prop() private publisherValue!: PublisherData;

  /** 選中學年 */
  private selectedAcademicYear: number = 0;
  /** 選中年級 */
  private selectedGrade: number = 0;
  /** 選中版本 */
  private selectedPublisher: number = 0;

  /** 文字資料 */
  private textData = {
    academicYear: '學年',
    grade: '年級',
    version: '版本',
  };

  /** 取得年級中文
   *  @param grade
   */
  private getGradeName(grade: GradeType): string {
    return UIHelper.toChineseGrade(grade);
  }

  /** 同步父層篩選學年
   *  @param academicYear
   */
  @Watch('academicYearValue')
  private resetAcademicYear(newAcademicYear: number): void {
    this.selectedAcademicYear = this.academicYearOptions.findIndex((academicYear) => academicYear === newAcademicYear);
  }

  /** 同步父層篩選年級
   *  @param grade
   */
  @Watch('gradeValue')
  private resetGrade(newGrade: GradeType): void {
    this.selectedGrade = this.gradeOptions.findIndex((grade) => grade === newGrade);
  }

  /** 同步父層篩選版本
   *  @param version
   */
  @Watch('publisherValue')
  private resetPublisher(newPublisher: PublisherData): void {
    this.selectedPublisher = this.publisherOptions.findIndex(
      (publisher) => publisher.publisher_id === newPublisher.publisher_id
    );
  }

  /** 切換時回傳選中學年
   * @param selectedAcademicYear
   */
  @Emit('handleSelectAcademicYear')
  private handleSelectAcademicYear(selectedAcademicYear: number): void {
    return;
  }

  /** 切換時回傳選中年級
   * @param selectedGrade
   */
  @Emit('handleSelectGrade')
  private handleSelectGrade(selectedGrade: number): void {
    return;
  }

  /** 切換時回傳選中版本
   * @param selectedPublisher
   */
  @Emit('handleSelectPublisher')
  private handleSelectPublisher(selectedPublisher: number): void {
    return;
  }
}
</script>
<style scoped>
>>> .el-icon-arrow-up:before {
  content: '\e78f';
  color: '#8F8F8F';
}
>>> .el-input__inner {
  border: 0;
  color: '#666666';
  font-size: 20px;
}
</style>
