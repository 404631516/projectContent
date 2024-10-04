<template>
  <div>
    <!-- 手機版顯示選中類型 -->
    <div class="hidden <sm:block" m="b-3">
      <span text="2xl [#666666]">{{ textData.subject }}</span>
      <p font="bold" text="3xl">{{ getSubjectName(activeSubject) }}</p>
    </div>
    <!-- 選項清單 -->
    <div class="flex justify-start flex-wrap <sm:justify-center">
      <span class="<sm:hidden" text="2xl [#666666]" m="l-1 r-2 <lg:l-4">{{ textData.subject }}</span>
      <label
        class="flex items-center"
        text="2xl [#666666]"
        m="r-2"
        v-for="(subject, subjectIndex) in subjectLists"
        :key="subjectIndex"
      >
        <input
          :class="{ 'bg-[#ebca28]': subject === activeSubject }"
          class="appearance-none rounded w-5 h-5"
          m="r-2"
          border="1 solid [#A5A5A5]"
          type="radio"
          name="subject"
          :value="subject"
          @change="selectSubject(subject)"
        />
        {{ getSubjectName(subject) }}
      </label>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { SubjectType } from '@/helper/enum/Common';
import { toSubjectName } from '@/helper/fnc/common';

@Component({})
export default class SwitchSubjectTab extends Vue {
  /** 當前科目 */
  @Prop() public activeSubject!: SubjectType;

  /** 文字內容 */
  private textData = {
    subject: '科目',
  };

  /** 取得科目清單 */
  private get subjectLists(): Array<string | SubjectType> {
    const subjectTypeList = Object.values(SubjectType);
    return subjectTypeList.slice(subjectTypeList.length / 2);
  }

  /** 取得科目中文
   *  @param subjectType
   */
  private getSubjectName(subjectType: SubjectType): string {
    return toSubjectName(subjectType);
  }

  /** 回傳選中科目
   *  @param subjectIndex
   */
  @Emit('selectSubject')
  private selectSubject(subject: SubjectType): void {
    return;
  }
}
</script>
