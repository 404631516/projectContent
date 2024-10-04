<template>
  <div>
    <!-- 最新消息彈窗 -->
    <BaseDialog v-model="isNewsDialog" v-if="seletTopicId">
      <div class="w-3/6 <sm:w-full pointer-events-auto relative rounded-xl" m="x-auto t-[15vh]" p="2" bg="[#FFF]">
        <i
          @click="isNewsDialog = false"
          class="el-icon-close cursor-pointer absolute right-3 <sm:right-1 top-3 <sm:top-4"
          font="before:black"
          text="3xl [#BFBFBF]"
        ></i>
        <h4 class="font-bold <sm:w-9/10" m="<sm:x-auto" p="y-2" text="3xl [#FDC221]">
          {{ selectNew.title }}
        </h4>
        <div class="w-5/6" m="x-auto" border="b-2 solid [#A5A5A5]" text="2xl [#A5A5A5]">
          {{ formatDate(selectNew.editedAt, 'YYYY/MM/DD') }}
        </div>
        <div class="scrollbar w-4/5 h-80 whitespace-pre-line overflow-auto" m="x-auto y-5" text="left xl">
          {{ selectNew.detail }}
        </div>
        <a class="block" target="_blank" :href="selectNew.url">
          <div
            v-if="selectNew.url !== ''"
            class="w-5/6 rounded-xl shadow-default flex cursor-pointer pointer-events-auto"
            border="1 solid [#BEBEBE]"
            text="left"
            m="x-auto y-3"
            p="x-3 y-3"
          >
            <span class="flex-shrink-0" m="r-2" text="[#666666] 2xl">{{ textData.golink }}</span>
            <span class="truncate" m="x-2" text="[#FDC221] 2xl">{{ selectNew.url }}</span>
            <img :src="imgData.rightDoubleArrow" />
          </div>
        </a>
      </div>
    </BaseDialog>
    <!-- 首頁最新消息 -->
    <h4 class="flex items-center justify-center font-bold" p="b-3" text="[#FDC221] 3xl" border="b-2 [#D2D2D2] solid">
      <img v-if="titleImg" :src="titleImg" class="w-25 aspect-square object-contain" />
      {{ textData.title }}
    </h4>
    <div class="w-11/12 h-85 overflow-auto scrollbar" m="y-5 x-auto">
      <div
        @click="onDialog(item.topicId)"
        v-for="(item, index) in newsList"
        :key="index"
        class="cursor-pointer rounded-[10px] flex justify-between"
        p="x-5 y-5"
        m="y-2 r-5px"
        border="1 solid [#CFCFCF]"
      >
        <div class="w-5/6 flex <sm:w-full">
          <span class="flex-shrink-0" m="r-1" text="[#878787] 2xl <sm:xl">{{ formatDate(item.editedAt) }}</span>
          <span class="flex-shrink-0 <sm:hidden <sm:xl" m="x-5" font="bold" text="[#49ADEF] 2xl">{{
            textData.systemPost
          }}</span>
          <span class="truncate" text="[#A5A5A5] 2xl">{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import { NewsData } from '@/helper/interface/Index';
import BaseDialog from '@/components/Public/BaseDialog.vue';
import { GATagActionIdType, GATagCategoryIdType, GATagActionStrType, GATagCategoryStrType } from '@/helper/enum/Common';
import { sendGAEvent } from '@/helper/fnc/common';
import { toDayjs } from '../../manager/TimeSyncManager';

@Component({
  components: {
    BaseDialog,
  },
})
export default class NewsInfo extends Vue {
  /** 最新消息列表 */
  @Prop() private newsList!: NewsData[];
  @Prop(String) private titleImg!: string;

  /** 字資料 */
  private textData = {
    title: '最新消息',
    systemPost: '系統公告',
    golink: '前往相關連結',
  };

  /** 圖資料 */
  private imgData = {
    rightDoubleArrow: ImgPath.rightDoubleArrow,
  };
  /** 選到的Id */
  private seletTopicId: number = 0;
  /** 是否開啟 消息彈窗 */
  private isNewsDialog: boolean = false;
  /** 選到最新消息的物件 */
  private get selectNew(): NewsData | undefined {
    return this.newsList.find((newsItem) => newsItem.topicId === this.seletTopicId);
  }

  /** 整理時間格式
   * @param date
   * @param format
   */
  private formatDate(date: string, format: string = 'YYYY-MM-DD'): string {
    return toDayjs(date).format(format);
  }

  /** 開啟彈窗
   * @param topicId
   */
  private async onDialog(topicId: number): Promise<void> {
    this.isNewsDialog = true;
    this.seletTopicId = topicId;

    // GA 公告事件
    await sendGAEvent(
      GATagCategoryIdType.BulletinWatch,
      GATagActionIdType.BulletinWatch,
      `${GATagCategoryStrType.BulletinWatch}-${topicId}`,
      this.$gtag,
      GATagActionStrType.BulletinWatch,
      GATagCategoryStrType.BulletinWatch
    );
  }
}
</script>

<style lang="scss" scoped>
.scrollbar::-webkit-scrollbar {
  width: 7px;
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
