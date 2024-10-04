<template>
  <div class="!overflow-hidden">
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <!-- 可滾動區域 -->
    <div
      class="w-full fixed items-center overflow-y-scroll h-[calc(100vh-16.5rem)] <sm:h-[calc(100vh-10.5rem)] scroll-smooth no-scrollbar"
      m="x-auto"
    >
      <!-- 加入賽事按鈕 -->
      <button
        class="w-377 h-46.5 max-w-[90%] flex items-center justify-center <sm:h-15"
        m="x-auto"
        bg="center contain no-repeat"
        :style="{ backgroundImage: `url(${imgData.roomContestBtn})` }"
        @click="isRoomEntranceVisible = true"
      >
        <img :src="imgData.roomContestText" class="<sm:w-45" />
      </button>
      <!-- 賽事通知 -->
      <div class="w-full h-157 shadow-default" p="t-4 b-3" bg="[#F9F8F4]" text="lg [#878787]">
        <!-- 標題 -->
        <span text="4xl [#D69F05]" font="bold"> {{ textData.contestNotice }}</span>
        <!-- 有通知時 -->
        <div v-if="hasNoticeList" class="w-[55%] h-full <xl:w-[80%] <sm:w-[95%] noticeList_rwd" m="x-auto t-7.5">
          <!-- 列表標題 -->
          <div
            class="grid grid-cols-[2fr,2fr,1fr,1fr,2fr] justify-items-center <xl:w-[80%] <sm:w-[95%]"
            m="r-7.5 <xl:x-auto"
            p="x-8 <sm:0"
          >
            <span>{{ textData.contestName }}</span>
            <span>{{ textData.contestStartAt }}</span>
            <span>{{ textData.constestID }}</span>
            <span>{{ textData.contestState }}</span>
          </div>
          <!-- 通知列表 -->
          <div class="h-[80%] overflow-auto scrollbar <xl:w-[80%] <sm:w-[95%]" m="<xl:x-auto">
            <div
              class="grid grid-cols-[2fr,2fr,1fr,1fr,2fr] justify-items-center items-center rounded-xl"
              m="t-2 r-5"
              p="x-8 y-5 <sm:0"
              border="1px solid [#828282]"
              v-for="(data, index) of contestNoticeList"
              :key="index"
            >
              <!-- 賽事名稱 -->
              <span class="w-full truncate">{{ data.roomName }}</span>
              <!-- 開始時間 -->
              <span class="w-full truncate">{{ formatTime(data.startAt) }}</span>
              <!-- 賽事ID -->
              <span>{{ data.contestRoomId }}</span>
              <!-- 賽事狀態 -->
              <span text="2xl [#00CCCE] <sm:lg" font="bold">{{ getRoomStateName(data) }}</span>
              <!-- 加入按鈕 -->
              <button
                class="flex items-center rounded-3xl shadow-default"
                p="x-12.5 y-2 <sm:x-2 y-1"
                text="18px [#FFFFFF]"
                bg="[#47D800]"
                border="2px solid [#FFFFFF]"
                @click="goToContest(data)"
              >
                <img :src="imgData.rightArrow" class="w-6 <sm:hidden" m="r-1" />
                <span
                  v-if="
                    getRoomState(data) === RoomStateType.GameStarted || getRoomState(data) === RoomStateType.NotStarted
                  "
                >
                  {{ textData.joinContest }}
                </span>
              </button>
            </div>
          </div>
        </div>
        <!-- 未有通知時 -->
        <p v-else m="t-20" text="4xl [#878787]" font="bold">
          {{ textData.noContestHint01 }}<br />{{ textData.noContestHint02 }}
        </p>
      </div>
      <!-- 使用者參與度 -->
      <div class="w-full flex flex-col items-center shadow-default">
        <!-- 標題 -->
        <span text="4xl [#D69F05]" font="bold" m="t-7.5"> {{ textData.userJoin }}</span>
        <!-- 方框 -->
        <div
          class="w-[50%] grid grid-cols-[1fr,6fr,1fr] rounded-xl <sm:w-[95%] userJoin_rwd"
          m="t-5 b-10"
          p="t-5 b-1 <sm:t-3"
          border="1px solid [#7A7A7A]"
        >
          <!-- 圖片 -->
          <img :src="imgData.catSnowIcon" class="w-26 justify-self-end self-center" />
          <!-- 文字內容 -->
          <div class="grid grid-rows-2" text="[#878787]">
            <span text="28px <sm:22px">
              {{ textData.teacherCreateContestCount }}
              <span text="[#14DAE9]">{{ contestCount }}</span>
              {{ textData.contestUnit }}/{{ textData.userJoinContestTotalCount }}
              <span text="[#14DAE9]">{{ userCount }}</span>
              {{ textData.userUnit }}
            </span>
            <span text="22px <sm:16px">{{ textData.contestCountTip }}</span>
          </div>
        </div>
      </div>
      <!-- 校園賽事參加說明 -->
      <div
        class="w-full flex flex-col items-center shadow-default"
        bg="[#F9F8F4]"
        :class="isCanCreate ? 'mb-35 <sm:mb-11' : ''"
      >
        <!-- 標題 -->
        <span text="4xl [#D69F05]" font="bold" m="t-6"> {{ textData.roomContestExplainTitle }}</span>
        <!-- 說明圖片 -->
        <img :src="imgData.roomContestExplain" class="w-245 shadow-default" m="t-6" border="12px solid [#FFFFFF]" />
        <!-- 說明內容 -->
        <div
          class="relative rounded-xl shadow-default"
          p="y-8 l-20 r-15"
          m="t-10"
          bg="[#FFFFFF]"
          text="3xl [#A5A5A5] left  <sm:xl"
        >
          <!-- ICON -->
          <img :src="imgData.dogIcon" class="absolute w-15.5 aspect-square left-3 -top-5 transform -rotate-10" />
          {{ textData.roomContestExplaint01 }}<br />
          {{ textData.roomContestExplaint02 }}<br />
          {{ textData.roomContestExplaint03 }}<br />
          {{ textData.roomContestExplaint04 }}
        </div>
        <!-- 前往觀看玩法按鈕 -->
        <button
          class="flex items-center rounded-[30px] shadow-default yellowGradient"
          m="t-10 b-14"
          p="x-75 <sm:x-10"
          text="20px [#FFFFFF]"
          @click="onGoBrickBreakerExplain"
        >
          <img :src="imgData.noticeIcon" class="w-13.5 aspect-square" />
          {{ textData.goToBrickBreakerHowToPlay }}
        </button>
      </div>
      <!-- 底部按鈕 -->
      <div v-if="isCanCreate" class="w-full h-35 flex items-center justify-center fixed bottom-0" bg="[#000000CC]">
        <!-- 前往教師賽事管理 -->
        <button
          class="rounded-[30px] shadow-default from-[#15CE00] to-[#2FF994]"
          p="x-9 y-3"
          bg="gradient-to-t"
          text="xl [#FFFFFF]"
          @click="onGoTeacherContestManage"
        >
          {{ textData.goToTeacherContestManage }}
        </button>
        <!-- 新手開賽教學引導 -->
        <button class="rounded-[30px] shadow-default blueGradient" m="l-5" p="x-9 y-3" text="xl [#FFFFFF]">
          <a href="./SchoolContest_Tutorial.pdf" target="_blank">{{ textData.createGameTutorial }}</a>
        </button>
      </div>
    </div>
    <!-- 賽局入口 -->
    <RoomEntrance v-model="isRoomEntranceVisible" />
    <!-- 加入賽局 -->
    <RoomDialog v-model="isShowRoomDialog" :roomID="roomID" :roomPassword="roomPassword" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import RoomEntrance from './RoomEntrance.vue';
