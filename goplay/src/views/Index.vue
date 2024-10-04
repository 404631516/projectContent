<template>
  <div>
    <!-- 雪花 -->
    <div class="snowflakes" aria-hidden="true">
      <div class="snowflake" v-for="index in sprinklesCount" :key="index">
        <img :src="sprinklesUrl" />
      </div>
    </div>
    <!-- banner -->
    <div class="relative flex justify-center items-end">
      <div class="absolute right-0 top-5 <sm:hidden">
        <router-link to="/StoryTour" class="flex flex-col justify-center items-center w-32 h-28" bg="[#54D907CC]">
          <img class="w-12 h-12" :src="imgData.story" />
          <span class="font-bold" text="[#FFF] 2xl">{{ textData.storyBook }}</span>
        </router-link>
        <router-link
          to="/NoviceGuide"
          class="flex flex-col justify-center items-center w-32 h-28"
          m="t-2"
          bg="[#09CFCFCC]"
        >
          <img class="w-12 h-12" :src="imgData.noviceGuide" />
          <span class="font-bold" text="[#FFF] 2xl">{{ textData.noviceGuide }}</span>
        </router-link>
        <!-- 跳轉用戶端問巻清單 -->
        <router-link
          v-if="isLogIn"
          to="/QuestionnaireUser"
          class="relative flex flex-col justify-center items-center w-32 h-28"
          m="t-2"
          bg="[#FF9D0AD9]"
        >
          <img class="w-12 h-12" :src="imgData.questionnaireUserUrl" />
          <span
            v-show="hasNewQuestionnaire"
            class="absolute -top-1 -left-1 w-8 h-8 flex items-center justify-center rounded-full bg-white text-red-500 text-xs font-bold"
          >
            New
          </span>
          <span class="font-bold" text="[#FFF] 2xl">{{ textData.questionnaire }}</span>
        </router-link>
      </div>
      <img class="block" :src="homeBannerUrl" />
      <div class="absolute grid grid-cols-1 gap-y-1 items-center justify-items-center" m="b-7">
        <!-- FB粉絲頁 -->
        <a
          class="flex items-center rounded-[30px] from-[#6AB9FF] via-[#3096FF] to-[#836BFF]"
          p="x-15 y-2 <sm:(x-4 y-1)"
          bg="gradient-to-b"
          href="https://www.facebook.com/heroj7.tn"
          target="_blank"
        >
          <img :src="imgData.fb" class="w-9.5 aspect-square object-contain" />
          <span m="l-2" text="[#FFF] 2xl <sm:lg">{{ textData.fbNews }}</span>
        </a>
      </div>
    </div>
    <!-- 遊戲時間提示 -->
    <div p=" y-1" text="[#FFF] 2xl <sm:xl" :style="{ backgroundColor: `${timeBackgroundColor}` }">
      {{ textData.gameTime }}
      <img class="inline-block <sm:hidden" :src="imgData.notice" />
      {{ textData.noticeText }}
    </div>
    <!-- 主要入口按鈕 -->
    <div
      class="shadow-default"
      :style="{ backgroundImage: `url(${buttonBackgroundImg})`, backgroundColor: `${buttonBackgroundColor}` }"
      bg="cover no-repeat"
    >
      <button
        v-for="(item, index) in mainBtnList"
        :key="index"
        :data="`MAIN_ENTRY_${index}`"
        @click="toLinkURL(item.link)"
        class="w-70 h-52.5 cursor-pointer <lg:w-1/4 <sm:(w-2/4 h-40) button-gap"
        m="y-6.5 <sm:y-1"
        bg="center contain no-repeat"
        :style="{ backgroundImage: `url(${item.img})` }"
        :class="index === mainBtnList.length - 1 ? '<lg:hidden' : ''"
      >
        <h4 class="font-bold" text="shadow-xl shadow-[#00000029] 5xl <sm:3xl [#FFF]">
          {{ item.name }}
        </h4>
        <p m="y-2" text="xl <sm:[12px]">{{ item.subStandard }}</p>
        <div class="w-3/5 rounded-3xl" m="x-auto" p="y-1" bg="[#4B4B4B]" text="[#FFDE39]">
          {{ item.directions }}
        </div>
      </button>
    </div>
    <!-- 最新消息 -->
    <div class="shadow-default" p="y-8">
      <NewsInfo class="w-3/4" m="x-auto" :newsList="newsList" :titleImg="titleImg" />
    </div>
    <!-- 學習成果 -->
    <div class="shadow-default" m="t-2" bg="[#F9F8F4]">
      <div
        class="w-3/4 flex items-center justify-center font-bold"
        m="x-auto b-3"
        p="t-5 b-3"
        text="[#FDC221] 3xl"
        border="b-2 [#D2D2D2] solid"
      >
        <img v-if="titleImg" :src="titleImg" class="w-25 aspect-square object-contain" />
        {{ textData.learnResult }}
      </div>
      <HomeCharts
        class="w-3/4 <lg:w-9/12 <sm:w-11/12"
        m="x-auto"
        p="b-5"
        :homeChartData="homeChartData"
        :homeChartCount="homeChartCount"
        :isShowPhone="isShowPhone"
      />
    </div>
    <!-- 排行榜 -->
    <template>
      <div
        class="w-full h-30 flex items-center justify-center sm:(space-x-6) shadow-default topRankList <sm:(h-auto grid grid-cols-1 justify-items-center)"
        m="<sm:(y-1)"
      >
        <button
          v-for="(rankHookData, index) in rankHookList"
          :key="index"
          class="w-84 flex items-center rounded-[30px] button-shadow"
          border="2px solid [#ABABAB]"
          text="3xl [#878787]"
          @click="jumpToRankTitle(index)"
        >
          <img :src="rankHookData.rankImgData" class="w-16.5 aspect-square transform -rotate-12" m="l-3.5 r-2" />
          {{ rankHookData.rankText }}
        </button>
      </div>
      <div
        class="shadow-default"
        m="x-auto t-3"
        v-for="(rankHookData, index) in rankHookList"
        :key="index"
        :bg="index % 2 === 1 ? '[#F5F5F5]' : ''"
        :class="rankHookData.rankHookName"
      >
        <!-- 標題 -->
        <div
          class="w-3/4 flex items-center justify-center font-bold"
          m="x-auto b-3"
          p="t-5 b-3"
          text="[#FDC221] 3xl"
          border="b-2 [#D2D2D2] solid"
        >
          <img v-if="titleImg" :src="titleImg" class="w-25 aspect-square object-contain" />
          {{ rankHookData.rankText }}
        </div>
        <!-- 電腦版排行榜 -->
        <template v-if="!isShowPhone">
          <div
            class="flex flex-col w-3/4 <lg:w-5/6"
            m="x-auto"
            v-for="(listData, dataIndex) in totalRankData[index]"
            :key="dataIndex"
          >
            <div class="grid grid-cols-2">
              <RankList
                v-for="(item, key) in totalRankData[index].slice(dataIndex * 2, dataIndex * 2 + 2)"
                :key="key"
                :rankData="item"
                :isShowPhone="isShowPhone"
              />
            </div>
            <div
              v-if="totalRankData[index][dataIndex * 2 + 2] != null"
              class="border-solid border border-[#B2B2B2] w-full my-8 mx-auto"
            ></div>
          </div>
        </template>
        <!-- 手機版排行榜 -->
        <template v-else>
          <el-carousel v-if="totalRankData.length > 0" indicator-position="none" arrow="never">
            <el-carousel-item
              v-for="(item, key) in totalRankData[index].slice(0, totalRankData[index].length)"
              :key="key"
            >
              <RankList class="w-full h-full" :rankData="item" :isShowPhone="isShowPhone" />
            </el-carousel-item>
          </el-carousel>
        </template>
        <div class="w-196 grid grid-cols-[1fr,1.5fr,1fr] gap-x-4 <sm:(w-full grid-cols-[1.5fr,1fr])" m="x-auto">
          <!-- 前往排行榜 -->
          <button
            @click="goRank(totalRankData[index][0].rankType)"
            class="rounded-[80px] yellowGradient sm:(col-start-2)"
            m="b-5 <sm:y-5"
            text="[#FFF] 2xl"
            font="bold"
            p="x-16 y-3 <sm:(x-2 y-1)"
          >
            {{ textData.goRankList }}
            <i class="el-icon-d-arrow-right" font="before:bold"></i>
          </button>
          <!-- 回到最上方 -->
          <button
            class="flex items-center justify-center rounded-[80px] shadow-default"
            m="b-5 <sm:y-5"
            text="lg [#D69F05]"
            font="bold"
            bg="[#FFFFFF]"
            @click="jumpToTop"
          >
            <img :src="imgData.yellowArrow" class="w-9 object-contain" />
            {{ textData.goTopRank }}
          </button>
        </div>
      </div>
    </template>
    <TheFooter />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ScreenType, ResponseState, RankingTabType, RankingTabName, RankingSubTitle } from '@/helper/enum/Common';
