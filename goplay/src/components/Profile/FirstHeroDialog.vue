<template>
  <el-dialog :visible="true" :fullscreen="true" :show-close="false">
    <!-- 首抽 Title -->
    <div slot="title" class="from-[#212121] via-[#47C931CB] to-[#212121]" p="y-[10px]" bg="gradient-to-r">
      <h2 font="bold" text="5xl [#FFF] shadow-black" m="b-2">
        {{ textData.firstSelect }}
      </h2>
      <p text="3xl [#FFF]">{{ textData.direction }}</p>
    </div>
    <!-- 英雄列表 -->
    <div p="t-1 b-3" bg="[#FFF]">
      <p text="[#1BDEDE] xl">
        Tip:<span text="[#666666]">{{ textData.tip }}</span>
      </p>
      <div class="grid w-7/10 overflow-x-auto scrollbar" data="FIRST_HERO_CONTAINER" grid="rows-2 flow-col" m="x-auto">
        <div v-for="(item, heroCardIndex) in heroCards" :key="heroCardIndex" class="w-60 h-80" m="x-2 y-1">
          <HeroCard
            :data="`HERO_CARD_${heroCardIndex}`"
            :heroListData="item"
            :isShowInfo="true"
            :isShowOnlineItem="false"
            :isLockMessage="false"
            :isHeroSelect="chooseHeroIndex === heroCardIndex"
            @selectHero="toggleSelect(heroCardIndex)"
            @onOpenHeroInfoDialog="onOpenHeroInfoDialog(item)"
          />
        </div>
      </div>
    </div>
    <!-- 確定按鈕 -->
    <div slot="footer">
      <button
        data="FIRST_SELECT_BUTTON"
        @click="chooseHero()"
        v-show="this.chooseHeroIndex != -1"
        class="w-3/4 max-w-[500px] yellowGradient rounded-[20px]"
        p="y-5"
        text="3xl [#FFF]"
      >
        {{ textData.comfirmSelect }}
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import HeroCard from '@/components/Public/HeroCard.vue'; // 英雄卡片
import { HeroListData } from '@/helper/interface/Hero';
import heroManager from '@/manager/HeroManager';
@Component({
  components: {
    HeroCard,
  },
})
export default class FirstHeroDialog extends Vue {
  /**文字資料 */
  private textData = {
    firstSelect: '首抽',
    direction: '請選擇一張你喜歡的角色',
    tip: '其他沒選到的角色之後可以用積分進行解鎖',
    comfirmSelect: '確定選擇',
  };
  /**英雄靜態表 */
  private heroCards: HeroListData[] = heroManager.getDefaultHeroListData();
  /**目前選到的英雄 Index */
  private chooseHeroIndex: number = -1; // 英雄選擇序號

  /** 加入/移除英雄選擇列表項目
   * @param index 英雄列表序號
   */
  private toggleSelect(index: number) {
    this.chooseHeroIndex = index;
  }

  @Emit('onOpenHeroInfoDialog')
  /** 開啟英雄說明輪播 */
  private onOpenHeroInfoDialog(heroId: number) {
    return;
  }

  @Emit('chooseHero')
  private chooseHero() {
    return this.chooseHeroIndex;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  background: #212121;
}
::v-deep .el-dialog__body {
  padding: 10px 0px 10px 0px;
}
::v-deep .el-dialog__footer {
  text-align: center;
}
.scrollbar::-webkit-scrollbar {
  width: 7px;
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
