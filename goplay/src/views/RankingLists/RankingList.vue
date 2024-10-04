<template>
  <div bg="[#FFF]">
    <!-- 標題 -->
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <!-- 排行榜 -->
    <div p="10 <sm:1 <sm:t-5">
      <!-- 排行榜頁籤 -->
      <div class="flex" p="l-5 <sm:l-0">
        <div
          v-for="(tabData, index) in rankTabData"
          :key="index"
          :bg="activeTab === tabData.rankTabType ? '[#FFC43A]' : '[#FFEBB5]'"
          class="w-72 h-14 rounded-t-xl transform -skew-x-12 transition-all cursor-pointer"
          m="x-2"
          @click="onClickTab(tabData.rankTabType)"
        >
          <!-- 排行榜名稱 -->
          <span
            class="h-full flex items-center justify-center transform skew-x-12 text-3xl <sm:text-xl transition-all"
            :text="activeTab === tabData.rankTabType ? '[#FFF]' : '[#D69F05]'"
          >
            {{ getRankTypeName(tabData.rankTabType) }}
          </span>
        </div>
      </div>
      <!-- 排行榜顯示 -->
      <div p="6" bg="[#F9F8F4]" border="t-5 solid [#FFBD4A]">
        <!-- 排行類別按鈕 -->
        <div class="flex sm:(space-x-3) <sm:(flex-col items-center)" v-if="rankTypeList.length >= 1">
          <button
            v-for="(rankTypeData, index) in rankTypeList"
            :key="index"
            class="w-64 h-14 rounded-[30px] flex justify-center items-center <sm:(justify-start p-l-2)"
            :class="
              activeRankType === rankTypeData.rankType ? 'bg-[#3DB5CE] text-[#FFF]' : 'bg-[#F9F8F4] text-[#878787]'
            "
            text="2xl <xl:xl"
            border="2 solid [#9F9F9F]"
            @click="refreshRank(rankTypeData.rankType)"
          >
            <img
              class="w-9 aspect-square object-contain"
              m="r-2"
              :src="activeRankType === rankTypeData.rankType ? imgData.whiteStar : imgData.yellowStar"
            />
            {{ rankTypeData.rankName }}
          </button>
        </div>
        <!-- 排行榜內容 -->
        <RankingBoard :rankingList="rankingList" :rankType="activeRankType" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  adornmentPointRankAPI,
  everySchoolSystemRankAPI,
  rankContestPlayCountAPI,
  userContestRankScoreAPI,
  rankUserHeroPointAPI,
  rankUserAdlEduTeacherMissionPointAPI,
  rankUserAdlEduTeacherMissionRatePointAPI,
} from '@/api/contest';
import { RankingRankType, RankingSubTitle, RankingTabName, RankingTabType } from '@/helper/enum/Common';
import { Message } from '@/helper/class/Common';
import { ResponseState } from '@/helper/enum/Common';
import RankingBoard from '@/components/RankingLists/RankingBoard.vue';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import { BigNumber } from 'bignumber.js';
import { RankingListItem } from '@/helper/interface/Rank';
import { handleAPIError } from '../../helper/fnc/common';
import UIHelper from '../H5/Helper/UIHelper';

/** 排行類型資訊 */
interface RankTabData {
  /** 排行類別 */
  rankTabType: RankingTabType;
  /** 分類選項 */
  rankTypeData: RankTypeData[];
}

/** 排行類型資料 */
interface RankTypeData {
  /** 排行類型名稱 */
  rankName: string;
  /** 排行類型 */
  rankType: RankingRankType;
}

@Component({
  components: {
    RankingBoard,
    GeneralBanner,
  },
})
export default class RankingList extends Vue {
  /** 選中頁籤 */
  private activeTab: RankingTabType = 0;

  /** 選中排行 */
  private activeRankType: RankingRankType = 0;

  /** 排名資料 */
  private rankingList: RankingListItem[] = [];

