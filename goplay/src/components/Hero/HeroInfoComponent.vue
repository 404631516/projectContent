<template>
  <!-- 小方框-->
  <div v-if="borderShapeType === BorderShapeType.SmallSquare" class="h-full w-full bg-[#383838] rounded-[20px]">
    <!-- 有英雄格 -->
    <div
      v-if="heroListData && heroListData.hid != 0"
      class="h-full w-full flex flex-col justify-between"
      bg="no-repeat center contain"
      :style="{
        backgroundImage: `url(${heroImg})`,
      }"
    >
      <!-- 英雄屬性列表 -->
      <div class="h-[38%] w-[112%] mt-[-15%] grid grid-cols-3 self-center">
        <!-- 英雄角色屬性 -->
        <div
          v-if="isShowAttribute"
          class="bg-no-repeat bg-center"
          :style="{
            backgroundImage: `url(${heroAttributeImg})`,
            backgroundSize: '120% 120%',
          }"
        ></div>
        <!-- 英雄道具屬性1 -->
        <div
          v-if="isShowHeroItemType"
          class="bg-no-repeat bg-center"
          :style="{
            backgroundImage: `url(${heroItemAttribute1})`,
            backgroundSize: '130% 130%',
          }"
        ></div>
        <!-- 英雄道具屬性2 -->
        <div
          v-if="isShowHeroItemType"
          class="bg-no-repeat bg-center"
          :style="{
            backgroundImage: `url(${heroItemAttribute2})`,
            backgroundSize: '130% 130%',
          }"
        ></div>
      </div>
      <!-- 英雄等級 -->
      <div v-if="isShowLevel" class="h-[10%] flex-pos self-center mb-[10%]" text="19px [#FFFFFF]">
        Lv {{ heroListData.level }}
      </div>
    </div>
    <!-- 空英雄格 -->
    <div v-else class="h-full w-full flex justify-center items-center" text="50px [#FFFFFF]">+</div>
  </div>
  <!-- 長方框-->
  <div v-else-if="borderShapeType === BorderShapeType.NormalRect" class="h-full w-full">
    <!-- 有英雄格 -->
    <div
      v-if="heroListData && heroListData.hid != 0"
      class="h-full w-full flex flex-col justify-between rounded-[20px]"
      bg="no-repeat center cover"
      border="1px solid [#707070]"
      :style="{
        backgroundImage: `url(${heroCardImg})`,
      }"
    >
      <!-- 英雄屬性列表 -->
      <div class="h-[20%] w-[112%] mt-[-10%] grid grid-cols-3 self-center">
        <!-- 英雄角色屬性 -->
        <div
          v-if="isShowAttribute"
          class="bg-no-repeat bg-center"
          :style="{
            backgroundImage: `url(${heroAttributeImg})`,
            backgroundSize: '120% 120%',
          }"
        ></div>
        <!-- 英雄道具屬性1 -->
        <div
          v-if="isShowHeroItemType"
          class="bg-no-repeat bg-center"
          :style="{
            backgroundImage: `url(${heroItemAttribute1})`,
            backgroundSize: '130% 130%',
          }"
        ></div>
        <!-- 英雄道具屬性2 -->
        <div
          v-if="isShowHeroItemType"
          class="bg-no-repeat bg-center"
          :style="{
            backgroundImage: `url(${heroItemAttribute2})`,
            backgroundSize: '130% 130%',
          }"
        ></div>
      </div>
      <!-- 卸下按鈕 -->
      <slot name="remove"> </slot>
      <!-- 英雄等級 -->
      <span
        v-if="isShowLevel"
        class="w-[80%] mx-auto py-1 bg-[#000000cc] mb-[5px] rounded-[30px]"
        text="30px [#fdc221]"
      >
        Lv {{ heroListData.level }}
      </span>
    </div>
    <!-- 空英雄格 -->
    <div v-else class="w-full h-full flex flex-col justify-center items-center bg-[#000000cc] rounded-[20px]">
      <div text="80px [#FFFFFF]">+</div>
      <div text="20px [#FFFFFF]">
        {{ textData.selectHero }}
      </div>
    </div>
  </div>
  <!-- 小圓框-->
  <div
    v-else
    class="flex justify-center items-center w-full h-full rounded-[10px]"
    border="1px solid [#FFFFFF]"
    text="30px [#FFFFFF]"
    :class="heroListData && heroListData.hid != 0 ? 'bg-[#D8D8D8]' : 'bg-[#000000CC]'"
  >
    <!-- 有英雄格 -->
    <img v-if="heroListData && heroListData.hid != 0" :src="heroIconImg" class="h-full object-contain object-bottom" />
    <!-- 空英雄格 -->
    <span v-else>+</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { HeroListData } from '@/helper/interface/Hero';
