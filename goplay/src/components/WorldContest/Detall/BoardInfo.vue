<template>
  <div class="board-wrapper">
    <div class="info-board">
      <!-- 賽事資訊 -->
      <div class="info-item contest-info">
        <!-- 時間 -->
        <p>
          {{ textData.time }}
          <span>{{ gameStart }}</span>
        </p>
        <!-- 年級 -->
        <p>{{ textData.grade }}</p>
        <!-- 國小 -->
        <div v-if="primaryGradeDescription">{{ primaryGradeDescription }}</div>
        <!-- 國中 -->
        <div v-if="secondaryGradeDescription">
          {{ secondaryGradeDescription }}
        </div>
        <!-- 高中 -->
        <div v-if="highSchoolGradeDescription">
          {{ highSchoolGradeDescription }}
        </div>
        <!-- 無年級 -->
        <div v-if="noSchoolGradeDescription">
          {{ noSchoolGradeDescription }}
        </div>
        <!-- 自定義 -->
        <div v-if="contestListData.gradeDescription"><br />{{ contestListData.gradeDescription }}</div>
      </div>
      <!-- 活動敘述 -->
      <div class="info-item activity-info h-180 <sm:min-h-20 <sm:h-auto">
        <p>{{ textData.narrate }}</p>
        <div class="info-content">
          <div v-html="contestListData.info"></div>
        </div>
      </div>
      <!-- 比賽獎勵 -->
      <div class="info-item game-info">
        <p>{{ textData.reward }}</p>
        <template>
          <div class="info-content">
            <!-- 參賽獎 -->
            <h2 v-show="gameRewardList.length > 0">
              {{ textData.participateReward }}
            </h2>
            <ol>
              <li v-for="(rewardItem, index) in gameRewardList" :key="index">
                <span>{{ getRewardName(rewardItem) }} * {{ rewardItem.count }}</span>
              </li>
            </ol>
            <!-- 排行獎勵 -->
            <h2 v-show="rankRewardList.length > 0">
              {{ textData.rankRewardTitle }}
            </h2>
            <ol>
              <li v-for="(rankItem, index) in rankRewardList" :key="index">
                <p>{{ getRankTitle(rankItem) }}</p>
                <span v-for="(rewardItem, index) in rankItem.rewardList" :key="index"
                  >{{ getRewardName(rewardItem) }} * {{ rewardItem.count }}</span
                >
              </li>
            </ol>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import WeaponManager from '@/manager/WeaponManager';
import { ContestListData, ContestGameAward, ContestRankRewardData } from '@/helper/interface/Contest';
import { DBBoolean } from '../../../helper/enum/Common';
import RewardManager from '@/manager/RewardManager';
import { toDayjs } from '../../../manager/TimeSyncManager';

@Component({})
export default class BoardInfo extends Vue {
  /** 賽事資訊 */
  @Prop() private contestListData!: ContestListData;

  /** 賽事遊戲時間 */
  private get gameStart(): string {
    // 開始時間
    return toDayjs(this.contestListData.gameStart).format('YYYY/MM/DD');
  }

  /** 參賽獎勵 */
  private get gameRewardList(): ContestGameAward[] {
    return JSON.parse(this.contestListData.gameReward.toString());
  }

  /** 排名獎勵 */
  private get rankRewardList(): ContestRankRewardData[] {
    return JSON.parse(this.contestListData.rankReward.toString());
  }

  /** 取得國小年級顯示 */
  private get primaryGradeDescription(): string {
    let result = '';
    if (this.contestListData.g1 === DBBoolean.True) {
      result += '1 ';
    }
    if (this.contestListData.g2 === DBBoolean.True) {
      result += '2 ';
    }
    if (this.contestListData.g3 === DBBoolean.True) {
      result += '3 ';
    }
    if (this.contestListData.g4 === DBBoolean.True) {
      result += '4 ';
    }
    if (this.contestListData.g5 === DBBoolean.True) {
      result += '5 ';
    }
    if (this.contestListData.g6 === DBBoolean.True) {
      result += '6 ';
    }

    return result.length > 0 ? `國小 ${result} 年級` : '';
  }

  /** 取得國中年級顯示 */
  private get secondaryGradeDescription(): string {
    let result = '';
    if (this.contestListData.g7 === DBBoolean.True) {
      result += '1 ';
    }
    if (this.contestListData.g8 === DBBoolean.True) {
      result += '2 ';
    }
    if (this.contestListData.g9 === DBBoolean.True) {
      result += '3 ';
    }

    return result.length > 0 ? `國中 ${result} 年級` : '';
  }

  /** 取得高中年級顯示 */
  private get highSchoolGradeDescription(): string {
    let result = '';
    if (this.contestListData.g10 === DBBoolean.True) {
      result += '1 ';
    }
    if (this.contestListData.g11 === DBBoolean.True) {
      result += '2 ';
    }
    if (this.contestListData.g12 === DBBoolean.True) {
      result += '3 ';
    }

    return result.length > 0 ? `高中 ${result} 年級` : '';
  }

  /** 取得無年級顯示 */
  private get noSchoolGradeDescription(): string {
    return this.contestListData.g0 === DBBoolean.True ? '非學生也可參加' : '';
  }

  /** 文字資料 */
  private textData = {
    time: '比賽時間',
    grade: '參賽年級',
    subject: '比賽科目',
    spec: '比賽賽制',
    score: '計分方式',
    narrate: '活動敘述',
    reward: '比賽獎勵',
    participateReward: '參賽獎勵',
    rankRewardTitle: '賽事排行獎勵',
  };

  /** 取得獎勵文字
   * @param awardItem
   */
  private getRewardName(awardItem: ContestGameAward): string {
    return RewardManager.getRewardItemName(awardItem);
  }

  /** 取得排名名稱
   * @param rankReward
   */
  private getRankTitle(rankReward: ContestRankRewardData): string {
    return rankReward.rankValue !== '-1' ? `${rankReward.rankValue}名` : '再接再厲獎';
  }

  /** 取得生物兵器名稱
   *  @param weaponId 生物兵器id
   */
  private getWeaponName(weaponId: number): string {
    const weaponData = WeaponManager.getWeaponTableData(weaponId);
    if (weaponData == null) {
      return `Null WeaponData id: ${weaponId}`;
    }
    return WeaponManager.getWeaponName(weaponData);
  }
}
</script>
<style lang="scss" scoped>
.board-wrapper {
  // margin-right: 1vw;
  .info-board {
    width: auto;
    text-align: left;
    p {
      font-size: 24px;
      color: #7c7c7a;
      margin-bottom: 14px;
      font-weight: 900;
    }
    span {
      font-size: 24px;
      color: #000;
      font-weight: 100;
    }
    .info-item {
      padding: 24px 35px;
      background-color: #f9f8f4;
      border-radius: 15px;
      color: #000;
      font-size: 24px;
      .info-content {
        word-break: break-all;
        h2 {
          margin-bottom: 0.5vw;
        }
        li {
          margin-bottom: 1vw;
          p {
            color: #000;
          }
          span {
            margin-bottom: 1vw;
          }
        }
      }
    }
    .contest-info {
      min-height: 242px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      span {
        margin-left: 11px;
      }
    }
    .activity-info {
      margin-top: 22px;
    }
    .game-info {
      margin-top: 14px;
      min-height: 10vh;
    }
  }
}
</style>
