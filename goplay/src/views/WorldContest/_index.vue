<template>
  <div class="world-wrapper">
    <!-- 上方Banner -->
    <el-carousel :interval="5000" :arrow="carouselArrowState" :loop="true" class="world_contest">
      <el-carousel-item v-for="url in contestBannerUrlList" :key="url" class="world-contest-banner">
        <div class="world-contest-banner" :style="`background: url(${url})`"></div>
      </el-carousel-item>
    </el-carousel>
    <div class="flex flex-col items-center <sm:hidden" p="y-5">
      <!-- 篩選遊戲類型 -->
      <GameFilter :selectGameType="currentGameType" :isShowAll="true" @onSelectGameType="onSelectGameType" />
      <div class="w-1/2 <lg:w-[98%]" m="y-3" border="t-2 solid [#A5A5A5]"></div>
      <!-- 篩選年級限制 -->
      <GradeFilter :selectGradeType="currentGrade" @onSelectGradeType="onSelectGradeType" />
      <div class="w-1/2 <lg:w-[98%]" m="y-3" border="t-2 solid [#A5A5A5]"></div>
      <!-- 隱藏過期賽事 -->
      <ExpiredContestFilter @onHideExpiredContestChange="onHideExpiredContestChange" />
    </div>
    <!-- 賽事卡片 -->
    <div class="world-content" v-if="contestListData.length !== 0">
      <GameCardList
        :contestDataList="contestListData"
        :isAddCard="false"
        :cardType="cardType"
        @onClickView="onClickView"
      />
      <!-- 分頁-->
      <div class="page-box block flex-pos">
        <el-pagination
          layout="prev, pager, next"
          :total="contestListSize"
          :page-size="contestPerPage"
          :hide-on-single-page="true"
          @current-change="onSwitchPage"
        ></el-pagination>
      </div>
    </div>
    <!-- 沒有賽事 -->
    <div class="no-data-message" v-else>
      <h5>{{ textData.noContestTitle }}</h5>
      <p>{{ textData.noContestHint }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GameFilter from '@/components/WorldContest/GameFilter.vue';
import GradeFilter from '@/components/WorldContest/GradeFilter.vue';
import GameCardList from '@/components/WorldContest/GameCardList.vue';
import ExpiredContestFilter from '@/components/WorldContest/ExpiredContestFilter.vue';
import {
  TeamType,
  GradeType,
  ResponseState,
  ContestSortType,
  ContestSortOrder,
  HeroJ7GameType,
  ContestCardType,
} from '@/helper/enum/Common';
import { contestListAPI } from '@/api/contest';
import { Message, Load } from '@/helper/class/Common';
import ImgPath from '@/config/imgPath/imgPath';
import { MenuName } from '@/helper/enum/MenuName';
import { ContestListData, ContestOptions } from '../../helper/interface/Contest';
import TimeHelper from '../H5/Helper/TimeHelper';

@Component({
  components: {
    GameFilter,
    GradeFilter,
    ExpiredContestFilter,
    GameCardList,
  },
})
export default class Index extends Vue {
  /** 賽事清單資料 */
  private contestListData: ContestListData[] = [];
  /** 賽事卡片種類 */
  private cardType: ContestCardType = ContestCardType.WorldContest;

  /** 每頁顯上賽事數量上限 */
  private readonly contestPerPage: number = 20;
  /** 賽事總量 */
  private contestListSize: number = 0;
  /** 當前頁數 */
  private currentPageIndex: number = 0;

  /** 當前使用者選到的遊戲類型 */
  private currentGameType: HeroJ7GameType = HeroJ7GameType.Total;
  /** 當前使用者選到的年級 */
  private currentGrade: GradeType = GradeType.g0;

  /** 是否隱藏過期賽事 */
  private isHidingExpiredContest: boolean = true;

  /** 圖片資料 */
  private imgData = {
    roomButton: ImgPath.roomButton,
  };

  /** 文字資料 */
  private textData = {
    noContestTitle: '目前篩選結果沒有任何比賽喔!',
    noContestHint: '換個類型或是年級找找看吧!',
  };

  /** 取得看板圖路徑 */
  private get contestBannerUrlList(): string[] {
    // 節慶看板
    const contestBannerUrl = this.$$store.state.LoginModule.webAppConfig.contestBanner;
    if (contestBannerUrl.length > 0) {
      return contestBannerUrl;
    }
    // 一般看板
    else {
      return [ImgPath.contestDefaultBanner];
    }
  }

  /** 看板切換鍵顯示 */
  private get carouselArrowState(): string {
    return this.contestBannerUrlList.length > 1 ? 'hover' : 'never';
  }

  created() {
    // 取得賽事清單
    this.getContestList();
  }

  /** 取得賽事列表 */
  private async getContestList(): Promise<void> {
    // 取得賽事列表參數設定
    const options: ContestOptions = {
      // 賽事額外選項
      extraOptions: {
        numberOfPlayer: true,
        rankRewardState: true,
      },
      // 賽事搜尋過濾選項
      filterOptions: {
        teamType: [TeamType.WorldBoss, TeamType.AdlWorldBoss, TeamType.Room],
        gameType: this.currentGameType === HeroJ7GameType.Total ? [] : [this.currentGameType],
        subjectType: [],
        state: [],
        gradeFilter: this.currentGrade === GradeType.g0 ? [] : [this.currentGrade],
        onlyHaveScore: false,
        gameStartDayId: 0,
        gameEndDayId: this.isHidingExpiredContest ? TimeHelper.getTodayDayId() - 1 : 0,
      },
      // 賽事頁數選項
      pageOptions: {
        page: this.currentPageIndex,
        pageSize: this.contestPerPage,
      },
      // 賽事排序選項
      sortOptions: {
        keywordType: ContestSortType.GameStart,
        sortType: ContestSortOrder.Descending,
      },
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 取得賽事列表
      const response: any = await contestListAPI.post(options);
      if (response.result === ResponseState.Success) {
        // 儲存賽事列表
        this.contestListData = response.contestList as ContestListData[];
        // 儲存賽事總數
        this.contestListSize = response.totalSize as number;
      } else {
        // 顯示錯誤
        throw Error(response.resMessage);
      }

      // 關閉讀取中
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 點擊賽事
   * @param contestId
   */
  private onClickView(contestId: number): void {
    Load.use(true);
    this.$router.push({
      name: `${MenuName.BossContestInfoDetail}`,
      params: { id: `${contestId}` },
    });
  }

  /** 換頁
   * @param pageIndex
   */
  private onSwitchPage(pageIndex: number): void {
    this.currentPageIndex = pageIndex - 1;
    this.getContestList();
  }

  /** 點擊篩選遊戲類型
   * @param gameType
   */
  private onSelectGameType(gameType: HeroJ7GameType): void {
    // 設定當前遊戲類型
    this.currentGameType = gameType;

    // 返回第一頁
    this.currentPageIndex = 0;

    // 取得賽事列表
    this.getContestList();
  }

  /** 點擊篩選年級
   * @param gradeType
   */
  private onSelectGradeType(gradeType: GradeType): void {
    // 設定當前年級
    this.currentGrade = gradeType;

    // 返回第一頁
    this.currentPageIndex = 0;

    // 取得賽事列表
    this.getContestList();
  }

  /** 隱藏過期賽事 */
  private onHideExpiredContestChange(isHidingExpiredContest: boolean): void {
    // 設定是否隱藏過期賽事
    this.isHidingExpiredContest = isHidingExpiredContest;

    // 返回第一頁
    this.currentPageIndex = 0;

    // 取得賽事列表
    this.getContestList();
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-carousel__container {
  aspect-ratio: 1920/476;
  width: 100%;
  height: auto;
}
.world-wrapper {
  .world-contest-banner {
    aspect-ratio: 1920/476;
    width: 100%;
    background-repeat: no-repeat !important;
    background-size: contain !important;
  }
  .world-content {
    overflow: auto;
    margin-bottom: 10vh;
  }
  .page-box {
    height: auto;
  }
  .no-data-message {
    color: #fff;
    height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1.5;
    h5 {
      font-size: 30px;
    }
    p {
      font-size: 25px;
    }
  }
}
.btn_text_shadow {
  text-shadow: 0px 2px 3px #00000080;
}
</style>
