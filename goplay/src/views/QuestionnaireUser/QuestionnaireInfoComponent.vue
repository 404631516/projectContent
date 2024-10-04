<template>
  <div m="x-27 <xl:x-10 <sm:x-0" p="t-5 x-8 <sm:x-1">
    <!-- 標題 -->
    <QuestionnaireTitle :questionnaireData="questionnaireData" border="0" p="0" :isUseCollapse="false" />
    <div
      class="flex flex-col items-start"
      :class="isGetBaseReward || isContentPics ? 'border-b-1 border-solid border-[#67D3D480] py-4' : ''"
    >
      <!-- 內文圖片 -->
      <img
        v-for="(image, index) in questionnaireData.contentPics"
        :key="index"
        class="w-200 object-contain self-center"
        :src="image"
      />
      <!-- 參加獎物品 -->
      <div v-if="isGetBaseReward" class="w-full" p="x-26 <xl:x-0">
        <div class="grid grid-cols-[1fr,3fr] <sm:grid-cols-1" m="t-5">
          <div class="flex">
            <img :src="imgData.yellowStar" class="w-5.5 aspect-square inline-block" m="l-3.5 <sm:l-0" />
            <span text="2xl [#BEAE73]" m="x-1">{{ textData.getReward }}</span>
          </div>
          <p class="truncate" text="2xl [#666666]">{{ getRewardNameString(questionnaireData.reward) }}</p>
        </div>
        <div class="rounded-[10px]" border="1px solid [#67D3D4]" p="x-3 b-1">
          <RewardListComponent :rewardList="questionnaireData.reward" :style="`width:100%`" p="y-3" m="0" />
        </div>
      </div>
    </div>
    <!-- 轉蛋文字 -->
    <div border="b-1px solid [#67D3D480]" text="left" p="b-2">
      <span class="flex items-center" text="4xl [#666666] <sm:2xl" font="bold">
        {{ textData.gachaReward }}
        <img :src="imgData.gashapon" class="w-22 aspect-square object-contain" />
      </span>
      <span text="3xl [#8B8B8B] <sm:base">{{ textData.informationText }}</span>
    </div>
    <!-- 排名獎勵 -->
    <span
      class="grid grid-cols-[40px,50px,1fr] gap-x-2"
      v-for="(rankReward, index) in questionnaireData.rankReward"
      :key="index"
      text="left 2xl [#8B8B8B] <sm:base"
      m="l-80 <xl:l-0 t-2.5"
    >
      <p>{{ `${index + 1}獎` }}</p>
      <p>{{ `${rankReward.rate}%` }}</p>
      <p>{{ getRewardNameString(rankReward.rewardList) }}</p>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { ContestGameAward } from '@/helper/interface/Contest';
import { QuestionnaireData } from '@/helper/interface/Questionnaire';
import RewardManager from '@/manager/RewardManager';
import RewardListComponent from '@/components/Public/RewardListComponent.vue';
import QuestionnaireTitle from './QuestionnaireTitle.vue';

@Component({
  components: { RewardListComponent, QuestionnaireTitle },
})
export default class QuestionnaireInfoComponent extends Vue {
  /** 問卷資料 */
  @Prop() private questionnaireData!: QuestionnaireData;

  /** 文字資料 */
  private textData = {
    questionnaireTime: '問卷時間',
    participantCount: '參加人數',
    goToLink: '前往連結',
    getReward: '填完即可獲得獎勵',
    gachaReward: '轉蛋小遊戲獎品',
    informationText: '填完問卷每人可以有1次機會抽轉蛋獎品喔！看看誰手氣最好吧！',
    previewText: '預覽狀態',
    goBackToModify: '回去修改',
    watchNextPage: '觀看下一頁',
  };

  /** 圖片資料 */
  private imgData = {
    yellowStar: imgPath.yellowStarIcon,
    dogIcon: imgPath.dogIcon,
    gashapon: imgPath.gashapon,
    rewardFrame: imgPath.rewardFrame,
  };

  /** 是否有基本獎勵 */
  private get isGetBaseReward(): boolean {
    return this.questionnaireData.reward.length > 0;
  }

  /** 是否有內容圖片 */
  private get isContentPics(): boolean {
    return this.questionnaireData.contentPics.length > 0;
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
}
</script>
