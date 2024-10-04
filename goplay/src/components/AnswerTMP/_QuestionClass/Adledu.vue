<template>
  <div class="fixed top-[130px] w-full h-[calc(100vh-130px)] <2xl:h-[calc(100vh-230px)]" bg="[#FFF]">
    <div class="overflow-y-auto adleduQuestionGroup" :class="isShowBottomOptions ? 'h-[calc(100vh-248px)]' : 'h-full'">
      <!-- 題目 -->
      <div class="overflow-auto">
        <img style="min-width: 800px" m="x-auto" :src="questionImage" />
        <audio v-if="topicAudio" m="x-auto" :src="`${topicAudio}`" controls />
        <img v-else style="min-width: 800px" m="x-auto" :src="currentQuestion.url" />
      </div>
      <!-- 選擇的選項 -->
      <div v-for="(item2, index2) in currentQuestion.options" :key="index2" class="overflow-auto" m="y-3">
        <div
          class="flex items-center justify-center <lg:justify-start transition cursor-pointer"
          m="x-auto"
          p="y-3"
          :class="option[index2].color"
          font="bold"
          text="3xl hover:4xl"
          @click="handleSelect(index2 + 1)"
        >
          {{ option[index2].option }}
          <audio v-if="isAudio(item2.val)" :src="`${item2.val}`" controls />
          <img v-else :src="item2.val" style="min-width: 770px" />
        </div>
      </div>
    </div>
    <!-- 按鈕區 -->
    <div
      class="grid grid-cols-4 gap-x-5 <sm:gap-x-2 fixed bottom-0 w-full"
      :class="isShowBottomOptions ? 'py-5' : 'py-0'"
      p="x-[10%] <sm:x-2"
      bg="[#00000059]"
      m="x-auto"
    >
      <button
        class="absolute -top-16 right-48.5 rounded <sm:right-0"
        border="1 solid [#c6e2ff]"
        p="x-3 y-3"
        @click="isShowBottomOptions = !isShowBottomOptions"
      >
        {{ bottomName }}
      </button>
      <template v-if="answerInfo.questOrder !== -1 && isShowBottomOptions">
        <button
          v-for="(optionData, index) in option"
          :key="index"
          class="rounded-[30px] transition hover:(transform scale-110)"
          border="3px solid [#000000CC]"
          bg="[#FFF]"
          font="bold"
          text="5xl"
          p="y-3"
          :class="optionData.color"
          @click="handleSelect(index + 1)"
        >
          {{ optionData.option }}
        </button>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator';
import { AnswerInfo, QuestionFormat } from '@/helper/interface/AnswerGame';
/**選項 css 和名稱 */
interface Option {
  /**選項 */
  option: 'A' | 'B' | 'C' | 'D';
  /** 文字顏色 */
  color: 'text-[#FF8C42]' | 'text-[#983EA2]' | 'text-[#63A5E8]' | 'text-[#EEC029]';
}
@Component({})
export default class Adledu extends Vue {
  /** 答題資訊 */
  @Prop() private answerInfo!: AnswerInfo;
  /** 當前題目 */
  @Prop() private currentQuestion!: QuestionFormat;
  /**選項 css 和名稱 */
  private option: Option[] = [
    { option: 'A', color: 'text-[#FF8C42]' },
    { option: 'B', color: 'text-[#983EA2]' },
    { option: 'C', color: 'text-[#63A5E8]' },
    { option: 'D', color: 'text-[#EEC029]' },
  ];
  /**文字資料 */
  private textData = {
    openOption: '開啟下方快捷選項',
    closeOption: '關閉下方快捷選項',
  };

  /** 是否顯示下方選項按鈕 */
  private isShowBottomOptions: boolean = true;

  /** 題目音訊檔(另判斷如果只有音訊無圖片混和) */
  private get topicAudio(): string {
    // 檢查題目是否為音效檔
    if (this.isAudio(this.currentQuestion.topic)) {
      return this.currentQuestion.topic;
    }

    // 檢查題目鏈結是否為音效檔
    if (this.isAudio(this.currentQuestion.url)) {
      return this.currentQuestion.url;
    }

    // 沒有音效
    return '';
  }

  /** 答題題目(圖片) */
  private get questionImage(): string {
    // 檢查題目是否不是音效檔
    if (this.isAudio(this.currentQuestion.topic) === false) {
      return this.currentQuestion.topic;
    }

    // 檢查題目鏈結是否不是為音效檔
    return this.questionSubImage;
  }

  /** 答題副題目(圖片) */
  private get questionSubImage(): string {
    // 檢查題目鏈結是否不是為音效檔
    if (this.isAudio(this.currentQuestion.url) === false) {
      return this.currentQuestion.url;
    }

    // 沒有圖片
    return '';
  }

  /** 檢查是否為音效鏈結
   * @param url
   */
  private isAudio(url: string): boolean {
    return url.toLowerCase().indexOf('.mp3') > -1;
  }

  /** 顯示開啟下方按鈕名稱 */
  private get bottomName(): string {
    return this.isShowBottomOptions ? '關閉下方快捷選項' : '開啟下方快捷選項';
  }

  /** 處理答題選項
   * @param index 選擇的選項
   */
  private handleSelect(index: number): void {
    // 防連點
    if (this.answerInfo.answerIndex !== -1) {
      return;
    }

    this.answerInfo.answerIndex = index;
    this.onNext();
  }

  /** 下一題 */
  @Emit('onNext')
  private onNext(): void {
    return;
  }

  /** 滑桿跳回上方 */
  @Watch('currentQuestion')
  private scrollToTop(): void {
    const questionTitle = document.querySelector('.adleduQuestionGroup')! as HTMLDivElement;
    document.querySelector('.adleduQuestionGroup')!.scrollTo({ top: questionTitle.offsetTop, behavior: 'auto' });
  }
}
</script>
