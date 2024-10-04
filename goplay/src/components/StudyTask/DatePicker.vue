<template>
  <div class="grid grid-cols-[12.5rem,1.5rem,12.5rem] grid-rows-[0.6fr,1fr] gap-y-1" font="bold">
    <!-- 起始時間 -->
    <div class="self-end" text="[#D69F05]">
      {{ textData.startTime }}
    </div>
    <!-- 結束時間 -->
    <div class="col-start-3 self-end" text="[#D69F05]">
      {{ textData.endTime }}
    </div>
    <el-date-picker
      class="row-start-2 !w-full"
      format="yyyy/MM/dd"
      value-format="yyyy-MM-dd"
      v-model="rangeDate.startDay"
      :picker-options="{
        disabledDate: isAfterEndDate,
      }"
      @change="onStartDayChange"
    ></el-date-picker>
    <!-- 分隔符號 -->
    <span class="self-center justify-self-center">～</span>
    <el-date-picker
      class="!w-full"
      format="yyyy/MM/dd"
      value-format="yyyy-MM-dd"
      v-model="rangeDate.endDay"
      :picker-options="{
        disabledDate: isBeforeStartDate,
      }"
    ></el-date-picker>
  </div>
</template>

<script lang="ts">
import { Component, VModel, Vue } from 'vue-property-decorator';
import dayjs from 'dayjs';
import { DateData } from '@/helper/interface/TeacherAdmin';
import { toDayjs } from '../../manager/TimeSyncManager';

@Component({})
export default class DatePicker extends Vue {
  /** 綁定時間 */
  @VModel({ type: Object }) rangeDate!: DateData;

  /** 文字資料 */
  private textData = {
    startTime: '起始時間',
    endTime: '結束時間',
  };

  /**
   * 判斷是否選擇的開始日期晚於結束日期
   * @param time 選擇的日期
   */
  private isAfterEndDate(time: Date): boolean {
    return dayjs(time).isAfter(toDayjs(this.rangeDate.endDay));
  }

  /**
   * 判斷是否選擇的日期早於起始日期或晚於 30 天範圍
   * @param time 選擇的日期
   */
  private isBeforeStartDate(time: Date): boolean {
    const startDay = toDayjs(this.rangeDate.startDay);
    return dayjs(time).isBefore(startDay) || dayjs(time).isAfter(startDay.add(30, 'day'));
  }

  /**
   * 當起始時間發生變更時的處理函數
   * @param newDate 選擇的新起始時間
   */
  private onStartDayChange(newDate: string): void {
    this.rangeDate.startDay = newDate;
    if (dayjs(this.rangeDate.endDay).isAfter(dayjs(newDate).add(30, 'day'))) {
      this.rangeDate.endDay = dayjs(newDate).add(29, 'day').format('YYYY-MM-DD');
    }
  }
}
</script>

<style scoped>
::v-deep .el-input__inner {
  background: #eeeada;
  border: 0px;
  color: #666666;
  font-size: 18px;
}
::v-deep .el-input__prefix {
  display: none;
}
</style>
