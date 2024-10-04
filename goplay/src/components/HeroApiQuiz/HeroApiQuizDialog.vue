<template>
  <div>
    <!-- 答題結果 -->
    <template v-if="isShowResult">
      <HeroApiQuizResult
        class="absolute z-12 w-full"
        v-model="isShowResult"
        :answerResult="answerResult"
        :isShowAward="false"
      />
    </template>
    <!-- 題目與答案 -->
    <div class="answer-msg-warpper">
      <el-dialog
        :visible="isShowQuiz"
        :destroy-on-close="false"
        :show-close="false"
        :lock-scroll="true"
        :fullscreen="true"
      >
        <div class="h5-box">
          <template v-if="isShowQuiz">
            <div class="answer-box" style="width: 96%; transform: translateX(2%); padding-top: 10px">
              <HeroApiQuizDisplay
                id="heroApiAnswer"
                ref="heroApiAnswer"
                v-model="answerResult"
                @onSelect="onSelect"
                @onFinish="onFinish"
              />
            </div>
          </template>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import HeroApiQuizDisplay from '@/components/HeroApiQuiz/HeroApiQuizDisplay.vue';
import HeroApiQuizResult from '@/components/HeroApiQuiz/HeroApiQuizResult.vue';
import { QuizAnswerResult } from '@/hero-api/dto/quiz.dto';
import { QuizAnswerStatus } from '@/hero-api/entity/quiz.entity';

@Component({
  components: {
    HeroApiQuizDisplay,
    HeroApiQuizResult,
  },
})
export default class HeroApiQuizDialog extends Vue {
  /** 是否顯示此答題畫面 */
  private isShowQuiz: boolean = false;
  /** 答題結果開關 */
  private isShowResult: boolean = false;
  /** 答題內容顯示 */
  public $refs!: {
    heroApiAnswer: HeroApiQuizDisplay;
  };

  /** 答題後的結果 */
  private answerResult: QuizAnswerResult = {
    orderId: 0,
    totalQuestions: 0,
    score: 0,
    totalScore: 0,
    status: QuizAnswerStatus.NotAnswered,
  };

  public async startHeroUniverseTaskAnswer(runningTaskUid: number) {
    this.isShowQuiz = true;
    // 等待DOM render完成後再呼叫
    this.$nextTick(() => {
      this.$refs.heroApiAnswer.startHeroUniverseTaskAnswer(runningTaskUid);
    });
    await AsyncHelper.pendingUntil(() => this.isShowQuiz === false);
  }

  /** 當回答選項後執行 */
  public onSelect(): void {
    this.isShowResult = true;
  }

  /** 結束答題 */
  private async onFinish(): Promise<void> {
    // 等到正確提示顯示結束
    await AsyncHelper.pendingUntil(() => this.isShowResult === false);

    // 答題結束
    this.isShowQuiz = false;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  background: transparent;
}
::v-deep .el-dialog__header {
  padding: 20px 0px 0px 0px;
}
::v-deep .el-dialog__headerbtn {
  right: 10%;
}
::v-deep .el-dialog__body {
  padding: 0px 20px 0px 20px;
}
::v-deep .el-icon-close:before {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
}
</style>
