<template>
  <div class="box-wapper flex-pos" v-if="warningDialogVisible">
    <div class="popup-box" :class="{ 'warningbox-phonestyle': isShowPhone }">
      <!-- 標題 -->
      <div class="box-top flex-pos">
        <div>
          <h2>{{ warningDialog.title }}</h2>
          <p class="close-btn" @click="closeWarningDialog()">✖</p>
        </div>
      </div>
      <!-- 確認內容 -->
      <div class="box-middle flex-pos">
        <!-- 內容 -->
        <slot></slot>
      </div>
      <!-- 確定按鈕 -->
      <div class="box-bottom flex-pos">
        <p class="btn-style-1" @click="closeWarningDialog()">
          {{ warningDialog.confirm }}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { ScreenType } from '@/helper/enum/Common';
import { handleScreen } from '@/helper/fnc/common';
@Component({})
export default class WarningDialog extends Vue {
  @Prop({ default: false }) public warningDialogVisible!: boolean;
  private isShowPhone: boolean = false; // 手機樣式
  private warningDialog: {} = {
    title: '提醒',
    confirm: '確定',
  };
  private mounted() {
    this.isShowPhone = handleScreen(ScreenType.Phone);
  }
  @Emit('closeWarningDialog')
  private closeWarningDialog() {
    return;
  }
}
</script>
<style lang="scss" scope>
.box-wapper {
  z-index: 22;
  .popup-box {
    border-radius: 30px;
    h2 {
      width: 505px;
    }
    &.warningbox-phonestyle {
      width: 95%;
      .box-top {
        h2 {
          width: 357px;
        }
      }
      .box-bottom {
        .btn-style-1 {
          width: 203px;
        }
      }
    }
  }
}
</style>
