<template>
  <div class="w-full">
    <el-dialog :visible.sync="isDialogVisible" :destroy-on-close="true" :before-close="onCloseDialog" top="0vh">
      <!-- 標題 -->
      <div slot="title" class="flex justify-center items-center" text="4xl [#666666]">
        {{ textData.dialogTitle }}
      </div>
      <div class="h-150 <sm:h-auto" m="x-auto" text="lg [#666666]">
        <!-- 列表 -->
        <template v-if="isContent === false">
          <!-- 上方功能列 -->
          <div class="flex items-center justify-between" border="t-1px b-1px solid [#CCCCCC]" p="y-2.5">
            <!-- 篩選 -->
            <el-tooltip
              placement="bottom"
              effect="light"
              p="x-5 y-2"
              popper-class="NoticeDialog"
              :visible-arrow="false"
            >
              <button class="flex items-center rounded-[30px]" border="2px solid [#CCCCCC]">
                <img :src="imgData.filterIcon" />
                <p text="24px [#919191]" m="x-9">
                  {{ filterName }}
                </p>
              </button>
              <div slot="content">
                <ul>
                  <li v-for="(value, key, index) in NoticeStringState" :key="index">
                    <button class="w-40" text="left lg [#666666]" bg="hover:[#F3EDD5]" @click="filterNotice(index)">
                      {{ value }}
                    </button>
                  </li>
                </ul>
              </div>
            </el-tooltip>
            <!-- 一鍵領取 -->
            <button
              class="flex items-center justify-center rounded-[30px] shadow-default"
              :cursor="isRunningReceiveAllReward ? 'wait' : 'pointer'"
              :disabled="noticeFilterList.length === 0"
              p="x-2"
              border="2px solid [#FFFFFF]"
              :bg="noticeFilterList.length === 0 ? '[#47D80080]' : '[#47D800]'"
              @click="oneClickReceiveAllReward"
            >
              <img :src="imgData.downloadIcon" />
              <p text="lg [#FFFFFF]">{{ textData.receiveAll }}</p>
            </button>
          </div>
          <!-- 有通知 -->
          <template v-if="noticeFilterList.length !== 0">
            <!-- 通知數 -->
            <span class="flex justify-end" m="y-3" text="xl [#919191]">
              {{ textData.noticeCount }}{{ noticeReadCount }}
            </span>
            <!-- 通知列表 -->
            <div
              v-for="(notice, index) in noticeFilterList"
              :key="index"
              class="grid grid-cols-[22px,42px,4fr,1fr,22px] items-center rounded-lg cursor-pointer <sm:(grid-cols-[22px,42px,4fr,22px])"
              :class="notice.isRead ? 'isRead_shadow' : 'noRead_shadow'"
              m="b-3"
              p="x-2 y-3"
              :border="notice.isRead ? '1px solid [#E1D6AC]' : '1px solid [#CCCCCC]'"
              text="2xl [#BEAE73]"
              :bg="notice.isRead ? '[#F8F4E7]' : ''"
              @click="onOpenNotice(notice)"
            >
              <img :src="notice.rewardStatus === RewardStatus.Unreceive ? imgData.redNotice : ''" />
              <img :src="notice.isRead ? imgData.mailOpen : imgData.mail" />
              <span class="truncate" p="l-6 <sm:l-1" text="left">{{ notice.title }}</span>
              <span class="<sm:(row-start-2 col-start-3)" p="r-2 <sm:l-1" text="right <sm:left">
                {{ notice.sendAt }}
              </span>
              <img
                class="<sm:(row-start-1 col-start-4)"
                :src="canDeleteNotice(notice) ? imgData.trashbox : ''"
                @click.stop="onDeleteNotice(notice)"
              />
            </div>
          </template>
          <!-- 無通知 -->
          <template v-else>
            <div class="h-full flex justify-center items-center" text="2xl">{{ textData.noNotice }}</div>
          </template>
        </template>
        <!-- 內文 -->
        <template v-else>
          <div
            class="grid grid-cols-[0.9fr,4fr,0.9fr] gap-x-2 <sm:(grid-cols-[0.5fr,1fr])"
            text="2xl [#BEAE73]"
            border="t-1px b-1px solid [#CCCCCC]"
            p="y-2.5"
          >
            <!-- 返回 -->
            <button
              class="grid grid-cols-[1fr,3fr] items-center rounded-[30px] shadow-default"
              p="x-2"
              border="2px solid [#FFFFFF]"
              bg="[#FF5875]"
              @click="onCloseNotice"
            >
              <img :src="imgData.doubleArrow" class="w-5 transform rotate-180" />
              <p text="lg [#FFFFFF]">{{ textData.returnText }}</p>
            </button>
            <!-- 標題 -->
            <span class="truncate <sm:col-span-2" text="<sm:left">{{ currentNotice.title }}</span>
            <!-- 日期 -->
            <span class="<sm:(row-start-1 col-start-2)">{{ currentNotice.sendAt }}</span>
          </div>
          <!-- 信件內容 -->
          <div class="h-90 overflow-auto scrollbar" m="y-3" p="r-2" text="left 2xl [#666666]">
            <!-- 寄件者 -->
            <span>{{ `From ${currentNotice.fromName}` }}</span>
            <br />
            <br />
            <!-- 內文 -->
            <span class="whitespace-pre-line" m="y-3">{{ currentNotice.content }}</span>
            <br />
            <br />
            <!-- 獎勵列表 -->
            <ul v-if="currentNotice.rewardStatus !== RewardStatus.NoItem">
              <li>{{ textData.getReward }}</li>
              <li v-for="(reward, index) in currentNotice.reward" :key="index">
                {{ `${getItemName(reward)} x${reward.count}` }}
              </li>
            </ul>
          </div>
          <!-- 有獎勵 -->
          <template v-if="currentNotice.rewardStatus !== RewardStatus.NoItem">
            <!-- 獲得獎勵 -->
            <span class="flex">
              <img :src="imgData.yellowStar" class="w-5.5 aspect-square" m="l-3.5" />
              <p text="2xl [#BEAE73]" m="l-1">{{ textData.getReward }}</p>
            </span>
            <!-- 獎勵內容 -->
            <div
              class="grid grid-cols-[5fr,1fr] items-center rounded-[10px] relative <sm:(grid-cols-[5fr,3fr])"
              p="x-5"
              border="1px solid [#707070]"
            >
              <!-- 獎勵物品 -->
              <RewardListComponent :rewardList="currentNotice.reward" m="y-3" />
              <!-- 已領取 -->
              <template v-if="currentNotice.rewardStatus === RewardStatus.Received">
                <div class="w-full h-full rounded-[10px] absolute" bg="[#00000080]" />
                <span class="z-1" text="xl [#FFFFFF]">{{ textData.alreadyReceive }}</span>
              </template>
              <!-- 未領取 -->
              <template v-if="currentNotice.rewardStatus === RewardStatus.Unreceive">
                <!-- 領取獎勵 -->
                <button
                  class="h-8 flex items-center rounded-[30px] shadow-default"
                  p="x-3 y-1"
                  m="l-2"
                  bg="[#18CB18]"
                  @click="onClickReceiveReward(currentNotice)"
                >
                  <img :src="imgData.rewardIcon" class="w-5 aspect-square" m="r-2" />
                  <p text="base [#FFFFFF]">{{ textData.receiveReward }}</p>
                </button>
              </template>
            </div>
          </template>
          <!-- 倒數計時 -->
          <template v-if="currentNotice.customId === NoticeType.RoomInvitation">
            <div
              class="relative flex items-center justify-between rounded-[10px] <sm:inline-block"
              p="x-4 y-7.5"
              border="1px solid [#707070]"
            >
              <!-- 時間和提示字 -->
              <div class="grid grid-rows-2 justify-items-start">
                <p text="2xl [#666666]">
                  {{ textData.startCountDown }}<span text="[#19C0C1]"> {{ displayTime }}</span>
                </p>
                <span text="base [#FF5875]">{{ textData.gameHint }}</span>
              </div>
              <!-- 加入按鈕 -->
              <button
                class="flex items-center rounded-3xl shadow-default"
                p="x-4 y-2"
                text="xl [#FFFFFF]"
                :disabled="roomGameState !== NoticeRoomGameState.JoinGame"
                :bg="
                  roomGameState === NoticeRoomGameState.WaitToJoin ? '[#47D800] opacity-50' : '[#47D800] opacity-100'
                "
                border="2px solid [#FFFFFF]"
                @click="isShowRoomDialog = true"
              >
                <img :src="imgData.rightArrow" class="w-6" m="r-1" />
                <span v-if="roomGameState === NoticeRoomGameState.WaitToJoin">{{ textData.waitToJoin }}</span>
                <span v-else>{{ textData.joinToGame }}</span>
              </button>
              <!-- 結束時的遮罩 -->
              <div
                v-if="roomGameState === NoticeRoomGameState.GameFinish"
                class="absolute w-full h-full top-0 right-0 flex items-center justify-center rounded-[10px]"
                bg="[#000000] opacity-50"
                text="xl [#FFFFFF]"
              >
                {{ textData.gameFinished }}
              </div>
            </div>
          </template>
        </template>
      </div>
      <!-- 底部按鈕 -->
      <div slot="footer" v-if="isContent === false" class="flex justify-center">
        <!-- 頁碼 -->
        <el-pagination
          class="justify-self-center"
          text="![#878787]"
          layout="prev, pager, next"
          hideOnSinglePage
          :currentPage.sync="currentPage"
          :pageCount="totalPage"
        >
        </el-pagination>
      </div>
    </el-dialog>
    <!-- 獎勵彈窗 -->
    <template v-if="isOpenRewardDialog">
      <RewardDialog v-model="isOpenRewardDialog" :rewardItemList="showRewardList" />
    </template>
    <!-- 加入賽局 -->
    <RoomDialog
      v-model="isShowRoomDialog"
      :roomID="roomID"
      :roomPassword="roomPassword"
      @joinToRoomGame="onCloseDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, ModelSync, Vue, Watch } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { Message } from '@/helper/class/Common';