import { handleAPIError, handleScreen } from '@/helper/fnc/common';
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { bulletinDataAPI } from '@/api/login'; // 取得最新消息
import { homeRangeInfoAPI } from '@/api/webLobbyPage';
import { Message } from '@/helper/class/Common'; // 訊息框
import ImgPath from '@/config/imgPath/imgPath';

// 引入組件
import TheFooter from '@/components/Public/TheFooter.vue';
import HomeCharts from '@/components/Index/HomeCharts.vue';
import RankList from '@/components/Index/RankList.vue';
import NewsInfo from '@/components/Index/NewsInfo.vue';
import BigNumber from 'bignumber.js';
import {
  BtnListItem,
  NewsData,
  PublicRankList,
  PublicRankData,
  HomeChartData,
  HomeChartCount,
} from '@/helper/interface/Index';
import RewardDialog from '@/components/Public/RewardDialog.vue';
import { ContestGameAward } from '@/helper/interface/Contest';
import { WebGameName } from '@/helper/enum/WebGame';
import { ChartTarget } from '@/helper/enum/TeacherAdmin';
import { DefaultColor } from '@/helper/enum/BackEnd';
import { FormsListData } from '@/helper/interface/Questionnaire';
import { QuestionnaireFilterState, QuestionnaireSortType } from '@/helper/enum/Questionnaire';
import { formsListAPI } from '@/api/questionnaire';

