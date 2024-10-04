<template>
  <div class="game-detail-wrapper">
    <template v-if="contestId > -1">
      <!-- 替換英雄介面 -->
      <ReplaceHero v-model="isShowChangeHero" />
      <!-- 小遊戲輪盤 -->
      <template v-if="isShowGameWheel">
        <GameWheelDialog
          v-model="isShowGameWheel"
          :teamTypeName="teamTypeName"
          :title="contestTitle"
          @onPlay="onGameWheelPlay"
        />
      </template>
      <!-- 獲得排行獎勵視窗 -->
      <template v-if="isShowRankAward">
        <RankAward
          :msgVisible="isShowRankAward"
          :rewardDataList="rewardDataList"
          @onConfirm="isShowRankAward = false"
        />
      </template>
      <!-- 魔王賽事看板 -->
      <div v-if="!isWebGame" class="world-contest-banner" :style="{ backgroundImage: `url(${bossBannerUrl})` }"></div>
      <!-- 賽事狀態-->
      <GameInfo :contestListData="contest" :isBoss="!isWebGame" />
      <!-- 即時排行榜 -->
      <div v-if="isImmediateRank" class="immediate-rank" @click="onClickImmediateRank">
        {{ textData.immediateRankTitle }}
      </div>
      <!-- 賽事介面 -->
      <!-- 挑戰按鈕 -->
      <template v-if="isContestInProgress && contestPlayerRecord">
        <!-- 可遊玩 (身分許可與賽事進行中)-->
        <DareInfo
          v-if="isPlayableRole"
          :contestListData="contest"
          :contestPlayerRecord="contestPlayerRecord"
          @onPlay="onPlay"
        />
        <!-- 不可遊玩 -->
        <div
          v-else
          class="w-7/10 <lg:w-[95%] rounded-3xl cursor-not-allowed"
          m="x-auto b-5"
          p="y-10"
          font="bold"
          text="5xl [#FFF] <sm:3xl"
          bg="[#f25555]"
        >
          {{ textData.limitPlayTitle }}
        </div>
      </template>
      <!-- 前往學習鏈結按鈕 -->
      <template v-if="referDetail">
        <!-- 前往答題遊戲學習鏈結或是其他學習連結 -->
        <div
          m="x-[15%] b-5 <lg:x-[2.5%]"
          class="grid rounded-[15px] grid-cols-[5fr,2fr] items-center <sm:grid-cols-1"
          p="x-8 y-5"
          border="1px solid [#7A7A7A]"
        >
          <div v-if="isWebGame" text="2xl <sm:xl left [#878787]">
            {{ textData.gameInfoFirstPart }}
            <a class="cursor-pointer" target="_blank" text="[#14DAE9]" @click="onClickTeaching">
              {{ textData.linkTitle }}
            </a>
            {{ textData.gameInfoSecondPart }}
          </div>
          <!-- 其他學習連結顯示 -->
          <div v-else text="2xl <sm:xl left [#878787]">
            {{ referDetail.info }}
          </div>
          <button
            class="w-52 h-16 <sm:(w-35 h-12) shadow-default rounded-[80px] justify-self-end"
            bg="[#18CB18]"
            text="[26px] <sm:[20px] [#FFF]"
            @click="onClickTeaching"
          >
            {{ isWebGame ? textData.buttonTitle : referDetail.btnText }}
          </button>
        </div>
      </template>
      <!-- 領取排行獎勵按鈕 -->
      <button
        v-if="contestDetailData.rankRewardState > RankRewardState.UnableGet"
        class="w-7/10 <lg:w-[95%] h-30 rounded-3xl relative"
        bg="[#15CE00]"
        m="x-auto b-5"
        font="bold"
        text="5xl [#FFF]"
        @click="onClickRankReward"
      >
        {{ contestDetailData.rankRewardState === RankRewardState.AbleGet ? textData.ableGet : textData.alreadyGet }}
        <img class="absolute left-0 bottom-0" :src="imgData.leftDot" />
        <img class="absolute right-0 bottom-0" :src="imgData.rightDot" />
      </button>
      <!-- 顯示獎勵通關密語 -->
      <template v-if="hasRewardPassword">
        <!-- 前往其他學習網站使用通關密語 -->
        <div
          m="x-[15%] b-5 <lg:x-[2.5%]"
          class="grid rounded-[15px] grid-cols-[5fr,2fr] items-center <sm:grid-cols-1"
          p="x-8 y-5"
          border="1px solid [#7A7A7A]"
        >
          <div text="2xl <sm:xl left [#878787]" style="white-space: pre-wrap">
            <!-- 已遊玩顯示通關密語及連結 -->
            <div v-if="contestPlayedCount > 0" text="2xl <sm:xl left [#878787]">
              {{ textData.rewardPasswordPrefix }}
              <a class="cursor-pointer" target="_blank" text="[#14DAE9]" @click="onClickRewardPassword">
                {{ randomRewardPassword }}
              </a>
              {{ textData.rewardPasswordSuffix }}
            </div>
            <!-- 尚未遊玩顯示提示 -->
            {{ rewardPasswordInfo.urlPrefixText }}
            <a class="cursor-pointer" target="_blank" text="[#14DAE9]" @click="onClickRewardPassword">
              {{ rewardPasswordInfo.url }}
            </a>
            {{ rewardPasswordInfo.urlSuffixText }}
          </div>
          <button
            class="w-52 h-16 <sm:(w-35 h-12) shadow-default rounded-[80px] justify-self-end"
            bg="[#18CB18]"
            text="[26px] <sm:[20px] [#FFF]"
            @click="onClickRewardPasswordRule"
          >
            {{ textData.rewardPasswordRule }}
          </button>
        </div>
      </template>
      <!-- 出戰英雄 -->
      <HeroAvatar
        class="w-7/10 <lg:w-[95%]"
        m="x-auto b-5"
        v-if="onlineHero && isContestInProgress"
        :heroListData="onlineHero"
        :isShowChange="true"
        :isHalf="false"
        @onChangeHero="isShowChangeHero = true"
      ></HeroAvatar>
      <!-- 賽事資訊 -->
      <div class="grid grid-cols-6 w-7/10 <lg:(w-[95%]) gap-x-5" m="x-auto">
        <div class="space-y-5" :class="!isWebGame ? 'col-span-4 <sm:col-span-6' : 'col-span-6'">
          <!-- 魔王詳細資訊 -->
          <BossBoard v-if="isBoss" ref="bossBoard" :bossData="bossData" />
          <!-- 我的排行榜 -->
          <div>
            <div class="rounded-[10px]" bg="[#EEA73D]" m="b-4" p="y-6" text="[#FFF] 3xl">
              {{ textData.myRank }}
            </div>
            <div v-if="!rankData.selfRank" text="[#878787] 2xl" p="y-5">
              {{ textData.noPlay }}
            </div>
            <div v-else p="y-5">
              <div v-if="rankData.selfRank.rank === -1" text="[#878787] 2xl">
                {{ textData.notInRank }}
              </div>
              <ul v-else class="grid grid-cols-4 items-center" text="[#878787] [18px]">
                <li>
                  {{ textData.di + rankData.selfRank.rank + textData.ming }}
                </li>
                <li class="truncate">{{ $$store.getters.userSchoolName }}</li>
                <li text="2xl">{{ $$store.getters.userName }}</li>
                <li text="base">
                  <span text="[#D69F05]">{{
                    isRankInAdl ? rankData.selfRank.totalScore : rankData.selfRank.bestScore
                  }}</span
                  >{{ textData.fen }}
                </li>
              </ul>
            </div>
          </div>
          <!-- 當前分數榜 -->
          <div>
            <!-- 標題 -->
            <div
              class="rounded-[10px] flex justify-center items-center"
              bg="[#EEA73D]"
              p="y-6"
              m="b-4"
              text="[#FFF] 3xl"
            >
              <img class="w-12 h-12 object-contain" m="r-2" :src="imgData.rankIcon" />
              {{ textData.currentRank }}
            </div>
            <div v-if="!rankData.rankList.length" text="[#878787] 2xl" p="y-5">
              {{ textData.noRank }}
            </div>
            <ul v-else class="h-[800px] overflow-y-auto scrollbar" text="[#878787] [18px]">
              <li
                v-for="(rank, index) in rankData.rankList"
                :key="index"
                class="grid grid-cols-4 items-center"
                p="y-5"
                :class="{ 'text-[#FDC221]': rank.rank === 1 }"
              >
                <!-- 名次 -->
                <span
                  :class="{
                    'text-4xl flex justify-center items-center relative  <sm:(text-[18px])': rank.rank === 1,
                    'text-3xl <sm:text-[18px]': rank.rank === 2,
                    'text-2xl <sm:text-[18px]': rank.rank === 3,
                  }"
                >
                  <img
                    class="w-9 h-8 object-contain absolute left-5 <sm:hidden"
                    :src="imgData.crownIcon"
                    v-if="rank.rank === 1"
                  />
                  {{ textData.di + rank.rank + textData.ming }}
                </span>
                <span v-if="rank.playerInfo.countyName" class="truncate">
                  {{ combineCountySchool(rank.playerInfo.countyName, rank.playerInfo.school) }}
                </span>
                <span v-else class="truncate"> {{ textData.noCountyName }} </span>
                <span
                  :class="{
                    'text-4xl <sm:text-[18px]': rank.rank === 1,
                    'text-3xl <sm:text-[18px]': rank.rank === 2,
                    'text-2xl <sm:text-[18px]': rank.rank === 3,
                  }"
                  >{{ rank.playerInfo.name }}</span
                >
                <span text="[#878787]">
                  <span text="[#D69F05]">{{ isRankInAdl ? rank.totalScore : rank.bestScore }}</span
                  >{{ textData.fen }}</span
                >
              </li>
            </ul>
          </div>
        </div>
        <BoardInfo class="col-span-2 <sm:col-span-6" v-if="!isWebGame" :contestListData="contest" />
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GameInfo from '@/components/WorldContest/Detall/GameInfo.vue';
import DareInfo from '@/components/WorldContest/Detall/DareInfo.vue';
import HeroAvatar from '@/components/WorldContest/Detall/HeroAvatar.vue';
import BoardInfo from '@/components/WorldContest/Detall/BoardInfo.vue';
import BossBoard from '@/components/WorldContest/Detall/BossBoard.vue';
import { Message, Load } from '@/helper/class/Common'; // 訊息框
import {
  TeamType,
  ResponseState,
  RankRewardState,
  GradeType,
  GATagActionStrType,
  GATagCategoryStrType,
  GATagCategoryIdType,
  GATagActionIdType,
  UserRole,
  HeroJ7GameType,
  RankRuleType,
} from '@/helper/enum/Common';
import { WebGameName } from '@/helper/enum/WebGame';
import ReplaceHero from '@/components/WorldContest/Detall/ReplaceHero.vue';
import { ContestStateType } from '@/helper/enum/Common';
import { contestRankScoreAPI, officialContestRoomUserSignUpAPI, rankRewardAPI } from '@/api/contest';
import { QuickLink } from '@/helper/enum/QuickLink';
import imgPath from '@/config/imgPath/imgPath';
import RankAward from '@/components/WorldContest/Dialog/RankAward.vue';
import { AnswerGameInfo } from '@/helper/interface/AnswerGame';
import { sendGAEvent, handleAPIError, toSubjectName } from '@/helper/fnc/common';
import { HeroListData } from '../../helper/interface/Hero';
import { randomNumber, randomBoolean } from '../H5/Helper/MathHelper';
import {
  ContestGameAward,
  ContestDetailData,
  ContestImageMap,
  ContestReferDetail,
  ContestListData,
  ContestPlayerRecord,
  OtherLimitData,
} from '@/helper/interface/Contest';
import { BossData } from '../../helper/interface/Boss';
import { RankData } from '../../helper/interface/Rank';
import { contestWebGame } from '@/api/contestGame';
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { MemberType } from '../H5/Net/NetProtocol/CommonStructure';
import { MessageBoxInputData } from 'element-ui/types/message-box';
import GameWheelDialog from '@/components/WorldContest/Dialog/GameWheelDialog.vue';
import { BossGameData } from '@/helper/interface/Game';
import UIHelper from '../H5/Helper/UIHelper';
import TableManager, { ContestRewardPasswordInfoData } from '@/manager/TableManager';

