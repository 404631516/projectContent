<template>
  <div>
    <!-- 答對： 獲得能量、道具 or 答錯 -->
    <template v-if="isShowMsg">
      <RandomTmp
        class="random-pos"
        :msgVisible="isShowMsg"
        :answerSwitch="answerSwitch"
        :isShowAward="true && answerSwitch.isCorrect"
        :randomAwardData="randomItemData"
        @onClose="isShowMsg = false"
      />
    </template>
    <div class="h5-box">
      <!-- 答題 -->
      <template v-if="!isAnswerFinish">
        <!--答題介面-->
        <AnswerTMP
          id="answerTMP"
          ref="answerTMP"
          :answerSwitch="answerSwitch"
          :answerFunc="onAnswer"
          :answerResult="answerResult"
          @onNext="onNext"
          @onFinish="onFinish"
        />
        <div class="mask-opt"></div>
      </template>
      <!-- 放遊戲假圖背景 -->
      <template>
        <div class="flex-pos">
          <div class="game-bg">
            <img :src="gameBg" />
          </div>
        </div>
        <div class="mask-opt"></div>
      </template>
      <!-- 一般轉場 -->
      <template>
        <TransMsg :msgVisible="isShowTrans" :transType="transType" />
      </template>
      <!-- 答題、遊戲結果轉場 -->
      <template v-if="isShowResult">
        <ResultMsg
          :msgVisible="isShowResult"
          :resultType="resultType"
          :webGameMode="WebGameMode.WorldContest"
          :answerScore="correctCount"
          :totalAnswerScore="this.answerResult.answerScore"
          :totalEnergy="awardEnergy"
          :totalProps="shoppingCart"
          @onConfirm="onResultConfirm"
        />
      </template>
      <!-- 能量轉換店 -->
      <template v-if="isShowShop">
        <FlashShop
          v-model="isShowShop"
          class="pointer-events-auto"
          :priceData="priceData"
          :totalEnergy="awardEnergy"
          :shoppingCart="shoppingCart"
          @onTimeUp="onFlashShopTimeUp"
          @onConfirmBuy="onFlashShopConfirmBuy"
        />
      </template>
      <!-- 遊戲說明 -->
      <template v-if="isShowHelp">
        <GameHelpMsg :gameHelpBg="gameHelpBg" @onCloseGameHelp="onSendGame" />
      </template>
      <!-- 失敗開啟排行榜 -->
      <template v-if="isShowList">
        <ListMsg :msgVisible="isShowList" @onConfirm="onReturnLastPage" />
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RandomTmp, { RandomAwardData } from '@/components/AnswerTMP/RandomTMP.vue';
import AnswerTMP from '@/components/AnswerTMP/AnswerTMPS.vue';
import TransMsg from '@/components/H5/Dialog/TransMsg.vue';
import ResultMsg from '@/components/H5/Dialog/ResultMsg.vue';
import FlashShop from '@/components/H5/Shop/FlashShop.vue';
import GameHelpMsg from '@/components/H5/Dialog/GameHelpMsg.vue';
import ListMsg from '@/components/H5/Dialog/ListMsg.vue';
import { EndType, WebGameName } from '@/helper/enum/WebGame';
import {
  AnswerInfo,
  QuestionData,
  AnswerSwitch,
  AnswerGameInfo,
  AnswerNet,
  AnswerResult,
  ShopItemData,
  ShopCartItem,
} from '@/helper/interface/AnswerGame';
import { TransStatus } from '@/helper/enum/AnswerGame';
import { TotalProps, ContestPlayerData } from '@/helper/interface/Game';
import { contestWebGameJudgeAPI, contestWebGameAnswerStartAPI } from '@/api/contestGame';
import { handleAPIError, addRandomItem, toTotalProp, sendGAEvent } from '@/helper/fnc/common';
import {
  ResponseState,
  WebGameMode,
  GATagActionStrType,
  GATagCategoryStrType,
  GATagCategoryIdType,
  GATagActionIdType,
} from '@/helper/enum/Common';
import { AsyncHelper } from '../../views/H5/Helper/AsyncHelper';
import { possibleBoolean } from '../../views/H5/Helper/MathHelper';
import { MenuName } from '@/helper/enum/MenuName';
import { onErrorReturn } from '@/router';
import { BaseAnswerGameStrategy } from '@/views/H5/Games/Common/AnswerGameStrategy';
import imgPath from '@/config/imgPath/imgPath';

@Component({
  components: {
    RandomTmp,
    AnswerTMP,
    TransMsg,
    ResultMsg,
    FlashShop,
    GameHelpMsg,
    ListMsg,
  },
})
export default class AnswerGame extends Vue {
  public $refs!: {
    answerTMP: AnswerTMP;
  };