/** 排行榜定位點資料 */
interface RankHookData {
  /** 排行榜名稱 */
  rankText: string;
  /** 排行榜定位名稱 */
  rankHookName: string;
  /** 排行榜圖片 */
  rankImgData: string;
}

@Component({
  components: {
    NewsInfo,
    TheFooter,
    HomeCharts,
    RankList,
    RewardDialog,
  },
})
export default class Index extends Vue {
  /** 文字資料 */
  private textData = {
    gameTime: '遊戲時間 7:00-22:00',
    noticeText: '遊戲關閉前五分鐘使用遊戲可能無法完成，請注意時間喔！',
    learnResult: '學習成果',
    goRankList: '前往排行榜',
    storyBook: '故事背景',
    noviceGuide: '新手引導',
    questionnaire: '問卷挑戰',
    fbNews: '粉絲團最新消息',
    goTopRank: '回最上方排行榜',
  };

  /** 圖片資料 */
  private imgData = {
    notice: ImgPath.noticeUrl,
    story: ImgPath.storyIcon,
    noviceGuide: ImgPath.noviceGuideIcon,
    fb: ImgPath.fbIcon,
    mainbtn1: ImgPath.mainbtn01,
    mainbtn2: ImgPath.mainbtn02,
    mainbtn3: ImgPath.mainbtn03,
    mainbtn4: ImgPath.mainbtn04,
    mainbtn5: ImgPath.mainbtn05,
    heroBaseUrl: ImgPath.heroBaseUrl,
    questionnaireUserUrl: ImgPath.questionnaireUserIcon,
    yellowArrow: ImgPath.yellowUpArrow,
    anniversaryIcon: ImgPath.anniversaryLogo,
  };

  /** 是否顯示手機板樣式 */
  private isShowPhone: boolean = false;
  /** 最新消息資料 */
  private newsList: NewsData[] = [];
  /** 目前背景圖檔 */
  private banner: string = '';

