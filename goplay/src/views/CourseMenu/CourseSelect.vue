<template>
  <div v-if="courseLinks">
    <!-- 科目篩選 -->
    <div class="w-full flex justify-center items-center">
      <div class="w-full max-w-1020px" border="b-1 solid [#C4C4C4]" p="y-5">
        <SwitchSubjectTab class="ml-2 <lg:ml-0" :activeSubject="currentSubject" @selectSubject="selectSubject" />
      </div>
    </div>
    <!-- 學年/年級/版本篩選 -->
    <div class="w-full flex justify-center items-center shadow-default">
      <div class="w-full max-w-1020px">
        <FilterArea
          class="ml-2 <lg:ml-0"
          :academicYearOptions="academicYearOptions"
          :gradeOptions="gradeOptions"
          :publisherOptions="publisherOptions"
          :academicYearValue="currentAcademicYear"
          :gradeValue="currentGrade"
          :publisherValue="currentPublisher"
          @handleSelectAcademicYear="selectAcademicYear"
          @handleSelectGrade="selectGrade"
          @handleSelectPublisher="selectPublisher"
        ></FilterArea>
      </div>
    </div>
    <!-- 課程單元 -->
    <!-- 上學期 -->
    <div class="w-full flex justify-center items-center" m="t-2">
      <div class="w-1020px">
        <div
          class="max-w-995px flex-pos left"
          text="30px"
          m="t-20px b-10px"
          v-if="firstSemesterCourseList.length > 0 && isShowSemesterTag"
        >
          <img class="w-20px h-30px object-contain" m="l-3 r-2" :src="imgData.semesterIcon" />
          <p>{{ textData.firstSemester }}</p>
        </div>
        <CourseBtnList
          :courseList="firstSemesterCourseList"
          :subjectIndex="currentSubject"
          :buttonType="buttonType"
          @onClickCourse="addSelectedCourse($event, SemesterType.FirstSemester)"
        />
        <!-- 下學期 -->
        <div
          class="w-full max-w-995px flex-pos left"
          text="30px"
          m="l-3 t-20px b-10px"
          v-if="secondSemesterCourseList.length > 0 && isShowSemesterTag"
        >
          <img class="w-20px h-30px object-contain" m="r-2" :src="imgData.semesterIcon" />
          <p>{{ textData.secondSemester }}</p>
        </div>
        <CourseBtnList
          :courseList="secondSemesterCourseList"
          :subjectIndex="currentSubject"
          :buttonType="buttonType"
          @onClickCourse="addSelectedCourse($event, SemesterType.SecondSemester)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { subjectUnitGameLinkListAPI, subjectUnitMenuOptionsAPI } from '@/api/courseMenu';
import CourseBtnList, { ButtonType } from '@/components/CourseMenu/CourseBtnList.vue';
import FilterArea from '@/components/CourseMenu/FilterArea.vue';
import SwitchSubjectTab from '@/components/CourseMenu/SwitchSubjectTab.vue';
import imgPath from '@/config/imgPath/imgPath';
import { Message } from '@/helper/class/Common';
import { GradeType, ResponseState, SubjectType, SemesterType } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { GameDetail, CourseDetail, PublisherData } from '@/helper/interface/CourseMenu';

@Component({
  components: { SwitchSubjectTab, FilterArea, CourseBtnList },
})
export default class CourseSelect extends Vue {
  /** 因材網指定科目id */
  @Prop(Number) private subjectId!: SubjectType;
  /** 遊戲類型 */
  @Prop(Number) private buttonType!: ButtonType;

  /** 全學年選項 */
  private academicYearOptions: number[] = [];
  /** 全年級選項 */
  private gradeMap: number[][] = [];
  /** 全版本選項 */
  private publisherMap: PublisherData[][] = [];

  /** 選到的學年 */
  private academicYearIndex: number = -1;
  /** 選到的年級 */
  private gradeIndex: number = 0;
  /** 選到的版本 */
  private publisherIndex: number = 0;
  /** 記錄選到的年級 */
  private previousGrade: GradeType = GradeType.g0;

  /** 當前單元資料 */
  private courseLinks: GameDetail[][] = [];

  /** 是否顯示上下學期標題 */
  private isShowSemesterTag: boolean = true;

  /** 目前選到的科目 */
  private currentSubject: SubjectType = SubjectType.Chinese;

  /** 學期類別 */
  private SemesterType = SemesterType;

  /** 當前選中學年 */
  private get currentAcademicYear(): number {
    return this.academicYearOptions[this.academicYearIndex];
  }

  /** 當前選中年級 */
  private get currentGrade(): GradeType {
    return this.gradeOptions[this.gradeIndex];
  }

  /** 當前選中版本 */
  private get currentPublisher(): PublisherData {
    return this.publisherOptions[this.publisherIndex];
  }

