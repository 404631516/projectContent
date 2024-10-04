<template>
  <el-dialog :visible.sync="isDialogVisible" v-if="isDialogVisible">
    <div slot="title" font="bold" text="4xl [#666666]">
      {{ textData.title }}
    </div>
    <!-- 首抽卡片 -->
    <div>
      <div class="w-60 h-80" m="x-auto">
        <HeroCard :heroListData="heroCard" :isLockMessage="false" :isShowInfo="false" :isShowOnlineItem="false" />
      </div>
      <p text="2xl [#A5A5A5]">
        {{ textData.confirmInfo }}<span m="x-2" text="[#00CCCE]">{{ heroName }}</span
        >?
      </p>
    </div>
    <!-- 按鈕區 -->
    <div slot="footer" class="flex justify-evenly">
      <button
        @click="closeDialog"
        class="w-2/5 rounded-[60px] shadow-default"
        p="y-2"
        text="xl [#878787]"
        border="1 solid [#B9B9B9]"
      >
        {{ textData.cancel }}
      </button>
      <button
        @click="confirmHero"
        class="w-2/5 rounded-[60px] shadow-default yellowGradient"
        p="y-2"
        text="xl [#FFF]"
        border="1 solid transparent"
      >
        {{ textData.confirm }}
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { HeroListData } from '@/helper/interface/Hero';
import { Component, ModelSync, Vue, Prop, Emit } from 'vue-property-decorator';
import heroManager from '@/manager/HeroManager';
import HeroCard from '@/components/Public/HeroCard.vue'; // 英雄卡片
@Component({
  components: {
    HeroCard,
  },
})
export default class ConfirmFirstHero extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  @Prop({ default: -1 }) private firstHeroIndex!: number;
  /**文字資料*/
  private textData = {
    title: '再次確認',
    confirmInfo: '首抽確定選擇',
    cancel: '取消',
    confirm: '確定',
  };

  /**英雄靜態表 */
  private heroCards: HeroListData[] = heroManager.getDefaultHeroListData();
  /**英雄名字*/
  private get heroName() {
    let firstIndex = this.firstHeroIndex;
    return this.$t(`common.hero_${++firstIndex}`);
  }
  /**英雄卡片資料*/
  private get heroCard() {
    return this.heroCards[this.firstHeroIndex];
  }
  @Emit('closeDialog')
  private closeDialog() {
    return;
  }
  @Emit('confirmHero')
  private confirmHero() {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  border-radius: 30px;
  width: 100%;
  max-width: 390px;
}
::v-deep .el-dialog__body {
  padding: 0px;
}
::v-deep .el-icon-close:before {
  font-size: 36px;
  font-weight: 700;
}
</style>
