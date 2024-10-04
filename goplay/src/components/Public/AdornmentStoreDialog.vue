<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    fullscreen
    :modal="false"
    :show-close="false"
    class="store-bg"
    bg="no-repeat [#E5D1B0]"
    :style="{
      backgroundImage: `url(${isBuy ? imgData.buyBg : imgData.sellBg})`,
    }"
    @open="onOpenDialog"
  >
    <!-- 返回按鈕 -->
    <button
      class="flex items-center justify-center rounded-[80px]"
      m="-l-25 -b-6 <xl:(-l-0 b-2) <sm:l-0"
      p="x-3.5 y-1.3"
      text="[#FFF] 20px"
      bg="[#D23636CC]"
      border="2px solid [#FFF]"
      @click="onClickReturn"
    >
      <img class="transform rotate-180 h-1rem object-contain" :src="imgData.twoArrow" />{{ textData['fan-hui'] }}
    </button>
    <!-- 購買跟販售按鈕(賣出提示) -->
    <div class="grid grid-cols-[9rem,9rem,1fr] gap-x-2 h-12" m="b-5" p="x-4">
      <button
        :disabled="isBuy"
        class="flex items-center justify-center rounded-[80px] shadow-default blue-gradient h-full"
        :class="{ 'opacity-50': !isBuy }"
        p="y-1"
        text="[#FFF] 24px"
        @click="onChangeStoreState"
      >
        <img class="h-full object-contain" :src="imgData.buyCart" />{{ textData['gou-mai'] }}
      </button>
      <button
        :disabled="!isBuy"
        class="flex items-center justify-center rounded-[80px] shadow-default blue-gradient h-full"
        :class="{ 'opacity-50': isBuy }"
        p="y-1"
        text="[#FFF] 24px"
        @click="onChangeStoreState"
      >
        <img class="h-full object-contain" :src="imgData.sellCart" />{{ textData['fan-mai'] }}
      </button>
      <!-- 賣出提示 -->
      <span
        v-if="!isBuy"
        class="<sm:hidden flex items-center self-end justify-self-end rounded-[10px] h-12"
        p="x-4 y-1"
        bg="[#FF3E3E] opacity-80"
        text="[#FFF]"
      >
        <img class="h-full object-contain" :src="imgData.notice" />
        {{ textData['shou-chu-jia-ge-shi-mai-jia-de-12-yi-dan-shou-chu-wu-fa-gou-hui'] }}
      </span>
    </div>
    <!-- 使用者金幣跟水晶 -->
    <div
      class="grid justify-end grid-cols-[15rem,15rem] <sm:grid-rows-[3rem,3rem] <sm:grid-cols-1 gap-x-2"
      m="b-4"
      p="x-4"
    >
      <div
        class="grid grid-cols-[1.5rem,3rem,1fr] items-center rounded-4px"
        p="x-4 y-1"
        bg="[#000] opacity-50"
        border="1px solid [#FFF]"
        text="[#2CEAEC]"
      >
        <img class="h-1.5rem object-contain" :src="imgData.crystal" />{{ textData['jing-qiu'] }}
        <span text="24px [#FFF]">{{ crystalNum }}</span>
      </div>
      <div
        class="grid grid-cols-[1.5rem,3rem,1fr] items-center rounded-4px"
        p="x-4 y-1"
        bg="[#000] opacity-50"
        border="1px solid [#FFF]"
        text="[#FFDD00]"
      >
        <img class="h-1.5rem object-contain" :src="imgData.gold" />{{ textData['jin-bi'] }}
        <span text="24px [#FFF]">{{ goldNum }}</span>
      </div>
    </div>
    <!-- 家具類型的 tab -->
    <el-tabs v-model="currentAdornmentType" type="border-card">
      <el-tab-pane
        v-for="(typeIndex, index) in adornmentTypeArray"
        :key="index"
        :label="getAdornmentString(typeIndex)"
        :name="`${typeIndex}`"
        >{{ getAdornmentString(typeIndex) }}</el-tab-pane
      >
    </el-tabs>
    <div class="grid grid-cols-[1.5rem,1fr,1.5rem] items-center rounded-10px" p="4" bg="[#000000DC]">
      <!-- 上一頁 -->
      <button m="x-auto" :disabled="currentPage === 1" @click="currentPage -= 1">
        <img
          class="transform rotate-180"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          :src="imgData.bigArrow"
          alt=""
        />
      </button>
      <!-- 家具列表 -->
      <div
        class="grid grid-rows-2 gap-2"
        :style="{
          'grid-template-columns': `repeat(${pageSize / 2},minmax(0, 1fr))`,
        }"
        m="x-5"
      >
        <template v-for="(adornmentData, index) in filterAdornmentData[currentPage - 1]">
          <AdornmentItem
            v-if="(adornmentData.backpackNum && !isBuy) || isBuy"
            :key="index"
            class="cursor-pointer"
            :adornmentData="adornmentData"
            @click.native="onOpenAdornmentDetailDialog(adornmentData)"
          >
            <template v-slot:state>
              <img v-if="!isBuy" class="h-full object-contain" :src="imgData.sellCart" />
            </template>
            <template v-slot:price>
              <div
                class="h-1.5rem flex items-center justify-center rounded-0.75rem"
                text="[#FFF]"
                :class="
                  adornmentData.crystalCost > 0
                    ? 'bg-[#47B473]'
                    : adornmentData.goldCost > 0
                    ? 'bg-[#CF9622]'
                    : 'bg-[#FF5D5D80]'
                "
                border="1px solid [#FFF]"
              >
                <span v-if="isTrade(adornmentData) === false">
                  {{ isBuy ? textData.dontBuy : textData.dontSell }}
                </span>
                <template v-else>
                  <img
                    class="h-9/10 object-contain"
                    m="r-2"
                    :src="adornmentData.crystalCost > 0 ? imgData.crystal : imgData.gold"
                  />
                  {{ getAdornmentPrice(adornmentData, isBuy, 1) }}
                </template>
              </div>
            </template>
          </AdornmentItem>
        </template>
      </div>
      <!-- 下一頁 -->
      <button :disabled="currentPage === filterAdornmentData.length" @click="currentPage += 1" m="x-auto">
        <img
          :src="imgData.bigArrow"
          :class="{
            'opacity-50 cursor-not-allowed': currentPage === filterAdornmentData.length,
          }"
        />
      </button>
      <!-- 頁碼 -->
      <el-pagination
        class="col-span-2 justify-self-center"
        text="![#FFF]"
        layout="pager"
        hideOnSinglePage
        :currentPage.sync="currentPage"
        :pageCount="filterAdornmentData.length"
      >
      </el-pagination>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import ImgPath from '@/config/imgPath/imgPath';
