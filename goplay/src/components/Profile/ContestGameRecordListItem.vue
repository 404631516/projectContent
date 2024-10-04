<template>
  <div
    class="grid gap-x-1"
    :class="
      recordType === ContestGameRecordType.AnswerRecord
        ? 'grid-cols-[10fr,10fr,10fr,12fr,8fr,5fr,8fr,5fr,8fr,8fr,8fr,8fr,10fr,12fr,12fr]'
        : 'grid-cols-[10fr,10fr,10fr,12fr,8fr,6fr,6fr,6fr,10fr,12fr,12fr]'
    "
  >
    <!-- 學校 -->
    <div class="item-box">{{ schoolText }}</div>
    <!-- 班級 -->
    <div class="item-box">{{ classText }}</div>
    <!-- 姓名 -->
    <div class="item-box">{{ userInfo.name }}</div>
    <!-- 賽事名稱 -->
    <div class="item-box">{{ recordData.title }}</div>
    <!-- 賽事類型 -->
    <div class="item-box">{{ teamTypeText }}</div>
    <!-- 科目 -->
    <div class="item-box" v-if="recordType === ContestGameRecordType.AnswerRecord">{{ subjectGroupingsNameText }}</div>
    <!-- 學年 -->
    <div class="item-box" v-if="recordType === ContestGameRecordType.AnswerRecord">{{ semesterYearText }}</div>
    <!-- 年級 -->
    <div class="item-box" v-if="recordType === ContestGameRecordType.AnswerRecord">{{ gradeText }}</div>
    <!-- 版本 -->
    <div class="item-box" v-if="recordType === ContestGameRecordType.AnswerRecord">{{ publisherNameText }}</div>
    <!-- 總答題數 -->
    <div class="item-box">{{ recordData.total }}</div>
    <!-- 答對數 -->
    <div class="item-box">{{ recordData.correct }}</div>
    <!-- 未作答數 -->
    <div class="item-box">{{ recordData.unAnswer }}</div>
    <!-- 總答題時間(秒) -->
    <div class="item-box">{{ recordData.useSec }}</div>
    <!-- 開始時間 -->
    <div class="item-box">{{ getTimeText(recordData.startAt) }}</div>
    <!-- 結束時間 -->
    <div class="item-box">{{ getTimeText(recordData.endAt) }}</div>
  </div>
</template>
<script lang="ts">
import { TeamType } from '@/helper/enum/Common';
import { ContestGameRecordType } from '@/helper/enum/TeacherAdmin';
import { ContestGameRecordData, ContestGameRecordUserInfo } from '@/helper/interface/Profile';
import { toDayjs } from '@/manager/TimeSyncManager';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class ContestGameRecordListItem extends Vue {
  /** 歷程資料(個資) */
  @Prop() private userInfo!: ContestGameRecordUserInfo;
  /** 歷程資料 */
  @Prop() private recordData!: ContestGameRecordData;
  /** 歷程類型 */
  @Prop() private recordType!: ContestGameRecordType;

  /** html引用 */
  private UIHelper = UIHelper;
  private ContestGameRecordType = ContestGameRecordType;

  /** 文字資料 */
  private textData = {
    noSchoolText: '此身分未提供學校資訊',
    visitText: '拜訪',
  };

  /** 學校中文字 */
  private get schoolText(): string {
    if (this.userInfo.school === '') {
      return '使用第三方身分登入';
    }
    // 組合縣市及學校
    return UIHelper.combineCountySchool(this.userInfo.countyName, this.userInfo.school);
  }

  /** 班級中文字 */
  private get classText(): string {
    if (this.userInfo.class === '') {
      return '-';
    }
    return UIHelper.toChineseClass(this.userInfo.class);
  }

  /** 賽事類型中文字 */
  private get teamTypeText(): string {
    switch (this.recordData.teamType) {
      case TeamType.WebGame:
        return '答題挑戰';
      case TeamType.WorldBoss:
      case TeamType.AdlWorldBoss:
        return '魔王賽';
      default:
        return '未知賽事類型' + this.recordData.teamType.toString();
    }
  }

  /** 顯示用科目文字 */
  private get subjectGroupingsNameText(): string {
    if (this.recordData.subject_groupings_name === '') {
      return '-';
    }
    return this.recordData.subject_groupings_name;
  }

  /** 顯示用學年文字 */
  private get semesterYearText(): string {
    if (this.recordData.semesterYear === '') {
      return '-';
    }
    return this.recordData.semesterYear;
  }

  /** 顯示用年級文字 */
  private get gradeText(): string {
    if (this.recordData.grade <= 0) {
      return '-';
    }
    return UIHelper.toChineseGrade(this.recordData.grade);
  }

  /** 顯示用版本文字 */
  private get publisherNameText(): string {
    if (this.recordData.publisher_name === '') {
      return '-';
    }
    return this.recordData.publisher_name;
  }

  /** 顯示用時間格式轉換
   * @param date 開始/結束時間
   */
  private getTimeText(date: string): string {
    if (date == null) {
      return '未完成';
    }
    return toDayjs(date).format('YYYY-MM-DD HH:mm');
  }
}
</script>
<style lang="scss" scoped>
.item-box {
  background: #ece7d1;
  color: #878787;
  padding: 10px;
  margin-top: 2px;
  margin-bottom: 2px;
}
</style>
