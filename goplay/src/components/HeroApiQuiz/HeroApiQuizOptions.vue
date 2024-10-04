<template>
  <div style="background-color: white; border-radius: 10px">
    <!--題目顯示-->
    <div class="topic-box flex-pos" style="margin-top: 0px">
      <!--顯示題目文字-->
      <div class="topic-text" style="color: #d69f06; font-weight: 500">{{ currentQuestion.question }}</div>
    </div>

    <!-- 答題選項與頭像 -->
    <div class="item-box flex-pos justify-between overflow-hidden">
      <!-- 顯示英雄頭像 -->
      <img :src="heroImg" class="w-64 h-64 -ml-[30px]" />

      <!-- 答題選項 -->
      <div class="item-pos" style="width: fit-content; margin-left: -6vw">
        <template>
          <div
            class="btn-1 answer-item"
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="handleSelect(index + 1)"
          >
            <span :class="`set${index}`"></span>
            <span class="text-black">{{ option }}</span>
          </div>
        </template>
      </div>

      <!-- 顯示NPC頭像 -->
      <img v-if="npcImg" :src="npcImg" class="w-64 h-64 overflow-hidden -mr-[30px]" />
    </div>

    <!--答題選項(下排橫列)-->
    <div class="item-box flex-pos horizonOption-container">
      <div class="item-pos horizonItemPos" style="width: 95%">
        <div
          class="answer-item horizonOption-item"
          style="border-radius: 30px"
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          @click="handleSelect(index + 1)"
        >
          <span :class="`set${index}`"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import { QuestionDetails } from '@/hero-api/dto/quiz.dto';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';

@Component({})
export default class HeroApiQuizOptions extends Vue {
  /** 當前題目 */
  @Prop() private currentQuestion!: QuestionDetails;
  /** 選擇的選項 */
  private selectedOption: number = -1;

  /** 處理答題選項
   * @param selectedOption 選擇的選項
   */
  private handleSelect(selectedOption: number): void {
    // 防連點
    if (this.selectedOption !== -1) {
      return;
    }

    this.onSelect(selectedOption);
  }

  /**
   * 當回答選項後執行
   * @param selectedOption 將選擇的選項回傳給父層
   */
  @Emit('onSelect')
  private onSelect(selectedOption: number): void {
    return;
  }

  /** 換下一題時，滑桿跳回上方 */
  @Watch('currentQuestion')
  private scrollToTop(): void {
    const questionTitle = document.querySelector('.answer-box')! as HTMLDivElement;
    document.querySelector('.answer-box')!.scrollTo({ top: questionTitle.offsetTop, behavior: 'auto' });
  }

  /** 取得英雄圖像 */
  protected get heroImg(): string {
    // 目前上場的英雄
    const heroListData = this.$$store.getters.onlineHero;
    // 防呆
    if (heroListData == null) {
      Helper.assert(ErrorId.OnlineHeroNotFound, 'heroImg: heroListData == null.');
      return '';
    }

    return HeroManager.getHeroImgUrl(heroListData, HeroImgType.Half);
  }

  /** 取得NPC圖像 */
  protected get npcImg(): string {
    return this.$$store.getters.currentTalkingNpc.image;
  }
}
</script>

<style scoped lang="scss">
.horizonOption-container {
  background-color: #55b3fc;
  padding: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.horizonItemPos {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.answer-item {
  cursor: pointer;
  border-radius: 10px;
  &:hover {
    transform: scale(1.02);
  }
  &:active {
    cursor: pointer;
    background-color: #3db5ce;
    color: #fff;
  }
}

.horizonOption-item {
  flex: 1; // 使每個成員的寬度佔滿可用空間
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  position: relative;
  background-color: #fff;
  > span {
    &.set0,
    &.set1,
    &.set2,
    &.set3 {
      &::after {
        position: relative;
        font-size: 28px;
        font-weight: bold;
        content: 'A';
        color: #ffbc42;
      }
    }
    &.set1 {
      &::after {
        content: 'B';
        color: #9831a2;
      }
    }
    &.set2 {
      &::after {
        content: 'C';
        color: #63a518;
      }
    }
    &.set3 {
      &::after {
        content: 'D';
        color: #eec029;
      }
    }
    color: #000;
  }
}
</style>
