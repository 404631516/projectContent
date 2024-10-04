<template>
  <div class="grid grid-cols-[12.5rem,1.5rem,12.5rem] grid-rows-[0.6fr,1fr] gap-y-1" font="bold">
    <!-- 起始時間 -->
    <div class="self-end" text="[#D69F05]">
      {{ textData['qi-shi-shi-jian'] }}
    </div>
    <!-- 結束時間 -->
    <div class="col-start-3 self-end" text="[#D69F05]">
      {{ textData['jie-shu-shi-jian'] }}
    </div>
    <el-date-picker
      class="row-start-2 !w-full"
      format="yyyy/MM/dd"
      value-format="yyyy-MM-dd"
      v-model="rangeDate.startDay"
      :picker-options="{
        disabledDate: isAfterEndDate,
      }"
    ></el-date-picker>
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
  /**綁定時間 */
  @VModel({ type: Object }) rangeDate!: DateData;

  /**文字資料 */
  private textData = {
    'qi-shi-shi-jian': '起始時間',
    'jie-shu-shi-jian': '結束時間',
  };

  /** 開始時間限制
   * @param time
   */
  private isAfterEndDate(time: Date): boolean {
    return dayjs(time).isAfter(toDayjs(this.rangeDate.endDay));
  }

  /** 結束時間限制
   * @param time
   */
  private isBeforeStartDate(time: Date): boolean {
    return dayjs(time).isBefore(toDayjs(this.rangeDate.startDay));
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
