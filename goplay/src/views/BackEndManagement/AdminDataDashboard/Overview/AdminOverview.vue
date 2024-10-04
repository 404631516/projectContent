<template>
  <DataDashboard
    :chartLeftTitle="textData.countyComparison"
    :chartRightTitle="textData.miniGameWeighting"
    :chartLeftData="countyChartData"
    :chartRightData="gameChartData"
    :stats="stats"
    :answerInfoTitle="textData.subjectAnswerCountAndAccuracyRate"
    :answerInfoTitleBackgroundColor="titleBackgroundColor"
    :subjectAnswerJsonData="adminOverview.totalSubjectAnswerCount"
    :barChartTitle="textData.schoolLeaderBoardTop30"
    :barChartValueDescription="textData.schoolRank"
    :barChartLabelList="schoolName"
    :barChartValueList="contestCount"
    :barChartTitleBackgroundColor="titleBackgroundColor"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DataDashboardAPI } from '@/api/dataDashboard';
import { AdminOverviewDataResultDto } from '@/hero-api/dto/data-dashboard-overview.dto';
import { HeroJ7GameType, CountyType } from '@/helper/enum/Common';
import GameTypeHelper from '@/views/H5/Helper/GameTypeHelper';
import TableManager from '@/manager/TableManager';
import { everySchoolSystemRankAPI } from '@/api/contest';
import { Stat } from '@/components/DataDashboardOverview/Stats.vue';
import { EverySchoolSystemRankResultDto } from '@/helper/interface/Contest';
import DataDashboard from '@/views/DataDashboard/DataDashboard.vue';
import Helper from '@/views/H5/Helper/Helper';

@Component({
  components: {
    DataDashboard,
  },
})
export default class AdminOverview extends Vue {
  /** 後端獲取儀表板資訊 */
  private adminOverview: AdminOverviewDataResultDto = new AdminOverviewDataResultDto();
  /** 統計數據 */
  private stats: Stat[] = [];
  /** 小遊戲比資料 */
  private gameChartData: Map<string, number> = new Map<string, number>();
  /** 縣市比資料 */
  private countyChartData: Map<string, number> = new Map<string, number>();

  /** 學校名稱 */
  private schoolName: string[] = [];
  /** 登入次數 */
  private contestCount: number[] = [];
  /** 標題顏色 */
  private titleBackgroundColor = '#fd8523';

  /** 文字數據 */
  private textData = {
    countyComparison: '縣市比',
    miniGameWeighting: '小遊戲比',
    schoolLeaderBoardTop30: '參與次數學校排行',
    subjectAnswerCountAndAccuracyRate: '各科目答題次數及答題正確率',
    subjectName: '科目',
    questions: '答題次數',
    accuracy: '答題正確率(%)',
    accountCount: '總帳號數量',
    totalLoginCount: '總登入次數',
    totalAnswerCount: '總答題次數',
    totalOnlineHours: '總在線時數',
    schoolRank: '學校參與度',
  };

  async mounted() {
    this.adminOverview = await DataDashboardAPI.getAdminOverview();

    // 統計數據
    this.stats = [
      { title: this.textData.accountCount, value: this.adminOverview.totalAccountCount, unit: '人' },
      { title: this.textData.totalLoginCount, value: this.adminOverview.totalLoginCount, unit: '次' },
      { title: this.textData.totalAnswerCount, value: this.adminOverview.totalAnswerCount, unit: '次' },
      { title: this.textData.totalOnlineHours, value: this.adminOverview.totalOnlineTime, unit: '小時' },
    ];

    // 取得小遊戲比例數據
    const gameChartData: Record<number, number> = Helper.jsonParse<Record<number, number>>(
      this.adminOverview.totalGameModePlayCount,
    );

    this.gameChartData = new Map<string, number>(
      Object.entries(gameChartData).map(([key, value]) => {
        const gameTypeKey = Number(key) as HeroJ7GameType;
        const gameTypeName = GameTypeHelper.getGameTypeName(gameTypeKey);
        return [gameTypeName, value];
      }),
    );

    // 取得縣市比例數據
    const countyChartData = Helper.jsonParse<Record<number, number>>(this.adminOverview.totalCountyAccountCount);

    this.countyChartData = new Map<string, number>();
    Object.entries(countyChartData).forEach(([key, value]) => {
      const countyName = TableManager.county.findOne(Number(key))?.countyName || '未知區域';
      this.countyChartData.set(countyName, value);
    });

    // 取得學校參與次數排行榜數據
    const rankResultDto = (await everySchoolSystemRankAPI.fetch({
      counterType: 1,
      systemType: 1,
    })) as EverySchoolSystemRankResultDto;

    // 只取前30筆資料
    rankResultDto.schoolRank = rankResultDto.schoolRank.slice(0, 30);

    // 取得學校名稱和參與次數
    this.contestCount = rankResultDto.schoolRank.map((item) => item.totalCount);
    this.schoolName = rankResultDto.schoolRank.map((item) => `${item.countyName}${item.name}`);
  }
}
</script>
