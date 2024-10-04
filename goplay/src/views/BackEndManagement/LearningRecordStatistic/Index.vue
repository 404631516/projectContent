<template>
  <div>
    <LearningRecordSearchBar
      @onChangeStudentUID="pickedStudentUID = $event"
      @onChangeSearchType="pickedSearchType = $event"
    />
    <div v-if="pickedStudentUID !== -1 && pickedSearchType !== -1" m="x-auto t-30px b-20">
      <ContestGameRecordList :recordType="pickedSearchType" :uid="pickedStudentUID" p="6" />
    </div>
  </div>
</template>
<script lang="ts">
import LearningRecordSearchBar from '@/components/BackEndManagement/LearningRecordStatistic/LearningRecordSearchBar.vue';
import ContestGameRecordList from '@/components/Profile/ContestGameRecordList.vue';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import { ContestGameRecordType } from '@/helper/enum/TeacherAdmin';
import { Component, Vue } from 'vue-property-decorator';
@Component({ components: { LearningRecordSearchBar, GeneralBanner, ContestGameRecordList } })
export default class LearningRecordStatistic extends Vue {
  /** 選到的學生uid */
  private pickedStudentUID: number = -1;
  /** 選到的查詢項目 */
  private pickedSearchType: ContestGameRecordType = -1;

  /**圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };

  /** 文字資料 */
  private textData = {
    learningRecord: '學生學習歷程',
  };
}
</script>