  /** 答題結果開關 */
  private isShowMsg: boolean = false;
  /** 快閃店開關 */
  private isShowShop: boolean = false;
  /** 遊戲說明開關 */
  private isShowHelp: boolean = false;
  /** 遊戲結算開關 */
  private isShowResult: boolean = false;
  /** 顯示排行榜 */
  private isShowList: boolean = false;
  /** 是否顯示轉場介面 */
  private isShowTrans: boolean = false;
  /** 轉場類型 */
  private transType: TransStatus = TransStatus.None;

  /** 答題結束 */
  private isAnswerFinish: boolean = false;
  /** 答題介面開關 */
  private answerSwitch: AnswerSwitch = {
    isPass: false,
    isCorrect: false,
  };
  /** 答題結果 */
  private answerResult: AnswerResult = {
    topicCount: 0,
    answerScore: 0,
  };
  /** 答題獲得的隨機獎勵道具 */
  private randomItemData: RandomAwardData = {
    awardTitle: '',
    itemName: '',
    itemImage: '',
  };
  /** 答題獲得的能量 */
  private awardEnergy: number = 0;
  /** 答對題數 */
  private correctCount: number = 0;

  /** 結算類別 */
  private resultType: EndType = EndType.None;

  /** 購物車 */
  private shoppingCart: ShopCartItem[] = [];

  /** 答題遊戲設定 */
  private answerGame!: BaseAnswerGameStrategy;
  /** 答題遊戲背景 */
  private gameBg: string = '';
  /** 獎勵道具 */
  private priceData: ShopItemData[] = [];

  /** 給Vue用於判別遊戲類型 */
  private WebGameMode = WebGameMode;

  /** 答題遊戲LogId */
  private get gameLogId(): number {
    return this.$$store.state.AnswerGameModule.answerGameInfo.logId;
  }

  /** 遊戲說明圖 */
  private get gameHelpBg(): string {
    return this.$$store.getters.isBoss ? this.answerGame.bossGameHelpBg : this.answerGame.gameHelpBg;
  }

  async mounted() {
    // 取得答題設定
    const gameType = this.$$store.state.AnswerPhaserGameModule.gameType;
    const newAnswerGame = await this.$$store.dispatch('newAnswerGame', gameType);
    if (newAnswerGame === undefined) {
      onErrorReturn();
      return;
    }

    // 設定答題設定
    this.answerGame = newAnswerGame;
    this.gameBg = this.answerGame.gameBg;
    this.priceData = this.answerGame.priceData;

    // 開始答題
    this.startContestWebGame();
  }

  //#region 答題
  /** 取得開始賽事 */
  private async startContestWebGame(): Promise<void> {
    // 防呆 contestId無效
    if (this.$$store.getters.contestId < 0) {
      onErrorReturn();
      return;
    }

    // 等一幀加載答題頁面
    await this.$nextTick();

    // GA 紀錄答題開始事件
    await sendGAEvent(
      GATagCategoryIdType.Heroj7Game,
      GATagActionIdType.Heroj7GameStart,
      `${GATagActionStrType.Heroj7GameStart}-${this.$$store.getters.contestId}`,
      this.$gtag,
      GATagActionStrType.Heroj7GameStart,
      GATagCategoryStrType.Heroj7GameStart
    );

    // 開始答題
    await this.$refs.answerTMP.startQuiz();

    // 開場轉場
    this.transType = TransStatus.StartGame;
    this.isShowTrans = true;
    await AsyncHelper.sleep(1);
    this.isShowTrans = false;
  }

