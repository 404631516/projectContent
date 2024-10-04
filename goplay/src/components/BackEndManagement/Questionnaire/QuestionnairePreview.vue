<template>
  <div>
    <!-- 預覽 -->
    <div v-if="isShowQuestionnaireInfo" class="shadow-default" bg="[#FFFFFF]" m="x-56 <xl:x-10 b-114px" p="t-4 x-8">
      <!-- 預覽標籤 -->
      <div
        class="from-transparent via-[#0FCEEC] to-transparent text-shadow"
        bg="gradient-to-r"
        m="x-75 <xl:x-30"
        p="y-10px"
        text="44px [#FFF]"
      >
        {{ textData.previewState }}
      </div>
      <!-- 預覽內容 -->
      <QuestionnaireInfoComponent
        class="min-h-[calc(100vh-254px)]"
        :questionnaireData="questionForm"
        m="x-27 <xl:x-10"
      />
    </div>
    <!-- 預覽作答 -->
    <div v-else class="shadow-default" bg="[#FFFFFF]" m="x-56 <xl:x-10 b-40px" p="t-4 x-8">
      <div
        class="from-transparent via-[#0FCEEC] to-transparent text-shadow"
        bg="gradient-to-r"
        m="x-75 <xl:x-30"
        p="y-10px"
        text="44px [#FFF]"
      >
        {{ textData.previewState }}
      </div>
      <QuestionnaireAnswerComponent
        class="min-h-[calc(100vh-274px)]"
        :questionnaireData="questionForm"
        :questionBlockData="questionList"
      />
    </div>
    <!-- 底部按鈕列 -->
    <div class="fixed center bottom-0 w-1920px <2xl:w-full" m="x-auto" p="y-35px" bg="[#000000] opacity-80" text="20px">
      <!-- 回去修改 -->
      <button
        class="shadow-default text-shadow blueGradient"
        m="l-15px"
        p="x-70px y-3 <2xl:x-5"
        border="rounded-60px"
        text="[#FFFFFF]"
        @click="onBackToEdit"
      >
        {{ textData.backToEdit }}
      </button>
      <!-- 觀看下一頁 -->
      <button
        class="shadow-default text-shadow from-[#2FF994] to-[#15CE00]"
        m="l-15px"
        p="x-15 y-3 <2xl:x-5"
        border="rounded-60px"
        bg="gradient-to-b"
        text="[#FFFFFF]"
        @click="isShowQuestionnaireInfo = !isShowQuestionnaireInfo"
      >
        {{ switchPageText }}
      </button>
      <!-- 完成並發佈 -->
      <button
        v-if="!isShowQuestionnaireInfo && questionForm.isPublish === DBBoolean.False"
        class="shadow-default text-shadow yellowGradient"
        m="l-15px"
        p="x-15 y-3 <2xl:x-5"
        border="rounded-60px"
        text="[#FFFFFF]"
        @click="onClickSaveAndPublish"
      >
        {{ textData.finishAndPublish }}
      </button>
      <!-- 儲存 -->
      <button
        v-if="!isShowQuestionnaireInfo && questionForm.isPublish === DBBoolean.True"
        class="shadow-default text-shadow yellowGradient"
        m="l-15px"
        p="x-15 y-3 <2xl:x-5"
        border="rounded-60px"
        text="[#FFFFFF]"
        @click="onClickSave"
      >
        {{ textData.finishAndSave }}
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { DBBoolean } from '@/helper/enum/Common';
import { QuestionBlockData, QuestionnaireData } from '@/helper/interface/Questionnaire';
import QuestionnaireAnswerComponent from '@/views/QuestionnaireUser/QuestionnaireAnswerComponent.vue';
import QuestionnaireInfoComponent from '@/views/QuestionnaireUser/QuestionnaireInfoComponent.vue';
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
@Component({
  components: { QuestionnaireInfoComponent, QuestionnaireAnswerComponent },
})
export default class QuestionnairePreview extends Vue {
  /** 問卷資料 */
  @Prop() private questionForm!: QuestionnaireData;
  /** 題目資料 */
  @Prop() private questionList!: QuestionBlockData[];

  private DBBoolean = DBBoolean;

  /** 是否顯示問卷資訊 */
  private isShowQuestionnaireInfo: boolean = true;

  /** 換頁按鈕文字 */
  private get switchPageText(): string {
    return this.isShowQuestionnaireInfo ? '觀看下一頁' : '觀看上一頁';
  }

  /** 文字資料 */
  private textData = {
    backToEdit: '回去修改',
    previewState: '預覽狀態',
    finishAndPublish: '完成並發佈',
    finishAndSave: '完成並儲存',
  };

  /** 圖片資料 */
  private imgData = {
    whiteBlueBackground: imgPath.whiteBlueGradientBackground,
  };

  /**　點擊回去修改 */
  @Emit('onBackToEdit')
  private onBackToEdit(): void {
    return;
  }

  /** 點擊完成並發佈 */
  @Emit('onClickSaveAndPublish')
  private onClickSaveAndPublish(): void {
    return;
  }

  /** 點擊完成並儲存 */
  @Emit('onClickSave')
  private onClickSave(): void {
    return;
  }
}
</script>
<style scoped>
.text-shadow {
  text-shadow: 0px 3px 6px #1c1c1c80;
}
</style>
