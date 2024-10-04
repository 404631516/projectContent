<template>
  <div>
    <!-- 挑戰答題確認 -->
    <ConfirmDialog
      v-model="isShowChallengeConfirm"
      :title="textData.confirmTitle"
      :confirmInfo="textData.answerCheckTitle"
      @onClickCancel="isShowChallengeConfirm = false"
      @onClickConfirm="onChallengeProblem"
    />
    <!-- 星際論壇求助介面 -->
    <!-- 標題區 -->
    <h1 class="w-6/10 <lg:w-[98%]" m="x-auto" p="y-5" font="bold" text="left 6xl <sm:5xl [#FDC221]">
      {{ textData.schoolQuestionTitle }}
    </h1>
    <!-- 問題區 -->
    <div p="y-5" border="t-6 solid [#fdc221]">
      <QuestionContent v-if="postId > 0" :postInfo="postInfo" :canRemove="false" />
    </div>
    <!-- 點擊挑戰 -->
    <button
      class="flex flex-col items-center rounded-[30px] shadow-default w-6/10 <lg:w-[98%]"
      m="t-3 x-auto"
      p="y-3 x-5"
      border="2 solid [#FFF]"
      text="[#FFF] [26px]"
      bg="[#18CB18]"
      @click="onClickChallenge"
    >
      {{ textData.challengeTitle }}
      <span class="w-full rounded-[30px]" m="t-1" p="y-1" text="[18px]" bg="[#00000099]">
        {{ textData.challengeCountTitle }}
        <span text="[#2CEAEC]">{{ answerCount }}</span>
      </span>
    </button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import QuestionContent from '@/components/InterstellarForum/QuestionContent.vue';
import { Message, Load } from '@/helper/class/Common'; // 訊息框
import { ResponseState } from '@/helper/enum/Common';
import { adlForumViewPostInfo } from '@/api/InterstellarForum'; // 取的星際論壇資料
import { ForumViewPostInfo } from '@/helper/interface/InterstellarForum';
import { handleAPIError } from '@/helper/fnc/common';
import ConfirmDialog from '@/components/Public/ConfirmDialog.vue';

@Component({
  components: {
    QuestionContent,
    ConfirmDialog,
  },
})
export default class SchoolQuestionContent extends Vue {
  /** 求助資料 */
  private postInfo!: ForumViewPostInfo;

  /** 顯示確認回答 */
  private isShowChallengeConfirm: boolean = false;

  /** 求助ID */
  private postId: number = -1;

  /** 今日挑戰次數 */
  private answerCount: number = 0;

  /** 文字資料 */
  private textData = {
    confirmTitle: '再次確認',
    answerCheckTitle: '確定要使用次數進行回答?',
    yesTitle: '確定',
    cancelTitle: '取消',
    returnTitle: '返回',
    schoolQuestionTitle: '發問題目',
    challengeTitle: '我要回答',
    challengeCountTitle: '今日剩餘做答次數',
  };

  async mounted() {
    await this.getAdlForumViewPostInfo();
    this.answerCount = await this.$$store.dispatch('getAdlForumUserRecord');
  }

  /** 取得求救資訊 */
  private async getAdlForumViewPostInfo(): Promise<void> {
    // 組成取得求救資訊封包
    const data = {
      postId: this.$route.params.id,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 取得求助資訊
      const response: any = await adlForumViewPostInfo.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 儲存求助資訊
      this.postInfo = response as ForumViewPostInfo;

      // 儲存求助ID
      this.postId = this.postInfo.userPostData.postId;

      // 關閉讀取
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取
      Load.use(false);
    }
  }

  /** 點擊挑戰 */
  private onClickChallenge(): void {
    // 挑戰自己的求助問題防呆
    if (this.$$store.getters.userUid === this.postInfo.userPostData.uid) {
      Message.info('您無法回覆自己發問的問題唷！');
      return;
    }

    // 每日挑戰次數防呆
    if (this.answerCount <= 0) {
      Message.info('超過今日回答次數!');
      return;
    }

    // 顯示確認挑戰
    this.isShowChallengeConfirm = true;
  }

  /** 轉跳挑戰求助答題 */
  private onChallengeProblem(): void {
    this.$router.push({
      name: 'ChallengeProblem',
      params: { id: `${this.postInfo.userPostData.postId}` },
    });
  }
}
</script>
