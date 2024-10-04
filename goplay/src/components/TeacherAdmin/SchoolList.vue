<template>
  <div v-if="schoolClassList.length">
    <div m="b-3" text="[#D69F05]" font="bold">{{ textData['year'] }}</div>
    <!-- 學年選項 -->
    <div class="flex items-center" m="b-3">
      <label
        v-for="schoolListItem in schoolClassList"
        :key="schoolListItem.academicYearId"
        class="flex items-center"
        m="r-2"
        text="1.25rem"
      >
        <input
          class="appearance-none w-5 h-5 rounded-md bg-clip-content cursor-pointer"
          border="2px solid [#666666]"
          p="1px"
          :class="{
            'bg-yellow': pickedAcademicYear === schoolListItem.academicYearId,
          }"
          type="radio"
          m="r-2"
          :value="schoolListItem.academicYearId"
          v-model="pickedAcademicYear"
          @click="onChangeSelectAcademicYear(schoolListItem.academicYearId)"
        />
        {{ schoolListItem.academicYearTitle }}</label
      >
    </div>
    <!-- 年級選項 -->
    <div v-if="isSchoolList">
      <template
        v-for="gradeListItem in schoolClassList.find(
          (schoolListItem) => pickedAcademicYear === schoolListItem.academicYearId,
        )?.gradeChildren || []"
      >
        <!-- 選擇年級 -->
        <button
          :key="gradeListItem.grade"
          class="block"
          m="b-3"
          text="[#D69F05]"
          @click="onClickGrade(gradeListItem.grade)"
        >
          {{ gradeListItem.gradeString }}
          <i class="el-icon-caret-top transition" :class="{ 'transform-180': pickedGrade === gradeListItem.grade }"></i>
        </button>
        <!-- 班級選項 -->
        <div :key="`${gradeListItem.grade}s`" v-if="pickedGrade === gradeListItem.grade" m="l-5">
          <div
            v-for="classItem in gradeListItem.classChildren"
            :key="classItem.classId"
            class="flex items-center"
            m="y-5"
          >
            <!-- 選擇班級 -->
            <button
              :key="classItem.classId"
              :class="{
                'bg-yellow': pickedClass.classId === classItem.classId,
              }"
              @click="onSelectClass(classItem)"
              text="[#FFF]"
              class="rounded-3xl shadow-default z-2"
              bg="black opacity-50"
              border="2px solid [#FFF]"
              p="x-3 y-1"
            >
              {{ classItem.classString }}
            </button>
            <!-- 開啟學生清單 -->
            <button
              v-if="pickedClass.classId === classItem.classId"
              class="z-1 self-stretch rounded-r-3xl shadow-default"
              m="-l-3"
              p="l-4 r-2"
              bg="[#39ffeb]"
              @click="onOpenStudentList(pickedClass.classId)"
            >
              {{ textData['goToSelectStudent'] }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 學生清單 -->
    <div v-else>
      <button class="shadow-default rounded-3xl" p="x-3 y-1" bg="[#39ffeb]" @click="isSchoolList = true">
        <i class="el-icon-back"></i>{{ textData['backToClassSelection'] }}
      </button>
      <span m="l-3" text="[#d69f05]">{{ pickedClass.classString + ' ' + textData['classList'] }}</span>
      <div m="t-3">
        <!-- 選擇學生 -->
        <button
          v-for="studentItem in studentList"
          :key="studentItem.uid"
          :class="{ 'bg-yellow': pickedStudent === studentItem.uid }"
          text="[#FFF]"
          class="rounded-3xl shadow-default"
          bg="black opacity-50"
          border="2px solid [#FFF]"
          p="x-3 y-1"
          m="x-2"
          @click="onSelectStudent(studentItem.uid)"
        >
          {{ studentItem.name }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { heroj7GetClassList, heroj7GetStudentList } from '@/api/TeacherAdmin';
import { Message } from '@/helper/class/Common';
import {
  GATagActionIdType,
  GATagActionStrType,
  GATagCategoryIdType,
  GATagCategoryStrType,
  ResponseState,
} from '@/helper/enum/Common';
import { handleAPIError, sendGAEvent } from '@/helper/fnc/common';
import { ClassItem, SchoolClass, StudentData } from '@/helper/interface/TeacherAdmin';
import { AssignStudentsInfo } from '@/store/module/StudyTask/StudyTaskModule';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
@Component({})
export default class SchoolList extends Vue {
  /** 是否為多選 */
  @Prop(Boolean) readonly isMultipleChoice!: boolean;
  /**班級資料 */
  @Prop(Number) readonly schoolId!: number;

  /** 學校資料 */
  private schoolClassList: SchoolClass[] = [];
  /** 學生列表 */
  private studentList: StudentData[] = [];
  /** 選到學年 */
  private pickedAcademicYear = 0;
  /** 選到年級 */
  private pickedGrade = 0;
  /** 選到班級 */
  private pickedClass: ClassItem = {} as ClassItem;
  /** 選到學生 */
  private pickedStudent = 0;
  /** 是否開啟年級列表 */
  private isSchoolList = true;
  /** 已選定學生 */
  private selectedStudents: StudentData[] = [];
  /** 已選定學生的班級 */
  private selectedClassId = 0;
  /** 文字資料 */
  private textData = {
    year: '年度',
    goToSelectStudent: '前往選擇學生',
    backToClassSelection: '返回班級選擇',
    classList: '全班列表',
  };

  @Emit('onSelectStudent')
  private emitOnSelectStudent(sentStudents: StudentData[]): void {
    return;
  }

  /** 發送學生
   * @param studentId 學生ID
   */
  private onSelectStudent(studentId: number): void {
    // 判斷學生是否是多選，用於教師派獎
    if (this.isMultipleChoice) {
      // 根據 studentId 獲取學生信息
      const findStudent = this.studentList.find((student) => student.uid === studentId);
      if (findStudent) {
        // 檢查學生信息是否已存在於列表中
        const studentExists = this.selectedStudents.some((sentStudent) => sentStudent.uid === findStudent.uid);
        // 派任務時一開始不會指定學生班級，當使用者選擇該班學生時，將該班級ID設定為選中學生的班級ID
        if (this.selectedClassId === 0) {
          // 檢查是否為相同班級的學生
          const isSameClassStudent = this.selectedStudents.some((selectedStudent: StudentData) =>
            this.studentList.some((student) => student.uid === selectedStudent.uid),
          );
          if (isSameClassStudent) {
            // 設定班級ID
            this.selectedClassId = this.pickedClass.classId;
          }
        }

        if (studentExists) {
          // 如果存在，彈出警告消息
          Message.info('學生已存在');
        } else if (this.selectedStudents.length > 0 && this.selectedClassId !== this.pickedClass.classId) {
          // 檢查所選班級是否相同
          Message.info('無法加入不同班級的學生');
        } else {
          // 如果不存在，則將學生UID添加到列表中
          this.selectedStudents.push(findStudent);

          // 如果是第一個選中的學生，保存班级ID
          if (this.selectedStudents.length === 1) {
            this.selectedClassId = this.pickedClass.classId;
          }

          // 觸發自定義事件，將更新後的學生列表傳遞給父組件
          this.emitOnSelectStudent(this.selectedStudents);

          // 在這裡執行發送學生ID的邏輯，將 studentId 發送出去
          this.onChangeSelectStudentId(studentId);
        }
      }
    } else {
      this.pickedStudent = studentId;
      this.onChangeSelectStudentId(studentId);
    }
  }

  /**取得班級資料
   * @param schoolId
   */
  private async getHeroj7GetClassList(schoolId: number): Promise<SchoolClass[]> {
    const data = {
      schoolId,
    };

    try {
      // API 取得年度班級
      const response: any = await heroj7GetClassList.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // GA 教師取得班級列表事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7SchoolClass,
        GATagActionIdType.Heroj7GetClassList,
        this.$$store.state.LoginModule.userInfo?.schoolId.toString() || '',
        this.$gtag,
        GATagActionStrType.Heroj7GetClassList,
        GATagCategoryStrType.Heroj7GetClassList,
      );
      return UIHelper.toSchoolClassList(response.classList);
    } catch (e) {
      Message.error(`${e}`);
      return [];
    }
  }

  /** 點擊年級
   *  @param grade
   */
  private onClickGrade(grade: number): void {
    // 點同樣年級控制開關
    this.pickedGrade = this.pickedGrade === grade ? 0 : grade;
  }

  /** 選擇班級
   * @param classItem
   */
  private onSelectClass(classItem: ClassItem): void {
    this.pickedClass = classItem;
    this.onChangeSelectClassId(classItem.classId);
  }

  /**點擊開啟學生資料
   * @param classId
   */
  private async onOpenStudentList(classId: number): Promise<void> {
    this.studentList = await this.getHeroj7GetStudentList(classId);
    this.isSchoolList = false;
  }

  /** 取學生資料 API
   * @param id
   */
  private async getHeroj7GetStudentList(id: number): Promise<StudentData[]> {
    // 組成封包
    const data = {
      classId: id,
    };

    try {
      // API 取得學生資料
      const response: any = await heroj7GetStudentList.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // GA 取得班級內學生列表事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7SchoolClass,
        GATagActionIdType.Heroj7GetStudentList,
        `${id}`,
        this.$gtag,
        GATagActionStrType.Heroj7GetStudentList,
        GATagCategoryStrType.Heroj7GetStudentList,
      );

      return response.studentList as StudentData[];
    } catch (e) {
      Message.error(`${e}`);
      return [];
    }
  }

  /** 更新學校資料 */
  @Watch('schoolId')
  private async onChangeSchoolId(schoolId: number) {
    // 選全部學校
    if (schoolId === -1) {
      this.schoolClassList.splice(0);
    }
    // 選各別學校
    else {
      // 設定年級班級
      this.schoolClassList = await this.getHeroj7GetClassList(schoolId);
      // 防呆
      if (this.schoolClassList.length === 0) {
        Message.error(`此學校查無班級 schoolId = ${schoolId}`);
      } else {
        this.pickedAcademicYear = this.schoolClassList[this.schoolClassList.length - 1].academicYearId;
        this.onChangeSelectAcademicYear(this.pickedAcademicYear);

        // 取得已選定學生資料
        this.handleAssignStudentsInfo();
      }
    }
  }

  /** 處理已選定學生資料 */
  private async handleAssignStudentsInfo(): Promise<void> {
    // 取得已選定學生資料
    const assignStudentsInfo: AssignStudentsInfo = await this.$store.dispatch('getAssignStudentsInfo');

    // 設定選中的學年
    if (assignStudentsInfo.year !== -1) {
      this.pickedAcademicYear = assignStudentsInfo.year;
      this.onChangeSelectAcademicYear(this.pickedAcademicYear);
    }

    // 設定選中的年級
    if (assignStudentsInfo.grade !== -1) {
      this.pickedGrade = assignStudentsInfo.grade;
    }

    // 設定選中的班級
    if (assignStudentsInfo.class !== -1) {
      // 查詢選中的班級
      const schoolClass = this.schoolClassList.find(
        (schoolClass) => schoolClass.academicYearId === assignStudentsInfo.year,
      );
      const gradeItem = schoolClass?.gradeChildren.find((gradeItem) => gradeItem.grade === assignStudentsInfo.grade);
      const classItem = gradeItem?.classChildren.find((classItem) => classItem.classId === assignStudentsInfo.class);
      if (classItem === undefined) {
        Helper.assert(
          ErrorId.VariableUndefined,
          `學年: ${assignStudentsInfo.year} 年級: ${assignStudentsInfo.grade} 查無班級: ${assignStudentsInfo.class}`,
        );
        return;
      }
      // 設定選中的班級
      this.pickedClass = classItem;
      this.selectedClassId = this.pickedClass.classId;
    }

    // 設定選中的學生
    this.selectedStudents = assignStudentsInfo.studentList.map((student) => {
      return {
        uid: student.cid,
        name: student.userName,
      };
    });
    // 觸發自定義事件，將更新後的學生列表傳遞給父組件
    this.emitOnSelectStudent(this.selectedStudents);
  }

  /**更換學年
   * @param academicYear
   */
  @Emit('onChangeSelectAcademicYear')
  private onChangeSelectAcademicYear(academicYear: number): void {
    return;
  }

  /** 更換班級 ID
   * @param classId
   */
  @Emit('onChangeSelectClassId')
  private onChangeSelectClassId(classId: number): void {
    return;
  }

  /** 更換 studentId
   * @param studentId
   */
  @Emit('onChangeSelectStudentId')
  private onChangeSelectStudentId(studentId: number): void {
    return;
  }
}
</script>
<style scoped>
.bg-yellow {
  background: #ebca28;
}
.bg-clip-content {
  background-clip: content-box;
}
.transform-180 {
  transform: rotate(-180deg);
}
</style>
