<template>
  <div class="rounded-[10px]" :bg="listType === PlanetWarType.Outter ? '[#F3EDD5]' : '[#E6D5F3]'" p="x-5 y-2">
    <!-- 標頭 -->
    <div class="grid grid-cols-[0.5fr,1fr,0.5fr] items-center">
      <div
        class="col-start-2"
        :class="listType === PlanetWarType.Outter ? 'text-[#D69F05]' : 'text-[#B164CC]'"
        p="y-3"
        text="center 22px"
        font="bold"
      >
        {{ listType === PlanetWarType.Outter ? textData.weaponTitle : textData.antiTDTitle }}
      </div>
      <!-- 編輯按鈕 -->
      <button
        class="rounded-[60px] yellowGradient shadow-default w-18 justify-self-end"
        text="[#FFF]"
        @click="onOpenEditDialog"
      >
        {{ textData.edit }}
      </button>
    </div>
    <div class="grid grid-cols-4 gap-3">
      <!-- 生物兵器 -->
      <template v-if="listType === PlanetWarType.Outter">
        <TheWeapon class="w-22 h-22" :weaponId="id" v-for="id in weaponList" :key="id" />
        <!-- 空的 -->
        <TheWeapon class="w-22 h-22" v-for="(emptyNum, index) in notEquipmentNum" :key="`${index}*`" />
      </template>
      <!-- 逆塔防隊伍 -->
      <template v-else>
        <HeroInfoComponent
          class="w-22 h-22"
          v-for="(heroData, index) in memberList"
          :key="index"
          :heroListData="heroData"
          :borderShapeType="BorderShapeType.SmallSquare"
          :isShowAttribute="true"
          :isShowLevel="true"
          :isShowHeroItemType="true"
        />
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import TheWeapon from '@/components/Public/TheWeapon.vue';
import HeroInfoComponent from '@/components/Hero/HeroInfoComponent.vue';
import { HeroListData } from '@/helper/interface/Hero';
import WeaponManager from '@/manager/WeaponManager';
import { PlanetWarType } from '@/helper/enum/Common';
import { BorderShapeType } from '@/helper/enum/Hero';

@Component({
  components: {
    TheWeapon,
    HeroInfoComponent,
  },
})
export default class EquipmentList extends Vue {
  /**目前裝備的逆塔防隊伍 */
  @Prop(Array) private heroList!: HeroListData[];
  /**目前裝備的生物兵器 */
  @Prop(Array) private weaponList!: number[];
  /**樣式選擇逆塔防或是生物兵器 */
  @Prop() private listType!: PlanetWarType;

  /** 逆塔防隊伍不含隊長 */
  private memberList: HeroListData[] = [];

  created() {
    this.updateTeamList();
  }

  /** 文字資料 */
  private textData = {
    weaponTitle: '表宇宙生物兵器',
    antiTDTitle: '裡宇宙隊伍',
    edit: '編輯',
  };

  /** 逆塔防跟塔防 enum */
  private PlanetWarType = PlanetWarType;

  /** 外框形狀 */
  private BorderShapeType = BorderShapeType;

  /** 計算有幾個空的 */
  private get notEquipmentNum(): number {
    return WeaponManager.weaponItemMax - this.weaponList.length;
  }

  /** 更新隊伍顯示 */
  @Watch('heroList')
  private updateTeamList(): void {
    // 消除隊長資料
    this.memberList = this.heroList.slice(1, this.heroList.length);
  }

  /** 點擊編輯按鈕 */
  @Emit('onOpenEditDialog')
  private onOpenEditDialog(): void {
    return;
  }
}
</script>
