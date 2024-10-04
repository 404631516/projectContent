<template>
  <div class="flex flex-col" text="20px">
    <!-- 機率設定說明-->
    <div class="w-full <2xl:w-1000px">
      <p m="t-3" text="left 24px [#666666]">{{ textData.rateTitle }}</p>
      <p m="t-3" text="left 24px [#8B8B8B]">{{ textData.rateDescriptionOne }}</p>
      <p m="t-3" text="left 24px [#8B8B8B]">{{ textData.rateDescriptionTwo }}</p>
    </div>
    <!-- 排行獎勵清單 -->
    <div class="flex flex-col items-center">
      <draggable v-model="questionForm.rankReward" handle=".handle">
        <transition-group>
          <div v-for="(rewardGroup, groupIndex) in questionForm.rankReward" :key="`${groupIndex}`" :value="rewardGroup">
            <!-- 獎項block -->
            <div m="t-20px" border="solid 1px [#b7b7b7]">
              <div class="handle flex justify-center" m="t-10px"><img :src="imgData.moveDot" /></div>
              <div class="flex items-start" p="l-25px r-20px y-20px">
                <!-- 獎項名稱 -->
                <span m="t-10px">{{ `${groupIndex + 1}獎` }}</span>
                <!-- 機率 -->
                <div class="flex items-center" m="l-25px">
                  <span>{{ textData.itemRate }}</span>
                  <input
                    v-model.number="questionForm.rankReward[groupIndex].rate"
                    type="number"
                    class="w-75px"
                    m="l-10px"
                    p="8px"
                    border="1px solid [#B7B7B7]"
                    text="center"
                  />
                  <span m="l-1">%</span>
                </div>
                <div class="flex flex-col" text="20px">
                  <div class="flex flex-col items-center">
                    <div v-for="(reward, index) in rewardGroup.rewardList" :key="getId(index)" :value="reward">
                      <RewardSelect
                        v-model="questionForm.rankReward[groupIndex].rewardList"
                        :isRankReward="true"
                        :index="index"
                        m="b-3"
                      />
                    </div>
                    <!-- 下方長條按鈕 -->
                    <div class="w-full flex justify-start">
                      <button
                        class="w-645px"
                        text="20px [#FFF]"
                        bg="[#18BBD5]"
                        m="t-3 l-25px"
                        p="x-250px y-10px"
                        @click="addNewReward(groupIndex)"
                      >
                        <span text="28px" font="bold">+</span>{{ textData.reward }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </draggable>
    </div>
    <div class="w-full h-1px" m="y-20px" border="solid b-1px [#B7B7B7]"></div>
    <div class="flex justify-start" m="l-120px">
      <!-- 新增獎勵 -->
      <button class="flex items-center" text="[#FFF]" bg="[#18BBD5]" p="x-20px y-10px" @click="addNewRewardGroup">
        <p text="28px" font="bold">+</p>
        {{ textData.rewardGroup }}
      </button>
      <!-- 清空 -->
      <button
        class="flex items-center"
        text="[#FFF]"
        bg="[#FF5875]"
        m="l-10px"
        p="x-20px y-10px"
        @click="clearRewardGroup"
      >
        {{ textData.clear }}
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { QuestionnaireData } from '@/helper/interface/Questionnaire';
import { Component, Vue, VModel, Watch } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import imgPath from '@/config/imgPath/imgPath';
import RewardSelect from '@/components/Public/RewardSelect.vue';

@Component({
  components: { RewardSelect, draggable },
})
export default class QuestionnaireRankRewardSet extends Vue {
  /** 問卷資料 */
  @VModel() private questionForm!: QuestionnaireData;

  /** 文字資料 */
  private textData = {
    rewardGroup: '獎項',
    reward: '獎品',
    clear: '清空',
    sort: '排序',
    itemRate: '機率',
    rateTitle: '機率設定說明',
    rateDescriptionOne: '1.機率最大可填100%,最小可填0.01%',
    rateDescriptionTwo: '2.所有獎項機率加總為100%,未滿100%時,剩餘機率將默認為銘謝惠顧',
  };

  /** 圖片資料 */
  private imgData = {
    moveDot: imgPath.moveDot,
  };

  /** 產生獨特key
   *  @param index
   */
  private getId(index: number): symbol {
    return Symbol(index);
  }

  /** 新增獎勵
   *  @param groupIndex
   */
  private addNewReward(groupIndex: number): void {
    this.questionForm.rankReward[groupIndex].rewardList.push({
      itemType: RewardItemKey.Weapon,
      itemId: -1,
      count: 1,
      rate: -1,
    });
  }

  /** 新增獎勵組 */
  private addNewRewardGroup(): void {
    this.questionForm.rankReward.push({
      rewardList: [{ itemType: RewardItemKey.PlanetGold, itemId: 0, count: 0, rate: -1 }],
      rate: 0,
    });
  }

  /** 清空獎勵組 */
  private clearRewardGroup(): void {
    this.questionForm.rankReward = [];
  }

  /** 刪除獎勵組
   *  @param groupIndex
   */
  private deleteRewardGroup(groupIndex: number): void {
    this.questionForm.rankReward.splice(groupIndex, 1);
  }

  /** 偵測獎勵組變化 */
  @Watch('questionForm', { deep: true })
  private onRankRewardChange(questionForm: QuestionnaireData): void {
    // 刪除空的獎勵組
    if (questionForm.rankReward.findIndex((rankReward) => rankReward.rewardList.length === 0) > -1) {
      questionForm.rankReward = questionForm.rankReward.filter((rankReward) => {
        return rankReward.rewardList.length > 0;
      });
    }
  }
}
</script>
