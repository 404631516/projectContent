<template>
  <el-dialog :visible="true" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
    <!-- 標題 -->
    <div slot="title">{{ textData.rewardSetTitle }}</div>
    <!-- 獎勵清單 -->
    <div class="flex flex-col items-center" text="20px">
      <!-- 選擇獎勵物品 -->
      <div v-for="(rewardItem, rewardIndex) in currentRewardList" :key="rewardIndex">
        <RewardSelect v-if="currentRewardList.length > 0" v-model="currentRewardList" :index="rewardIndex" m="b-3">
          <template v-slot:rate>
            <div v-show="isRate" class="flex items-center" m="l-10px">
              <p>{{ textData.rateTitle }}</p>
              <input
                v-model.lazy.number="currentRewardList[rewardIndex].rate"
                type="number"
                class="w-90px"
                m="l-5px"
                p="10px"
                border="1px solid [#B7B7B7]"
                text="center"
              />
              <p m="l-1">%</p>
            </div>
          </template>
        </RewardSelect>
      </div>
      <!-- 添加獎勵-->
      <div text="18px" m="t-5">
        <!-- 操作按鈕 -->
        <SettingButton
          :isShowSaveButton="false"
          :addTitle="textData.addRewardTitle"
          @onAdd="onAddReward"
          @onReset="currentRewardList = []"
        />
        <!-- 提示訊息 -->
        <div class="my-[20px]">
          {{ textData.currentRewardTitle }}
          <span class="mx-2 text-[#d69f05]">{{ currentRewardList.length }}</span>
          {{ textData.rewardCountTitle }}
        </div>
      </div>
    </div>
    <!-- 儲存介面 -->
    <div slot="footer" class="pt-[20px] flex-pos" border="top-[2px] solid [#000]">
      <!-- 取消 -->
      <el-button class="btn-info-cancel" @click="onCancel">
        {{ textData.cancelTitle }}
      </el-button>
      <!-- 儲存 -->
      <el-button class="btn-game-again" @click="onClickSave">
        {{ textData.confirmTitle }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import SelectList from '@/components/BackEndManagement/_FormProp/SelectList.vue';
import { ContestGameAward } from '@/helper/interface/Contest';
import { RewardItemKey } from '../../../../helper/enum/AnswerGame';
import SettingButton from '@/components/BackEndManagement/_FormProp/SettingButton.vue';
import RewardSelect from '@/components/Public/RewardSelect.vue';
import RewardManager from '@/manager/RewardManager';

@Component({
  components: {
    SelectList,
    SettingButton,
    RewardSelect,
  },
})
export default class RewardSet extends Vue {
  /** 獎勵清單 */
  @Prop(Array) private rewardList!: ContestGameAward[];
  /** 是否有機率 */
  @Prop(Boolean) public isRate!: boolean;
  /** 晶球獎勵上限 */
  @Prop(Number) private planetCrystalMax!: number;

  /** 獎勵類型 */
  private RewardItemKey = RewardItemKey;

  /** 編輯中獎勵清單 */
  private currentRewardList: ContestGameAward[] = [];

  /** 文字資料 */
  private textData = {
    rewardSetTitle: '設定獎勵',
    addRewardTitle: '+添加獎勵物品',
    currentRewardTitle: '目前已添加',
    rewardCountTitle: '項獎勵',
    cancelTitle: '取消',
    confirmTitle: '確定',
    rateTitle: '機率',
  };

  mounted() {
    this.rewardList.forEach((reward) => {
      this.currentRewardList.push(Object.assign({}, reward));
    });
  }

  /** 添加獎勵 */
  private onAddReward(): void {
    this.currentRewardList.push({
      itemType: RewardItemKey.Weapon,
      itemId: -1,
      count: 1,
      rate: 100,
    });
  }

  /** 點擊儲存獎勵 */
  private onClickSave(): void {
    // 是否有錯誤
    let errorMessage: string = '';

    // 獎勵檢查
    errorMessage += RewardManager.isContestGameAwardValid('', this.currentRewardList);

    // 賽事獎勵獨有檢察
    for (let index = 0; index < this.currentRewardList.length; index++) {
      const reward = this.currentRewardList[index];
      // 機率防呆
      if (this.isRate && reward.rate < 1) {
        errorMessage += `:獎品${index + 1}設定錯誤,無效機率${reward.rate}%`;
      }
      // 晶球上限檢查
      if (reward.itemType === RewardItemKey.PlanetCrystal && reward.count > this.planetCrystalMax) {
        errorMessage += `:獎品${index + 1}設定錯誤,晶球數量不可超過${this.planetCrystalMax}`;
      }
    }

    // 填錯提示
    if (errorMessage.length !== 0) {
      this.$message.error({
        dangerouslyUseHTMLString: true,
        message: errorMessage,
        duration: 5000,
      });
      return;
    }

    // 更新參賽獎勵
    this.onSave(this.currentRewardList);
  }

  /** 儲存
   * @param currentRewardList
   */
  @Emit('onSave')
  private onSave(currentRewardList: ContestGameAward[]): void {
    return;
  }

  /** 取消 */
  @Emit('onCancel')
  private onCancel(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog {
  width: 98%;
  max-width: 1280px;
  border-radius: 30px;
}
::v-deep .el-dialog__header {
  color: #ebca28;
  font-size: 28px;
  text-align: center;
}
::v-deep .el-dialog__body {
  padding: 0px 15px 15px 15px;
}
::v-deep .el-select .el-input.el-input--suffix .el-input__inner {
  background-color: #eeeada;
  color: #666666 !important;
  font-size: 20px !important;
}
::v-deep .el-select .el-input.el-input--suffix .el-input__inner::placeholder {
  color: #666666 !important;
}
::v-deep .el-select .el-input.is-disabled.el-input--suffix .el-input__inner {
  color: #666666 !important;
  font-size: 20px !important;
}
::v-deep i.el-select__caret {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  padding-left: 14px;
  background: url('../../../../assets/images/icon/select_arrow.png') center center no-repeat;
  background-size: 18px 12px;
  transform: translate(-50%, -50%);
}
::v-deep .el-select__caret.el-input__icon.el-icon-arrow-up::before {
  content: '';
}
</style>
