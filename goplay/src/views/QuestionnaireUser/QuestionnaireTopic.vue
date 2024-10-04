<template>
  <div>
    <!-- 簡答題 -->
    <template v-if="questionBlockData.optionType === OptionType.Text">
      <TopicShortAnswer ref="shortAnswer" :questionBlockData="questionBlockData" :questionIndex="questionIndex" />
    </template>
    <!-- 選擇題 -->
    <template v-else>
      <TopicSelection ref="selection" :questionBlockData="questionBlockData" :questionIndex="questionIndex" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ITopic, QuestionAnswer, QuestionBlockData } from '@/helper/interface/Questionnaire';
import { OptionType } from '@/helper/enum/Questionnaire';
import TopicShortAnswer from '@/components/Public/TopicShortAnswer.vue';
import TopicSelection from '@/components/Public/TopicSelection.vue';
import { DBBoolean } from '@/helper/enum/Common';

@Component({
  components: { TopicShortAnswer, TopicSelection },
})
export default class QuestionnaireTopic extends Vue {
  /** 問卷題目 */
  @Prop() private questionBlockData!: QuestionBlockData;
  /** 問卷題目順序 */
  @Prop(Number) private questionIndex!: number;
  /** 使用者答案 */
  private currentAnswer: string[] = [];

  /** 題目類型 */
  private OptionType = OptionType;

  public $refs!: {
    shortAnswer: TopicShortAnswer;
    selection: TopicSelection;
  };

  /** 取得對應的ref */
  private get currentTopic(): ITopic {
    switch (this.questionBlockData.optionType) {
      case OptionType.Text:
        return this.$refs.shortAnswer;
      case OptionType.OneSelect:
      case OptionType.LessSelect:
      case OptionType.EqualSelect:
      case OptionType.MoreSelect:
        return this.$refs.selection;
    }
  }

  /** 轉換型式 */
  public get userAnswer(): QuestionAnswer {
    return {
      formsQuestionId: this.questionBlockData.formsQuestionId,
      answer: this.currentTopic.currentAnswer,
    };
  }

  /** 檢查答案 */
  public checkTopicAnswer(): string {
    // 檢查未作答
    if (this.currentTopic.currentAnswer.length === 0 && this.questionBlockData.isRequire) {
      return `第${this.questionIndex}題未作答` + '<br/>';
    }

    // 非必填未作答不檢查
    if (this.currentTopic.currentAnswer.length === 0 && this.questionBlockData.isRequire === DBBoolean.False) {
      return '';
    }

    return this.currentTopic.checkAnswer();
  }
}
</script>
<style scoped>
::v-deep .el-textarea__inner {
  width: 90%;
}
</style>
