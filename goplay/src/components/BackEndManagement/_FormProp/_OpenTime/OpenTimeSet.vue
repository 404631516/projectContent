<template>
  <div class="open-time-set-area">
    <!-- 星期設置 --->
    <div v-for="(weekDay, weekDayIndex) in currentOpenPeriod" :key="weekDayIndex" class="week-content">
      <!-- 星期幾 -->
      <div>{{ getWeekDayName(weekDayIndex) }}</div>
      <!-- 開放選項 -->
      <div class="select-radio">
        <el-radio-group v-model="openPeriodStatus[weekDayIndex]">
          <el-radio :label="OpenPeriodStatus.AllDay">
            {{ textData.allDayTitle }}
          </el-radio>
          <el-radio :label="OpenPeriodStatus.Closed">
            {{ textData.closedTitle }}
          </el-radio>
          <el-radio :label="OpenPeriodStatus.Limited">
            {{ textData.limitedTitle }}
          </el-radio>
        </el-radio-group>
      </div>
      <!-- 開放時段 --->
      <div v-if="openPeriodStatus[weekDayIndex] === OpenPeriodStatus.Limited">
        <!-- 時段設定 -->
        <div v-for="(openPeriod, periodIndex) in weekDay" :key="periodIndex" class="time-add-box">
          <ol class="flex-pos left">
            <li>
              <div class="flex-pos">
                <div>{{ textData.periodTitle }}{{ periodIndex + 1 }}</div>
                <TimePicker
                  :openPeriod="openPeriod"
                  :weekDayIndex="weekDayIndex"
                  :periodIndex="periodIndex"
                  @onSelectTime="onSelectTimePeriod"
                  @onRemove="onRemoveTimePeriod"
                />
              </div>
            </li>
          </ol>
        </div>
        <!-- 時段按鈕 -->
        <SettingButton
          :isShowSaveButton="false"
          :addTitle="textData.addOpenPeriodTitle"
          @onAdd="onAddTimePeriod(weekDay)"
          @onReset="onResetTimePeriod(weekDay)"
        />
      </div>
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

/** 開放時間狀態 */
export enum OpenPeriodStatus {
  /** 全天 */
  AllDay = 0,
  /** 禁止 */
  Closed,
  /** 限制 */
  Limited,
}

@Component({
  components: {
    TimePicker,
    SettingButton,
  },
})
export default class OpenTimeSet extends Vue {
  /** 賽事開放時段 */
  @Prop(Array) private openPeriodData!: OpenPeriodInfo[][];

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

  /** 開放時段狀態 */
  private openPeriodStatus: OpenPeriodStatus[] = [
    OpenPeriodStatus.AllDay,
    OpenPeriodStatus.AllDay,
    OpenPeriodStatus.AllDay,
    OpenPeriodStatus.AllDay,
    OpenPeriodStatus.AllDay,
    OpenPeriodStatus.AllDay,
    OpenPeriodStatus.AllDay,
  ];

  /** 文字資料 */
  private textData = {
    allDayTitle: '全天開放',
    closedTitle: '當日禁止',
    limitedTitle: '時段限制',
    addOpenPeriodTitle: '+添加開放時段',
    periodTitle: '時段',
    saveTitle: '儲存設定',
    hint: '(記得[儲存]否則設定無效)',
    unsaved: '尚未儲存',
  };

  /** 未儲存 */
  private isUnsaved: boolean = false;

  /** 開放時段狀態 */
  private OpenPeriodStatus = OpenPeriodStatus;

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
        // 設定當天的時間限制狀態
        this.openPeriodStatus[i] = this.getOpenPeriodStatus(this.currentOpenPeriod[i]);
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

  /** 取得當日開放狀態
   * @param weekDay
   */
  private getOpenPeriodStatus(weekDay: OpenPeriodInfo[]): OpenPeriodStatus {
    // 返還當天限制
    return weekDay.length > 0 ? OpenPeriodStatus.Limited : OpenPeriodStatus.Closed;
  }

  /** 取得結果開放狀態清單 */
  private getResultOpenPeriod(): Array<OpenPeriodInfo[] | null> | null {
    // 組成新的時間限制資料
    const newOpenPeriodData: Array<OpenPeriodInfo[] | null> = [];

    // 更新設定
    for (let i = 0; i < this.openPeriodStatus.length; i++) {
      // 根據狀態更改資料
      switch (this.openPeriodStatus[i]) {
        // 全日開放
        case OpenPeriodStatus.AllDay:
          newOpenPeriodData.push(null);
          break;
        // 禁止
        case OpenPeriodStatus.Closed:
          newOpenPeriodData.push([]);
          break;
        // 限制
        case OpenPeriodStatus.Limited:
          // 新增限制
          newOpenPeriodData.push(this.currentOpenPeriod[i]);
          break;
      }
    }

    // 全都全天開放
    return newOpenPeriodData.findIndex((openPeriod) => openPeriod !== null) > -1 ? newOpenPeriodData : null;
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

  /** 更新限制時段
   * @param timePeriod
   * @param weekDayIndex
   * @param periodIndex
   */
  private onSelectTimePeriod(openPeriod: OpenPeriodInfo, weekDayIndex: number, periodIndex: number): void {
    // 更新設定
    this.currentOpenPeriod[weekDayIndex].splice(periodIndex, 1, openPeriod);
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

  /** 點擊儲存 */
  private onClickSave(): void {
    this.onSave(this.getResultOpenPeriod());
    this.isUnsaved = false;
  }

  /** 儲存限制時段
   * @param currentOpenPeriod
   */
  @Emit('onSave')
  private onSave(currentOpenPeriod: Array<OpenPeriodInfo[] | null> | null): void {
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