  /** 首頁圖表資料 */
  private homeChartData: HomeChartData[] = [];
  /** 首頁圖表次數資料 */
  private homeChartCount: HomeChartCount = { onlineCount: '', useCount: '' };

  /** 所有排行榜資料 */
  private totalRankData: PublicRankList[][] = [];
  /** 獎勵資料 */
  private rewardItemList: ContestGameAward[] = [];

  /** 排行榜標題 */
  private rankHookList: RankHookData[] = [
    {
      rankText: RankingTabName.TotalRankList,
      rankHookName: 'rankList',
      rankImgData: ImgPath.pulanIcon,
    },
    {
      rankText: RankingTabName.StudentRankList,
      rankHookName: 'studentRankList',
      rankImgData: ImgPath.bunIcon,
    },
    {
      rankText: RankingTabName.TeacherRankList,
      rankHookName: 'teacherRankList',
      rankImgData: ImgPath.dogIcon,
    },
    {
      rankText: RankingTabName.PersonalBaseRankList,
      rankHookName: 'personalBaseRankList',
      rankImgData: ImgPath.sofaIcon,
    },
  ];

  // 按鈕資料
  private mainBtnList: BtnListItem[] = [
    {
      name: '答題遊戲',
      link: `/${MenuName.CourseMenu}`,
      directions: '立即前往',
      img: this.courseButtonImg,
      subStandard: '攻略各科目， 培養英雄！',
    },
    {
      name: '魔王挑戰',
      link: `/${MenuName.WorldContest}`,
      directions: '立即前往',
      img: this.contestButtonImg,
      subStandard: '打擊魔王， 英雄排行！',
    },
    {
      name: '因雄宇宙',
      link: `/${MenuName.HeroUniverse}`,
      directions: '立即前往',
      img: this.planetButtonImg,
      subStandard: '帶著英雄探索宇宙！',
    },
    {
      name: '校園賽事',
      link: `/${MenuName.RoomContest}`,
      directions: '立即前往',
      img: this.roomContestButtonImg,
      subStandard: '教師也能輕鬆創局！',
    },
    {
      name: '星際論壇',
      link: `/${MenuName.InterstellarForum}`,
      directions: '立即前往',
      img: this.interstellarButtonImg,
      subStandard: '提問求救，我也是神隊友！',
    },
  ];

  /** 是否有新問卷 */
  private hasNewQuestionnaire: boolean = false;

  /** 雪花數量 */
  private readonly sprinklesCount: number = 10;

  /** 雪花類別 */
  private get sprinklesUrl(): string {
    return this.$$store.state.LoginModule.webAppConfig.sprinklesUrl;
  }

  /** 當前首頁banner圖檔 */
  private get homeBannerUrl(): string {
    // 節慶Banner
    const homeBanner: string[] = this.$$store.state.LoginModule.webAppConfig.homeBanner;
    if (homeBanner.length > 0) {
      return homeBanner[0];
    }

    // 一般Banner
    return ImgPath.defaultBanner;
  }

  /** 時間背景色 */
  private get timeBackgroundColor(): string {
    const timeBackgroundColor: string = this.$$store.state.LoginModule.webAppConfig.timeBackgroundColor;
    return timeBackgroundColor.length > 0 ? `${timeBackgroundColor}` : DefaultColor.TimeBackground;
  }

  /** 按鈕背景色 */
  private get buttonBackgroundColor(): string {
    return DefaultColor.ButtonBackground;
  }

  /** 按鈕背景圖 */
  private get buttonBackgroundImg(): string {
    const buttonBackgroundImg: string = this.$$store.state.LoginModule.webAppConfig.buttonBackgroundImg;
    return buttonBackgroundImg.length > 0 ? buttonBackgroundImg : '';
  }

  /** 答題遊戲按鈕圖 */
  private get courseButtonImg(): string {
    const coursebuttonImg: string = this.$$store.state.LoginModule.webAppConfig.coursebuttonImg;
    return coursebuttonImg.length > 0 ? coursebuttonImg : this.imgData.mainbtn1;
  }

