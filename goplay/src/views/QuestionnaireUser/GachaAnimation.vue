<template>
  <div>
    <!-- 轉蛋第一部分 -->
    <GatchaStart v-if="isShowGachaStart" @gatchaStartNext="gatchaStartNext" />
    <!-- 轉蛋第二部分 -->
    <GatchaProcess v-if="isShowGachaProcess" :rewardRank="rewardRank" @gachaProcessNext="gachaProcessNext" />
    <!-- 轉蛋結果 -->
    <GatchaResult
      v-if="isShowGachaResult"
      :rewardRank="rewardRank"
      :fixedReward="fixedReward"
      :gatchaReward="gatchaReward"
      @onClickConfirm="onClickConfirm"
    />
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { ContestGameAward } from '@/helper/interface/Contest';
import GatchaProcess from './GatchaProcess.vue';
import GatchaResult from './GatchaResult.vue';
import GatchaStart from './GatchaStart.vue';
@Component({
  components: {
    GatchaStart,
    GatchaProcess,
    GatchaResult,
  },
})
export default class GatchaAnimation extends Vue {
  /** 獎勵階級 */
  @Prop(Number) private rewardRank!: number;
  /** 基本獎勵 */
  @Prop() private fixedReward!: ContestGameAward[];
  /** 轉蛋獎勵 */
  @Prop() private gatchaReward!: ContestGameAward[];

  /** 轉蛋第一部份顯示開關 */
  private isShowGachaStart: boolean = true;
  /** 轉蛋第二部份顯示開關 */
  private isShowGachaProcess: boolean = false;
  /** 轉蛋結果顯示開關 */
  private isShowGachaResult: boolean = false;

  /** 轉蛋第一部分結束 */
  private gatchaStartNext() {
    this.isShowGachaStart = false;
    this.isShowGachaProcess = true;
  }

  /** 轉蛋第二部分結束 */
  private gachaProcessNext() {
    this.isShowGachaProcess = false;
    this.isShowGachaResult = true;
  }

  /** 點擊確定 */
  @Emit('onClickConfirm')
  private onClickConfirm(): void {
    return;
  }
}
</script>
