<template>
  <div>
    <h4 class="max-w-7xl chart-title" m="x-auto y-5" font="bold" text="left [#D69F05] 2rem">
      {{ chartTitle }}
    </h4>
    <!-- 圖表列表 -->
    <div class="flex flex-wrap gap-2.5rem <lg:gap-1rem max-w-7xl" m="x-auto">
      <template v-for="chartData in chartList">
        <BarChart
          v-if="chartData.type === ChartType.Bar"
          :key="chartData.title"
          :title="chartData.title"
          :chartData="chartData.data"
        />
        <LineChart
          v-if="chartData.type === ChartType.Line"
          :key="chartData.title"
          :title="chartData.title"
          :chartData="chartData.data"
        />
        <PieChart
          v-if="chartData.type === ChartType.Pie"
          :key="chartData.title"
          :title="chartData.title"
          :chartData="chartData.data"
        />
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, VModel } from 'vue-property-decorator';
import LineChart from '@/components/TeacherAdmin/LineChart.vue';
import BarChart from '@/components/TeacherAdmin/BarChart.vue';
import PieChart from '@/components/TeacherAdmin/PieChart.vue';
import {
  BarChartData,
  ChartList,
  SearchAPIResponse,
  LineChartData,
  LoginCountList,
  LoginUserList,
  OnlineTimeDataList,
  PieChartData,
  PostCommentList,
  SearchData,
  SubjectTimeList,
  TeacherAdminApiData,
} from '@/helper/interface/TeacherAdmin';
import { ChartTarget, ChartType, ComType } from '@/helper/enum/TeacherAdmin';
import {
  GATagActionIdType,
  GATagActionStrType,
  GATagCategoryIdType,
  GATagCategoryStrType,
  ResponseState,
  UserRole,
} from '@/helper/enum/Common';
import { handleAPIError, sendGAEvent } from '@/helper/fnc/common';
import { Message } from '@/helper/class/Common';
import {
  heroj7GetDBForumDataCount,
  heroj7GetDBLoginCount,
  heroj7GetDBLoginUser,
  heroj7GetDBOnlineTime,
  heroj7GetDBStartData,
  heroj7GetDBSubjectTime,
} from '@/api/TeacherAdmin';
import {
  heroj7AdminGetLoginCountByCounty,
  heroj7AdminGetLoginCountBySchool,
  heroj7AdminGetOnlineTimeByCounty,
  heroj7AdminGetOnlineTimeBySchool,
  heroj7GetAdminStartData,
} from '@/api/BackEndManagementStatisticReport';
import { ApiCountyList, ApiSchoolList } from '@/helper/interface/BackEndManagementStatisticReport';

enum APIResponseKey {
  loginUserList = 'loginUserList',
  loginCountList = 'loginCountList',
  postCommentList = 'postCommentList',
  onlineTimeDataList = 'onlineTimeDataList',
  subjectTimeList = 'subjectTimeList',
  loginCountBySchoolList = 'loginCountBySchoolList',
  onlineTimeDataBySchoolList = 'onlineTimeDataBySchoolList',
  loginCountByCountyList = 'loginCountByCountyList',
  onlineTimeDataByCountyList = 'onlineTimeDataByCountyList',
}

@Component({
  components: {
    LineChart,
    BarChart,
    PieChart,
  },
})
export default class StatisticChartList extends Vue {
  /** 搜尋需要的資料 */
  @Prop(Object) readonly searchData!: SearchData;
  /** 是否可搜尋 */
  @VModel({ type: Boolean }) private isDisableSearch!: boolean;

  /** 圖表列表 */
  private chartList: ChartList[] = [];

  /** 圖表 title */
  private chartTitle = '';

  /** 圖表類型 */
  private ChartType = ChartType;