  /** 魔王挑戰按鈕圖 */
  private get contestButtonImg(): string {
    const contestButtonImg: string = this.$$store.state.LoginModule.webAppConfig.contestbuttonImg;
    return contestButtonImg.length > 0 ? contestButtonImg : this.imgData.mainbtn2;
  }

  /** 星球大戰按鈕圖 */
  private get planetButtonImg(): string {
    const planetButtonImg: string = this.$$store.state.LoginModule.webAppConfig.planetbuttonImg;
    return planetButtonImg.length > 0 ? planetButtonImg : this.imgData.mainbtn3;
  }

  /** 星際論壇按鈕圖 */
  private get interstellarButtonImg(): string {
    const interstellarButtonImg: string = this.$$store.state.LoginModule.webAppConfig.interstellarbuttonImg;
    return interstellarButtonImg.length > 0 ? interstellarButtonImg : this.imgData.mainbtn4;
  }

  /** 校園賽事按鈕圖 */
  private get roomContestButtonImg(): string {
    const roomContestButtonImg: string = this.$$store.state.LoginModule.webAppConfig.roomcontestbuttonImg;
    return roomContestButtonImg.length > 0 ? roomContestButtonImg : this.imgData.mainbtn5;
  }

  /** 標題前圖片 */
  private get titleImg(): string {
    const titleImg: string = this.$$store.state.LoginModule.webAppConfig.titleImg;
    return titleImg.length > 0 ? titleImg : '';
  }

  /** 取得英雄任務圖像 */
  private get taskHeroImg(): string {
    const heroListData = this.$$store.getters.onlineHero;
    if (heroListData == null) {
      return '';
    }
    // ex: @/public/img/hero/chr_P08/chr_P08_home.png
    return `${this.imgData.heroBaseUrl}${heroListData.url}/${heroListData.url}_home.png`;
  }

  /** 取得TopNav高度 */
  private get topNavHeight(): number {
    const topNavElement = document.querySelector('.top-nav')! as HTMLDivElement;
    return topNavElement ? topNavElement.clientHeight : 0;
  }

  /** 是否登入狀態 */
  private get isLogIn(): boolean {
    return this.$$store.getters.isLogin;
  }

  created() {
    this.detectIsShowPhone();
    // 尺寸變更時刷新，強制更新CSS
    window.addEventListener('resize', this.detectIsShowPhone);
  }

  destroyed() {
    window.removeEventListener('resize', this.detectIsShowPhone);
  }

  mounted() {
    // 取得最新消息
    this.getNewsCardList();
    // 取得排行榜和學習成果
    this.getHomeRangeInfo();
    // 是否有新問卷
    this.checkHasNewQuestionnaire();
  }

  /** 主動偵測是橫向或直向 */
  private detectIsShowPhone(): void {
    this.isShowPhone = handleScreen(ScreenType.Phone);
  }

