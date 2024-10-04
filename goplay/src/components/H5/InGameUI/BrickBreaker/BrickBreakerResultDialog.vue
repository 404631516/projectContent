<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :destroy-on-close="true"
    :show-close="false"
    :close-on-click-modal="false"
    @open="onOpenDialog"
    :before-close="onCloseDialog"
    top="6vh"
  >
    <!-- 標題 -->
    <div
      slot="title"
      class="flex justify-center items-center rounded-30px title_text"
      p="y-4"
      text="32px [#FFF]"
      bg="[#EEA73D]"
    >
      {{ getScoreTitle(currentPage) }}
    </div>
    <!-- 內文 -->
    <div class="flex flex-col items-center">
      <!-- 個人得分列表 -->
      <div v-if="currentPage === ScoreShowType.Personal" class="w-full">
        <!-- 總分 -->
        <div class="flex justify-center items-center <sm:(flex-col)" p="y-3" text="30px [#878787]">
          <!-- YOU圖片 -->
          <img :src="imgData.selfTag" class="w-30 object-contain" />
          <div class="flex justify-center items-center">
            <!-- 英雄頭像 -->
            <div class="w-18 aspect-square rounded-40px" bg="[#00000080]">
              <img :src="getHeroImgUrl(personalData.heroId)" class="h-full block object-contain" />
            </div>
            <!-- 名字 -->
            <span m="l-3">{{ personalData.name }}</span>
          </div>
          <!-- 分數 -->
          <span text="57px [#F2BA0F]" m="x-4">
            {{ personalData.score }}
            <span text="30px [#878787]">{{ textData.point }}</span>
          </span>
        </div>
        <!-- 得分種類列表 -->
        <div class="w-[90%]" m="x-auto" p="x-15 <sm:x-0" border="t-1px b-1px solid [#B2B2B2]" text="22px">
          <div
            v-for="(score, index) in personalScoreList"
            :key="index"
            class="grid sm:grid-cols-[8fr,1.5fr,0.5fr] rounded-30px items-center <sm:(grid-rows-2)"
            m="y-3"
            p="x-2 y-1"
            bg="[#4A4A4A]"
          >
            <!-- 得分種類 -->
            <span class="rounded-30px" p="y-3 x-6" bg="[#E9E9E9]" text="[#878787] left <sm:center">
              {{ scoreBoardIndex[index].title }}
            </span>
            <!-- 分數 -->
            <span text="30px [#2CEAEC] right <sm:center">{{ score }}</span>
            <span class="<sm:hidden" text="[#FFF]">{{ scoreBoardIndex[index].unit }}</span>
          </div>
        </div>
      </div>
      <!-- 全體MVP列表 -->
      <div v-if="currentPage === ScoreShowType.AllMvp" class="w-full">
        <div class="flex justify-center items-center <sm:(flex-col)" p="y-3" text="30px [#878787]">
          <!-- MVP圖 -->
          <img :src="imgData.mvpImg" class="w-30 object-contain" />
          <div class="flex justify-center items-center">
            <!-- 英雄頭像 -->
            <div class="w-18 aspect-square rounded-40px" bg="[#00000080]">
              <img :src="getHeroImgUrl(mvpHeroId)" class="h-full block object-contain" />
            </div>
            <!-- MVP名字 -->
            <span m="l-3">{{ mvpName }}</span>
          </div>
          <!-- MVP分數 -->
          <span text="57px [#F2BA0F]" m="x-4">
            {{ mvpScore }}
            <span text="30px [#878787]">{{ textData.point }}</span>
          </span>
        </div>
        <!-- 賽事結算狀態 -->
        <div class="w-[90%]" m="x-auto" p="x-15 y-3 <sm:x-0" border="t-1px solid [#B2B2B2]" text="22px">
          <div class="flex items-center justify-center">
            <img :src="imgData.clock" class="w-12 aspect-square object-contain" />
            <p text="2xl [#4A4A4A]">{{ textData.spendTime }}</p>
            <p m="l-2" text="3xl [#1BD3D5]">{{ contestFinishStatus.gamePlayTime }}</p>
          </div>
          <div
            class="grid sm:(grid-cols-[8fr,1.5fr,0.5fr]) rounded-30px items-center <sm:(grid-rows-2)"
            m="t-3"
            p="x-2 y-1"
            bg="[#4A4A4A]"
          >
            <!-- 累積傷害 -->
            <span class="rounded-30px" p="y-3 x-6" bg="[#E9E9E9]" text="[#878787] left">
              {{ textData.totalDamage }}
            </span>
            <!-- 分數 -->
            <span text="30px [#2CEAEC] right <sm:center">{{
              contestFinishStatus.bossTotalHp - contestFinishStatus.bossHp
            }}</span>
          </div>
        </div>
        <!-- 其他種類MVP -->
        <div class="w-[90%]" m="x-auto" p="x-15 <sm:x-0" border="t-1px b-1px solid [#B2B2B2]" text="22px">
          <div
            v-for="(result, index) in resultList"
            :key="index"
            class="grid sm:(grid-cols-[8fr,1.5fr,0.5fr]) rounded-30px items-center <sm:(grid-rows-2)"
            m="y-3"
            p="x-2 y-1"
            bg="[#4A4A4A]"
          >
            <!-- 灰底 -->
            <div
              class="flex sm:(justify-between) rounded-30px overflow-hidden <sm:(grid grid-rows-2 justify-items-center)"
              bg="[#E9E9E9]"
            >
              <!-- MVP種類 -->
              <span p="y-3 x-6" text="[#878787] left">{{ scoreBoardIndex[index].title }}</span>
              <!-- 傾斜塊 -->
              <div
                class="flex items-center transform -skew-x-30"
                p="l-5 <sm:l-0"
                m="-r-2"
                bg="[#8FE9C5] <sm:transparent"
              >
                <!-- 資料塊 -->
                <div class="flex items-center transform skew-x-30 rounded-r-30px z-1" p="r-14 <sm:r-0">
                  <template v-if="result.vueMvpData.count === 0">
                    <span p="l-17 <sm:l-0">{{ textData.noMvpShow }}</span>
                  </template>
                  <!-- 英雄頭像 -->
                  <template v-else>
                    <div class="w-40px h-40px rounded-30px" m="r-1" border="1px solid [#FFF]" bg="[#00000080]">
                      <img
                        :src="getHeroImgUrl(result.vueMvpData.heroId)"
                        class="w-40px object-contain aspect-square rounded-30px"
                      />
                    </div>
                    <!-- 名字 -->
                    {{ result.vueMvpData.name }}
                  </template>
                </div>
              </div>
            </div>
            <!-- 分數 -->
            <span text="30px [#2CEAEC] right <sm:center">{{ result.vueMvpData.count }}</span>
            <span class="<sm:hidden" text="[#FFF]">{{ scoreBoardIndex[index].unit }}</span>
          </div>
        </div>
      </div>
      <!-- 答題總排行 -->
      <div
        v-if="currentPage === ScoreShowType.TotalAnswerRank"
        class="w-full h-135 grid grid-cols-3 grid-rows-[1fr,9fr]"
        m="b-6"
      >
        <template v-if="answerRankList.length > 0">
          <!-- 標題 -->
          <div
            v-for="(data, index) in totalAnswerRankList"
            :key="'title' + index"
            m="t-6.5"
            text="2xl [#4A4A4A]"
            font="bold"
          >
            {{ data.title }}
          </div>
          <!-- 排行榜 -->
          <div
            v-for="(data, index) in totalAnswerRankList"
            :key="index"
            class="h-full overflow-auto no-scrollbar"
            m="t-3 b-auto"
            p="x-4"
            :border="index === totalAnswerRankList.length - 1 ? '' : 'r-1px solid [#B2B2B2]'"
          >
            <div
              v-for="(rankData, rank) in data.rankList"
              :key="rank"
              class="grid grid-cols-3 rounded-[30px]"
              p="y-2 x-7"
              m="b-2"
              :text="rank === 0 ? 'xl [#F2BA0F]' : 'xl [#878787]'"
              bg="[#E9E9E9]"
            >
              <span>{{ rankToString(rankData.rank) }}</span>
              <span>{{ rankData.name }}</span>
              <span>{{ rankData.score }}{{ data.unit }}</span>
            </div>
          </div>
        </template>
        <!-- 無排名資料 -->
        <template v-else>
          <span class="col-span-3 row-span-2 flex items-center justify-center" text="2xl [#4A4A4A]" font="bold">
            {{ textData.noAnswerRank }}
          </span>
        </template>
      </div>
      <!-- 全體得分排名 -->
      <div v-if="currentPage === ScoreShowType.AllScore" class="w-full">
        <div
          class="overflow-auto scrollbar"
          m="x-auto y-6"
          p="x-8 <sm:x-0"
          text="20px"
          :class="myRankData ? 'h-110' : 'h-135'"
        >
          <BrickBreakerRankComponent
            v-for="(rankData, index) in contestRankList"
            :key="index"
            :border="index === 0 ? '' : 't-1px solid [#B2B2B2]'"
            :rankData="rankData"
            :unit="textData.point"
          />
        </div>
        <!-- 我的排行 -->
        <template v-if="myRankData">
          <div
            class="flex justify-center items-center rounded-30px title_text"
            p="y-4"
            text="32px [#FFF]"
            bg="[#EEA73D]"
          >
            {{ textData.myRank }}
          </div>
          <BrickBreakerRankComponent :rankData="myRankData" :unit="textData.point" />
        </template>
      </div>
    </div>
    <!-- 底部按鈕列 -->
    <div slot="footer" class="flex justify-center items-center" text="20px [#FFF]">
      <!-- 上一頁 -->
      <button
        v-if="currentPage !== startPage"
        class="w-224px rounded-30px bg-gradient-to-b from-[#2FF994] to-[#15CE00] shadow-default"
        p="y-2"
        @click="currentPage--"
      >
        {{ textData.previousPage }}
      </button>
      <!-- 下一頁 -->
      <button
        v-if="currentPage !== ScoreShowType.MAX - 1"
        class="w-224px rounded-30px bg-gradient-to-b from-[#2FF994] to-[#15CE00] shadow-default"
        p="y-2"
        m="l-5"
        @click="currentPage++"
      >
        {{ textData.nextPage }}
      </button>
      <!-- 離開賽事 -->
      <button v-else class="w-224px rounded-30px blueGradient shadow-default" p="y-2" m="l-5" @click="onCloseDialog">
        {{ textData.exitContest }}
      </button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, ModelSync, Emit } from 'vue-property-decorator';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import {
  BrickBreakerGameFinishStatus,
  BrickBreakerRankData,
  BrickBreakerRankType,
  BrickBreakerVueUserAnswerData,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import { BrickBreakerAvatarDataWithScore } from '@/views/H5/Games/BrickBreaker/Dialogs/BrickBreakerRankDialog';
import imgPath from '@/config/imgPath/imgPath';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import { BrickBreakerScoreList } from '@/helper/interface/Game';
import Config from '@/config/setting';
import BrickBreakerRankComponent from './BrickBreakerRankComponent.vue';

/** 分數顯示類型 */
enum ScoreShowType {
  /** 個人分數 */
  Personal = 1,
  /** 各項Mvp */
  AllMvp,
  /** 答題總排行 */
  TotalAnswerRank,
  /** 總分排行 */
  AllScore,
  MAX,
}

/** 答題排行 */
interface BrickBreakerAnswerRank {
  /** 標題 */
  title: string;
  /** 排名資料 */
  rankList: BrickBreakerAnswerRankData[];
  /** 單位 */
  unit: string;
}

/** 答題排名資料 */
interface BrickBreakerAnswerRankData {
  /** 排名 */
  rank: number;
  /** 名字 */
  name: string;
  /** 分數 */
  score: number;
}

@Component({
  components: {
    BrickBreakerRankComponent,
  },
})
export default class BrickBreakerResultDialog extends Vue {
  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 個人分數資料 */
  private personalScoreList: number[] = [];
  /** mvp分數資料 */
  private resultList: BrickBreakerRankData[] = [];
  /** MVP的出戰英雄 */
  private mvpHeroId: number = 0;
  /** MVP的名字 */
  private mvpName: string = '';
  /** MVP的分數 */
  private mvpScore: number = 0;
  /** 分數顯示類型 */
  private currentPage: ScoreShowType = 0;
  /** 紀錄起始頁 */
  private startPage: ScoreShowType = 0;
  /** 總答題數排行 */
  private totalAnswerRankList: BrickBreakerAnswerRank[] = [];
  /** 詳細資訊的分數標題 */
  private scoreBoardIndex: Array<{ title: string; unit: string }> = [];
  /** 分數顯示類型 */
  private ScoreShowType = ScoreShowType;

  /** 文字資料 */
  private textData = {
    gameResult: '遊戲結算',
    spendTime: '花費時間',
    totalDamage: '累積傷害',
    allScoreRank: '總分排行榜',
    myRank: '我的排行',
    previousPage: '上一頁',
    nextPage: '下一頁',
    exitContest: '離開賽事',
    point: '分',
    noMvpShow: '從缺',
    noAnswerRank: '目前無答題排名資料',
  };

  /** 圖片資料 */
  private imgData = {
    selfTag: imgPath.selfTag,
    mvpImg: imgPath.mvpImg,
    crown: imgPath.crownIcon,
    clock: `${Config.imgUrl}/img/h5/brickBreaker/timerIcon.png`,
  };

  /** 是否有玩家個人分數資料 */
  private get hasPersonalData(): boolean {
    return this.personalScoreList.length > 0;
  }

  /** 取得所有參賽玩家分數列表 */
  private get playerScoreList(): BrickBreakerAvatarDataWithScore[] {
    return this.$$store.state.BrickBreakerModule.playerScoreList;
  }

  /** 取得總分排名資料 */
  private get contestRankList(): BrickBreakerScoreList[] {
    return this.$$store.state.BrickBreakerModule.contestRankList;
  }

  /** 取得答題排行資料 */
  private get answerRankList(): BrickBreakerVueUserAnswerData[] {
    return this.$$store.state.BrickBreakerModule.answerRankList;
  }

  /** 賽事結算狀態 */
  private get contestFinishStatus(): BrickBreakerGameFinishStatus {
    return this.$$store.state.BrickBreakerModule.gameFinishStatus;
  }

  /** 取得個人排名 */
  private get myRankData(): BrickBreakerScoreList | undefined {
    return this.contestRankList.find((player) => player.uid === this.$$store.getters.userUid);
  }

  /** 取得個人詳細分數資料 */
  private get personalData(): BrickBreakerAvatarDataWithScore | undefined {
    return this.playerScoreList.find((player) => player.uid === this.$$store.getters.userUid);
  }

  /** 開啟Dialog */
  onOpenDialog() {
    this.getPlayerScoreList();
    this.getMvpScoreList();
    this.getAnswerRankList();
    // 如果有個人分數則先顯示
    this.startPage = this.hasPersonalData ? ScoreShowType.Personal : ScoreShowType.AllMvp;
    this.currentPage = this.startPage;
  }

  /** 處理玩家分數詳細資料 */
  private getPlayerScoreList(): void {
    // 清空
    this.personalScoreList.splice(0);

    // 抓參賽玩家分數列表
    if (this.personalData != null) {
      // 把資料提取出來
      this.personalScoreList.push(
        ...[
          this.personalData.bossDamage,
          this.personalData.bossHitSuccessCount,
          this.personalData.correctCount,
          this.personalData.hornCount,
          this.personalData.defenseCount,
          this.personalData.answerTreasureCount,
          this.personalData.treasureCount,
          this.personalData.brickBreakCount,
        ]
      );
    }
  }

  /** 處理MVP排名資料 */
  private getMvpScoreList(): void {
    // 清空
    this.resultList.splice(0);
    this.scoreBoardIndex.splice(0);

    // 取出MVP資料
    const mvpScore = this.$$store.state.BrickBreakerModule.contestResultData.find(
      (rank) => rank.rankType === BrickBreakerRankType.GameScore
    );
    if (mvpScore != null) {
      this.mvpHeroId = mvpScore.vueMvpData.heroId;
      this.mvpName = mvpScore.vueMvpData.name;
      this.mvpScore = mvpScore.vueMvpData.count;
    }

    // 其他MVP資料
    const resultDataList = this.$$store.state.BrickBreakerModule.contestResultData;
    for (let i = 1; i < BrickBreakerRankType.MAX; i++) {
      const resultData = resultDataList.find((data) => data.rankType === i);
      if (resultData != null) {
        this.resultList.push(resultData);
      }
      this.scoreBoardIndex.push({
        title: Localization.getText(LocalKeyType.Common, `brickBreaker_resultTitle_${BrickBreakerRankType[i]}`),
        unit: Localization.getText(LocalKeyType.Common, `brickBreaker_resultUnit_${BrickBreakerRankType[i]}`),
      });
    }
  }

  /** 處理答題排名資料 */
  private getAnswerRankList(): void {
    // 答題數
    const totalAnswerCountRankList: BrickBreakerAnswerRankData[] = [];
    this.answerRankList.sort((a, b) => {
      return b.totalAnswerCount - a.totalAnswerCount;
    });
    this.answerRankList.map((rankData, index) => {
      // 同分要同名次
      let rank = index + 1;
      if (index > 0 && rankData.totalAnswerCount === this.answerRankList[index - 1].totalAnswerCount) {
        rank = totalAnswerCountRankList[totalAnswerCountRankList.length - 1].rank;
      }
      totalAnswerCountRankList.push({
        rank,
        name: rankData.name,
        score: rankData.totalAnswerCount,
      });
    });
    this.totalAnswerRankList.push({ title: '總答題排行榜', rankList: totalAnswerCountRankList, unit: '題' });

    // 答題正確數
    const answerCorrectCountRankList: BrickBreakerAnswerRankData[] = [];
    this.answerRankList.sort((a, b) => {
      return b.correctAnswerCount - a.correctAnswerCount;
    });
    this.answerRankList.map((rankData, index) => {
      // 同分要同名次
      let rank = index + 1;
      if (index > 0 && rankData.correctAnswerCount === this.answerRankList[index - 1].correctAnswerCount) {
        rank = answerCorrectCountRankList[answerCorrectCountRankList.length - 1].rank;
      }
      answerCorrectCountRankList.push({
        rank,
        name: rankData.name,
        score: rankData.correctAnswerCount,
      });
    });
    this.totalAnswerRankList.push({ title: '答對題數排行榜', rankList: answerCorrectCountRankList, unit: '題' });

    // 答題正確率
    const answerCorrectRateRankList: BrickBreakerAnswerRankData[] = [];
    this.answerRankList.sort((a, b) => {
      return Math.round(b.correctAnswerRate * 100) - Math.round(a.correctAnswerRate * 100);
    });
    this.answerRankList.map((rankData, index) => {
      // 同分要同名次
      let rank = index + 1;
      if (
        index > 0 &&
        Math.round(rankData.correctAnswerRate * 100) === this.answerRankList[index - 1].correctAnswerRate * 100
      ) {
        rank = answerCorrectRateRankList[answerCorrectRateRankList.length - 1].rank;
      }
      answerCorrectRateRankList.push({
        rank,
        name: rankData.name,
        // 四捨五入取小數後一位
        score: Math.round(rankData.correctAnswerRate * 100),
      });
    });
    this.totalAnswerRankList.push({ title: '答對率排行榜', rankList: answerCorrectRateRankList, unit: '%' });
  }

  /** 取得目前頁面的標題
   *  @param currentPage 目前頁數
   */
  private getScoreTitle(currentPage: ScoreShowType): string {
    switch (currentPage) {
      case ScoreShowType.Personal:
      case ScoreShowType.AllMvp:
        return '遊戲結算';
      case ScoreShowType.AllScore:
        return '總分排行榜';
      case ScoreShowType.TotalAnswerRank:
        return '答題總排行榜';
      default:
        return '';
    }
  }

  /** 玩家使用英雄的頭像
   *  @param heroId 英雄編號
   */
  private getHeroImgUrl(heroId: number): string {
    return HeroManager.getHeroImgUrlByHeroId(heroId, HeroImgType.Head);
  }

  /** 數字轉排名
   *  @param value 數字
   */
  private rankToString(value: number): string {
    if (value < 0) {
      return '榜外';
    }

    return `第${value}名`;
  }

  /** 關掉dialog */
  @Emit('onCloseDialog')
  private onCloseDialog(): void {
    this.$$store.commit('setPlayerScoreList', []);
    this.$$store.commit('setContestResultData', []);
    this.$$store.commit('setContestRankList', []);
    this.$$store.commit('setAnswerRankList', []);
    this.totalAnswerRankList.splice(0);
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 935px;
  width: 95%;
  border-radius: 30px;
}
::v-deep .el-dialog__header {
  padding: 13px 9px 0px 9px !important;
}
::v-deep .el-dialog__body {
  padding: 0px 20px 0px 20px;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.scrollbar::-webkit-scrollbar {
  padding: 0px 0px 20px 0px;
  height: 10px;
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
.title_text {
  text-shadow: 0px 2px 4px #000000a6;
}
</style>
