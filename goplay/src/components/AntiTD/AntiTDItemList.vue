<template>
  <div bg="[#000000CC]" p="x-23px y-8px" border="rounded-10px" shadow="default [#FFFFFF29]">
    <!--使用者資訊 -->
    <div class="flex justify-between">
      <div class="grid grid-cols-[1fr,1fr] gap-3 max-w-370px">
        <!-- 晶球 -->
        <div
          class="flex items-center justify-center"
          border="rounded-5px 1px solid [#FFFFFF]"
          p="y-3.5px x-10px"
          bg="[#00000080] opacity-50"
          text="1.25rem [#FFFFFF] <sm:16px"
        >
          <img class="inline-block object-contain aspect-square" m="r-6px" :src="imgData.ballIcon" />
          <span text="0.875rem [#2CEAEC]" m="r-6px">{{ textData.crystalText }}</span>
          {{ userInfo.crystalCoin }}
        </div>
        <!-- 金幣 -->
        <div
          class="flex items-center justify-center"
          border="rounded-5px 1px solid [#FFFFFF]"
          p="y-3.5px x-10px"
          bg="[#00000080] opacity-50"
          text="1.25rem [#FFFFFF] <sm:16px"
        >
          <img class="inline-block object-contain aspect-square" m="r-6px" :src="imgData.goldIcon" />
          <span text="0.875rem [#FFDD00]" m="r-6px">{{ textData.goldText }}</span>
          {{ userInfo.goldCoin }}
        </div>
      </div>
      <button text="35px [#FFFFFF]" font="bold" @click="closeItemList"><img :src="imgData.whiteCross" /></button>
    </div>
    <!-- 道具清單 -->
    <div class="flex overflow-auto scrollbar" p="t-50px b-15px">
      <div
        v-for="(item, index) in itemDataList"
        :key="index"
        m="l-6px r-2px"
        @click="(isMatchItemType(item.heroItemType) || isLock(item.id)) && onClickItem(item.id)"
      >
        <AntiTDItem
          class="w-98px h-98px relative"
          :itemId="item.id"
          :isNameVisible="true"
          :isTypeVisible="false"
          :isTypeMatched="isMatchItemType(item.heroItemType)"
          :isLock="isLock(item.id)"
          :isEquip="isEquip(item.id)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { AntiTDItemType } from '@/helper/enum/AntiTD';
import HeroManager from '@/manager/HeroManager';
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import { PlanetUserInfoData } from '../../helper/interface/PlanetWar';
import TableManager, { AntiTDItemData } from '../../manager/TableManager';
import AntiTDItem from './AntiTDItem.vue';

@Component({
  components: {
    /** 英雄道具 組件 */
    AntiTDItem,
  },
})
/** 逆塔防英雄隊伍介面中 點選英雄道具 彈出的 快速道具列表 */
export default class AntiTDItemList extends Vue {
  /** 金幣 晶球*/
  @Prop(Object) private userInfo!: PlanetUserInfoData;
  /** 擁有的 道具資訊列表 */
  @Prop(Array) private antiTDItemIds!: number[];
  /** 裝備中 道具資訊列表 */
  @Prop(Array) private antiTDEquipItemIds!: number[];
  /** 選中英雄 */
  @Prop(Number) private heroId!: number;

  /** 道具清單 */
  private itemDataList!: Readonly<AntiTDItemData[]>;

  /** 英雄道具類型 */
  private heroItemTypes: AntiTDItemType[] = [];

  /** 文字資料 */
  private textData = {
    crystalText: '晶球',
    goldText: '金幣',
  };

  /** 圖片資料 */
  private imgData = {
    /** 晶球icon  */
    ballIcon: imgPath.ballIconBaseUrl,
    /** 金幣icon */
    goldIcon: imgPath.goldIconBaseUrl,
    /** 白色叉叉 */
    whiteCross: imgPath.whiteCrossUrl,
  };

  created() {
    // 依照類型排序
    this.itemDataList = TableManager.antiTDItem
      .where((item) => item.heroItemType > 0)
      .sort((a, b) => {
        return a.heroItemType - b.heroItemType;
      });
    this.getHeroItemTypes(this.heroId);
  }

  /** 檢查是否道具類型符合
   * @param heroItemType
   */
  private isMatchItemType(heroItemType: AntiTDItemType): boolean {
    return this.heroItemTypes.includes(heroItemType);
  }

  /** 檢查是否解鎖
   * @param itemId 道具編號
   */
  private isLock(itemId: number): boolean {
    return this.antiTDItemIds.includes(itemId) === false;
  }

  /** 檢查是否裝備
   * @param itemId 道具編號
   */
  private isEquip(itemId: number): boolean {
    return this.antiTDEquipItemIds.includes(itemId);
  }

  /** 點擊關閉道具列表 */
  @Emit('closeItemList')
  private closeItemList(): void {
    return;
  }

  /** 點擊道具
   * @param itemId 道具編號
   */
  @Emit('onClickItem')
  private onClickItem(itemId: number): void {
    return;
  }

  /** 取得英雄道具類型
   * @param heroId 英雄編號
   */
  @Watch('heroId')
  private getHeroItemTypes(heroId: number) {
    const newHeroData = HeroManager.getHeroData(heroId);
    if (newHeroData == null) {
      return;
    }

    this.heroItemTypes = JSON.parse(newHeroData.antiTDItemTypes);
  }
}
</script>

<style lang="scss" scoped>
.scrollbar::-webkit-scrollbar {
  width: 7px;
  height: 14px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
