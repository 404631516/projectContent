<template>
  <div>
    <!--題目顯示-->
    <div class="topic-box flex-pos enableets">
      <!--如果題目有圖片, 顯示圖片-->
      <div class="img-box" v-if="questionImage">
        <img :src="questionImage" alt />
      </div>
      <!--顯示題目文字-->
      <div class="topic-text">{{ questionText }}</div>
    </div>
    <!--答題選項-->
    <div class="item-box flex-pos">
      <div class="item-pos">
        <template v-if="answerInfo.questOrder != -1">
          <div
            class="btn-1 scale"
            v-for="(item2, index2) in currentQuestion.options"
            :key="index2"
            :class="[answerInfo.answerIndex - 1 === index2 ? 'active' : '']"
            @click="handleSelect(index2 + 1)"
          >
            <span :class="`set${index2}`"></span>
            {{ item2.val }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import { AnswerInfo, QuestionFormat } from '@/helper/interface/AnswerGame';

@Component({})
export default class Enableets extends Vue {
  /** 答題資訊 */
  @Prop() private answerInfo!: AnswerInfo;
  /** 當前題目 */
  @Prop() private currentQuestion!: QuestionFormat;

  /** 答題題目(文字) */
  private get questionText(): string {
    return this.currentQuestion.topic;
  }

  /** 答題鏈結 */
  private get questionImage(): string {
    return this.currentQuestion.url;
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
    const questionTitle = document.querySelector('.answer-box')! as HTMLDivElement;
    document.querySelector('.answer-box')!.scrollTo({ top: questionTitle.offsetTop, behavior: 'auto' });
  }
}
</script>
<style lang="scss" scoped>
.topic-box {
  &.enableets {
    .img-box {
      img {
        width: 20vw;
        height: auto;
      }
    }
  }
}
</style>
