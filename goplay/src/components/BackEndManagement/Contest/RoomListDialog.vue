<template>
  <div>
    <el-dialog :visible.sync="isDialogVisible"
      ><div>
        <div
          v-for="(room, index) in roomList"
          class="flex justify-start items-center grid grid-cols-[180px,250px,120px,200px,80px,110px,80px]"
          :key="index"
          m="t-3"
          text="20px"
        >
          <!-- 內文 -->
          <div class="flex">{{ textData.roomName }}{{ room.roomName }}</div>
          <div>{{ textData.startTime }}{{ getStartTime(room) }}</div>
          <div>{{ textData.roomId }}{{ room.contestRoomId }}</div>
          <div class="flex">{{ textData.roomState }}{{ getRoomStateName(room) }}</div>
          <!-- 修改按鈕 -->
          <button
            v-if="getCanEdit(room)"
            class="blueGradient"
            m="l-2"
            p="x-2 y-1"
            border="rounded-20px"
            text="20px [#FFF]"
            @click="onClickRoomEdit(room)"
          >
            {{ textData.edit }}
          </button>
          <!-- 查看按鈕 -->
          <button
            v-else
            class="blueGradient"
            m="l-2"
            p="x-2 y-1"
            border="rounded-20px"
            text="20px [#FFF]"
            @click="getGameRecord(room.gameId)"
          >
            {{ textData.view }}
          </button>
          <!-- 再開一局按鈕 -->
          <button
            v-if="room.teamType !== TeamType.Room && room.contestIsExpired === false"
            class="yellowGradient"
            m="l-2"
            p="x-2 y-1"
            border="rounded-20px"
            text="20px [#FFF]"
            @click="onClickNewGame(room)"
          >
            {{ textData.anotherRoom }}
          </button>
          <!-- 觀戰按鈕 -->
          <button
            v-if="getRoomState(room) === RoomStateType.GameStarted"
            class="yellowGradient"
            m="l-2"
            p="x-2 y-1"
            border="rounded-20px"
            text="20px [#FFF]"
            @click="onClickSpectateRoom(room)"
          >
            {{ textData.spectate }}
          </button>
        </div>
        <div v-if="roomList.length === 0">
          <div text="32px">
            {{ textData.noRoomFound }}
          </div>
          <button
            class="yellowGradient"
            m="t-10"
            p="x-3 y-3"
            border="rounded-20px"
            text="32px [#FFF]"
            @click="onSwitchRoomPage(1)"
          >
            {{ textData.refresh }}
          </button>
        </div>
      </div>
      <div slot="footer" class="flex justify-center">
        <!-- 頁籤 -->
        <el-pagination
          layout="prev, pager, next"
          :total="roomListSize"
          :page-size="roomPerPage"
          :hide-on-single-page="true"
          @current-change="onSwitchRoomPage"
        ></el-pagination>
      </div>
    </el-dialog>
    <!-- 結算彈窗 -->
    <BrickBreakerResultDialog v-model="isShowResult" @onCloseDialog="isShowResult = false" />
    <!-- 等待觀戰彈窗 -->
    <SpectateDialog v-model="isShowSpectateDialog" @onCancelSpectate="onCloseSpectateDialog" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, ModelSync, Prop, Emit } from 'vue-property-decorator';