  /** 排行類別資料 */
  private readonly rankTabData: RankTabData[] = [
    // 排行榜
    {
      rankTabType: RankingTabType.TotalRankList,
      rankTypeData: [
        {
          rankName: RankingSubTitle.UntilSchoolParticipation,
          rankType: RankingRankType.UntilSchoolParticipation,
        },
        {
          rankName: RankingSubTitle.UntilSchoolLastWeekParticipation,
          rankType: RankingRankType.UntilSchoolLastWeekParticipation,
        },
        {
          rankName: RankingSubTitle.ContestParticipationTimes,
          rankType: RankingRankType.ContestParticipationTimes,
        },
      ],
    },
    // 學生排行榜
    {
      rankTabType: RankingTabType.StudentRankList,
      rankTypeData: [
        {
          rankName: RankingSubTitle.StudentLastWeekContestPoints,
          rankType: RankingRankType.StudentLastWeekContestPoints,
        },
        {
          rankName: RankingSubTitle.StudentUntilContestPoints,
          rankType: RankingRankType.StudentUntilContestPoints,
        },
        {
          rankName: RankingSubTitle.StudentLastWeekHeroPoints,
          rankType: RankingRankType.StudentLastWeekHeroPoints,
        },
        {
          rankName: RankingSubTitle.StudentUntilHeroPoints,
          rankType: RankingRankType.StudentUntilHeroPoints,
        },
      ],
    },
    // 老師排行榜
    {
      rankTabType: RankingTabType.TeacherRankList,
      rankTypeData: [
        {
          rankName: RankingSubTitle.TeacherLastWeekContestPoints,
          rankType: RankingRankType.TeacherLastWeekContestPoints,
        },
        {
          rankName: RankingSubTitle.TeacherUntilContestPoints,
          rankType: RankingRankType.TeacherUntilContestPoints,
        },
        {
          rankName: RankingSubTitle.TeacherLastWeekHeroPoints,
          rankType: RankingRankType.TeacherLastWeekHeroPoints,
        },
        {
          rankName: RankingSubTitle.TeacherUntilHeroPoints,
          rankType: RankingRankType.TeacherUntilHeroPoints,
        },
        {
          rankName: RankingSubTitle.TeacherTaskPoint,
          rankType: RankingRankType.TeacherTaskPoint,
        },
        {
          rankName: RankingSubTitle.TeacherTaskRatePoint,
          rankType: RankingRankType.TeacherTaskRatePoint,
        },
      ],
    },
    // 個人基地排行榜
    {
      rankTabType: RankingTabType.PersonalBaseRankList,
      rankTypeData: [
        {
          rankName: RankingSubTitle.AdornmentRankPoints,
          rankType: RankingRankType.AdornmentRankPoints,
        },
      ],
    },
  ];

  /** 排行分類按鈕清單 */
  private get rankTypeList(): RankTypeData[] {
    const rankTabData = this.rankTabData.find((tabData) => tabData.rankTabType === this.activeTab);
    return rankTabData?.rankTypeData ?? [];
  }

  /** 文字資料 */
  private textData = {
    title: '排行榜',
  };

  /** 圖片資料 */
  private imgData = {
    banner: imgPath.yellowBannerBaseUrl,
    whiteStar: imgPath.whiteStarIcon,
    yellowStar: imgPath.yellowStarIcon,
  };

  private mounted() {
    // 如果route未有參數傳遞預設0
    if (this.$route.params.id == null) {
      this.activeTab = 0;
    } else {
      this.activeTab = Number(this.$route.params.id);
    }
    // 每一頁籤預設第一個分類
    switch (this.activeTab) {
      case RankingTabType.TotalRankList:
        this.refreshRank(RankingRankType.UntilSchoolParticipation);
        break;
      case RankingTabType.StudentRankList:
        this.refreshRank(RankingRankType.StudentLastWeekContestPoints);
        break;
      case RankingTabType.TeacherRankList:
        this.refreshRank(RankingRankType.TeacherLastWeekContestPoints);
        break;
      case RankingTabType.PersonalBaseRankList:
        this.refreshRank(RankingRankType.AdornmentRankPoints);
        break;
    }
  }

  /** 抓取排行榜名稱 */
  private getRankTypeName(tabType: RankingTabType): string {
    return Object.values(RankingTabName)[tabType];
  }

