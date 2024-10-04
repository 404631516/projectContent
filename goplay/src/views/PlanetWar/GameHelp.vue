<template>
  <div class="h5-wrapper">
    <GameHelpMsg :gameHelpBg="gameHelpBg" @onCloseGameHelp="onCloseGameHelp" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GameHelpMsg from '@/components/H5/Dialog/GameHelpMsg.vue';
import { WebGameName } from '@/helper/enum/WebGame';
import { onErrorReturn } from '../../router';
import { PlanetWarType } from '@/helper/enum/Common';
import imgPath from '../../config/imgPath/imgPath';

@Component({
  components: {
    GameHelpMsg,
  },
})
export default class GameHelp extends Vue {
  /** 遊戲說明圖 */
  private get gameHelpBg(): string {
    switch (this.$$store.state.PlanetWarModule.planetWarType) {
      // 塔防
      case PlanetWarType.Outter:
        return imgPath.gameHelpDefenseBg;
      // 逆塔防
      case PlanetWarType.Inner:
      case PlanetWarType.HeroUniverse:
        return imgPath.gameHelpAntiTDBg;
      default:
        return '';
    }
  }

  created() {
    // 防呆
    if (this.$$store.state.PlanetWarModule.learnLid < 0) {
      onErrorReturn();
    }
  }

  /** 關閉遊戲說明畫面 */
  private onCloseGameHelp(): void {
    // 轉跳遊戲
    this.$router.replace({ name: `${WebGameName.PlanetGame}` });
  }
}
</script>
<style lang="scss" scoped>
.h5-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  .game-container {
    height: 100% !important;
  }
}
</style>
