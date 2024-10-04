<template>
  <div text="[#FFF]">
    <div class="aspect-square grid grid-rows-[20%,20%,37%,20%] gap-y-[1%] relative" m="b-1" p="1" bg="[#FFF]">
      <!-- 裝飾物品圖 -->
      <img
        ref="adornmentImage"
        class="absolute self-center justify-self-center z-1 object-contain"
        :src="`${Config.imgUrl}/img/h5/adornment/adornmentItem/${adornmentData.url}.png`"
        @load="scaleImage"
      />
      <!-- 裝飾分 -->
      <div
        class="rounded-1rem inline-flex items-center justify-self-start z-5"
        p="x-2"
        bg="[#00000080]"
        text="[#50FFB9] xs"
      >
        <img class="h-full object-contain" m="x-1" :src="imgData.redBowTie" />{{ adornmentData.adornmentScore }}
      </div>
      <!-- 尺寸 -->
      <div
        :class="showAdornmentSize(adornmentData) ? '' : 'invisible'"
        class="rounded-1rem justify-self-start z-5"
        p="x-2"
        text="[#FFF] xs"
        bg="[#00000080]"
      >
        {{ `${adornmentData.itemHeight}X${adornmentData.itemWidth}` }}
      </div>
      <!-- 商店狀態 -->
      <div class="z-5"><slot name="state"></slot></div>
      <!-- 包包占格 -->
      <div class="rounded-1rem flex justify-center items-center z-5" text="[#FFF]" bg="[#00000080]">
        <img class="h-full object-contain" m="r-1" :src="imgData.backpack" />{{
          adornmentData.backpackNum ? adornmentData.backpackNum : 0
        }}
      </div>
    </div>
    <!-- 家具名稱 -->
    <div class="truncate w-full">
      {{ this.$t(`common.${adornmentData.nameKey}`) }}
    </div>
    <!-- 售價與賣價 -->
    <slot name="price"></slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Config from '@/config/setting';
import ImgPath from '@/config/imgPath/imgPath';
import { AdornmentListData } from '@/helper/interface/Adornment';
import { showAdornmentSize } from '@/helper/fnc/common';

@Component({})
export default class AdornmentItem extends Vue {
  private Config = Config;
  /** 家具資料 */
  @Prop(Object) readonly adornmentData!: AdornmentListData;
  /** 背景框比例大小(美術限定圖片最大寬度/螢幕最大寬度) */
  private readonly maxLengthRatio: number = 80 / (window.innerWidth < 435 ? 435 : 1920);
  /** Phaser圖片放大最大倍率 */
  private readonly maxImageRatio: number = 4;

  public $refs!: {
    adornmentImage: HTMLImageElement;
  };

  /** 圖片資料 */
  private imgData = {
    backpack: ImgPath.backpack,
    redBowTie: ImgPath.redBowTie,
  };

  /** 判斷是否顯示裝飾物尺寸 */
  private showAdornmentSize = showAdornmentSize;

  created() {
    window.addEventListener('resize', this.scaleImage);
  }

  destroyed() {
    window.removeEventListener('resize', this.scaleImage);
  }

  /** 縮放圖片
   *  @param event
   */
  private scaleImage(): void {
    // 取得圖片資訊
    const adornmentImage = this.$refs.adornmentImage;
    // 計算背景框大小
    const maxLength = document.body.clientWidth * this.maxLengthRatio;
    // 計算圖片最長與背景縮放比例
    const imageWidthScale = maxLength / adornmentImage.naturalWidth;
    const imageHeightScale = maxLength / adornmentImage.naturalHeight;

    // 縮放比例不能超過4倍
    if (imageWidthScale > this.maxImageRatio && imageHeightScale > this.maxImageRatio) {
      adornmentImage.width = adornmentImage.naturalWidth * this.maxImageRatio;
      adornmentImage.height = adornmentImage.naturalHeight * this.maxImageRatio;
    }
    // 抓出圖片最長的那邊放大到規定大小，短邊放大
    else if (adornmentImage.naturalWidth >= adornmentImage.naturalHeight) {
      adornmentImage.width = maxLength;
      adornmentImage.height = adornmentImage.naturalHeight * imageWidthScale;
    } else {
      adornmentImage.width = adornmentImage.naturalWidth * imageHeightScale;
      adornmentImage.height = maxLength;
    }
  }
}
</script>
