<template>
  <div class="time-picker-area">
    <el-time-select
      v-model="startTime"
      :placeholder="textData.startPlaceholder"
      :picker-options="{
        start: '00:00',
        step: '00:15',
        end: '24:00',
      }"
      @change="onSelectTime(currentOpenPeriod, weekDayIndex, periodIndex)"
    >
    </el-time-select>
    <span class="time-rang-note">~</span>
    <el-time-select
      v-model="endTime"
      :placeholder="textData.endPlaceholder"
      :picker-options="{
        start: startTime,
        step: '00:15',
        end: '24:00',
      }"
      @change="onSelectTime(currentOpenPeriod, weekDayIndex, periodIndex)"
    >
    </el-time-select>
    <!-- 移除按鈕 -->
    <el-button type="danger" @click="onClickRemove">
      {{ textData.removeTitle }}
    </el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import { OpenPeriodInfo } from '@/helper/interface/Contest';

@Component({})
export default class TimePicker extends Vue {
  /** 開放時間 */
  @Prop() private openPeriod!: OpenPeriodInfo;
  /** 星期幾 */
  @Prop(Number) private weekDayIndex!: number;
  /** 開放時段 */
  @Prop(Number) private periodIndex!: number;

  /** 選單開始時間 */
  private startTime: string = '';
  /** 選單結束時間 */
  private endTime: string = '';

  /** 文字資料 */
  private textData = {
    startPlaceholder: '開始時間',
    endPlaceholder: '結束時間',
    removeTitle: '移除',
  };

  /** 取得當前時段 */
  private get currentOpenPeriod(): OpenPeriodInfo {
    return { start: this.startTime, end: this.endTime };
  }

  mounted() {
    this.startTime = this.openPeriod.start;
    this.endTime = this.openPeriod.end;
  }

  /** 點擊移除 */
  private onClickRemove(): void {
    this.onRemove(this.weekDayIndex, this.periodIndex);
  }

  /** 更新開放時間 */
  @Watch('openPeriod')
  private onOpenPeriodChange(value: OpenPeriodInfo): void {
    this.startTime = value.start;
    this.endTime = value.end;
  }

  /** 選擇時間 */
  @Emit('onSelectTime')
  private onSelectTime(openPeriod: OpenPeriodInfo, weekDayIndex: number, periodIndex: number): void {
    return;
  }

  /** 移除時間 */
  @Emit('onRemove')
  private onRemove(weekDayIndex: number, periodIndex: number): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.time-picker-area {
  margin: 0.8vw 1vw;
  .time-rang-note {
    margin: 0 1vw;
  }
}
</style>
