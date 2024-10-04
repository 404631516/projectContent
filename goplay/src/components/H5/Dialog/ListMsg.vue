<template>
  <div class="list-msg-warpper">
    <!-- 答題題目資訊組件 -->
    <AnswerInformation v-model="answerInformationVisible" @onCloseDialog="answerInformationVisible = false" />
    <template v-if="isApiGetFinish">
      <el-dialog :visible="msgVisible" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
        <div>
          <!-- 排行榜 -->
          <RankList :rankType="ResultRankType.Total" :rankData="rankApiData" :rankRule="rankRule" :rankHeight="400" />
          <RankList
            :rankType="ResultRankType.Personal"
            :rankData="rankApiData"
            :rankRule="rankRule"
            :rankHeight="320"
          />
        </div>
        <div slot="footer">
          <!-- 按鈕區 -->
          <div class="btn-box flex-pos">
            <el-button class="btn-game-back" @click="onConfirm">
              <span class="flex-pos">{{ textData.goBackContestInfo }}</span>
            </el-button>
            <!-- 答題記錄按鈕(目前只有因材網題庫會有[不含魔王賽]) -->
            <el-button
              v-if="isAdlQuizSource && !isStartDevil"
              @click="answerInformationVisible = true"
              class="btn-check btn-game-detail relative"
            >
              <span class="<2xl:hidden absolute bottom-0 left-0">
                <img :src="imgData.noticeUrl" class="relative w-13.5 aspect-square -left-2.5 top-8" />
                <img :src="imgData.giantIcon" />
              </span>
              <span class="flex-pos">{{ textData.answerRecordAndAsk }}</span>
            </el-button>
          </div>
        </div>
      </el-dialog>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import RankList from '@/components/Public/RankList.vue';
import { ResultRankType, ResponseState, QuizSource, RankRuleType } from '@/helper/enum/Common';
import { contestRankScoreAPI } from '@/api/contest';
import { Message } from '@/helper/class/Common';
import AnswerInformation from '@/components/H5/Dialog/AnswerInformation/AnswerInformation.vue';
import ImgPath from '@/config/imgPath/imgPath';
import { RankData } from '@/helper/interface/Rank';
import { handleAPIError } from '@/helper/fnc/common';

@Component({
  components: {
    RankList,
    AnswerInformation,
  },
})
export default class ListMsg extends Vue {
  /** 顯示開關 */
  @Prop(Boolean) public msgVisible!: boolean;
  /** API是否已取得資料 */
  private isApiGetFinish: boolean = false;
  /** 答題組件是否結束 */
  private answerInformationVisible: boolean = false;
  /** 取得排行榜資訊 */
  private rankApiData: RankData = {} as RankData;
  /** 排行榜類型 */
  private ResultRankType = ResultRankType;

  /** 圖片資料 */
  private imgData = {
    giantIcon: ImgPath.giantIcon,
    noticeUrl: ImgPath.noticeUrl,
  };

  /** 圖片資料 */
  private textData = {
    goBackContestInfo: '回賽事資訊頁面',
    answerRecordAndAsk: '答題記錄與發問',
  };

  /** 排行榜規則 */
  private get rankRule(): RankRuleType {
    return this.$$store.getters.rankRuleType;
  }
  /** 題目來源是否為因材網 */
  private get isAdlQuizSource(): boolean {
    return this.$$store.state.AnswerGameModule.quizSource === QuizSource.AdlEdu;
  }
  /** 開始魔王賽頁面 */
  private get isStartDevil(): boolean {
    return this.$$store.getters.isBoss;
  }

  /** 更新排行榜資訊 */
  created() {
    this.getContestRankScore();
  }

  /** 賽事排行榜 */
  private async getContestRankScore(): Promise<void> {
    // 組成封包
    const data = {
      contestId: this.$$store.getters.contestId,
      pageSize: 500,
    };

    try {
      // API 取得賽事排行榜
      const response: any = await contestRankScoreAPI.fetch(data);
      if (ResponseState.Success !== response.result) {
        handleAPIError(response.result, response.resMessage);
      }
      this.rankApiData = JSON.parse(response.data) as RankData;
      this.isApiGetFinish = true;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 點擊確認 */
  @Emit('onConfirm')
  private onConfirm(): void {
    return;
  }
}
</script>
<style lang="scss"></style>
