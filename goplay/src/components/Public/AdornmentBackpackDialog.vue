<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :close-on-click-modal="false"
    :before-close="onCloseDialog"
    @open="onOpenDialog"
  >
    <!-- 標題 -->
    <template #title>
      <div class="rounded-10px" p="y-2" bg="[#EEA73D]" text="1.25rem [#FFF] shadow-lightDefault">
        {{ textData['bei-bao'] }}
      </div>
    </template>
    <!-- 家具類型 tab -->
    <el-tabs v-model="currentAdornmentType" type="border-card">
      <el-tab-pane
        v-for="(typeIndex, index) in adornmentTypeArray"
        :key="index"
        :label="getAdornmentString(typeIndex)"
        :name="`${typeIndex}`"
        >{{ getAdornmentString(typeIndex) }}</el-tab-pane
      >
    </el-tabs>
    <!-- 家具列表 -->
    <div class="grid grid-cols-[2rem,1fr,2rem] rounded-10px" p="y-5" bg="[#000000DC]">
      <!-- 有家具 -->
      <template v-if="filterAdornmentData.length > 0">
        <!-- 上一頁 -->
        <button m="x-auto" :disabled="currentPage === 1" @click="currentPage -= 1">
          <img
            class="transform rotate-180"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            :src="imgData.bigArrow"
          />
        </button>
        <div
          class="grid grid-rows-3 gap-x-3"
          :style="{
            'grid-template-columns': `repeat(${pageSize / 3},minmax(0, 1fr))`,
          }"
        >
          <AdornmentItem
            v-for="(adornmentData, index) in filterAdornmentData[currentPage - 1]"
            :key="index"
            class="cursor-pointer"
            :adornmentData="adornmentData"
            @click.native="onOpenAdornmentDetailDialog(adornmentData)"
          >
          </AdornmentItem>
        </div>
        <!-- 下一頁 -->
        <button m="x-auto" :disabled="currentPage === filterAdornmentData.length" @click="currentPage += 1">
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
          :currentPage.sync="currentPage"
          :pageCount="filterAdornmentData.length"
        >
        </el-pagination>
      </template>
      <!-- 無家具 -->
      <div v-else class="h-94 col-span-3 flex justify-center items-center" text="[#FFF] xl">
        <div class="flex flex-col items-center">
          {{ noAdornmentHint }}
          <button class="blueGradient w-44 rounded-80px" m="t-2" p=" y-1" @click="onGoStore">
            {{ textData['qian-wang-shang-dian-gou-mai'] }}
          </button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Vue, ModelSync, Component, Emit, Watch } from 'vue-property-decorator';
import AdornmentItem from '@/components/Public/AdornmentItem.vue';
import ImgPath from '@/config/imgPath/imgPath';
import { AdornmentListData } from '@/helper/interface/Adornment';
import { AdornmentType } from '@/helper/enum/Adornment';
import FileHelper from '@/views/H5/Helper/FileHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';

@Component({
  components: {
    AdornmentItem,
  },
})
export default class AdornmentBackpackDialog extends Vue {
  /** 此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 文字資料 */
  private textData = {
    'bei-bao': '背包',
    'qian-wang-shang-dian-gou-mai': '前往商店購買',
  };

  /** 圖片資料 */
  private imgData = {
    bigArrow: ImgPath.bigArrow,
  };

  /** 當前頁 */
  private currentPage = 1;

  /** 每頁顯示家具數量 */
  private readonly pageSize: number = window.innerWidth < 435 ? 9 : 21;

  /** 使用者當前選到的家具類型 */
  private currentAdornmentType: string = AdornmentType.Wall.toString();

  /** 家具的類型和ID */
  private AdornmentType = AdornmentType;

  /** 裝飾物列表 */
  private get adornmentList(): AdornmentListData[] {
    return this.$$store.state.AdornmentModule.adornmentList;
  }

  /** 取的換頁數或是換類型後的家具陣列(過濾掉使用者目前沒有的) */
  private get filterAdornmentData(): AdornmentListData[][] {
    return FileHelper.sliceChunkArray(
      this.adornmentList.filter((adornmentData) => {
        return adornmentData.adornmentType.toString() === this.currentAdornmentType && adornmentData.backpackNum > 0;
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

  /** 沒有物品的提示字 */
  private get noAdornmentHint(): string {
    return Localization.getText(LocalKeyType.Common, 'AdornmentBackpack_EmptyHint', [
      this.getAdornmentString(Number(this.currentAdornmentType)),
    ]);
  }

  async onOpenDialog(): Promise<void> {
    await this.$$store.dispatch('initAdornmentData');
  }

  onCloseDialog(): void {
    this.isDialogVisible = false;
  }

  /** 類型對應文字
   *  @param index ENUM順序
   */
  private getAdornmentString(index: number): string {
    const typeNameKey = `AdornmentType_${index}`;
    return Localization.getText(LocalKeyType.Common, typeNameKey);
  }

  /** 使用者切換家具類型頁數回正 */
  @Watch('currentAdornmentType')
  private onResetPage(): void {
    this.currentPage = 1;
  }

  /** 打開商店 */
  @Emit('onGoStore')
  private onGoStore(): void {
    return;
  }

  /** 打開確認購買家具彈窗 */
  @Emit('onOpenAdornmentDetailDialog')
  private onOpenAdornmentDetailDialog(adornmentData: AdornmentListData): void {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 50rem;
  width: 95%;
  border-radius: 10px;
}
::v-deep .el-dialog__header {
  padding: 20px 10px 10px;
}
::v-deep .el-dialog__headerbtn {
  top: 28px;
}
::v-deep .el-dialog__close {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
}
::v-deep .el-dialog__body {
  padding: 0px 20px 30px;
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
</style>
