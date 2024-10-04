<template>
  <div class="gamehelp-msg-warpper">
    <el-dialog :visible="true" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
      <!-- 標題 -->
      <div slot="title" class="flex-pos">
        <div :style="`background: url(${imgData.blurImg})`" class="gamaehelp-title">
          {{ textData.helpInfoTitle }}
        </div>
      </div>
      <!-- 說明圖 -->
      <div class="gamehelp-content-area flex-pos">
        <div class="gamehelp-content">
          <img :src="gameHelpBg" />
        </div>
      </div>
      <!-- 確認按鈕 -->
      <div class="btn-box flex-pos">
        <el-button class="btn-check btn-game-again" @click="onCloseGameHelp">
          <span class="flex-pos">{{ textData.confirmTitle }}</span>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';

@Component({})
export default class GameHelpMsg extends Vue {
  /** 遊戲說明圖 */
  @Prop(String) public gameHelpBg!: string;

  /** 文字資料 */
  private textData = {
    helpInfoTitle: '遊戲說明',
    confirmTitle: '確定',
  };

  /** 圖片資料 */
  private imgData = {
    blurImg: ImgPath.gameHelpBlur,
  };

  /** 點擊關閉 */
  @Emit('onCloseGameHelp')
  private onCloseGameHelp(): void {
    return;
  }
}
</script>
<style lang="scss">
.gamehelp-msg-warpper {
  background-color: transparent;
  .gamaehelp-title {
    position: relative;
    margin: 0 auto;
    width: 100%;
    height: 80px;
    line-height: 80px;
    font-size: 24px;
    background-size: cover !important;
    background-repeat: no-repeat !important;
    color: #fff;
  }
  .gamehelp-content-area {
    width: 100%;
    height: auto;
    .gamehelp-content {
      width: 70%;
      height: auto;
      img {
        width: 100%;
        height: auto;
      }
    }
  }
  .btn-box {
    width: 100%;
    margin-top: 2vw;
    .btn-game-again {
      width: 10vw;
    }
  }
}
</style>
