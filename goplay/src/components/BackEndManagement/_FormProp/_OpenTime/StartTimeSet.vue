<template>
  <div class="open-time-set-area">
    <!-- 星期設置 --->
    <div v-for="(weekDay, weekDayIndex) in currentOpenPeriod" :key="weekDayIndex" class="week-content">
      <!-- 星期幾 -->
      <div>{{ getWeekDayName(weekDayIndex) }}</div>
      <!-- 時段設定 -->
      <div v-for="(openPeriod, periodIndex) in weekDay" :key="periodIndex" class="time-add-box">
        <ol class="flex-pos left">
          <li>
            <div class="flex-pos mb-5px">
              <div>{{ textData.periodTitle }}{{ periodIndex + 1 }}</div>
              <el-time-select
                class="ml-10px"
                v-model="currentOpenPeriod[weekDayIndex][periodIndex].start"
                :picker-options="{
                  start: '07:00',
                  step: `00:${roundTime}`,
                  end: '22:00',
                }"
                :placeholder="textData.startTime"
              >
              </el-time-select>
              <div
                v-if="
                  isTimeOverlap(currentOpenPeriod[weekDayIndex][periodIndex].start, currentOpenPeriod[weekDayIndex])
                "
                class="mx-4px"
              >
                {{ textData.timeOverlap }}
              </div>
              <el-button type="danger" @click="onRemoveTimePeriod(weekDayIndex, periodIndex)">
                {{ textData.removeTitle }}
              </el-button>
            </div>
          </li>
        </ol>
      </div>
      <!-- 時段按鈕 -->
      <SettingButton
        class="mt-10px"
        :isShowSaveButton="false"
        :addTitle="textData.addOpenPeriodTitle"
        @onAdd="onAddTimePeriod(weekDay)"
        @onReset="onResetTimePeriod(weekDay)"
      />
    </div>
    <!-- 儲存按鈕 -->
    <div class="top-box">
      <el-button type="success" @click="onClickSave">
        {{ textData.saveTitle }}
      </el-button>
      <span class="note">{{ textData.hint }}</span>
      <span class="note" v-if="isUnsaved">{{ textData.unsaved }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import TimePicker from './TimePicker .vue';
import SettingButton from '@/components/BackEndManagement/_FormProp/SettingButton.vue';
import { OpenPeriodInfo } from '@/helper/interface/Contest';
import dayjs from 'dayjs';

@Component({
  components: {
    TimePicker,
    SettingButton,
  },
})
export default class StartTimeSet extends Vue {
  /** 賽事開放時段 */
  @Prop(Array) private openPeriodData!: OpenPeriodInfo[][];
  /** 房間遊戲時間 */
  @Prop(Number) private roundTime!: number;

  /** 編輯中開放時段 */
  private currentOpenPeriod: OpenPeriodInfo[][] = [
    [{ start: '', end: '' }],
    [{ start: '', end: '' }],
    [{ start: '', end: '' }],
    [{ start: '', end: '' }],
    [{ start: '', end: '' }],
    [{ start: '', end: '' }],
    [{ start: '', end: '' }],
  ];

  /** 文字資料 */
  private textData = {
    startTime: '開始時間',
    addOpenPeriodTitle: '+添加開放時段',
    periodTitle: '時段',
    removeTitle: '移除',
    saveTitle: '儲存設定',
    hint: '(記得[儲存]否則設定無效)',
    unsaved: '尚未儲存',
    timeOverlap: '時間重疊',
  };

  /** 未儲存 */
  private isUnsaved: boolean = false;

  created() {
    // 全開放, 不處理
    if (this.openPeriodData === null) {
      return;
    }

    // 更新設定
    for (let i = 0; i < this.openPeriodData.length; i++) {
      if (this.openPeriodData[i] !== null) {
        // 清空列表
        this.currentOpenPeriod[i].splice(0);
        // 加入之前設定的時間限制
        this.openPeriodData[i].forEach((period) => {
          this.currentOpenPeriod[i].push(Object.assign({}, period));
        });
      }
    }
  }

  /** 取得星期幾名稱
   * @param weekDayIndex
   */
  private getWeekDayName(weekDayIndex: number): string {
    switch (weekDayIndex) {
      case 0:
        return '星期日';
      case 1:
        return '星期一';
      case 2:
        return '星期二';
      case 3:
        return '星期三';
      case 4:
        return '星期四';
      case 5:
        return '星期五';
      case 6:
        return '星期六';
    }
    return '';
  }

  /** 取得結果開放狀態清單 */
  private getResultOpenPeriod(): OpenPeriodInfo[][] {
    // 刪除未選擇欄位
    this.currentOpenPeriod = this.currentOpenPeriod.map((weekday: OpenPeriodInfo[]) => {
      return weekday.filter((period) => period.start.length !== 0);
    });

    for (const weekDay of this.currentOpenPeriod) {
      if (weekDay.length !== 0) {
        for (const period of weekDay) {
          // 填上結束時間
          period.end = dayjs()
            .hour(Number(period.start.slice(0, 2)))
            .minute(Number(period.start.slice(3, 5)))
            .add(this.roundTime, 'minute')
            .format('HH:mm');
        }
      }
    }
    return this.currentOpenPeriod;
  }

  /** 判斷是否重疊
   *  @param startTime
   *  @param weekDay
   */
  private isTimeOverlap(startTime: string, weekDay: OpenPeriodInfo[]): boolean {
    // 只有一個時段
    if (weekDay.length <= 1) {
      return false;
    }
    // 空時段不檢查
    if (startTime.length === 0) {
      return false;
    }
    // 有相同時段
    if (weekDay.filter((period: OpenPeriodInfo) => period.start === startTime).length > 1) {
      return true;
    }

    const start = dayjs()
      .hour(Number(startTime.slice(0, 2)))
      .minute(Number(startTime.slice(3, 5)));

    for (const period of weekDay) {
      // 不比對空時段
      if (period.start.length === 0) {
        continue;
      }
      // 不比對自己
      if (period.start === startTime) {
        continue;
      }
      const periodStart = dayjs()
        .hour(Number(period.start.slice(0, 2)))
        .minute(Number(period.start.slice(3, 5)));
      const periodEnd = periodStart.add(this.roundTime, 'minute');

      // 比目標結束相同或晚不會重疊
      if (start.isAfter(periodEnd, 'minutes') || start.isSame(periodEnd, 'minutes')) {
        continue;
      }

      // 比目標開始還晚
      if (start.isAfter(periodStart, 'minutes')) {
        return true;
      }
    }
    return false;
  }

  /** 新增限制時段
   * @param weekDay
   */
  private onAddTimePeriod(weekDay: OpenPeriodInfo[]): void {
    weekDay.push({ start: '', end: '' });
  }

  /** 重置限制時段
   * @param weekDay
   */
  private onResetTimePeriod(weekDay: OpenPeriodInfo[]): void {
    weekDay.splice(0);
    weekDay.push({ start: '', end: '' });
  }

  /** 移除限制時段
   * @param weekDayIndex
   * @param periodIndex
   */
  private onRemoveTimePeriod(weekDayIndex: number, periodIndex: number): void {
    this.currentOpenPeriod[weekDayIndex].splice(periodIndex, 1);
  }

  /** 檢查是否未儲存
   * @param gamePeriod
   */
  public checkNeedSave(gamePeriod: OpenPeriodInfo[][] | null): boolean {
    // 取得暫存時間限制
    const resultPeriod = this.getResultOpenPeriod();

    // 新舊設定都不限制不檢查
    if (resultPeriod == null && gamePeriod == null) {
      this.isUnsaved = false;
    }
    // 新舊設定都有限制檢查是否相同
    else if (resultPeriod != null && gamePeriod != null) {
      // 設定是否未儲存
      this.isUnsaved = JSON.stringify(resultPeriod) !== JSON.stringify(gamePeriod);
    }
    // 新舊其中一個不限制，另一個有限制
    else {
      this.isUnsaved = true;
    }

    return this.isUnsaved;
  }

  /** 檢查是否有重疊時段 */
  public hasOverlap(): boolean {
    // 取得暫存時間限制
    const resultPeriod = this.getResultOpenPeriod();
    for (const weekDay of resultPeriod) {
      if (weekDay.length !== 0) {
        for (const period of weekDay) {
          if (this.isTimeOverlap(period.start, weekDay)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /** 點擊儲存 */
  private onClickSave(): void {
    this.onSave(this.getResultOpenPeriod());
    this.isUnsaved = false;
  }

  /** 儲存限制時段
   * @param currentOpenPeriod
   */
  @Emit('onSave')
  private onSave(currentOpenPeriod: Array<OpenPeriodInfo[] | null>): void {
    return;
  }
}
</script>
<style lang="scss">
.open-time-set-area {
  .top-box {
    margin-bottom: 1vw;
  }
  .week-content {
    width: 100%;
    height: auto;
    padding: 12px;
    border: 1px solid #707070;
    border-radius: 0.3125rem;
    margin-bottom: 1vw;
    .time-add-box {
      margin-left: 1vw;
      li {
        font-size: 16px;
      }
    }
    .note {
      margin-left: 1vw;
      font-size: 14px;
      color: #d69f05;
    }
  }
  .note {
    font-size: 16px;
    margin-left: 1vw;
    color: #d69f05;
  }
  .select-radio {
    .el-radio__label {
      color: #666666;
    }
  }
}
</style>
