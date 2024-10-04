<template>
  <div class="rank-wrapper">
    <div v-if="rankType !== ResultRankType.Personal" class="rank-top flex-pos">
      <!-- 標題 -->
      <span class="rank-icon" :style="`background: url(${imgData.rankIcon})`" />
      {{ textData.rankTitle }}
    </div>
    <!-- 列表顯示 -->
    <div v-if="rankType === ResultRankType.Total" class="rank-body" :style="`height: ${rankHeight}px`">
      <div class="list">
        <div v-if="rankLists.length < 1">
          {{ textData.noRankData }}
        </div>
        <ol class="flex-pos" v-for="(item, index) in rankLists" :key="index">
          <li
            :style="index === 0 ? `background-image: url(${imgData.crownIcon}); background-position:left` : ''"
            :class="[index === 0 ? 'no_1' : '', index === 1 ? 'no_2' : '', index === 2 ? 'no_3' : '']"
          >
            {{ rankText(item.rank) }}
          </li>
          <li :class="[index === 0 ? 'no_1' : '', index === 1 ? 'no_2' : '', index === 2 ? 'no_3' : '']">
            {{ getSchoolName(rankPlayerInfo(item).school) }}
          </li>
          <li :class="[index === 0 ? 'no_1' : '', index === 1 ? 'no_2' : '', index === 2 ? 'no_3' : '']">
            {{ rankPlayerInfo(item).name }}
          </li>
          <li :class="[index === 0 ? 'point_1' : '']">
            <span>{{ getPoint(item) }}</span
            >{{ textData.points }}
          </li>
        </ol>
      </div>
    </div>
    <!-- 我的排行 -->
    <div v-if="rankType === ResultRankType.Personal" class="rank-footer">
      <!-- 標題 -->
      <div class="rank-footer flex-pos">
        {{ textData.rankMyTitle }}
      </div>
      <!-- 排名 -->
      <div class="myrank-box">
        <ol class="flex-pos" v-if="myRankData">
          <li v-if="myRankData.rank !== -1">{{ rankText(myRankData.rank) }}</li>
          <li v-if="myRankData.rank === -1">{{ textData.notRanked }}</li>
          <li class="truncate">{{ userSchoolName }}</li>
          <li class="truncate">{{ userName }}</li>
          <li>
            <p v-if="getPoint(myRankData) > 0">
              <span>{{ getPoint(myRankData) }}</span
              >{{ textData.points }}
            </p>
            <p v-else>{{ textData.noPoints }}</p>
          </li>
        </ol>
        <div v-else>{{ textData.notYetChallenge }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { RankRuleType, ResultRankType } from '@/helper/enum/Common';
import imgPath from '@/config/imgPath/imgPath';
import { RankData, RankDetailData, RankListData, RankUserInfo } from '@/helper/interface/Rank';

@Component({})
export default class RankList extends Vue {
  /** 排行榜類型 */
  @Prop(Number) private rankType!: ResultRankType;
  /** 尚未挑戰過賽事 */
  @Prop() private rankRule!: RankRuleType;
  /** 調整排行榜顯示高度 */
  @Prop() private rankHeight!: number;
  /**取得排行榜資料 */
  @Prop() private rankData!: RankData;

  /** 排行榜類型 */
  private ResultRankType = ResultRankType;

  // 文字資料
  private textData = {
    rankTitle: '排行榜',
    rankMyTitle: '我的排行',
    noRankData: '目前無排行資訊',
    notRanked: '還差一點就能進1000名了',
    points: '分',
    noPoints: '---',
    notYetChallenge: '尚未挑戰過賽事',
    noSchoolData: '此身分未提供學校資訊',
  };

  // 圖片資料
  private imgData = {
    rankIcon: imgPath.rankIcon,
    crownIcon: imgPath.crownIcon,
  };

  /** 總排行成績 */
  private get rankLists(): RankListData[] {
    return this.rankData.rankList;
  }

  /** 個人排行 */
  private get myRankData(): RankDetailData | null {
    return this.rankData.selfRank;
  }

  /** 使用者名字 */
  private get userName(): string {
    return this.$$store.getters.userName;
  }

  /** 使用者學校名稱 */
  private get userSchoolName(): string {
    return this.getSchoolName(this.$$store.getters.userSchoolName);
  }

  /** 玩家資訊
   * @param rankListData 排名資料
   */
  private rankPlayerInfo(rankListData: RankListData): RankUserInfo {
    return rankListData.playerInfo;
  }

  /** 排名中文
   * @param rank 排名
   */
  private rankText(rank: number): string {
    return `第${rank}名`;
  }

  /** 學校名字
   * @param schoolName 學校名字
   */
  private getSchoolName(schoolName: string): string {
    return schoolName === '' ? this.textData.noSchoolData : schoolName;
  }

  /** 排名分數
   * @param rankListData 排名資料
   */
  private getPoint(rankListData: RankDetailData): number {
    return this.rankRule === RankRuleType.AdlEdu ? rankListData.totalScore : rankListData.bestScore;
  }
}
</script>
<style lang="scss" scoped>
// 排行榜組件(大)
.rank-wrapper {
  height: 100%;
  .rank-top {
    background-color: #eea73d;
    margin: auto 2vw;
    font-size: 32px;
    height: 62px;
    line-height: 62px;
    color: #fff;
    border-radius: 30px;
    span {
      &.rank-icon {
        display: inline-block;
        width: 45px;
        height: 50px;
        background-repeat: no-repeat !important;
        background-size: contain !important;
        margin-right: 0.5vw;
      }
    }
  }
  .rank-body {
    min-height: 320px;
    margin: 1vw 2vw;
    overflow: auto;
    .list {
      position: relative;
      margin: 0 auto;
      width: 90%;
      font-size: 20px;
      color: #878787;
      li {
        width: 30vw;
        height: 80px;
        line-height: 80px;
        border-bottom: 1px solid #d9d9d9;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &.no_1 {
          color: #f2ba0f;
          font-size: 30px;
          background-repeat: no-repeat !important;
        }
        &.no_2 {
          color: #878787;
          font-size: 27px;
        }
        &.no_3 {
          color: #878787;
          font-size: 24px;
        }
        &.name_1 {
          font-size: 42px;
        }
        &.name_2 {
          font-size: 35px;
        }
        &.point_1 {
          font-size: 42px;
        }
        span {
          display: inline-block;
          color: #d69f05;
          margin-right: 10px;
        }
      }
    }
  }
  .rank-footer {
    background-color: #eea73d;
    margin: auto 2vw;
    font-size: 32px;
    height: 62px;
    line-height: 62px;
    color: #fff;
    border-radius: 30px;
    .myrank-box {
      position: relative;
      margin: 1vw auto 0;
      width: 95%;
      height: auto;
      font-size: 20px;
      color: #878787;
      li {
        width: 30vw;
        height: 80px;
        text-align: center;
        span {
          display: inline-block;
          color: #ffde39;
          margin-right: 10px;
        }
      }
    }
  }
  //捲軸底色
  ::-webkit-scrollbar-track {
    margin: 0 35px;
    background-color: inherit;
    border: 1px solid #fdc221;
    border-radius: 10px;
  }
  //捲軸寬度
  ::-webkit-scrollbar {
    height: 13px;
  }
  //捲軸本體顏色
  ::-webkit-scrollbar-thumb {
    background: #fdc221;
    border-radius: 10px;
  }
}
@media (max-width: 575.98px) {
  .rank-wrapper {
    .no_1 {
      background: none !important;
    }
  }
}
</style>
