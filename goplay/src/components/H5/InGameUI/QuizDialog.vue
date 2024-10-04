<template>
  <div>
    <!-- 答題結果 -->
    <template v-if="isShowMsg">
      <RandomTmp
        class="absolute z-12 w-full"
        :msgVisible="isShowMsg"
        :answerSwitch="answerSwitch"
        :isShowAward="false"
        @onClose="onCloseResult"
      />
    </template>
    <!-- 題目與答案 -->
    <div class="answer-msg-warpper">
      <el-dialog
        :visible="isBrickBreakerQuiz"
        :destroy-on-close="false"
        :show-close="false"
        :lock-scroll="true"
        :fullscreen="true"
      >
        <div class="h5-box">
          <template v-if="isBrickBreakerQuiz">
            <div class="answer-box">
              <AnswerTMP
                id="answerTMP"
                ref="answerTMP"
                :answerSwitch="answerSwitch"
                :answerFunc="onAnswer"
                :answerResult="answerResult"
                @onNext="onNext"
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
import { Component, Vue, Watch } from 'vue-property-decorator';
import AnswerTMP from '@/components/AnswerTMP/AnswerTMPS.vue';
import RandomTmp from '@/components/AnswerTMP/RandomTMP.vue';
import { AnswerResult, AnswerInfo, QuestionData, AnswerSwitch } from '@/helper/interface/AnswerGame';

@Component({
  components: {
    AnswerTMP,
    RandomTmp,
  },
})
export default class QuizDialog extends Vue {
  /** 答題結果開關 */
  private isShowMsg: boolean = false;
  /** 答題是否結束 */
  private isFinished: boolean = false;

  public $refs!: {
    answerTMP: AnswerTMP;
  };

  /** 答題介面開關 */
  private answerSwitch: AnswerSwitch = {
    isPass: false,
    isCorrect: false,
  };

  /** 答續命題結果 */
  private answerResult: AnswerResult = {
    topicCount: 0,
    answerScore: 0,
  };

  /** 使用者作答資料 */
  private answerInfo: AnswerInfo = {
    answerIndex: -1,
    usedSecond: -1,
  };

  /** 是否顯示答題畫面 */
  private get isBrickBreakerQuiz(): boolean {
    return this.$$store.state.BrickBreakerModule.isShowQuiz;
  }

  @Watch('isBrickBreakerQuiz')
  private async requestQuiz(): Promise<void> {
    if (this.isBrickBreakerQuiz === false) {
      return;
    }

    // 等待DOM render完成後再呼叫
    this.$nextTick(() => {
      this.$refs.answerTMP.startQuiz();
    });
  }

  /** 傳送答案並要求題目
   * @param answerInfo 作答樣式
   */
  public async onAnswer(answerInfo: AnswerInfo): Promise<QuestionData> {
    const response: QuestionData = await this.$$store.dispatch('sendAnswerGetQuestion', answerInfo);

    return response;
  }

  /** 下一題 */
  public onNext(): void {
    this.isShowMsg = true;
  }

  /** 結束答題 */
  private onFinish(): void {
    this.isFinished = true;
  }

  /** 結果顯示完畢*/
  private onCloseResult(): void {
    this.isShowMsg = false;
    if (this.isFinished) {
      this.isFinished = false;
      this.$$store.commit('setShowBrickBreakerQuiz', false);
    }
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
