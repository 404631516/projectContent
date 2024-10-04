<template>
  <div>
    <!-- 題目編輯 -->
    <div v-if="!isPreview" text="20px [#666666]">
      <div class="w-1450px shadow-default <2xl:w-1020px" bg="[#FFF]" m="x-auto" p="x-117px t-60px b-180px <2xl:x-0">
        <!-- 標題 -->
        <div class="flex justify-between items-end" p="b-5" border="b-1px solid [#B7B7B7]">
          <p class="<2xl:ml-2" text="36px">{{ textData.detail }}</p>
          <div text="24px">
            <!-- 參與問卷人數 -->
            <template v-if="isPublish">
              <span m="r-10px">{{ textData.filledCount }}</span>
              <span m="r-10px" text="[#00CCCE]">{{ `${questionForm.filledCount}` }}</span>
            </template>
            <button m="r-3"><img :src="imgData.yellowArrow" @click="isShowDetail = !isShowDetail" /></button>
          </div>
        </div>
        <!-- 問卷資訊 -->
        <QuestionnaireDetail
          v-show="isShowDetail"
          v-model="questionForm"
          :isPublish="isPublish"
          class="<2xl:w-1020px"
          m="t-5"
        />
        <!-- 未發佈獎勵資料 -->
        <template v-if="!isPublish">
          <!-- 固定獎勵 -->
          <div class="flex justify-between items-end" m="t-10" p="b-5" border="b-1px solid [#B7B7B7]">
            <p class="<2xl:ml-2" text="36px">{{ textData.fixedReward }}</p>
            <button m="r-3"><img :src="imgData.yellowArrow" @click="isShowFixedReward = !isShowFixedReward" /></button>
          </div>
          <QuestionnaireRewardSet
            v-show="isShowFixedReward"
            v-model="questionForm.reward"
            class="<2xl:w-1020px"
            m="t-5"
          />
          <!-- 轉蛋獎勵 -->
          <div class="flex justify-between items-end" m="t-10" p="b-5" border="b-1px solid [#B7B7B7]">
            <p class="<2xl:ml-2" text="36px">{{ textData.rankReward }}</p>
            <button m="r-3"><img :src="imgData.yellowArrow" @click="isShowRankReward = !isShowRankReward" /></button>
          </div>
          <QuestionnaireRankRewardSet v-show="isShowRankReward" v-model="questionForm" class="<2xl:w-1020px" m="t-5" />
        </template>
        <!-- 進行中獎勵資料 -->
        <template v-else>
          <div class="flex justify-between items-end" m="t-10" p="b-5" border="b-1px solid [#B7B7B7]">
            <p class="<2xl:ml-2" text="36px ">{{ textData.reward }}</p>
            <button m="r-3"><img :src="imgData.yellowArrow" @click="isShowReward = !isShowReward" /></button>
          </div>
          <template v-if="isShowReward">
            <!-- 固定獎勵 -->
            <div class="flex" m="l-90px <2xl:l-2 t-2">
              <p m="r-100px">{{ textData.fixedReward }}</p>
              <p class="max-w-[80%]" text="left">{{ getRewardText(questionForm.reward) }}</p>
            </div>
            <!-- 轉蛋獎勵 -->
            <div class="flex" m="l-90px <2xl:l-2 t-10">
              <p m="r-100px">{{ textData.rankReward }}</p>
              <div class="flex flex-col items-start max-w-[80%]">
                <div v-for="(reward, index) in questionForm.rankReward" :key="index">
                  <div class="grid grid-cols-[1fr,1fr,auto] gap-2" m="b-10px">
                    <p class="min-w-50px" text="left">{{ `${index + 1}獎` }}</p>
                    <p class="min-w-60px" text="[#00CCCE] left">{{ `${reward.rate}%` }}</p>
                    <p text="left">{{ getRewardText(reward.rewardList) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
        <!-- 問卷內容 -->
        <div class="flex justify-between items-end" m="t-10">
          <p class="<2xl:ml-2" text="36px">{{ textData.content }}</p>
          <button m="r-3"><img :src="imgData.yellowArrow" @click="isShowQuestion = !isShowQuestion" /></button>
        </div>
        <div class="w-1200px h-1px <2xl:w-1020px" m="t-5" border="b-1px solid [#B7B7B7]"></div>
        <template v-if="isShowQuestion">
          <!-- 總題數-->
          <div class="flex justify-start items-center" m="t-10px" text="24px">
            <p class="<2xl:ml-2">{{ textData.questionCount }}</p>
            <p m="l-10px" text="[#00CCCE]">{{ `${questionBlockList.length}` }}</p>
          </div>
          <!-- 問題方塊 -->
          <draggable v-model="questionBlockList" handle=".handle">
            <transition-group>
              <div v-for="(questionBlock, index) in questionBlockList" :key="questionBlock.formsQuestionId">
                <QuestionnaireBlockEdit
                  v-model="questionBlockList[index]"
                  :isPublish="isPublish"
                  :questionIndex="index"
                  @onCopyBlock="onCopyBlock(questionBlock, index)"
                  @onDeleteBlock="onDeleteBlock(questionBlock, index)"
                  @saveQuestionBlock="updateQuestionBlock(questionBlock)"
                  @onCloseBlock="onCloseBlock(questionBlock, index)"
                  @onOpenBlock="onOpenBlock(questionBlock)"
                  class="w-1200px <2xl:w-1020px"
                  m="t-25px"
                />
              </div>
            </transition-group>
          </draggable>
          <!-- 新增問題 -->
          <button
            v-if="!isPublish"
            class="w-1200px flex justify-center items-center <2xl:w-1020px"
            text="[#FFF]"
            bg="[#18BBD5]"
            m="t-15px"
            p="x-20px y-1"
            @click="addNewQuestionBlock"
          >
            <span text="44px" font="bold">+</span>{{ textData.addQuestionBlock }}
          </button>
        </template>
      </div>
      <!-- 按鈕列 -->
      <div class="fixed center bottom-0 w-1920px <2xl:w-full" m="x-auto" p="y-35px" bg="[#000000] opacity-80">
        <!-- 取消 -->
        <button
          class="shadow-default text-shadow from-[#FF9191] to-[#FF5169]"
          p="x-15 y-3 <2xl:x-5"
          border="rounded-60px"
          text="[#FFFFFF]"
          bg="gradient-to-b"
          @click="onCancel(questionForm, questionOrder)"
        >
          {{ textData.cancel }}
        </button>
        <!-- 刪除問卷 -->
        <button
          v-if="!isPublish && !isEnd"
          class="shadow-default text-shadow from-[#FF9191] to-[#FF5169]"
          m="l-15px"
          p="x-10 y-3 <2xl:x-5"
          border="rounded-60px"
          text="[#FFFFFF]"
          bg="gradient-to-b"
          @click="onClickDelete(questionForm.formsId)"
        >
          {{ textData.deleteForm }}
        </button>
        <!-- 預覽 -->
        <button
          v-if="!isEnd"
          class="shadow-default text-shadow blueGradient"
          m="l-15px"
          p="x-90px y-3 <2xl:x-5"
          border="rounded-60px"
          text="[#FFFFFF]"
          @click="onClickPreview"
        >
          {{ textData.preview }}
        </button>
        <!-- 儲存 -->
        <button
          v-if="!isPublish && !isEnd"
          class="shadow-default text-shadow yellowGradient"
          m="l-15px"
          p="x-90px y-3 <2xl:x-5"
          border="rounded-60px"
          text="[#FFFFFF]"
          @click="onSave"
        >
          {{ textData.save }}
        </button>
        <!-- 儲存並正式發布 -->
        <button
          v-if="!isPublish && !isEnd"
          class="shadow-default text-shadow yellowGradient"
          m="l-15px"
          p="x-10 y-3 <2xl:x-5"
          border="rounded-60px"
          text="[#FFFFFF]"
          @click="onClickSaveAndPublish"
        >
          {{ textData.saveAndPublish }}
        </button>
        <!-- 儲存並更新 -->
        <button
          v-if="isPublish && !isEnd"
          class="shadow-default text-shadow yellowGradient"
          m="l-15px"
          p="x-15 y-3 <2xl:x-5"
          border="rounded-60px"
          text="[#FFFFFF]"
          @click="onSave"
        >
          {{ textData.saveAndUpdate }}
        </button>
        <!-- 下載結果數據 -->
        <button
          v-if="isEnd"
          class="shadow-default text-shadow yellowGradient"
          m="l-15px"
          p="x-15 y-3 <2xl:x-5"
          border="rounded-60px"
          text="[#FFFFFF]"
          @click="onClickDownload(questionForm)"
        >
          {{ textData.downloadData }}
        </button>
      </div>
    </div>
    <!-- 預覽 -->
    <template v-else>
      <QuestionnairePreview
        :questionForm="questionForm"
        :questionList="questionBlockList"
        @onBackToEdit="isPreview = false"
        @onClickSaveAndPublish="onClickSaveAndPublish"
        @onClickSave="onSave"
      />
    </template>
  </div>
</template>

<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { ContestGameAward } from '@/helper/interface/Contest';
import { QuestionBlockData, QuestionnaireData } from '@/helper/interface/Questionnaire';
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import QuestionnaireDetail from './QuestionnaireDetail.vue';
import QuestionnaireRewardSet from './QuestionnaireRewardSet.vue';
import draggable from 'vuedraggable';
import QuestionnaireBlockEdit from './QuestionnaireBlockEdit.vue';
import { DBBoolean, ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { questionCloseAPI, questionCopyAPI, questionEditorAPI } from '@/api/questionnaire';
import RewardManager from '@/manager/RewardManager';
import QuestionnairePreview from './QuestionnairePreview.vue';
import { Message } from '@/helper/class/Common';
import config from '@/config/setting';
import QuestionnaireRankRewardSet from './QuestionnaireRankRewardSet.vue';
import { isPassed, toDayjs } from '../../../manager/TimeSyncManager';

@Component({
  components: {
    QuestionnaireDetail,
    QuestionnaireRewardSet,
    QuestionnaireRankRewardSet,
    draggable,
    QuestionnaireBlockEdit,
    QuestionnairePreview,
  },
})
export default class QuestionnaireForm extends Vue {
  /** API取得的問卷資料 */
  @Prop() private questionFormData!: QuestionnaireData;
  /** API取得的題目資料 */
  @Prop() private questionListData!: QuestionBlockData[];
  /** 是否已開始 */
  private isPublish: boolean = false;
  /** 是否已開始 */
  private isStart: boolean = false;
  /** 是否已結束 */
  private isEnd: boolean = false;
  /** 是否顯示問卷資訊 */
  private isShowDetail: boolean = true;
  /** 是否顯示固定獎勵 */
  private isShowFixedReward: boolean = true;
  /** 是否顯示轉蛋獎勵 */
  private isShowRankReward: boolean = true;
  /** 是否顯示獎勵區塊 */
  private isShowReward: boolean = true;
  /** 是否顯示題目區塊 */
  private isShowQuestion: boolean = true;
  /** 是否為預覽 */
  private isPreview: boolean = false;

  /** 編輯中問卷資料 */
  public questionForm: QuestionnaireData = {} as QuestionnaireData;
  /** 編輯中題目資料 */
  private questionBlockList: QuestionBlockData[] = [];

  /** 機率總和 */
  private readonly rateTotal: number = 100;
  /** 最小設定機率 */
  private readonly rateMin: number = 0.01;

  /** 文字資料 */
  private textData = {
    back: '返回',
    detail: '問卷資訊',
    filledCount: '參與問卷人數',
    fixedReward: '固定獎勵',
    rankReward: '轉蛋獎勵',
    reward: '獎勵',
    content: '問卷內容',
    questionCount: '總題數',
    addQuestionBlock: '新增題目區塊',
    cancel: '取消',
    deleteForm: '刪除問卷',
    preview: '預覽',
    save: '儲存',
    saveAndPublish: '儲存並正式發布',
    saveAndUpdate: '儲存並更新',
    downloadData: '下載結果數據',
    systemAlert: '系統提示',
    noDownloadData: '尚無資料產生，無法下載',
  };

  /** 圖片資料 */
  private imgData = {
    yellowArrow: imgPath.yellowArrow,
    doubleArrow: imgPath.arrowTwoIconBaseUrl,
  };

  /** 取得題目順序 */
  public get questionOrder(): number[] {
    return this.questionBlockList.map((question: QuestionBlockData) => question.formsQuestionId);
  }

  /** 是否有未儲存更動 */
  public get isUnsaved(): boolean {
    return JSON.stringify(this.questionForm) !== JSON.stringify(this.questionFormData);
  }

  created() {
    this.questionForm = JSON.parse(JSON.stringify(this.questionFormData));
    this.questionBlockList = this.questionListData;
    this.isPublish = this.questionForm.isPublish === DBBoolean.True;
    this.isStart = isPassed(this.questionForm.startAt);
    this.isEnd = isPassed(this.questionForm.endAt);
  }

  /** 產生獨特key
   *  @param index
   */
  private getId(index: number): symbol {
    return Symbol(index);
  }

  /** 取得獎勵文字
   *  @param rewardList
   */
  private getRewardText(rewardList: ContestGameAward[]): string {
    return RewardManager.combineRewardName(rewardList);
  }

  /** 新增題目區塊 */
  private async addNewQuestionBlock(): Promise<void> {
    // 取得題目ID
    const questionId = await this.requestNewQuestionId();
    if (questionId == null) {
      Message.error('題目新增失敗');
      return;
    }

    // 新增空白題目區塊
    this.questionBlockList.push({
      formsQuestionId: questionId,
      formsId: this.questionForm.formsId,
      questionMain: '',
      questionSub: '',
      optionType: 0,
      optionArg: {
        limitCount: 0,
        options: [],
      },
      isClose: 0,
      isRequire: 0,
    });
  }

  /** 複製問題
   *  @param questionBlock
   *  @param index
   */
  private async onCopyBlock(questionBlock: QuestionBlockData, index: number): Promise<void> {
    // API請求複製的題目ID
    const newQuestionId = await this.requestCopyQuestion(questionBlock.formsQuestionId);
    if (newQuestionId == null) {
      Message.error('題目複製失敗');
      return;
    }
    // 複製題目資料
    const newQuestionBlock = JSON.parse(JSON.stringify(questionBlock));
    newQuestionBlock.formsQuestionId = newQuestionId;
    this.questionBlockList.push(newQuestionBlock);
  }

  /** 刪除問題
   *  @param questionBlock
   *  @param index
   */
  private async onDeleteBlock(questionBlock: QuestionBlockData, index: number): Promise<void> {
    if ((await this.requestDeleteQuestion(questionBlock.formsQuestionId)) === false) {
      Message.error('題目刪除失敗');
      return;
    }
    this.questionBlockList.splice(index, 1);
  }

  /** 關閉問題
   * @param questionBlock
   * @param index
   */
  private async onCloseBlock(questionBlock: QuestionBlockData, index: number): Promise<void> {
    if (this.questionBlockList.every((block: QuestionBlockData) => block.isClose === DBBoolean.True)) {
      this.$message.error('題目關閉失敗，題目不可全關！');
      this.questionBlockList[index].isClose = DBBoolean.False;
      return;
    }
    if ((await this.requestCloseQuestion(questionBlock.formsQuestionId)) === false) {
      Message.error('題目關閉失敗');
      return;
    }
  }

  /** 開啟問題
   *  @param questionBlock
   */
  private async onOpenBlock(questionBlock: QuestionBlockData): Promise<void> {
    if ((await this.requestOpenQuestion(questionBlock.formsQuestionId)) === false) {
      Message.error('題目開啟失敗');
      return;
    }
  }

  /** API取得新題目Id */
  private async requestNewQuestionId(): Promise<number | undefined> {
    // 組成封包
    const data = {
      formsId: this.questionForm.formsId,
    };

    try {
      // API 取得新題目Id
      const response: any = await questionEditorAPI.post(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return response.formsQuestionId;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 請求複製題目
   *  @param formsQuestionId
   */
  private async requestCopyQuestion(formsQuestionId: number): Promise<number | undefined> {
    // 組成封包
    const data = { formsQuestionId };

    try {
      // API 送出題目編號
      const response: any = await questionCopyAPI.post(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return response.formsQuestionId;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 請求刪除題目
   *  @param formsQuestionId
   */
  private async requestDeleteQuestion(formsQuestionId: number): Promise<boolean> {
    // 組成封包
    const data = { formsQuestionId };

    try {
      // API 刪除題目
      const response: any = await questionEditorAPI.remove(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** API更新(儲存)問題資料
   * @param questionBlock
   */
  private async updateQuestionBlock(questionBlock: QuestionBlockData): Promise<void> {
    // 組成封包
    const data = {
      formsQuestionId: questionBlock.formsQuestionId,
      updateValue: questionBlock,
    };

    try {
      // API 儲存題目
      const response: any = await questionEditorAPI.put(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 請求關閉題目
   *  @param formsQuestionId
   */
  private async requestCloseQuestion(formsQuestionId: number): Promise<boolean> {
    // 組成封包
    const data = { formsQuestionId };

    try {
      // API 關閉題目
      const response: any = await questionCloseAPI.post(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** 請求開啟題目
   *  @param formsQuestionId
   */
  private async requestOpenQuestion(formsQuestionId: number): Promise<boolean> {
    // 組成封包
    const data = { formsQuestionId };

    try {
      // API 開啟題目
      const response: any = await questionCloseAPI.put(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** 網址檢查
   * @param url
   */
  private isValidURL(url: string): boolean {
    const regExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regExp.test(url);
  }

  /** 問卷整體驗證 */
  public isQuestionnaireValid(): boolean {
    let errorMessage: string = '';
    // 問卷資訊驗證
    errorMessage += this.isDetailValid();

    // 固定獎勵驗證
    errorMessage += RewardManager.isContestGameAwardValid('固定獎勵', this.questionForm.reward);

    // 轉蛋獎勵驗證
    errorMessage += this.isRankRewardValid();

    if (errorMessage.length > 0) {
      this.$message.error({
        dangerouslyUseHTMLString: true,
        message: errorMessage,
        duration: 5000,
      });
      return false;
    }

    return true;
  }

  /** 問卷資訊驗證 */
  private isDetailValid(): string {
    let errorMessage: string = '';
    /** 標題必填 */
    if (this.questionForm.title.length === 0) {
      errorMessage += '標題不可為空' + '<br/>';
    }

    // 開始日期不可為空
    if (this.questionForm.startAt === null || this.questionForm.startAt.length === 0) {
      errorMessage += '開始日期不可為空' + '<br/>';
    }
    // 開始時間不可為過期時間
    else if (this.isStart === false && isPassed(this.questionForm.startAt)) {
      errorMessage += '開始時間不可為過期時間' + '<br/>';
    }

    // 結束日期不可為空
    if (this.questionForm.endAt === null || this.questionForm.endAt.length === 0) {
      errorMessage += '結束日期不可為空' + '<br/>';
    }
    // 結束時間不可為過期時間
    else if (isPassed(this.questionForm.endAt)) {
      errorMessage += '結束時間不可為過期時間' + '<br/>';
    }

    // 結束日期不可早於開始日期
    if (toDayjs(this.questionForm.endAt).isBefore(toDayjs(this.questionForm.startAt))) {
      errorMessage += '結束日期不可早於開始日期' + '<br/>';
    }

    // 檢查內容說明連結
    if (
      this.questionForm.referLink !== null &&
      this.questionForm.referLink.length !== 0 &&
      this.isValidURL(this.questionForm.referLink) === false
    ) {
      errorMessage += '內容說明連結錯誤' + '<br/>';
    }

    // 內容說明不可為空
    if (this.questionForm.content.length === 0) {
      errorMessage += '內容說明不可為空' + '<br/>';
    }

    return errorMessage;
  }

  /** 轉蛋獎勵驗證 */
  private isRankRewardValid(): string {
    // 轉蛋獎勵未設定
    if (this.questionForm.rankReward.length === 0) {
      return '轉蛋獎勵不可為空';
    }
    let errorMessage: string = '';

    let totalRate = 0;
    this.questionForm.rankReward.forEach((rankReward, index) => {
      // 加總機率
      totalRate += rankReward.rate;

      // 機率不可小於最小值
      if (rankReward.rate < this.rateMin) {
        errorMessage += `轉蛋獎勵${index + 1}獎設定錯誤： 機率不可低於${this.rateMin}` + '<br/>';
      }

      // 前面獎項機率不可大於後面獎項
      const nextRankReward = this.questionForm.rankReward[index + 1];
      if (nextRankReward != null && rankReward.rate > nextRankReward.rate) {
        errorMessage += `轉蛋獎勵${index + 1}獎設定錯誤： 機率高於後面獎項` + '<br/>';
      }

      // 獎勵檢查
      errorMessage += RewardManager.isContestGameAwardValid(`轉蛋獎勵第${index}獎`, rankReward.rewardList);
    });

    // 總機率不可超過設定上限
    if (totalRate > this.rateTotal) {
      errorMessage += `轉蛋獎勵總機率超過上限(${this.rateTotal}%)` + '<br/>';
    }

    return errorMessage;
  }

  /** 點擊預覽 */
  private async onClickPreview(): Promise<void> {
    // 問卷整體欄位驗證
    if (this.isQuestionnaireValid() === false) {
      return;
    }
    if (this.questionBlockList.length === 0) {
      this.$message.error('沒有題目，無法預覽!');
      return;
    }
    this.isPreview = true;
  }

  /** 點擊儲存並正式發布 */
  private async onClickSaveAndPublish(): Promise<void> {
    // 題目數量為0
    if (this.questionBlockList.length === 0) {
      Message.error('題目數量為0，無法發佈!');
      return;
    }
    this.onSaveAndPublish();
  }

  /** 點擊下載結果數據
   *  @param questionForm
   */
  private async onClickDownload(questionForm: QuestionnaireData): Promise<void> {
    // 下載報告流程
    if (questionForm.filledCount === 0) {
      this.$alert(this.textData.noDownloadData, this.textData.systemAlert);
      return;
    }
    const downloadURL: string = config.HttpPath + '/formsEditorReport' + '?' + `formsId=${questionForm.formsId}`;
    window.open(downloadURL);
  }

  /** 點擊取消
   *  @param questionForm
   *  @param questionOrder
   */
  @Emit('onCancel')
  private onCancel(questionForm: QuestionnaireData, questionOrder: number[]): void {
    return;
  }

  /** 點擊刪除
   *  @param formsId
   */
  @Emit('onClickDelete')
  private onClickDelete(formsId: number): void {
    return;
  }

  /** 儲存問卷
   *  @param questionForm
   *  @param questionOrder
   */
  @Emit('onSave')
  private onSave(): void {
    return;
  }

  /** 儲存並發布問卷
   *  @param questionForm
   *  @param questionOrder
   */
  @Emit('onSaveAndPublish')
  private onSaveAndPublish(): void {
    return;
  }
}
</script>
<style scoped>
.text-shadow {
  text-shadow: 0px 3px 6px #00000029;
}
::v-deep .el-select .el-input.el-input--suffix .el-input__inner {
  background-color: #eeeada;
  color: #666666 !important;
  font-size: 20px !important;
}
::v-deep .el-select .el-input.el-input--suffix .el-input__inner::placeholder {
  color: #666666 !important;
}
::v-deep .el-select .el-input.is-disabled.el-input--suffix .el-input__inner {
  color: #666666 !important;
  font-size: 20px !important;
}
::v-deep i.el-select__caret {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  padding-left: 14px;
  background: url('../../../assets/images/icon/select_arrow.png') center center no-repeat;
  background-size: 18px 12px;
  transform: translate(-50%, -50%);
}
::v-deep .el-select__caret.el-input__icon.el-icon-arrow-up::before {
  content: '';
}
::v-deep .el-date-editor.el-input.el-input--prefix.el-input--suffix.el-date-editor--datetime .el-input__inner {
  background-color: #eeeada;
  font-size: 18px;
  color: #666666;
}
::v-deep
  .el-date-editor.el-input.el-input--prefix.el-input--suffix.el-date-editor--datetime
  .el-input__inner::placeholder {
  color: #666666;
}
</style>
