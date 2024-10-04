<template>
  <div class="shadow-default" p="y-5" bg="[#f9f8f4]" text="left [#666666]">
    <div class="max-w-7xl w-[95%]" m="x-auto">
      <p text="[#d69f05] 2rem" font="bold">
        {{ textData.teacherAwards }}
      </p>
      <p>
        {{ textData.selectStudentForAward }}
      </p>
      <!-- 選擇時間 -->
      <DatePicker v-model="dateObj" m="y-3" p="t-3" border="t-1px solid #b2b2b2" />
      <!-- 查詢按鈕 -->
      <button
        m="t-3"
        class="block yellowGradient rounded-3xl shadow-default"
        p="x-6 y-2"
        text="[#FFF] 1.5rem"
        @click="onCreateSearchData"
      >
        {{ textData.datePick }}
      </button>
      <!-- 學校班級選擇 -->
      <SchoolList
        m="t-3"
        p="t-3"
        border="t-1px solid #b2b2b2"
        :schoolId="selectSchoolId"
        :isMultipleChoice="true"
        @onChangeSelectAcademicYear="onChangeSelectAcademicYear"
        @onChangeSelectClassId="onChangeSelectClassId"
        @onChangeSelectStudentId="onChangeSelectStudentId"
        @onSelectStudent="onSelectStudent"
      />
      <div m="t-3" p="t-3" border="t-1px solid #b2b2b2"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import BaseSelect from '@/components/Public/BaseSelect.vue';
import { ComType } from '@/helper/enum/TeacherAdmin';
import { CountyType } from '@/helper/enum/Common';
import {
  DateData,
  SearchBarSetting,
  SearchData,
  StudentData,
  TeacherAdminApiData,
} from '@/helper/interface/TeacherAdmin';

import SchoolList from '../TeacherAdmin/SchoolList.vue';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import dayjs from 'dayjs';
import DatePicker from './DatePicker.vue';

@Component({
  components: {
    BaseSelect,
    SchoolList,
    DatePicker,
  },
})
/** 學生姓名選擇 Bar */
export default class StudentNameSelectBar extends Vue {
  /** 設定搜尋 Bar */
  @Prop(Object) readonly searchBarSetting!: SearchBarSetting;
  /** 是否禁止查詢 */
  @Prop(Boolean) readonly isDisableSearch!: boolean;

  /** 文字資料 */
  private textData = {
    teacherAwards: '教師派獎',
    selectStudentForAward: '請選擇要派獎的學生。',
    datePick: '選擇時間',
  };

  /** 查詢級別 */
  private comType: ComType = ComType.None;
  /** 選中的行政區 id */
  private selectCountyId = CountyType.None;
  /** 選中的學校 id */
  private selectSchoolId: number = -1;
  /** 選中的學年 id */
  private selectAcademicYear = -1;
  /** 選中的班級 id */
  private selectClassId = -1;
  /** 選中的學生 id */
  private selectStudentId = -1;
  // 被選擇的學生列表
  private selectedStudents: StudentData[] = [];
  /** 查詢時間 */
  private dateObj: DateData = {
    startDay: dayjs().format('YYYY-MM-DD'), // 確保是 UTC 格式的初始值
    endDay: dayjs().add(29, 'day').format('YYYY-MM-DD'), // 確保是 UTC 格式的結束值
  };

  mounted() {
    /** 設定固定學校與行政區 */
    this.selectSchoolId = this.searchBarSetting.fixSchool;
    this.selectCountyId = this.searchBarSetting.fixCounty;
    this.onCreateSearchData();
  }

  /** 更換行政區 ID  */
  private onChangeSelectCountyId(countyId: CountyType): void {
    this.selectCountyId = countyId;
    this.comType = this.selectCountyId === CountyType.None ? ComType.Country : ComType.City;
  }

  /** 更換學校 ID */
  private onChangeSelectSchoolId(schoolId: number): void {
    this.selectSchoolId = schoolId;
    this.comType = this.selectSchoolId === -1 ? ComType.City : ComType.School;
  }

  /** 更換學年 */
  private onChangeSelectAcademicYear(academicYear: number): void {
    this.comType = ComType.School;
    this.selectAcademicYear = academicYear;
  }

  /** 更換班級 ID */
  private onChangeSelectClassId(classId: number): void {
    this.comType = ComType.Class;
    this.selectClassId = classId;
  }

  /** 更換學生 ID */
  private onChangeSelectStudentId(studentId: number): void {
    this.comType = ComType.Student;
    this.selectStudentId = studentId;
  }

  /** 拿到子元件教師選擇的學生
   * @param selectedStudents 學生資料
   */
  private onSelectStudent(selectedStudents: StudentData[]) {
    this.selectedStudents = selectedStudents;
    this.emitOnSelectStudent(this.selectedStudents);
  }

  /** 創造要查詢所需資料 */
  private onCreateSearchData(): void {
    const apiData: TeacherAdminApiData = {
      comType: this.comType === ComType.None ? ComType.Country : this.comType,
      comValue1: null,
      comValue2: null,
      ...this.dateObj,
    };

    switch (apiData.comType) {
      case ComType.Student:
        apiData.comValue1 = this.selectStudentId;
        break;
      case ComType.Class:
        apiData.comValue1 = this.selectClassId;
        break;
      case ComType.School:
        apiData.comValue1 = this.selectSchoolId;
        apiData.comValue2 = this.selectAcademicYear;
        break;
      case ComType.City:
        apiData.comValue1 = this.selectCountyId;
        break;
      case ComType.Country:
        break;
      default:
        Helper.assert(ErrorId.VariableUndefined, `comType 錯誤 comType =${this.comType}`);
    }

    const searchData: SearchData = {
      apiData,
      searchOption: [],
    };
    this.onSearch(searchData);
  }

  /** 傳出搜尋選項&API資料 */
  @Emit('onSearch')
  private onSearch(searchData: SearchData): void {
    return;
  }

  /** 取得教師選取的學生資料 */
  @Emit('onSelectStudent')
  private emitOnSelectStudent(searchData: StudentData[]): void {
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
</style>
