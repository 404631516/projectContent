<template>
  <el-dialog :visible.sync="isDialogVisible">
    <!-- 標題 -->
    <div slot="title" text="4xl [#D69F05] left">
      {{ textData.courseSetTitle }}
    </div>
    <div class="h-full overflow-auto scrollbar">
      <CourseSelect :subjectId="defaultSubject" @onSelectCourse="addSelectedCourse" :buttonType="ButtonType.Arrow" />
      <!-- 已選擇單元 -->
      <div v-if="selectedCourseDataList.length > 0">
        <CourseList
          :selectedCourseDataList="selectedCourseDataList"
          :isShowDelete="true"
          @onDeleteSelectedCourse="deleteSelectedCourse"
        />
      </div>
    </div>
    <div slot="footer" class="flex justify-center">
      <button
        class="w-80px blueGradient"
        text="24px"
        p="x-2 y-2"
        border="rounded-50px"
        @click="onConfirmSelectCourse(selectedCourseDataList)"
      >
        {{ textData.confirm }}
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { SubjectType } from '@/helper/enum/Common';
import { CourseDetail } from '@/helper/interface/CourseMenu';
import CourseSelect from '@/views/CourseMenu/CourseSelect.vue';
import { Component, Vue, ModelSync, Emit, Prop } from 'vue-property-decorator';
import CourseList from './CourseList.vue';
import { ButtonType } from '@/components/CourseMenu/CourseBtnList.vue';

@Component({
  components: { CourseSelect, CourseList },
})
export default class CourseSet extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 既有選擇課程資料 */
  @Prop(Array) initialCourseDataList!: CourseDetail[];

  protected ButtonType = ButtonType;

  /** 選擇課程資料列表 */
  private selectedCourseDataList: CourseDetail[] = [];
  /** 初始科目 */
  private defaultSubject: SubjectType = SubjectType.Chinese;
  /** 最大選取課程單元數量 */
  private readonly maxSelectedCourse: number = 10;

  /** 文字資料 */
  private textData = {
    courseSetTitle: '題庫單元挑選',
    firstSemester: '上學期',
    secondSemester: '下學期',
    confirm: '確定',
  };

  /** 圖片資料 */
  private imgData = {
    semesterIcon: imgPath.semesterIcon,
  };

  created() {
    // 彈窗設置已選擇單元
    this.selectedCourseDataList = this.initialCourseDataList;
  }

  /** 新增選中課程單元 */
  private addSelectedCourse(courseDetail: CourseDetail): void {
    // 檢查是否重複
    if (this.selectedCourseDataList.every((item: CourseDetail) => item.course !== courseDetail.course) === false) {
      return;
    }
    // 檢查是否達到單元數量上限
    if (this.selectedCourseDataList.length === this.maxSelectedCourse) {
      return;
    }
    this.selectedCourseDataList.push(courseDetail);
  }

  /** 刪除課程單元
   * @param courseIndex
   */
  private deleteSelectedCourse(courseIndex: number): void {
    this.selectedCourseDataList.splice(courseIndex, 1);
  }

  /** 按下確定按鈕
   *  @param selectedCourseDataList
   */
  @Emit('onConfirmSelectCourse')
  private onConfirmSelectCourse(selectedCourseDataList: CourseDetail[]): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog {
  width: 80%;
  max-width: 1024px;
}

::v-deep .el-dialog__body {
  height: 60vh;
  max-height: 600px;
  padding: 5px 0px 5px 0px;
}

.scrollbar::-webkit-scrollbar {
  width: 7px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}

@media (max-width: 1024px) {
  ::v-deep .el-dialog {
    width: 100%;
  }
}
</style>
