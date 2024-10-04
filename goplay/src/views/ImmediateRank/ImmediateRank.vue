<template>
  <div class="w-full h-full flex-pos" bg="[#000000]">
    <div :id="containerId" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { RankGame } from '../H5/Games/Common/PhaserGameStrategy';
import { onErrorReturn } from '../../router';

@Component({})
export default class ImmediateRank extends Vue {
  /** 遊戲表演座標 */
  private containerId = 'rank-container';
  /** 即時排行 */
  private rankGame?: RankGame;

  mounted() {
    // 防呆
    if (this.$$store.state.ImmediateRankModule.contestId === 0) {
      onErrorReturn();
      return;
    }

    this.rankGame = new RankGame();
    this.rankGame.startGame(this.containerId, this.$$store.getters.isMute);
  }

  destroyed() {
    this.rankGame?.destroyGame();
  }
}
</script>
<style lang="scss" scoped>
.immediate-rank {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  background: black;
}
</style>
