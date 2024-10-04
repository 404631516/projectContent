<template>
  <div class="question-content">
    <!-- 題目標題 -->
    <div class="question-content-title flex-pos left">
      {{ questionIndexTitle }}
    </div>
    <!-- 題目內容 -->
    <div class="question-img-wrapper">
      <div class="question">
        <!-- 主要題目 -->
        <!-- 圖片題 -->
        <img v-if="isAudio(quizData.questionMain) === false" :src="quizData.questionMain" :class="{ isAudio: false }" />
        <!-- 音訊題 -->
        <audio controls v-else :src="quizData.questionMain"></audio>
        <!-- 副題 -->
        <template v-if="quizData.questionSub !== ''">
          <!-- 音訊題 -->
          <audio v-if="isAudio(quizData.questionSub)" controls :src="quizData.questionSub"></audio>
          <!-- 圖片題 -->
          <img v-else class="sub-img" :src="quizData.questionSub" />
        </template>
      </div>
      <!-- 答案選項 -->
      <div class="answer" v-if="isAudioOptions === false">
        <img v-for="(option, index) in answerOptions" :key="index" :src="option" />
      </div>
      <div v-else class="answer-audio">
        <audio controls v-for="(option, index) in answerOptions" :key="index" :src="option"></audio>
      </div>
    </div>
    <!-- 下方操作介面 -->
    <div class="question-footer flex-pos">
      <button @click="onCloseContent">{{ textData.confirmTitle }}</button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { QuestionData, QuizData } from '../../../../helper/interface/AnswerGame';

@Component({})
export default class QuestionContent extends Vue {
  /** 題目資料 */
  @Prop() public questionData!: QuestionData;

  /** 文字資料 */
  private textData = {
    confirmTitle: '確定',
  };

  /** 取得題目詳細資料 */
  private get quizData(): QuizData {
    return this.questionData.quizData;
  }

  /** 題目索引ID */
  private get questionIndexTitle(): string {
    return `Q${this.questionData.questOrder + 1}`;
  }

  /** 取得題目選項 */
  private get answerOptions(): string[] {
    return [
      this.quizData.options.option1,
      this.quizData.options.option2,
      this.quizData.options.option3,
      this.quizData.options.option4,
    ];
  }

  /** 選項是否是語音 */
  private get isAudioOptions(): boolean {
    return this.isAudio(this.answerOptions[0]);
  }

  /** 檢查是否為音效鏈結
   * @param url
   */
  private isAudio(url: string): boolean {
    return url.toLowerCase().indexOf('.mp3') > -1;
  }

  /** 關閉題目介面 */
  @Emit('onCloseContent')
  private onCloseContent(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.question-content {
  width: 800px;
  display: flex;
  justify-content: space-evenly;
  flex-direction: column;
  align-items: center;
  @media (max-width: 435px) {
    width: 100%;
  }
  .question-content-title {
    height: 40px;
    color: #666666;
    text-align: left;
    font-size: 20px;
    width: 95%;
  }
  .question-img-wrapper {
    width: 95%;
    height: 600px;
    background: #fff;
    img {
      width: 100%;
      object-fit: contain;
      display: block;
      height: 100%;
    }
    .question {
      height: 40%;
      .isAudio {
        height: 75%;
      }
      audio {
        height: 25%;
      }
      .sub-img {
        height: 25%;
      }
    }
    .answer {
      height: 60%;
      img {
        height: 25%;
      }
    }
    .answer-audio {
      height: 60%;
      audio {
        display: block;
        height: 25%;
      }
    }
  }
  .question-footer {
    padding: 10px 0px;
    button {
      width: 200px;
      height: 40px;
      border-radius: 20px;
      background: linear-gradient(to bottom, #ffd943, #ff9d5b);
      color: #fff;
      font-size: 24px;
    }
  }
}
</style>
