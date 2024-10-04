<template>
  <div
    class="antitd-hero-content-wrapper w-full h-full flex flex-col justify-start items-center rounded-10px"
    border="2px solid [#9D9D9D]"
  >
    <!-- 有英雄 -->
    <template v-if="heroListData">
      <!-- 英雄名字和等級 -->
      <div
        class="w-[90%] py-[8px] flex justify-start items-center text-[32px] text-[#B965C9]"
        border="b-2 solid [#9D9D9D]"
      >
        {{ antiTDInfo.heroName }} Lv {{ this.heroListData.level }}
      </div>
      <!-- 內文 -->
      <div class="w-[90%] mt-[2%] mb-[2%] overflow-auto scrollbar space-y-2" text="left lg [#000000]" font="semibold">
        <!-- 英雄屬性 -->
        <p class="flex items-center">
          {{ textData.attribute }}
          <img :src="antiTDInfo.heroAttributeUrl" class="h-40px object-contain" />
          <span text="20px [#5D5D5D]">{{ antiTDInfo.heroAttributeName }}</span>
        </p>
        <!-- 可裝備道具種類 -->
        <div class="flex items-center">
          {{ textData.equipItemType }}
          <p
            v-for="(antiTDItemType, index) in antiTDInfo.antiTDItemTypes"
            :key="index"
            class="flex-row items-center mr-5px"
          >
            <img :src="antiTDItemType.antiTDItemTypeUrl" class="h-40px object-contain" />
            <span text="20px [#5D5D5D]">{{ antiTDItemType.antiTDItemTypeName }}</span>
          </p>
        </div>
        <!-- 道具名稱 -->
        <p>
          {{ textData.itemType }}
          <span text="20px [#5D5D5D]" m="l-2">{{ antiTDInfo.normalAttackItemName }}</span>
        </p>
        <!-- 基本攻擊力 -->
        <p>
          {{ textData.baseAttack }}
          <span text="20px [#5D5D5D]" m="l-2">{{ antiTDInfo.heroAntiTDAttack }}</span>
        </p>
        <!-- 冷卻時間 -->
        <p>
          {{ textData.coolDown }}
          <span text="20px [#5D5D5D]" m="l-2"
            >{{ antiTDInfo.coolDown }}
            s
          </span>
        </p>
        <!-- 攻擊範圍 -->
        <p>
          {{ textData.attackRange }}
          <span text="20px [#5D5D5D]" m="l-2">{{ antiTDInfo.attackRange }}</span>
        </p>
        <!-- 英雄逆塔防血量 -->
        <p>
          {{ textData.heroAntiHP }}
          <span text="20px [#5D5D5D]" m="l-2">{{ antiTDInfo.heroAntiTDHp }}</span>
        </p>
        <!-- 英雄逆塔防防禦 -->
        <p>
          {{ textData.heroAntiDefense }}
          <span text="20px [#5D5D5D]" m="l-2">{{ antiTDInfo.heroAntiTDDefense }}</span>
        </p>
      </div>
    </template>
    <!-- 空英雄 -->
    <template v-else>
      <div class="w-[100%] h-[100%] flex justify-center items-center text-[28px] text-[#3A3A3A]">
        {{ textData.pleaseSelectHero }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import { HeroListData } from '@/helper/interface/Hero';
import { AntiTDInfo } from '@/helper/interface/AntiTD';
import AntiTDHelper from '@/views/H5/Games/AntiTDGame/Component/AntiTDHelper';

/** 隊伍英雄面板中的 詳細資訊內文 */

@Component({})
export default class AntiTDHeroContent extends Vue {
  /** 英雄資料列表 */
  @Prop() private heroListData!: HeroListData;

  /** 英雄相關資料 */
  private antiTDInfo!: AntiTDInfo;

  /** 文字資料 */
  private textData = {
    attribute: '屬性',
    equipItemType: '可裝備道具種類',
    itemType: '類型',
    baseAttack: '基本攻擊力',
    coolDown: '冷卻時間',
    attackRange: '攻擊距離',
    heroAntiHP: '血量',
    heroAntiDefense: '防禦',
    pleaseSelectHero: '請選擇下方英雄',
  };

  created() {
    this.updateAntiTDItem();
  }

  @Watch('heroListData')
  private updateAntiTDItem(): void {
    // 空英雄
    if (this.heroListData == null) {
      return;
    }
    this.antiTDInfo = AntiTDHelper.getAntiTDInfo(this.heroListData)!;
  }
}
</script>

<style scoped>
.scrollbar::-webkit-scrollbar {
  width: 7px;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  background-color: #ffffff;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
