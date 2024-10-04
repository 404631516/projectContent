<template>
  <div>
    <!-- 道具格 -->
    <AntiTDItemComponent
      w="full"
      h="full"
      :itemId="itemId"
      :isNameVisible="true"
      :isTypeVisible="true"
      :isEquipLocked="false"
      :isHighlight="false"
    />
    <!-- 已裝備 -->
    <div
      class="w-[96%] h-[33%] flex items-center justify-center absolute bottom-[1%] left-[2%]"
      bg="opacity-80 [#D59434]"
      text="1.125rem [#FFFFFF]"
      border="rounded-5px"
      v-if="!isLock && isEquip"
    >
      {{ textData.equipText }}
    </div>
    <!-- 未解鎖遮罩 -->
    <div
      class="w-[97%] h-[97%] absolute top-[1.5%] left-[1.5%]"
      bg="opacity-80 [#000000]"
      border="rounded-10px"
      v-if="isBuyable && isLock"
    >
      <!-- 文字 -->
      <div class="h-[64%] flex items-center justify-center" text="1.125rem [#2CEAEC]">
        <p m="t-5">{{ textData.lockText }}</p>
      </div>
      <!-- 晶球價格 -->
      <div
        class="h-[33%] flex items-center justify-center"
        m="x-[5%]"
        bg="opacity-80 [#47B473]"
        text="1.2rem [#FFFFFF]"
        border="rounded-5px"
        v-if="itemData.crystalCost > 0"
      >
        <img class="h-[70%] aspect-square" :src="imgData.ballIcon" />
        <span text="[#FFFFFF]">{{ itemData.crystalCost }}</span>
      </div>
      <!-- 金幣價格 -->
      <div
        class="h-[33%] flex items-center justify-center"
        m="x-[5%]"
        bg="opacity-80 [#F3C74E]"
        text="1.2rem [#FFFFFF]"
        border="rounded-5px"
        v-if="itemData.goldCost > 0"
      >
        <img class="h-[70%] aspect-square" :src="imgData.goldIcon" />
        <span text="[#FFFFFF]">{{ itemData.goldCost }}</span>
      </div>
    </div>
    <!-- 未發售 -->
    <div
      class="w-[97%] h-[97%] absolute top-[1.5%] left-[1.5%]"
      bg="opacity-80 [#000000]"
      border="rounded-10px"
      v-if="isLock && !isBuyable"
    >
      <!-- 文字 -->
      <div class="h-full flex items-center justify-center" text="1.125rem [#FFFFFF]">
        {{ textData.notBuyableText }}
      </div>
    </div>
    <!-- 類型不符合 -->
    <div
      class="w-[97%] h-[20%] absolute top-[1.5%] left-[1.5%]"
      bg="opacity-80 [#FF6161]"
      border="rounded-10px"
      v-if="!isTypeMatched"
    >
      <!-- 文字 -->
      <p class="h-full flex items-center justify-center" text="1rem [#FFFFFF]" m="l-5">
        {{ textData.notMatchText }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import TableManager, { AntiTDItemData } from '@/manager/TableManager';
import { Vue, Prop, Component } from 'vue-property-decorator';
import AntiTDItemComponent from '@/components/AntiTD/AntiTDItemComponent.vue';
import imgPath from '@/config/imgPath/imgPath';
import AntiTDManager from '@/manager/AntiTDManager';

/** 英雄道具列表中的 道具圖示 */
@Component({
  components: {
    AntiTDItemComponent,
  },
})
export default class AntiTDItem extends Vue {
  /** 道具編號 */
  @Prop(Number) private itemId!: number;
  /** 是否未解鎖 */
  @Prop(Boolean) private isLock!: boolean;
  /** 是否已裝備 */
  @Prop(Boolean) private isEquip!: boolean;
  /** 類型是否符合 */
  @Prop(Boolean) private isTypeMatched!: boolean;

  /**道具資料 */
  private itemData!: AntiTDItemData;
  /** 是否可購買 */
  private isBuyable: boolean = true;

  private textData = {
    equipText: '裝備中',
    lockText: '未解鎖',
    notBuyableText: '未發售',
    notMatchText: '類型不合',
  };

  private imgData = {
    /** 晶球icon  */
    ballIcon: imgPath.ballIconBaseUrl,
    /** 金幣icon */
    goldIcon: imgPath.goldIconBaseUrl,
  };

  created() {
    const data = TableManager.antiTDItem.findOne(this.itemId);
    if (data === undefined) {
      console.error('no matching Id');
      return;
    }
    this.itemData = data;
    // 是否為未發售
    this.isBuyable = AntiTDManager.isAntiTDItemBuyable(this.itemData);
  }

  // 已裝備時 要能顯示 已裝備
  // 同一英雄 不可裝備相同道具 不同英雄可裝備相同道具
  // 未解鎖時 要顯示 價格
}
</script>
