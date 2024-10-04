<template>
  <div class="relative">
    <div
      v-if="isInRoom"
      class="w-208px flex items-center absolute left-[45%] -top-[50%] z-30 animate-bounce"
      :style="{ backgroundImage: `url(${imgData.greenFrame})` }"
      bg="no-repeat"
      text="24px [#FFFFFF]"
    >
      <img :src="imgData.noticeIcon" />{{ textData.inContest }}
    </div>
    <div
      class="w-7/10 <lg:w-[95%] cursor-pointer bg-contain bg-no-repeat transition"
      m="b-5 x-auto"
      :class="{ 'cursor-not-allowed': isPlayable === false }"
      :style="{
        backgroundImage: isPlayable ? `url(${imgData.playableBG})` : `url(${imgData.unplayableBG})`,
        'background-position': 'center',
      }"
      @click="onClickPlay"
    >
      <div p="y-2 <xl:b-1 <sm:(t-1 b-0)" class="flex items-end justify-center">
        <!-- "我要挑戰"圖片 -->
        <img :src="imgData.playBtnText" class="w-106 <xl:w-60 <sm:w-30" />
        <!-- 可遊玩時間區間 -->
        <span v-if="openTimeText" class="font-bold" p="l-2" text="2xl <sm:sm">{{ openTimeText }}</span>
      </div>
      <div class="w-11/12 flex items-center justify-center" m="x-auto b-2" p="t-2 b-6 <xl:(t-0 b-2)">
        <span text="white xl <xl:lg <sm:sm">
          <!-- 總挑戰次數 -->
          {{ textData.challengeCountTitle }}
          <span text="[#ffde39]">{{ playableCount }}</span>
          <!-- 今日剩餘挑戰次數 -->
          <span m="l-5">
            {{ textData.dailyCountTitle }}
            <span text="[#ffde39]">{{ dailyPlayableCount }}</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { ContestListData, OpenPeriodInfo, ContestPlayerRecord, GameDetail } from '../../../helper/interface/Contest';
import ImgPath from '@/config/imgPath/imgPath';
import { Message } from '@/helper/class/Common';
import { ResponseState, TeamType } from '@/helper/enum/Common';
import { officialContestRoomUserCheckAPI } from '@/api/contest';
import { handleAPIError } from '@/helper/fnc/common';
import { syncDayjs } from '../../../manager/TimeSyncManager';

@Component({})
export default class DareInfo extends Vue {
  /** 賽事資料 */
  @Prop() private contestListData!: ContestListData;
  /** 已遊玩紀錄 */
  @Prop() private contestPlayerRecord!: ContestPlayerRecord;

  /** 是否有曾加入且進行中的房間 */
  private isInRoom: boolean = false;

  async mounted() {
    if (this.contestListData.teamType !== TeamType.Room || !this.isTimePlayable) {
      return;
    }
    // 官方房間賽取得是否存在房間身分
    this.isInRoom = await this.getRoomUserCheck();
  }

  /** 是否可遊玩 */
  public get isPlayable(): boolean {
    // 有房間身分可重新加入
    if (this.isInRoom) {
      return true;
    }
    // 已達到總遊玩次數上限
    const limitRound = Number(this.gameDetail.limitRound);
    if (limitRound !== -1 && this.contestPlayerRecord.playedCount >= limitRound) {
      return false;
    }

    // 已達到今日可遊玩上限
    if (
      this.gameDetail.dailyLimitRound !== -1 &&
      this.contestPlayerRecord.todayPlayed >= this.gameDetail.dailyLimitRound
    ) {
      return false;
    }

    // 檢查可遊玩時段
    if (this.isTimePlayable === false) {
      return false;
    }

    // 可遊玩
    return true;
  }

  /** 時段可遊玩 */
  private get isTimePlayable(): boolean {
    // 取得今天開放時間清單
    const openPeriodInfo = this.todayOpenPeriodInfo;

    // 全天開放
    if (openPeriodInfo == null) {
      return true;
    }

    // 全天不開放
    if (openPeriodInfo.length === 0) {
      return false;
    }

    // 取得當下開放時間
    const openPeriod = this.getNowOpenPeriod(openPeriodInfo);

    // 找不到可遊玩時段, 超過最後可遊玩時段
    if (openPeriod === undefined) {
      return false;
    }

    // 尚未達到可遊玩開始時間
    if (this.isPlayableOpenPeriod(openPeriod) === false) {
      return false;
    }

    // 可遊玩時段內
    return true;
  }

  /** 可遊玩總次數 */
  private get playableCount(): string {
    // 無上限
    if (Number(this.gameDetail.limitRound) === -1) {
      return '無上限';
    }

    // 總遊玩次數
    const playedCount = Math.min(this.contestPlayerRecord.playedCount, this.gameDetail.limitRound);

    // 顯示總遊玩次數
    return `${playedCount}/${this.gameDetail.limitRound}`;
  }

