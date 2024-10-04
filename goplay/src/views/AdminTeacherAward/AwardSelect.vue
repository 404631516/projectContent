<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <!-- 種類選擇 -->
      <p m="l-25px">{{ textData.itemType }}</p>
      <div
        class="w-200px ml-[10px]"
        :class="{
          'is-no-item-id': getTeacherAwardOptionData(awardList[index]).hasItemId === false,
        }"
      >
        <SelectList
          :selectItemList="filterDuplicateItemTypeList(awardList[index])"
          :selectedItem="awardList[index].itemType"
          :placeholder="''"
          :popperClassName="'award'"
          @onSelect="onSelectItemType($event)"
        />
      </div>
      <!-- 獎勵項目選擇 -->
      <div v-if="getTeacherAwardOptionData(awardList[index]).hasItemId" class="w-230px flex items-center ml-[10px]">
        <SelectList
          :selectItemList="filterDuplicateItemIdList(awardList[index])"
          :selectedItem="awardList[index].itemId"
          :placeholder="`選擇${getTeacherAwardOptionData(awardList[index]).itemTypeName}`"
          :popperClassName="'award'"
          @onSelect="awardList[index].itemId = $event"
        />
      </div>
      <!-- 道具數量 -->
      <div class="flex items-center ml-[10px]">
        <p>{{ textData.itemCount }}</p>
        <input
          v-model.lazy.number="awardList[index].count"
          type="number"
          :class="{
            'cursor-not-allowed': getTeacherAwardOptionData(awardList[index]).isFixedCount,
          }"
          :disabled="getTeacherAwardOptionData(awardList[index]).isFixedCount"
          class="w-90px"
          m="l-10px"
          p="10px"
          border="1px solid [#B7B7B7]"
          text="center"
        />
      </div>
    </div>
    <!-- 刪除按鈕-->
    <button m="l-4" @click="deleteAward(index)">
      <img :src="imgPath.grayCross" />
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { SelectOption } from '@/helper/interface/BackEndManagement';
import RewardManager from '@/manager/RewardManager';
import { Award, ContestAwardItemTypeEnum } from '@/hero-api/dto/award.dto';
import SelectList from '@/components/BackEndManagement/_FormProp/SelectList.vue';

@Component({
  components: { SelectList },
})
export default class AwardSelect extends Vue {
  /** 獎勵清單 */
  @Prop(Array) private awardList!: Award[];
  /** 獎勵編號 */
  @Prop(Number) private index!: number;
  /** 引入函數(使vue能辨認) */
  private getTeacherAwardOptionData = RewardManager.getTeacherAwardOptionData;
  private imgPath = imgPath;

  /** 文字資料 */
  private textData = {
    itemType: '種類',
    pickWeapon: '選擇生物兵器',
    pickAntiTDItem: '選擇裡宇宙道具',
    pickAdornmentItem: '選擇裝飾物',
    itemCount: '數量',
  };

  /**
   * 過濾掉重複的道具種類
   * @param award 當前獎勵對象
   */
  private filterDuplicateItemTypeList(award: Award): SelectOption[] {
    // 過濾掉已經存在的 itemType
    const availableOptions = RewardManager.teacherRewardOptionList.filter(
      (option) =>
        award.itemType === option.itemType ||
        option.isMultiple ||
        this.awardList.every((awardItem) => awardItem.itemType !== option.itemType),
    );

    return availableOptions.map((option) => ({
      label: option.itemTypeName,
      value: option.itemType,
    }));
  }

  /**
   * 過濾掉重複的道具 ID
   * @param award 當前獎勵對象
   */
  private filterDuplicateItemIdList(award: Award): SelectOption[] {
    const awardOption = this.getTeacherAwardOptionData(award);

    return awardOption.rewardItemOptionList.filter(
      (option: SelectOption) =>
        award.itemId === option.value || this.awardList.every((awardItem: Award) => awardItem.itemId !== option.value),
    );
  }

  /** 選擇道具種類
   *  @param result 道具種類的選擇結果
   *  @param index
   */
  private onSelectItemType(result: ContestAwardItemTypeEnum): void {
    this.awardList[this.index].itemType = result;
    const rewardOption = this.getTeacherAwardOptionData(this.awardList[this.index]);
    // 有道具ID
    if (rewardOption.hasItemId) {
      this.awardList[this.index].itemId = -1;
      this.awardList[this.index].count = 1;
    }
    // 無道具ID
    else {
      this.awardList[this.index].itemId = 0;
      this.awardList[this.index].count = 0;
    }
  }

  /** 刪除獎勵 */
  @Emit('deleteAward')
  private deleteAward(index: number): void {
    /** */
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
