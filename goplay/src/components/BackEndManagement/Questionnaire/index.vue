<template>
  <div bg="[#F9F8F4]">
    <div v-if="isShowQuestionnaireForm">
      <QuestionnaireForm
        ref="questionnaireForm"
        :questionFormData="questionFormData"
        :questionListData="questionListData"
        @onCancel="onCancel"
        @onClickDelete="onDelete"
        @onSave="onSave"
        @onSaveAndPublish="onSaveAndPublish"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { formsEditorAPI, formsPublishAPI } from '@/api/questionnaire';
import { Message } from '@/helper/class/Common';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { ContestGameAward } from '@/helper/interface/Contest';
import { QuestionBlockData, QuestionnaireData, QuestionnaireRankReward } from '@/helper/interface/Questionnaire';
import { Component, Vue } from 'vue-property-decorator';
import RouteLocationNormalized, { NavigationGuardNext } from 'vue-router';
import QuestionnaireForm from './QuestionnaireForm.vue';

Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave', 'beforeRouteUpdate']);

@Component({
  components: { QuestionnaireForm },
})
export default class Index extends Vue {
  /** 問卷表單顯示開關 */
  private isShowQuestionnaireForm: boolean = false;
  /** 編輯中問卷資料 */
  private questionFormData: QuestionnaireData = {} as QuestionnaireData;
  /** 編輯中題目資料 */
  private questionListData: QuestionBlockData[] = [];

  public $refs!: {
    questionnaireForm: QuestionnaireForm;
  };

  /** 文字資料 */
  private textData = {
    cancel: '取消',
    delete: '刪除',
    deleteReminder: '確定要刪除問卷嗎?',
    save: '儲存',
    systemAlert: '系統通知',
    saveReminder: '要儲存剛剛修改的資訊嗎?',
    notSave: '不須儲存',
    saveSuccess: '已儲存!',
    publishSuccess: '問卷已發佈!',
  };

  async created() {
    if (!(await this.getQuestionFormData(Number(this.$route.params.id)))) {
      return;
    }
    this.isShowQuestionnaireForm = true;
  }

  async beforeRouteLeave(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    if ((await this.assureSaved()) === false) {
      return;
    }
    next();
  }

  /** API取得問卷資料
   *  @param formsId
   */
  private async getQuestionFormData(formsId: number): Promise<boolean> {
    // 組成封包
    const data = { formsId };
    try {
      // API 取得問卷資料
      const response: any = await formsEditorAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      this.questionFormData = response.forms as QuestionnaireData;
      this.questionFormData.reward = JSON.parse(response.forms.reward);
      this.questionFormData.rankReward = JSON.parse(response.forms.rankReward);
      this.questionFormData.contentPics = JSON.parse(response.forms.contentPics);

      this.questionListData = response.questions.map((question: any) => {
        const questionData = question as QuestionBlockData;
        questionData.optionArg = JSON.parse(question.optionArg);
        return questionData;
      });
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** 點擊取消 */
  private async onCancel(): Promise<void> {
    // 確保儲存
    if ((await this.assureSaved()) === false) {
      return;
    }
    this.$router.go(-1);
  }

  /** 點擊刪除
   * @param formsId
   */
  private onDelete(formsId: number) {
    // 談窗詢問是否刪除問卷
    this.$confirm(this.textData.deleteReminder, this.textData.systemAlert, {
      confirmButtonText: `${this.textData.delete}`,
      cancelButtonText: `${this.textData.cancel}`,
      confirmButtonClass: 'red-button',
      type: 'warning',
    }).then(async () => {
      // 刪除問卷
      if (await this.deleteFormData(formsId)) {
        this.$router.go(-1);
      }
    });
  }

  /** 儲存表單 */
  private async onSave(): Promise<boolean> {
    const questionnaireForm = this.$refs.questionnaireForm;
    // 表單驗證
    if (questionnaireForm.isQuestionnaireValid() === false) {
      return false;
    }
    if (!(await this.saveFormData(questionnaireForm.questionForm, questionnaireForm.questionOrder))) {
      return false;
    }
    // 更新已儲存問卷資料
    this.questionFormData = JSON.parse(JSON.stringify(questionnaireForm.questionForm));
    // 儲存成功彈窗
    this.$alert(this.textData.saveSuccess, this.textData.systemAlert);
    return true;
  }

  /** 儲存並發布表單 */
  private async onSaveAndPublish(): Promise<void> {
    // 儲存
    if ((await this.onSave()) === false) {
      return;
    }
    // 發佈
    if ((await this.publishForm(this.$refs.questionnaireForm.questionForm.formsId)) === false) {
      Message.error('問卷發佈失敗');
      return;
    }

    // 發佈成功彈窗
    this.$alert(this.textData.publishSuccess, this.textData.systemAlert).then(() => this.$router.go(-1));
  }

  /** 彈窗詢問是否儲存 */
  private async assureSaved(): Promise<boolean> {
    // 沒做更改
    if (this.$refs.questionnaireForm.isUnsaved === false) {
      return true;
    }
    try {
      // 詢問是否儲存通知
      await this.$confirm(this.textData.saveReminder, this.textData.systemAlert, {
        confirmButtonText: `${this.textData.save}`,
        cancelButtonText: `${this.textData.notSave}`,
        type: 'warning',
      });

      // 確認, 儲存
      return await this.onSave();
    } catch {
      // 取消, 重置資料
      this.questionFormData = this.$refs.questionnaireForm.questionForm;
      return true;
    }
  }

  /** API刪除問卷資料
   *  @param formsId
   */
  private async deleteFormData(formsId: number): Promise<boolean> {
    // 組成封包
    const data = {
      formsId,
    };

    try {
      // API 刪除問卷
      const response: any = await formsEditorAPI.remove(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** API儲存問卷資料
   *  @param questionForm
   *  @param questionOrder
   */
  private async saveFormData(questionForm: QuestionnaireData, questionOrder: number[]): Promise<boolean> {
    // 組成封包
    const data = {
      formsId: questionForm.formsId,
      updateValue: {
        title: questionForm.title,
        titleSub: questionForm.titleSub,
        content: questionForm.content,
        startAt: questionForm.startAt,
        endAt: questionForm.endAt,
        contentPics: questionForm.contentPics,
        referLink: questionForm.referLink,
        reward: questionForm.reward.map((reward: ContestGameAward) => {
          return { itemType: reward.itemType, itemId: reward.itemId, count: reward.count };
        }),
        rankReward: questionForm.rankReward.map((rankReward: QuestionnaireRankReward, index: number) => {
          return {
            rankValue: index + 1,
            rate: rankReward.rate,
            rewardList: rankReward.rewardList.map((reward: ContestGameAward) => {
              return { itemType: reward.itemType, itemId: reward.itemId, count: reward.count };
            }),
          };
        }),
      },
      questionOrder,
    };

    try {
      // API 儲存問卷資料
      const response: any = await formsEditorAPI.put(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** API發佈問卷
   *  @param formsId
   */
  private async publishForm(formsId: number): Promise<boolean> {
    // 組成封包
    const data = {
      formsId,
    };

    try {
      // API 發佈問卷
      const response: any = await formsPublishAPI.post(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }
}
</script>
