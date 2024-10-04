<!--用戶端問巻清單入口-->
<template>
  <div>
    <!-- 上方標題/banner -->
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <!-- 過濾問巻按鈕:外框線 -->
    <div class="rounded-[10px] shadow-default">
      <!-- 按鈕彈性容器 -->
      <div class="flex items-center <sm:items-start">
        <!-- 文字:篩選 -->
        <span class="ml-55 <lg:(ml-26) py-20px text-[#707070] text-28px font-bold <sm:hidden">
          {{ textData.filterPrompt }}
        </span>
        <span class="ml-50px <sm:ml-0" />
        <!-- 各種過濾問巻按鈕 -->
        <button
          v-for="(filterButtonData, index) in filterButtonDataList"
          :key="index"
          class="py-20px w-223px h-full bg-[#FFF] text-28px font-bold"
          :class="
            currentFilterState === filterButtonData.state
              ? 'text-[#FDC327] border-b-4px border-yellow-400'
              : 'text-[#707070] '
          "
          p="y-8px"
          @click="onClickFilterButton(filterButtonData.state)"
        >
          <!-- 按鈕字 -->
          {{ filterButtonData.buttonText }}
        </button>
      </div>
    </div>
    <!--頁碼放在清單下方固定位置-->
    <!--用戶問巻清單-->
    <div class="min-h-850px pt-30px mb-5">
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
          :isEditor="false"
          :questionnaireData="questionnaireData"
          @onClickQuestionnaireCell="onClickQuestionnaireCell"
        />
      </div>
    </div>
    <!--用戶問巻清單-頁碼元件 -->
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
import { FormsListData, QuestionnaireListDataNet } from '@/helper/interface/Questionnaire';
import { QuestionnaireFilterState, QuestionnaireSortType } from '@/helper/enum/Questionnaire';
import { formsListAPI } from '@/api/questionnaire';
import imgPath from '@/config/imgPath/imgPath';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import QuestionnaireCell from '@/components/Questionnaire/QuestionnaireCell.vue';
import { MenuWord } from '@/helper/enum/MenuName';
import { isPassed } from '../../manager/TimeSyncManager';

/** 建立篩選鈕的資料 */
interface FilterButtonData {
  /** 問巻過濾方式 */
  state: QuestionnaireFilterState;
  /** 問巻過濾方式 */
  buttonText: string;
}

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
  /** 目前選擇的過濾方式 */
  private currentFilterState: QuestionnaireFilterState = QuestionnaireFilterState.all;

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
    filterPrompt: '篩選',
    filterStateAll: '全部',
    filterStateFill: '已參加',
    filterStateNotFill: '可參加',
    noData: '目前沒有問巻喔!',
  };

  /** 建立篩選鈕的資料  */
  private readonly filterButtonDataList: FilterButtonData[] = [
    // 可參加
    { state: QuestionnaireFilterState.notFill, buttonText: this.textData.filterStateNotFill },
    // 全部
    { state: QuestionnaireFilterState.all, buttonText: this.textData.filterStateAll },
    // 已參加
    { state: QuestionnaireFilterState.isFill, buttonText: this.textData.filterStateFill },
  ];

  created() {
    // 預設顯示可參加問巻
    this.onClickFilterButton(QuestionnaireFilterState.notFill);
  }

  /** 按下過濾方式鈕
   * @param filterState 過濾方式
   */
  private async onClickFilterButton(filterState: QuestionnaireFilterState): Promise<void> {
    // 記錄過濾方式
    this.currentFilterState = filterState;
    // 修改頁碼到第1頁
    this.currentPage = 1;

    // 顯示第1頁的問巻
    await this.filterQuestionnaireList();
  }

  /** 過濾問巻列表 */
  private async filterQuestionnaireList(): Promise<void> {
    // 組成封包
    const data: FormsListData = {
      pageOptions: { page: this.currentPage - 1, pageSize: this.questionnaireCountPerPage },
      sortOptions: { sortType: QuestionnaireSortType.ascending },
      filterOptions: { state: this.currentFilterState },
    };

    try {
      // API 索取指定類型/頁面的問巻清單
      const response: any = await formsListAPI.post(data);
      // 儲存問巻列表
      this.questionnaireDataList = response.formsList;
      // 儲存總頁數 = 總篝數/每頁筆數(小數進位)
      this.totalPage = Math.ceil(response.totalSize / this.questionnaireCountPerPage);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 收到按下問巻CELL事件
   * @param questionnaireData 問巻資料
   */
  private onClickQuestionnaireCell(questionnaireData: QuestionnaireListDataNet): void {
    if (questionnaireData.isFilled === false) {
      if (isPassed(questionnaireData.endAt)) {
        Message.warn('你沒有參加過這個問卷活動喔!');
        return;
      } else {
        // 用戶參加問巻
        this.$router.push({
          name: `${MenuWord.QuestionnaireInformation}`,
          params: { id: `${questionnaireData.formsId}` },
        });
      }
    } else {
      // 用戶回顧問巻
      this.$router.push({
        name: `${MenuWord.QuestionnaireReview}`,
        params: { id: `${questionnaireData.formsId}` },
      });
    }
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
