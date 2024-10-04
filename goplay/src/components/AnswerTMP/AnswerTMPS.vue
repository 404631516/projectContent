<template>
  <div>
    <!--答題獲得物品顯示-->
    <GetBar
      v-if="answerResult.topicCount > 0"
      :answerScore="correctCount"
      :questOrder="questIndex"
      :questTotalCount="answerResult.topicCount"
      :countdownTime="countdownTime"
      :isShowTime="isShowTime"
      @onTimeUp="onTimeUp"
    />
    <!--答題題目顯示-->
    <div class="answer-box">
      <div class="game-answer">
        <!-- 學創題型(文字|圖片) -->
        <template v-if="quizSource === quizSourceName.Enableets">
          <Enableets :currentQuestion="currentQuestion" :answerInfo="answerInfo" @onNext="onNext" />
        </template>
        <!-- 因材網題型(圖片|MP3) -->
        <template v-if="quizSource === quizSourceName.AdlEdu">
          <Adledu :currentQuestion="currentQuestion" :answerInfo="answerInfo" @onNext="onNext" />
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import GetBar from './GetBars.vue';
import Enableets from '@/components/AnswerTMP/_QuestionClass/Enableets.vue';
import Adledu from '@/components/AnswerTMP/_QuestionClass/Adledu.vue';
import { QuizSource } from '@/helper/enum/Common';
import {
  QuestionFormat,
  AnswerInfo,
  AnswerSwitch,
  QuestionData,
  AnswerResult,
} from '../../helper/interface/AnswerGame';
import { Load, Message } from '@/helper/class/Common';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';

type AnswerFunc = (answerInfo: AnswerInfo) => QuestionData;

@Component({
  components: {
    GetBar,
    Enableets,
    Adledu,
  },
})
export default class AnswerTMP extends Vue {
  /** 答題介面開關 */
  @Prop({}) private answerSwitch!: AnswerSwitch;
  /** 作答API */
  @Prop({}) private answerFunc!: AnswerFunc;
  /** 答題結果 */
  @Prop({}) private answerResult!: AnswerResult;

  /** 答題時間開關 */
  private isShowTime: boolean = true;

  /** 是否為續命題 */
  private isContinue: boolean = false;

  /** 使用者作答資料 */
  private answerInfo: AnswerInfo = {
    answerIndex: -1,
    usedSecond: 0,
  };

  /** 給Vue用於判別題目來源 */
  private quizSourceName: typeof QuizSource = QuizSource;

  /** 題庫來源 */
  public quizSource: QuizSource = QuizSource.None;

  /** 題目排序ID */
  public questOrder: number = -1;

  /** 目前題目數 */
  private questIndex: number = 0;

  /** 題目倒數時間 */
  private countdownTime: number = -1;

  /** 當前題目 */
  private currentQuestion: QuestionFormat = {
    topic: '',
    options: [],
    url: '',
  };

  /** 答對題數 */
  public correctCount: number = 0;

  /** 答題記錄 */
  private _answerRecord: QuestionData[] = [];
  public get answerRecord(): QuestionData[] {
    return this._answerRecord;
  }

  /** 取得上一題 */
  private get lastQuestion(): QuestionData | null {
    return this._answerRecord ? this._answerRecord[this._answerRecord.length - 1] : null;
  }

  /** 開始作答 */
  public async startQuiz(): Promise<void> {
    // 取得題目
    await this.answerQuestion();
  }

  /** 繼續答題
   * @param continueQuestion
   * @param answerRecord
   */
  public continueQuiz(continueQuestion: QuestionData, answerRecord: QuestionData[]): void {
    // 設定為繼續答題
    this.isContinue = true;

    // 設定答題記錄
    this._answerRecord = answerRecord;

    // 設定當前題目
    this.setNextQuestion(continueQuestion);
  }

  /** 作答 */
  private async answerQuestion(): Promise<void> {
    // 開啟讀取中
    Load.use(true);

    try {
      // API 發送作答
      const result = await this.answerFunc(this.answerInfo);

      // 設定答題結果
      this.setAnswerResult(result);

      // 全部答題結束
      if (result.isFinished) {
        this.onFinish();
      }
      // 一般答題結束
      else if (result.isRoundOneEnd && this.isContinue === false) {
        // 儲存續命題
        this._answerRecord.push(result);
        this.onFinish();
      }
      // 設定下一題
      else {
        // 重置選項
        this.answerInfo = {
          answerIndex: -1,
          usedSecond: 0,
        };

        this.setNextQuestion(result);

        // 顯示倒數
        this.isShowTime = true;
      }

      // 題目設定完畢, 關閉讀取
      Load.use(false);
    } catch (e) {
      // 防呆錯誤
      Load.use(false);
      Message.error(`${e}`);
    }
  }

  /** 設定答題結果
   *@param result
   */
  private setAnswerResult(result: QuestionData): void {
    // 紀錄得分
    this.answerResult.answerScore += result.answerScore;

    // 答題後才顯示對錯
    if (this._answerRecord) {
      // 取得上一題
      const lastQuestion = this._answerRecord[this._answerRecord.length - 1];
      // 設定最後一題判斷
      lastQuestion.isFinished = result.isFinished;
      // 紀錄答題結果
      lastQuestion.isCorrect = result.isCorrect;
      // 顯示答對答錯
      this.answerSwitch.isCorrect = result.isCorrect;

      // 增加答對題數
      if (result.isCorrect) {
        this.correctCount++;
      }
    }
  }

  /** 設定下一題
   *@param nextQuestion
   */
  private setNextQuestion(nextQuestion: QuestionData): void {
    // 取得題目資料
    const quizData = nextQuestion.quizData;

    // 設定當前題目
    this.currentQuestion = {
      // 題目
      topic: quizData.questionMain,
      // 選項
      options: [
        {
          val: quizData.options.option1,
        },
        {
          val: quizData.options.option2,
        },
        {
          val: quizData.options.option3,
        },
        {
          val: quizData.options.option4,
        },
      ],
      // 鏈結URL
      url: quizData.questionSub,
    };

    // 紀錄當前題目
    if (this._answerRecord) {
      this._answerRecord.push(nextQuestion);
    } else {
      this._answerRecord = [nextQuestion];
    }

    // 設定倒數時間
    this.countdownTime = quizData.seconds;

    // 題目排序ID
    this.questOrder = nextQuestion.questOrder;

    // 設定總題數
    this.answerResult.topicCount = nextQuestion.questTotalCount;

    // 設定題庫來源
    this.quizSource = nextQuestion.quizData.quizSource;

    // 當前題目數
    this.questIndex = this._answerRecord.length;
  }

  /** 答題時間到(倒數) */
  private onTimeUp(): void {
    this.onNext();
  }

  /** 下一題 */
  @Emit('onNext')
  private async onNext(): Promise<void> {
    // 記錄答題時間
    this.answerInfo.usedSecond = this.$$store.state.AnswerGameModule.recordTime;

    // 判斷是否有選擇答案 -1 代表未作答
    this.answerSwitch.isPass = this.answerInfo.answerIndex === -1;

    // 答題時間重置
    this.isShowTime = false;

    // 答題
    await this.answerQuestion();
  }

  /** 結束答題 */
  @Emit('onFinish')
  private onFinish(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.item-box {
  .btn-1 {
    cursor: pointer;
    &:hover {
      background: rgb(94, 17, 124);
      color: #fff !important;
    }
    &:active {
      background: rgb(94, 17, 124);
      color: #fff !important;
    }
  }
}
.img-box {
  img {
    width: 200px;
    height: 200px;
  }
}
</style>
