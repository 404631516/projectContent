<template>
  <div class="flex flex-col" bg="[#f9f4e1]">
    <p class="items-center" m="t-3" text="34px [#D69F05]">{{ textData.selectRepresentHero }}</p>
    <p class="items-center" text="24px [#D69F05]">{{ textData.representLeader }}</p>
    <div class="hero-card-lists">
      <div class="flex">
        <div class="hero-card-item" v-for="(hero, heroCardIndex) in heroCards" :key="heroCardIndex">
          <HeroCard
            :heroListData="hero"
            :isShowMask="true"
            :isShowInfo="true"
            :isShowOnlineItem="hero.locked === false"
            :isLockMessage="true"
            :canUnlockHero="lockMessage"
            :isCursorPointer="true"
            @changeOnline="openConfirmHeroDialog(heroCardIndex)"
            @unlockHero="openUnlockHeroDialog(heroCardIndex)"
            @onOpenHeroInfoDialog="onOpenHeroInfoDialog(hero)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import HeroCard from '@/components/Public/HeroCard.vue'; // 英雄卡片
import { HeroListData } from '@/helper/interface/Hero';

@Component({
  components: {
    HeroCard,
  },
})
export default class FirstHeroDialog extends Vue {
  /** 是否顯示可解鎖 */
  @Prop(Boolean) private lockMessage!: boolean;

  private textData = {
    selectRepresentHero: '選擇代表英雄',
    representLeader: '代表英雄同時為塔防及裡宇宙隊伍隊長',
  };

  /** 英雄隊伍 */
  private get heroCards(): HeroListData[] {
    return this.$$store.state.HeroManagerModule.heroList;
  }

  /** 是否為上場英雄 */
  private isHeroOnline(hid: number): boolean {
    return this.$$store.getters.onlineHeroHId === hid;
  }

  @Emit('openConfirmHeroDialog')
  /** 開啟英雄確認彈窗 */
  private openConfirmHeroDialog(index: number) {
    return index;
  }
  @Emit('openUnlockHeroDialog')
  /** 開啟英雄解鎖彈窗 */
  private openUnlockHeroDialog(index: number) {
    return index;
  }

  @Emit('onOpenHeroInfoDialog')
  /** 開啟英雄說明輪播 */
  private onOpenHeroInfoDialog(heroData: HeroListData) {
    return;
  }
}
</script>
<style lang="scss" scoped>
.hero-card-lists {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: scroll;
  background: #f9f4e1;
  margin-bottom: 20px;
}
.hero-card-lists::-webkit-scrollbar-track {
  margin: 35px;
  border: 1px solid #fdc221;
  border-radius: 5px;
}
//捲軸寬度
.hero-card-lists::-webkit-scrollbar {
  margin: 10px;
  height: 13px;
}
//捲軸本體顏色
.hero-card-lists::-webkit-scrollbar-thumb {
  background: #fdc221;
  border-radius: 5px;
}
.hero-card-item {
  flex: 1 0 210px;
  height: 300px;
  margin: 10px 5px;
}
</style>
