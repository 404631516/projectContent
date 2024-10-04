<template>
  <div class="box-wapper first flex-pos" v-if="confirmDialogVisible">
    <div class="popup-box" :class="{ 'confirmbox-phonestyle': isShowPhone }">
      <!-- 標題 -->
      <div class="box-top flex-pos">
        <div>
          <h2>{{ confirmDialog.title }}</h2>
          <p class="close-btn" @click="closeConfirmDialog(false)">✖</p>
        </div>
      </div>
      <!-- 確認內容 -->
      <div class="box-middle flex-pos">
        <!-- 內容 -->
        <slot></slot>
      </div>
      <!-- 取消/確認按鈕 -->
      <div class="box-bottom flex-pos">
        <button
          class="w-148px shadow-default"
          m="r-17px b-26px"
          p="y-5px"
          text="[#4b4b4b] 24px"
          border="rounded-20px"
          @click="closeConfirmDialog(false)"
        >
          {{ confirmDialog.cancel }}
        </button>
        <button
          class="w-148px yellowGradient shadow-default"
          m="b-26px"
          p="y-5px"
          text="[#FFF] 24px"
          border="rounded-20px"
          data="CONFIRM_BUTTON"
          @click="closeConfirmDialog(true)"
        >
          {{ confirmDialog.confirm }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { ScreenType } from '@/helper/enum/Common';
import { handleScreen } from '@/helper/fnc/common';
@Component({})
export default class ConfirmDialog extends Vue {
  @Prop({ default: false }) public confirmDialogVisible!: boolean;
  private isShowPhone: boolean = false; // 手機樣式
  private confirmDialog: {} = {
    title: '再次確認',
    cancel: '取消',
    confirm: '確定',
  };
  private mounted() {
    this.isShowPhone = handleScreen(ScreenType.Phone);
  }
  @Emit('closeConfirmDialog')
  private closeConfirmDialog(confirm: boolean): void {
    return;
  }
}
</script>
<style lang="scss" scope>
.box-wapper {
  &.first {
    z-index: 900;
  }
  .popup-box {
    background: white;
    border-radius: 50px;
    h2 {
      width: 505px;
    }
    &.confirmbox-phonestyle {
      width: 95%;
      .box-top {
        h2 {
          width: 357px;
        }
      }
      .box-bottom {
        .btn-style-1 {
          width: 148px;
          &.cancel {
            margin-right: 17px;
          }
        }
      }
    }
  }
}
</style>
