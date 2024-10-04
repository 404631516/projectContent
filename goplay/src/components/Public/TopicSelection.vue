<template>
  <div class="rounded-[10px]" border="1 solid [#67D3D4]" p="x-5.5">
    <!-- 題目 -->
    <div class="grid grid-cols-[10px,60px,5fr] <sm:(grid-cols-[10px,5fr])" p="y-6">
      <p text="3xl [#FF5656]">{{ questionBlockData.isRequire ? '*' : '' }}</p>
      <p text="left 3xl [#636363]">
        {{ `${questionIndex}.` }}
      </p>
      <p class="<sm:col-span-2" text="left 3xl [#636363]" p="<sm:l-2.5">
        {{ `${questionBlockData.questionMain}` }}
        {{ `(${optionTypeText})` }}
      </p>
    </div>
    <!-- 圖片 -->
    <img v-if="questionBlockData.questionSub !== ''" :src="questionBlockData.questionSub" m="y-4" p="l-17.5 <sm:x-2" />
    <!-- 選項 -->
    <el-checkbox-group
      v-model="checkList"
      class="flex flex-col items-start space-y-6"
      m="b-8"
      p="l-17.5 <sm:x-2"
      :max="questionBlockData.optionType === OptionType.MoreSelect ? topicSelect.length : limitCount"
    >
      <el-checkbox v-for="(option, index) in topicSelect" :key="index" :label="option" />
    </el-checkbox-group>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ITopic, QuestionBlockData } from '@/helper/interface/Questionnaire';
import { OptionType } from '@/helper/enum/Questionnaire';

@Component({})
export default class TopicSelection extends Vue implements ITopic {
  /** 問卷題目 */
  @Prop() private questionBlockData!: QuestionBlockData;
  /** 問卷題目順序 */
  @Prop(Number) private questionIndex!: number;
  /** 選擇題答案 */
  private checkList: string[] = [];

  /** 題目類型 */
  private OptionType = OptionType;

  /** 題目選項 */
  private get topicSelect(): string[] {
    return this.questionBlockData.optionArg.options;
  }

  /** 答題限制 */
  private get limitCount(): number {
    return this.questionBlockData.optionArg.limitCount;
  }

  /** 題目提示字 */
  private get optionTypeText(): string {
    switch (this.questionBlockData.optionType) {
      case OptionType.OneSelect:
        return `單選題`;
      case OptionType.LessSelect:
        return `最多${this.limitCount}個`;
      case OptionType.EqualSelect:
        return `必須${this.limitCount}個`;
      case OptionType.MoreSelect:
        return `至少${this.limitCount}個`;
      default:
        return '';
    }
  }

  /** 使用者答案 */
  public get currentAnswer(): string[] {
    return this.checkList;
  }

  /** 檢查答案 */
  public checkAnswer(): string {
    switch (this.questionBlockData.optionType) {
      case OptionType.OneSelect:
      case OptionType.LessSelect:
        // 必填且答案為空
        if (this.checkList.length > this.questionBlockData.optionArg.limitCount) {
          return `第${this.questionIndex}題,不能選超過${this.questionBlockData.optionArg.limitCount}個` + '<br/>';
        }
        break;
      case OptionType.EqualSelect:
        // 必填或是答案>0 檢查數量要對
        if (this.checkList.length !== this.questionBlockData.optionArg.limitCount) {
          return `第${this.questionIndex}題,必須選${this.questionBlockData.optionArg.limitCount}個` + '<br/>';
        }
        break;
      case OptionType.MoreSelect:
        // 必填或是答案>0 檢查數量要對
        if (this.checkList.length < this.questionBlockData.optionArg.limitCount) {
          return `第${this.questionIndex}題,至少選${this.questionBlockData.optionArg.limitCount}個` + '<br/>';
        }
        break;
      default:
        break;
    }
    return '';
  }
}
</script>
<style scoped>
::v-deep .el-textarea__inner {
  width: 90%;
}
.el-checkbox {
  display: inline-flex;
  align-items: center;
  margin: 4px;
}
::v-deep .el-checkbox__input.is-disabled + span.el-checkbox__label {
  color: #666666;
}
::v-deep .el-checkbox__input {
  background-color: transparent;
  border: 2px solid #666666;
  width: 20px;
  height: 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
}
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  border-color: #666666;
  background-color: #ebca28;
}
::v-deep .el-checkbox__inner {
  border: 0px;
  background-color: transparent;
}
::v-deep .el-checkbox__inner::after {
  border: 0px;
}
::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #666666;
}
::v-deep .el-checkbox__label {
  color: #666666;
  font-size: 20px;
  word-wrap: break-word;
  white-space: normal;
  text-align: left;
}
::v-deep .el-checkbox__input.is-disabled .el-checkbox__inner {
  background-color: transparent;
}
</style>