@Component({
  components: {
    GameInfo,
    DareInfo,
    HeroAvatar,
    BoardInfo,
    BossBoard,
    ReplaceHero,
    RankAward,
    GameWheelDialog,
  },
})
export default class ContestDetail extends Vue {
  $refs!: {
    bossBoard: BossBoard;
  };
  private RankRewardState = RankRewardState;
  /** 替換英雄開關 */
  private isShowChangeHero: boolean = false;
  /** 遊戲輪盤開關 */
  private isShowGameWheel: boolean = false;
  /** 排行獎勵開關 */
  private isShowRankAward: boolean = false;

  /** 賽事ID */
  private contestId: number = -1;

  /** 賽事詳細資料 */
  private contestDetailData: ContestDetailData = {} as ContestDetailData;

  /** 賽事紀錄 */
  private contestPlayerRecord!: ContestPlayerRecord;

  /** 學習鏈接資訊 */
  private referDetail!: ContestReferDetail;

  /** 是否有看過教材 */
  private hasTeaching: boolean = false;

  /** 獎勵通關密語 */
  private rewardPasswordInfo?: ContestRewardPasswordInfoData = undefined;
  /** 是否有獎勵通關密語 */
  private get hasRewardPassword(): boolean {
    return this.rewardPasswordInfo !== undefined;
  }
  /** 隨機取得一個獎勵通關密語 */
  private get randomRewardPassword(): string {
    if (this.rewardPasswordInfo === undefined) {
      return '';
    }

    // check cookie
    let cookieString = this.$cookie.get('rewardPassword');
    if (cookieString !== undefined && cookieString.length > 0) {
      return cookieString;
    }

    // create expireDate after 3 months
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 3);
    // get random password
    cookieString = this.rewardPasswordInfo.password[randomNumber(this.rewardPasswordInfo.password.length)];
    // set cookie
    this.$cookie.set('rewardPassword', cookieString, { expires: expireDate });

