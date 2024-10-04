<template>
  <div>
    <el-dialog :visible.sync="isDialogVisible" :fullscreen="true" :destroy-on-close="true" @open="onOpenDialog">
      <!-- 標題 -->
      <div
        slot="title"
        class="w-200 flex items-center justify-center <sm:w-full"
        m="x-auto"
        p="y-2"
        text="4xl [#666666] <sm:lg"
        font="bold"
        border="b-1px solid [#C4C4C4]"
      >
        {{ textData.goToTeacherCreateRoom }}
      </div>
      <!-- 輸入 -->
      <div
        class="w-150 grid grid-cols-[1fr,3fr] gap-y-9 gap-x-5 justify-items-end items-center <sm:w-full"
        m="x-auto"
        text="2xl <sm:lg"
      >
        {{ textData.roomID }}
        <el-input v-model="roomID" />
        <div><el-checkbox v-model="isInputPassword" />{{ textData.roomPassword }}</div>
        <el-input v-model="roomPassword" :disabled="!isInputPassword" :placeholder="textData.passwordHint" />
      </div>
      <!-- 底部按鈕 -->
      <div slot="footer" class="flex items-center justify-center">
        <!-- 確認 -->
        <button
          class="yellowGradient rounded-20px shadow-default"
          m="t-9 b-6"
          p="y-3 x-20"
          text="xl [#FFF] <sm:lg"
          @click="onNext()"
        >
          {{ textData.confirmText }}
        </button>
      </div>
    </el-dialog>
    <RoomDialog v-model="isShowRoomDialog" :roomID="roomID" :roomPassword="roomPassword" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, ModelSync } from 'vue-property-decorator';
import RoomDialog from './RoomDialog.vue';

@Component({
  components: {
    RoomDialog,
  },
})
export default class RoomEntrance extends Vue {
  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 房間編號 */
  private roomID: string = '';
  /** 房間密碼 */
  private roomPassword: string = '';
  /** 是否輸入密碼 */
  private isInputPassword: boolean = false;
  /** 是否顯示RoomDialog */
  private isShowRoomDialog: boolean = false;

  /** 文字資料 */
  private textData = {
    goToTeacherCreateRoom: '我要前往老師創立的賽局',
    roomID: '*賽局編號',
    roomPassword: '賽局密碼',
    passwordHint: '有密碼才需打勾輸入',
    confirmText: '前往',
  };

  /** 開啟Dialog */
  onOpenDialog() {
    this.roomID = '';
    this.roomPassword = '';
  }

  /** 按鈕前往 */
  private onNext(): void {
    // 防呆
    if (this.roomID === '') {
      return;
    }
    this.isShowRoomDialog = true;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-height: 350px;
  height: 95%;
  top: 30%;
}
::v-deep .el-dialog__header {
  padding: 20px 0px 20px 0px;
}
::v-deep .el-dialog__headerbtn {
  right: 10%;
}
::v-deep .el-dialog__body {
  padding: 0px 0px 0px 0px;
}

::v-deep .el-checkbox__inner {
  width: 24px;
  height: 24px;
  top: -3px;
}
::v-deep .el-checkbox__inner::after {
  height: 16px;
  left: 10px;
}
::v-deep .el-checkbox__label {
  font-size: 24px;
}

::v-deep .el-input__inner {
  font-size: 24px;
}
@media (max-width: 435px) {
  ::v-deep .el-input__inner {
    font-size: 18px;
  }
}

::v-deep .el-dialog__footer {
  padding: 10px 0px 10px 0px;
}
::v-deep .el-icon-close:before {
  font-size: 32px;
  font-weight: 700;
  color: #7d7d7d;
}
</style>
