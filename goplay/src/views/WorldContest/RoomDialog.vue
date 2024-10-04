<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :destroy-on-close="true"
    @open="onOpenDialog"
    :before-close="onCloseDialog"
    top="0vh"
    custom-class="RoomDialog"
  >
    <div slot="title" text="36px" font="semibold">{{ textData.systemAlert }}</div>
    <!-- 賽事資訊 -->
    <div
      v-if="dialogShowContent === RoomDialogType.Detail"
      class="flex flex-col text-center leading-normal"
      text="26px"
    >
      {{ textData.currentRoomID }}
      <span>
        {{ textData.roomID }}
        <i text="[#00CCCE]">{{ this.roomID }}</i>
      </span>
      <span>{{ textData.roomName }}{{ this.roomName }}</span>
      <span>{{ textData.roomCreator }}{{ this.roomHostName }}</span>
      <span>{{ textData.roomStartAt }}{{ this.roomStartAt }}</span>
      <span>{{ textData.roomInfo }}{{ this.roomDetailInfo }}</span>
    </div>
    <!-- 錯誤 -->
    <div v-else p="t-9 b-7 x-26" text="26px">
      {{ errorMessage }}
    </div>
    <!-- 底部按鈕 -->
    <div slot="footer" class="flex-pos" p="y-7">
      <!-- 取消 -->
      <button
        v-if="dialogShowContent !== RoomDialogType.Error"
        class="w-[30%] bg-[#FFF] rounded-20px btn_shadow"
        p="y-2 x-4"
        m="r-4"
        text="20px [#a5a5a5]"
        @click="isDialogVisible = false"
      >
        {{ textData.cancelText }}
      </button>
      <!-- 確認 -->
      <button class="w-[30%] yellowGradient rounded-20px btn_shadow" p="y-2 x-4" text="20px [#FFF]" @click="onConfirm">
        {{ dialogShowContent === RoomDialogType.Detail ? textData.confirmJoinText : textData.confirmText }}
      </button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, ModelSync, Emit } from 'vue-property-decorator';
import { customContestRoomSearchAPI, customContestRoomUserSignUpAPI } from '@/api/contest';
import { HeroJ7GameType, ResponseState, TeamType } from '@/helper/enum/Common';
import { MenuName } from '@/helper/enum/MenuName';
import { MemberType } from '../H5/Net/NetProtocol/CommonStructure';
import { handleAPIError } from '@/helper/fnc/common';
import { isPassed, toDayjs } from '../../manager/TimeSyncManager';

/** Dialog顯示類別 */
export enum RoomDialogType {
  /** 詳細資訊 */
  Detail,
  /** 錯誤 */
  Error,
}

@Component({})
export default class RoomDialog extends Vue {
  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 房間編號 */
  @Prop(String) private roomID!: string;
  /** 房間密碼 */
  @Prop(String) private roomPassword!: string;

  /** dialog顯示內容 */
  private dialogShowContent: RoomDialogType = RoomDialogType.Detail;
  /** 房間創建者 */
  private roomHostName: string = '';
  /** 房間名稱 */
  private roomName: string = '';
  /** 賽事開始時間 */
  private roomStartAt: string = '';
  /** 賽事描述 */
  private roomDetailInfo: string = '';
  /** 賽事遊戲類型 */
  private gameType: HeroJ7GameType = -1;
  /** 錯誤訊息 */
  private errorMessage: string = '';
  /** dailog顯示類別 */
  private RoomDialogType = RoomDialogType;

  /** 文字資料 */
  private textData = {
    systemAlert: '系統通知',
    roomID: '賽局編號 ',
    roomName: '賽局名稱 ',
    roomPassword: '賽局密碼',
    currentRoomID: '您目前加入的賽局資訊為',
    roomCreator: '創立者 ',
    roomStartAt: '賽事時間 ',
    roomInfo: '賽事描述 ',
    cancelText: '取消',
    confirmText: '確認',
    confirmJoinText: '確定前往',
  };

  /** 開啟dialog */
  onOpenDialog() {
    // 防呆
    if (this.roomID === '') {
      this.onCloseDialog();
    }
    this.searchRoom();
  }

  /** 關掉dialog */
  onCloseDialog(): void {
    this.isDialogVisible = false;
    return;
  }

  /** 確認 */
  private onConfirm(): void {
    // 依顯示內容分確認走的不同
    switch (this.dialogShowContent) {
      // 顯示搜尋到的賽事詳細資訊
      case RoomDialogType.Detail:
        this.compareRoomStartTime();
        break;
      // 錯誤訊息
      case RoomDialogType.Error:
        this.isDialogVisible = false;
        break;
      default:
        break;
    }
  }

  /** 搜尋房間 */
  private async searchRoom(): Promise<void> {
    // 組成封包
    const data = {
      contestRoomId: this.roomID,
      roomPassword: this.roomPassword,
    };

    try {
      // API 取得查詢房間Token
      const response: any = await customContestRoomSearchAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 儲存賽事資訊
      this.roomHostName = response.contestRoom.hostName;
      this.roomStartAt = toDayjs(response.contestRoom.startAt).format('YYYY-MM-DD HH:mm:ss');
      this.gameType = response.gameType;
      this.roomDetailInfo = response.contestRoom.info;
      this.roomName = response.contestRoom.roomName;

      this.dialogShowContent = RoomDialogType.Detail;
    } catch (e) {
      this.dialogShowContent = RoomDialogType.Error;
      const error = e as Error;
      this.errorMessage = `${error.message}`;
      return;
    }
  }

  /** 判斷賽事開始 */
  private compareRoomStartTime(): void {
    if (isPassed(this.roomStartAt)) {
      this.requestToJoinRoom();
      this.isDialogVisible = false;
    } else {
      this.dialogShowContent = RoomDialogType.Error;
      this.errorMessage = `賽事尚未開始，開始時間為${this.roomStartAt}`;
    }
  }

  /** 請求加入 */
  private async requestToJoinRoom(): Promise<void> {
    // 組成封包
    const data = {
      contestRoomId: this.roomID,
      password: this.roomPassword,
    };
    try {
      // API 取得查詢房間Token
      const response: any = await customContestRoomUserSignUpAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // respose.signupToken 存到 ContestModule
      this.$$store.commit('setRoomSignUpToken', response.signUpToken);
      // 設定組隊類型
      this.$$store.commit('setTeamType', TeamType.Room);
    } catch (e) {
      this.dialogShowContent = RoomDialogType.Error;
      const error = e as Error;
      this.errorMessage = `${error.message}`;
      return;
    }

    // 儲存遊戲類型
    this.$$store.commit('setRoomGameType', this.gameType);
    // 設定使用者參賽類型
    this.$$store.commit('setRoomMemberType', MemberType.Player);
    this.$router.push(`/${MenuName.RoomGame}`);
    this.joinToRoomGame();
  }

  /** 成功加入遊戲 */
  @Emit('joinToRoomGame')
  private joinToRoomGame(): void {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog.RoomDialog {
  max-width: 500px;
  width: 95%;
  max-height: none;
  height: initial;
  border-radius: 30px;
}
::v-deep .RoomDialog .el-dialog__headerbtn {
  right: 5%;
}
::v-deep .RoomDialog .el-dialog__body {
  padding: 0px 10px 0px 10px;
  min-height: initial;
}
::v-deep .el-icon-close:before {
  font-size: 32px;
  font-weight: 700;
  color: #7d7d7d;
}
.btn_shadow {
  box-shadow: 0px 5px 10px #0000004d;
}
</style>