import { mailDelAPI, mailGetItemAPI, mailInBoxAPI, mailPackageIdListAPI, mailReadAPI } from '@/api/notice';
import { ContestGameAward } from '@/helper/interface/Contest';
import { NoticeContent, NoticeData, RoomGameInfo } from '@/helper/interface/Notice';
import { NoticeRoomGameState, NoticeState, NoticeStringState, NoticeType, RewardStatus } from '@/helper/enum/Notice';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import RewardManager from '@/manager/RewardManager';
import RewardDialog from './RewardDialog.vue';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import RewardListComponent from './RewardListComponent.vue';
import { toDayjs } from '../../manager/TimeSyncManager';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import RoomDialog from '@/views/WorldContest/RoomDialog.vue';

@Component({
  components: {
    RewardDialog,
    RewardListComponent,
    RoomDialog,
  },
})
export default class NoticeDialog extends Vue {
  /**此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 每頁顯示通知數量(改動 UI 可能需要調整) */
  private readonly pageSize: number = 6;
  /** 使用者目前看到的頁數 */
  private currentPage: number = 1;
  /** 總共幾頁 */
  private totalPage: number = 0;
  /** 現在篩選狀態 */
  private currentNoticeState: NoticeState = NoticeState.All;
  /** 篩選完的通知列表 */
  private noticeFilterList: NoticeData[] = [];
  /** 現在看的通知 */
  private currentNotice: NoticeContent = {} as NoticeContent;
  /** 是否顯示信件內容 */
  private isContent: boolean = false;
  /** 是否開啟領獎彈窗 */
  private isOpenRewardDialog: boolean = false;
  /** 顯示領獎列表 */
  private showRewardList: ContestGameAward[] = [];
  /** 是否正在使用一鍵領取 */
  private isRunningReceiveAllReward: boolean = false;
  /** 賽局編號 */
  private roomID: string = '';
  /** 賽局密碼 */
  private roomPassword: string = '';
  /** 倒數計時器代號 */
  private intervalId: number = 0;
  /** 賽局開始時間 */
  private timeStartAt: string = '';
  /** 顯示倒數時間 */
  private displayTime: string = '';
  /** 是否顯示賽事資訊 */
  private isShowRoomDialog: boolean = false;
  /** 賽局狀態 */
  private roomGameState: NoticeRoomGameState = NoticeRoomGameState.WaitToJoin;

