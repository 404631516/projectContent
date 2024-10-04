<template>
  <div class="trans-msg-warpper flex-pos">
    <el-dialog
      :class="[
        transType === TransStatus.StartGame ? 'start-area' : '',
        transType === TransStatus.TimeEnd ||
        transType === TransStatus.ContinueAnswer
          ? 'time-area'
          : '',
      ]"
      :visible="msgVisible"
      :show-close="false"
      :destroy-on-close="true"
      :lock-scroll="true"
    >
      <!-- 開始遊戲 -->
      <template v-if="transType === TransStatus.StartGame">
        <div class="arrow" :style="`${iconData.arrowSprit}`">開始遊戲</div>
      </template>
      <!-- 快閃店時間到 -->
      <template v-if="transType === TransStatus.TimeEnd">
        <div slot="title">
          <span :style="`${iconData.time}`"></span>
          時間到了!
        </div>
        <div>系統自動幫你將剩下的能量兌換成最低能量裝備</div>
      </template>
      <!-- 觸發續命題 -->
      <template v-if="transType === TransStatus.ContinueAnswer">
        <div slot="title">觸發續命題!</div>
        <div>答對將可以獲得特殊道具</div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { TransStatus } from '@/helper/enum/AnswerGame';

@Component({})
export default class TransMsg extends Vue {
  /** 轉場類型 */
  @Prop() public transType!: TransStatus;
  /** 顯示開關 */
  @Prop(Boolean) public msgVisible!: boolean;

  /** 轉場狀態 */
  private TransStatus = TransStatus;

  private iconData = {
    time: `background: url(${require('@/assets/images/icon/icon_robot.png')})`,
    arrowSprit: `background: url(${require('@/assets/images/icon/arrow_sprite.png')})`,
  };
}
</script>
<style lang="scss" scoped>
.trans-msg-warpper {
  .arrow {
    width: 100%;
    height: 249px;
    line-height: 249px;
    background-size: cover !important;
    animation: arrowPlay 0.8s steps(9) infinite;
  }
}
@keyframes arrowPlay {
  100% {
    background-position: 3990px;
  }
}
</style>
