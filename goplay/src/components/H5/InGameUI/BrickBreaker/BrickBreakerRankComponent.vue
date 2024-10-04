<template>
  <div class="grid grid-cols-[0.5fr,1fr,2fr,2fr,1.5fr] items-center" p="x-7.5 y-4 <sm:x-0" text="20px">
    <img v-if="rankData.rank === 1" :src="imgData.crown" class="w-8 object-contain" m="l-5 <sm:l-0" />
    <span
      class="col-start-2 <sm:(text-12px)"
      :class="{
        'text-30px text-[#F2BA0F]': rankData.rank === 1,
        'text-28px': rankData.rank === 2,
        'text-24px': rankData.rank === 3,
      }"
    >
      {{ rankToString(rankData.rank) }}
    </span>
    <span
      text="18px <sm:(12px)"
      :class="{
        'text-[#F2BA0F]': rankData.rank === 1,
      }"
    >
      {{ rankData.school }}
    </span>
    <span
      class="<sm:(text-12px)"
      :class="{
        'text-42px text-[#F2BA0F]': rankData.rank === 1,
        'text-35px': rankData.rank === 2,
        'text-28px': rankData.rank === 3,
      }"
    >
      {{ rankData.name }}
    </span>
    <span
      class="text-[#D69F05] <sm:(text-12px)"
      :class="rankData.rank === 1 ? 'text-30px' : rankData.rank === 2 ? 'text-26px' : 'text-24px'"
    >
      {{ rankData.score }}
      <span text="16px <sm:(12px)">{{ unit }}</span>
    </span>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { BrickBreakerScoreList } from '@/helper/interface/Game';

@Component({})
export default class BrickBreakerRankComponent extends Vue {
  /** 分數排名資料 */
  @Prop() private rankData!: BrickBreakerScoreList;
  /** 顯示單位 */
  @Prop() private unit!: string;

  /** 圖片資料 */
  private imgData = {
    crown: imgPath.crownIcon,
  };

  /** 數字轉排名
   *  @param value 數字
   */
  private rankToString(value: number): string {
    if (value < 0) {
      return '榜外';
    }

    return `第${value}名`;
  }
}
</script>
