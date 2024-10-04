<template>
  <el-dialog class="hero-chang-wrapper" :visible.sync="replaceDialog" :lock-scroll="false" top="20px">
    <!-- 上方頭像替換 -->
    <div slot="title" class="top-area">
      <HeroAvatar
        v-if="onlineHero"
        :heroListData="onlineHero"
        :isShowChange="false"
        :isHalf="false"
        class="<xl:max-w-700px <sm:max-w-300px"
      />
    </div>
    <!-- 英雄清單 -->
    <div class="replace-hero-list">
      <div class="hero-card-item" v-for="(hero, index) in heroCards" :key="index">
        <HeroCard
          :heroListData="hero"
          :isShowMask="true"
          :isShowOnlineItem="hero.locked === false"
          :isLockMessage="false"
          @changeOnline="onSelectHero(hero)"
        />
      </div>
    </div>
    <!-- 確認英雄彈窗 -->
    <ConfirmDialog :confirmDialogVisible="isShowConfirmDialog" @closeConfirmDialog="onConfirm">
      <template v-slot>
        <p>
          {{ textData.comfirmSelect }}
          <span>{{ $t(`common.${selectedHero.name}`) }}</span>
        </p>
        <div text="[#ff0000]">{{ textData.changeHint }}</div>
      </template>
    </ConfirmDialog>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, ModelSync } from 'vue-property-decorator';
import HeroAvatar from '@/components/WorldContest/Detall/HeroAvatar.vue';
import { Message } from '@/helper/class/Common';
import HeroCard from '@/components/Public/HeroCard.vue';
import { HeroTeamNet, HeroListData } from '@/helper/interface/Hero';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog.vue';

@Component({
  components: {
    HeroAvatar,
    HeroCard,
    ConfirmDialog,
  },
})
export default class ReplaceHero extends Vue {
  @ModelSync('msgVisible', 'change', { type: Boolean })
  public readonly replaceDialog!: boolean;

  /** 文字資料 */
  private textData = {
    comfirmSelect: '確定選擇',
    changeHint: '*按下確定後,裡宇宙隊伍陣容也會改變喔!',
  };

  /** 選中英雄 */
  private selectedHero!: HeroListData;

  /** 開關切換出戰英雄框 */
  private isShowConfirmDialog: boolean = false;

  /** 出戰英雄 */
  private get onlineHero(): HeroListData | undefined {
    return this.$$store.getters.onlineHero;
  }

  /** 英雄列表 */
  private get heroCards(): HeroListData[] {
    return this.$$store.state.HeroManagerModule.heroList;
  }

  /** 選中英雄 */
  private onSelectHero(hero: HeroListData): void {
    this.selectedHero = hero;
    this.isShowConfirmDialog = true;
  }

  /** 關閉英雄確認彈窗
   * @param isComfirm 是否確定
   */
  private async onConfirm(isComfirm: boolean): Promise<void> {
    // 關閉彈窗
    this.isShowConfirmDialog = false;

    // 取消
    if (isComfirm === false) {
      return;
    }

    await this.putHeroTeam();
  }

  /** 更換出戰英雄 */
  private async putHeroTeam(): Promise<void> {
    try {
      // 組成封包
      const data: HeroTeamNet = {
        subjectSeat: this.$$store.getters.subjectSeat,
        hid: this.selectedHero.hid,
      };

      // API 更換出戰英雄
      await this.$$store.dispatch('onChangeHero', data);

      // 成功提示
      Message.success('更換成功!');
    } catch (e) {
      return;
    }
  }

  /** 關閉彈窗 */
  @Emit('handleClose')
  private handleClose(): void {
    return;
  }

  /** 更換英雄頭像 */
  @Emit('handleChangAvatar')
  private handleChangAvatar(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.replace-hero-list {
  margin: auto;
  display: grid;
  width: 100%;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, 1fr);
  row-gap: 20px;
  column-gap: 16px;
  overflow-x: scroll;
  padding: 20px 0px;
  @media (min-width: 426px) and (max-width: 1024px) {
    width: 95%;
  }
}
.replace-hero-list::-webkit-scrollbar-track {
  // margin: 0 35px;
  background-color: inherit;
  border: 1px solid #d9d6be;
  border-radius: 5px;
}
//捲軸寬度
.replace-hero-list::-webkit-scrollbar {
  height: 13px;
}
//捲軸本體顏色
.replace-hero-list::-webkit-scrollbar-thumb {
  background: #cbcbcb;
  border-radius: 5px;
}
.hero-card-item {
  width: 210px;
  height: 300px;
}
@media (max-width: 435px) {
  ::v-deep .el-dialog__headerbtn {
    top: 35px;
    right: 5px;
  }
}
</style>
