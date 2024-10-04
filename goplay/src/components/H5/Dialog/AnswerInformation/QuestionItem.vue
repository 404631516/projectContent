<template>
  <div class="question-item">
    <div class="question-item-wrapper">
      <!-- 標題 -->
      <div class="title">
        <h1>{{ questionIndexTitle }}</h1>
        <!-- 求助按鈕 -->
        <button class="shadow-default" @click="onClickHelp">{{ textData.helpTitle }}</button>
      </div>
      <!-- 觀看按鈕 -->
      <button class="question-button shadow-default" @click="onClickView">
        {{ textData.viewTitle }}
      </button>
      <!-- 答題記錄 -->
      <div class="point-item">
        <div>
          {{ textData.choiceTitle }}
          <span>{{ answerResultTitle }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { QuestionData } from '@/helper/interface/AnswerGame';

@Component({})
export default class QuestionItem extends Vue {
  /** 題目資料 */
  @Prop() public questionData!: QuestionData;

  /** 文字資料 */
  private textData = {
    helpTitle: '求救',
    viewTitle: '觀看題目及選項',
    choiceTitle: '你的選擇',
  };

  /** 題目索引ID */
  private get questionIndexTitle(): string {
    return `Q${this.questionData.questOrder + 1}`;
  }

  /** 答題結果文字 */
  private get answerResultTitle(): string {
    return this.questionData.isCorrect ? '正確' : '錯誤';
  }

  /** 點擊求助 */
  @Emit('onClickHelp')
  private onClickHelp(): void {
    return;
  }

  /** 點擊觀看 */
  @Emit('onClickView')
  private onClickView(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.question-item {
  margin: 10px 0px;
  text-align: left;
  height: 200px;
  width: 98%;
  border-radius: 15px;
  border: 1px solid #d9d6be;
  .question-item-wrapper {
    margin: 10px 15px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      h1 {
        color: #666666;
        font-size: 20px;
      }
      button {
        background: #39ffeb;
        color: #1d6563;
        width: 100px;
        height: 40px;
        border-radius: 20px;
        font-size: 22px;
        font-weight: bold;
        cursor: pointer;
      }
    }
    .question-button {
      height: 50px;
      width: 100%;
      border-radius: 30px;
      color: #613c0a;
      background: #ffde39;
      font-size: 22px;
      font-weight: bold;
      cursor: pointer;
    }
    .point-item {
      width: 100%;
      height: 50px;
      display: flex;
      font-size: 20px;
      align-items: center;
      border-top: 2px solid #b2b2b2;
      span {
        color: #d69f05;
      }
    }
  }
}
</style>