  /** 文字資料 */
  private textData = {
    dialogTitle: '通知',
    receiveAll: '一鍵領取',
    noticeCount: '通知數',
    noNotice: '目前無通知',
    returnText: '返回',
    getReward: '獲得獎勵',
    receiveReward: '領取獎勵',
    alreadyReceive: '獎勵已領取',
    startCountDown: '開賽時間倒數',
    gameHint: '進入開賽時間後，才能正式加入賽局唷！',
    waitToJoin: '尚未可以加入',
    joinToGame: '點我加入',
    gameFinished: '比賽已結束',
  };

  /** 圖片資料 */
  private imgData = {
    filterIcon: imgPath.filterIcon,
    downloadIcon: imgPath.downloadIcon,
    redNotice: imgPath.redNotice,
    trashbox: imgPath.trashboxIcon,
    mail: imgPath.mailIcon,
    mailOpen: imgPath.mailOpenIcon,
    doubleArrow: imgPath.arrowTwoIconBaseUrl,
    yellowStar: imgPath.yellowStarIcon,
    rewardIcon: imgPath.rewardIconBaseUrl,
    rightArrow: imgPath.rightArrow,
  };

  /** 通知種類文字型態 */
  private NoticeStringState = NoticeStringState;
  /** 通知獎勵狀態 */
  private RewardStatus = RewardStatus;
  /** 通知的賽局狀態 */
  private NoticeRoomGameState = NoticeRoomGameState;
  /** 通知類型 */
  private NoticeType = NoticeType;

