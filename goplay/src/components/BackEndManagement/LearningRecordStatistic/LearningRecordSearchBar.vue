<template>
  <div class="shadow-default" p="y-5" bg="[#f9f8f4]" text="left [#666666]">
    <div class="max-w-7xl w-[95%]" m="x-auto">
      <p text="[#d69f05] 2rem" font="bold">
        {{ textData.customSearch }}
      </p>
      <p>
        {{ textData.pickStudent }}
      </p>
      <!-- 學校班級選擇 -->
      <div v-if="isSchoolList">
        <SchoolClassList @onSelectClass="pickedClass = $event">
          <template v-slot:pickStudentButton="pickStudentButton">
            <div v-if="pickStudentButton.pickedClass.classId === pickStudentButton.value.classId">
              <button
                class="z-1 self-stretch rounded-r-3xl shadow-default"
                m="-l-3"
                p="l-4 r-2"
                bg="[#39ffeb]"
                @click="onOpenStudentList(pickStudentButton.pickedClass.classId)"
              >
                {{ textData.goPickStudent }}
              </button>
            </div>
          </template>
        </SchoolClassList>
      </div>
      <!-- 學生選單 -->
      <div v-else>
        <button class="shadow-default rounded-3xl" p="x-3 y-1" bg="[#39ffeb]" @click="isSchoolList = true">
          <i class="el-icon-back"></i>{{ textData.backToClassList }}
        </button>
        <span m="l-3" text="[#d69f05]">{{ pickedClass.classString + ' ' + textData.wholeClass }}</span>
        <div m="t-3">
          <!-- 選擇學生 -->
          <button
            v-for="studentItem in studentList"
            :key="studentItem.uid"
            :class="pickedStudent === studentItem.uid ? 'bg-[#ebca28]' : 'bg-black bg-opacity-50'"
            text="[#FFF]"
            class="rounded-3xl shadow-default"
            border="2px solid [#FFF]"
            p="x-3 y-1"
            m="x-2"
            @click="onSelectStudent(studentItem.uid)"
          >
            {{ studentItem.name }}
          </button>
        </div>
      </div>
      <!-- 查詢項目 -->
      <div m="t-3" p="t-3" border="t-1px solid #b2b2b2">
        <div m="b-3" text="[#D69F05]" font="bold">
          {{ textData.pickOption }}
        </div>
        <!-- 搜尋選項 -->
        <label v-for="searchType in searchOptionList" :key="searchType.name" m="r-2" text="1.25rem">
          <input
            class="appearance-none w-5 h-5 rounded-md bg-clip-content cursor-pointer align-text-top"
            border="2px solid [#666666]"
            p="1px"
            :class="{
              'bg-[#ebca28]': pickedSearchType === searchType,
            }"
            type="radio"
            name="search"
            m="r-2"
            :value="searchType"
            @change="onSelectSearchType(searchType)"
          />
          {{ UIHelper.toChineseContestGameRecordType(searchType) }}
        </label>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { heroj7GetStudentList } from '@/api/TeacherAdmin';
import { Message } from '@/helper/class/Common';
import { ResponseState, TeamType } from '@/helper/enum/Common';
import { ContestGameRecordType } from '@/helper/enum/TeacherAdmin';
import { handleAPIError } from '@/helper/fnc/common';
import { ClassItem, StudentData } from '@/helper/interface/TeacherAdmin';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { Component, Emit, Vue } from 'vue-property-decorator';
import SchoolClassList from './SchoolClassList.vue';

@Component({ components: { SchoolClassList } })
export default class LearningRecordSearchBar extends Vue {
  /** 年級班級選項開關 */
  private isSchoolList: boolean = true;
  /** 已選擇班級 */
  private pickedClass: ClassItem = {} as ClassItem;
  /** 學生列表 */
  private studentList: StudentData[] = [];
  /** 已選擇學生 */
  private pickedStudent: number = -1;
  /** 已選擇查詢項目 */
  private pickedSearchType: ContestGameRecordType = -1;

  private UIHelper = UIHelper;

  /** 查詢種類列表 */
  private searchOptionList: ContestGameRecordType[] = [
    ContestGameRecordType.AnswerRecord,
    ContestGameRecordType.ContestRecord,
  ];

  /** 文字資料 */
  private textData = {
    customSearch: '自訂查詢',
    pickStudent: '請選擇欲查詢的年級、班級對應的學生',
    goPickStudent: '前往選擇學生',
    backToClassList: '返回班級列表',
    wholeClass: '全班列表',
    pickOption: '欲查詢歷程項目(擇一)',
  };

  /**點擊開啟學生資料
   * @param classId
   */
  private async onOpenStudentList(classId: number): Promise<void> {
    this.studentList = await this.getHeroj7GetStudentList(classId);
    this.isSchoolList = false;
  }

  /** 取學生資料 API
   * @param classId
   */
  private async getHeroj7GetStudentList(classId: number): Promise<StudentData[]> {
    // 組成封包
    const data = {
      classId,
    };

    try {
      // API 取得學生資料
      const response: any = await heroj7GetStudentList.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      return response.studentList as StudentData[];
    } catch (e) {
      Message.error(`${e}`);
      return [];
    }
  }

  /** 選擇學生
   * @param studentId
   */
  private onSelectStudent(studentId: number): void {
    this.pickedStudent = studentId;
    this.onChangeStudentUID(studentId);
  }

  /** 選擇查詢項目
   * @param searchType
   */
  private onSelectSearchType(searchType: ContestGameRecordType): void {
    this.pickedSearchType = searchType;
    this.onChangeSearchType(searchType);
  }

  /** 更換 studentUID
   * @param studentUID
   */
  @Emit('onChangeStudentUID')
  private onChangeStudentUID(studentUID: number): void {
    return;
  }

  /** 更換查詢項目
   * @param searchType
   */
  @Emit('onChangeSearchType')
  private onChangeSearchType(searchType: ContestGameRecordType): void {
    return;
  }
}
</script>
