<template>
  <div v-if="schoolClassList.length">
    <p text="[#D69F05] left">{{ textData.grade }}</p>
    <!-- 年級選項 -->
    <div m="x-35px b-5">
      <template v-for="gradeListItem in schoolClassList[0].gradeChildren">
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
              @click="onSelectClass(classItem)"
              text="[#FFF]"
              class="rounded-3xl shadow-default z-2"
              border="2px solid [#FFF]"
              bg="black opacity-50"
              p="x-3 y-1"
            >
              {{ classItem.classString }}
            </button>
            <slot name="pickStudentButton" :pickedClass="pickedClass" :value="classItem"> </slot>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { heroj7GetClassList } from '@/api/TeacherAdmin';
import { Message } from '@/helper/class/Common';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { ClassItem, SchoolClass } from '@/helper/interface/TeacherAdmin';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { Component, Emit, Vue } from 'vue-property-decorator';
@Component({})
export default class SchoolClassList extends Vue {
  /** 學校資料 */
  private schoolClassList: SchoolClass[] = [];
  /**選到年級 */
  private pickedGrade: number = 0;
  /** 選到班級 */
  private pickedClass: ClassItem = {} as ClassItem;

  /** 文字資料 */
  private textData = {
    grade: '年級',
  };

  async created() {
    const schoolId = this.$$store.getters.userSchoolId;
    if (schoolId === undefined) {
      Message.error('無學校資料!');
    }
    // 設定年級班級
    this.schoolClassList = (await this.getHeroj7GetClassList(schoolId)).slice(-1);
    // 防呆
    if (this.schoolClassList.length === 0) {
      Message.error(`此學校查無班級`);
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

  /** 選中班級
   *  @param classItem
   */
  @Emit('onSelectClass')
  private onSelectClass(classItem: ClassItem): void {
    this.pickedClass = classItem;
    return;
  }
}
</script>
<style scoped>
.transform-180 {
  transform: rotate(-180deg);
}
</style>
