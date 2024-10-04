<template>
  <div class="top-0 left-0 w-full h-full pt-2">
    <!-- Timer區域 -->
    <dl class="flex items-center justify-center bg-yellow-200 rounded-t-[10px]">
      <!-- Timer字樣 -->
      <dt class="font-bold text-[#d69f06] mr-7 text-2xl leading-8">Timer</dt>
      <!-- 倒數時間 -->
      <template v-if="isShowTime">
        <Timer :countDown="true" :isShowTime="isShowTime" :time="countdownTime" @onTimeUp="onTimeUp" />
      </template>
    </dl>
    <!-- 顯示題數與答對題數 -->
    <div
      class="shadow flex justify-center relative w-full text-white text-2xl tracking-wide py-1 font-medium"
      style="background: linear-gradient(135deg, #d69f05 80%, #55b3fc 20%)"
    >
      <div class="w-full">第{{ questOrder }}題/共{{ questTotalCount }}題</div>
      <div class="absolute w-[20%] top-1/2 right-0 transform -translate-y-1/2">
        答對題數　<span class="font-bold">{{ answerScore }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Timer from '@/components/Public/Timer.vue';
@Component({
  components: {
    Timer,
  },
})
export default class HeroApiQuizTimerAndQuestionNumber extends Vue {
  @Prop({ default: 0 }) public answerScore!: number;
  @Prop({ default: 0 }) public questOrder!: number;
  @Prop({ default: 0 }) public questTotalCount!: number;
  @Prop({ default: 0 }) public countdownTime!: number; // 倒數時間
  @Prop({ default: true }) public isShowTime!: boolean;
  @Emit('onTimeUp')
  private onTimeUp() {
    return;
  }
}
</script>

<style lang="scss">
.time-record-wrapper {
  color: #d69f06;
  font-size: 30px;
  font-weight: bold;
}
</style>
