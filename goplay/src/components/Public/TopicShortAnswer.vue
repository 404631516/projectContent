<template>
  <div class="rounded-[10px]" border="1 solid [#67D3D4]" p="x-5.5">
    <!-- 題目 -->
    <div class="grid grid-cols-[10px,60px,5fr] <sm:(grid-cols-[10px,5fr])" p="t-6">
      <p text="3xl [#FF5656]">{{ questionBlockData.isRequire ? '*' : '' }}</p>
      <p text="left 3xl [#636363]">
        {{ `${questionIndex}.` }}
      </p>
      <p class="<sm:col-span-2" text="left 3xl [#636363]" p="<sm:l-2.5">
        {{ `${questionBlockData.questionMain}` }}
        {{ `(${textData.shortAnswer})` }}
      </p>
    </div>
    <!-- 圖片 -->
    <img v-if="questionBlockData.questionSub !== ''" :src="questionBlockData.questionSub" m="y-4" p="l-17.5 <sm:x-2" />
    <!-- 輸入框 -->
    <el-input m="x-17.5 t-5 b-8 <sm:x-2" type="textarea" :rows="4" :maxlength="limitCount" v-model="answer" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ITopic, QuestionBlockData } from '@/helper/interface/Questionnaire';

@Component({
  components: {},
})
export default class TopicShortAnswer extends Vue implements ITopic {
  /** 問卷題目 */
  @Prop() private questionBlockData!: QuestionBlockData;
  /** 問卷題目順序 */
  @Prop(Number) private questionIndex!: number;
  /** 簡答題答案 */
  private answer: string = '';

  /** 文字資料 */
  private textData = {
    shortAnswer: '簡答題',
  };

  /** 答題限制 */
  private get limitCount(): number {
    return this.questionBlockData.optionArg.limitCount === 0 ? -1 : this.questionBlockData.optionArg.limitCount;
  }

  /** 使用者答案 */
  public get currentAnswer(): string[] {
    return [this.answer];
  }

  /** 檢查答案 */
  public checkAnswer(): string {
    // 未作答且必填
    if (this.answer === '' && this.questionBlockData.isRequire) {
      return `第${this.questionIndex}題未作答` + '<br/>';
    }
    return '';
  }
}
</script>
<style scoped>
::v-deep .el-textarea__inner {
  width: 90%;
  font-size: 20px;
}
</style>