import { BorderShapeType } from '@/helper/enum/Hero';
import { AntiTDItemType } from '@/helper/enum/AntiTD';
import TableManager from '@/manager/TableManager';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import AntiTDManager from '@/manager/AntiTDManager';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';

@Component({})
export default class HeroInfoComponent extends Vue {
  /** 英雄資訊 */
  @Prop(Object) private heroListData!: HeroListData;
  /** 外框形狀 */
  @Prop() private borderShapeType!: BorderShapeType;
  /** 是否顯示 英雄等級 */
  @Prop(Boolean) private isShowLevel!: boolean;
  /** 是否顯示 屬性 */
  @Prop(Boolean) private isShowAttribute!: boolean;
  /** 是否顯示 英雄道具類型 */
  @Prop(Boolean) private isShowHeroItemType!: boolean;
  /** 外框形狀 */
  private BorderShapeType = BorderShapeType;
  /** 英雄可裝備逆塔防道具種類*/
  private antiTDItemTypes: AntiTDItemType[] = [];

  /** 文字資料 */
  private textData = {
    selectHero: '選擇英雄',
  };

  /** 串接英雄半身像圖片路徑 */
  private get heroIconImg(): string {
    return HeroManager.getHeroImgUrl(this.heroListData, HeroImgType.Half);
  }

  /** 串接英雄圖片路徑 */
  private get heroImg(): string {
    return HeroManager.getHeroImgUrl(this.heroListData, HeroImgType.Default);
  }

  /** 串接英雄逆塔防卡牌圖片路徑 */
  private get heroCardImg(): string {
    return HeroManager.getHeroImgUrl(this.heroListData, HeroImgType.Card);
  }

  /** 英雄屬性圖片路徑 */
  private get heroAttributeImg(): string {
    return AttributeHelper.getAttributeIconImgUrl(this.heroListData.attribute);
  }

  /** 英雄道具圖片路徑1 */
  private get heroItemAttribute1(): string {
    if (this.antiTDItemTypes.length >= 1) {
      return AntiTDManager.getAntiTDItemTypeImageUrl(this.antiTDItemTypes[0]);
    }
    return '';
  }

  /** 英雄道具圖片路徑2 */
  private get heroItemAttribute2(): string {
    if (this.antiTDItemTypes.length >= 2) {
      return AntiTDManager.getAntiTDItemTypeImageUrl(this.antiTDItemTypes[1]);
    }
    return '';
  }

  created() {
    this.updateAntiTDItem();
  }

  @Watch('heroListData')
  private updateAntiTDItem(): void {
    // 空英雄or未解鎖
    if (this.heroListData == null || this.heroListData.hid === 0) {
      return;
    }
    // 依對應ID撈出英雄資料
    const hero = TableManager.hero.findOne(this.heroListData.heroId);
    if (hero === undefined) {
      console.error(`找不到英雄 ${this.heroListData.heroId}`);
      return;
    }

    // 解字串變成number array
    this.antiTDItemTypes = JSON.parse(hero.antiTDItemTypes);
  }
}
</script>

<style lang="scss" scoped></style>