  /** 通知數 */
  private get noticeReadCount(): string {
    return `${(this.currentPage - 1) * this.pageSize + 1}-${
      (this.currentPage - 1) * this.pageSize + this.noticeFilterList.length
    }`;
  }

  /** 顯示目前篩選類型 */
  private get filterName(): string {
    return Object.values(NoticeStringState)[this.currentNoticeState];
  }

  created() {
    // 清除小紅點
    this.$$store.commit('setHasNewNotice', false);
    // 撈出第一次資料
    this.filterNotice(this.currentNoticeState);
  }

  /** 關掉dialog */
  onCloseDialog() {
    // 清除計時器
    this.clearTimer();
    this.isDialogVisible = false;
  }

  /** 更改篩選類型
   *  @param filterType 篩選類型
   */
  private async filterNotice(filterType: NoticeState): Promise<void> {
    this.currentNoticeState = filterType;
    this.currentPage = 1;
    await this.getNoticeList();
  }

  /** 開啟通知內容
   *  @param notice 通知資料
   */
  private async onOpenNotice(notice: NoticeData): Promise<void> {
    // 抓取通知內文
    const result = await this.getNoticeData(notice.mailId);
    if (result === undefined) {
      return;
    }
    this.currentNotice = result;

    // 切換顯示
    this.isContent = true;
    // 更改狀態為已讀
    notice.isRead = true;

    // 判斷通知是否為賽局通知
    if (this.currentNotice.customId === NoticeType.RoomInvitation) {
      try {
        // 轉換型態
        const contestData = JSON.parse(this.currentNotice.refer) as RoomGameInfo;

        // 清除計時器
        this.clearTimer();
        // 判斷賽局是否過期
        if (dayjs(contestData.endAt).diff(dayjs(), 'seconds') < 0) {
          this.roomGameState = NoticeRoomGameState.GameFinish;
          this.displayTime = '已結束';
        }
        // 賽局開始倒數
        else {
          // 取得賽事開始時間和賽事ID跟密碼
          this.roomID = contestData.contestRoomId.toString();
          this.roomPassword = contestData.roomPasswrod;
          this.roomGameState = NoticeRoomGameState.WaitToJoin;
          // 開始倒數
          this.countDownTime(contestData.startAt);
          // 每1秒刷新倒數時間
          this.intervalId = setInterval(() => {
            this.countDownTime(contestData.startAt);
          }, 1000);
        }
      } catch (e) {
        // 取得賽事資訊錯誤
        Message.error(`賽事資訊錯誤 mailID = ${this.currentNotice.mailId}`);
      }
    }
  }

