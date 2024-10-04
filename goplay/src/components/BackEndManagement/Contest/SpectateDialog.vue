<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :destroy-on-close="true"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <!-- 標題 -->
    <div slot="title" text="36px">
      {{ textData.waitSpectate }}
    </div>
    <!-- 內文 -->
    <div>
      <div text="28px">{{ textData.waiting }}</div>
      <!-- 取消觀戰按鈕 -->
      <button
        class="blueGradient"
        p="x-2 y-2"
        m="t-10"
        border="rounded-50px"
        text="20px [#FFF]"
        @click="onCancelSpectate"
      >
        {{ textData.cancelSpectate }}
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, ModelSync, Emit } from 'vue-property-decorator';

@Component({})
export default class SpectateDialog extends Vue {
  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /**文字資料 */
  private textData = {
    waitSpectate: '等待參加者加入遊戲',
    waiting: '等待中...',
    cancelSpectate: '取消觀戰',
  };

  /** 點擊取消觀戰 */
  @Emit('onCancelSpectate')
  private onCancelSpectate(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  max-width: 500px;
  width: 95%;
  border-radius: 30px;
}
::v-deep .el-dialog__header {
  padding-top: 30px !important;
}
::v-deep .el-dialog__body {
  padding: 20px 20px 20px 20px;
}
</style>
