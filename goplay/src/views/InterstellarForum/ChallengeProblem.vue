<template>
  <div class="challenge-problem">
    <div class="problem-item">
      <!-- 罐頭訊息 -->
      <CannedMessage v-if="isCanned" @postComment="getAdlForumInputComment" />
      <!-- 答對獎勵訊息 -->
      <GiftDialog v-if="isGift" :state="crystalName" :awardNum="awardNum" :userAwardNum="userAwardNum" />
      <!-- 題目資訊 -->
      <div class="answer-msg-warpper">
        <el-dialog :visible="true" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
          <div class="h5-box">
            <!-- 答對： 獲得能量、道具 or 答錯 -->
            <template v-if="isShowMsg">
              <RandomTmp
                class="random-pos"
                :msgVisible="isShowMsg"
                :answerSwitch="answerSwitch"
                :isShowAward="false"
                @onClose="isShowMsg = false"
              />
            </template>
            <!-- 答題 -->
            <template v-if="!isAnswerFinish">
              <AnswerTMP
                id="answerTMP"
                ref="answerTMP"
                :answerSwitch="answerSwitch"
                :answerFunc="onAnswer"
                :answerResult="answerResult"
                @onNext="onNext"
                @onFinish="onFinish"
              />
              <div class="mask-opt"></div>
            </template>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import CannedMessage from '@/components/InterstellarForum/Dialog/CannedMessage.vue';
import { adlForumInputComment, adlForumPostStartComment, adlForumPostFinishComment } from '@/api/InterstellarForum';
import { Message } from '@/helper/class/Common'; // 訊息框
import { ResponseState } from '@/helper/enum/Common';
import GiftDialog from '@/components/InterstellarForum/GiftDialog.vue';
import { QuizData, AnswerSwitch, AnswerResult, AnswerInfo, QuestionData } from '@/helper/interface/AnswerGame';
import { AwardType } from '@/helper/enum/InterstellarForum'; // 獎勵類型
import RandomTmp from '@/components/AnswerTMP/RandomTMP.vue'; // 隨機獲取能量道具模組
import AnswerTMP from '@/components/AnswerTMP/AnswerTMPS.vue';
import { handleAPIError } from '@/helper/fnc/common';
import { AsyncHelper } from '../H5/Helper/AsyncHelper';

@Component({
  components: {
    RandomTmp,
    AnswerTMP,
    CannedMessage,
    GiftDialog,
  },
})
export default class ChallengeProblem extends Vue {
  /** 給Vue用於判別獎勵類別 */
  private crystalName: string = AwardType.crystal;

  /** 罐頭訊息開關 */
  private isCanned: boolean = false;

  /** 獎勵訊息開關 */
  private isGift: boolean = false;

  /** 論壇題目帖子ID */
  private forumId = +this.$route.params.id;

  /** 獲得數量 */
  private awardNum: number = 0;
  /** 使用者現在擁有總量 */
  private userAwardNum: number = 0;
  /** 答題帖子ID */
  private postCommentId: number = 0;

  public $refs!: {
    answerTMP: AnswerTMP;
  };

  /** 答題結果開關 */
  private isShowMsg: boolean = false;

  /** 答題結束 */
  private isAnswerFinish: boolean = false;

  /** 答題介面開關 */
  private answerSwitch: AnswerSwitch = {
    isPass: false,
    isCorrect: false,
  };

  /** 答題結果 */
  private answerResult: AnswerResult = {
    topicCount: 0,
    answerScore: 0,
  };

  mounted() {
    this.startChallengeAnswer();
  }

  /** 開始論壇答題 */
  private async startChallengeAnswer(): Promise<void> {
    try {
      // API 開始回答論壇問題
      const response: any = await adlForumPostStartComment.post({
        postId: this.forumId,
      });
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 轉換論壇答題格式到一般答題格式
      const questionData: QuestionData = {
        result: response.result,
        resMessage: response.resMessage,
        questTotalCount: 1,
        quizData: response.quizData,
        questOrder: 0,
        isCorrect: false,
        answerScore: 0,
        isRoundOneEnd: true,
        isFinished: true,
      };

      // 等一幀加載答題頁面
      await this.$nextTick();

      // 開始答題
      await this.$refs.answerTMP.continueQuiz(questionData, []);
    } catch (e) {
      Message.error(e);
    }
  }

  /** 論壇作答API
   * @param answerInfo
   */
  private async onAnswer(answerInfo: AnswerInfo): Promise<QuestionData> {
    try {
      // API 發送作答
      const response: any = await adlForumPostFinishComment.post({
        postId: this.forumId,
        answerIndex: answerInfo.answerIndex,
      });
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 設定獎勵資訊
      if (response.awardInfo.hasOwnProperty('awardCrystal') === true) {
        this.awardNum = response.awardInfo.awardCrystal;
        this.userAwardNum = response.awardInfo.currCrystal;
      }

      // 設定留言ID
      this.postCommentId = response.postCommentId;

      // 轉換論壇答題格式到一般答題格式
      const answerResult: QuestionData = {
        result: response.result,
        resMessage: response.resMessage,
        questTotalCount: 1,
        quizData: {} as QuizData,
        questOrder: 0,
        isCorrect: response.isAnswerCorrect === 1,
        answerScore: response.isAnswerCorrect,
        isRoundOneEnd: true,
        isFinished: true,
      };

      // 返回答題結果
      return answerResult;
    } catch (e) {
      Message.error(`${e}`);
    }

    // 錯誤
    return {} as QuestionData;
  }

  /** 下一題 */
  private onNext(): void {
    // 開啟結果顯示
    this.isShowMsg = true;
  }

  /** 論壇作答完成 */
  private async onFinish(): Promise<void> {
    // 答對
    if (this.answerSwitch.isCorrect) {
      // 顯示獎勵
      this.isGift = true;

      // 等一段時間
      await AsyncHelper.sleep(5);

      // 關閉顯示獎勵
      this.isGift = false;
      this.isCanned = true;
    }
    // 答錯
    else {
      await AsyncHelper.sleep(0.5);
      this.$router.go(-1);
    }

    // 答題結束
    this.isAnswerFinish = true;
  }

  /** 發布回覆
   * @param message
   */
  private async getAdlForumInputComment(message: string) {
    try {
      const response: any = await adlForumInputComment.post({
        postCommentId: this.postCommentId,
        textId: message,
      });
      if (response.result === ResponseState.Success) {
        this.$router.replace({ path: '/InterstellarForum' });
      }
    } catch (e) {
      Message.error(e);
    }
  }
}
</script>
<style lang="scss" scoped>
.challenge-problem {
  .problem-item {
    width: 1014px;
    border-right: 2px solid gray;
    border-left: 2px solid gray;
  }
}
</style>