    return cookieString;
  }

  /** 排行獎勵清單 */
  private rewardDataList: ContestGameAward[] = [];

  /** 排行榜資料 */
  private rankData?: RankData;

  /** 取得賽事資訊 */
  private get contest(): ContestListData {
    return this.contestDetailData.contest;
  }

  /** 取得賽事類型名稱 */
  private get teamTypeName(): string {
    switch (this.contest.teamType) {
      case TeamType.WebGame:
        return MenuWord.CourseMenu;
      case TeamType.WorldBoss:
      case TeamType.AdlWorldBoss:
        return MenuWord.WorldContest;
      default:
        return '';
    }
  }

  /** 取得賽事標題 */
  private get contestTitle(): string {
    return `${toSubjectName(this.contest.subjectType)}-${this.contest.title}`;
  }

  /** 是否有共同boss */
  private get isBoss(): boolean {
    return this.contestDetailData?.bossData != null ?? false;
  }

  /** 是否為答題遊戲 */
  private get isWebGame(): boolean {
    return this.contest?.teamType === TeamType.WebGame ?? false;
  }

  /** 取得魔王看板 */
  private get bossBannerUrl(): string {
    // 預設魔王ID
    let bossId: number = -1;

    // 取得魔王ID
    if (this.contestDetailData.contest.imageMap != null) {
      const imageMap: ContestImageMap = JSON.parse(this.contestDetailData.contest.imageMap.toString());
      bossId = imageMap.listCard ?? bossId;
    }

    // 魔王防呆
    if (bossId < 0) {
      console.error(`contest: ${this.contestId} have invalid listCardId ${bossId}`);
    }

    return require(`@/assets/images/contest/bossBanner_${bossId}.jpg`);
  }

  /** 取得魔王資訊 */
  private get bossData(): BossData {
    return this.contestDetailData.bossData;
  }

  /** 是否為即時排行榜 */
  private get isImmediateRank(): boolean {
    // 目前只有Super可以看的到
    return this.$$store.getters.userRole === UserRole.SUP;
  }

  /** 賽事是能否遊玩 */
  private get isPlayableRole(): boolean {
    // 尚未登入
    if (this.$$store.getters.isLogin === false) {
      return false;
    }

    // 不符合賽事限制年級
    if (this.isContestGrade === false) {
      return false;
    }

    // 沒有其他限制
    if (this.contest.otherLimit == null) {
      return true;
    }

    // 檢查其他限制
    const limitData: OtherLimitData = JSON.parse(this.contest.otherLimit.toString());

    // 檢查使用者校區是否在可遊玩校區內
    if (
      limitData.schoolCountyIds != null &&
      limitData.schoolCountyIds.length > 0 &&
      limitData.schoolCountyIds.includes(this.$$store.getters.userSchoolCountyId) === false
    ) {
      return false;
    }

    // 檢查使用者身分是否在可遊玩身分中
    if (
      limitData.roles != null &&
      limitData.roles.length > 0 &&
      limitData.roles.includes(this.$$store.getters.userRole) === false
    ) {
      return false;
    }

    return true;
  }

  /** 賽事是否還在進行中 */
  private get isContestInProgress(): boolean {
    return this.contestDetailData.contest.state === ContestStateType.Progress;
  }

  /** 是否符合賽事年級  */
  private get isContestGrade(): boolean {
    // 答題遊戲不檢查身分
    if (this.isWebGame) {
      return true;
    }

    // 檢查年級是否符合
    switch (this.$$store.getters.userGradeNumber) {
      case GradeType.g0:
        return this.contest.g0 === 1;
      case GradeType.g1:
        return this.contest.g1 === 1;
      case GradeType.g2:
        return this.contest.g2 === 1;
      case GradeType.g3:
        return this.contest.g3 === 1;
      case GradeType.g4:
        return this.contest.g4 === 1;
      case GradeType.g5:
        return this.contest.g5 === 1;
      case GradeType.g6:
        return this.contest.g6 === 1;
      case GradeType.g7:
        return this.contest.g7 === 1;
      case GradeType.g8:
        return this.contest.g8 === 1;
      case GradeType.g9:
        return this.contest.g9 === 1;
      case GradeType.g10:
        return this.contest.g10 === 1;
      case GradeType.g11:
        return this.contest.g11 === 1;
      case GradeType.g12:
        return this.contest.g12 === 1;
    }

    return false;
  }

  /** 是否要看教材 */
  private get isTeaching(): boolean {
    // 已玩過, 表示已看過
    if (this.contestPlayedCount > 0) {
      return false;
    }

    // 沒有教學教材
    if (this.referDetail == null) {
      return false;
    }

    // 返回這次是否看過教材
    return this.hasTeaching === false;
  }

  /** 已遊玩次數 */
  private get contestPlayedCount(): number {
    return this.contestPlayerRecord?.playedCount ?? 0;
  }

  /** 排行榜規則 */
  private get isRankInAdl(): boolean {
    return this.contestDetailData.contest.rankRule === RankRuleType.AdlEdu ? true : false;
  }

  /** 出戰英雄 */
  private get onlineHero(): HeroListData | undefined {
    return this.$$store.getters.onlineHero;
  }

  /** 文字資料 */
  private textData = {
    immediateRankTitle: '進入即時排行榜',
    limitPlayTitle: '挑戰縣市/年級資格不符合',
    gameInfoFirstPart: '可挑戰次數有上限唷，建議',
    linkTitle: '【在因材網學習】',
    buttonTitle: '前往因材網',
    gameInfoSecondPart:
      '之後再進行挑戰，以獲取最佳成績！\n部份題目可能需要參考影片內容，您可在學習單元中找到參照影片。',
    alreadyGet: '已領取',
    ableGet: '領取排名獎勵',
    myRank: '我的排行',
    notInRank: '還差一點就能進1000名了',
    noPlay: '尚未挑戰過賽事',
    di: '第',
    ming: '名',
    fen: '分',
    currentRank: '當前分數榜',
    noRank: '目前無排行資訊',
    noCountyName: '此身分未提供學校資訊',
    inputPasswordTitle: '請輸入通關密語',
    inputPasswordMessage: '請先到PaGamO領取通關密語，再來挑戰吧！',
    inputPasswordConfirm: '確認',
    inputPasswordPlaceholder: '請輸入通關密語',
    noInputPasswordMessage: '尚未輸入通關密語',
    errorPasswordMessage: '通關密語錯誤',
    rewardPasswordRule: '活動辦法',
    rewardPasswordPrefix: '【恭喜獲得通關密語：',
    rewardPasswordSuffix: '，可以前往PaGamO挑戰任務囉！】\n',
  };

  /**圖片資料 */
  private imgData = {
    leftDot: imgPath.contestLeftDotBaseUrl,
    rightDot: imgPath.contestRightDotBaseUrl,
    rankIcon: imgPath.rankIcon,
    crownIcon: imgPath.crownIcon,
  };

  async mounted() {
    // 開啟讀取中
    Load.use(true);

    // 取得賽事資訊
    this.contestDetailData = await this.$$store.dispatch('getContestInfo', this.$route.params.id);

    // 賽事取得錯誤返回
    if (this.contestDetailData == null) {
      this.$router.go(-1);
      return;
    }

    // 取得賽事紀錄
    this.contestPlayerRecord = await this.$$store.dispatch('getContestPlayerRecord', this.contest.id);

    // 取得賽事學習鏈結
    this.referDetail = await this.$$store.dispatch('getSubjectUnitLearningLink', this.contest);

    // 取得排行榜資料
    this.rankData = await this.getContestRankScore();

    // 設定賽事ID
    this.contestId = this.contestDetailData.contest.id;

    // 取得獎勵通關密語
    this.rewardPasswordInfo = TableManager.contestRewardPasswordInfo.first((rewardPassword) => {
      return rewardPassword.contestName === this.contest.title;
    });

    // 關閉讀取中
    Load.use(false);
  }

  /** 取得賽事排行榜 */
  private async getContestRankScore(): Promise<RankData | undefined> {
    const data = {
      contestId: this.$route.params.id,
      pageSize: 500,
    };
    try {
      // API 取得排行榜
      const response: any = await contestRankScoreAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 儲存排行榜資料
      return JSON.parse(response.data);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 進入遊戲按鈕(路由跳轉) */
  private async onPlay(): Promise<void> {
    // 驗證賽事鎖定通關密語
    const isVerified = await this.verifyLockPassword();
    if (isVerified === false) {
      return;
    }

    // 沒選英雄防呆
    const onlineHero = this.$$store.getters.onlineHero;
    if (onlineHero == null) {
      this.$confirm('尚未選擇英雄喔!', '提示', {
        confirmButtonText: '確認',
        showCancelButton: false,
        type: 'warning',
      }).then(() => {
        this.$router.push(`${QuickLink.Profile}`);
      });
      return;
    }

    // 檢查是否看過教材
    if (this.isTeaching) {
      this.$confirm('您尚未看過教材，請看完再挑戰喔!', '提示', {
        confirmButtonText: '確認',
        showCancelButton: false,
        closeOnClickModal: false,
        showClose: false,
        type: 'warning',
      }).then(() => {
        // 自動跳轉網址
        this.onClickTeaching();
      });
      return;
    }

    // 根據TeamType分開賽API
    switch (this.contest.teamType) {
      case TeamType.WebGame:
        // 開啟小遊戲輪盤
        this.isShowGameWheel = true;
        break;
      case TeamType.WorldBoss:
      case TeamType.AdlWorldBoss:
        await this.startContest(onlineHero, this.contest.gameType);
        break;
      case TeamType.Room:
        await this.startRoomContest();
        break;
      default:
        console.error(`未知的賽事類型 TeamType = ${this.contest.teamType}`);
        break;
    }
  }

  /** 驗證賽事指定通關密語 */
  private async verifyLockPassword(): Promise<boolean> {
    // 查找是否有指定通關密語
    const contestlockPassword = TableManager.contestLockPasswordInfo.first((contestLockPassword) => {
      // TODO: 目前因交接期，修改後端風險大，因此皆以前端處理，暫時以名稱指定
      return this.contest.title === contestLockPassword.contestName;
    });

    // 沒有指定通關密語，驗證通過
    if (contestlockPassword === undefined) {
      return true;
    }

    // 彈窗輸入通關密語
    const isVerified = await this.$prompt(this.textData.inputPasswordMessage, this.textData.inputPasswordTitle, {
      confirmButtonText: this.textData.inputPasswordConfirm,
      showCancelButton: false,
      inputPlaceholder: this.textData.inputPasswordPlaceholder,
      customClass: 'input-column-wrapper',
    })
      .then((msgboxData): boolean => {
        const inputString = (msgboxData as MessageBoxInputData).value;
        // 未輸入文字，顯示警告
        if (inputString == null || inputString.length === 0) {
          Message.warn(this.textData.noInputPasswordMessage);
          return false;
        }
        // 輸入文字不符合通關密語，顯示錯誤
        if (inputString !== contestlockPassword.password) {
          Message.warn(this.textData.errorPasswordMessage);
          return false;
        }
        // 驗證通過
        return true;
      })
      // 取消輸入
      .catch((): boolean => {
        return false;
      });

    return isVerified;
  }

  /** 當小遊戲輪盤onPlay
   * @param gameType 遊戲類別
   */
  private async onGameWheelPlay(gameType: HeroJ7GameType): Promise<void> {
    // 受限於 onlineHero 可能為 undefined
    const onlineHero = this.$$store.getters.onlineHero;
    if (onlineHero === undefined) {
      return;
    }

    // 開始遊戲
    this.startContest(onlineHero, gameType);
  }

  /** 呼叫API取得許可後跳轉頁面
   *  @param onlineHero 出戰英雄
   *  @param heroJ7GameType 賽事遊戲類型
   */
  private async startContest(onlineHero: HeroListData, heroJ7GameType: HeroJ7GameType): Promise<void> {
    // 取得開始許可
    const gameInfo = await this.startContestWebGame(this.contestId, heroJ7GameType);
    if (gameInfo == null) {
      return;
    }
    this.$$store.commit('setAnswerGameInfo', gameInfo);
    this.$$store.commit('setGameType', heroJ7GameType);

    // 設定魔王表演設定
    if (this.isBoss) {
      const bossGameData: BossGameData = {
        bossTableData: this.$refs.bossBoard.bossTableData,
        playerHeroData: onlineHero,
        teammateName: this.getBossGameTeammateName(this.rankData),
      };

      // 設定魔王表演設定
      this.$$store.commit('setBossGameData', bossGameData);
    }

    // 設定賽事資訊
    this.$$store.commit('setContestDetailData', this.contestDetailData);

    // 前往答題遊戲
    this.$router.push(`/${WebGameName.AnswerGame}`);
  }

  /** 輸入密碼跳轉頁面 */
  private async startRoomContest(): Promise<void> {
    // 彈窗輸入密碼
    this.$prompt('參賽的賽局密碼', '系統通知', {
      confirmButtonText: '確認',
      showCancelButton: false,
      inputPlaceholder: '若此賽局無密碼則可直接進入',
      customClass: 'input-column-wrapper',
    }).then(async (msgboxData) => {
      const value = (msgboxData as MessageBoxInputData).value;
      // 組成封包
      const data = {
        contestId: this.contestId,
        password: value ? value : '',
      };

      try {
        // API 取得房間Token
        const response: any = await officialContestRoomUserSignUpAPI.post(data);
        if (response.result !== ResponseState.Success) {
          handleAPIError(response.result, response.resMessage);
        }

        // respose.signupToken 存到 RoomModule
        this.$$store.commit('setRoomSignUpToken', response.signUpToken);
        // 設定組隊類型
        this.$$store.commit('setTeamType', this.contest.teamType);
      } catch (e) {
        const error = e as Error;
        Message.warn(`${error.message}`);
        return;
      }

      // 儲存遊戲類型
      this.$$store.commit('setRoomGameType', this.contestDetailData.contest.gameType);
      // 設定使用者參賽類型
      this.$$store.commit('setRoomMemberType', MemberType.Player);
      this.$router.push(`/${MenuName.RoomGame}`);
    });
  }

  /** 取得開始遊戲許可
   * @param contestId
   * @param gameType
   */
  private async startContestWebGame(
    newContestId: number,
    gameType: HeroJ7GameType,
  ): Promise<AnswerGameInfo | undefined> {
    // 組成開始遊戲封包
    const data = {
      contestId: newContestId,
      gameMode: gameType,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 開始賽事
      const response: any = await contestWebGame.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 關閉讀取
      Load.use(false);

      const base64 = await import('js-base64');

      // 設定遊戲認證
      return {
        contestId: newContestId,
        logId: response.id,
        verifyKey: base64.Base64.decode(`${response.verifyKey}`),
      };
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 設定魔王賽
   * @param rankData
   */
  private getBossGameTeammateName(rankData: RankData | undefined): string[] {
    // 防呆
    if (rankData == null) {
      return [];
    }

    // 取出非自己的玩家排行榜
    const withoutPlayerRank = rankData.rankList.filter((rankInfo) => {
      return rankInfo.playerId !== this.$$store.getters.userUid;
    });

    // 設定隊友名稱
    return withoutPlayerRank.map<string>((rankInfo) => rankInfo.playerInfo.name);
  }

  /** 點擊教材 */
  private async onClickTeaching(): Promise<void> {
    // 紀錄看過教材
    this.hasTeaching = true;

    // 教材解析錯誤
    if (this.referDetail == null) {
      console.log(`onClickTeachingError: referDetail null`);
      return;
    }

    switch (this.contest.teamType) {
      // 答題遊戲
      case TeamType.WebGame:
        // GA 因材網連結學習單元事件
        await sendGAEvent(
          GATagCategoryIdType.AdlLinkUnit,
          GATagActionIdType.AdlLinkUnit,
          `${this.contest.id}`,
          this.$gtag,
          GATagActionStrType.AdlLinkUnit,
          GATagCategoryStrType.AdlLinkUnit,
        );
        break;
      // 魔王賽
      case TeamType.WorldBoss:
      case TeamType.AdlWorldBoss:
        // GA 因雄崛起連結教材事件
        await sendGAEvent(
          GATagCategoryIdType.HeroLinkTeaching,
          GATagActionIdType.HeroLinkTeaching,
          `賽事-${this.contest.id}`,
          this.$gtag,
          GATagActionStrType.HeroLinkTeaching,
          GATagCategoryStrType.HeroLinkTeaching,
        );
        break;
    }

    // 開啟學習鏈結
    window.open(`${this.referDetail.btnUrl}`);
  }

  /** 點擊獎勵通關密語 */
  private async onClickRewardPassword(): Promise<void> {
    // 開啟獎勵通關密語使用網址
    window.open(`${this.rewardPasswordInfo?.url}`);
  }

  /** 點擊獎勵通關密語規則 */
  private async onClickRewardPasswordRule(): Promise<void> {
    // 開啟獎勵通關密語規則網址
    window.open(`${this.rewardPasswordInfo?.rulesUrl}`);
  }

  /** 點擊領取排行賽事獎勵 */
  private async onClickRankReward(): Promise<void> {
    switch (this.contestDetailData.rankRewardState) {
      // 已領取
      case RankRewardState.AlreadyGet:
        Message.info('已經領取過囉');
        break;
      // 可以領取
      case RankRewardState.AbleGet:
        // 組成請求封包
        const data = {
          contestId: this.contestDetailData.contest.id,
        };

        // 開啟讀取中
        Load.use(true);

        try {
          // API 領取賽事獎勵
          const response: any = await rankRewardAPI.put(data);
          if (response.result === ResponseState.Success) {
            this.rewardDataList = response.rankRewardList as ContestGameAward[];
            this.contestDetailData.rankRewardState = RankRewardState.AlreadyGet;
          }

          // 關閉讀取中
          Load.use(false);
        } catch (e) {
          Message.error(`${e}`);
          // 關閉讀取中
          Load.use(false);
        }
        this.isShowRankAward = true;
        break;
      default:
        break;
    }
  }

  /** 點擊前往即時排行榜 */
  private onClickImmediateRank(): void {
    this.$$store.commit('setContestId', this.contest.id);
    this.$$store.commit('setRankRuleType', this.contest.rankRule);
    this.$router.push('/immediateRank');
  }

  /** 組合縣市和學校
   *  @param countyName 縣市別
   *  @param schoolName 學校名稱
   */
  private combineCountySchool(countyName: string, schoolName: string): string {
    console.log('combineCountySchool', countyName, schoolName);
    return UIHelper.combineCountySchool(countyName, schoolName);
  }
}
</script>
<style lang="scss" scoped>
.game-detail-wrapper {
  overflow: hidden;
  background: #ffffff;
  overflow-x: hidden;
  .world-contest-banner {
    height: 460px;
    background-repeat: no-repeat !important;
    background-size: cover !important;
  }
}
.immediate-rank {
  color: #000;
  text-align: left;
  border: 1px solid greenyellow;
  display: inline-block;
  padding: 8px 12px;
  margin: 5px;
  cursor: pointer;
  background: greenyellow;
  border-radius: 5px;
}
.scrollbar::-webkit-scrollbar {
  width: 7px;
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
