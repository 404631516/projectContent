<template>
  <div class="flex flex-col items-start" m="t-20px l-55px">
    <template>
      <!-- 字數限制-->
      <div m="t-10px">
        <span text="[#FF4E4E]">*</span>
        {{ textData.textLimit }}
        <input
          v-if="!isEdit"
          v-model.number="optionArg.limitCount"
          type="number"
          :disabled="isEdit"
          class="w-120px"
          p="8px"
          border="rounded-5px 1px solid [#B7B7B7]"
          text="center"
        />
        <p class="inline" v-else>{{ `${optionArg.limitCount}` }}</p>
        {{ textData.textCount }}
      </div>
      <div h="100px"></div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, VModel, Prop } from 'vue-property-decorator';
import { IQuestionBlock, OptionArg } from '@/helper/interface/Questionnaire';

@Component({})
export default class QuestionnaireBlockText extends Vue implements IQuestionBlock {
  /** 選項資料 */
  @VModel() private optionArg!: OptionArg;
  /** 是否已發布 */
  @Prop(Boolean) private isEdit!: boolean;

  /** 文字資料 */
  private textData = {
    textLimit: '字數限制',
    textCount: '個字(0表示不限制)',
  };

  /** 簡答題驗證 */
  public checkBlock(): string[] {
    const errorMessage: string[] = [];
    // 字數限制不可為空
    if (this.optionArg.limitCount.toString() === '') {
      errorMessage.push('字數限制不可為空!');
    }
    // 字數限制不可小於0
    else if (this.optionArg.limitCount < 0) {
      errorMessage.push('字數限制不可小於0!');
    }

    return errorMessage;
  }
}
</script>
