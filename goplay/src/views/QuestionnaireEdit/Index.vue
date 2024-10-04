<!--教師端問巻清單入口-->
<template>
  <div>
    <!-- 上方標題/banner -->
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <!-- 創建問巻 -->
    <button
      class="w-9/13 h-100px rounded-[60px] border-3 border-solid border-[#EBB030] bg-[#FFF] text-[#EBB030] text-33px shadow-default"
      m="t-4"
      p="y-8px"
      @click="onClickCreateButton"
    >
      <div class="m-auto w-200px h-full flex items-center">
        <!-- 加號圖 -->
        <span>
          <i class="el-icon-plus" font="before:black" text="[#EBB030] 50px"></i>
        </span>
        <!-- 按鈕字 -->
        <span>
          {{ textData.createQuestionnaire }}
        </span>
      </div>
    </button>
    <!--頁碼放在清單下方固定位置-->
    <!--教師問巻清單-->
    <div class="h-850px pt-30px mb-5">
      <!-- 沒有問巻資料時，顯示提示字 -->
      <div v-if="questionnaireDataList.length === 0" class="no-post" p="t-200px" text="[#A5A5A5] 36px">
        {{ textData.noData }}
      </div>
      <!-- 有問巻資料時 -->
      <div v-else>
        <!-- 問巻清單 -->
        <QuestionnaireCell
          v-for="(questionnaireData, index) in questionnaireDataList"
          :key="index"
          :isEditor="true"
          :questionnaireData="questionnaireData"
          @onClickQuestionnaireCell="onClickQuestionnaireCell"
          @onClickDownloadButton="onClickDownloadButton"
        />
      </div>
    </div>

    <!--教師問巻清單-頁碼元件 -->
    <el-pagination
      class="item-center mb-30px"
      layout="prev, pager, next"
      hideOnSinglePage
      :currentPage.sync="currentPage"
      :pageCount="totalPage"
    ></el-pagination>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Message } from '@/helper/class/Common'; // 訊息框
import { ResponseState } from '@/helper/enum/Common';
import { FormsListData, QuestionnaireListDataNet } from '@/helper/interface/Questionnaire';
import { QuestionnaireFilterState, QuestionnaireSortType } from '@/helper/enum/Questionnaire';
import imgPath from '@/config/imgPath/imgPath';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import { formsEditorAPI, formsEditorListAPI, formsEditorReport } from '@/api/questionnaire';
import { MessageBoxInputData } from 'element-ui/types/message-box';
import QuestionnaireCell from '@/components/Questionnaire/QuestionnaireCell.vue';
import { MenuWord } from '@/helper/enum/MenuName';
import { handleAPIError } from '@/helper/fnc/common';
import config from '@/config/setting';

@Component({
  components: {
    GeneralBanner,
    QuestionnaireCell,
  },
})
export default class Index extends Vue {
  /** 問巻清單-動態表 */
  private questionnaireDataList: QuestionnaireListDataNet[] = [];
  /** 總頁數(連結到頁碼元件) */
  private totalPage: number = 0;
  /** 目前看到的頁數(連結到頁碼元件) */
  private currentPage: number = 1;

  /** 每頁問巻數 */
  private readonly questionnaireCountPerPage: number = 9;

  /** 圖片資料 */
  private imgData = {
    // 上方banner
    banner: imgPath.orangeBannerBaseUrl,
  };

  /**文字資料 */
  private textData = {
    title: '問巻列表',
    createQuestionnaire: '建立問卷',
    // 創建問巻
    confirm: '確認',
    createDefaultName: '活動名稱01',
    createUITitle: '系統通知',
    createUIMessage: '即將建立問卷，請填入標題',
    createUINoInput: '未輸入文字',
    systemAlert: '系統提示',
    noDownloadData: '尚無資料產生，無法下載',
    noData: '目前沒有問巻喔!',
  };

  created() {
    // 顯示第1頁的問巻
    this.filterQuestionnaireList();
  }

  /** 過濾問巻列表 */
  private async filterQuestionnaireList(): Promise<void> {
    // 組成封包
    const data: FormsListData = {
      pageOptions: { page: this.currentPage - 1, pageSize: this.questionnaireCountPerPage },
      sortOptions: { sortType: QuestionnaireSortType.ascending },
      filterOptions: { state: QuestionnaireFilterState.all },
    };

    try {
      // API 索取指定類型/頁面的問巻清單
      const response: any = await formsEditorListAPI.post(data);
      // 儲存問巻列表
      this.questionnaireDataList = response.formsList;
      // 儲存總頁數 = 總篝數/每頁筆數(小數進位)
      this.totalPage = Math.ceil(response.totalSize / this.questionnaireCountPerPage);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 按下建立問巻鈕 */
  private async onClickCreateButton(): Promise<void> {
    // 彈窗輸入密碼
    this.$prompt(this.textData.createUIMessage, this.textData.createUITitle, {
      confirmButtonText: this.textData.confirm,
      showCancelButton: false,
      inputPlaceholder: this.textData.createDefaultName,
      customClass: 'input-column-wrapper',
    })
      .then(async (msgboxData) => {
        const inputString = (msgboxData as MessageBoxInputData).value;
        // 未輸入文字
        if (inputString == null || inputString.length === 0) {
          Message.warn(this.textData.createUINoInput);
          return;
        }

        // 已輸入標題，建立問巻
        const newformsId = await this.createNewForms(inputString);
        if (newformsId === -1) {
          return;
        } else {
          this.$router.push({ name: `${MenuWord.QuestionnaireForm}`, params: { id: `${newformsId}` } });
        }
      })
      // 取消輸入
      .catch(() => {
        return;
      });
  }

  /** 編輯者創建問卷
   * @param title 標題字
   */
  private async createNewForms(title: string): Promise<number> {
    // 組成封包
    const data = {
      title,
    };

    try {
      // API 編輯者創建問卷
      const response: any = await formsEditorAPI.post(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      return response.formsId;
    } catch (e) {
      Message.error(`${e}`);
      return -1;
    }
  }

  /** 收到按下問巻CELL事件
   * @param questionnaireData 問巻資料
   */
  private onClickQuestionnaireCell(questionnaireData: QuestionnaireListDataNet): void {
    this.$router.push({ name: `${MenuWord.QuestionnaireForm}`, params: { id: `${questionnaireData.formsId}` } });
    return;
  }

  /** 收到按下cell的下載結果數據鈕事件
   * @param questionnaireData 問巻資料
   */
  private async onClickDownloadButton(questionnaireData: QuestionnaireListDataNet): Promise<void> {
    // 下載報告流程
    if (questionnaireData.filledCount === 0) {
      this.$alert(this.textData.noDownloadData, this.textData.systemAlert);
      return;
    }
    const downloadURL: string = config.HttpPath + '/formsEditorReport' + '?' + `formsId=${questionnaireData.formsId}`;
    window.open(downloadURL);
    return;
  }

  /** 切刷頁面時，刷新問巻列表 */
  @Watch('currentPage')
  private async updateQuestionnaireList(): Promise<void> {
    // 顯示選擇頁的問巻
    await this.filterQuestionnaireList();
  }
}
</script>

<style scoped></style>
