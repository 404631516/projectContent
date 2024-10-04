<template>
  <div class="flex flex-col justify-center items-center">
    <!-- 英雄簡易元件 -->
    <div class="w-41 h-76.5 flex justify-center relative" m="b-1" @click="onClickHero">
      <!-- 換成隊長 -->
      <div v-if="isTeamIndex !== 0 && heroListData" class="w-[80%] h-full flex flex-col-reverse absolute">
        <button
          class="rounded-[30px] z-10 shadow-default from-[#2FF994] to-[#15CE00]"
          m="t-1 b-12"
          text="xl [#ffffff]"
          bg="gradient-to-b"
          @click.stop="onChangeLeader"
        >
          {{ textData.changeLeaderText }}
        </button>
      </div>
      <slot name="leader"></slot>
      <HeroInfoComponent
        :heroListData="heroListData"
        :borderShapeType="BorderShapeType.NormalRect"
        :isShowLevel="true"
        :isShowAttribute="true"
        :isShowHeroItemType="true"
      />
    </div>
    <!-- 裝備列 -->
    <div class="w-full h-[20%] grid grid-cols-2 gap-x-1">
      <div v-for="(isHighlight, index) in selectHeroEquipItem.length" :key="index" @click="onClickEquipItem(index)">
        <AntiTDItemComponent
          class="w-78px h-78px"
          :itemId="getEquipItemId(index)"
          :isNameVisible="false"
          :isTypeVisible="true"
          :isEquipLocked="isEquipLocked[index]"
          :isHighlight="selectHeroEquipItem[index]"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { HeroListData } from '@/helper/interface/Hero';
import { BorderShapeType } from '@/helper/enum/Hero';
import HeroInfoComponent from '../Hero/HeroInfoComponent.vue';
import AntiTDItemComponent from './AntiTDItemComponent.vue';

@Component({
  components: {
    AntiTDItemComponent,
    HeroInfoComponent,
  },
})
/** 逆塔防 隊伍編輯面板內 英雄道具卡片 */
export default class AntiTDHeroCard extends Vue {
  /** 英雄資訊 */
  @Prop() private heroListData!: HeroListData;
  /** 選擇框控制 */
  @Prop(Array) private selectHeroEquipItem!: boolean[];
  /** 第二裝備格是否未解鎖 */
  @Prop(Array) private isEquipLocked!: boolean[];
  /** 隊伍順序 */
  @Prop(Number) private isTeamIndex!: number;

  /** 外框形狀 */
  private BorderShapeType = BorderShapeType;

  /** 文字資料 */
  private textData = {
    changeLeaderText: '換成隊長',
  };

  /** 取得道具編號 */
  private getEquipItemId(index: number): number {
    return this.heroListData?.equipItemIds[index] ?? 0;
  }

  /**點擊 英雄卡片 */
  @Emit('onClickHero')
  private onClickHero(): void {
    return;
  }

  /**點擊 英雄裝備的道具
   * @param itemIndex 點擊道具位置
   */
  @Emit('onClickEquipItem')
  private onClickEquipItem(itemIndex: number): void {
    return;
  }

  /** 替換隊長 */
  @Emit('onChangeLeader')
  private onChangeLeader(): void {
    return;
  }
}
</script>

<style lang="scss" scoped></style>
