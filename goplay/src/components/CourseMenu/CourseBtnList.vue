<template>
  <div class="course-btnlist">
    <!-- 手機板按鈕組件 -->
    <el-carousel trigger="click" class="carousel-course">
      <el-carousel-item v-for="(courseCarousel, index) in courseCarouselData" :key="index">
        <div
          class="course-item"
          @click="onClickCourse(course)"
          v-for="(course, courseIndex) in courseCarousel"
          :key="courseIndex"
          :style="{
            backgroundImage: `url(${imgData.dot})`,
            backgroundColor: getSubjectColor(subjectIndex),
          }"
        >
          <p>{{ course.unit_name }}</p>
          <img :src="imgData.arrow" />
        </div>
      </el-carousel-item>
    </el-carousel>
    <!-- 電腦板按鈕組件 -->
    <div class="course-list flex-pos">
      <div v-for="(course, courseIndex) in courseList" :key="courseIndex" @click="onClickCourse(course)">
        <div
          class="course-item"
          :data="courseIndex"
          :style="{
            backgroundImage: `url(${imgData.dot})`,
            backgroundColor: getSubjectColor(subjectIndex),
          }"
        >
          <!-- TODO: 調整樣式 -->
          <div class="content">
            <div class="course-grade" v-if="course.subject_name !== getSubjectName(subjectIndex)">
              {{ course.subject_name }}
            </div>
            <p>{{ course.unit_name }}</p>
          </div>
          <img :src="buttonType === ButtonType.Plus ? imgData.plus : imgData.arrow" :style="{ height: imageHeight }" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { GameDetail } from '@/helper/interface/CourseMenu';
import ImgPath from '@/config/imgPath/imgPath';
import { SubjectType } from '@/helper/enum/Common';
import { toSubjectColor, toSubjectName } from '@/helper/fnc/common';

/** 按鈕類型 */
export enum ButtonType {
  Plus = 0,
  Arrow,
}

@Component({})
export default class CourseBtnList extends Vue {
  /** 課程單元列表 */
  @Prop(Array) private courseList!: GameDetail[];
  /** 選中科目 */
  @Prop(Number) private subjectIndex!: SubjectType;
  /** 遊戲類型 */
  @Prop(Number) private buttonType!: ButtonType;

  private ButtonType = ButtonType;

  /** 圖片資料 */
  private imgData = {
    arrow: ImgPath.arrowTwoIconBaseUrl,
    dot: ImgPath.dotBaseUrl,
    plus: ImgPath.plusIconBaseUrl,
  };

  /** 圖片高度 */
  private imageHeight() {
    return this.buttonType === ButtonType.Plus ? '60px' : '40px';
  }

  /** 取得科目中文
   *  @param subjectType 科目類型
   */
  private getSubjectName(subjectType: SubjectType): string {
    return toSubjectName(subjectType);
  }

  /** 課程分成三個一組的陣列，用於手機版課程輪播圖 */
  private get courseCarouselData(): GameDetail[][] {
    let carouselItem: GameDetail[] = [];
    const carouselData: GameDetail[][] = [];
    const courseListIndex = this.courseList.length - 1;
    this.courseList.map((item: GameDetail, index: number) => {
      carouselItem.push(item);
      if (carouselItem.length === 3) {
        carouselData.push(carouselItem);
        carouselItem = [];
      }
      if (index === courseListIndex && carouselItem.length > 0) {
        carouselData.push(carouselItem);
      }
    });
    return carouselData;
  }

  /** 取得科目顏色
   *  @param subjectId
   */
  private getSubjectColor(subjectId: SubjectType): string {
    return toSubjectColor(subjectId);
  }

  /** 點擊課程單元按鈕
   * @param course
   */
  @Emit('onClickCourse')
  private onClickCourse(course: GameDetail): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.content {
  overflow: hidden;
  text-overflow: ellipsis;
}
.course-grade {
  display: flex;
  color: #fff;
  font-size: 20px;
}
.course-btnlist {
  width: 1010px;
  @media (max-width: 435px) {
    width: 100%;
  }
  .course-list {
    @media (max-width: 435px) {
      display: none;
    }
    justify-content: flex-start;
    flex-wrap: wrap;
    .course-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 315px;
      height: 85px;
      margin: 10px;
      padding: 0 20px;
      border-radius: 5px;
      box-sizing: border-box;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      cursor: pointer;
      p {
        font-size: 24px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #303030;
      }
      img {
        width: 60px;
      }
    }
  }
  .carousel-course {
    display: none;
    .course-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 315px;
      height: 85px;
      margin: 10px;
      padding: 0 20px;
      border-radius: 5px;
      box-sizing: border-box;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      cursor: pointer;
      p {
        font-size: 22px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #303030;
      }
      img {
        width: 60px;
        height: 40px;
      }
    }
    @media (max-width: 435px) {
      display: block;
    }
  }
}
</style>
