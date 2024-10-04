<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :show-close="false"
    append-to-body
    top="30vh"
    @open="onOpen"
    destroy-on-close
  >
    <ConfirmDialog
      v-model="isShowConfirm"
      :title="textData.confirmTitle"
      :confirmInfo="textData.confirmContent"
      appendTOBody
      @onClickConfirm="onSendForumHelp"
      @onClickCancel="isShowConfirm = false"
    />
    <!-- 標題 -->
    <div
      slot="title"
      class="w-[95%] flex items-center justify-center relative rounded-[30px]"
      m="x-auto"
      p="y-2"
      text="[#FFF] 32px shadow-lightDefault"
      bg="[#EEA73D]"
    >
      {{ textData.helpTitle }}
      <i
        class="el-icon-close absolute right-4 cursor-pointer"
        font="before:bold"
        text="shadow-none"
        @click="onCloseHelp"
      ></i>
    </div>
    <div class="flex flex-col items-center">
      <div class="flex items-center rounded-[15px] w-9/10" p="y-2 x-3" m="x-auto" border="1px solid [#D1CEB8]">
        <img class="w-22 h-24 object-contain transform rotate-y-180 <sm:hidden" :src="imgData.heroIcon" />
        <span m="l-1" text="xl [#A5A5A5] left">{{ textData.helpHint }}</span>
      </div>
      <!-- 求救訊息 -->
      <div class="content-select w-9/10" m="x-auto y-3">
        <div class="select-item">
          <el-select :popper-append-to-body="false" v-model="helpMessage">
            <el-option
              v-for="(message, messageIndex) in helpMessageOptions"
              :key="messageIndex"
              :value="message"
              :label="`${message}`"
            ></el-option>
          </el-select>
        </div>
      </div>
      <!-- 確認使用求救按鈕 -->
      <button
        @click="onClickSendHelp"
        class="w-64 yellowGradient relative rounded-[30px]"
        p="y-2"
        m="x-auto t-5"
        text="[#FFF] 2xl"
        font="bold"
      >
        {{ textData.sendHelpTitle }}
        <div class="w-40 absolute -top-6 right-1 rounded-[30px]" bg="[#00000099]" p="y-1" text="base" font="medium">
          {{ textData.helpCountTitle }}
          <span text="[#2CEAEC]">{{ helpCount }}</span>
        </div>
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Emit, Prop, ModelSync, Vue } from 'vue-property-decorator';
import { adlForumPostQuest, adlForumUserRecord } from '@/api/InterstellarForum'; // 發布貼文
import { Message } from '@/helper/class/Common'; // 訊息框
import { ResponseState } from '@/helper/enum/Common';
import ImgPath from '@/config/imgPath/imgPath';
import ConfirmDialog from '@/components/Public/ConfirmDialog.vue';
import { QuestionData } from '../../../../helper/interface/AnswerGame';

@Component({
  components: {
    ConfirmDialog,
  },
})
export default class HelpMessageDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 題目資料 */
  @Prop() public questionData!: QuestionData;

  /** 顯示確認介面開關 */
  private isShowConfirm: boolean = false;

  /** 求助訊息選項 */
  private readonly helpMessageOptions: string[] = [
    '不確定答案為什麼會是這樣？',
    '請好心人幫忙！',
    '這是什麼？這麼模擬兩可，像極了愛情！',
    '奇怪，這是在哪一個單元的題目呀？',
    '我覺得不行，請勇者出馬！',
    '同情我的話，就給我答案吧！',
    '想了一下，還是答不出來……',
    '救命！我怎麼看不懂……',
    '真不甘心，就錯這一題而已……',
    '呼叫支援！請幫幫我～',
  ];

  /** 一天最多可以求助幾次 */
  private readonly helpMax: number = 3;

  /** 剩餘求助次數 */
  private helpCount: number = 0;

  /** 求助訊息 */
  private helpMessage: string = this.helpMessageOptions[0];

  /** 圖片資料 */
  private imgData = {
    /** 答題遊戲看板 */
    heroIcon: ImgPath.fourHeroBaseUrl,
  };

  /** 文字資料 */
  private textData = {
    helpTitle: '求救',
    helpHint: '來發個求救吧，要選擇求救訊息！',
    sendHelpTitle: '發出求救訊號',
    helpCountTitle: '今日剩餘求救次數',
    confirmTitle: '提醒',
    confirmContent: `確認要發出嗎？
    將減少一次今日可求救次數。`,
  };

  onOpen() {
    this.getAdlForumUserRecord();
  }

  /** 取得當天求助紀錄 */
  private async getAdlForumUserRecord(): Promise<void> {
    try {
      // API 取得當天求助紀錄
      const response: any = await adlForumUserRecord.fetch({});
      if (response.result === ResponseState.Success) {
        this.helpCount = this.helpMax - response.askCount;
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 點擊發出求助 */
  private onClickSendHelp(): void {
    // 求助上限防呆
    if (this.helpCount <= 0) {
      Message.info('超過今日上限!!');
      return;
    }

    // 開啟確認發求助
    this.isShowConfirm = true;
  }

  /** 發出求助 */
  private async onSendForumHelp(): Promise<void> {
    // 關閉確認介面
    this.isShowConfirm = false;

    // 取得題目資訊
    const quizData = this.questionData.quizData;

    // 取得科目資訊
    const courseData = this.$$store.getters.courseData;

    // 組成求助封包
    const postData = {
      quizSource: quizData.quizSource,
      title: courseData.courseName,
      content: this.helpMessage,
      qId: quizData.qid,
      subjectNum: courseData.subject,
      contestId: this.$$store.getters.contestId,
      gradeNum: courseData.grade,
    };

    try {
      // API 發求助
      const response: any = await adlForumPostQuest.post(postData);
      if (response.result === ResponseState.Success) {
        this.onCloseHelp();
        this.onHelpSuccess();
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 開啟求助成功 */
  @Emit('onHelpSuccess')
  private onHelpSuccess(): void {
    return;
  }

  /** 關閉求助 */
  @Emit('onCloseHelp')
  private onCloseHelp(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  max-width: 800px;
  width: 100%;
  padding: 15px 0;
  border-radius: 30px;
}
::v-deep .el-dialog__header {
  padding: 0px;
}
::v-deep .el-input__inner {
  height: 50px;
}
::v-deep .el-select__caret.el-input__icon.el-icon-arrow-up::before {
  content: '\e78f';
}
</style>
