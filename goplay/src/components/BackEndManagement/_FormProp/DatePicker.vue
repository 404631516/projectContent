<template>
  <div>
    <div>
      <el-date-picker
        v-model="pickedDate"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        :default-time="['00:00:00', '23:59:59']"
        range-separator="到"
        start-placeholder="開始日期"
        end-placeholder="結束日期"
        @change="onPick(pickedDate)"
      >
      </el-date-picker>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';

@Component({})
export default class DatePicker extends Vue {
  /** 開始日期 */
  @Prop(String) private startDate!: string;
  /** 結束日期 */
  @Prop(String) private endDate!: string;

  /** 當前選擇日期 */
  private pickedDate: string[] = [];

  created() {
    this.pickedDate = Object.assign([], [this.startDate, this.endDate]);
  }

  /** 選擇日期 */
  @Emit('onPick')
  private onPick(pickedDate: string[]): void {
    return;
  }
}
</script>
<style lang="scss" scoped></style>
