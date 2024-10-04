<template>
  <div class="flex-pos left">
    <!-- 新增按鈕 -->
    <el-button type="primary" @click="onAdd">{{ addTitle }}</el-button>
    <!-- 儲存按鈕 -->
    <el-button v-if="isShowSaveButton" type="success" @click="onSave">{{ textData.saveTitle }}</el-button>
    <!-- 重置按鈕 -->
    <el-button v-if="isShowResetButton" type="info" @click="onReset"> {{ textData.resetTitle }}</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { Message } from '@/helper/class/Common';

@Component({})
export default class SettingButton extends Vue {
  /** 是否顯示儲存按鈕 */
  @Prop(Boolean) private isShowSaveButton!: boolean;
  /** 是否顯示重置按鈕 */
  @Prop({ default: true, type: Boolean }) private isShowResetButton!: boolean;
  /** 新增按鈕顯示文字 */
  @Prop(String) private addTitle!: string;

  /** 文字資料 */
  private textData = {
    saveTitle: '儲存設定',
    resetTitle: '重置',
  };

  /** 新增 */
  @Emit('onAdd')
  private onAdd(): void {
    return;
  }

  /** 儲存 */
  @Emit('onSave')
  private onSave(): void {
    Message.info(`儲存成功`);
    return;
  }

  /** 重置 */
  @Emit('onReset')
  private onReset(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.note {
  margin-left: 1vw;
  font-size: 14px;
  color: #d69f05;
}
</style>