  /** 取得通知內容
   *  @param notice 通知資料
   */
  private async getNoticeData(mailId: number): Promise<NoticeContent | undefined> {
    try {
      // 組成封包
      const data = {
        mailId,
      };

      // API撈取通知內容
      const response: any = await mailReadAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 塞資料
      const mailData = response.mailData as NoticeContent;
      mailData.sendAt = toDayjs(response.mailData.sendAt).format('YYYY/MM/DD');
      return mailData;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 返回時判斷類型做刷新 */
  private async onCloseNotice(): Promise<void> {
    this.isContent = false;
    if (this.currentNoticeState === NoticeState.UnRead || this.currentNoticeState === NoticeState.NoReceived) {
      if (this.totalPage === this.currentPage && this.noticeFilterList.length === 1) {
        this.currentPage = Math.max(this.currentPage - 1, 1);
      }
      await this.getNoticeList();
    }
  }

  /** 刪除通知
   *  @param notice 通知資料
   */
  private async onDeleteNotice(notice: NoticeData): Promise<void> {
    try {
      await this.$msgbox({
        title: '再次確認',
        message: this.$createElement('p', undefined, [
          this.$createElement('span', undefined, '確定將此信件刪除？'),
          this.$createElement('br', undefined, ''),
          this.$createElement('span', { style: 'color : #FF5656' }, ' *若按確定，就無法恢復了！'),
        ]),
        showCancelButton: true,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        confirmButtonClass: 'red-button',
      });

      // 組成封包
      const data = {
        mailId: notice.mailId,
      };

      // API通知SERVER刪除
      const response: any = await mailDelAPI.put(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      if (this.totalPage === this.currentPage && this.noticeFilterList.length === 1) {
        this.currentPage = Math.max(this.currentPage - 1, 1);
      }

      // 重新刷新當前頁數
      await this.getNoticeList();
    } catch (e) {
      // 排除彈窗取消
      if (e === 'cancel') {
        return;
      }
      Message.error(`${e}`);
    }
  }

  /** 一鍵領取 */
  private async oneClickReceiveAllReward(): Promise<void> {
    try {
      // 變更滑鼠樣式為轉圈
      this.isRunningReceiveAllReward = true;

      // API撈取所有通知
      const response: any = await mailPackageIdListAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 所有有獎勵的通知清單
      const mailList = response.mailIdList as number[];

      // 顯示獎勵列表清空
      this.showRewardList.splice(0);

      // 篩選通知資料
      for (const mailId of mailList) {
        const notice = this.noticeFilterList.find((noticeData) => noticeData.mailId === mailId);
        // 現在顯示在列表上的
        if (notice != null) {
          this.showRewardList = this.showRewardList.concat(await this.receiveNoticeReward(notice));
        }
        // 沒有顯示在列表上的
        else {
          this.showRewardList = this.showRewardList.concat(await this.receiveReward(mailId));
        }

        await AsyncHelper.sleep(1);
      }

      // 如果篩選狀態為未領取則刷新
      if (this.currentNoticeState === NoticeState.NoReceived) {
        this.currentPage = 1;
        await this.getNoticeList();
      }

      // 開啟獎勵彈窗
      this.isOpenRewardDialog = true;
    } catch (e) {
      Message.error(`${e}`);
    } finally {
      // 滑鼠樣式回復
      this.isRunningReceiveAllReward = false;
    }
  }

  /** 通知內獎勵領取
   * @param notice 內層通知資料
   */
  private async onClickReceiveReward(notice: NoticeContent): Promise<void> {
    // 找到外層清單的通知資料
    const noticeData = this.noticeFilterList.find((noticeFilterData) => noticeFilterData.mailId === notice.mailId);
    if (noticeData == null) {
      console.error(`onClickReceiveReward no data match mailId = ${notice.mailId}`);
      return;
    }
    // 塞進獎勵列表
    this.showRewardList = await this.receiveNoticeReward(noticeData);
    // 開啟彈窗
    this.isOpenRewardDialog = this.showRewardList.length > 0;
    // 更新內層通知領取獎勵狀態
    notice.rewardStatus = RewardStatus.Received;
  }

  /** 領取獎勵
   * @param notice 外層通知資料
   */
  private async receiveNoticeReward(notice: NoticeData): Promise<ContestGameAward[]> {
    // 塞進獎勵列表
    const rewardList = await this.receiveReward(notice.mailId);
    // 防呆
    if (rewardList.length > 0) {
      notice.rewardStatus = RewardStatus.Received;
    }
    return rewardList;
  }

  /** 獎勵領取
   *  @param mailId 要領取獎勵的通知ID
   */
  private async receiveReward(mailId: number): Promise<ContestGameAward[]> {
    try {
      // 組成封包
      const data = {
        mailId,
      };

      // API撈取所有通知
      const response: any = await mailGetItemAPI.put(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      return response.itemDatas as ContestGameAward[];
    } catch (e) {
      Message.warn(`${e}`);
      return [];
    }
  }

  /** 通知能否被刪除
   *  @param notice 通知資料
   */
  private canDeleteNotice(notice: NoticeData): boolean {
    return notice.isRead && notice.rewardStatus !== RewardStatus.Unreceive;
  }

  /** 抓取道具圖片
   *  @param rewardItem 獎勵道具
   */
  private getItemImg(rewardItem: ContestGameAward): string {
    return RewardManager.getRewardItemImg(rewardItem);
  }

  /** 抓取道具名稱
   *  @param rewardItem 獎勵道具
   */
  private getItemName(rewardItem: ContestGameAward): string {
    return RewardManager.getRewardItemName(rewardItem);
  }

  /** 倒數
   *  @param startAt 開始時間
   */
  private countDownTime(startAt: string): void {
    dayjs.extend(duration);
    // 計算開賽時間與現在時間
    const timeForWait = dayjs(startAt).diff(dayjs(), 'seconds');
    if (timeForWait <= 0) {
      this.clearTimer();
      this.roomGameState = NoticeRoomGameState.JoinGame;
      this.displayTime = '已開賽';
      return;
    }
    // 調整顯示格式
    this.displayTime = dayjs.duration(timeForWait, 'seconds').format('DD天HH:mm:ss');
  }

  /** 清除計時器 */
  private clearTimer(): void {
    clearInterval(this.intervalId);
    this.intervalId = 0;
    this.displayTime = '';
  }

  /** 取得通知列表 */
  @Watch('currentPage')
  private async getNoticeList(): Promise<void> {
    try {
      // 組成封包
      const data = {
        page: this.currentPage - 1,
        pageSize: this.pageSize,
        selectType: this.currentNoticeState,
      };

      // API撈取所有通知
      const response: any = await mailInBoxAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 回傳資料對塞
      this.noticeFilterList = response.results as NoticeData[];
      for (const notice of this.noticeFilterList) {
        notice.sendAt = toDayjs(notice.sendAt).format('YYYY/MM/DD');
      }

      // 計算頁數(無條件進位)
      this.totalPage = Math.ceil(response.total / this.pageSize);
    } catch (e) {
      Message.error(`${e}`);
    }
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 980px;
  width: 95%;
  border-radius: 30px;
  top: 10%;
}
::v-deep .el-dialog__header {
  padding: 20px 0px 16px 0px;
}
::v-deep .el-dialog__headerbtn {
  top: 20px;
}
::v-deep .el-dialog__body {
  padding: 0px 70px 0px 70px;
  min-height: 600px;
}
::v-deep .el-dialog.RoomDialog {
  margin-top: 10vh !important;
}
@media (max-width: 435px) {
  ::v-deep .el-dialog__body {
    padding: 0px 10px 10px 10px;
  }
}

::v-deep .el-icon-close:before {
  font-size: 32px;
  font-weight: 700;
}

::v-deep .el-pager li.active {
  color: #fdc221;
}

.isRead_shadow {
  box-shadow: 0px 4px 0px #e1d6ac;
}

.noRead_shadow {
  box-shadow: 0px 4px 0px #cccccc;
}

.scrollbar::-webkit-scrollbar {
  padding: 0px 0px 10px 0px;
  width: 10px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
<style>
.el-tooltip__popper.is-light.NoticeDialog {
  border: none;
  box-shadow: 0px 3px 6px #00000066;
  margin-top: -0.0125rem;
  border-radius: 10px;
}
</style>
