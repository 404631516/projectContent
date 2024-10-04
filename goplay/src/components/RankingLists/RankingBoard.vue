<template>
  <div class="rank-board" v-if="rankTitleData">
    <h1 class="font-bold" p="b-5 <sm:t-5" border="b-2 solid [#B2B2B280]" text="3xl [#666666]">
      {{ rankTitleData.rankTitle }}
    </h1>
    <div class="rank-list-title" text="xl [#666666]">
      <!-- 名次 -->
      <div class="ranking" :style="{ width: rankTitleData.nameTitle === '' ? '30%' : '20%' }">
        {{ textData.rankingTitle }}
      </div>
      <!-- 名稱 -->
      <div class="name" v-if="rankTitleData.nameTitle">
        {{ rankTitleData.nameTitle }}
      </div>
      <!-- 年級 -->
      <div class="grade" :style="{ width: rankTitleData.nameTitle === '' ? '35%' : '25%' }">
        {{ rankTitleData.gradeTitle }}
      </div>
      <!-- 得分 -->
      <div class="score" :style="{ width: rankTitleData.nameTitle === '' ? '35%' : '25%' }">
        {{ rankTitleData.scoreTitle }}
      </div>
      <div v-if="isAdornmentRank" class="w-25 <sm:w-17" />
    </div>
    <!-- 排名列表 -->
    <RankListItem
      v-for="(rankData, index) in (sliceRankingList = rankingList.slice(0, rankingMax))"
      :key="index"
      :rankData="rankData"
      :ranking="getRanking(index, sliceRankingList)"
      :rankTitleData="rankTitleData"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import RankListItem from '@/components/RankingLists/RankListItem.vue';
import { RankingRankType, RankingSubTitle } from '@/helper/enum/Common';
import { RankingListItem, RankTitleData } from '@/helper/interface/Rank';

@Component({
  components: {
    RankListItem,
  },
})
export default class RankingBoard extends Vue {
  /** 排名資料 */
  @Prop(Array) public rankingList!: RankingListItem[];
  /** 排行類別 */
  @Prop() public rankType!: RankingRankType;

  /** 顯示排行數量 */
  private readonly rankingMax: number = 50;

  /** 排行標題資料 */
  private readonly rankTitleList: RankTitleData[] = [
    {
      rankType: RankingRankType.UntilSchoolParticipation,
      rankTitle: RankingSubTitle.UntilSchoolParticipation + '總排行',
      nameTitle: '',
      gradeTitle: '學校',
      scoreTitle: '比賽參與次數',
      scoreTypeTitle: '次',
    },
    {
      rankType: RankingRankType.UntilSchoolLastWeekParticipation,
      rankTitle: RankingSubTitle.UntilSchoolLastWeekParticipation + '總排行',
      nameTitle: '',
      gradeTitle: '學校',
      scoreTitle: '比賽參與次數',
      scoreTypeTitle: '次',
    },
    {
      rankType: RankingRankType.ContestParticipationTimes,
      rankTitle: RankingSubTitle.ContestParticipationTimes + '總排行',
      nameTitle: '名稱',
      gradeTitle: '年級',
      scoreTitle: '參與次數',
      scoreTypeTitle: '次',
    },
    {
      rankType: RankingRankType.StudentLastWeekContestPoints,
      rankTitle: RankingSubTitle.StudentLastWeekContestPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.StudentUntilContestPoints,
      rankTitle: RankingSubTitle.StudentUntilContestPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.StudentLastWeekHeroPoints,
      rankTitle: RankingSubTitle.StudentLastWeekHeroPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.StudentUntilHeroPoints,
      rankTitle: RankingSubTitle.StudentUntilHeroPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.TeacherLastWeekContestPoints,
      rankTitle: RankingSubTitle.TeacherLastWeekContestPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.TeacherUntilContestPoints,
      rankTitle: RankingSubTitle.TeacherUntilContestPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.TeacherLastWeekHeroPoints,
      rankTitle: RankingSubTitle.TeacherLastWeekHeroPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.TeacherUntilHeroPoints,
      rankTitle: RankingSubTitle.TeacherUntilHeroPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '積分',
      scoreTypeTitle: '分',
    },
    {
      rankType: RankingRankType.TeacherTaskPoint,
      rankTitle: RankingSubTitle.TeacherTaskPoint,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '次數',
      scoreTypeTitle: '次',
    },
    {
      rankType: RankingRankType.TeacherTaskRatePoint,
      rankTitle: RankingSubTitle.TeacherTaskRatePoint,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '完成率',
      scoreTypeTitle: '%',
    },
    {
      rankType: RankingRankType.AdornmentRankPoints,
      rankTitle: RankingSubTitle.AdornmentRankPoints,
      nameTitle: '名稱',
      gradeTitle: '學校/班級',
      scoreTitle: '個人佈置積分',
      scoreTypeTitle: '分',
    },
  ];

  /** 文字資料 */
  private textData = {
    rankingTitle: '名次',
  };

  /** 取得當前排行標題資料 */
  private get rankTitleData(): RankTitleData | undefined {
    return this.rankTitleList.find((rankTitleData) => rankTitleData.rankType === this.rankType);
  }

  /** 是否為個人基地排行榜 */
  private get isAdornmentRank(): boolean {
    return this.rankType === RankingRankType.AdornmentRankPoints;
  }

  /** 將index轉換成排名
   * @param index index兼排名
   * @param rankingList 排名清單
   */
  private getRanking(index: number, rankingList: RankingListItem[]): number {
    // 如果與前一個排名同分，則使用相同的排名
    while (index > 0 && rankingList[index].score === rankingList[index - 1].score) {
      index -= 1;
    }
    return index;
  }
}
</script>
<style lang="scss" scoped>
.rank-board {
  padding: 60px;
  @media (max-width: 435px) {
    padding: 0px;
  }
  .rank-list-title {
    display: flex;
    margin: 30px 0px;
    .ranking {
      width: 20%;
    }
    .name {
      width: 30%;
    }
    .grade {
      width: 25%;
    }
    .score {
      width: 25%;
    }
  }
}
</style>
