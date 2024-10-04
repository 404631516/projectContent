<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <!-- 種類選擇 -->
      <p m="l-25px">{{ textData.itemType }}</p>
      <div
        class="w-200px"
        m="l-10px"
        :class="{
          'is-no-item-id': getRewardOptionData(rewardList[index]).hasItemId === false,
        }"
      >
        <SelectList
          :selectItemList="preventDuplicateItemTypeList(rewardList[index])"
          :selectedItem="rewardList[index].itemType"
          :placeholder="''"
          :popperClassName="'reward'"
          @onSelect="onSelectItemType($event)"
        />
      </div>
      <!-- 獎勵項目選擇 -->
      <div v-if="getRewardOptionData(rewardList[index]).hasItemId" class="w-230px flex items-center" m="l-10px">
        <SelectList
          :selectItemList="preventDuplicateItemIdList(rewardList[index])"
          :selectedItem="rewardList[index].itemId"
          :placeholder="`選擇${getRewardOptionData(rewardList[index]).itemTypeName}`"
          :popperClassName="'reward'"
          @onSelect="rewardList[index].itemId = $event"
        />
      </div>
      <!-- 道具數量 -->
      <div class="flex items-center" m="l-10px">
        <p>{{ textData.itemCount }}</p>
        <input
          v-model.lazy.number="rewardList[index].count"
          type="number"
          :class="{
            'cursor-not-allowed': getRewardOptionData(rewardList[index]).isFixedCount,
          }"
          :disabled="getRewardOptionData(rewardList[index]).isFixedCount"
          class="w-90px"
          m="l-10px"
          p="10px"
          border="1px solid [#B7B7B7]"
          text="center"
        />
      </div>
      <slot name="rate"></slot>
    </div>
    <!-- 刪除按鈕-->
    <button m="l-4" @click="deleteReward">
      <img :src="imgData.grayCross" />
    </button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, VModel, Prop } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { RewardOptionData, SelectOption } from '@/helper/interface/BackEndManagement';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';
import SelectList from '../BackEndManagement/_FormProp/SelectList.vue';

@Component({
  components: { SelectList },
})
export default class RewardSelect extends Vue {
  /** 獎勵 */
  @VModel() private rewardList!: ContestGameAward[];
  /** 獎勵編號 */
  @Prop(Number) private index!: number;

  /** 文字資料 */
  private textData = {
    itemType: '種類',
    pickWeapon: '選擇生物兵器',
    pickAntiTDItem: '選擇裡宇宙道具',
    pickAdornmentItem: '選擇裝飾物',
    itemCount: '數量',
  };

  /** 圖片資料 */
  private imgData = {
    grayCross: imgPath.grayCross,
  };

  /** 可選獎勵類型
   *  @param reward
   */
  private preventDuplicateItemTypeList(reward: ContestGameAward): SelectOption[] {
    // 防止重複itemType
    const filterRewardOptionList = RewardManager.rewardOptionList.filter((option) => {
      return (
        reward.itemType === option.itemType ||
        option.isMultiple ||
        this.rewardList.every((rewarditem: ContestGameAward) => rewarditem.itemType !== option.itemType)
      );
    });

    return filterRewardOptionList.map<SelectOption>((rewardOptionData) => {
      return {
        label: rewardOptionData.itemTypeName,
        value: rewardOptionData.itemType,
      };
    });
  }

  /** 可選獎勵項目種類
   *  @param reward
   */
  private preventDuplicateItemIdList(reward: ContestGameAward): SelectOption[] {
    const rewardOption = this.getRewardOptionData(reward);
    return rewardOption.rewardItemOptionList.filter(
      (option: SelectOption) =>
        reward.itemId === option.value ||
        this.rewardList.every((rewarditem: ContestGameAward) => rewarditem.itemId !== option.value)
    );
  }

  /** 選擇道具種類
   *  @param result
   *  @param index
   */
  private onSelectItemType(result: RewardItemKey): void {
    this.rewardList[this.index].itemType = result;
    const rewardOption = this.getRewardOptionData(this.rewardList[this.index]);
    // 有道具ID
    if (rewardOption.hasItemId) {
      this.rewardList[this.index].itemId = -1;
      this.rewardList[this.index].count = 1;
    }
    // 無道具ID
    else {
      this.rewardList[this.index].itemId = 0;
      this.rewardList[this.index].count = 0;
    }
  }

  /** 取得獎勵種類屬性
   *  @param reward
   */
  private getRewardOptionData(reward: ContestGameAward): RewardOptionData {
    return RewardManager.getRewardOptionData(reward);
  }

  /** 刪除獎勵 */
  private deleteReward(): void {
    this.rewardList.splice(this.index, 1);
  }
}
</script>
<style scoped>
.borderbox {
  margin-left: 0px;
}
.is-no-item-id {
  margin-right: 240px;
}
</style>