import { Component, Prop, Emit, ModelSync, Vue, Watch } from 'vue-property-decorator';
import AdornmentItem from '@/components/Public/AdornmentItem.vue';
import FileHelper from '@/views/H5/Helper/FileHelper';
import { getAdornmentPrice, isBuyable } from '@/helper/fnc/common';
import { AdornmentListData } from '@/helper/interface/Adornment';
import { AdornmentType } from '@/helper/enum/Adornment';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import TableManager from '@/manager/TableManager';

@Component({
  components: {
    AdornmentItem,
  },
})
export default class AdornmentStoreDialog extends Vue {
  /** 此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 目前商店狀態 */
  @Prop({ default: true }) readonly isBuy!: boolean;

  /** 文字資料 */
  private textData = {
    'fan-hui': '返回',
    'gou-mai': '購買',
    'fan-mai': '販賣',
    'jing-qiu': '晶球',
    'jin-bi': '金幣',
    'shou-chu-jia-ge-shi-mai-jia-de-12-yi-dan-shou-chu-wu-fa-gou-hui': '售出價格是買價的1/2,一旦售出無法購回',
    dontBuy: '未發售',
    dontSell: '不可販賣',
  };

  /** 圖片資料 */
  private imgData = {
    buyBg: ImgPath.buyBg,
    sellBg: ImgPath.sellBg,
    twoArrow: ImgPath.arrowTwoIconBaseUrl,
    buyCart: ImgPath.buyCart,
    sellCart: ImgPath.sellCart,
    notice: ImgPath.noticeUrl,
    crystal: ImgPath.crystalBaseUrl,
    gold: ImgPath.goldBaseUrl,
    bigArrow: ImgPath.bigArrow,
  };

  /** 視窗寬度 */
  private screenWidth: number = window.innerWidth;
  /** 手機螢幕寬度分界 */
  private readonly mobileWidth: number = 435;
  /** 使用者目前看到的頁數 */
  private currentPage: number = 1;
  /** 使用者當前選到的家具類型 */
  private currentAdornmentType: string = AdornmentType.Wall.toString();

  /** 家具的類型和ID */
  private AdornmentType = AdornmentType;

  /** 計算價錢 */
  private getAdornmentPrice = getAdornmentPrice;

