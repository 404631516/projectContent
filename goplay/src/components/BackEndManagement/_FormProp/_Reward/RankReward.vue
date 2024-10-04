<template>
  <div>
    <!-- 排行獎勵清單 -->
    <div
      class="pt-[20px] mb-[20px] rounded-[5px]"
      border="1px solid [#707070]"
      v-for="(rankItem, rankIndex) in currentRankRewardList"
      :key="rankIndex"
    >
      <!-- 排行獎勵 -->
      <el-form-item :label="textData.rankingTitle">
        <!-- 名次範圍 -->
        <el-col :span="10">
          <div class="w-[90%]">
            <el-input v-model.trim="rankItem.rankValue" :placeholder="textData.rankPlaceholder"> </el-input>
          </div>
        </el-col>
        <!-- 獎勵清單 -->
        <el-col :span="7">
          <!-- 設定獎勵按鈕 -->
          <el-button type="primary" @click="onClickRankReward(rankIndex)">{{ textData.setRewardTitle }} </el-button>
          <!-- 移除按鈕 -->
          <el-button type="danger" @click="onRemoveRankReward(rankIndex)">
            {{ textData.removeTitle }}
          </el-button>
        </el-col>
      </el-form-item>
      <el-form-item>
        <div class="w-[90%] grid grid-cols-3 gap-x-[20px]">
          <!-- 顯示獎勵 -->
          <div
            v-for="(rewardItem, rewardIndex) in rankItem.rewardList"
            :key="rewardIndex"
            class="p-[10px] mb-[20px] rounded-[5px]"
            border="1px solid [#707070]"
            text="18px"
          >
            <ol>
              <li>
                <span>
                  {{ getRewardName(rewardItem) }} *
                  {{ rewardItem.count }}
                </span>
              </li>
            </ol>
          </div>
        </div>
      </el-form-item>
    </div>
    <!-- 操作按鈕 -->
    <SettingButton
      :isShowSaveButton="true"
      :addTitle="textData.addRankRewardTitle"
      @onAdd="onAddRankReward"
      @onSave="onSave(currentRankRewardList)"
      @onReset="currentRankRewardList = []"
    />
    <!-- 提示訊息 -->
    <p text="20px" class="pt-[20px]" v-show="currentRankRewardList.length > 0">
      {{ textData.currentRankTitle }}
      <span text="[#d69f05]">{{ currentRankRewardList.length }}</span>
      {{ textData.rankCountTitle }}
      <span class="ml-[20px]" text="16px [#d69f05]">{{ textData.hintTitle }}</span>
    </p>
    <span class="font-bold text-[#F56C6C]" v-if="isUnsaved">{{ textData.unsaved }}</span>
    <!-- 獎勵設定彈窗 -->
    <template v-if="isShowRewardSet">
      <RewardSet
        :rewardList="currentRankRewardList[currentRankIndex].rewardList"
        :isRate="false"
        :planetCrystalMax="rankRewardCrystalMax"
        @onSave="onSaveRankReward"
        @onCancel="isShowRewardSet = false"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import RewardSet from '@/components/BackEndManagement/_FormProp/_Reward/RewardSet.vue';
import SettingButton from '@/components/BackEndManagement/_FormProp/SettingButton.vue';
import { ContestRankRewardData, ContestGameAward } from '@/helper/interface/Contest';
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import RewardManager from '@/manager/RewardManager';

@Component({
  components: {
    RewardSet,
    SettingButton,
  },
})
export default class RankReward extends Vue {
  /** 排行獎勵清單 */
  @Prop() private rankRewardList!: ContestRankRewardData[];

  /** 顯示獎勵編輯 */
  private isShowRewardSet: boolean = false;

  /** 編輯中排行獎勵清單 */
  private currentRankRewardList: ContestRankRewardData[] = [];

  /** 編輯中獎勵中的排行Index */
  private currentRankIndex: number = 0;

  /** 未儲存 */
  private isUnsaved: boolean = false;

  /** 排行獎晶球上限 */
  private readonly rankRewardCrystalMax: number = 1000;

  /** 獎勵類型 */
  private RewardItemKey = RewardItemKey;

  /** 文字資料 */
  private textData = {
    addRankRewardTitle: '+添加名次',
    rankingTitle: '名次',
    rankPlaceholder: 'ex: 1 或 1 ~ 10 或 -1(無名次)',
    setRewardTitle: '設定獎勵',
    removeTitle: '移除',
    currentRankTitle: '目前已添加',
    rankCountTitle: '項排行獎勵',
    hintTitle: '(記得[儲存]否則設定無效)',
    unsaved: '尚未儲存',
    planetGoldItemType: '星球大戰金幣',
    planetCrystalItemType: '星球大戰水晶',
  };

  mounted() {
    this.rankRewardList.forEach((reward) => {
      this.currentRankRewardList.push(Object.assign({}, reward));
    });
  }

  /** 取得獎勵名稱
   *  @param reward
   */
  private getRewardName(reward: ContestGameAward): string {
    return RewardManager.getRewardItemName(reward);
  }

  /** 點擊設定排行獎勵
   * @param rankIndex
   */
  private onClickRankReward(rankIndex: number): void {
    this.currentRankIndex = rankIndex;
    this.isShowRewardSet = true;
  }

  /** 點擊移除排行獎勵
   * @param rankIndex
   */
  private onRemoveRankReward(rankIndex: number): void {
    this.currentRankRewardList.splice(rankIndex, 1);
  }

  /** 新增排行獎勵 */
  private onAddRankReward(): void {
    this.currentRankRewardList.push({
      rankValue: '',
      rewardList: [],
    });
  }

  /** 更新排行獎勵
   * @param newRewardList
   */
  private onSaveRankReward(newRewardList: ContestGameAward[]): void {
    this.currentRankRewardList[this.currentRankIndex].rewardList = newRewardList;
    this.currentRankIndex = -1;
    this.isShowRewardSet = false;
  }

  /** 檢查是否未儲存
   * @param rankReward
   */
  public checkNeedSave(rankReward: ContestRankRewardData[]): boolean {
    // 設定是否未儲存
    this.isUnsaved = JSON.stringify(this.currentRankRewardList) !== JSON.stringify(rankReward);
    return this.isUnsaved;
  }

  /** 儲存排名獎勵
   * @param currentRankRewardList
   */
  @Emit('onSave')
  private onSave(currentRankRewardList: ContestRankRewardData[]): void {
    this.isUnsaved = false;
    return;
  }
}
</script>
<style lang="scss" scoped></style>
