<template>
  <div bg="[#FFF]">
    <!-- 標題 -->
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <!-- 個人學習歷程 -->
    <div bg="[#FFF]">
      <!-- 歷程 -->
      <div p="10 <sm:1 <sm:t-5">
        <!-- 歷程類型按鈕 -->
        <div class="flex" p="l-5 <sm:l-0">
          <div
            v-for="(recordType, index) in recordTypeList"
            :key="index"
            :bg="activeRecordType === recordType ? '[#FFC43A]' : '[#FFEBB5]'"
            class="w-72 h-14 rounded-t-xl transform -skew-x-12 transition-all cursor-pointer"
            m="x-2"
            @click="activeRecordType = recordType"
          >
            <!-- 歷程類型名稱 -->
            <span
              class="h-full flex items-center justify-center transform skew-x-12 text-3xl <sm:text-xl transition-all"
              :text="activeRecordType === recordType ? '[#FFF]' : '[#D69F05]'"
            >
              {{ UIHelper.toChineseContestGameRecordType(recordType) }}
            </span>
          </div>
        </div>
        <!-- 歷程顯示 -->
        <div p="6" bg="[#F9F8F4]" border="t-8 solid [#FFBD4A]">
          <!-- 歷程內容 -->
          <ContestGameRecordList :uid="uid" :recordType="activeRecordType" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import ContestGameRecordList from '@/components/Profile/ContestGameRecordList.vue';
import { ContestGameRecordType } from '@/helper/enum/TeacherAdmin';
import UIHelper from '../H5/Helper/UIHelper';

@Component({
  components: {
    GeneralBanner,
    ContestGameRecordList,
  },
})
export default class Portfolio extends Vue {
  /** 自己的uid */
  private get uid(): number {
    return this.$$store.getters.userUid;
  }

  /** 選中學習歷程類型 */
  private activeRecordType: ContestGameRecordType = ContestGameRecordType.AnswerRecord;

  /** html引用 */
  private UIHelper = UIHelper;

  /** 歷程類型按鈕 清單 */
  private readonly recordTypeList: ContestGameRecordType[] = [
    ContestGameRecordType.AnswerRecord,
    ContestGameRecordType.ContestRecord,
  ];

  /** 文字資料 */
  private textData = {
    title: '我的學習歷程',
  };

  /** 圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };
}
</script>
