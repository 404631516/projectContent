<template>
  <div class="flex items-center justify-center" p="y-6" text="2xl [#878787] <sm:16px" border="b-1px solid #b2b2b280">
    <!-- 圖片和名次 -->
    <div
      class="w-[20%] relative flex items-center justify-center"
      :class="ranking === 0 ? 'text-[28px] text-[#F2BA0F] <sm:text-[22px]' : 'text-[22px]'"
      :style="{ width: rankTitleData.nameTitle === '' ? '30%' : '20%' }"
    >
      <!-- 前三名顯示圖片 -->
      <img
        class="w-10 aspect-square object-contain absolute <xl:hidden"
        v-if="ranking <= 2"
        :src="rankImgUrl[ranking]"
        :style="{ left: rankTitleData.nameTitle === '' ? '30%' : '20%' }"
      />
      <!-- 非前三名顯示排名 -->
      {{ rankingName }}
    </div>
    <!-- 姓名或名稱 -->
    <div class="w-[30%]" :class="{ 'text-[#F2BA0F]': ranking === 0 }" v-if="rankTitleData.nameTitle">
      {{ rankData.name }}
    </div>
    <!-- 學校和班級 -->
    <div
      :class="{ 'text-[#F2BA0F]': ranking === 0 }"
      :style="{ width: rankTitleData.nameTitle === '' ? '35%' : '25%' }"
    >
      <!-- 學校名稱 -->
      <span v-if="rankData.school"> {{ rankData.school }}{{ rankData.class }} </span>
      <!-- 沒有學校 -->
      <span v-else>{{ textData.noSchoolText }}</span>
    </div>
    <!-- 得分或次數 -->
    <div
      class="w-[25%]"
      text="32px [#ebca28] <sm:20px"
      :class="{ 'text-[#F2BA0F]': ranking === 0 }"
      :style="{ width: rankTitleData.nameTitle === '' ? '35%' : '25%' }"
    >
      {{ rankData.score }}
      <span m="l-2" text="[#666666] xl ">
        {{ rankTitleData.scoreTypeTitle }}
      </span>
    </div>
    <!-- 拜訪 -->
    <template v-if="isAdornmentRank">
      <div class="w-25 <sm:w-17">
        <button
          v-if="isSelf === false"
          class="rounded-30px"
          bg="red-400"
          p="x-4 y-2 <sm:x-2"
          text="[#FFF]"
          @click="onVisitBase"
        >
          {{ textData.visitText }}
        </button>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { RankingListItem, RankTitleData } from '@/helper/interface/Rank';
import imgPath from '@/config/imgPath/imgPath';
import { RankingRankType } from '@/helper/enum/Common';
import { WebGameName } from '@/helper/enum/WebGame';

@Component({})
export default class RankListItem extends Vue {
  /** 排名資料 */
  @Prop() private rankData!: RankingListItem;
  /** 排名 */
  @Prop(Number) private ranking!: number;
  /** 排行標題資料 */
  @Prop() private rankTitleData!: RankTitleData;

  /** 文字資料 */
  private textData = {
    noSchoolText: '此身分未提供學校資訊',
    visitText: '拜訪',
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

  /** 排名中文 */
  private get rankingName(): string {
    const chineseNum = [
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
      '七',
      '八',
      '九',
      '十',
      '十一',
      '十二',
      '十三',
      '十四',
      '十五',
      '十六',
      '十七',
      '十八',
      '十九',
      '二十',
      '二十一',
      '二十二',
      '二十三',
      '二十四',
      '二十五',
      '二十六',
      '二十七',
      '二十八',
      '二十九',
      '三十',
      '三十一',
      '三十二',
      '三十三',
      '三十四',
      '三十五',
      '三十六',
      '三十七',
      '三十八',
      '三十九',
      '四十',
      '四十一',
      '四十二',
      '四十三',
      '四十四',
      '四十五',
      '四十六',
      '四十七',
      '四十八',
      '四十九',
      '五十',
    ];
    return `第${chineseNum[this.ranking]}名`;
  }

  /** 是否為個人基地排行榜 */
  private get isAdornmentRank(): boolean {
    return this.rankTitleData.rankType === RankingRankType.AdornmentRankPoints;
  }

  /** 是否為自己，排名中有自己不顯示拜訪 */
  private get isSelf(): boolean {
    return this.rankData.id === this.$$store.getters.userUid;
  }

  /** 拜訪房間 */
  private onVisitBase(): void {
    // 設定姓名和排名
    this.$$store.commit('setVisitBaseOwnerName', this.rankData.name);
    this.$$store.commit('setVisitBaseOwnerRank', this.ranking + 1);

    // 前往遊戲
    this.$router.push({
      name: `${WebGameName.PersonalBaseGame}`,
      params: { id: `${this.rankData.id}` },
    });
  }
}
</script>
<style lang="scss" scoped></style>
