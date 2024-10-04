<template>
  <div class="h5-wrapper">
    <div :id="containerId" />
    <WaitingRoomDialog v-model="isWaitingRoomDialog" />
    <BrickBreakerScoreBoard v-model="isBrickBreakerScoreBoard" />
    <BrickBreakerExplainDialog v-model="isBrickBreakerExplainDialog" />
    <BrickBreakerResultDialog v-model="isBrickBreakerResultDialog" @onCloseDialog="onCloseResultDialog" />
    <QuizDialog />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BrickBreakerGameData } from '@/helper/interface/Game';
import { HeroJ7GameType, TeamType } from '@/helper/enum/Common';
import QuizDialog from './InGameUI/QuizDialog.vue';
import WaitingRoomDialog from './InGameUI/WaitingRoomDialog.vue';
import BrickBreakerScoreBoard from './InGameUI/BrickBreaker/BrickBreakerScoreBoard.vue';
import BrickBreakerResultDialog from './InGameUI/BrickBreaker/BrickBreakerResultDialog.vue';
import { MemberType } from '@/views/H5/Net/NetProtocol/CommonStructure';
import { MenuName } from '@/helper/enum/MenuName';
import BrickBreakerExplainDialog from './InGameUI/BrickBreaker/BrickBreakExplainDialog.vue';
import { RoomGameStrategy, BrickBreakerGame, IRoomWeb } from '@/views/H5/Games/Common/PhaserGameStrategy';
import Config from '@/config/setting';

@Component({
  components: {
    QuizDialog,
    WaitingRoomDialog,
    BrickBreakerScoreBoard,
    BrickBreakerResultDialog,
    BrickBreakerExplainDialog,
  },
})
export default class RoomGame extends Vue implements IRoomWeb {
  /** 遊戲表演座標 */
  private containerId: string = 'game-container';
  /** Phaser遊戲實例 */
  private roomGame?: RoomGameStrategy;

  /** 是否顯示結算畫面 */
  private isBrickBreakerResultDialog: boolean = false;

  /** 是否顯示等候室 */
  private get isWaitingRoomDialog(): boolean {
    return this.$$store.state.RoomModule.isShowWaitingRoom;
  }

  /** 是否顯示得分板 */
  private get isBrickBreakerScoreBoard(): boolean {
    return this.$$store.state.BrickBreakerModule.isShowScoreBoard;
  }

  /** 是否顯示物件說明 */
  private get isBrickBreakerExplainDialog(): boolean {
    return this.$$store.state.BrickBreakerModule.isShowExplainDialog;
  }

  mounted() {
    // 開始強聯網遊戲
    this.startRoomGame();
  }

  /** 關閉時摧毀遊戲 */
  destroyed() {
    this.$$store.commit('setShowWaitingRoom', false);

    this.roomGame?.destroyGame();
  }

  /** 開始強聯網 */
  private startRoomGame(): void {
    // 依遊戲種類進入
    switch (this.$$store.state.RoomModule.gameType) {
      // 坦克大戰
      case HeroJ7GameType.BrickBreaker:
        this.roomGame = this.onRoomGameBrickBreakerStart();
        break;
      default:
        console.error(`Error: 無法分辨遊戲類型`);
        this.onBack();
        return;
    }

    // 創建失敗
    if (this.roomGame == null) {
      // 返回上一頁
      this.onBack();
      return;
    }

    // 清空結算資料
    this.$$store.commit('setContestResultData', []);

    // 開始遊戲
    this.roomGame.startGame(this.containerId, this.$$store.getters.isMute);
  }

  /** 敲敲答答 */
  private onRoomGameBrickBreakerStart(): RoomGameStrategy | undefined {
    // 英雄資料防呆
    const onlineHero = this.$$store.getters.onlineHero;
    if (onlineHero === undefined) {
      console.error(`onRoomGameBrickBreakerStart() Error: 無法取得英雄資料`);
      return;
    }

    // 設定新魔王賽遊戲資料
    const gameData: BrickBreakerGameData = {
      uid: this.$$store.getters.userUid,
      name: this.$$store.getters.userName,
      school: this.$$store.getters.userSchoolName,
      contestRoomUserToken: this.$$store.state.RoomModule.signUpToken,
      heroListData: onlineHero,
      memberType: this.$$store.state.RoomModule.memberType,
    };

    // 創建敲敲答答遊戲
    return new BrickBreakerGame(gameData, this);
  }

  /** 遊戲結束 */
  public onGameEnd(): void {
    // 顯示結算
    if (this.$$store.state.BrickBreakerModule.contestResultData.length > 0) {
      this.isBrickBreakerResultDialog = true;
    }
    // 觀戰者沒有結算資料, 直接返回上一頁
    else {
      this.onBack();
    }
  }

  /** 重新開始遊戲 */
  public onGameRestart(): void {
    // destroy PhaserGame
    this.roomGame?.destroyGame();
    // new PhaserGame
    this.startRoomGame();
  }

  /** 關閉結算視窗 */
  private onCloseResultDialog(): void {
    this.isBrickBreakerResultDialog = false;
    this.onBack();
  }

  /** 返回上一頁 */
  private onBack(): void {
    switch (this.$$store.state.RoomModule.memberType) {
      case MemberType.Player:
        switch (this.$$store.state.RoomModule.teamType) {
          case TeamType.FreeRoom:
            // 返回魔王挑戰
            this.$router.push(`/${MenuName.WorldContest}`);
            break;
          case TeamType.Room:
            // 返回校園賽事
            this.$router.push(`/${MenuName.RoomContest}`);
            break;
        }
        break;
      default:
        // 返回首頁
        location.replace(`${Config.homePath}`);
    }
  }
}
</script>
<style lang="scss" scoped>
.h5-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #251b0d;
  .game-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
