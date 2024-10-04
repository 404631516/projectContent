<template>
  <div>
    <ConfirmDialog
      v-model="isShowDeleteDialog"
      :title="textData.confirmTitle"
      :confirmInfo="textData.deleteCheckTitle"
      @onClickCancel="isShowDeleteDialog = false"
      @onClickConfirm="onRemovePost"
    />
    <!-- 求助內容 -->
    <!-- 標題區 -->
    <div class="w-6/10 <lg:w-[98%] flex items-center" m="x-auto" p="y-5">
      <router-link
        to="/MyQuestion"
        class="shadow-default h-[58px] flex-pos rounded-[15px]"
        p="y-4 x-6"
        m="r-2"
        text="26px [#FFF]"
        bg="[#FF5875]"
        border="2px solid [#FFF]"
        >{{ textData.returnTitle }}</router-link
      >
      <h1 font="bold" text="6xl <sm:5xl [#FDC221]">
        {{ textData.myQuestionTitle }}
      </h1>
    </div>
    <!-- 問題區 -->
    <div p="y-5" border="t-6 solid [#fdc221]">
      <QuestionContent
        v-if="postId > 0"
        :postInfo="postInfo"
        :canRemove="true"
        @onClickRemovePost="isShowDeleteDialog = true"
      />
    </div>
    <!-- 留言答覆區 -->
    <CorrectAnswer v-if="postId > 0" :postInfo="postInfo" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import QuestionContent from '@/components/InterstellarForum/QuestionContent.vue';
import CorrectAnswer from '@/components/InterstellarForum/CorrectAnswer.vue';
import { Message, Load } from '@/helper/class/Common';
import { ResponseState } from '@/helper/enum/Common';
import {
  adlForumViewPostInfo,
  adlForumPostQuest,
} from '@/api/InterstellarForum'; // 取的星際論壇資料
import { ForumViewPostInfo } from '@/helper/interface/InterstellarForum';
import { handleAPIError } from '@/helper/fnc/common';
import ConfirmDialog from '@/components/Public/ConfirmDialog.vue';

@Component({
  components: {
    QuestionContent,
    CorrectAnswer,
    ConfirmDialog,
  },
})
export default class MyQuestionContent extends Vue {
  /** 求助資料 */
  private postInfo!: ForumViewPostInfo;

  /** 顯示刪除求助 */
  private isShowDeleteDialog: boolean = false;

  /** 求助ID */
  private postId: number = -1;

  /** 文字資料 */
  private textData = {
    confirmTitle: '再次確認',
    deleteCheckTitle: '確定刪除嗎?',
    yesTitle: '確定',
    cancelTitle: '取消',
    returnTitle: '返回',
    myQuestionTitle: '我的提問',
  };

  mounted() {
    this.getAdlForumViewPostInfo();
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

  /** 點擊刪除求助 */
  private async onRemovePost(): Promise<void> {
    // 組成刪除求助封包
    const data = {
      postId: this.postInfo.userPostData.postId,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 刪除求助
      const response: any = await adlForumPostQuest.remove(data);
      if (response.result === ResponseState.Success) {
        this.$router.go(-1);
      }

      // 關閉讀取
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取
      Load.use(false);
    }
  }
}
</script>
