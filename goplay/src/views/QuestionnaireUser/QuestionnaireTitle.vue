<template>
  <div class="rounded-[10px]" border="1 solid [#67D3D4]" p="x-5.5">
    <div class="flex flex-col items-start" p="b-4">
      <!-- 標題 -->
      <div class="flex items-center">
        <img :src="imgData.dogIcon" class="w-16 aspect-square object-contain" />
        <p text="4xl [#666666]" font="bold">{{ questionnaireData.title }}</p>
      </div>
      <!-- 副標題 -->
      <span text="3xl [#8B8B8B]">{{ questionnaireData.titleSub }}</span>
    </div>
    <!-- 時間和人數 -->
    <div class="flex items-start <sm:(flex-col)" p="y-4" border="t-1px b-1px solid [#67D3D480]" text="2xl">
      <p text="[#666666]" font="bold" m="r-2">{{ textData.questionnaireTime }}</p>
      <p text="[#8B8B8B]">
        {{ `${getTimeFormat(questionnaireData.startAt)} ~ ${getTimeFormat(questionnaireData.endAt)}` }}
      </p>
      <span class="flex" m="l-6 <sm:l-0">
        <p text="[#666666]" font="bold" m="r-2">{{ textData.participantCount }}</p>
        <p text="[#8B8B8B]" font="normal">{{ questionnaireData.filledCount }}</p>
      </span>
    </div>
    <template v-if="isUseCollapse === true">
      <!-- 摺疊區域 -->
      <el-collapse @change="isExpand = !isExpand">
        <el-collapse-item>
          <!-- 標題顯示 -->
          <template slot="title">
            <img :src="imgData.blueArrow" :class="isExpand ? 'after_rotate_arrow' : 'initial_rotate_arrow'" />
            <p class="self-center" text="xl [#67D3D4]">{{ textData.expandToDetail }}</p>
          </template>
          <!-- 內容說明 -->
          <div class="flex flex-col items-start" border="b-1px t-1px solid [#67D3D480]" p="y-4">
            <p text="left 2xl [#8B8B8B]">{{ questionnaireData.content }}</p>
            <template v-if="isReferLinkNotEmpty">
              <a class="underline" text="2xl [#00CCCE]" font="bold" :href="questionnaireData.referLink" target="_blank">
                {{ textData.goToLink }}
              </a>
            </template>
          </div>
        </el-collapse-item>
      </el-collapse>
    </template>
    <template v-else>
      <!-- 內容說明 -->
      <div class="flex flex-col items-start" border="b-1px solid [#67D3D480]" p="y-4">
        <p text="left 2xl [#8B8B8B]">{{ questionnaireData.content }}</p>
        <template v-if="isReferLinkNotEmpty">
          <a class="underline" text="2xl [#00CCCE]" font="bold" :href="questionnaireData.referLink" target="_blank">
            {{ textData.goToLink }}
          </a>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { QuestionnaireData } from '@/helper/interface/Questionnaire';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { toDayjs } from '../../manager/TimeSyncManager';

@Component({
  components: {},
})
export default class QuestionnaireTitle extends Vue {
  /** 問卷資料 */
  @Prop() private questionnaireData!: QuestionnaireData;
  /** 是否使用摺疊 */
  @Prop(Boolean) private isUseCollapse!: boolean;
  /** 是否展開 */
  private isExpand: boolean = false;

  /** 文字資料 */
  private textData = {
    questionnaireTime: '問卷時間',
    participantCount: '參加人數',
    goToLink: '前往連結',
    expandToDetail: '展開看詳細',
  };

  /** 圖片資料 */
  private imgData = {
    dogIcon: imgPath.dogIcon,
    blueArrow: imgPath.blueArrow,
  };

  /** 內容連結是否為空 */
  private get isReferLinkNotEmpty(): boolean {
    return this.questionnaireData.referLink != null && this.questionnaireData.referLink.length > 0;
  }

  /** 轉換時間格式
   *  @param time 時間
   */
  private getTimeFormat(time: string): string {
    return toDayjs(time).format('YYYY.MM.DD');
  }
}
</script>
<style scoped>
.initial_rotate_arrow {
  transition: transform 0.3s;
  transform: rotate(0deg);
}
.after_rotate_arrow {
  transition: transform 0.3s;
  transform: rotate(180deg);
}
::v-deep .el-collapse-item__header {
  justify-content: center;
  border: 0;
}
::v-deep .el-collapse-item__arrow {
  margin: 0;
}
::v-deep .el-icon-arrow-right:before {
  content: '';
}
</style>