  /** 今日剩餘可遊玩次數 */
  private get dailyPlayableCount(): string {
    // 無上限
    if (this.gameDetail.dailyLimitRound === -1) {
      return '無上限';
    }

    // 每日遊玩上限
    const dailyLimit = this.gameDetail.dailyLimitRound;

    // 今日剩餘可遊玩次數
    const dailyRemainCount = dailyLimit - this.contestPlayerRecord.todayPlayed;
    // 已達今日可遊玩次數上限
    if (dailyRemainCount <= 0) {
      return '0';
    }

    // 總次數無限計算每日遊玩次數
    if (this.gameDetail.limitRound === -1) {
      return dailyRemainCount.toString();
    }

    // 總剩餘可遊玩次數
    const remainCount = this.gameDetail.limitRound - this.contestPlayerRecord.playedCount;

    // 已達總遊玩次數上限
    if (remainCount <= 0) {
      return '0';
    }

    // 返回剩餘可遊玩次數
    return Math.min(dailyRemainCount, remainCount).toString();
  }

  /** 取得遊戲限制 */
  private get gameDetail(): GameDetail {
    return JSON.parse(this.contestListData.gameDetail.toString());
  }

  /** 開放時間 */
  private get openTimeText(): string {
    // 取得今天開放時間清單
    const openPeriodInfo = this.todayOpenPeriodInfo;

    // 全天開放
    if (openPeriodInfo == null) {
      return '整日開放';
    }

    // 全天不開放
    if (openPeriodInfo.length === 0) {
      return '今日不開放!';
    }

    // 取得當下開放時間
    const openPeriod = this.getNowOpenPeriod(openPeriodInfo);

    // 找不到可遊玩時段
    if (openPeriod === undefined) {
      return '今日遊玩時段已結束';
    }

    // 可遊玩時段文字
    const openPeriodText = `${openPeriod.start}~${openPeriod.end}`;

    // 顯示當下可遊玩時段
    if (this.isPlayableOpenPeriod(openPeriod)) {
      return `今日可遊玩時段: ${openPeriodText}`;
    }

    // 還未達到可遊玩時段
    return `下次可遊玩時段: ${openPeriodText}`;
  }

  /** 取得當下開放時段 */
  private get todayOpenPeriodInfo(): OpenPeriodInfo[] | null {
    // 取得其他限制資料
    const otherLimitData = JSON.parse(this.contestListData.otherLimit.toString());

    // 沒有其他限制
    if (otherLimitData == null || otherLimitData.gamePeriod == null) {
      return null;
    }

    // 取得今天星期幾 (0 = 星期天)
    const dayIndex = syncDayjs().day();

    // 取得今天開放時間
    return otherLimitData.gamePeriod[dayIndex];
  }

  /** 取得當下時間數值 */
  private get currentTime(): number {
    return syncDayjs().hour() * 100 + syncDayjs().minute();
  }

  /** 圖片資料 */
  private imgData = {
    /** 背景圖(可遊玩時) */
    playableBG: ImgPath.contestPlayableBtnUrl,
    /** 背景圖(不可遊玩時) */
    unplayableBG: ImgPath.contestUnplayableBtnUrl,
    /** 背景圖(不可遊玩時) */
    playBtnText: ImgPath.contestPlayBtnTextUrl,
    noticeIcon: ImgPath.noticeUrl,
    greenFrame: ImgPath.greenFrame,
  };

  /** 文字資料 */
  private textData = {
    challengeTitle: '我要挑戰!',
    immediateRankTitle: '進入即時排行榜',
    limitPlayTitle: '挑戰縣市/年級資格不符合',
    challengeCountTitle: '總挑戰次數:',
    dailyCountTitle: '今日剩餘挑戰次數:',
    inContest: '比賽參加中',
  };

  /** 取得賽事房間用戶身分是否已存在 */
  private async getRoomUserCheck(): Promise<boolean> {
    // 組成封包
    const data = { contestId: this.contestListData.id };
    try {
      // API 房間用戶身分是否已存在
      const response: any = await officialContestRoomUserCheckAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return response.isExist;
    } catch (e) {
      console.error(`${e}`);
      return false;
    }
  }

  /** 取得當下的可遊玩時間
   * @param openPeriodInfo
   */
  private getNowOpenPeriod(openPeriodInfo: OpenPeriodInfo[]): OpenPeriodInfo | undefined {
    // 找到當前時間對應的可遊玩時段
    return openPeriodInfo.find((openPeriod) => {
      return this.dateToValue(openPeriod.end) > this.currentTime;
    });
  }

  /** 是否為可遊玩時段
   * @param openPeriod
   */
  private isPlayableOpenPeriod(openPeriod: OpenPeriodInfo): boolean {
    // 取得當下時間數值
    return this.dateToValue(openPeriod.start) <= this.currentTime;
  }

  /** 時間轉換成數字
   * @param timeString
   */
  private dateToValue(timeString: string): number {
    return Number(timeString.replace(':', ''));
  }

  /** 點擊遊玩 */
  private onClickPlay(): void {
    // 無法遊玩
    if (this.isPlayable === false) {
      Message.warn('目前無法遊玩!');
      return;
    }

    // 呼叫遊玩
    this.onPlay();
  }

  /** 點擊遊玩 */
  @Emit('onPlay')
  private onPlay(): void {
    return;
  }
}
</script>
