<template>
  <div class="flex-pos flex-col">
    <div>
      <!-- 續命題 -->
      <template v-if="isContinueAnswer">
        <!-- 答對： 獲得能量、道具 or 答錯 -->
        <template v-if="isShowAnswerMsg">
          <RandomTmp
            class="random-pos"
            :msgVisible="isShowAnswerMsg"
            :answerSwitch="answerSwitch"
            :isShowAward="false"
            @onClose="isShowAnswerMsg = false"
          />
        </template>
        <!-- 答題 -->
        <div class="answer-msg-warpper">
          <el-dialog :visible="isContinueAnswer" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
            <div class="h5-box">
              <div class="answer-box">
                <AnswerTMP
                  id="answerTMP"
                  ref="answerTMP"
                  :answerSwitch="answerSwitch"
                  :answerFunc="onContinueAnswer"
                  :answerResult="answerResult"
                  @onNext="isShowAnswerMsg = true"
                  @onFinish="isContinueFinish = true"
                />
              </div>
            </div>
          </el-dialog>
        </div>
      </template>
      <!-- 遊戲轉場 -->
      <template v-if="isShowTrans">
        <TransMsg :msgVisible="isShowTrans" :transType="TransStatus.ContinueAnswer" />
      </template>
      <!-- 遊戲結果轉場 -->
      <template v-if="isShowResult">
        <ResultMsg
          :msgVisible="isShowResult"
          :resultType="resultType"
          :webGameMode="WebGameMode.WorldContest"
          :answerScore="correctCount"
          :totalAnswerScore="totalAnswerScore"
          :totalProps="continueAwardItem"
          :isStartDevil="isBossGame"
          :gameScore="gameScore"
          :planetWarGold="awardPlanetGold"
          :planetWarCrystal="awardPlanetCrystal"
          :contestGameAwardList="contestGameAwardList"
          :heroEx="heroEx"
          @onConfirm="isShowResult = false"
        />
      </template>
      <!-- 排行榜 -->
      <template v-if="isShowList">
        <ListMsg :msgVisible="isShowList" @onConfirm="onBack" />
      </template>
    </div>
    <!-- 魔王表演 -->
    <div class="w-full h-[25%] flex items-end justify-center" v-show="isShowBoss" :id="bossContainerId" />
    <!-- Phaser遊戲 -->
    <div
      class="w-full flex justify-center"
      :class="isShowBoss ? 'items-start h-[75%]' : 'items-center h-full'"
      v-if="isShowPhaserGame"
      :id="containerId"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onErrorReturn } from '@/router';
