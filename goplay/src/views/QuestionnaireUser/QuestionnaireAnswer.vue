<template>
  <div bg="[#F9F8F4]">
    <div class="shadow-default" bg="[#FFFFFF]" m="x-46 <xl:x-10 <sm:x-3" p="t-5 b-15">
      <QuestionnaireAnswerComponent
        :questionnaireData="questionnaireData"
        :questionBlockData="questionBlockData"
        @onSendAnswer="onSendAnswer"
      />
    </div>
    <template v-if="isShowGatchaAnimation">
      <!-- 轉蛋動畫 -->
      <GatchaAnimation
        :rewardRank="winningRank"
        :fixedReward="questionnaireData.reward"
        :gatchaReward="rankRewardRecord"
        @onClickConfirm="onBack"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { handleAPIError } from '@/helper/fnc/common';
import { QuestionAnswer, QuestionBlockData, QuestionnaireData } from '@/helper/interface/Questionnaire';
import { ResponseState } from '@/helper/enum/Common';
import { formsAnswerAPI } from '@/api/questionnaire';
import { MenuName } from '@/helper/enum/MenuName';
import QuestionnaireAnswerComponent from './QuestionnaireAnswerComponent.vue';
import GatchaAnimation from './GachaAnimation.vue';
import { Message } from '@/helper/class/Common';
import { ContestGameAward } from '@/helper/interface/Contest';

@Component({
  components: { GatchaAnimation, QuestionnaireAnswerComponent },
})
export default class QuestionnaireAnswer extends Vue {
  /** 問卷ID */
  private formsId: number = 0;
  /** 問卷資料 */
  private questionnaireData: QuestionnaireData = {} as QuestionnaireData;
  /** 問卷題目 */
  private questionBlockData: QuestionBlockData[] = [];
  /** 使用者答題問卷編號 */
  private formsUserId: number = 0;
  /** 贏得的獎勵 */
  private winningRank: number = 0;
  /** 是否顯示轉蛋動畫 */
  private isShowGatchaAnimation: boolean = false;
  /** 中獎獎項 */
  private rankRewardRecord: ContestGameAward[] = [];
  private isClick: boolean = false;

  async created() {
    if (this.$route.params.id == null) {
      // 返回問卷清單
      this.onBack();
      return;
    }
    this.formsId = Number(this.$route.params.id);
    await this.requestQuestionnaireContent();
  }

  /** API取得問卷題目資料 */
  private async requestQuestionnaireContent(): Promise<void> {
    // 組成封包
    const data = {
      formsId: this.formsId,
    };

    try {
      // API撈取所有通知
      const response: any = await formsAnswerAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      this.formsUserId = response.formsUserId;
      // 整理問卷資料
      this.questionnaireData = response.forms as QuestionnaireData;
      this.questionnaireData.reward = JSON.parse(response.forms.reward);
      this.questionnaireData.rankReward = JSON.parse(response.forms.rankReward);

      // 整理題目
      this.questionBlockData = response.questions as QuestionBlockData[];
      for (const question of this.questionBlockData) {
        question.optionArg = JSON.parse(String(question.optionArg));
      }
    } catch (e) {
      this.$alert(`${e}`);
      // 返回問卷清單
      this.$router.go(-1);
    }
  }

  /** API送出答案
   *  @param userAnswerList 答案組
   */
  private async onSendAnswer(userAnswerList: QuestionAnswer[]): Promise<void> {
    // 防連點
    if (this.isClick) {
      return;
    }
    this.isClick = true;

    // 組成封包
    const data = {
      formsUserId: this.formsUserId,
      answers: userAnswerList.map((value) => {
        return {
          formsQuestionId: value.formsQuestionId,
          answer: JSON.stringify(value.answer),
        };
      }),
    };

    try {
      // API撈取所有通知
      const response: any = await formsAnswerAPI.put(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 接獎勵
      this.winningRank = response.winningRank;
      this.rankRewardRecord = JSON.parse(response.rankRewardRecord);

      this.isShowGatchaAnimation = true;
    } catch (e) {
      Message.error(`${e}`);
    } finally {
      this.isClick = false;
    }
  }

  /** 點擊確定回列表 */
  private onBack(): void {
    this.$router.push({
      name: `${MenuName.QuestionnaireUser}`,
    });
  }
}
</script>
<style scoped>
.text-shadow {
  text-shadow: 0px 3px 6px #1c1c1c80;
}
</style>
