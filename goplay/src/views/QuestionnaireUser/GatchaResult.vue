<template>
  <div class="w-full h-full fixed top-60px z-5" bg="[#00000080] opacity-60 no-repeat">
    <div class="w-full aspect-video relative">
      <!-- 黃色背景 -->
      <img class="absolute -right-[10%] h-full" :src="imgData.yellowBackground" />
      <!-- 轉蛋機 -->
      <img class="absolute right-0 w-[45.68%] aspect-square" :src="imgData.gatchaFull" />
      <!-- 基本獎勵 -->
      <div class="w-[60%] h-[60%] flex flex-col justify-center items-center absolute top-[18%]">
        <div
          v-if="fixedReward.length > 0"
          class="w-[80%] h-[37%] transform -skew-x-20 base-reward-shadow"
          border="rounded-10px"
        >
          <div class="transform skew-x-20 truncate" text="1.2vw [#666666]">
            <p text="1.7vw [#521717]" m="b-0.7vw <sm:t-3">{{ textData.baseReward }}</p>
            <p class="truncate" p="x-1vw">{{ getRewardText(fixedReward) }}</p>
            <RewardListComponent class="reward <sm:hidden" :isCenter="true" :rewardList="fixedReward" m="t-1.3vw" />
          </div>
        </div>
        <!-- 轉蛋獎勵 -->
        <div
          class="w-[80%] h-[37%] transform -skew-x-20 gatcha-reward-shadow"
          :class="fixedReward.length > 0 ? 'ml-10 mt-10' : ''"
          border="rounded-10px"
        >
          <div class="transform skew-x-20 relative <sm:bottom-1.5" text="1.2vw [#666666]">
            <div
              class="flex flex-col justify-center items-center <sm:flex-row <sm:items-end"
              text="1.7vw [#521717]"
              m="x-auto b-0.7vw"
            >
              <p>{{ textData.gatchaReward }}</p>
              <div class="flex items-end" m="<sm:l-1">
                {{ getGatchaTitle(gatchaReward) }}
                <img class="object-contain aspect-square <xl:w-25px" :src="imgData.gatchaFace" />
              </div>
            </div>
            <p class="truncate" p="x-1vw <sm:x-2">{{ getRewardText(gatchaReward) }}</p>
            <RewardListComponent class="reward <sm:hidden" :isCenter="true" :rewardList="gatchaReward" m="t-1.1vw" />
          </div>
        </div>
        <!-- 確定按鈕 -->
        <button
          class="yellowGradient shadow-default h-[10%] <sm:h-[15%]"
          m="t-10"
          p="x-5vw y-1vw"
          border="rounded-60px"
          text="1.2vw [#FFF]"
          @click="onClickConfirm"
        >
          {{ textData.confirm }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import RewardListComponent from '@/components/Public/RewardListComponent.vue';
import imgPath from '@/config/imgPath/imgPath';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';
@Component({
  components: {
    RewardListComponent,
  },
})
export default class GatchaResult extends Vue {
  /** 固定獎勵 */
  @Prop() fixedReward!: ContestGameAward[];
  /** 轉蛋結果 */
  @Prop() gatchaReward!: ContestGameAward[];
  /** 獎勵階級 */
  @Prop(Number) rewardRank!: number;

  /** 文字資料 */
  private textData = {
    baseReward: '基本獎勵',
    gatchaReward: '抽獎獎勵',
    congrats: '恭喜抽中 第',
    reward: '獎',
    miss: '銘謝惠顧...',
    noRewardText: '太可惜了,本次沒有中獎,期待下次的問卷活動吧!',
    confirm: '確定',
  };

  /** 圖片資料 */
  private imgData = {
    yellowBackground: imgPath.yellowDotBackground,
    gatchaFace: imgPath.gatchaFace00,
    gatchaFull: imgPath.gatchaFull01,
  };

  /** 取得轉蛋獎勵標題
   *  @param rewardList
   */
  private getGatchaTitle(rewardList: ContestGameAward[]): string {
    return rewardList.length === 0
      ? this.textData.miss
      : this.textData.congrats + `${this.rewardRank}` + this.textData.reward;
  }

  /** 取得獎勵文字
   *  @param rewardList
   */
  private getRewardText(rewardList: ContestGameAward[]): string {
    return rewardList.length > 0 ? RewardManager.combineRewardName(rewardList) : this.textData.noRewardText;
  }

  /** 點擊確定 */
  @Emit('onClickConfirm')
  private onClickConfirm(): void {
    return;
  }
}
</script>
<style scoped>
.base-reward-shadow {
  box-shadow: 15px 15px 0px #521717;
  background-color: #fffceb;
  padding: 1vw 0%;
}
.gatcha-reward-shadow {
  box-shadow: 15px 15px 0px #f5bd04;
  background-color: #fffceb;
  padding: 1vw 0%;
}

@media (max-width: 1025px) {
  .reward {
    transform: scale(0.6);
  }
}
</style>