import { ResponseState, RoomStateType, RoomStateName, UserRole } from '@/helper/enum/Common';
import { MenuName } from '@/helper/enum/MenuName';
import { contestRoomInviteListAPI, contestRoomOverviewAPI } from '@/api/contest';
import { handleAPIError } from '@/helper/fnc/common';
import { Message } from '@/helper/class/Common';
import { ContestInvitationData } from '@/helper/interface/Contest';
import { isNotYet, toDayjs } from '@/manager/TimeSyncManager';
import RoomDialog from './RoomDialog.vue';

@Component({
  components: {
    GeneralBanner,
    RoomEntrance,
    RoomDialog,
  },
})
export default class RoomContest extends Vue {
  /** 可以創賽事的權限 */
  private readonly createAuthority: UserRole[] = [UserRole.SUP, UserRole.TCH, UserRole.PPL, UserRole.AGT];
  /** 密碼輸入彈窗開關 */
  private isRoomEntranceVisible: boolean = false;
  /** 賽局加入訊息開關 */
  private isShowRoomDialog: boolean = false;
  /** 教師開場總次數 */
  private contestCount: number = 0;
  /** 使用者參與總人次 */
  private userCount: number = 0;
  /** 賽事通知列表 */
  private contestNoticeList: ContestInvitationData[] = [];
  /** 賽事ID */
  private roomID: string = '';
  /** 賽事密碼 */
  private roomPassword: string = '';
  /** 使用者權限 */
  private UserRole = UserRole;
  /** 賽事狀態 */
  private RoomStateType = RoomStateType;

