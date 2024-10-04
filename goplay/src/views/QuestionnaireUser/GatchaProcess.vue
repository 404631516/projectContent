<template>
  <div class="w-full h-full fixed top-60px z-5" bg="[#00000080] opacity-60 no-repeat">
    <div class="w-full aspect-video flex items-center relative">
      <transition appear name="slide-in" @after-enter="gachaProcessNext">
        <div class="flex items-center relative">
          <img class="w-full" :src="imgData.yellowHorizonBackground" />
          <transition appear name="fade-in"
            ><img class="w-[25.1%] inline-block absolute right-[15%] bottom-0" :src="gachaFace"
          /></transition>
        </div>
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class GatchaProcess extends Vue {
  /** 獎勵階級 */
  @Prop(Number) private rewardRank!: number;

  /** 依照獎勵階級決定轉蛋機種類 */
  private get gachaFace(): string {
    switch (this.rewardRank) {
      case 1:
        return imgPath.gatchaFace03;
      case 2:
        return imgPath.gatchaFace02;
      default:
        return imgPath.gatchaFace01;
    }
  }

  /** 圖片資料 */
  private imgData = {
    yellowHorizonBackground: imgPath.yellowHorizonBackground,
  };

  /** 呼叫轉蛋結果 */
  @Emit('gachaProcessNext')
  private gachaProcessNext(): void {
    return;
  }
}
</script>
<style scoped>
.slide-in-enter-active {
  animation: slide-in 2.5s;
}

@keyframes slide-in {
  0% {
    transform: translateX(-100%);
  }
  40% {
    transform: translateX(0%);
  }
  60% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

.fade-in-enter {
  opacity: 0;
}
.fade-in-enter-to {
  transition: opacity 1.2s;
}
.fade-in-enter-to {
  opacity: 1;
}
</style>
