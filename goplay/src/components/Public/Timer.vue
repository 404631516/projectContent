<template>
  <div v-if="isShowTime" class="time-record-wrapper">
    <p>
      {{ showTime }}
    </p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator';
@Component({})
export default class Timer extends Vue {
  @Prop(Boolean) public isShowTime!: any;
  /** 預設值 */
  @Prop({ default: 0 }) public time!: number;
  /** 是否為倒計時 */
  @Prop(Boolean) public countDown!: any;
  /** 紀錄答題時間 */
  private usedSecond: number = 0;
  /** 實體 */
  private timer: any = null;
  /** 計時時間預設值 */
  private timeChang!: number;
  /** 顯示時間 */
  private showTime: string = '-:-';

  private created() {
    this.timeChang = this.time + 1;
    if (this.time !== 0) {
      this.onStartTime(); // 開始計時
    }
  }

  @Watch('time')
  private handleTime(val: number) {
    // 確定第一次進來接口請求返回數據才執行附值
    this.timeChang = val + 1;
    // 重置紀錄時間
    this.usedSecond = 0;
    if (this.timeChang) {
      this.onStartTime();
    }
  }

  /** 開始 */
  private onStartTime(): void {
    if (!this.timer) {
      this.timer = setInterval(this.onStartTime, 1000);
    } else {
      if (!this.countDown) {
        this.timeChang += 1;
        this.showTime = this.handleTimeDate(this.timeChang);
      } else {
        if (this.timeChang > 0) {
          this.timeChang -= 1;
          // 每扣一秒累加
          this.usedSecond += 1;
          // 答題時間紀錄
          this.$$store.commit('setRecordTime', this.usedSecond);
          this.showTime = this.handleTimeDate(this.timeChang);
        } else {
          this.timeChang = 0;
          this.usedSecond = 0; // 時間到未作答
          // 答題時間紀錄
          this.$$store.commit('setRecordTime', this.time);
          this.onTimeUp();
        }
      }
    }
  }

  /**
   * 處理時間戳格式
   * @param time
   */
  private handleTimeDate(time: number) {
    const date = new Date(time * 1000);
    const mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${mm}:${ss}`;
  }

  /** 結束 */
  private onStopTime() {
    if (this.timer) {
      this.clearTimer();
    } else {
      this.onStartTime();
    }
  }

  /** 重新倒數 */
  private onResetTime() {
    this.timeChang = 60;
  }

  /** 清除計時 */
  private clearTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  /** 消除 */
  private beforeDestroy() {
    if (this.timer) {
      this.clearTimer();
    }
  }

  /** 時間到 */
  @Emit('onTimeUp')
  private onTimeUp() {
    return;
  }
}
</script>
