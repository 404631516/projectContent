<template v-if="false">
  <!-- 背景 -->
  <div class="flex flex-col shadow-default" m="t-12" p="x-45 y-3.5" bg="[#F9F8F4]">
    <!-- 標題 -->
    <span text="left 3xl [#D69F05]" font="bold">{{ partyEventUpload.title }}</span>
    <!-- 預設區 -->
    <div class="flex items-center">
      <span text="left lg [#666666]">{{ textData.colorDefaultTitle }}</span>
      <el-color-picker v-model="partyEventUpload.defaultText" />
    </div>
    <!-- 客製化區 -->
    <!-- 顯示時段 -->
    <DatePicker
      class="flex"
      v-if="partyEventData.argValue !== ''"
      :startDate="partyEventData.startAt"
      :endDate="partyEventData.endAt"
      @onPick="onPickDate($event, partyEventData)"
    />
    <!-- 顏色 -->
    <div class="flex items-center">
      <span text="left lg [#666666]">{{ textData.colorCustomTitle }}</span>
      <el-color-picker v-model="partyEventData.argValue" :change="onChangedCustomColor(partyEventData.argValue)" />
    </div>
    <!-- 移除按鈕 -->
    <button
      v-if="partyEventData.argValue !== ''"
      class="w-max rounded-[30px] from-[#FF9191] to-[#FF5169]"
      p="x-5 y-1"
      bg="gradient-to-b"
      @click="onRemoveCustomColor"
    >
      <p text="xl [#FFFFFF] shadow-lightDefault">{{ textData.colorRemoveTitle }}</p>
    </button>
  </div>
</template>
<script lang="ts">
import { Component, ModelSync, Prop, Vue } from 'vue-property-decorator';
import DatePicker from '@/components/BackEndManagement/_FormProp/DatePicker.vue';
import { PartyEventData, PartyEventUpload } from '@/helper/interface/BackEndManagement';
import BackEndHelper from '@/views/H5/Helper/BackEndHelper';

@Component({
  components: {
    DatePicker,
  },
})
export default class EventColorUpload extends Vue {
  /** 更換的活動資料 */
  @ModelSync('eventData', 'change') partyEventData!: PartyEventData;
  /** 上傳組件預設資料 */
  @Prop() private partyEventUpload!: PartyEventUpload;

  /** 文字資料 */
  private textData = {
    colorDefaultTitle: `預設${this.partyEventUpload.title}`,
    colorCustomTitle: `變更${this.partyEventUpload.title}`,
    colorRemoveTitle: `移除${this.partyEventUpload.title}`,
  };

  /** 選擇設定開啟時間&結束時間
   * @param pickedDate
   */
  private onPickDate(pickedDate: string[], partyEventData: PartyEventData): void {
    BackEndHelper.onPickDate(pickedDate, partyEventData);
  }

  /** 替換客製顏色
   *  @param color 色碼
   */
  private onChangedCustomColor(color: string): void {
    // 為空不檢查
    if (color === '') {
      return;
    }

    // 檢查色碼是否有效
    if (this.isColorCodeValid(color) === false) {
      BackEndHelper.clearPartyEventData(this.partyEventData);
      this.partyEventData.isClear = true;
      return;
    }

    // 上傳顏色
    this.partyEventData.argValue = color;
    this.partyEventData.isClear = false;
  }

  /** 移除客製顏色 */
  private onRemoveCustomColor(): void {
    BackEndHelper.clearPartyEventData(this.partyEventData);
  }

  /** 檢查色碼
   *  @param color 色碼
   */
  private isColorCodeValid(color: string): boolean {
    if (color[0] !== '#') {
      this.$message.error('色碼第一位必須為#');
      return false;
    }

    if (color.length !== 7) {
      this.$message.error('色碼必須為#加上6位數字組成');
      return false;
    }

    return true;
  }
}
</script>