  created() {
    // 開始時的預設搜尋選項
    this.setChartList([ChartTarget.LoginCount, ChartTarget.OnlineTime, ChartTarget.ForumDataCount]);

    // 連點防呆
    this.isDisableSearch = true;

    // 第一筆搜尋
    switch (this.$$store.getters.userAuthority) {
      // 管理者
      case UserRole.SUP:
        // 設定 title
        this.setChartTitle(ComType.Country);
        // 管理者預設搜尋選項
        this.setChartList([ChartTarget.CountyLoginCount, ChartTarget.CountyOnlineTime]);
        // 開始第一次搜尋
        this.firstAdminSearch();
        break;
      // 縣市管理者
      case UserRole.MYR:
        // 設定 title
        this.setChartTitle(ComType.City);
        // 縣市管理者預設搜尋選項
        this.setChartList([ChartTarget.SchoolLoginCount, ChartTarget.SchoolOnlineTime]);
        // 開始第一次搜尋
        this.firstAdminSearch();
        break;
      // 老師
      case UserRole.TCH:
        // 設定 title
        this.setChartTitle(ComType.School);
        // 老師預設搜尋選項
        this.setChartList([ChartTarget.LoginUser, ChartTarget.SubjectTime]);
        // 開始第一次搜尋
        this.firstTeacherSearch();
        break;
      default:
        console.error(`unknown userAuthority=${this.$$store.getters.userAuthority}`);
        Message.error('沒有權限');
        return;
    }
  }

