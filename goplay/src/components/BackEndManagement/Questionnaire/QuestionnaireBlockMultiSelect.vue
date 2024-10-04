<template>
  <div class="flex flex-col items-start" m="t-20px l-55px">
    <template>
      <div m="t-10px">
        <span text="[#FF4E4E]">*</span>
        {{ optionLimit }}
        <input
          v-if="!isEdit"
          v-model.number="optionArg.limitCount"
          type="number"
          class="w-120px"
          p="8px"
          border="rounded-5px 1px solid [#B7B7B7]"
          text="center"
        />
        <p class="inline" v-else>{{ `${optionArg.limitCount}` }}</p>
        {{ textData.optionNumber }}
      </div>
      <QuestionnaireOptionEdit v-model="optionArg" :isEdit="isEdit" />
    </template>
  </div>
</template>
<script lang="ts">
import { OptionType } from '@/helper/enum/Questionnaire';
import { IQuestionBlock, OptionArg } from '@/helper/interface/Questionnaire';
import { Component, Vue, VModel, Prop } from 'vue-property-decorator';
import QuestionnaireOptionEdit from './QuestionnaireOptionEdit.vue';

@Component({
  components: { QuestionnaireOptionEdit },
})
export default class QuestionnaireMultiSelect extends Vue implements IQuestionBlock {
  /** 選項資料 */
  @VModel() private optionArg!: OptionArg;
  /** 選項種類 */
  @Prop() private optionType!: OptionType;
  /** 是否已發布 */
  @Prop(Boolean) private isEdit!: boolean;

  /** 文字資料 */
  private textData = {
    canPick: '可選',
    forcePick: '必選',
    optionNumber: '個選項',
  };

  /** 選項限制文字 */
  private get optionLimit(): string {
    switch (this.optionType) {
      case OptionType.LessSelect:
        return '最多';
      case OptionType.EqualSelect:
        return '必須';
      case OptionType.MoreSelect:
        return '至少';
      default:
        return '錯誤題型';
    }
  }

  /** 多選驗證 */
  public checkBlock(): string[] {
    const errorMessage: string[] = [];
    const optionList = this.optionArg.options;
    // 限制數不可為空
    if (this.optionArg.limitCount.toString() === '') {
      errorMessage.push('限制數不可為空!');
    }
    // 限制數不可小於2
    else if (this.optionArg.limitCount < 2) {
      errorMessage.push('限制數不可小於2!');
    }
    // 選項數不可小於限制數
    if (optionList.length < this.optionArg.limitCount) {
      errorMessage.push('選項數不可小於限制數!');
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