  /** 接 webLobbyPage Api，處理排行榜資料 */
  private async getHomeRangeInfo(): Promise<void> {
    try {
      // API 取得排行榜和學習成果
      const res: any = await homeRangeInfoAPI.fetch({});
      if (res.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(res.result, res.resMessage);
      }

      // 排行榜資料
      this.totalRankData.push(this.getRankListData(res));
      // 學生排行榜資料
      this.totalRankData.push(this.getStudentRankListData(res));
      // 教師排行榜資料
      this.totalRankData.push(this.getOtherRankListData(res));
      // 個人基地排行榜資料
      this.totalRankData.push(this.getPersonalBaseRankListData(res));
      // 賽事使用次數
      this.homeChartData.push({ title: ChartTarget.ContestDailyRecord, chartData: res.contestDailyRecord ?? [] });
      // 使用者登入次數
      this.homeChartData.push({ title: ChartTarget.LoginDailyRecord, chartData: res.loginDailyRecord ?? [] });
      // 學習知識點科目排行
      this.homeChartData.push({
        title: ChartTarget.SubjectUnitPlayedRank,
        chartData: res.heroj7SubjectUnitPlayedRank ?? [],
      });

      this.homeChartCount.onlineCount = res.totalOnlineCount;
      this.homeChartCount.useCount = res.totalUseCount;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 整理排行榜資料 */
  private getRankListData(data: any): PublicRankList[] {
    const rankListData: PublicRankList[] = [];

    // 學校參與度
    const schoolContestUsed: PublicRankList = {
      title: RankingSubTitle.UntilSchoolParticipation,
      rankList: [],
      rankType: RankingTabType.TotalRankList,
    };
    data.schoolContestUsedRank.map((item: { rank: number; name: string; totalCount: number; countyName: string }) => {
      schoolContestUsed.rankList.push({
        rank: item.rank,
        name: `${item.countyName}${item.name}`,
        count: new BigNumber(item.totalCount).toFormat(),
        countUnit: '次',
      });
    });
    rankListData.push(schoolContestUsed);

    // 競賽參與次數
    const systemContestPlayed: PublicRankList = {
      title: RankingSubTitle.ContestParticipationTimes,
      rankList: [],
      rankType: RankingTabType.TotalRankList,
    };
    data.rankSystemContestPlayed.map((item: { rank: number; name: string; score: number }) => {
      systemContestPlayed.rankList.push({
        rank: item.rank,
        name: item.name,
        count: new BigNumber(item.score).toFormat(),
        countUnit: '次',
      });
    });
    rankListData.push(systemContestPlayed);

    return rankListData;
  }
  /** 整理學生排行榜資料
   *  @param data SERVER回傳資料
   */
  private getStudentRankListData(data: any): PublicRankList[] {
    const rankData = [
      // 學生上週競賽積分
      {
        title: RankingSubTitle.StudentLastWeekContestPoints,
        data: data.rankUserContestPoint_lastWeek_student,
        unit: '分',
      },
      // 學生累計競賽積分
      {
        title: RankingSubTitle.StudentUntilContestPoints,
        data: data.rankUserContestPoint_total_student,
        unit: '分',
      },
      // 學生上週英雄積分
      {
        title: RankingSubTitle.StudentLastWeekHeroPoints,
        data: data.rankUserHeroPoint_lastWeek_student,
        unit: '分',
      },
      // 學生累計英雄積分
      {
        title: RankingSubTitle.StudentUntilHeroPoints,
        data: data.rankUserHeroPoint_total_student,
        unit: '分',
      },
    ];

    return rankData.map<PublicRankList>((rank) => {
      return {
        title: rank.title,
        rankList: this.arrangeRankData(rank.data, rank.unit),
        rankType: RankingTabType.StudentRankList,
      };
    });
  }
  /** 整理教師排行榜資料
   *  @param data SERVER回傳資料
   */
  private getOtherRankListData(data: any): PublicRankList[] {
    const rankData = [
      // 老師上週競賽積分
      {
        title: RankingSubTitle.TeacherLastWeekContestPoints,
        data: data.rankUserContestPoint_lastWeek_other,
        unit: '分',
      },
      // 老師累計競賽積分
      {
        title: RankingSubTitle.TeacherUntilContestPoints,
        data: data.rankUserContestPoint_total_other,
        unit: '分',
      },
      // 老師上週英雄積分
      {
        title: RankingSubTitle.TeacherLastWeekHeroPoints,
        data: data.rankUserHeroPoint_lastWeek_other,
        unit: '分',
      },
      // 老師累計英雄積分
      {
        title: RankingSubTitle.TeacherUntilHeroPoints,
        data: data.rankUserHeroPoint_total_other,
        unit: '分',
      },
      // 老師指派任務被完成數
      {
        title: RankingSubTitle.TeacherTaskPoint,
        data: data.rankUserAdlEduTeacherMissionRecord_lastWeek,
        unit: '次',
      },
      // 老師指派任務被完成率
      {
        title: RankingSubTitle.TeacherTaskRatePoint,
        data: data.rankUserAdlEduTeacherMissionRecordRate_lastWeek,
        unit: '%',
      },
    ];

    return rankData.map<PublicRankList>((rank) => {
      return {
        title: rank.title,
        rankList: this.arrangeRankData(rank.data, rank.unit),
        rankType: RankingTabType.TeacherRankList,
      };
    });
  }

  /** 整理個人基地排行榜資料
   *  @param data SERVER回傳資料
   */
  private getPersonalBaseRankListData(data: any): PublicRankList[] {
    const rankData = [
      // 學生上週裝飾積分
      {
        title: RankingSubTitle.StudentLastWeekAdornmentRankPoints,
        data: data.rankUserFarmMapPoint_lastWeek_student,
        unit: '分',
      },
      // 老師上週裝飾積分
      {
        title: RankingSubTitle.TeacherLastWeekAdornmentRankPoints,
        data: data.rankUserFarmMapPoint_lastWeek_other,
        unit: '分',
      },
    ];

    return rankData.map<PublicRankList>((rank) => {
      return {
        title: rank.title,
        rankList: this.arrangeRankData(rank.data, rank.unit),
        rankType: RankingTabType.PersonalBaseRankList,
      };
    });
  }

  /** 整理SERVER回傳排名資料
   *  @param data SERVER回傳排名資料
   *  @param countUnit 單位
   */
  private arrangeRankData(data: any, countUnit: string): PublicRankData[] {
    // 防呆
    if (data == null) {
      return [];
    }
    const rankData: PublicRankData[] = [];
    data.map(
      (item: { rank: number; name: string; score: number; school: string; class: string; countyName: string }) => {
        rankData.push({
          rank: item.rank,
          name: item.name,
          county: item.countyName,
          schoolName: item.school,
          className: item.class,
          count: new BigNumber(item.score).toFormat(),
          countUnit,
        });
      },
    );
    return rankData;
  }

  /** 取得最新消息 */
  private async getNewsCardList(): Promise<void> {
    try {
      // API 取得公告
      const response: any = await bulletinDataAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 設定最新消息
      this.newsList = response.resList;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 檢查是否有新問卷 */
  private async checkHasNewQuestionnaire(): Promise<void> {
    // 未登入不檢查
    if (this.isLogIn === false) {
      return;
    }

    // 組成封包
    const data: FormsListData = {
      pageOptions: { page: 0, pageSize: 1 },
      sortOptions: { sortType: QuestionnaireSortType.ascending },
      filterOptions: { state: QuestionnaireFilterState.notFill },
    };

    // 索取指定類型/頁面的問巻清單
    const response: any = await formsListAPI.post(data);

    // 是否有新問卷
    this.hasNewQuestionnaire = response.totalSize > 0;
  }

  /**
   * 到相應的頁面(需先登入才可以進入)
   * @param 相應頁面的路由(字串)
   */
  private toLinkURL(link: string) {
    if (this.isLogIn === false) {
      Message.warn('請先登入');
      return;
    }
    this.$router.push(link);
  }

  /**打開獎勵彈窗
   * @param rewardList 獎勵資料
   */
  private onOpenRewardDialog(rewardList: ContestGameAward[]): void {
    // 記錄獎勵資料，以轉傳給獎勵ui
    this.rewardItemList = rewardList;
  }

  /**前往排行榜 */
  private goRank(index: RankingTabType) {
    if (!this.isLogIn) {
      Message.warn('您目前身分尚未登入喔，如欲瞭解更多資訊內容，請登入系統後再進行查詢!!');
      return;
    }
    this.$router.push({
      name: `${MenuWord.RankingList}`,
      params: { id: `${index}` },
    });
  }

  /** 前往個人基地 */
  private goPersonalBase(): void {
    // 前往遊戲
    this.$router.push({
      name: `${WebGameName.PersonalBaseGame}`,
      params: { id: `${this.$$store.getters.userUid}` },
    });
  }

  /** 前往用戶端問巻清單 */
  private goQuestionnaireUser(): void {
    this.$router.push({
      name: `${MenuName.QuestionnaireUser}`,
      params: {},
    });
  }

  /** 跳到該排行榜
   *  @param index 第幾個排行榜
   */
  private jumpToRankTitle(index: number): void {
    const rankTitle = document.querySelector(`.${this.rankHookList[index].rankHookName}`)! as HTMLDivElement;
    document.querySelector('.main')!.scrollTo({ top: rankTitle.offsetTop - this.topNavHeight, behavior: 'smooth' });
  }

  /** 跳到排行榜清單 */
  private jumpToTop(): void {
    const rankTopTitle = document.querySelector('.topRankList')! as HTMLDivElement;
    document.querySelector('.main')!.scrollTo({ top: rankTopTitle.offsetTop - this.topNavHeight, behavior: 'smooth' });
  }

  /** 跳轉到周年慶頁面 */
  private onGoAnniversary(): void {
    this.$router.push(`/${MenuName.Anniversary}`);
  }
}
</script>

<style lang="scss">
.button-shadow {
  box-shadow: 0px 3px 0px #ababab;
}
@media (max-width: 1024px) {
  .button-gap {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
@-webkit-keyframes snowflakes-fall {
  0% {
    top: -10%;
  }
  100% {
    top: 100%;
  }
}
@-webkit-keyframes snowflakes-shake {
  0% {
    -webkit-transform: translateX(0px);
    transform: translateX(0px);
  }
  50% {
    -webkit-transform: translateX(80px);
    transform: translateX(80px);
  }
  100% {
    -webkit-transform: translateX(0px);
    transform: translateX(0px);
  }
}
@-webkit-keyframes snowflakes-rotate {
  0% {
    rotate: 0deg;
  }
  100% {
    rotate: 360deg;
  }
}
@keyframes snowflakes-fall {
  0% {
    top: -10%;
  }
  100% {
    top: 100%;
  }
}
@keyframes snowflakes-shake {
  0% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(80px);
  }
  100% {
    transform: translateX(0px);
  }
}
@keyframes snowflakes-rotate {
  0% {
    rotate: 0deg;
  }
  100% {
    rotate: 360deg;
  }
}
.snowflake {
  position: fixed;
  top: -10%;
  z-index: 9999;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: default;
  -webkit-animation-name: snowflakes-fall, snowflakes-shake, snowflakes-rotate;
  -webkit-animation-duration: 10s, 3s, 10s;
  -webkit-animation-timing-function: linear, ease-in-out, linear;
  -webkit-animation-iteration-count: infinite, infinite, infinite;
  -webkit-animation-play-state: running, running, running;
  animation-name: snowflakes-fall, snowflakes-shake, snowflakes-rotate;
  animation-duration: 10s, 3s, 10s;
  animation-timing-function: linear, ease-in-out, linear;
  animation-iteration-count: infinite, infinite, infinite;
  animation-play-state: running, running, running;
}
.snowflake:nth-of-type(0) {
  left: 1%;
  -webkit-animation-delay: 0s, 0s;
  animation-delay: 0s, 0s;
}
.snowflake:nth-of-type(1) {
  left: 10%;
  -webkit-animation-delay: 1s, 1s;
  animation-delay: 1s, 1s;
}
.snowflake:nth-of-type(2) {
  left: 20%;
  -webkit-animation-delay: 6s, 0.5s;
  animation-delay: 6s, 0.5s;
}
.snowflake:nth-of-type(3) {
  left: 30%;
  -webkit-animation-delay: 4s, 2s;
  animation-delay: 4s, 2s;
}
.snowflake:nth-of-type(4) {
  left: 40%;
  -webkit-animation-delay: 2s, 2s;
  animation-delay: 2s, 2s;
}
.snowflake:nth-of-type(5) {
  left: 50%;
  -webkit-animation-delay: 8s, 3s;
  animation-delay: 8s, 3s;
}
.snowflake:nth-of-type(6) {
  left: 60%;
  -webkit-animation-delay: 6s, 2s;
  animation-delay: 6s, 2s;
}
.snowflake:nth-of-type(7) {
  left: 70%;
  -webkit-animation-delay: 2.5s, 1s;
  animation-delay: 2.5s, 1s;
}
.snowflake:nth-of-type(8) {
  left: 80%;
  -webkit-animation-delay: 1s, 0s;
  animation-delay: 1s, 0s;
}
.snowflake:nth-of-type(9) {
  left: 90%;
  -webkit-animation-delay: 3s, 1.5s;
  animation-delay: 3s, 1.5s;
}
</style>
