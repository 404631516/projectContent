<!--問巻清單格子 -->
<template>
  <!--欄位: 已參加icon，主要問巻資訊 -->
  <div class="mx-auto w-[67%] mb-10px rounded-[10px] relative">
    <!-- 已參加問巻(已填寫時才顯示) -->
    <img
      v-if="questionnaireData.isFilled"
      class="absolute -left-140px w-141px <sm:hidden"
      :src="imgData.questionnaireFilledIcon"
    />
    <!-- 主要問巻資訊 (可點擊cell開啟問巻)
         grid的欄位為: 問巻狀態; 問巻名稱; 時間/人數/題數; 下載鈕(會隱藏) -->
    <button
      class="w-full rounded-[10px] grid gap-x-12px items-center shadow-default <sm:grid-cols-1"
      :class="isEditor ? 'grid-cols-[10%,43%,30%,14%]' : 'grid-cols-[10%,58%,30%] <lg:grid-cols-[15%,auto,55%]'"
      p="y-12px x-16px"
      bg="[#FFF]"
      border="1 solid [#CCCCCC]"
      text="[#545454] 30px"
      @click="onClickQuestionnaireCell(questionnaireData)"
    >
      <!-- 問巻狀態 -->
      <!-- 灰字:尚未開始，未達開始時間 -->
      <span v-if="isStart === false" text="[#9A9A9A]">{{ textData.stateNotStart }}</span>
      <!-- 紅字:已結束，到達結束時間 -->
      <span v-else-if="isExpired" text="[#FC6E6E]">{{ textData.stateFinish }}</span>
      <!-- 棕字:未發布(到達開始時間 且 isPublish=0) -->
      <span v-else-if="questionnaireData.isPublish === DBBoolean.False" text="[#E1BB25]">
        {{ textData.stateNoPublish }}
      </span>
      <!-- 綠字:進行中(到達開始時間 且 isPublish=1) -->
      <span v-else text="[#12CEBB]">{{ textData.stateRunning }}</span>
      <!-- 問巻名稱 -->
      <span class="<sm:flex <sm:justify-center <sm:mb-1" text="left">
        {{ questionnaireData.title }}
      </span>
      <!-- 時間/人數/題數 -->
      <span class="flex flex-col space-y-10px">
        <!-- 開放時間 -->
        <div text="right 24px <sm:center <sm:20px">
          {{ questionnaireTime }}
        </div>
        <!-- 文字/人數/文字/題數 -->
        <div class="grid grid-cols-[36%,26%,26%,12%] items-center <sm:grid-cols-[4fr,1fr,2fr,1fr]">
          <!-- 參與問卷人數 -->
          <span text="left 20px <sm:16px"> {{ textData.filledCount }}</span>
          <span text="left 24px [#00CCCE] <sm:16px"> {{ questionnaireData.filledCount }}</span>
          <!-- 總題數 -->
          <span m="l-[10%]" text="20px <sm:16px"> {{ textData.questionCount }}</span>
          <span text="right 24px [#00CCCE] <sm:16px"> {{ questionnaireData.questionCount }}</span>
        </div>
      </span>
      <!-- 下載結果數據鈕 (進行中顯示按鈕) -->
      <button
        v-if="isEditor && isStart && questionnaireData.isPublish === DBBoolean.True"
        class="w-180px h-47px rounded-[80px] shadow-default blueGradient"
        text="[#FFF] 20px"
        @click.stop="onClickDownloadButton(questionnaireData)"
      >
        {{ textData.downloadResult }}
      </button>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { QuestionnaireListDataNet } from '@/helper/interface/Questionnaire';
import { DBBoolean } from '@/helper/enum/Common';
import { isPassed, toDayjs } from '../../manager/TimeSyncManager';

@Component({
  components: {},
})
export default class QuestionnaireCell extends Vue {
  /** 問巻資料 */
  @Prop() private questionnaireData!: QuestionnaireListDataNet;
  /** 編輯模式 */
  @Prop() private isEditor!: boolean;

  private DBBoolean = DBBoolean;

  /** 圖片資料*/
  private imgData = {
    questionnaireFilledIcon: imgPath.questionnaireFilledIcon,
  };

  /** 文字資料 */
  private textData = {
    filledCount: '參與問卷人數',
    questionCount: '總題數',
    downloadResult: '下載統計數據',
    stateRunning: '進行中',
    stateFinish: '已結束',
    stateNoPublish: '未發佈',
    stateNotStart: '尚未開始',
  };

  /** 已到達開始時間 */
  private get isStart(): boolean {
    // 遊戲時間已超過
    return isPassed(this.questionnaireData.startAt);
  }

  /** 已到達結束時間 */
  private get isExpired(): boolean {
    // 遊戲時間已超過
    return isPassed(this.questionnaireData.endAt);
  }

  /** 取得問巻開始~結束時間 */
  private get questionnaireTime(): string {
    // 轉換時間格式
    if (this.questionnaireData.startAt == null || this.questionnaireData.endAt == null) {
      return '時間尚未設定';
    }
    return (
      `${toDayjs(`${this.questionnaireData.startAt}`).format('YYYY-MM-DD')} - ` +
      `${toDayjs(`${this.questionnaireData.endAt}`).format('YYYY-MM-DD')}`
    );
  }

  /** 按下問巻CELL, 並通知父層
   * @param questionnaireData 問巻資料
   */
  @Emit('onClickQuestionnaireCell')
  private onClickQuestionnaireCell(questionnaireData: QuestionnaireListDataNet): void {
    return;
  }

  /** 按下 下載結果數據鈕, 並通知父層
   * @param questionnaireData 問巻資料
   */
  @Emit('onClickDownloadButton')
  private onClickDownloadButton(questionnaireData: QuestionnaireListDataNet): void {
    return;
  }
}
</script>
