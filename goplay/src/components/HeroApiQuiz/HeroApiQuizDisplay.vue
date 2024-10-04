<template>
  <div>
    <!--答題計時顯示-->
    <QuizTimer
      v-if="answerResult.totalQuestions > 0"
      :answerScore="answerResult.totalScore"
      :questOrder="Math.min(answerResult.orderId + 1, answerResult.totalQuestions)"
      :questTotalCount="answerResult.totalQuestions"
      :countdownTime="currentQuestion.seconds"
      :isShowTime="isShowTimer"
      @onTimeUp="onTimeUp()"
    />
    <!--答題題目顯示-->
    <div class="game-answer" style="padding-top: 0px">
      <!-- 題型(文字|圖片) -->
      <HeroApiQuizOptions :currentQuestion="currentQuestion" @onSelect="onSelect" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, ModelSync } from 'vue-property-decorator';
import { Load } from '@/helper/class/Common';
import { HeroApiQuizAPI } from '@/api/heroApiQuiz';
import { QuestionDetails, QuizAnswerResult } from '@/hero-api/dto/quiz.dto';
import HeroApiQuizOptions from './HeroApiQuizOptions.vue';
import QuizTimer from './HeroApiQuizTimerAndQuestionNumber.vue';
import { QuizSessionType } from '@/hero-api/entity/quiz.entity';
import { HeroUniverseTaskAPI } from '@/api/heroUniverseTask';

@Component({
  components: {
    QuizTimer,
    HeroApiQuizOptions,
  },
})
export default class HeroApiQuizDisplay extends Vue {
  /** 答題結果 */
  @ModelSync('syncAnswerResult', 'change', { type: QuizAnswerResult })
  private answerResult: QuizAnswerResult;

  /** 答題計時開關 */
  private isShowTimer: boolean = true;

  /** 作答sessionKey */
  private sessionKey: string = '';
  private sessionType: QuizSessionType = QuizSessionType.Default;

  /** 當前題目 */
  private currentQuestion: QuestionDetails = {
    question: '',
    options: [],
    seconds: 0,
  };

  /**
   * 開始因雄宇宙任務答題
   * @param runningTaskUid 任務編號
   */
  public async startHeroUniverseTaskAnswer(runningTaskUid: number) {
    // 取得答題許可
    const response = await HeroUniverseTaskAPI.startDialogAnswer(runningTaskUid);
    this.sessionKey = response.sessionKey;
    this.sessionType = QuizSessionType.HeroUniverse;
    this.answerResult.totalQuestions = response.totalQuestions;

    // 取得題目並開始作答
    Load.use(true);
    await this.getQuestion();
    await this.startAnswer();
    Load.use(false);
  }

  /** 取得下一題題目 */
  private async getQuestion(): Promise<void> {
    const response = await HeroApiQuizAPI.getQuestion(this.sessionKey, this.sessionType);
    this.currentQuestion = response.questionDetails;
  }

  /** 開始作答題目 */
  private async startAnswer(): Promise<void> {
    await HeroApiQuizAPI.startAnswer(this.sessionKey, this.sessionType);
  }

  /** 提交當前作答題目的答案 */
  private async submitAnswer(selectedOption: number): Promise<void> {
    const response = await HeroApiQuizAPI.submitAnswer(this.sessionKey, this.sessionType, selectedOption);
    this.answerResult = response.answerResult;
  }

  /**
   * 回答選項後
   * @param selectedOption 選擇的選項
   */
  @Emit('onSelect')
  private async onSelect(selectedOption: number): Promise<void> {
    // 題目渲染完成前先隱藏計時器
    this.isShowTimer = false;

    // 答題
    Load.use(true);
    // 提交答案
    await this.submitAnswer(selectedOption);
    // 全部答題結束則返回
    if (this.answerResult.orderId === this.answerResult.totalQuestions) {
      this.onFinish();
      return;
    }

    // 取得下一題題目並開始作答
    await this.getQuestion();
    await this.startAnswer();
    this.isShowTimer = true;
    Load.use(false);
  }

  @Emit('onTimeUp')
  private onTimeUp() {
    this.onSelect(-1);
    // TODO 提示使用者是因為超時所以答失敗
  }

  /** 結束答題 */
  @Emit('onFinish')
  private onFinish(): void {
    return;
  }
}
</script>
