<template>
  <ul m="b-5">
    <!-- 賽事名稱 -->
    <li data="GAME_TITLE" text="4xl left" p="y-3 x-[15%] <lg:x-[2.5%]">
      {{ contestListData.title }}
    </li>
    <!-- 魔王賽專用資訊 -->
    <li :class="contestStateClassName" v-if="isBoss" text="4xl left" p="y-3 x-[15%] <lg:x-[2.5%]">
      <!-- 賽事狀態 -->
      <span class="<sm:block">{{ contestStateName }}</span>
      <!-- 賽事開始結束時間 -->
      {{ contestActiveTime }}
    </li>
    <!-- 參與人數 -->
    <li text="2xl [#FFF] left" bg="[#353739]" p="y-3 x-[15%] <lg:x-[2.5%]">
      {{ textData.participateCount }}
      <span text="[#FDC221]">{{ contestListData.numberOfPlayer }}</span>
    </li>
    <!-- 賽事ID -->
    <li text="2xl [#FFF] left" bg="[#656565]" p="y-3 x-[15%] <lg:x-[2.5%]">
      {{ textData.contestIdTitle }}
      <span text="[#00CCCE]">{{ contestListData.id }}</span>
    </li>
  </ul>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ContestListData } from '@/helper/interface/Contest';
import { ContestStateType, ContestStateName } from '@/helper/enum/Common';
import { toDayjs } from '../../../manager/TimeSyncManager';

@Component({})
export default class GameInfo extends Vue {
  /** 賽事資料 */
  @Prop() private contestListData!: ContestListData;
  /** 是否為魔王賽 */
  @Prop() private isBoss!: boolean;

  /** 文字資料 */
  private textData = {
    participateCount: '已參與人數',
    contestIdTitle: '賽事ID',
  };

  /** 取得賽事狀態名稱 */
  private get contestStateName(): string {
    const nameKey = ContestStateType[this.contestListData.state];
    return Object.entries(ContestStateName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤類別';
  }

  /** 取得賽事狀態 CSS樣式 */
  private get contestStateClassName(): string {
    switch (this.contestListData.state) {
      case ContestStateType.NoApply:
        return 'bg-[#FFF] text-[666666]';
      case ContestStateType.OpenApply:
      case ContestStateType.StopApply:
        return 'bg-[#56e0e5] text-[#034856]';
      case ContestStateType.Progress:
      case ContestStateType.ComingSoon:
        return 'bg-[#a8fb57] text-[#28532d]';
      case ContestStateType.GameOver:
      case ContestStateType.RegistrationAndGame:
        return 'bg-[#ff6a6a] text-[#880202]';
      default:
        return 'bg-[#FFF] text-[666666]';
    }
  }

  /** 賽事遊戲時間 */
  private get contestActiveTime(): string {
    // 開始時間
    const gameStart = toDayjs(this.contestListData.gameStart).format('YYYY/MM/DD');

    // 結束時間
    const gameEnd = toDayjs(this.contestListData.gameEnd).format('YYYY/MM/DD');

    return `${gameStart} - ${gameEnd}`;
  }
}
</script>
