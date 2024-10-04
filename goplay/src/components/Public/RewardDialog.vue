<template>
  <el-dialog :visible.sync="isDialogVisible" :fullscreen="true" :show-close="false" custom-class="RewardDialog">
    <div class="bg-opacity-80" bg="[#000]">
      <!-- 獎勵標題 -->
      <div m="x-auto b-6.5" p="t-12 b-6.5" border="b-1px solid [#C4C4C4]" text="4xl [#FDC221]">
        {{ textData.gainRewardTitle }}
      </div>
      <!-- 獎勵詳細內容 -->
      <ul v-if="rewardItemList.length > 0" class="h-40 overflow-auto scrollbar" m="x-auto">
        <li
          v-for="(giftItem, index) in rewardItemList"
          :key="index"
          class="flex items-center justify-center"
          text="[#fff] 29px"
          m="y-3"
        >
          <!-- 道具icon 道具名稱*數量 -->
          <img
            class="aspect-square object-contain"
            :class="giftItem.itemType === RewardItemKey.Weapon ? 'w-22' : 'w-11'"
            m="r-1"
            :src="getItemImg(giftItem)"
          />
          {{ getItemName(giftItem) }} *
          {{ giftItem.count }}
        </li>
      </ul>
      <ul v-else>
        <div>
          <h3 m="b-1.5" text="4xl [#f00]">{{ textData.noRewardData }}</h3>
        </div>
      </ul>
      <!-- 關閉獎勵ui按鈕 -->
      <button
        class="shadow-default rounded-[30px] yellowGradient"
        m="t-9 b-5"
        p="x-10 y-2"
        text="xl [#FFF]"
        @click="isDialogVisible = false"
      >
        {{ textData.closeGainReward }}
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';
import { Component, Vue, ModelSync, Prop } from 'vue-property-decorator';

@Component({})
export default class RewardDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 獎勵資料 */
  @Prop(Array) private rewardItemList!: ContestGameAward[];

  /** 文字資料 */
  private textData = {
    gainRewardTitle: '獲得獎品',
    closeGainReward: '關閉',
    noRewardData: '沒有獎勵資料',
  };

  private RewardItemKey = RewardItemKey;

  /** 取得任務獎勵圖片
   * @param giftItem 獎勵資料
   */
  private getItemImg(giftItem: ContestGameAward): string {
    return RewardManager.getRewardItemImg(giftItem);
  }

  /** 取得任務獎勵名稱
   * @param giftItem 獎勵資料
   */
  private getItemName(giftItem: ContestGameAward): string {
    return RewardManager.getRewardItemName(giftItem);
  }
}
</script>

<style scoped>
::v-deep .el-dialog.RewardDialog {
  background: transparent;
  top: 200px;
  max-height: 29rem;
  max-width: 100%;
  width: auto;
}
::v-deep .RewardDialog .el-dialog__body {
  padding: 5px 0px 20px 0px;
  min-height: auto;
}
::v-deep .el-icon-close:before {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
}
.scrollbar::-webkit-scrollbar {
  padding: 0px 0px 10px 0px;
  width: 10px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
