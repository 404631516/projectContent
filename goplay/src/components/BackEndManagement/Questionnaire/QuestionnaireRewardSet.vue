<template>
  <div>
    <div class="flex flex-col" text="20px">
      <!-- 獎勵清單 -->
      <div class="flex flex-col items-center">
        <div v-for="(reward, index) in rewardList" :key="getId(index)" :value="reward">
          <!-- 獎品標題 -->
          <div class="w-978px flex items-center" border="[#b7b7b7] 1px solid" m="b-3" p="20px">
            <p>{{ textData.reward + `${index + 1}` }}</p>
            <RewardSelect v-model="rewardList" :isRankReward="false" :index="index" />
          </div>
        </div>
        <div v-if="rewardList.length === 0" text="left 24px [#8B8B8B]">{{ textData.noFixedReward }}</div>
      </div>
      <!-- 下方按鈕區 -->
      <template>
        <div class="w-full h-1px <2xl:w-1024px" m="y-20px" border="solid b-1px [#B7B7B7]"></div>
        <div class="flex justify-start" m="l-120px">
          <!-- 新增獎勵 -->
          <button class="flex items-center" text="[#FFF]" bg="[#18BBD5]" p="x-20px y-10px" @click="addNewReward">
            <p text="28px" font="bold">+</p>
            {{ textData.reward }}
          </button>
          <!-- 清空 -->
          <button
            class="flex items-center"
            text="[#FFF]"
            bg="[#FF5875]"
            m="l-10px"
            p="x-20px y-10px"
            @click="clearReward"
          >
            {{ textData.clear }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import RewardSelect from '@/components/Public/RewardSelect.vue';
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { ContestGameAward } from '@/helper/interface/Contest';
import { Component, Vue, VModel } from 'vue-property-decorator';
import SelectList from '../_FormProp/SelectList.vue';

@Component({
  components: { SelectList, RewardSelect },
})
export default class QuestionnaireRewardSet extends Vue {
  /** 獎勵組 */
  @VModel() private rewardList!: ContestGameAward[];

  /** 文字資料 */
  private textData = {
    reward: '獎品',
    clear: '清空',
    noFixedReward: '尚無固定獎勵',
  };

  /** 產生獨特key
   *  @param index
   */
  private getId(index: number): symbol {
    return Symbol(index);
  }

  /** 新增獎勵 */
  private addNewReward(): void {
    this.rewardList.push({ itemType: RewardItemKey.Weapon, itemId: -1, count: 1, rate: -1 });
  }

  /** 清空獎勵 */
  private clearReward(): void {
    this.rewardList = [];
  }
}
</script>
<style scoped>
.borderbox {
  width: 978px;
  border: 1px solid;
  border-color: #b7b7b7;
  padding: 20px 20px 20px 25px;
  margin-left: 0px;
}
.pickweapon {
  margin-right: 240px;
}
.delete-button-space {
  margin-left: 175px;
}
</style>