  /** 作答API
   * @param answerInfo
   */
  private async onAnswer(answerInfo: AnswerInfo): Promise<QuestionData> {
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

    // 紀錄作答開始時間
    if (questionData.isRoundOneEnd === false) {
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
      // API 發送作答開始時間 (不等回覆)
      const response: any = await contestWebGameAnswerStartAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }
    } catch (e) {
      console.error(`${e}`);
    }
  }

  /** 下一題 */
  private async onNext(): Promise<void> {
    // 如果答對, 給予獎勵
    if (this.answerSwitch.isCorrect) {
      this.randomItemData = this.getRandomAnswerAward();
    }

    await this.$nextTick();

    // 開啟結果顯示
    this.isShowMsg = true;
  }

  /** 骰隨機道具或是能量作為答對獎勵 */
  private getRandomAnswerAward(): RandomAwardData {
    // 隨機判斷取得道具或是能量
    // 獲得道具
    if (possibleBoolean(0.14)) {
      // 獲得道具: 隨機選取一個道具給予
      const rewardItem = addRandomItem(this.priceData, this.shoppingCart);

      // 設定獲得道具顯示
      return {
        awardTitle: '獲得道具',
        itemName: this.$t(`common.${rewardItem.itemNameKey}`).toString(),
        itemImage: rewardItem.itemImageUrl,
      };
    }
    // 獲得能量
    else {
      // 獲得能量: 1000 - (總題數*10 + 100)【公式成立條件：總題數<=50】
      const energy = 1000 - (this.answerResult.topicCount * 10 + 100);

      // 儲存獲得能量總量
      this.awardEnergy += energy;

      // 獲得獲得能量顯示
      return {
        awardTitle: '獲得能量',
        itemName: `+${energy}`,
        itemImage: imgPath.flashShopGoldBaseUrl,
      };
    }
  }

  /** 結束答題 */
  private async onFinish(): Promise<void> {
    // 儲存題庫來源
    this.$$store.commit('setQuizSource', this.$refs.answerTMP.quizSource);
    // 儲存答題紀錄
    this.$$store.commit('setAnswerRecord', this.$refs.answerTMP.answerRecord);
    // 儲存答題結果
    this.$$store.commit('setAnswerResult', this.answerResult);

    // 答題是否成功
    this.resultType = this.answerResult.answerScore > 0 ? EndType.AnswerSuccess : EndType.AnswerFail;

    // 答對題數
    this.correctCount = this.$refs.answerTMP.correctCount;

    // 等到正確提示顯示結束
    await AsyncHelper.pendingUntil(() => this.isShowMsg === false);

    // 答題結束
    this.isAnswerFinish = true;

    // 答題失敗, 發結算封包
    if (this.resultType === EndType.AnswerFail) {
      await this.onAnswerFail();
    }

    // GA 紀錄答題結束事件
    await sendGAEvent(
      GATagCategoryIdType.Heroj7Game,
      GATagActionIdType.Heroj7AnswerEnd,
      `${GATagActionStrType.Heroj7AnswerEnd}-${this.$$store.getters.contestId}`,
      this.$gtag,
      GATagActionStrType.Heroj7AnswerEnd,
      GATagCategoryStrType.Heroj7AnswerEnd
    );

    // 顯示結算
    this.isShowResult = true;
  }
  //#endregion

  //#region 結算
  /** 點擊結算確認 */
  private onResultConfirm(): void {
    // 關閉結算介面
    this.isShowResult = false;
    // 答題成功, 開啟快閃店
    if (this.resultType === EndType.AnswerSuccess) {
      this.isShowShop = true;
    }
    // 答題失敗
    else {
      // 顯示排行榜
      this.isShowList = true;
    }
  }

  //#endregion

  //#region 快閃店
  /** 快閃店倒數時間到 */
  private async onFlashShopTimeUp(): Promise<void> {
    // 如果時間到前選好, 不顯示提示
    if (this.isShowShop === false) {
      return;
    }

    // 關閉能量轉換彈窗
    this.isShowShop = false;

    // 切換成時間到訊息
    this.transType = TransStatus.TimeEnd;

    this.isShowTrans = true;
    await AsyncHelper.sleep(1.5);
    this.isShowTrans = false;

    // 開啟遊戲說明
    this.onFlashShopConfirmBuy();
  }

  /** 完成轉換 */
  private onFlashShopConfirmBuy(): void {
    // 關閉能量轉換彈窗
    this.isShowShop = false;

    // 轉換成道具清單格式
    const totalProps = this.shoppingCart.map<TotalProps>((itemData) =>
      toTotalProp(itemData.itemId, itemData.itemValue)
    );

    // 儲存當前選中的小遊戲道具獎勵列表給之後續命題獎勵使用
    this.$$store.commit(
      'setRewardsProps',
      this.priceData.filter(
        (itemData) => totalProps.findIndex((props) => props.id === itemData.gameItemData.itemId) > -1
      )
    );

    // 英雄資料防呆
    const heroListData = this.$$store.getters.onlineHero;
    if (heroListData === undefined) {
      console.error(`onFlashShopConfirmBuy() Error: 無法取得英雄資料`);
      return;
    }

    // 設定遊戲資料
    this.answerGame.setGameData(this.$$store, heroListData, totalProps);

    // 開啟遊戲說明
    this.isShowHelp = true;
  }
  //#endregion 快閃店

  /** 開始遊戲 */
  private onSendGame(): void {
    // 開始遊戲
    this.$router.push(`/${WebGameName.AnswerPhaserGame}`);
  }

  /** 答題失敗 */
  private async onAnswerFail(): Promise<void> {
    // 紀錄遊戲結果
    const contestPlayerData: ContestPlayerData = {
      hid: this.$$store.getters.onlineHeroHId,
      isSurvivor: false,
      webGameLog: this.answerGame.failGameLog,
    };

    // 發送結算
    await this.$$store.dispatch('sendPhaserGameResult', contestPlayerData);
  }

  /** 返回上一頁 */
  private onReturnLastPage(): void {
    // 返回上一頁
    this.$router.replace({
      name: `${this.$$store.getters.isBoss ? MenuName.BossContestInfoDetail : MenuName.ContestInfoDetail}`,
      params: { id: `${this.$$store.getters.contestId}` },
    });
  }
}
</script>
<style lang="scss">
.devil-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
