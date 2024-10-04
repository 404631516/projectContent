<template>
  <div class="shadow-default" p="y-5" bg="[#f9f8f4]" text="left [#666666]">
    <div class="max-w-7xl w-[95%]" m="x-auto">
      <p text="[#d69f05] 2rem" font="bold">
        {{ textData['zi-ding-cha-xun'] }}
      </p>
      <p>
        {{
          textData[
            'qing-xuan-ze-cha-xun-de-fan-wei-shi-jian-qu-jian-yi-ji-cha-xun-de-shu-ju-xiang-mu-lai-jin-hang-cha-xun'
          ]
        }}
      </p>
      <!-- 選擇時間 -->
      <DatePicker v-model="dateObj" m="y-3" p="t-3" border="t-1px solid #b2b2b2" />
      <!-- 行政區選擇 -->
      <AreaSelect
        v-if="canPickSchool"
        :fixCounty="searchBarSetting.fixCounty"
        @onChangeSelectCountyId="onChangeSelectCountyId"
        @onChangeSelectSchoolId="onChangeSelectSchoolId"
      />
      <!-- 學校班級選擇 -->
      <SchoolList
        m="t-3"
        p="t-3"
        border="t-1px solid #b2b2b2"
        :schoolId="selectSchoolId"
        :isMultipleChoice="false"
        @onChangeSelectAcademicYear="onChangeSelectAcademicYear"
        @onChangeSelectClassId="onChangeSelectClassId"
        @onChangeSelectStudentId="onChangeSelectStudentId"
      />
      <div m="t-3" p="t-3" border="t-1px solid #b2b2b2">
        <div m="b-3" text="[#D69F05]" font="bold">
          {{ textData['yu-cha-xun-shu-ju-xiang-mu-zui-duo-xuan-ze-liang-xiang'] }}
        </div>
        <!-- 搜尋選項 -->
        <label v-for="searchType in searchOptionList" :key="searchType.name" m="r-2" text="1.25rem">
          <input
            class="appearance-none w-5 h-5 rounded-md bg-clip-content cursor-pointer align-text-top"
            border="2px solid [#666666]"
            p="1px"
            :class="{
              'bg-yellow': pickedSearchType.includes(searchType.name),
            }"
            type="checkbox"
            m="r-2"
            :value="searchType.name"
            v-model="pickedSearchType"
          />
          {{ searchType.name }}
        </label>
        <!-- 查詢按鈕 -->
        <button
          m="t-3"
          class="block yellowGradient rounded-3xl shadow-default"
          :class="{ 'cursor-not-allowed': isDisableSearch }"
          p="x-6 y-2"
          text="[#FFF] 1.5rem"
          :disabled="isDisableSearch"
          @click="onCreateSearchData"
        >
          {{ textData['kai-shi-cha-xun'] }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator';
import BaseSelect from '@/components/Public/BaseSelect.vue';
import { ChartTarget, ComType } from '@/helper/enum/TeacherAdmin';
import { CountyType } from '@/helper/enum/Common';
import DatePicker from '@/components/TeacherAdmin/DatePicker.vue';
import SchoolList from '@/components/TeacherAdmin/SchoolList.vue';
import AreaSelect from '@/components/BackEndManagement/StatisticReport/AreaSelect.vue';
import dayjs from 'dayjs';
import { DateData, SearchBarSetting, SearchData, TeacherAdminApiData } from '@/helper/interface/TeacherAdmin';
import { Message } from '@/helper/class/Common';
import { SearchOptionData } from './SearchOptionData';

@Component({
  components: {
    BaseSelect,
    AreaSelect,
    SchoolList,
    DatePicker,
  },
})
export default class StatisticSearchBar extends Vue {
  /** 設定搜尋 Bar */
  @Prop(Object) readonly searchBarSetting!: SearchBarSetting;
  /** 是否禁止查詢 */
  @Prop(Boolean) readonly isDisableSearch!: boolean;

  /** 文字資料 */
  private textData = {
    'zi-ding-cha-xun': '自訂查詢',
    'qing-xuan-ze-cha-xun-de-fan-wei-shi-jian-qu-jian-yi-ji-cha-xun-de-shu-ju-xiang-mu-lai-jin-hang-cha-xun':
      '請選擇查詢的範圍、時間區間、以及查詢的數據項目來進行查詢。',
    'yu-cha-xun-shu-ju-xiang-mu-zui-duo-xuan-ze-liang-xiang': '欲查詢數據項目(最多選擇兩項)',
    'kai-shi-cha-xun': '開始查詢',
  };

  /** 選中要查詢項目 */
  private pickedSearchType: ChartTarget[] = [];
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
  /** 查詢時間 */
  private dateObj: DateData = {
    startDay: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDay: dayjs().format('YYYY-MM-DD'),
  };

  /** 可搜尋選項 */
  private get searchOptionList(): SearchOptionData[] {
    return this.searchBarSetting.searchOption.filter((searchData) => {
      return searchData.comType.includes(ComType.None) || searchData.comType.includes(this.comType);
    });
  }
  /** 能否搜尋 行政區 */
  private get canPickCounty(): boolean {
    return this.canPickSchool && this.searchBarSetting.fixCounty === CountyType.None;
  }
  /** 能否搜尋 學校 */
  private get canPickSchool(): boolean {
    return this.searchBarSetting.fixSchool === -1;
  }

  mounted() {
    this.selectSchoolId = this.searchBarSetting.fixSchool;
    this.selectCountyId = this.searchBarSetting.fixCounty;
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

  /** 創造要查詢所需資料 */
  private onCreateSearchData(): void {
    if (this.pickedSearchType.length === 0) {
      Message.warn('請先選擇欲查詢項目');
      return;
    }

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
        console.error(`comType 錯誤 comType =${this.comType}`);
    }

    const searchData: SearchData = {
      apiData,
      searchOption: this.pickedSearchType,
    };
    this.onSearch(searchData);
  }

  /** 查詢級別更變時 */
  @Watch('comType')
  private onChangeComType(comType: ComType): void {
    // 刪除被過濾掉但選到的 option
    this.pickedSearchType = this.pickedSearchType.filter((searchData) => {
      return this.searchOptionList.findIndex((searchOptionData) => searchOptionData.name === searchData) > -1;
    });
  }

  /** 只能搜尋兩項 */
  @Watch('pickedSearchType')
  private onChangePickedSearchType(newSearchType: ChartTarget[]): void {
    if (newSearchType.length > 2) {
      newSearchType.shift();
    }
  }

  /** 傳出搜尋選項&API資料 */
  @Emit('onSearch')
  private onSearch(searchData: SearchData): void {
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
