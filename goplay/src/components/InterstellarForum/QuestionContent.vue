<template>
  <div class="w-6/10 <lg:w-[98%] rounded-[10px]" m="x-auto" p="3" border="1px solid #828282">
    <!-- 求助標題 -->
    <div class="flex justify-between">
      <!-- 求助者資訊 -->
      <div text="left [#878787] 18px">
        <!-- 求助者名稱 -->
        {{ postInfo.userPostData.name }}
        {{ className }}
        <!-- 求助時間 -->
        <div m="t-2">{{ createdTime }}</div>
      </div>
      <!-- 刪除按鈕 -->
      <button
        v-if="canRemove"
        @click="onClickRemovePost"
        class="rounded-[20px] h-8 shadow-default"
        p="x-4"
        border="2 solid [#FFF]"
        bg="[#FF5875]"
        text="[#FFF] [18px]"
      >
        <i class="el-icon-delete-solid"></i>
        {{ textData.deleteTitle }}
      </button>
    </div>
    <!-- 求助內容 -->
    <div m="t-3" text="left [#878787]">
      <!-- 求助標題 -->
      {{ textData.helpTitle }}
      <!-- 題目內容 -->
      <h3 m="t-1 b-2" text="3xl">{{ postInfo.userPostData.content }}</h3>
      <!-- 教學網站按鈕 -->
      <a @click="onClickTeaching" class="underline" text="[#00CCCE] xl" target="_blank">{{
        textData.toTeachingTitle
      }}</a>
    </div>
    <!-- 題目 -->
    <template v-if="questionId > 0">
      <!-- 題目主題 -->
      <div class="overflow-auto" m="t-2">
        <!-- 題目內容 -->
        <template v-if="questionData.questionMain">
          <audio v-if="isAudioLink(questionData.questionMain)" controls :src="questionData.questionMain"></audio>
          <img style="min-width: 800px" v-else :src="questionData.questionMain" />
        </template>
        <!-- 題目取得失敗 -->
        <p v-else text="3xl center">{{ textData.invalidQuestionTitle }}</p>
        <!-- 題目附題 -->
        <template v-if="questionData.questionSub">
          <audio v-if="isAudioLink(questionData.questionSub)" controls :src="questionData.questionSub"></audio>
          <img style="min-width: 800px" v-else :src="questionData.questionSub" />
        </template>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import {
  GATagActionIdType,
  GATagCategoryIdType,
  GATagActionStrType,
  GATagCategoryStrType,
  ResponseState,
} from '@/helper/enum/Common';
import { sendGAEvent, handleAPIError } from '@/helper/fnc/common';
import { adlForumGetQuestion } from '@/api/InterstellarForum';
import { ForumQuestion, ForumViewPostInfo, UserPostData } from '../../helper/interface/InterstellarForum';
import { Load, Message } from '@/helper/class/Common';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { toDayjs } from '../../manager/TimeSyncManager';

@Component({})
export default class QuestionContent extends Vue {
  /** 求助資料 */
  @Prop() private postInfo!: ForumViewPostInfo;
  /** 是否為學校分頁 */
  @Prop(Boolean) private canRemove!: boolean;

  /** 題目資料 */
  private questionData!: ForumQuestion;

  /** 題目ID */
  private questionId: number = -1;

  /** 文字資料 */
  private textData = {
    deleteTitle: '刪除',
    helpTitle: '求救訊息',
    toTeachingTitle: '前往因材網知識點',
    invalidQuestionTitle: '目前無法取得因材網資源',
  };

  /** 求助者班級 */
  private get className(): string {
    if (this.postInfo == null) {
      return '';
    }

    const postData = this.postInfo.userPostData;
    return UIHelper.toChineseClass(postData.className);
  }

  /** 求助時間 */
  private get createdTime(): string {
    return toDayjs(this.postInfo.userPostData.createdAt).format('YYYY-MM-DD');
  }

  /** 檢查附連接 */
  private isAudioLink(linkUrl: string): boolean {
    return linkUrl.slice(-3).toLowerCase() === 'mp3';
  }

  created() {
    // 取得論壇求助題目
    this.getAdlForumGetQuestion();
  }

  /** 取得論壇求助題目 */
  private async getAdlForumGetQuestion(): Promise<void> {
    // 組成取得因材網題目封包
    const data = {
      postId: this.postInfo.userPostData.postId,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 取得因材網題目
      const response: any = await adlForumGetQuestion.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 儲存問題
      this.questionData = response.qInfo as ForumQuestion;
      this.questionId = this.postInfo.userPostData.postId;

      // 關閉讀取
      Load.use(false);
    } catch (e) {
      Message.error(e);
      // 關閉讀取
      Load.use(false);
    }
  }

  /** 跳轉因材網 */
  private async onClickTeaching(): Promise<void> {
    // GA 因材網連結星際論壇事件
    await sendGAEvent(
      GATagCategoryIdType.AdlLinkForum,
      GATagActionIdType.AdlLinkForum,
      `課程-${this.postInfo.userPostData.title}`,
      this.$gtag,
      GATagActionStrType.AdlLinkForum,
      GATagCategoryStrType.AdlLinkForum
    );

    // 開啟教材
    window.open(`${this.questionData.learningLink}`);
  }

  /** 移除求助 */
  @Emit('onClickRemovePost')
  private onClickRemovePost(): void {
    return;
  }
}
</script>
