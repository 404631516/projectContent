<template>
  <div class="h5-wrapper">
    <!-- 遊戲結果轉場 -->
    <template v-if="isShowResult">
      <ResultMsgTmp
        :msgVisible="isShowResult"
        :resultType="resultType"
        :webGameMode="WebGameMode.PlanetWar"
        :isStartDevil="false"
        :gameScore="gameScore"
        :planetWarStarCount="starCount"
        :planetWarGold="awardPlanetGold"
        :planetWarCrystal="awardPlanetCrystal"
        :contestGameAwardList="contestGameAwardList"
        :heroEx="heroEx"
        @onConfirm="onBack"
      />
    </template>
    <div :id="containerId" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import ResultMsgTmp from '@/components/H5/Dialog/ResultMsg.vue';
import { planetWarBattleAPI } from '@/api/planetWar';
import { ResponseState, WebGameMode, PlanetWarType } from '@/helper/enum/Common';
import { Load, Message } from '@/helper/class/Common';
import { PlanetReward } from '@/helper/interface/PlanetWar';
import { EndType } from '../../helper/enum/WebGame';
import { handleAPIError } from '@/helper/fnc/common';
import { ContestGameAward } from '@/helper/interface/Contest';
import { MenuName } from '@/helper/enum/MenuName';
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { onErrorReturn } from '@/router';
import { PlanetWarGameStrategy } from '@/views/H5/Games/Common/PhaserGameStrategy';
import { PlanetWarResult } from '@/helper/interface/Game';
import { IPlanetWeb } from '../../views/H5/Scripts/Components/StateMachine/PlanetGameFSM';

@Component({
  components: {
    ResultMsgTmp,
  },
})
export default class PlanetGame extends Vue implements IPlanetWeb {
  /** 遊戲表演座標 */
  private containerId: string = 'game-container';
  /** 遊戲本體 */
  private planetGame?: PlanetWarGameStrategy;

  /** 給Vue用於判別遊戲類型 */
  private WebGameMode = WebGameMode;

  /** 遊戲結算開關 */
  private isShowResult: boolean = false;
  /** 結算類型 */
  private resultType: EndType = EndType.None;

  /** 星球大戰結算 */
  private planetReward?: PlanetReward;

  /** 英雄經驗 */
  private heroEx: number = 0;

  /** 遊戲得分 */
  private get gameScore(): number {
    return this.planetReward?.score ?? 0;
  }

  /** 結算星等 */
  private get starCount(): number {
    return this.planetReward?.starCount ?? 0;
  }

  /** 獎勵金幣 */
  private get awardPlanetGold(): number {
    return this.planetReward?.awardGold ?? 0;
  }

  /** 獎勵晶球 */
  private get awardPlanetCrystal(): number {
    return this.planetReward?.awardCrystal ?? 0;
  }

  /** 獎勵生物兵器 */
  private get contestGameAwardList(): ContestGameAward[] {
    // 防呆
    if (this.planetReward === undefined) {
      return [];
    }

    // 回傳用清單
    const contestGameAwards: ContestGameAward[] = [];
    // 加入生物兵器
    if (this.planetReward.awardWeaponIds) {
      this.planetReward.awardWeaponIds.forEach((weaponId) => {
        contestGameAwards.push({
          itemType: RewardItemKey.Weapon,
          itemId: weaponId,
          count: 1,
          rate: -1,
        });
      });
    }
    // 加入 awardItemList
    if (this.planetReward.awardItemList) {
      contestGameAwards.concat(this.planetReward.awardItemList);
    }
    return contestGameAwards;
  }

  async mounted() {
    const newGame = await this.$$store.dispatch('newPlanetGame');
    if (newGame instanceof PlanetWarGameStrategy) {
      this.planetGame = newGame;
    }
    // 防呆遊戲型別
    else {
      console.error('Start Game fail: game not instanceof AnswerGame');
      // 返回賽事資訊
      onErrorReturn();
      return;
    }

    // 初始化遊戲
    this.planetGame.initPlanetGame(this);

    // 開始遊戲
    this.planetGame.startGame(this.containerId, this.$$store.getters.isMute);
  }

  /** 關閉時摧毀遊戲 */
  destroyed() {
    this.planetGame?.destroyGame();
  }

  /** 上傳遊戲結果
   * @param planetResult
   */
  public async onPlanetResult(planetResult: PlanetWarResult): Promise<void> {
    try {
      // 開啟讀取中
      Load.use(true);

      // API 星球大戰結算
      const response: any = await planetWarBattleAPI.post(planetResult.gameResult);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 顯示獎勵
      this.planetReward = response as PlanetReward;

      // 取得英雄獲得經驗
      this.heroEx = await this.$$store.dispatch('getHeroList');

      // 設定結算類型
      this.resultType = planetResult.endType;

      // 開啟顯示結算
      this.isShowResult = true;

      Load.use(false);
    } catch (e) {
      Load.use(false);
      Message.error(`${e}`);
    }
  }

  /** 返回星球大戰關卡頁 */
  private onBack(): void {
    if (this.$$store.state.PlanetWarModule.planetWarType === PlanetWarType.HeroUniverse) {
      // 轉跳因雄宇宙
      this.$router.replace({
        name: `${MenuName.HeroUniverse}`,
      });
    } else {
      // 轉跳星球大戰
      this.$router.replace({
        name: `${MenuName.PlanetWar}`,
        params: { id: `${this.$$store.state.PlanetWarModule.planetWarType}` },
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.h5-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  #game-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