  /** 刷新排行榜 */
  private async refreshRank(newRankType: RankingRankType): Promise<void> {
    this.activeRankType = newRankType;
    switch (this.activeRankType) {
      // 學校參與度
      case RankingRankType.UntilSchoolParticipation:
        await this.getEverySchoolSystemRankApi(1, 1);
        break;
      // 上週學校參與度
      case RankingRankType.UntilSchoolLastWeekParticipation:
        await this.getEverySchoolSystemRankApi(0, 1);
        break;
      // 競賽參與次數
      case RankingRankType.ContestParticipationTimes:
        await this.getRankContestPlayCountApi();
        break;
      // 學生上週競賽積分
      case RankingRankType.StudentLastWeekContestPoints:
        await this.getUserContestRankScoreApi(3, 1);
        break;
      // 學生累積競賽積分
      case RankingRankType.StudentUntilContestPoints:
        await this.getUserContestRankScoreApi(1, 1);
        break;
      // 學生上週英雄積分
      case RankingRankType.StudentLastWeekHeroPoints:
        await this.getRankUserHeroPointApi(3, 1);
        break;
      // 學生累積英雄積分
      case RankingRankType.StudentUntilHeroPoints:
        await this.getRankUserHeroPointApi(1, 1);
        break;
      // 老師上週競賽積分
      case RankingRankType.TeacherLastWeekContestPoints:
        await this.getUserContestRankScoreApi(3, 0);
        break;
      // 老師累積競賽積分
      case RankingRankType.TeacherUntilContestPoints:
        await this.getUserContestRankScoreApi(1, 0);
        break;
      // 老師上週英雄積分
      case RankingRankType.TeacherLastWeekHeroPoints:
        await this.getRankUserHeroPointApi(3, 0);
        break;
      // 老師累積英雄積分
      case RankingRankType.TeacherUntilHeroPoints:
        await this.getRankUserHeroPointApi(1, 0);
        break;
      // 老師指派任務積分
      case RankingRankType.TeacherTaskPoint:
        await this.getRankTeacherAssignTaskApi();
        break;
      // 老師指派任務完成率
      case RankingRankType.TeacherTaskRatePoint:
        await this.getRankTeacherAssignTaskRateApi();
        break;
      // 裝飾積分
      case RankingRankType.AdornmentRankPoints:
        await this.getAdornmentRankPointApi();
        break;
    }
  }

