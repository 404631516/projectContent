<template>
  <div v-if="questionnaireData != null" m="x-27 <xl:x-10 <sm:x-3">
    <!-- 標題 -->
    <QuestionnaireTitle :questionnaireData="questionnaireData" :isUseCollapse="true" m="t-6 b-9" />
    <!-- 題目組 -->
    <QuestionnaireTopic
      ref="questionnaireTopic"
      v-for="(question, index) in questionBlockData"
      :key="index"
      :questionBlockData="question"
      :questionIndex="index + 1"
      m="b-4"
    />
    <!-- 確認送出並轉蛋 -->
    <button class="rounded-[30px] yellowGradient shadow-default" m="t-10" p="x-11 y-3" @click="onConfirmAnswer">
      <p class="inline-block" text="xl [#FFFFFF]">{{ textData.goToGatcha }}</p>
      <img :src="imgData.gashaponHalf" class="w-12.5 aspect-square object-contain inline-block" m="-t-9" />
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { QuestionAnswer, QuestionBlockData, QuestionnaireData } from '@/helper/interface/Questionnaire';
import QuestionnaireTopic from './QuestionnaireTopic.vue';
import QuestionnaireTitle from './QuestionnaireTitle.vue';

@Component({
  components: { QuestionnaireTitle, QuestionnaireTopic },
})
export default class QuestionnaireAnswerComponent extends Vue {
  /** 問卷資料 */
  @Prop() private questionnaireData!: QuestionnaireData;
  /** 問卷題目 */
  @Prop() private questionBlockData!: QuestionBlockData[];

  /** 贏得的獎勵 */
  private winningRank: number = 0;
  /** 是否顯示轉蛋動畫 */
  private isShowGatchaAnimation: boolean = false;

  /** 文字資料 */
  private textData = {
    goToGatcha: '提交問卷，並開始轉蛋',
  };

  /** 圖片資料 */
  private imgData = {
    gashaponHalf: imgPath.gashaponHalf,
    whiteBlueBackground: imgPath.whiteBlueGradientBackground,
  };

  public $refs!: {
    questionnaireTopic: QuestionnaireTopic[];
  };

  /** 檢查答案 */
  private async onConfirmAnswer(): Promise<void> {
    let errorMessage: string = '';
    const userAnswerList: QuestionAnswer[] = [];
    for (const questionnaireTopic of this.$refs.questionnaireTopic) {
      // 檢查作答是否有效
      errorMessage += questionnaireTopic.checkTopicAnswer();
      // 取得問卷問題答案
      userAnswerList.push(questionnaireTopic.userAnswer);
    }

    // 問卷中有錯誤作答
    if (errorMessage.length > 0) {
      this.$message.error({
        dangerouslyUseHTMLString: true,
        message: errorMessage,
      });
    }
    // 全作答沒問題, 送出問卷答案
    else {
      this.onSendAnswer(userAnswerList);
    }
  }

  /** API送出答案
   *  @param userAnswerList 答案組
   */
  @Emit('onSendAnswer')
  private onSendAnswer(userAnswerList: QuestionAnswer[]): void {
    return;
  }
}
</script>
<style scoped>
.text-shadow {
  text-shadow: 0px 3px 6px #1c1c1c80;
}
</style>
