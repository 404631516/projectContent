<template>
  <div bg="[#FFF]">
    <StatisticSearchBar :searchBarSetting="searchBarSetting" :isDisableSearch="isDisableSearch" @onSearch="onSearch" />
    <!-- 圖表顯示區 -->
    <StatisticChartList v-model="isDisableSearch" :searchData="searchData" />
  </div>
</template>
<script lang="ts">
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import { Component, Vue } from 'vue-property-decorator';
import { Message } from '@/helper/class/Common';
import { UserRole, CountyType } from '@/helper/enum/Common';
import { SearchBarSetting, SearchData } from '@/helper/interface/TeacherAdmin';
import StatisticSearchBar from '@/components/BackEndManagement/StatisticReport/StatisticSearchBar.vue';
import { searchOptionData } from '@/components/BackEndManagement/StatisticReport/SearchOptionData';
import StatisticChartList from '@/components/BackEndManagement/StatisticReport/StatisticChartList.vue';

@Component({
  components: {
    GeneralBanner,
    StatisticSearchBar,
    StatisticChartList,
  },
})
export default class TeacherAdmin extends Vue {
  /** 搜尋圖表設定 */
  private searchBarSetting: SearchBarSetting = {
    /** 固定學校 */
    fixSchool: this.$$store.getters.userSchoolId,
    /** 固定行政區 */
    fixCounty: CountyType.None,
    /** 可搜尋選項 */
    searchOption: searchOptionData.filter((searchData) => searchData.userRole.includes(UserRole.TCH)),
  };

  /** 搜尋資料 */
  private searchData: SearchData = {} as SearchData;

  /**能否搜尋 */
  private isDisableSearch = false;

  /** 圖表資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };
  /** 文字資料 */
  private textData = {
    'jiao-shi-hou-tai': '教師後台',
  };

  created() {
    // 無學校教師防呆
    if (this.$$store.getters.hasSchool === false) {
      Message.warn('請確認身份是否具備學校資訊,目前無所屬學校!');
      setTimeout(() => {
        this.$router.push('/');
      }, 2000);
    }
  }

  /** 開始搜尋
   * @param searchData
   */
  private onSearch(searchData: SearchData): void {
    this.searchData = searchData;
  }
}
</script>