import { RoomListData } from '@/helper/interface/Contest';
import dayjs from 'dayjs';
import { RoomStateType, RoomStateName, ResponseState, HeroJ7GameType, TeamType } from '@/helper/enum/Common';
import { contestRoomSpectatorSignUpAPI } from '@/api/contest';
import { MemberType } from '@/views/H5/Net/NetProtocol/CommonStructure';
import { MenuName } from '@/helper/enum/MenuName';
import { Message } from '@/helper/class/Common';
import BrickBreakerResultDialog from '@/components/H5/InGameUI/BrickBreaker/BrickBreakerResultDialog.vue';
import { contestRoomGameRecordAPI } from '@/api/contestGame';
import {
  BrickBreakerGameFinishStatus,
  BrickBreakerRankData,
  BrickBreakerRankType,
  BrickBreakerVueUserAnswerData,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import { handleAPIError } from '@/helper/fnc/common';
import duration from 'dayjs/plugin/duration';
import SpectateDialog from './SpectateDialog.vue';
import { BrickBreakerScoreList } from '@/helper/interface/Game';
import { formatSeconds } from '@/views/H5/Helper/MathHelper';
import { toDayjs, isPassed, isNotYet } from '../../../manager/TimeSyncManager';

/** 逆塔防 隊伍英雄位置編輯說明 面板 */
@Component({
  components: {
    BrickBreakerResultDialog,
    SpectateDialog,
  },
})
export default class RoomListDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 房間列表資料 */
  @Prop() private roomList!: RoomListData[];
  /** 房間總量 */
  @Prop(Number) private roomListSize!: number;
  /** 每頁顯示房間數量上限 */
  @Prop(Number) private roomPerPage!: number;

  /** 顯示等待觀戰 */
  private isShowSpectateDialog: boolean = false;
  /** 是否顯示結算畫面 */
  private isShowResult: boolean = false;
  /** 倒數計時 */
  private intervalId: number = 0;
  /** 觀戰請求間隔 */
  private readonly waitSpectateInterval: number = 5000;

  private RoomStateType = RoomStateType;
  private TeamType = TeamType;

  /**文字資料 */
  private textData = {
    roomName: '賽局名稱:',
    startTime: '開始時間:',
    roomId: '賽局ID:',
    roomState: '賽局狀態 : ',
    spectate: '觀戰',
    edit: '修改',
    view: '查看',
    anotherRoom: '再開一局',
    noRoomFound: '本賽事尚無您創立的賽局',
    refresh: '刷新列表',
  };

  /** 取得開始時間
   *  @param room
   */
  private getStartTime(room: RoomListData): string {
    // 轉換時間格式
    return `${toDayjs(`${room.startAt}`).format('YYYY-MM-DD HH:mm')}`;
  }

  /** 取得房間狀態
   * @param room
   */
  private getRoomState(room: RoomListData): RoomStateType {
    // 遊戲結束
    if (room.isFinished === 1) {
      return RoomStateType.GameFinished;
    }

    // 遊戲時間已超過
    if (isPassed(room.endAt)) {
      return room.gameId === -1 ? RoomStateType.OverTime : RoomStateType.ErrorFinished;
    }

    // 尚未開始
    if (isNotYet(room.startAt)) {
      return RoomStateType.NotStarted;
    }

    // 進行中
    return RoomStateType.GameStarted;
  }

  /** 取得房間狀態名稱
   * @param room
   */
  private getRoomStateName(room: RoomListData): string {
    const roomState = this.getRoomState(room);
    const nameKey = RoomStateType[roomState];
    return Object.entries(RoomStateName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤類別';
  }

  /** 判斷賽事是否無法編輯
   *  @param room
   */
  private getCanEdit(room: RoomListData): boolean {
    switch (this.getRoomState(room)) {
      case RoomStateType.NotStarted:
      case RoomStateType.GameStarted:
        return true;
      case RoomStateType.OverTime:
        return room.contestIsExpired === false;
      case RoomStateType.GameFinished:
      case RoomStateType.ErrorFinished:
        return false;
      default:
        return false;
    }
  }

  /** 請求觀戰
   * @param room
   */
  private async requestSpectateRoom(room: RoomListData): Promise<boolean> {
    // 組成封包
    const data = {
      contestRoomId: room.contestRoomId,
      password: room.roomPassword,
    };
    try {
      // API 取得查詢房間Token
      const response: any = await contestRoomSpectatorSignUpAPI.post(data);
      // 房間不存在
      if (response.result === ResponseState.ContestRoomGameNotExist) {
        return false;
      }
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      // respose.signupToken 存到 ContestModule
      this.$$store.commit('setRoomSignUpToken', response.signUpToken);
      // 設定組隊類型
      this.$$store.commit('setTeamType', TeamType.Room);
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** 取得結算資料
   *  @param gameId
   */
  private async getGameRecord(gameId: number): Promise<void> {
    // 組成封包
    const data = { gameId };
    try {
      // API 取得結算資料
      const response: any = await contestRoomGameRecordAPI.fetch(data);
      // 結算失敗
      if (response.result === 'gameFinishIncomplete') {
        Message.info('未順利完成該局競賽，無法提供結算成果');
        return;
      }
      if (response.result === ResponseState.Success) {
        const resultDataList: BrickBreakerRankData[] = [];
        for (let i = 0; i < BrickBreakerRankType.MAX; i++) {
          let rankType = BrickBreakerRankType[i];
          rankType = rankType[0].toLowerCase() + rankType.slice(1);

          // 組成結算資料
          const resultData: BrickBreakerRankData = {
            rankType: i,
            vueMvpData: response.mvpList[rankType],
          };
          resultDataList.push(resultData);
        }
        // 儲存結算資料
        this.$$store.commit('setContestResultData', resultDataList);
        const rankDataList: BrickBreakerScoreList[] = response.rankList as BrickBreakerScoreList[];
        this.$$store.commit('setContestRankList', rankDataList);
        const finishStatus: BrickBreakerGameFinishStatus = {
          gamePlayTime: formatSeconds(response.gamePlaySec),
          bossTotalHp: response.bossTotalHp,
          bossHp: response.bossHp,
        };
        this.$$store.commit('setGameFinishStatus', finishStatus);

        const answerRankList: BrickBreakerVueUserAnswerData[] =
          response.userAnswerDatas as BrickBreakerVueUserAnswerData[];
        this.$$store.commit('setAnswerRankList', answerRankList);
      }
    } catch (e) {
      Message.error(`${e}`);
      return;
    }
    // 通知開啟彈窗
    this.isShowResult = true;
  }

  /** 點擊觀戰
   * @param room
   */
  private async onClickSpectateRoom(room: RoomListData): Promise<void> {
    const isSpectate = await this.requestSpectateRoom(room);

    if (isSpectate) {
      this.onCloseSpectateDialog();
      // 儲存遊戲類型
      this.$$store.commit('setRoomGameType', HeroJ7GameType.BrickBreaker);
      // 設定使用者參賽類型
      this.$$store.commit('setRoomMemberType', MemberType.Spectator);
      this.$router.push(`/${MenuName.RoomGame}`);
    }
    // 等待
    else {
      // 第一次
      if (this.intervalId === 0) {
        dayjs.extend(duration);
        this.isShowSpectateDialog = true;

        // 每5秒發送API確認是否有參加者
        this.intervalId = setInterval(() => {
          this.onClickSpectateRoom(room);
        }, this.waitSpectateInterval);
      }
    }
  }

  /** 前往房間編輯
   *  @param room
   */
  private onClickRoomEdit(room: RoomListData): void {
    this.$router.push({
      path: `${this.$route.fullPath}/${MenuName.RoomEdit}/${room.contestId}/${room.contestRoomId}`,
    });
  }

  /** 前往再開一局
   *  @param room
   */
  private onClickNewGame(room: RoomListData): void {
    this.$router.push({
      path: `${this.$route.fullPath}/${MenuName.RoomCreate}/${room.contestId}/${room.contestRoomId}`,
    });
  }

  /** 關閉等待觀戰彈窗 */
  private onCloseSpectateDialog(): void {
    // 清除計時器
    clearInterval(this.intervalId);
    this.intervalId = 0;
    this.isShowSpectateDialog = false;
  }

  /** 頁籤換頁
   *  @param pageIndex
   */
  @Emit('onSwitchRoomPage')
  private onSwitchRoomPage(pageIndex: number): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  width: 1100px;
}
::v-deep .el-dialog__header {
  padding: 0px;
}
::v-deep .el-dialog__footer {
  height: 70px;
  padding-bottom: 10px;
}
</style>
