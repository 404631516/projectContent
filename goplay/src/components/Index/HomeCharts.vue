<template>
  <div p="y-2">
    <!-- 非手機版 -->
    <div class="flex justify-center">
      <PieChart
        v-show="!isShowPhone"
        :title="ChartTarget.SubjectUnitPlayedRank"
        :chartData="heroj7SubjectUnitPlayedRank"
      />
      <div class="flex flex-col justify-center gap-3" text="1.2rem left [#666666]" style="width: 400px; height: 300px">
        <div class="flex gap-1 items-center">
          <i class="el-icon-user-solid" text="before:[#FDC221] 1.8rem"></i>
          {{ textData.totalUsagePlatformLastWeek }}
          <span text="[#BB8344] 1.8rem">{{ homeChartCount.useCount }}</span>
          {{ textData.totalVisits }}
        </div>
        <div class="flex gap-1 items-center">
          <i class="el-icon-time" text="before:[#FDC221] 1.8rem"></i>
          {{ textData.totalUsageHoursPlatformLastWeek }}
          <span text="[#BB8344] 1.8rem">{{ homeChartCount.onlineCount }}</span>
          {{ textData.minute }}
        </div>
      </div>
    </div>
    <div class="flex justify-evenly" v-show="!isShowPhone">
      <LineChart :title="ChartTarget.ContestDailyRecord" :chartData="contestDailyRecord" />
      <LineChart :title="ChartTarget.LoginDailyRecord" :chartData="loginDailyRecord" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { HomeChartCount, HomeChartData } from '@/helper/interface/Index';
import LineChart from '@/components/TeacherAdmin/LineChart.vue';
import PieChart from '@/components/TeacherAdmin/PieChart.vue';
import { ChartTarget } from '@/helper/enum/TeacherAdmin';
import { LineChartData, PieChartData } from '@/helper/interface/TeacherAdmin';
import { toDayjs } from '../../manager/TimeSyncManager';

@Component({
  components: {
    LineChart,
    PieChart,
  },
})
export default class HomeCharts extends Vue {
  /** 圖表資料 */
  @Prop() private homeChartData!: HomeChartData[];

  @Prop() private homeChartCount!: HomeChartCount;
  /** 是否顯示手機板樣式 */
  @Prop() private isShowPhone!: boolean;

  private ChartTarget = ChartTarget;

  /** 文字資料 */
  private textData = {
    totalUsagePlatformLastWeek: '平台上週總使用累計',
    totalUsageHoursPlatformLastWeek: '平台上週總使用時數達',
    totalVisits: '人次',
    minute: '分鐘',
  };

  /** 整理圖表資料賽事使用次數 */
  private get contestDailyRecord(): LineChartData | undefined {
    const contestDailyRecordList = this.homeChartData.find(
      (chartData) => chartData.title === ChartTarget.ContestDailyRecord
    );
    if (contestDailyRecordList == null) {
      return undefined;
    }

    const yDataList: string[] = [];
    return {
      x: contestDailyRecordList.chartData.map<string>((contestData) => {
        yDataList.push(contestData.count);
        return toDayjs(`${contestData.dayId}`).format('YYYY-MM-DD');
      }),
      yData: [
        {
          name: '賽事使用',
          data: yDataList,
          type: 'line',
          smooth: true,
          color: '#DE8A20',
          areaStyle: {
            color: '#EEA73D',
          },
        },
      ],
      tooltipUnit: '次數',
      yUnit: '{value}次',
    };
  }

  /** 整理圖表資料使用者登入次數 */
  private get loginDailyRecord(): LineChartData | undefined {
    const loginDailyRecordList = this.homeChartData.find(
      (chartData) => chartData.title === ChartTarget.LoginDailyRecord
    )?.chartData;
    if (!loginDailyRecordList) {
      return undefined;
    }
    const yDataList: string[] = [];
    return {
      x: loginDailyRecordList.map((loginDailyData) => {
        yDataList.push(loginDailyData.count);
        return toDayjs(`${loginDailyData.dayId}`).format('YYYY-MM-DD');
      }),
      yData: [
        {
          name: '使用者登入',
          data: yDataList,
          type: 'line',
          smooth: true,
          color: '#28A7A7 ',
          areaStyle: {
            color: '#3DEEEE',
          },
        },
      ],
      tooltipUnit: '次數',
      yUnit: '{value}次',
    };
  }

  /** 整理圖表資料學習知識點 */
  private get heroj7SubjectUnitPlayedRank(): PieChartData | undefined {
    const heroj7SubjectUnitPlayedRankRecordList = this.homeChartData.find(
      (chartData) => chartData.title === ChartTarget.SubjectUnitPlayedRank
    );
    if (!heroj7SubjectUnitPlayedRankRecordList) {
      return undefined;
    }

    return {
      data: heroj7SubjectUnitPlayedRankRecordList.chartData.map((subjectData) => {
        return { name: subjectData.name, value: subjectData.count };
      }),
      tooltipUnit: '<b class="text-xl">{b}</b> : {c} ({d} %)人次',
      isEmpty: false,
    };
  }
}
</script>