import {
  GATagCategoryIdType,
  GATagActionIdType,
  GATagActionStrType,
  GATagCategoryStrType,
  WebGameMode,
  ResponseState,
} from '@/helper/enum/Common';
import { BossGame, AnswerGameStrategy } from '@/views/H5/Games/Common/PhaserGameStrategy';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { sendGAEvent, handleAPIError, addRandomItem, toTotalProp } from '@/helper/fnc/common';
import RandomTmp from '@/components/AnswerTMP/RandomTMP.vue';
import AnswerTMP from '@/components/AnswerTMP/AnswerTMPS.vue';
import TransMsg from '@/components/H5/Dialog/TransMsg.vue';
import ResultMsg from '@/components/H5/Dialog/ResultMsg.vue';
import ListMsg from '@/components/H5/Dialog/ListMsg.vue';
import { ContestGameAward } from '@/helper/interface/Contest';
import { RewardItemKey, TransStatus } from '@/helper/enum/AnswerGame';
import { EndType } from '@/helper/enum/WebGame';
import { MenuName } from '@/helper/enum/MenuName';
import {
  AnswerSwitch,
  AnswerInfo,
  QuestionData,
  AnswerNet,
  AnswerResult,
  ShopCartItem,
} from '@/helper/interface/AnswerGame';
import { contestWebGameJudgeAPI, contestWebGameAnswerStartAPI } from '@/api/contestGame';
import { TotalProps, ContestPlayerData } from '@/helper/interface/Game';
import { IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';

@Component({
  components: {
    RandomTmp,
    AnswerTMP,
    TransMsg,
    ResultMsg,
    ListMsg,
  },
})
export default class AnswerPhaserGame extends Vue implements IAnswerWeb {
  /** 遊戲表演座標 */
  private containerId: string = 'game-container';
  /** 魔王表演座標 */
  private bossContainerId: string = 'bossGame-container';

  /** 遊戲本體 */
  private phaserGame?: AnswerGameStrategy;
  /** 魔王表演 */
  private bossGame?: BossGame;

  /** 是否顯示魔王表演 */
  private isShowBoss: boolean = false;
  /** 是否顯示續命題 */
  private isContinueAnswer: boolean = false;
  /** 是否顯示答題結果 */
  private isShowAnswerMsg: boolean = false;
  /** 是否顯示轉場介面 */
  private isShowTrans: boolean = false;
  /** 是否顯示結算介面 */
  private isShowResult: boolean = false;
  /** 是否顯示排行榜 */
  private isShowList: boolean = false;
  /** 遊戲是否結束 */
  private isGameOver: boolean = false;
  /** 是否顯示答題遊戲本體 */
  public isShowPhaserGame: boolean = false;

  /** 續命作答是否結束 */
  private isContinueFinish: boolean = false;

  /** 結算類型 */
  private resultType: EndType = EndType.None;
  /** 遊戲得分 */
  private gameScore: number = 0;

  /** 續命題作答介面開關 */
  private answerSwitch: AnswerSwitch = {
    isPass: false,
    isCorrect: false,
  };

  /** 續命題作答結果 */
  private answerResult: AnswerResult = {
    topicCount: 0,
    answerScore: 0,
  };

  /** 續命獎勵 */
  private continueAwardItem: ShopCartItem[] = [];

  /** 遊戲結束獎勵 */
  private gameRewardList: ContestGameAward[] = [];
  /** 遊戲結束經驗獎勵 */
  private heroEx: number = 0;

  public $refs!: {
    answerTMP: AnswerTMP;
  };

  /** 給Vue用於判別列舉類型 */
  private WebGameMode = WebGameMode;
  private TransStatus = TransStatus;

  /** 是否為魔王賽 */
  public get isBossGame(): boolean {
    return this.$$store.getters.isBoss;
  }

  /** 答題遊戲LogId */
  private get gameLogId(): number {
    return this.$$store.state.AnswerGameModule.answerGameInfo.logId;
  }

  /** 賽事ID */
  private get contestId(): number {
    return this.$$store.getters.contestId;
  }

  /** 金幣獎勵 */
  private get awardPlanetGold(): number {
    return this.gameRewardList.reduce((total, reward) => {
      return (total += reward.itemType === RewardItemKey.PlanetGold ? reward.count : 0);
    }, 0);
  }

  /** 晶球獎勵 */
  private get awardPlanetCrystal(): number {
    return this.gameRewardList.reduce((total, reward) => {
      return (total += reward.itemType === RewardItemKey.PlanetCrystal ? reward.count : 0);
    }, 0);
  }

  /** 非貨幣獎勵 */
  private get contestGameAwardList(): ContestGameAward[] {
    return this.gameRewardList.filter(
      (reward) => reward.itemType !== RewardItemKey.PlanetGold && reward.itemType !== RewardItemKey.PlanetCrystal
    );
  }

  /** 答對題數 */
  private get correctCount(): number {
    return this.$refs.answerTMP.correctCount;
  }

  /** 總答題得分 */
  private get totalAnswerScore(): number {
    return this.$$store.state.AnswerGameModule.answerResult.answerScore;
  }

  async mounted() {
    // 創建遊戲
    const newGame = await this.$$store.dispatch('newAnswerPhaserGame', this);
    if (newGame instanceof AnswerGameStrategy) {
      this.phaserGame = newGame;
    }
    // 防呆遊戲型別
    else {
      console.error('Start Game fail: game not instanceof AnswerGame');
      // 返回賽事資訊
      onErrorReturn();
      return;
    }

    // 魔王賽
    if (this.isBossGame) {
      // 取得魔王表演
      this.bossGame = this.phaserGame.bossGame;
      if (this.bossGame == null) {
        console.error('Start BossGame fail: bossGame is null');
        // 返回賽事資訊
        onErrorReturn();
        return;
      }

      await this.startBossGame(this.bossGame, this.phaserGame);
    }
    // 答題遊戲
    else {
      await this.startAnswerGame(this.phaserGame);
    }

    // 顯示結算
    this.onShowGameResult();
  }

  /** 關閉時摧毀遊戲 */
  destroyed() {
    // 清除遊戲資料
    this.$$store.dispatch('onGameEnd');

    // 摧毀魔王表演
    this.bossGame?.destroyGame();
    // 防呆
    if (this.phaserGame == null) {
      return;
    }
    // 延續遊戲是否靜音設定到網頁
    this.$$store.commit('setOpenWebAudio', this.phaserGame.isMute === false);
    // 摧毀遊戲
    this.phaserGame.destroyGame();
  }

  /** 魔王賽
   * @param game
   * @param bossGame
   */
  private async startBossGame(bossGame: BossGame, game: AnswerGameStrategy): Promise<void> {
    // 顯示魔王表演
    this.isShowBoss = true;

    // 等待Vue更新, 不然抓不到container
    await this.$nextTick();

    // 開始魔王表演, 並等到表演結束
    await bossGame.startBossEntering(this.bossContainerId, this.$$store.getters.isMute);

    // 設定遊戲進行中要不要隱藏魔王表演
    if (game.isHideBoss) {
      this.isShowBoss = false;
    }

    // 開始遊戲
    await this.startAnswerGame(game);

    // 隱藏phaser game
    this.isShowPhaserGame = false;

    // 顯示魔王表演
    this.isShowBoss = true;

    // 等待結束表演結束
    await bossGame.startBossEnding(this.totalAnswerScore, game.isMute);
  }

  /** 玩完一整場Phaser小遊戲
   * @param game
   */
  private async startAnswerGame(game: AnswerGameStrategy): Promise<void> {
    // 開啟遊戲顯示
    this.isShowPhaserGame = true;

    // 等待Vue更新, 不然抓不到container
    await this.$nextTick();

    // 開始遊戲
    await game.startGame(this.containerId, this.$$store.getters.isMute);

    // 等到遊戲結束
    await AsyncHelper.pendingUntil(() => this.isGameOver);
  }

  /** 開始續命作答 */
  public async onRevive(): Promise<TotalProps[]> {
    // 開啟轉場
    this.isShowTrans = true;

    // 開啟答題介面
    this.isContinueAnswer = true;

    // 等轉場表演結束
    await AsyncHelper.sleep(2);

    // 取得最後一題
    const answerRecord = this.$$store.state.AnswerGameModule.answerRecord;
    const continueQuestion = answerRecord.pop();
    if (continueQuestion === undefined) {
      console.error('啟動續命題失敗, 沒有題目資料');
      return [];
    }

    // 紀錄作答開始時間
    this.onRecordTime(continueQuestion);

    // 開始續命題
    this.$refs.answerTMP.continueQuiz(continueQuestion, answerRecord);

    // 關閉轉場
    this.isShowTrans = false;

    // 等續命答題結束
    await AsyncHelper.pendingUntil(() => this.isContinueFinish);

    // GA 續命題結束事件
    await sendGAEvent(
      GATagCategoryIdType.Heroj7Game,
      GATagActionIdType.Heroj7ContinueEnd,
      `${GATagActionStrType.Heroj7ContinueEnd}-${this.$$store.getters.contestId}`,
      this.$gtag,
      GATagActionStrType.Heroj7ContinueEnd,
      GATagCategoryStrType.Heroj7ContinueEnd
    );

    // 儲存答題紀錄
    this.$$store.commit('setAnswerRecord', this.$refs.answerTMP.answerRecord);

    // 儲存答題結果 (結合一般答題的結果)
    const roundOneResult = this.$$store.state.AnswerGameModule.answerResult;
    this.answerResult.answerScore += roundOneResult.answerScore;
    this.$$store.commit('setAnswerResult', this.answerResult);

    // 續命答題成功
    if (this.correctCount > 0) {
      // 計算獎勵
      const shopItemList = this.$$store.state.AnswerGameModule.rewardsProps;
      for (let i = 0; i < this.correctCount; i++) {
        addRandomItem(shopItemList, this.continueAwardItem);
      }
      // 等待答對表演結束
      await AsyncHelper.sleep(1.5);

      // 設定續命結算結果
      this.resultType = EndType.ContinueSuccess;
    }
    // 續命答題失敗
    else {
      // 設定續命結算結果
      this.resultType = EndType.ContinueFail;
    }

    // 關閉答題介面
    this.isContinueAnswer = false;

    // 顯示續命題結算
    this.isShowResult = true;

    // 等結算頁面關閉
    await AsyncHelper.pendingUntil(() => this.isShowResult === false);

    // 回傳獎勵道具清單
    return this.continueAwardItem.map<TotalProps>((itemData) => toTotalProp(itemData.itemId, itemData.itemValue));
  }

  /** 續命題作答API
   * @param answerInfo
   */
  public async onContinueAnswer(answerInfo: AnswerInfo): Promise<QuestionData> {
    // 組成作答封包
    const request: AnswerNet = {
      gameLogId: this.gameLogId,
      questOrder: this.$refs.answerTMP.questOrder,
      playerAnswer: JSON.stringify(answerInfo),
    };

    // API 發送作答
    const response: any = await contestWebGameJudgeAPI.post(request);
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤訊息
      handleAPIError(response.result, response.resMessage);
    }

    // 轉換成問題格式
    const questionData = response as QuestionData;

    // 紀錄作答開始時間 (不等回覆)
    if (questionData.isFinished === false) {
      this.onRecordTime(questionData);
    }

    // 作答結果
    return questionData;
  }

  /** 紀錄答題開始時間
   * @param questionData
   */
  private async onRecordTime(questionData: QuestionData): Promise<void> {
    // 組成封包
    const data = {
      gameLogId: this.gameLogId,
      questOrder: questionData.questOrder,
    };

    try {
      // API 發送作答開始時間
      const response: any = await contestWebGameAnswerStartAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }
    } catch (e) {
      console.error(`${e}`);
    }
  }

  /** 上傳遊戲結果
   * @param contestPlayerData
   */
  public async onResult(contestPlayerData: ContestPlayerData): Promise<void> {
    // 取得遊戲得分
    this.gameScore = contestPlayerData.webGameLog.gameScore;

    // 設定遊戲結果
    this.resultType = contestPlayerData.isSurvivor ? EndType.Success : EndType.Fail;

    // 遊戲結算
    this.gameRewardList = await this.$$store.dispatch('sendPhaserGameResult', contestPlayerData);

    // 取得英雄獲得經驗
    this.heroEx = await this.$$store.dispatch('getHeroList');

    // 設定遊戲結束
    this.isGameOver = true;
  }

  /** 顯示遊戲結果 */
  public async onShowGameResult(): Promise<void> {
    // 顯示結算畫面
    this.isShowResult = true;

    // 等待結算畫面關閉
    await AsyncHelper.pendingUntil(() => this.isShowResult === false);

    // 開啟排行榜
    this.isShowList = true;
  }

  /** 遊戲結束後返回上一頁 */
  private onBack(): void {
    this.$router.push({
      name: `${this.isBossGame ? MenuName.BossContestInfoDetail : MenuName.ContestInfoDetail}`,
      params: { id: `${this.contestId}` },
    });
  }
}
</script>
<style lang="scss" scoped></style>
