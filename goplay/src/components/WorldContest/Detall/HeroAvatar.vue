<template>
  <div
    class="rounded-[60px] flex justify-between items-center shadow-default"
    border="3px solid [#EBB030]"
    p="x-8 y-1"
    @click="onChangeHero"
    :class="{ 'cursor-pointer': isShowChange }"
  >
    <div class="grid grid-cols-[1fr,1.8fr,1.2fr] <sm:grid-cols-[1.5fr,0.8fr] gap-x-2 items-center">
      <!-- 英雄圖片 -->
      <img
        class="h-16 w-16 object-contain <sm:hidden"
        :src="heroImg"
        :style="{ background: isHalf === true ? '#D8D8D8' : 'transparent' }"
      />
      <div class="self-end <sm:self-center" text="[#D69F05] [22px] left">
        {{ textData.goWarHero }}
        <!-- 英雄名稱 -->
        <p text="4xl <sm:2xl">
          {{ $t(`common.${heroListData.name}`) }}
        </p>
      </div>
      <!-- 英雄等級 -->
      <div class="self-end <sm:self-center" text="[#D69F05] 4xl left <sm:2xl">Lv {{ heroListData.level }}</div>
    </div>
    <!-- 替換按鈕 -->
    <button v-if="isShowChange" class="justify-self-end" text="[#D69F05] 3xl <sm:2xl">
      {{ textData.replace }}
    </button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import { HeroListData } from '../../../helper/interface/Hero';
import HeroManager, { HeroImgType } from '../../../manager/HeroManager';

@Component({})
export default class HeroAvatar extends Vue {
  /** 當前英雄資訊 */
  @Prop() private heroListData!: HeroListData;
  /** 是否可切換 */
  @Prop(Boolean) private isShowChange!: boolean;
  /** 是否使用半身圖 */
  @Prop(Boolean) private isHalf!: boolean;

  /** 英雄圖像 */
  private get heroImg(): string {
    return this.isHalf === true
      ? HeroManager.getHeroImgUrl(this.heroListData, HeroImgType.Half)
      : HeroManager.getHeroImgUrl(this.heroListData, HeroImgType.Default);
  }

  /** 文字資料 */
  private textData = {
    goWarHero: '當前出戰英雄',
    replace: '替換',
  };

  /** 點擊切換英雄 */
  @Emit('onChangeHero')
  private onChangeHero() {
    return;
  }
}
</script>
