<template>
  <div>
    <h1 class="font-bold" p="b-5 <sm:t-5" text="3xl [#666666]">
      {{ UIHelper.toChineseContestGameRecordType(recordType) }}
    </h1>

    <!-- 歷程資料項目標題 -->
    <div
      class="grid gap-x-1"
      :class="
        recordType === ContestGameRecordType.AnswerRecord
          ? 'grid-cols-[10fr,10fr,10fr,12fr,8fr,5fr,8fr,5fr,8fr,8fr,8fr,8fr,10fr,12fr,12fr]'
          : 'grid-cols-[10fr,10fr,10fr,12fr,8fr,6fr,6fr,6fr,10fr,12fr,12fr]'
      "
    >
      <!-- 學校 -->
      <div class="titleItem-box">{{ recordTitleData.school }}</div>
      <!-- 班級 -->
      <div class="titleItem-box">{{ recordTitleData.class }}</div>
      <!-- 姓名 -->
      <div class="titleItem-box">{{ recordTitleData.name }}</div>
      <!-- 賽事名稱 -->
      <div class="titleItem-box">{{ recordTitleData.title }}</div>
      <!-- 賽事類型 -->
      <div class="titleItem-box">{{ recordTitleData.teamType }}</div>
      <!-- 科目 -->
      <div class="titleItem-box" v-if="recordType === ContestGameRecordType.AnswerRecord">
        {{ recordTitleData.subject_groupings_name }}
      </div>
      <!-- 學年 -->
      <div class="titleItem-box" v-if="recordType === ContestGameRecordType.AnswerRecord">
        {{ recordTitleData.semesterYear }}
      </div>
      <!-- 年級 -->
      <div class="titleItem-box" v-if="recordType === ContestGameRecordType.AnswerRecord">
        {{ recordTitleData.grade }}
      </div>
      <!-- 版本 -->
      <div class="titleItem-box" v-if="recordType === ContestGameRecordType.AnswerRecord">
        {{ recordTitleData.publisher_name }}
      </div>
      <!-- 總答題數 -->
      <div class="titleItem-box">{{ recordTitleData.total }}</div>
      <!-- 答對數 -->
      <div class="titleItem-box">{{ recordTitleData.correct }}</div>
      <!-- 未作答數 -->
      <div class="titleItem-box">{{ recordTitleData.unAnswer }}</div>
      <!-- 總答題時間(秒) -->
      <div class="titleItem-box">{{ recordTitleData.useSec }}</div>
      <!-- 開始時間 -->
      <div class="titleItem-box">{{ recordTitleData.startAt }}</div>
      <!-- 結束時間 -->
      <div class="titleItem-box">{{ recordTitleData.endAt }}</div>
    </div>

    <!-- 歷程列表 -->
    <ContestGameRecordListItem
      v-for="(recordData, index) in recordList.slice(0, pageSize)"
      :key="index"
      :userInfo="userInfo"
      :recordData="recordData"
      :recordType="recordType"
    />

    <!-- 頁籤 -->
    <div>
      <el-pagination
        layout="prev, pager, next"
        :total="totalCount"
        :page-size="pageSize"
        :current-page="currentPage"
        :hide-on-single-page="true"
        @current-change="refresh"
      ></el-pagination>
    </div>

    <!-- 查無歷程資訊 -->
    <div bg="[#ECE7D1]" text="[#878787]" p="b-10 t-10" v-if="recordList.length === 0">
      {{ textData.noRecordListData }}
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import ContestGameRecordListItem from './ContestGameRecordListItem.vue';
import { ContestGameRecordData, ContestGameRecordUserInfo } from '@/helper/interface/Profile';
import { ContestGameRecordType } from '@/helper/enum/TeacherAdmin';
import { contestGameRecordAPI } from '@/api/profile';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { Message } from '@/helper/class/Common';
import UIHelper from '@/views/H5/Helper/UIHelper';

@Component({
  components: {
    ContestGameRecordListItem,
  },
})
export default class ContestGameRecordList extends Vue {
  /** 學習歷程目標uid */
  @Prop() public uid!: number;
  /** 歷程類型 */
  @Prop() public recordType!: ContestGameRecordType;

  /** html引用 */
  private UIHelper = UIHelper;
  private ContestGameRecordType = ContestGameRecordType;

  /** 個人資料 */
  private userInfo!: ContestGameRecordUserInfo;

  /** 歷程資料 */
  private recordList: ContestGameRecordData[] = [];

  /** 總資料數 */
  private totalCount: number = 0;

  /** 當前頁數 */
  private currentPage: number = 0;

  /** 每頁顯示數量 */
  private readonly pageSize: number = 6;

  /** 顯示用文字 */
  private readonly recordTitleData = {
    school: '學校',
    class: '班級',
    name: '姓名',
    title: '賽事名稱',
    teamType: '賽事類型',
    subject_groupings_name: '科目',
    semesterYear: '學年度',
    grade: '年級',
    publisher_name: '版本',
    total: '總答題數',
    correct: '答對數',
    unAnswer: '未作答數',
    useSec: '總答題時間(秒)',
    startAt: '開始時間',
    endAt: '結束時間',
  };

  private textData = {
    noRecordListData: '查無此學生歷程紀錄',
  };

  mounted() {
    this.refresh(1);
  }

  /** 刷新歷程頁面
   * @param pageIndex 目標頁數, 從1開始
   */
  public async refresh(pageIndex: number): Promise<void> {
    // 組成封包
    const data = {
      uid: this.uid,
      tabOption: this.recordType,
      page: pageIndex - 1,
      pageSize: this.pageSize,
    };
    try {
      // API 取得學校排名
      const response: any = await contestGameRecordAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      // 回傳個資填入this.userInfo
      this.userInfo = response.userInfo;
      // 回傳資料填入this.recordList
      this.recordList = response.recordList;
      // 刷新頁碼
      this.totalCount = response.totalCount;
      this.currentPage = pageIndex;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** uid 更新就refresh */
  @Watch('uid')
  private onUidUpdate(): void {
    this.refresh(1);
  }

  /** recordType 更新就refresh */
  @Watch('recordType')
  private onRecordTypeUpdate(): void {
    this.refresh(1);
  }
}
</script>
<style lang="scss" scoped>
.titleItem-box {
  background: #d2a845;
  color: #fff;
  padding: 10px;
  margin-top: 2px;
  margin-bottom: 2px;
}
</style>
