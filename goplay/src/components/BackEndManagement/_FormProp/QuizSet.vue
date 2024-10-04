<template>
  <el-dialog class="quiz-wrapper" :visible="true" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
    <!-- 標題 -->
    <div slot="title">
      <span>{{ textData.quizSetTitle }}</span>
    </div>
    <!-- 題庫選單 -->
    <el-table
      :data="quizSetList"
      :row-style="{ background: '#d0d3da' }"
      :empty-text="textData.noDataTitle"
      highlight-current-row
      style="width: 100%"
      @current-change="onSelectQuizSet"
    >
      <!-- 選擇欄 -->
      <el-table-column :label="textData.selectColumnTitle" width="50">
        <template slot-scope="scope">
          <el-radio v-model="currentQuizSetData.quizSetId" :label="`${scope.row['id']}`"></el-radio>
        </template>
      </el-table-column>
      <!-- 題庫ID -->
      <el-table-column prop="id" :label="textData.quizSetIdTitle"></el-table-column>
      <!-- 題目名稱 -->
      <el-table-column prop="quizName" :label="textData.quizNameTitle"></el-table-column>
      <!-- 狀態 -->
      <el-table-column :label="textData.quizStatusTitle">
        <template slot-scope="scope">
          <span v-show="scope.row.isEditing === 0">{{ textData.editedTitle }}</span>
        </template>
      </el-table-column>
      <!-- 題數 -->
      <el-table-column prop="quizNumber" :label="textData.quizNumberTitle"></el-table-column>
      <!-- 更新時間 -->
      <el-table-column prop="updatedAt" :label="textData.updatedAtTitle"></el-table-column>
    </el-table>
    <!-- 分頁-->
    <div class="block flex-pos">
      <el-pagination
        layout="prev, pager, next"
        :total="quizSetListSize"
        :page-size="quizSetPerPage"
        :hide-on-single-page="true"
        @current-change="onSwitchPage"
      ></el-pagination>
    </div>
    <!-- 按鈕區 -->
    <div class="btn-box flex-pos">
      <!-- 取消 -->
      <el-button class="btn-info-cancel" @click="onCancel">
        <span class="flex-pos">{{ textData.cancelTitle }}</span>
      </el-button>
      <!-- 確認 -->
      <el-button class="btn-game-again" @click="onConfirm(currentQuizSetData)">
        <span class="flex-pos">{{ textData.confirmTitle }}</span>
      </el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { quizSetListAPI } from '@/api/contest';
import { Message } from '@/helper/class/Common';
import { QuizSource, ResponseState } from '@/helper/enum/Common';
import { QuizSetListData } from '../../../helper/interface/BackEndManagement';
import { QuizSetData } from '@/helper/interface/Contest';

@Component({})
export default class QuizSet extends Vue {
  /** 題庫資料 */
  @Prop() private quizSetData!: QuizSetData;

  /** 當前題庫ID */
  private currentQuizSetData!: QuizSetData;

  /** 題庫清單資料 */
  private quizSetList: QuizSetListData[] = [];

  /** 每頁顯上題庫數量上限 */
  private readonly quizSetPerPage: number = 20;
  /** 題庫總量 */
  private quizSetListSize: number = 0;
  /** 當前頁數 */
  private currentPageIndex: number = 0;

  /** 文字資料 */
  private textData = {
    quizSetTitle: '選擇題庫',
    noDataTitle: '暫無數據',
    selectColumnTitle: '選擇',
    quizSetIdTitle: '編號',
    quizNameTitle: '題目名稱',
    quizStatusTitle: '狀態',
    editedTitle: '已編輯',
    quizNumberTitle: '題數',
    updatedAtTitle: '更新時間',
    cancelTitle: '取消',
    confirmTitle: '確定',
  };

  mounted() {
    this.currentQuizSetData = Object.assign({}, this.quizSetData);
    this.getQuizSetList();
  }

  /** 取得題庫資訊 */
  private async getQuizSetList(): Promise<void> {
    // 組成封包
    const data = {
      page: this.currentPageIndex,
      pageSize: this.quizSetPerPage,
      sort: { updatedAt: 'ASC' },
      query: {},
      searchByUserId: this.$$store.getters.userUid,
    };

    try {
      // API 取得題庫清單資料
      const response: any = await quizSetListAPI.fetch(data);
      if (response.result === ResponseState.Success) {
        this.quizSetList = response.results;
        this.quizSetListSize = response.total;
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 選中題庫
   * @param quizSetListData
   */
  private onSelectQuizSet(quizSetListData: QuizSetListData): void {
    this.currentQuizSetData.quizSetId = `${quizSetListData.id}`;
    this.currentQuizSetData.quizSetName = quizSetListData.quizName;
  }

  /** 換頁
   * @param pageIndex
   */
  private onSwitchPage(pageIndex: number): void {
    this.currentPageIndex = pageIndex - 1;
    this.getQuizSetList();
  }

  /** 確認 */
  @Emit('onConfirm')
  private onConfirm(quizSetData: QuizSetData): void {
    return;
  }

  /** 取消 */
  @Emit('onCancel')
  private onCancel(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.quiz-wrapper {
  .btn-box {
    margin: 1vw;
  }
}
</style>