  /** 第一次管理者搜尋 */
  private async firstAdminSearch(): Promise<void> {
    try {
      // API 數據報表第一包
      const response: any = await heroj7GetAdminStartData.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 處理回傳資料
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 第一次教師搜尋 */
  private async firstTeacherSearch(): Promise<void> {
    try {
      // API 取得後端統計數據
      const response: any = await heroj7GetDBStartData.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // GA 取得首頁總資訊
      await sendGAEvent(
        GATagCategoryIdType.Heroj7GetDBStartData,
        GATagActionIdType.Heroj7GetDBStartData,
        '',
        this.$gtag,
        GATagActionStrType.Heroj7GetDBStartData,
        GATagCategoryStrType.Heroj7GetDBStartData
      );

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 搜尋
   * @param searchData
   */
  private onSearch(searchData: SearchData): void {
    // 設定圖表標題
    this.setChartTitle(searchData.apiData.comType);

    // 清空圖表列表
    this.chartList.splice(0);

    // 創造 chartList
    this.setChartList(searchData.searchOption);

    // 設定不能搜尋
    this.isDisableSearch = true;

    searchData.searchOption.map((searchOptionListData) => {
      switch (searchOptionListData) {
        // 登入人數
        case ChartTarget.LoginUser:
          this.getHeroj7GetDBLoginUser(searchData.apiData);
          break;
        // 登入次數
        case ChartTarget.LoginCount:
          this.getHeroj7GetDBLoginCount(searchData.apiData);
          break;
        // 星際論壇
        case ChartTarget.ForumDataCount:
          this.getHeroj7GetDBForumDataCount(searchData.apiData);
          break;
        // 學習時數
        case ChartTarget.OnlineTime:
          this.getHeroj7GetDBOnlineTime(searchData.apiData);
          break;
        // 學習比例
        case ChartTarget.SubjectTime:
          this.getHeroj7GetDBSubjectTime(searchData.apiData);
          break;
        // 學校登入次數
        case ChartTarget.SchoolLoginCount:
          this.getHeroj7AdminGetLoginCountBySchool(searchData.apiData);
          break;
        // 學校學習時數
        case ChartTarget.SchoolOnlineTime:
          this.getHeroj7AdminGetOnlineTimeBySchool(searchData.apiData);
          break;
        // 行政區登入次數
        case ChartTarget.CountyLoginCount:
          this.getHeroj7AdminGetLoginCountByCounty(searchData.apiData);
          break;
        // 行政區學習時數
        case ChartTarget.CountyOnlineTime:
          this.getHeroj7AdminGetOnlineTimeByCounty(searchData.apiData);
          break;
        default:
          console.error('搜尋類型錯誤');
      }
    });
  }

  /** 取得總登入人數
   * @param apiData
   */
  private async getHeroj7GetDBLoginUser(apiData: TeacherAdminApiData): Promise<void> {
    try {
      // API 取得總登入人數
      const response: any = await heroj7GetDBLoginUser.fetch(apiData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // GA 總登入人數事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7Login,
        GATagActionIdType.Heroj7GetDBLoginUser,
        '',
        this.$gtag,
        GATagActionStrType.Heroj7GetDBLoginUser,
        GATagCategoryStrType.Heroj7GetDBLoginUser
      );

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得總登入次數
   * @param apiData
   */
  private async getHeroj7GetDBLoginCount(apiData: TeacherAdminApiData): Promise<void> {
    try {
      // API 取得總登入次數
      const response: any = await heroj7GetDBLoginCount.fetch(apiData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // GA 總登入次數事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7Login,
        GATagActionIdType.Heroj7GetDBLoginCount,
        '',
        this.$gtag,
        GATagActionStrType.Heroj7GetDBLoginCount,
        GATagCategoryStrType.Heroj7GetDBLoginCount
      );

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得星際論壇發問回答次數
   * @param apiData
   */
  private async getHeroj7GetDBForumDataCount(apiData: TeacherAdminApiData): Promise<void> {
    try {
      // API 取得星際論壇發問回答次數
      const response: any = await heroj7GetDBForumDataCount.fetch(apiData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // GA 取得星際論壇發問回答次數事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7DataCount,
        GATagActionIdType.Heroj7GetDBForumDataCount,
        ChartTarget.ForumDataCount,
        this.$gtag,
        GATagActionStrType.Heroj7GetDBForumDataCount,
        GATagCategoryStrType.Heroj7GetDBForumDataCount
      );

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得在線總時間(取代學習時數)
   * @param apiData
   */
  private async getHeroj7GetDBOnlineTime(apiData: TeacherAdminApiData): Promise<void> {
    try {
      // API 取得在線總時間(取代學習時數)
      const response: any = await heroj7GetDBOnlineTime.fetch(apiData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // GA 總在線時間事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7Time,
        GATagActionIdType.Heroj7GetDBOnlineTime,
        '',
        this.$gtag,
        GATagActionStrType.Heroj7GetDBOnlineTime,
        GATagCategoryStrType.Heroj7GetDBOnlineTime
      );

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得各科目學習時數
   * @param apiData
   */
  private async getHeroj7GetDBSubjectTime(apiData: TeacherAdminApiData): Promise<void> {
    try {
      // API 取得各科目學習時數
      const response: any = await heroj7GetDBSubjectTime.fetch(apiData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // GA 取得各科目學習時數事件
      await sendGAEvent(
        GATagCategoryIdType.Heroj7Time,
        GATagActionIdType.Heroj7GetDBSubjectTime,
        '',
        this.$gtag,
        GATagActionStrType.Heroj7GetDBSubjectTime,
        GATagCategoryStrType.Heroj7GetDBSubjectTime
      );

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得學校登入次數
   * @param apiData
   */
  private async getHeroj7AdminGetLoginCountBySchool(apiData: TeacherAdminApiData): Promise<void> {
    // 組成封包
    const data = {
      countyId: apiData.comValue1,
      startDay: apiData.startDay,
      endDay: apiData.endDay,
    };

    try {
      // API 取得學校登入次數
      const response: any = await heroj7AdminGetLoginCountBySchool.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得學校學習時數
   * @param apiData
   */
  private async getHeroj7AdminGetOnlineTimeBySchool(apiData: TeacherAdminApiData): Promise<void> {
    // 組成封包
    const data = {
      countyId: apiData.comValue1,
      startDay: apiData.startDay,
      endDay: apiData.endDay,
    };

    try {
      // API 取得學校學習時數
      const response: any = await heroj7AdminGetOnlineTimeBySchool.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得縣市登入次數
   * @param apiData
   */
  private async getHeroj7AdminGetLoginCountByCounty(apiData: TeacherAdminApiData): Promise<void> {
    try {
      // API 取得縣市登入次數
      const response: any = await heroj7AdminGetLoginCountByCounty.fetch(apiData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得縣市學習時數
   * @param apiData
   */
  private async getHeroj7AdminGetOnlineTimeByCounty(apiData: TeacherAdminApiData): Promise<void> {
    try {
      // API 取得縣市學習時數
      const response: any = await heroj7AdminGetOnlineTimeByCounty.fetch(apiData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 設定搜尋結果
      this.onHandleSearchResponse(response);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 處理資料
   * @param response
   */
  private onHandleSearchResponse(response: SearchAPIResponse): void {
    this.chartList.forEach((chartData) => {
      switch (chartData.title) {
        // 登入人數
        case ChartTarget.LoginUser:
          if (response.hasOwnProperty(APIResponseKey.loginUserList)) {
            chartData.data = this.getLoginUser(response[APIResponseKey.loginUserList]);
          }
          break;
        // 登入次數
        case ChartTarget.LoginCount:
          if (response.hasOwnProperty(APIResponseKey.loginCountList)) {
            chartData.data = this.getLoginCount(response[APIResponseKey.loginCountList]);
          }
          break;
        // 星際論壇問答
        case ChartTarget.ForumDataCount:
          if (response.hasOwnProperty(APIResponseKey.postCommentList)) {
            chartData.data = this.getPostComment(response[APIResponseKey.postCommentList]);
          }
          break;
        // 學習時數
        case ChartTarget.OnlineTime:
          if (response.hasOwnProperty(APIResponseKey.onlineTimeDataList)) {
            chartData.data = this.getOnlineTime(response[APIResponseKey.onlineTimeDataList]);
          }
          break;
        // 學習比例
        case ChartTarget.SubjectTime:
          if (response.hasOwnProperty(APIResponseKey.subjectTimeList)) {
            chartData.data = this.getSubjectTime(response[APIResponseKey.subjectTimeList]);
          }
          break;
        // 學校登入次數
        case ChartTarget.SchoolLoginCount:
          if (response.hasOwnProperty(APIResponseKey.loginCountBySchoolList)) {
            chartData.data = this.getLoginCountBySchool(response[APIResponseKey.loginCountBySchoolList]);
          }
          break;
        // 學校學習時數
        case ChartTarget.SchoolOnlineTime:
          if (response.hasOwnProperty(APIResponseKey.onlineTimeDataBySchoolList)) {
            chartData.data = this.getOnlineTimeBySchool(response.onlineTimeDataBySchoolList);
          }
          break;
        // 行政區登入次數
        case ChartTarget.CountyLoginCount:
          if (response.hasOwnProperty(APIResponseKey.loginCountByCountyList)) {
            chartData.data = this.getLoginCountByCounty(response[APIResponseKey.loginCountByCountyList]);
          }
          break;
        // 行政區學習時數
        case ChartTarget.CountyOnlineTime:
          if (response.hasOwnProperty(APIResponseKey.onlineTimeDataByCountyList)) {
            chartData.data = this.getOnlineTimeByCounty(response[APIResponseKey.onlineTimeDataByCountyList]);
          }
          break;
        default:
          console.error('onHandleSearchDate - chartData.title not find');
      }
    });

    // 是否完成全部搜尋
    const isComplete = this.chartList.findIndex((chartDate) => chartDate.data === undefined) === -1;

    // 完成搜尋時聚焦
    if (isComplete) {
      const chartTitle = document.querySelector('.chart-title')! as HTMLDivElement;
      if (chartTitle == null) {
        return;
      }
      document.querySelector('.main')!.scrollTo({ top: chartTitle.offsetTop, behavior: 'smooth' });
    }

    // 設定是否可以再次搜索
    this.isDisableSearch = isComplete === false;
  }

  /** 整理登入人數圖表資料
   * @param loginUserList
   */
  private getLoginUser(loginUserList: LoginUserList[]): BarChartData {
    const yDataList: number[] = [];
    return {
      x: loginUserList.map((loginUserData: LoginUserList) => {
        yDataList.push(loginUserData.count);
        return loginUserData.dayId;
      }),
      yData: [{ name: '登入人數', data: yDataList, color: '#E96E61', type: 'bar' }],
      tooltipUnit: '次數',
      yUnit: '{value} 次',
    };
  }

  /**整理登入次數圖表資料
   * @param loginCountList
   */
  private getLoginCount(loginCountList: LoginCountList[] = []): BarChartData {
    const yDataList: number[] = [];
    return {
      x: loginCountList.map((loginCountData: LoginCountList) => {
        yDataList.push(loginCountData.count);
        return loginCountData.dayId;
      }),
      yData: [{ name: '登入次數', data: yDataList, color: '#E4B836', type: 'bar' }],
      tooltipUnit: '次數',
      yUnit: '{value} 次',
    };
  }

  /**  整理星際論壇圖表資料
   * @param postCommentList
   */
  private getPostComment(postCommentList: PostCommentList[] = []): LineChartData {
    const postCommentChartData: LineChartData = {
      x: [],
      yData: [
        {
          name: '發問',
          data: [],
          type: 'line',
          smooth: true,
          color: '#2085DE ',
        },
        {
          name: '回答',
          data: [],
          type: 'line',
          smooth: true,
          color: '#DE8A20',
        },
      ],
      tooltipUnit: '次',
      yUnit: '{value}次',
    };
    postCommentList.map((postCommentData: PostCommentList) => {
      postCommentChartData.x.push(postCommentData.dayId);
      if (Array.isArray(postCommentChartData.yData)) {
        postCommentChartData.yData[0].data!.push(postCommentData.postCount);
        postCommentChartData.yData[1].data!.push(postCommentData.commentCount);
      }
    });
    return postCommentChartData;
  }

  /**  整理學習時數圖表資料
   * @param onlineTimeList
   */
  private getOnlineTime(onlineTimeList: OnlineTimeDataList[] = []): BarChartData {
    const yDataList: number[] = [];
    return {
      x: onlineTimeList.map((onlineTimeData: OnlineTimeDataList) => {
        yDataList.push(onlineTimeData.count);
        return onlineTimeData.dayId;
      }),
      yData: [{ name: '學習時數', data: yDataList, color: '#36C4E4', type: 'bar' }],
      tooltipUnit: '次數',
      yUnit: '{value} 分',
    };
  }

  /**整理學習比例圖表
   * @param subjectTimeList
   */
  private getSubjectTime(subjectTimeList: SubjectTimeList[] = []): PieChartData {
    const subjectChartData: PieChartData = {
      data: [],
      tooltipUnit: '<b class="text-xl">{b}</b> : {c} ({d} %)人次',
      isEmpty: true,
    };
    subjectTimeList.map((subjectTimeData: SubjectTimeList) => {
      if (subjectTimeData.count > 0) {
        subjectChartData.isEmpty = false;
      }
      subjectChartData.data.push({
        value: subjectTimeData.count,
        name: subjectTimeData.name,
      });
    });
    return subjectChartData;
  }

  /** 整理學校登入次數圖表
   * @param loginCountBySchoolList
   */
  private getLoginCountBySchool(loginCountBySchoolList: ApiSchoolList[] = []): BarChartData {
    const yDataList: number[] = [];
    return {
      x: loginCountBySchoolList.map((loginCountBySchoolData: ApiSchoolList) => {
        yDataList.push(loginCountBySchoolData.count);
        return loginCountBySchoolData.schoolName;
      }),
      yData: [{ name: '各學校登入次數', data: yDataList, color: '#DB61E9', type: 'bar' }],
      tooltipUnit: '次數',
      yUnit: '{value} 次',
    };
  }

  /** 整理學校學習時數圖表
   * @param onlineTimeBySchoolList
   */
  private getOnlineTimeBySchool(onlineTimeBySchoolList: ApiSchoolList[] = []): BarChartData {
    const yDataList: number[] = [];
    return {
      x: onlineTimeBySchoolList.map((onlineTimeBySchoolData: ApiSchoolList) => {
        yDataList.push(onlineTimeBySchoolData.count);
        return onlineTimeBySchoolData.schoolName;
      }),
      yData: [{ name: '各學校學習時數', data: yDataList, color: '#DB61E9', type: 'bar' }],
      tooltipUnit: '分鐘',
      yUnit: '{value} 分',
    };
  }

  /** 整理縣市登入次數圖表資料
   * @param loginCountByCountyList
   */
  private getLoginCountByCounty(loginCountByCountyList: ApiCountyList[] = []): BarChartData {
    const yDataList: number[] = [];
    return {
      x: loginCountByCountyList.map((loginCountByCountyData: ApiCountyList) => {
        yDataList.push(loginCountByCountyData.count);
        return loginCountByCountyData.countyName;
      }),
      yData: [{ name: '各縣市登入次數', data: yDataList, color: '#E4B836', type: 'bar' }],
      tooltipUnit: '次數',
      yUnit: '{value} 次',
    };
  }
  /** 整理縣市學習時數圖表資料
   * @param onlineTimeByCountyList
   */
  private getOnlineTimeByCounty(onlineTimeByCountyList: ApiCountyList[] = []): BarChartData {
    const yDataList: number[] = [];
    return {
      x: onlineTimeByCountyList.map((onlineTimeByCountyData: ApiCountyList) => {
        yDataList.push(onlineTimeByCountyData.count);
        return onlineTimeByCountyData.countyName;
      }),
      yData: [{ name: '各縣市學習時數', data: yDataList, color: '#E96E61', type: 'bar' }],
      tooltipUnit: '分鐘',
      yUnit: '{value} 分',
    };
  }

  /** 設定圖表 title
   * @param comType
   */
  private setChartTitle(comType: ComType): void {
    switch (comType) {
      case ComType.Student:
        this.chartTitle = '學生數據';
        break;
      case ComType.Class:
        this.chartTitle = '班級數據';
        break;
      case ComType.School:
        this.chartTitle = '全校數據';
        break;
      case ComType.City:
        this.chartTitle = '全縣市數據';
        break;
      case ComType.Country:
        this.chartTitle = '全國數據';
        break;
      default:
        console.error(`invalid comType=${comType}`);
    }
  }

  /** 創造 chartList
   * @param titleList
   */
  private setChartList(titleList: ChartTarget[]): void {
    titleList.forEach((title) => {
      switch (title) {
        case ChartTarget.LoginCount:
        case ChartTarget.LoginUser:
        case ChartTarget.OnlineTime:
        case ChartTarget.SchoolLoginCount:
        case ChartTarget.SchoolOnlineTime:
        case ChartTarget.CountyLoginCount:
        case ChartTarget.CountyOnlineTime:
          this.chartList.push({
            type: ChartType.Bar,
            title,
            data: undefined,
          });
          break;
        case ChartTarget.ForumDataCount:
          this.chartList.push({
            type: ChartType.Line,
            title,
            data: undefined,
          });
          break;
        case ChartTarget.SubjectTime:
          this.chartList.push({
            type: ChartType.Pie,
            title,
            data: undefined,
          });
          break;
        default:
          console.error('setChartList - titleList not find');
      }
    });
  }

  /** 觀察搜尋資料變化
   * @param searchData
   */
  @Watch('searchData')
  private search(searchData: SearchData): void {
    this.onSearch(searchData);
  }
}
</script>
<style scoped></style>
