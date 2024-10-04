<template>
  <div class="w-full h-full fixed top-60px z-5" bg="[#00000080] opacity-60 no-repeat">
    <div class="w-full aspect-video relative">
      <!-- 黃色背景 -->
      <img class="absolute right-[10%] h-full" :src="imgData.yellowBackground" />
      <!-- 對話框 -->
      <img class="absolute left-[17%] top-[11%] w-[25%]" :src="imgData.gatchaTalk" />
      <!-- 轉蛋機 -->
      <img class="absolute right-[19%] w-[46.78%] aspect-square" :src="imgData.gatchaFull" />
      <!-- 按鈕 -->
      <div
        class="w-[11.71%] aspect-square image_animation absolute right-[41.5%] top-[34%]"
        bg="cover"
        :style="{ backgroundImage: `url(${imgData.gatchaButton})` }"
        @animationend="gatchaStartNext"
      ></div>
    </div>
  </div>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { Component, Emit, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class GatchaStart extends Vue {
  /** 圖片資料 */
  private imgData = {
    yellowBackground: imgPath.yellowDotBackground,
    gatchaButton: imgPath.gatchaButtonAnimation,
    gatchaFull: imgPath.gatchaFull00,
    gatchaTalk: imgPath.gatchaTalk,
  };

  /** 呼叫下一段轉蛋動畫 */
  @Emit('gatchaStartNext')
  private gatchaStartNext(): void {
    return;
  }
}
</script>
<style scoped>
.image_animation {
  animation: button steps(8) 1.5s 2;
}
@keyframes button {
  to {
    background-position: 0 -800%;
  }
}
</style>
