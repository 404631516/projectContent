<template>
  <div bg="[#F9F8F4]">
    <div class="min-h-[calc(100vh-60px)] shadow-default" bg="[#FFFFFF]" m="x-46 <xl:x-10 <sm:x-3" p="t-5 b-15">
      <template v-if="questionnaireAwarded != null">
        <!-- 標題 -->
        <QuestionnaireTitle
          :questionnaireData="questionnaireAwarded"
          :isUseCollapse="true"
          m="x-27 b-9 <xl:x-10 <sm:x-3"
        />
        <!-- 參加獎 -->
        <div
          v-if="baseRewardCount > 0"
          class="flex flex-col items-center justify-center rounded-[10px] relative"
          border="1 solid [#67D3D4]"
          m="x-83 <xl:x-15 <sm:x-3"
        >
          <img :src="imgData.awardedImg" class="absolute right-0 top-0 <sm:(transform scale-50 -right-11.5 -top-5.5)" />
          <p m="t-6 b-2" text="3xl [#EBAC00]">{{ textData.baseReward }}</p>
          <p class="w-[95%] truncate" text="2xl [#666666]">{{ getRewardNameString(questionnaireAwarded.reward) }}</p>
          <RewardListComponent :rewardList="questionnaireAwarded.reward" :isCenter="baseRewardCount <= 10" p="y-3" />
        </div>
        <!-- 轉蛋獎勵 -->
        <div
          v-if="questionnaireAwarded.winningRank > 0"
          class="flex flex-col items-center justify-center rounded-[10px] relative"
          border="1 solid [#67D3D4]"
          m="x-83 t-3.5 <xl:x-15 <sm:x-3"
        >
          <img :src="imgData.awardedImg" class="absolute right-0 top-0 <sm:(transform scale-50 -right-11.5 -top-5.5)" />
          <div m="t-6 b-2">
            <p class="inline-block" text="3xl [#636363]">{{ textData.congratulation }}</p>
            <p class="inline-block" text="3xl [#EBAC00]">{{ `第${questionnaireAwarded.winningRank}獎` }}</p>
            <img :src="imgData.gashaponHalf" class="w-12.5 aspect-square object-contain inline-block" m="-t-9" />
          </div>
          <p class="w-[95%] truncate" text="2xl [#666666]">{{ getRewardNameString(rankReward) }}</p>
          <RewardListComponent :rewardList="rankReward" :isCenter="rankReward.length <= 10" p="y-3" />
        </div>
        <!-- 轉蛋未中 -->
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-[10px]"
          border="1 solid [#67D3D4]"
          m="x-83 t-3.5 <xl:x-15 <sm:x-3"
        >
          <div m="t-6 b-2">
            <p class="inline-block" text="3xl [#636363]">{{ textData.noWinReward }}</p>
            <img :src="imgData.gashaponHalf" class="w-12.5 aspect-square object-contain inline-block" m="-t-9" />
          </div>
          <p m="t-8 b-13" text="3xl [#8B8B8B]">{{ textData.noWinContent }}</p>
        </div>
        <!-- 返回列表 -->
        <button
          class="rounded-[30px] yellowGradient shadow-default"
          m="t-10"
          p="x-11 y-3"
          @click="onReturnQuestionnaireList"
        >
          <p class="inline-block" text="xl [#FFFFFF]">{{ textData.returnQuestionnaireList }}</p>
        </button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { Message } from '@/helper/class/Common';
import { QuestionnaireAwarded } from '@/helper/interface/Questionnaire';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';
import { formsReviewFilledRewardAPI } from '@/api/questionnaire';
import RewardListComponent from '@/components/Public/RewardListComponent.vue';
import QuestionnaireTitle from './QuestionnaireTitle.vue';
import { MenuName } from '@/helper/enum/MenuName';

@Component({
  components: { QuestionnaireTitle, RewardListComponent },
})
export default class QuestionnaireReview extends Vue {
  /** 問卷ID */
  private formsId: number = 0;
  /** 問卷資料 */
  private questionnaireAwarded: QuestionnaireAwarded = {} as QuestionnaireAwarded;

  /** 文字資料 */
  private textData = {
    returnQuestionnaireList: '返回問卷列表',
    baseReward: '基本獎勵',
    congratulation: '恭喜抽中',
    noWinReward: '沒中獎...',
    noWinContent: '銘謝惠顧',
  };

  /** 圖片資料 */
  private imgData = {
    gashaponHalf: imgPath.gashaponHalf,
    awardedImg: imgPath.awardedUrl,
    rewardFrame: imgPath.rewardFrame,
  };

  /** 是否有基本獎勵 */
  private get baseRewardCount(): number {
    return this.questionnaireAwarded.reward ? this.questionnaireAwarded.reward.length : 0;
  }

  /** 取得抽獎獎勵 */
  private get rankReward(): ContestGameAward[] {
    return this.questionnaireAwarded.rankReward[this.questionnaireAwarded.winningRank - 1].rewardList;
  }

  async created() {
    if (this.$route.params.id == null) {
      // 返回問卷清單
      this.onReturnQuestionnaireList();
      return;
    }
    this.formsId = Number(this.$route.params.id);
    await this.requestQuestionnaireAward();
  }

  /** API取得問卷資料 */
  private async requestQuestionnaireAward(): Promise<void> {
    // 組成封包
    const data = {
      formsId: this.formsId,
    };

    try {
      // API撈取所有通知
      const response: any = await formsReviewFilledRewardAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 整理資料
      this.questionnaireAwarded = response.forms as QuestionnaireAwarded;
      this.questionnaireAwarded.reward = JSON.parse(response.forms.reward);
      this.questionnaireAwarded.rankReward = JSON.parse(response.forms.rankReward);
      this.questionnaireAwarded.winningRank = response.winningRank;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 獎勵物品名字+數量
   *  @param rewardList 獎勵清單
   */
  private getRewardNameString(rewardList: ContestGameAward[]): string {
    return RewardManager.combineRewardName(rewardList);
  }

  /** 抓取道具圖片
   *  @param rewardItem 獎勵道具
   */
  private getItemImg(rewardItem: ContestGameAward): string {
    return RewardManager.getRewardItemImg(rewardItem);
  }

  /** 返回問卷清單 */
  private onReturnQuestionnaireList(): void {
    this.$router.push(`/${MenuName.QuestionnaireUser}`);
  }
}
</script>
