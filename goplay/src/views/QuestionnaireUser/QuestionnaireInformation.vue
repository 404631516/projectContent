<template>
  <div bg="[#F9F8F4]">
    <div bg="[#FFFFFF]" m="x-46 b-35 <xl:x-10 <sm:x-3" p="t-5 x-8 <sm:x-0">
      <!-- 返回 -->
      <button
        class="grid grid-cols-[1fr,3fr] items-center rounded-[30px] shadow-default"
        p="x-2"
        border="2px solid [#FFFFFF]"
        bg="[#FF5875]"
        @click="onReturnToList"
      >
        <img :src="imgData.doubleArrow" class="w-5 transform rotate-180" />
        <p text="lg [#FFFFFF]">{{ textData.returnText }}</p>
      </button>
      <!-- 問卷內容 -->
      <template v-if="isShow">
        <QuestionnaireInfoComponent class="min-h-[calc(100vh-252px)]" :questionnaireData="questionnaireData" />
      </template>
    </div>
    <!-- 底部按鈕列 -->
    <div class="w-full h-35 flex items-center justify-center absolute bottom-0" bg="[#000000CC]">
      <!-- 前往填寫問卷 -->
      <button
        class="flex items-center rounded-[80px] yellowGradient"
        p="x-27 y-4 <sm:(x-3)"
        @click="goToFillInQuestionnaire"
      >
        <img :src="imgData.paperPen" class="w-18 aspect-square object-contain absolute" />
        <span text="3xl [#FFFFFF] shadow-lightDefault" m="l-18">{{ textData.goToFillIn }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { handleAPIError } from '@/helper/fnc/common';
import { QuestionnaireData } from '@/helper/interface/Questionnaire';
import { ResponseState } from '@/helper/enum/Common';
import { formsReadAPI } from '@/api/questionnaire';
import QuestionnaireInfoComponent from './QuestionnaireInfoComponent.vue';
import { MenuName, MenuWord } from '@/helper/enum/MenuName';

@Component({
  components: { QuestionnaireInfoComponent },
})
export default class QuestionnaireInformation extends Vue {
  /** 問卷ID */
  private formsId: number = 0;
  /** 問卷資料 */
  private questionnaireData: QuestionnaireData = {} as QuestionnaireData;
  /** 是否顯示 */
  private isShow: boolean = false;

  /** 文字資料 */
  private textData = {
    returnText: '返回',
    goToFillIn: '前往填寫問卷',
  };

  /** 圖片資料 */
  private imgData = {
    doubleArrow: imgPath.arrowTwoIconBaseUrl,
    paperPen: imgPath.paperPen,
  };

  async created() {
    if (this.$route.params.id == null) {
      // 返回問卷清單
      this.onReturnToList();
      return;
    }
    this.formsId = Number(this.$route.params.id);
    await this.requestQuestionExplain();
  }

  /** API取得問卷資料 */
  private async requestQuestionExplain(): Promise<void> {
    // 組成封包
    const data = {
      formsId: this.formsId,
    };

    try {
      // API撈取所有通知
      const response: any = await formsReadAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 整理資料
      this.questionnaireData = response.forms as QuestionnaireData;
      this.questionnaireData.reward = JSON.parse(response.forms.reward);
      this.questionnaireData.rankReward = JSON.parse(response.forms.rankReward);
      this.questionnaireData.contentPics = JSON.parse(response.forms.contentPics);

      this.isShow = true;
    } catch (e) {
      this.$alert(`${e}`);
      // 返回問卷清單
      this.onReturnToList();
    }
  }

  /** 返回問卷清單 */
  private onReturnToList(): void {
    this.$router.push(`/${MenuName.QuestionnaireUser}`);
  }

  /** 跳轉到填寫問卷 */
  private goToFillInQuestionnaire(): void {
    this.$router.push({
      name: `${MenuWord.QuestionnaireAnswer}`,
      params: { id: `${this.formsId}` },
    });
  }
}
</script>
<style scoped></style>