  /** 年級選項 */
  private get gradeOptions(): GradeType[] {
    return this.gradeMap[this.currentAcademicYear]?.sort((a: number, b: number) => a - b) ?? [];
  }

  /** 設置版本的選項 */
  private get publisherOptions(): PublisherData[] {
    // 組成版本KEY(學年+年級)
    const filterValue = `${this.currentAcademicYear}${this.currentGrade}`;
    return this.publisherMap[+filterValue] ?? [];
  }

  /** 上學期課程 */
  private get firstSemesterCourseList(): GameDetail[] {
    return this.courseLinks[SemesterType.FirstSemester] ?? [];
  }

  /** 下學期課程 */
  private get secondSemesterCourseList(): GameDetail[] {
    return this.courseLinks[SemesterType.SecondSemester] ?? [];
  }

  /** 文字資料 */
  private textData = {
    firstSemester: '上學期',
    secondSemester: '下學期',
  };

  /** 圖片資料 */
  private imgData = {
    semesterIcon: imgPath.semesterIcon,
  };

  created() {
    // 傳入初始科目
    this.selectSubject(this.subjectId);
  }

  /** 切換科目
   * @param subject - 選擇科目
   */
  private async selectSubject(subject: SubjectType): Promise<void> {
    // 選中科目
    this.currentSubject = subject;

    // 抓科目資料
    await this.getSubjectUnitMenuOptions(subject);

    // 預設選最新學年
    await this.selectAcademicYear(Math.max(this.academicYearOptions.length - 1, 0));
  }

  /** 選擇學年
   * @param newAcademicYear
   */
  private async selectAcademicYear(newAcademicYear: number): Promise<void> {
    // 設定新學年
    this.academicYearIndex = newAcademicYear;

    // 等待學年度改變後觸發的更新完成，再去設定年級
    await this.$nextTick();

    // 預設選使用者年級, 不然選第一個年級
    if (this.previousGrade === GradeType.g0) {
      this.previousGrade = this.$$store.getters.userGradeNumber;
    }

    const userGradeIndex = this.gradeOptions.findIndex((grade) => grade === this.previousGrade);
    this.selectGrade(Math.max(userGradeIndex, 0));
  }

  /** 選擇年級
   * @param newGrade
   */
  private selectGrade(newGrade: number): void {
    // 設定年級
    this.gradeIndex = newGrade;

    this.previousGrade = this.currentGrade;

    // 預設選第一個版本
    this.selectPublisher(0);
  }

  /** 選擇版本
   * @param newPublisher
   */
  private selectPublisher(newPublisher: number): void {
    // 設定版本
    this.publisherIndex = newPublisher;
    // 設定下方單元清單
    this.setCourseList();
  }

  /** 產生上下學期課程 */
  private async setCourseList(): Promise<void> {
    // 設定科目選項
    const filterValue = +`${this.currentAcademicYear}${this.currentGrade}${this.currentPublisher.publisher_id}`;

    // API 取得科目選項的所有單元
    await this.getSubjectUnitGameLinkList(this.currentSubject, filterValue);
  }

  /** 後端取選取科目的所有學年/年級/版本
   * @param subjectId - 科目 ID
   */
  private async getSubjectUnitMenuOptions(subjectId: SubjectType): Promise<void> {
    // 組成封包
    const data = {
      subjectGroupId: subjectId,
    };

    try {
      // API 抓取科目資料
      const response: any = await subjectUnitMenuOptionsAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 設定學年選項
      this.academicYearOptions = response.semester;

      // 設定學年的全年級選項
      this.gradeMap = response.semesterGradeMap;

      // 設定全學年+年級的版本選項
      this.publisherMap = response.semesterGradePublisherMap;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 後端取得符合篩選的單元
   *  @param subjectId - 科目ID
   *  @param selectOption - 學年/年級/版本篩選條件
   */
  private async getSubjectUnitGameLinkList(subjectId: SubjectType, selectOption: number): Promise<void> {
    // 組成封包
    const data = {
      subjectGroupId: subjectId,
      semesterGradePublisherKey: selectOption,
    };

    try {
      // API 取得指定條件科目
      const response: any = await subjectUnitGameLinkListAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 設定科目清單資料
      this.courseLinks = response.semesterGradePublisherGameMap;
      this.isShowSemesterTag = !response.noSemester;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 新增選中課程單元
   * @param course
   * @param semesterType
   */
  private addSelectedCourse(course: GameDetail, semesterType: SemesterType): void {
    // 設定科目單元資料
    const newSelectedCourse: CourseDetail = {
      subjectId: this.currentSubject,
      gradeType: this.currentGrade,
      semester: semesterType,
      publisher: this.currentPublisher,
      course,
    };

    this.onSelectCourse(newSelectedCourse);
  }

  /** 確定選擇單元
   * @param courseDetail
   */
  @Emit('onSelectCourse')
  private onSelectCourse(courseDetail: CourseDetail): void {
    return;
  }
}
</script>
<style scoped></style>
