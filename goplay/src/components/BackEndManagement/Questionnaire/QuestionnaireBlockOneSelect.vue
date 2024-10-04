<template>
  <div class="flex flex-col items-start" m="t-20px l-55px">
    <template>
      <QuestionnaireOptionEdit v-model="optionArg" :isEdit="isEdit" />
    </template>
  </div>
</template>
<script lang="ts">
import { IQuestionBlock, OptionArg } from '@/helper/interface/Questionnaire';
import { Component, Vue, VModel, Prop } from 'vue-property-decorator';
import QuestionnaireOptionEdit from './QuestionnaireOptionEdit.vue';

@Component({
  components: { QuestionnaireOptionEdit },
})
export default class QuestionnaireBlockOneSelect extends Vue implements IQuestionBlock {
  /** 選項資料 */
  @VModel() private optionArg!: OptionArg;
  /** 是否已發布 */
  @Prop(Boolean) private isEdit!: boolean;

  /** 單選驗證 */
  public checkBlock(): string[] {
    const errorMessage: string[] = [];
    const optionList = this.optionArg.options;
    // 選項數不可小於限制數
    if (optionList.length < this.optionArg.limitCount) {
      errorMessage.push('選項數不可小於1!');
    }

    for (const option of optionList) {
      // 選項內容不可為空白
      if (option.length === 0) {
        errorMessage.push('選項內容不可為空!');
      }
      // 選項內容不可重複
      if (optionList.filter((currentOption: string) => currentOption === option).length > 1) {
        errorMessage.push('選項內容不可重複!');
        break;
      }
    }
    return errorMessage;
  }
}
</script>
