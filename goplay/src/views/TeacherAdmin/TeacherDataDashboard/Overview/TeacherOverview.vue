<template>
  <DataDashboard
    ref="dataDashboard"
    :chartLeftTitle="textData.miniGameWeighting"
    :chartRightTitle="textData.subjectWeighting"
    :chartLeftData="gameChartData"
    :chartRightData="subjectChartData"
    :stats="stats"
    :answerInfoTitle="textData.pastYearSchoolSubjectAnswerCountAndAccuracy"
    :answerInfoTitleBackgroundColor="titleBackgroundColor"
    :subjectAnswerJsonData="teacherOverview.schoolSubjectAnswerCountOneYear"
    :barChartTitle="textData.pastYearSchoolHeroRanking"
    :barChartValueDescription="textData.name"
    :barChartLabelList="heroNameList"
    :barChartValueList="heroRankList"
    :barChartTitleBackgroundColor="titleBackgroundColor"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DataDashboardAPI } from '@/api/dataDashboard';
import { TeacherOverviewDataResultDto } from '@/hero-api/dto/data-dashboard-overview.dto';
import { HeroJ7GameType, SubjectType } from '@/helper/enum/Common';
import { toSubjectName } from '@/helper/fnc/common';
import HeroManager from '@/manager/HeroManager';
import GameTypeHelper from '@/views/H5/Helper/GameTypeHelper';
import { Stat } from '@/components/DataDashboardOverview/Stats.vue';
import { SubjectAnswerInfo } from '@/components/DataDashboardOverview/SubjectAnswerInfoTable.vue';
import Helper from '@/views/H5/Helper/Helper';
import DataDashboard from '@/views/DataDashboard/DataDashboard.vue';

@Component({
  components: {
    DataDashboard,
  },
})
export default class TeacherOverview extends Vue {
  /** 後端獲取儀表板資訊 */
  private teacherOverview: TeacherOverviewDataResultDto = new TeacherOverviewDataResultDto();
  /** 統計數據 */
  private stats: Stat[] = [];
  /** 小遊戲比資料 */
  private gameChartData: Map<string, number> = new Map<string, number>();
  /** 科目比資料 */
  private subjectChartData: Map<string, number> = new Map<string, number>();

  /** 英雄名稱 */
  private heroNameList: string[] = [];
  /** 英雄排行 */
  private heroRankList: number[] = [];
  /** 標題顏色 */
  private titleBackgroundColor = '#a08efe';

  /** 文字數據 */
  private textData = {
    subjectWeighting: '科目比',
    miniGameWeighting: '小遊戲比',
    pastYearSchoolHeroRanking: '過去一年校內英雄排行榜',
    pastYearSchoolSubjectAnswerCountAndAccuracy: '過去一年校內各科答題次數及答題正確率',
    name: '科目',
    questions: '答題次數',
    accuracy: '答題正確率(%)',
    memberCount: '校內會員人數',
    totalLoginCount: '校總登入次數',
    totalAnswerCount: '校總答題次數',
    totalOnlineHours: '校總在線時數',
    loginCount: '登入次數',
  };

  async mounted() {
    this.teacherOverview = await DataDashboardAPI.getTeacherOverview();

    // 學生統計數據
    this.stats = [
      { title: this.textData.memberCount, value: this.teacherOverview.schoolTotalAccountCount, unit: '人' },
      { title: this.textData.totalLoginCount, value: this.teacherOverview.schoolTotalLoginCount, unit: '次' },
      { title: this.textData.totalAnswerCount, value: this.teacherOverview.schoolTotalAnswerCount, unit: '次' },
      { title: this.textData.totalOnlineHours, value: this.teacherOverview.schoolTotalOnlineTime, unit: '小時' },
    ];

    // 解析科目比數據
    const subjectChartData = Helper.jsonParse<Record<SubjectType, SubjectAnswerInfo>>(
      this.teacherOverview.schoolSubjectAnswerCountOneYear,
    );

    for (const [key, value] of Object.entries(subjectChartData)) {
      this.subjectChartData.set(toSubjectName(Number(key) as SubjectType), value.quizAnswerCount);
    }

    // 解析小遊戲比數據
    const gameChartData = Helper.jsonParse<Record<number, number>>(this.teacherOverview.schoolGameModePlayCountOneYear);

    this.gameChartData = new Map<string, number>(
      Object.entries(gameChartData).map(([key, value]) => {
        const gameTypeKey = Number(key) as HeroJ7GameType;
        const gameTypeName = GameTypeHelper.getGameTypeName(gameTypeKey);
        return [gameTypeName, value];
      }),
    );

    // 解析英雄排行榜數據
    const heroRankChartData = Helper.jsonParse<Record<string, number>>(this.teacherOverview.schoolHeroRankingOneYear);

    Object.entries(heroRankChartData).forEach(([key, value]) => {
      // 獲取英雄名稱
      const heroName = HeroManager.getHeroData(Number(key))?.nameKey || '';
      // 翻譯英雄名稱
      const translatedHeroName = this.$t(`common.${heroName}`) as string;

      // 將英雄名稱存入 heroName 陣列
      this.heroNameList.push(translatedHeroName);
      // 將英雄排名存入 heroRank 陣列
      this.heroRankList.push(value);
    });
  }
}
</script>