  /** 學校排名
   * @param counterType
   * @param systemType
   */
  private async getEverySchoolSystemRankApi(counterType: number, systemType: number): Promise<void> {
    // 組成封包
    const data = {
      counterType,
      systemType,
    };
    try {
      // API 取得學校排名
      const response: any = await everySchoolSystemRankAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      this.rankingList = response.schoolRank.map((item: any) => {
        return {
          id: item.schoolId,
          name: '',
          school: this.combineCountySchool(item.countyName, item.name),
          class: '',
          score: new BigNumber(item.totalCount).toFormat(),
        };
      });
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 競賽排名 */
  private async getRankContestPlayCountApi(): Promise<void> {
    // 組成封包
    const data = {
      selectType: 1,
    };
    try {
      // API 取得競賽排名
      const response: any = await rankContestPlayCountAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      this.rankingList = response.resList.map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          school: this.getGradeList(item.gradeList),
          class: '',
          score: new BigNumber(item.score).toFormat(),
        };
      });
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 積分排名
   * @param selectType
   * @param roleKey
   */
  private async getUserContestRankScoreApi(selectType: number, roleKey: number): Promise<void> {
    // 組成封包
    const data = {
      selectType,
      roleKey,
    };

    try {
      // API 取得積分排名
      const response: any = await userContestRankScoreAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      this.rankingList = response.resList.map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          school: this.combineCountySchool(item.countyName, item.schoolName),
          class: `${item.class}`,
          score: new BigNumber(item.score).toFormat(),
        };
      });
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 英雄積分
   * @param selectType
   * @param roleKey
   */
  private async getRankUserHeroPointApi(selectType: number, roleKey: number): Promise<void> {
    // 組成封包
    const data = {
      selectType,
      subjectType: 0,
      roleKey,
    };
    try {
      // API 取得英雄積分
      const response: any = await rankUserHeroPointAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      this.rankingList = response.resList.map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          school: this.combineCountySchool(item.countyName, item.schoolName),
          class: `${item.class}`,
          score: new BigNumber(item.score).toFormat(),
        };
      });
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 指派任務積分 */
  private async getRankTeacherAssignTaskApi(): Promise<void> {
    try {
      // API 取得指派任務積分排名
      const response: any = await rankUserAdlEduTeacherMissionPointAPI.fetch({});
      if (ResponseState.Success === response.result) {
        this.rankingList = response.resList.map((item: any) => {
          return {
            id: item.uid,
            name: `${item.name}`,
            school: this.combineCountySchool(item.countyName, item.schoolName),
            class: `${item.class}`,
            score: new BigNumber(item.score).toFormat(),
          };
        });
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 指派任務完成率 */
  private async getRankTeacherAssignTaskRateApi(): Promise<void> {
    try {
      // API 取得指派任務積分排名
      const response: any = await rankUserAdlEduTeacherMissionRatePointAPI.fetch({});
      if (ResponseState.Success === response.result) {
        this.rankingList = response.resList.map((item: any) => {
          return {
            id: item.uid,
            name: `${item.name}`,
            school: this.combineCountySchool(item.countyName, item.schoolName),
            class: `${item.class}`,
            score: new BigNumber(item.score).toFormat(),
          };
        });
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 裝飾積分排行榜 */
  private async getAdornmentRankPointApi(): Promise<void> {
    try {
      // API 取得裝飾積分排名
      const response: any = await adornmentPointRankAPI.fetch({});
      if (ResponseState.Success === response.result) {
        this.rankingList = response.resList.map((item: any) => {
          return {
            id: item.uid,
            name: `${item.name}`,
            school: this.combineCountySchool(item.countyName, item.schoolName),
            class: `${item.class}`,
            score: new BigNumber(item.score).toFormat(),
          };
        });
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 組合縣市和學校
   *  @param countyName 縣市別
   *  @param schoolName 學校名稱
   */
  private combineCountySchool(countyName: string, schoolName: string): string {
    return UIHelper.combineCountySchool(countyName, schoolName);
  }

  /** 數字陣列轉換為中文年級
   * @param gradeList
   */
  private getGradeList(gradeList: number[]): string {
    // 年級的中文
    const gradeType = ['小一', '小二', '小三', '小四', '小五', '小六', '國一', '國二', '國三', '高一', '高二', '高三'];

    // 全部年級都有參加, 無限制
    if (gradeList.length >= gradeType.length) {
      return '無限制';
    }

    // 小學
    const primaryGrade: string[] = [];
    const primaryMax: number = 6;

    // 國中
    const juniorGrade: string[] = [];
    const juniorMax: number = 9;

    // 高中
    const seniorGrade: string[] = [];
    const seniorMax: number = gradeType.length;

    // 轉換成文字
    gradeList.forEach((grade) => {
      const gradeIndex = grade - 1;
      const gradeStr = gradeType[gradeIndex];
      // 國小
      if (gradeIndex < primaryMax) {
        primaryGrade.push(gradeStr);
      }
      // 國中
      else if (gradeIndex < juniorMax) {
        juniorGrade.push(gradeStr);
      }
      // 高中
      else if (gradeIndex < seniorMax) {
        seniorGrade.push(gradeStr);
      }
    });

    // 檢查是否全國小
    if (primaryGrade.length === primaryMax) {
      primaryGrade.splice(0, primaryMax, '全國小');
    }

    // 檢查是否全國中
    if (juniorGrade.length === juniorMax - primaryMax) {
      juniorGrade.splice(0, juniorMax, '全國中');
    }

    // 檢查是否全高中
    if (seniorGrade.length === seniorMax - juniorMax) {
      seniorGrade.splice(0, seniorMax, '全高中');
    }

    return [...primaryGrade, ...juniorGrade, ...seniorGrade].join();
  }

  /** 點擊排行頁籤
   * @param rankTabType
   */
  private onClickTab(rankTabType: RankingTabType): void {
    this.activeTab = rankTabType;

    // 刷新當前類別第一的排行
    this.refreshRank(this.rankTypeList[0].rankType);
  }
}
</script>
