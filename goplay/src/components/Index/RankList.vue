<template>
  <div m="y-2 x-5 <sm:(x-auto y-0)" text="[#A5A5A5]" class="items-center">
    <!-- 排行榜標題 -->
    <h4 class="font-bold" text="2xl">{{ rankData.title }}</h4>
    <!-- 有排名資料 -->
    <template v-if="rankData.rankList.length !== 0">
      <ul>
        <li
          v-for="(item, key) in rankData.rankList"
          :key="key"
          class="flex justify-evenly items-center h-15"
          p="y-2"
          border="b-1 solid [#B2B2B2] last:none"
          text="xl"
        >
          <!-- 名次 -->
          <div class="w-1/10 leading-16">
            <!-- 前三名顯示圖片 -->
            <img v-if="item.rank <= 3" m="auto" :src="rankImgUrl[item.rank - 1]" />
            <!-- 非前三名顯示排名 -->
            <span v-else>{{ item.rank }}</span>
          </div>
          <!-- 姓名或名稱 -->
          <div class="flex items-center truncate justify-center" :class="item.schoolName ? 'w-3/10' : 'w-7/10'">
            {{ item.name }}
          </div>
          <!-- 學校和班級 -->
          <div class="w-4/10 flex flex-col justify-center" v-if="item.schoolName">
            <span class="truncate">{{ combineCountySchool(item.county, item.schoolName) }}</span>
            {{ item.className }}
          </div>
          <!-- 分數或次數 -->
          <div class="w-2/10 leading-16 truncate">
            <span text="[#BB8344]">{{ item.count }}</span>
            <span text="[16px]">{{ item.countUnit }}</span>
          </div>
        </li>
      </ul>
    </template>
    <!-- 無排名資料 -->
    <template v-else>
      <div class="flex-pos" p="b-5" text="xl">{{ textData.noRankData }}</div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PublicRankData, PublicRankList } from '@/helper/interface/Index';
import imgPath from '@/config/imgPath/imgPath';
import UIHelper from '@/views/H5/Helper/UIHelper';

@Component({})
export default class RankList extends Vue {
  /** 是否為手機模式 */
  @Prop() private isShowPhone!: boolean;
  /** 排行榜資料 */
  @Prop() private rankData!: PublicRankList;

  /** 文字資料 */
  private textData = {
    noRankData: '尚無排名資料',
  };

  /** 名次圖片路徑 */
  private rankImgUrl: string[] = [
    // 第一名:皇冠
    imgPath.crownIcon,
    // 第二名:銀牌
    imgPath.silverMedal,
    // 第三名:銅牌
    imgPath.bronzeMedal,
  ];

  created() {
    this.arrangeRankData();
  }

  /** 整理排名資料 */
  private arrangeRankData(): void {
    // 撈出資料中學校名字有值
    const hasSchoolName = this.rankData.rankList.some((data) => data.schoolName !== '');

    // 重整排名，使同分數的排名相同
    this.rankData.rankList.reduce((previousValue: PublicRankData, currentValue: PublicRankData) => {
      // 若同分則使用相同排名
      if (currentValue.count === previousValue.count) {
        currentValue.rank = previousValue.rank;
      }

      // 判斷有值 且 需要補上文字
      if (hasSchoolName && currentValue.schoolName === '') {
        currentValue.schoolName = '此身分未提供學校資訊';
      }

      return currentValue;
    }, this.rankData.rankList[0]);
  }

  /** 組合縣市和學校
   *  @param countyName 縣市別
   *  @param schoolName 學校名稱
   */
  private combineCountySchool(countyName: string, schoolName: string): string {
    return UIHelper.combineCountySchool(countyName, schoolName);
  }
}
</script>