  /** 圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
    roomContestBtn: imgPath.roomContestBtn,
    roomContestText: imgPath.roomContestText,
    rightArrow: imgPath.rightArrow,
    catSnowIcon: imgPath.catSnowIcon,
    roomContestExplain: imgPath.roomContestExplain,
    dogIcon: imgPath.dogIcon,
    noticeIcon: imgPath.noticeUrl,
  };
  /** 文字資料 */
  private textData = {
    title: '校園賽事',
    contestNotice: '賽事通知',
    contestName: '賽局名稱',
    contestStartAt: '開始時間',
    constestID: '賽局ID',
    contestState: '賽局狀態',
    joinContest: '加入',
    noContestHint01: '目前沒有老師創賽局唷！',
    noContestHint02: '快去找老師開賽吧！',
    userJoin: '使用者參與度',
    teacherCreateContestCount: '教師開賽總場次',
    contestUnit: '場',
    userJoinContestTotalCount: '使用者總參與人次',
    userUnit: '人',
    contestCountTip: '*Tip：數據計算每週更新一回，以持續累積次數呈現',
    roomContestExplainTitle: '校園賽事參加說明',
    roomContestExplaint01: '想要加入老師創立的班級賽事，記得向創立競賽的老師，',
    roomContestExplaint02: '索取賽事的編號及密碼唷，點擊下方加入校園賽事按鈕後，',
    roomContestExplaint03: '會轉跳至輸入賽事編號及密碼的頁面，',
    roomContestExplaint04: '正確輸入才能順利進入老師開立的專屬競賽唷！',
    goToBrickBreakerHowToPlay: '前往觀看敲敲答答玩法',
    goToTeacherContestManage: '前往教師賽事管理',
    createGameTutorial: '新手開賽教學引導',
  };

  /** 可以創賽事 */
  private get isCanCreate(): boolean {
    return this.createAuthority.includes(this.$$store.getters.userAuthority);
  }

  /** 是否有通知列表 */
  private get hasNoticeList(): boolean {
    return this.contestNoticeList.length > 0;
  }

  created() {
    this.getRoomContestNotice();
    this.getRoomContestRecord();
  }

  /** 取得賽事通知列表 */
  private async getRoomContestNotice(): Promise<void> {
    try {
      // API撈取賽事通知
      const response: any = await contestRoomInviteListAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 塞資料
      this.contestNoticeList = response.inviteList as ContestInvitationData[];
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得賽局紀錄 */
  private async getRoomContestRecord(): Promise<void> {
    try {
      // API撈取賽事開賽場次與人次
      const response: any = await contestRoomOverviewAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 塞資料
      this.contestCount = response.totalRoom as number;
      this.userCount = response.totalRoomUser as number;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 轉換時間格式 */
  private formatTime(time: string): string {
    return toDayjs(time).format('YYYY-MM-DD HH:mm');
  }

  /** 取得房間狀態
   * @param room
   */
  private getRoomState(room: ContestInvitationData): RoomStateType {
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
  private getRoomStateName(room: ContestInvitationData): string {
    const roomState = this.getRoomState(room);
    const nameKey = RoomStateType[roomState];
    return Object.entries(RoomStateName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤類別';
  }

  /** 加入賽事
   * @param contestData 賽事資料
   */
  private goToContest(contestData: ContestInvitationData): void {
    this.roomID = contestData.contestRoomId.toString();
    this.roomPassword = contestData.roomPassword.toString();
    this.isShowRoomDialog = true;
  }

  /** 跳轉到敲敲答答說明 */
  private onGoBrickBreakerExplain(): void {
    this.$router.push(`/${MenuName.BrickBreakerGuide}`);
  }

  /** 跳轉到教師賽事管理 */
  private onGoTeacherContestManage(): void {
    this.$router.push(`/${MenuName.TeacherAdmin}/${MenuName.Contest}`);
  }
}
</script>
<style lang="scss">
.el-dialog.RoomDialog {
  margin-top: 20vh !important;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
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
@media (max-width: 1024px) {
  .noticeList_rwd {
    width: 95%;
  }
  .userJoin_rwd {
    width: 95%;
  }
}
</style>