  /** 每頁顯示家具數量(改動 UI 可能需要調整) */
  private get pageSize(): number {
    return this.screenWidth < this.mobileWidth ? 6 : 18;
  }
  /** 使用者晶球數 */
  private get crystalNum() {
    return this.$$store.state.PlanetWarModule.crystalCoin;
  }
  /** 使用者金幣數 */
  private get goldNum() {
    return this.$$store.state.PlanetWarModule.goldCoin;
  }

  /** 裝飾物商店列表 */
  private get adornmentStoreItemList(): AdornmentListData[] {
    return this.$$store.state.AdornmentModule.adornmentList.filter((adornment) => {
      return TableManager.storeItem.getAll().find((storeItem) => adornment.id === storeItem.itemId);
    });
  }

  /** 取的換頁數或是換類型後的家具陣列 */
  private get filterAdornmentData(): AdornmentListData[][] {
    return FileHelper.sliceChunkArray(
      this.adornmentStoreItemList.filter((adornmentData) => {
        if (adornmentData.adornmentType.toString() === this.currentAdornmentType) {
          return this.isBuy || adornmentData.backpackNum > 0;
        }
        return false;
      }),
      this.pageSize
    );
  }

  /** 抓出裝飾類型 */
  private get adornmentTypeArray(): number[] {
    const typeArray: number[] = [];
    for (let adornmentType = AdornmentType.None + 1; adornmentType < AdornmentType.Max; adornmentType++) {
      typeArray.push(adornmentType);
    }

    return typeArray;
  }

  created() {
    window.addEventListener('resize', this.resizeScreen);
  }

  destroyed() {
    window.removeEventListener('resize', this.resizeScreen);
  }

  /** 重新判定視窗大小 */
  private resizeScreen(): void {
    // 調整頁碼
    if (this.screenWidth > this.mobileWidth && innerWidth < this.mobileWidth) {
      this.currentPage = (this.currentPage - 1) * 3 + 1;
    } else if (this.screenWidth < this.mobileWidth && innerWidth > this.mobileWidth) {
      this.currentPage = Math.trunc((this.currentPage - 1) / 3) + 1;
    }
    this.screenWidth = innerWidth;
  }

  async onOpenDialog(): Promise<void> {
    // 商店開啟時預設為購買
    if (this.isBuy === false) {
      this.onChangeStoreState();
    }
    await this.$$store.dispatch('initAdornmentData');
    await this.$$store.dispatch('getPlanetWarUserInfo');
  }

  /** 按下返回鍵 */
  private onClickReturn(): void {
    this.isDialogVisible = false;
  }

  /** 類型對應文字
   *  @param index ENUM順序
   */
  private getAdornmentString(index: number): string {
    const typeNameKey = `AdornmentType_${index}`;
    return Localization.getText(LocalKeyType.Common, typeNameKey);
  }

  /** 是否可交易
   *  @param adornmentData 裝飾物資料
   */
  private isTrade(adornmentData: AdornmentListData): boolean {
    return isBuyable(adornmentData);
  }

  /** 使用者切換家具類型頁數回正 */
  @Watch('currentAdornmentTypeId')
  private onResetPage(): void {
    this.currentPage = 1;
  }

  /** 打開確認購買家具彈窗 */
  @Emit('onOpenAdornmentDetailDialog')
  private onOpenAdornmentDetailDialog(adornmentData: AdornmentListData): void {
    return;
  }

  /** 切換商店狀態 */
  @Emit('onChangeStoreState')
  private onChangeStoreState(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  background: transparent;
}
::v-deep .el-dialog__body {
  max-width: 64rem;
  margin: auto;
  padding: 80px 20px;
}

::v-deep .el-tabs__content {
  display: none;
}
::v-deep .el-tabs__nav-wrap {
  margin-bottom: 0px;
}
::v-deep .el-tabs--border-card {
  width: 90%;
  margin: 0 auto;
  background: transparent;
  border: 0px;
  box-shadow: none;
}
::v-deep .el-tabs--border-card > .el-tabs__header {
  background: transparent;
  border: 0px;
}
::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item {
  margin: 0px 0.25rem;
  color: #fff;
  font-size: 24px;
  background: #000000dc;
  opacity: 0.5;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item:not(.is-disabled):hover {
  color: #fff;
}
::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  border-color: transparent;
  opacity: 1;
}
::v-deep .el-pager li {
  background-color: transparent;
}
::v-deep .el-pager li:hover {
  color: #fff;
}
::v-deep .el-pager li.active {
  color: #409eff;
  cursor: default;
}
.blue-gradient {
  background: linear-gradient(#1ae5de, #2faff9);
}
.store-bg {
  background-position: top center;
  background-size: 100% auto;
  top: 4vh;
}
@media (max-width: 639.9px) {
  .store-bg {
    top: 0vh;
  }
}
</style>
