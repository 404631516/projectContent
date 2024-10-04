<template>
  <div m="2" border="1px solid [#000000]">
    <div class="flex justify-start items-center" text="30px" m="l-3 t-5">
      <img m="r-2" :src="imgData.semesterIcon" />
      <p>{{ textData.selectedCourse }}</p>
    </div>
    <div class="w-1008px flex flex-wrap">
      <div v-for="(selectedCourseData, courseIndex) in selectedCourseDataList" :key="courseIndex" text="center">
        <div
          class="w-315px h-85px flex justify-between items-center"
          p="x-24px"
          m="10px"
          border="rounded-5px"
          bg="no-repeat cover"
          :data="courseIndex"
          :style="{
            backgroundImage: `url(${imgData.dot})`,
            backgroundColor: getSubjectColor(selectedCourseData.subjectId),
          }"
        >
          <div>
            <p text="24px [#303030]">
              {{ selectedCourseData.course.unit_name }}
            </p>
            <p m="t-1" text="20px [#303030]">
              {{ getCourseDetailName(selectedCourseData) }}
            </p>
          </div>
          <img class="w-60px h-40px" :src="imgData.arrow" />
        </div>
        <button
          v-if="isShowDelete"
          class="w-85px"
          p="x-2 y-2"
          m="10px"
          bg="pink-400"
          border="rounded-20px"
          text="24px [#FFFFFF]"
          @click="onDeleteSelectedCourse(courseIndex)"
        >
          {{ textData.delete }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { CourseDetail } from '@/helper/interface/CourseMenu';
import { Prop } from 'vue-property-decorator';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { toSubjectColor, toSubjectName } from '@/helper/fnc/common';
import { SubjectType } from '@/helper/enum/Common';

@Component({})
export default class CourseList extends Vue {
  /** 選擇課程資料列表 */
  @Prop(Array) private selectedCourseDataList!: CourseDetail[];
  /** 是否顯示刪除 */
  @Prop(Boolean) private isShowDelete!: boolean;

  /** 文字資料 */
  private textData = {
    selectedCourse: '已選擇單元',
    delete: '刪除',
  };

  /** 圖片資料 */
  private imgData = {
    semesterIcon: imgPath.semesterIcon,
    arrow: imgPath.arrowTwoIconBaseUrl,
    dot: imgPath.dotBaseUrl,
  };

  /** 取得選取單元的年級/學期/科目/名稱字串
   *  @param courseData
   */
  private getCourseDetailName(courseData: CourseDetail): string {
    return `${UIHelper.toChineseGrade(courseData.gradeType)}${UIHelper.toChineseSemester(
      courseData.semester
    )}-${toSubjectName(courseData.subjectId)}-${courseData.publisher.publisher_name}`;
  }

  /** 取得科目顏色
   *  @param subjectId
   */
  private getSubjectColor(subjectId: SubjectType): string {
    return toSubjectColor(subjectId);
  }

  /** 刪除選中課程單元
   * @param courseIndex
   */
  @Emit('onDeleteSelectedCourse')
  private onDeleteSelectedCourse(courseIndex: number): void {
    return;
  }
}
</script>
<style scoped></style>
