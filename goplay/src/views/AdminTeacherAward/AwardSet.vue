<template>
  <el-dialog :visible="true" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
    <!-- 標題 -->
    <div slot="title">{{ textData.awardSetTitle }}</div>
    <!-- 獎勵清單 -->
    <div class="flex flex-col items-center" text="20px">
      <!-- 選擇獎勵物品 -->
      <div v-for="(award, index) in editingAwardList" :key="index">
        <AwardSelect :awardList="editingAwardList" :index="index" @deleteAward="onDeleteAward" m="b-3"> </AwardSelect>
      </div>
      <!-- 添加獎勵-->
      <div text="18px" m="t-5">
        <!-- 操作按鈕 -->
        <SettingButton
          :isShowSaveButton="false"
          :addTitle="textData.addAwardTitle"
          @onAdd="onAddAward"
          @onReset="editingAwardList = []"
        />
        <!-- 提示訊息 -->
        <div class="my-[20px]">
          {{ textData.currentAwardTitle }}
          <span class="mx-2 text-[#d69f05]">{{ editingAwardList.length }}</span>
          {{ textData.awardCountTitle }}
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
import SettingButton from '@/components/BackEndManagement/_FormProp/SettingButton.vue';
import RewardManager from '@/manager/RewardManager';
import { Award, ContestAwardItemTypeEnum } from '@/hero-api/dto/award.dto';
import AwardSelect from './AwardSelect.vue';
import { Message } from '@/helper/class/Common';

@Component({
  components: {
    SettingButton,
    AwardSelect,
  },
})
export default class AwardSet extends Vue {
  /** 教師獎勵清單 */
  @Prop(Array) private awardList!: Award[];
  /** 晶球獎勵上限 */
  @Prop(Number) private planetCrystalMax!: number;
  /** 編輯中獎勵清單 */
  private editingAwardList: Award[] = [];

  /** 文字資料 */
  private textData = {
    awardSetTitle: '設定獎勵',
    addAwardTitle: '+添加獎勵物品',
    currentAwardTitle: '目前已添加',
    awardCountTitle: '項獎勵',
    cancelTitle: '取消',
    confirmTitle: '確定',
  };

  /** 組件掛載時初始化獎勵清單 */
  mounted() {
    // 如果沒有選擇，則使用教師派獎原先的設定
    this.editingAwardList = [...this.awardList];
  }

  /** 添加獎勵項目 */
  private onAddAward(): void {
    // 獎勵上限為7。金幣+晶球+任五項獎勵
    if (this.editingAwardList.length < 7) {
      this.editingAwardList.push({
        itemType: ContestAwardItemTypeEnum.PlanetWarWeapon, // 預設類型
        itemId: -1, // 預設物品ID
        count: 1, // 預設數量
      });
    } else {
      Message.info('已達到獎勵上限，不能再添加新的獎勵。');
    }
  }

  /** 點擊儲存獎勵 */
  private onClickSave(): void {
    const errorMessage: string = RewardManager.isTeacherAwardValid('', this.editingAwardList, this.planetCrystalMax);
    // 填錯提示
    if (errorMessage.length !== 0) {
      this.$message.error({
        dangerouslyUseHTMLString: true,
        message: errorMessage,
        duration: 5000,
      });
      return;
    }
    // 更新獎勵
    this.onSave(this.editingAwardList);
  }

  /** 用於保存當前獎勵列表
   * @param editingAwardList
   */
  @Emit('onSave')
  private onSave(editingAwardList: Award[]): void {
    return;
  }

  /** 刪除獎勵 */
  private async onDeleteAward(awardIndex: number): Promise<void> {
    this.editingAwardList = this.editingAwardList.filter((_, index) => index !== awardIndex);
  }

  /** 用於取消編輯 */
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
  transform: translate(-50%, -50%);
}
::v-deep .el-select__caret.el-input__icon.el-icon-arrow-up::before {
  content: '';
}
</style>
