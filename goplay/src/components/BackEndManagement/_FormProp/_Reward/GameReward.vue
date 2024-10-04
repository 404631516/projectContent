<template>
  <div>
    <!-- 參賽獎勵列表 -->
    <div
      v-for="(rewardItem, rewardIndex) in currentGameRewardList"
      :key="rewardIndex"
      class="p-[20px] mb-[20px] rounded-[5px]"
      border="1px solid [#707070]"
    >
      <ol>
        <li>
          <span>
            {{ getRewardName(rewardItem) }} *
            {{ rewardItem.count }}
          </span>
        </li>
        <!-- 機率 -->
        <span class="note-txt">
          {{ textData.rateTitle }}
          {{ rewardItem.rate }}
          {{ textData.percentageTitle }}
        </span>
      </ol>
    </div>
    <!-- 操作按鈕 -->
    <SettingButton
      :isShowSaveButton="true"
      :addTitle="textData.setRewardTitle"
      @onAdd="isShowRewardSet = true"
      @onSave="onSave(currentGameRewardList)"
      @onReset="currentGameRewardList = []"
    />
    <!-- 提示訊息 -->
    <p text="20px" class="pt-[20px]" v-show="currentGameRewardList.length > 0">
      {{ textData.currentGameReward }}
      <span text="[#d69f05]">{{ currentGameRewardList.length }}</span>
      {{ textData.rewardCountTitle }}
      <span class="ml-[20px]" text="16px [#d69f05]">{{ textData.hintTitle }}</span>
    </p>
    <span class="font-bold text-[#F56C6C]" v-if="isUnsaved">{{ textData.unsaved }}</span>
    <!-- 獎勵設定彈窗 -->
    <template v-if="isShowRewardSet">
      <RewardSet
        :rewardList="currentGameRewardList"
        :isRate="true"
        :planetCrystalMax="gameRewardCrystalMax"
        @onSave="onSaveGameReward"
        @onCancel="isShowRewardSet = false"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import RewardSet from '@/components/BackEndManagement/_FormProp/_Reward/RewardSet.vue';
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { ContestGameAward } from '@/helper/interface/Contest';
import SettingButton from '@/components/BackEndManagement/_FormProp/SettingButton.vue';
import RewardManager from '@/manager/RewardManager';

@Component({
  components: {
    RewardSet,
    SettingButton,
  },
})
export default class GameReward extends Vue {
  /** 獎勵清單 */
  @Prop(Array) private gameRewardList!: ContestGameAward[];

  /** 編輯中的參賽獎勵 */
  private currentGameRewardList: ContestGameAward[] = [];

  /** 顯示獎勵編輯 */
  private isShowRewardSet: boolean = false;

  /** 未儲存 */
  private isUnsaved: boolean = false;

  /** 參賽獎晶球上限 */
  private readonly gameRewardCrystalMax: number = 5;

  /** 獎勵類型 */
  private RewardItemKey = RewardItemKey;

  /** 文字資料 */
  private textData = {
    setRewardTitle: '設定獎勵',
    planetGoldItemType: '星球大戰金幣',
    planetCrystalItemType: '星球大戰水晶',
    rateTitle: '(獲得機率',
    percentageTitle: '%)',
    currentGameReward: '目前已添加',
    rewardCountTitle: '項賽事獎勵',
    hintTitle: '(記得[儲存]否則設定無效)',
    unsaved: '尚未儲存',
  };

  // 檢查是否undefined，若是則設定為空陣列，否則設定為gameRewardList
  mounted() {
    this.currentGameRewardList = this.gameRewardList ? this.gameRewardList : [];
  }

  /** 取得獎勵名稱
   *  @param reward
   */
  private getRewardName(reward: ContestGameAward): string {
    return RewardManager.getRewardItemName(reward);
  }

  /** 更新參賽獎勵
   * @param newGameRewardList
   */
  private onSaveGameReward(newGameRewardList: ContestGameAward[]): void {
    this.currentGameRewardList = newGameRewardList;
    this.isShowRewardSet = false;
  }

  /** 檢查是否未儲存
   * @param gameReward
   */
  public checkNeedSave(gameReward: ContestGameAward[]): boolean {
    // 設定是否未儲存
    this.isUnsaved = JSON.stringify(this.currentGameRewardList) !== JSON.stringify(gameReward);
    return this.isUnsaved;
  }

  /** 儲存參賽獎勵
   * @param currentGameRewardList
   */
  @Emit('onSave')
  private onSave(currentGameRewardList: ContestGameAward[]): void {
    this.isUnsaved = false;
    return;
  }
}
</script>
<style lang="scss" scoped></style>
