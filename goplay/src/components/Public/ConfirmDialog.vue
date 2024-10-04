<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :center="true"
    destroy-on-close
    :append-to-body="appendTOBody"
    width="400px"
  >
    <div slot="title" text="4xl [#666666]">{{ title }}</div>
    <div class="whitespace-pre" text="2xl [#A5A5A5] center">
      {{ confirmInfo }}
    </div>
    <div slot="footer" class="grid grid-cols-[180px,180px] justify-center gap-x-3">
      <button
        class="rounded-[80px] block shadow-default"
        border="1px solid [#B9B9B9]"
        text="[#878787]"
        p="y-3"
        @click="onClickCancel"
      >
        {{ textData.cancel }}
      </button>
      <button class="rounded-[80px] block shadow-default yellowGradient" p="y-3" text="[#FFF]" @click="onClickConfirm">
        {{ textData.confirm }}
      </button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Emit, ModelSync, Prop } from 'vue-property-decorator';
@Component({
  components: {},
})
export default class ConfirmDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  @Prop(Boolean) readonly appendTOBody!: boolean;

  /** 標題內容 */
  @Prop(String) readonly title!: string;

  /** 內容 */
  @Prop(String) readonly confirmInfo!: string;

  /** 文字資料*/
  private textData = {
    cancel: this.$t('common.cancel'),
    confirm: this.$t('common.confirm'),
  };

  /** 點擊取消 */
  @Emit('onClickCancel')
  private onClickCancel(): void {
    return;
  }

  /** 點擊確認 */
  @Emit('onClickConfirm')
  private onClickConfirm(): void {
    return;
  }
}
</script>

<style scoped>
>>> .el-dialog {
  max-width: 400px;
  width: 95%;
  border-radius: 30px;
}
>>> .el-icon-close:before {
  font-size: 36px;
  font-weight: 700;
  color: #bfbfbf;
}
</style>
