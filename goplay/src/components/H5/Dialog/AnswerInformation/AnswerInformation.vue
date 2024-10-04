<template>
  <el-dialog :visible.sync="isDialogVisible" :show-close="false" @open="onOpen" destroy-on-close>
    <!-- 求救彈窗 -->
    <HelpMessageDialog
      v-model="isShowHelp"
      :questionData="currentQuestion"
      @onCloseHelp="isShowHelp = false"
      @onHelpSuccess="isShowHelpSuccess = true"
    />
    <!-- 求助成功彈窗 -->
    <SuccessDialog v-model="isShowHelpSuccess" @closeDialog="isShowHelpSuccess = false" @goLeaderboard="onGoRankList" />
    <!-- 標題 -->
    <div
      slot="title"
      class="w-[95%] flex items-center justify-center relative rounded-[30px]"
      m="x-auto"
      p="y-2"
      text="[#FFF] 32px shadow-lightDefault"
      bg="[#EEA73D]"
    >
      {{ textData.answerInformationTitle }}
      <i
        class="el-icon-close absolute right-4 cursor-pointer"
        font="before:bold"
        text="shadow-none"
        @click="onBack"
      ></i>
    </div>
    <!-- 答題資訊列表 -->
    <div v-if="!isShowContent">
      <div
        class="grid grid-cols-[1fr,5fr,1.8fr] <sm:grid-cols-[4fr,2.5fr] items-center gap-x-1 rounded-[15px] w-9/10"
        p="y-2 x-3"
        m="x-auto"
        border="1px solid [#D1CEB8]"
      >
        <img class="w-24 h-22 object-contain transform rotate-y-180 <sm:hidden" :src="imgData.heroIcon" />
        <span text="xl [#A5A5A5] left">{{ textData.learningLinkHint }}</span>
        <a
          class="rounded-[20px] shadow-default"
          text="[#FFF] [22px]"
          p="y-2 x-3"
          bg="[#18CB18]"
          target="_blank"
          @click="onClickLearningLink"
          >{{ textData.openLearningLink }}</a
        >
      </div>
      <div class="h-120 overflow-auto w-9/10 scrollbar" m="y-3 x-auto">
        <QuestionItem
          v-for="(questionData, index) in questionDataList"
          :key="index"
          :questionData="questionData"
          @onClickHelp="onClickHelp(questionData)"
          @onClickView="onClickView(questionData)"
        />
      </div>
      <button
        class="w-56 rounded-[19px] blueGradient shadow-default"
        m="t-3"
        p="y-2"
        text="[#FFF] 2xl"
        @click="onCloseDialog"
      >
        {{ textData.returnTitle }}
      </button>
    </div>
    <!-- 題目內容 -->
    <div v-else>
      <QuestionContent v-if="currentQuestion" :questionData="currentQuestion" @onCloseContent="isShowContent = false" />
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Emit, ModelSync } from 'vue-property-decorator';
import QuestionItem from '@/components/H5/Dialog/AnswerInformation/QuestionItem.vue';
import HelpMessageDialog from '@/components/H5/Dialog/AnswerInformation/HelpMessageDialog.vue';
import QuestionContent from '@/components/H5/Dialog/AnswerInformation/QuestionContent.vue';
import ImgPath from '@/config/imgPath/imgPath';
import { Message } from '@/helper/class/Common'; // 訊息框
import SuccessDialog from '@/components/H5/Dialog/AnswerInformation/SuccessDialog.vue';
import { GATagActionIdType, GATagCategoryIdType, GATagActionStrType, GATagCategoryStrType } from '@/helper/enum/Common';
import { sendGAEvent } from '@/helper/fnc/common';
import { QuestionData } from '../../../../helper/interface/AnswerGame';

@Component({
  components: {
    QuestionItem,
    HelpMessageDialog,
    QuestionContent,
    SuccessDialog,
  },
})
export default class AnswerInformation extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 開啟求助框 */
  private isShowHelp: boolean = false;

  /** 開啟求助成功提示框 */
  private isShowHelpSuccess: boolean = false;

  /** 顯示題目內容 */
  private isShowContent: boolean = false;

  /** 答題記錄 */
  private questionDataList: QuestionData[] = [];

  /** 當前顯示題目 */
  private currentQuestion: QuestionData | null = null;

  /** 圖片資料 */
  private imgData = {
    /** 答題遊戲看板 */
    heroIcon: ImgPath.fourHeroBaseUrl,
  };

  /** 文字資料 */
  private textData = {
    answerInformationTitle: '答題資訊',
    learningLinkHint:
      '如果不瞭解問題的話，可以回因材網複習或是點選求救，發問後就會有同學或老師在星際論壇上幫你解答喔！',
    openLearningLink: '前往因材網',
    returnTitle: '返回排名頁面',
  };

  onOpen() {
    // 取得答題記錄
    this.questionDataList = this.$$store.getters.answerInformation;
    console.log(this.questionDataList);
  }

  /** 打開求救彈窗
   * @param questionData
   */
  private onClickHelp(questionData: QuestionData): void {
    // 身分防呆
    if (this.$$store.getters.hasSchool === false) {
      Message.warn('目前沒有使用權限喔! 請確認身份是否具備學校資訊');
      return;
    }

    // 設定當前問題
    this.currentQuestion = questionData;

    // 開啟求助框
    this.isShowHelp = true;
  }

  /** 打開題目內容
   * @param questionData
   */
  private onClickView(questionData: QuestionData): void {
    // 設定當前問題
    this.currentQuestion = questionData;

    // 開啟題目框
    this.isShowContent = true;
  }

  /** 轉跳學習鏈結 */
  private async onClickLearningLink(): Promise<void> {
    // 取得賽事科目資訊
    const courseData = this.$$store.getters.courseData;

    // GA 因材網連結答題結算事件
    await sendGAEvent(
      GATagCategoryIdType.AdlLinkAnswerResult,
      GATagActionIdType.AdlLinkAnswerResult,
      `課程-${courseData.courseName}`,
      this.$gtag,
      GATagActionStrType.AdlLinkAnswerResult,
      GATagCategoryStrType.AdlLinkAnswerResult
    );

    // 開啟學習鏈結
    window.open(`${this.$$store.state.ContestModule.learningLink}`);
  }
  /**關掉成功彈窗，關掉答題資訊彈窗 */
  private onGoRankList() {
    this.isShowHelpSuccess = false;
    this.onCloseDialog();
  }

  private onBack() {
    if (this.isShowContent) {
      this.isShowContent = false;
      return;
    }
    this.onCloseDialog();
  }

  /** 關閉答題記錄 */
  @Emit('onCloseDialog')
  private onCloseDialog(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  max-width: 800px;
  padding: 15px 0;
}
::v-deep .el-dialog__body {
  padding: 15px 0px 0px 0px;
}
.scrollbar::-webkit-scrollbar {
  width: 20px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
