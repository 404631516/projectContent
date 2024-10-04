<template>
  <div>
    <!-- 查詢框 -->
    <StatisticSearchBar :searchBarSetting="searchBarSetting" :isDisableSearch="isDisableSearch" @onSearch="onSearch" />
    <!-- 圖表顯示區 -->
    <StatisticChartList v-model="isDisableSearch" :searchData="searchData" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import { SearchBarSetting, SearchData } from '@/helper/interface/TeacherAdmin';
import { Message } from '@/helper/class/Common';
import { CountyType, ResponseState, UserRole } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { heroj7GetCountyId } from '@/api/BackEndManagementStatisticReport';
import { searchOptionData } from '@/components/BackEndManagement/StatisticReport/SearchOptionData';
import StatisticSearchBar from '@/components/BackEndManagement/StatisticReport/StatisticSearchBar.vue';
import StatisticChartList from '@/components/BackEndManagement/StatisticReport/StatisticChartList.vue';

@Component({
  components: {
    GeneralBanner,
    StatisticSearchBar,
    StatisticChartList,
  },
})
export default class BackEndManagementStatisticReport extends Vue {
  /** 搜尋圖表設定 */
  private searchBarSetting: SearchBarSetting = {
    /** 固定學校 ID */
    fixSchool: -1,
    /** 固定行政區 ID */
    fixCounty: CountyType.None,
    /** 可搜尋學校 */
    searchOption: [],
  };
  /** 搜尋資料 */
  private searchData: SearchData = {} as SearchData;

  /** 可否搜尋 */
  private isDisableSearch = false;

  /**圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };

  /** 文字資料 */
  private textData = {
    'shu-ju-bao-biao': '數據報表',
  };

  async created() {
    // 設定使用者可選取搜尋選項
    this.searchBarSetting.searchOption = searchOptionData.filter((searchData) => {
      return searchData.userRole.includes(this.$$store.getters.userAuthority);
    });

    // 取得使用者行政區
    if (this.$$store.getters.userAuthority === UserRole.MYR) {
      this.searchBarSetting.fixCounty = await this.getHeroj7GetCountyId();
    }
  }

  /** 取得使用者行政區 */
  private async getHeroj7GetCountyId(): Promise<CountyType> {
    try {
      // API 取得使用者行政區
      const res: any = await heroj7GetCountyId.fetch({});
      if (res.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(res.result, res.resMessage);
      }

      return res.countyId;
    } catch (e) {
      Message.error(`${e}`);
      return CountyType.None;
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
