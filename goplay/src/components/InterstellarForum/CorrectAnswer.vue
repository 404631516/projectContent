<template>
  <div class="w-6/10 <lg:w-[98%]" m="x-auto">
    <!-- 作答人數 -->
    <div class="w-50 rounded-[20px] relative corner" bg="[#828282]" p="y-2" text="18px [#FFF]">
      {{ textData.currentTitle }}
      <span text="[#2CEAEC]">{{ postInfo.userPostData.commentCount }}</span>
      {{ textData.answerCountTitle }}
    </div>
    <div class="rounded-[10px]" m="t-3" p="3" text="left [#878787]" border="1px solid [#828282]">
      <!-- 最佳答案資訊 -->
      <template v-if="userPostCommentData">
        <div text="18px">
          {{ userPostCommentData.name }}{{ className }}
          <div m="t-2">{{ answerTime }}</div>
        </div>
        <p m="t-1 b-2" text="3xl">{{ contentText }}</p>
        <div class="overflow-auto">
          <audio
            v-if="isAudioLink(userPostCommentData.answerPic)"
            :src="userPostCommentData.answerPic"
            controls
          ></audio>
          <img style="min-width: 800px" v-else :src="userPostCommentData.answerPic" />
        </div>
      </template>
      <!-- 未答對顯示 -->
      <div v-else m="y-10" text="center 4xl">
        {{ textData.noCorrectTitle }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { ForumViewPostInfo, UserPostCommentData, CommentContentData } from '@/helper/interface/InterstellarForum';
import UIHelper from '@/views/H5/Helper/UIHelper';
import FileHelper from '../../views/H5/Helper/FileHelper';
import { toDayjs } from '../../manager/TimeSyncManager';

@Component({})
export default class CorrectAnswer extends Vue {
  /** 留言作答資料 */
  @Prop() private postInfo!: ForumViewPostInfo;

  /** 文字資料 */
  private textData = {
    currentTitle: '當前有',
    answerCountTitle: '人作答',
    noCorrectTitle: '目前沒有正確回答喔！',
  };

  /** 作答資料 */
  private get userPostCommentData(): UserPostCommentData | undefined {
    // 空物件防呆
    if (FileHelper.isEmptyObject(this.postInfo.userPostCommentData)) {
      return undefined;
    }

    return this.postInfo.userPostCommentData as UserPostCommentData;
  }

  /** 作答內容 */
  private get contentText(): string {
    const content = this.userPostCommentData?.content.toString() ?? '';
    return JSON.parse(content)?.textId ?? '';
  }

  /** 答題者班級 */
  private get className(): string {
    if (this.postInfo == null) {
      return '';
    }

    const commentData = this.postInfo.userPostCommentData;
    return UIHelper.toChineseClass(commentData.className);
  }

  /** 答題時間 */
  private get answerTime(): string {
    return toDayjs(this.postInfo.userPostCommentData.createdAt).format('YYYY-MM-DD');
  }

  /** 判斷是否是音樂
   * @param url source
   */
  private isAudioLink(url: string): boolean {
    return url.slice(-3).toLowerCase() === 'mp3';
  }
}
</script>
<style lang="scss" scoped>
.corner::after {
  content: ' ';
  border-width: 10px;
  border-style: solid;
  border-color: #828282 transparent transparent transparent;
  position: absolute;
  bottom: -18px;
  right: 50%;
}
</style>
