<template>
  <div class="getbar-warpper">
    <div class="flex-pos">
      <div class="bottom-box">
        <dl>
          <dt>Timer</dt>
          <dd class="flex-pos">
            <!-- 倒數時間 -->
            <template v-if="isShowTime">
              <Timer
                :countDown="true"
                :isShowTime="isShowTime"
                :time="countdownTime"
                @onTimeUp="onTimeUp"
              />
            </template>
          </dd>
        </dl>
        <div class="show-text flex-pos">
          <div>第 {{ questOrder }}題 / 共 {{ questTotalCount }}題</div>
          <div class="correct-area">
            答對題數
            <span>{{ answerScore }}</span>
          </div>
        </div>
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
export default class GetBar extends Vue {
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
<style lang="scss" scope>
.getbar-warpper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 12;
  width: 100%;
  height: 130px;
  color: #fff;
  padding-top: 10px;
  .bottom-box {
    width: 80%;
    height: auto;
    > .flex-pos {
      margin-right: 20px;
    }
    dt {
      font-size: 20px;
    }
    dd {
      margin-top: -8px;
      .time-record-wrapper {
        width: 25%;
        font-size: 26px;
        color: #f7e735;
        background: transparent
          linear-gradient(
            270deg,
            #00000000 0%,
            #000000cc 49%,
            #000000cb 49%,
            #00000000 100%
          )
          0% 0% no-repeat padding-box;
      }
    }
    .show-text {
      margin-top: -2px;
      position: relative;
      font-size: 20px;
      color: #f7e735;
      .correct-area {
        position: absolute;
        padding: 0 10px;
        right: 0;
        bottom:0;
        padding: 5px 8px;
        background-color: #00000080;
        span {
          font-size: 32px;
          color: #2ceaec;
        }
      }
    }
  }
}
</style>
