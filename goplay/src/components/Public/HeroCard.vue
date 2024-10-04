<template>
  <div class="w-full h-full relative flex items-center justify-center" :class="{ 'select-state': isHeroSelect }">
    <!-- 半透明遮罩 -->
    <div
      v-if="isShowMask && heroListData.locked"
      class="w-[95%] h-[95%] absolute rounded-[10px] flex items-center justify-center"
      :class="isCursorPointer ? 'cursor-pointer' : 'cursor-default'"
      bg="[#00000080]"
      @click="unlockHero"
    >
      <!-- 解鎖提示字 -->
      <p v-if="isLockMessage" font="bold" :text="canUnlockHero ? '32px [#2ceaec]' : '32px [#eeeeee]'">
        {{ canUnlockHero ? textData.clickUnlocked : textData.notYetUnlocked }}
      </p>
    </div>
    <!-- 卡片圖 -->
    <div
      class="w-[90%] h-[90%] flex flex-col justify-between items-center rounded-[10px] card-shadow"
      bg="no-repeat center"
      :style="{ backgroundImage: `url(${heroCardImg})`, backgroundSize: `100% 100%` }"
      @click="selectHero"
    >
      <!-- 上方資訊列 -->
      <div class="w-full h-[15%] flex justify-between">
        <!-- 資訊紐 -->
        <img v-if="isShowInfo" class="h-full z-10" :src="imgData.infoIcon" @click="onOpenHeroInfoDialog" />
        <!-- 屬性 -->
        <img class="h-full transform scale-135 object-contain" :src="heroAttributeImg" />
        <!-- 等級 -->
        <span
          v-if="!heroListData.locked"
          v-show="heroListData.level"
          class="w-[60%] h-full flex items-center justify-center rounded-[30px] col-start-3"
          text="24px [#ffde39]"
          bg="[#000000cc]"
        >
          {{ textData.level }} {{ heroListData.level }}
        </span>
      </div>
      <!-- 下方按鈕列 -->
      <div v-if="isShowOnlineItem" class="w-[90%] h-[12%]" m="b-[5%]">
        <!-- 上場中 -->
        <button
          v-if="heroListData.online"
          class="w-full h-full rounded-[30px] flex items-center justify-center box-shadow"
          border="2px solid [#FFFFFF]"
          text="20px [#ffde39]"
          bg="[#000000cc]"
        >
          {{ textData.isOnline }}
        </button>
        <!-- 換我上場 -->
        <button
          v-else
          class="w-full h-full rounded-[30px] flex items-center justify-center box-shadow cursor-pointer"
          border="2px solid [#FFFFFF]"
          text="20px [#FFFFFF]"
          bg="[#47d800d9]"
          @click="changeOnline"
        >
          {{ textData.changeToOnline }}
        </button>
      </div>
      <!-- 選擇中 -->
      <div v-show="isHeroSelect" class="w-[90%] h-[12%]" m="b-[5%]">
        <button
          class="w-full h-full rounded-[30px] flex items-center justify-center box-shadow cursor-pointer"
          border="2px solid [#FFFFFF]"
          text="20px [#FFFFFF]"
          bg="[#47d800d9]"
        >
          {{ textData.isSelect }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';
import { HeroListData } from '@/helper/interface/Hero';
import HeroManager from '@/manager/HeroManager';

@Component({})
export default class HeroCard extends Vue {
  /** 英雄資料 */
  @Prop() private heroListData!: HeroListData;
  /** 是否顯示遮罩 */
  @Prop(Boolean) private isShowMask!: boolean;
  /** 是否顯示資訊鈕 */
  @Prop(Boolean) private isShowInfo!: boolean;
  /** 是否顯示上場 */
  @Prop(Boolean) private isShowOnlineItem!: boolean;
  /** 是否顯示鎖定訊息 */
  @Prop(Boolean) private isLockMessage!: boolean;
  /** 被選到英雄 */
  @Prop(Boolean) private isHeroSelect!: boolean;
  /** 積分足夠顯示文字不同 */
  @Prop(Boolean) private canUnlockHero!: boolean;
  /** 頁面型態 */
  @Prop(Boolean) private isCursorPointer!: boolean;

  /** 圖片資料 */
  private textData = {
    clickUnlocked: '點擊解鎖',
    notYetUnlocked: '尚未解鎖',
    level: 'Lv',
    isOnline: '上場中',
    changeToOnline: '換我上場',
    isSelect: '選擇中',
  };

  /** 圖片資料 */
  private imgData = {
    infoIcon: imgPath.heroInfoIconBaseUrl,
  };

  /** 取得英雄屬性圖片 */
  private get heroAttributeImg(): string {
    return AttributeHelper.getAttributeIconImgUrl(this.heroListData.attribute);
  }

  /** 取得英雄圖片 */
  private get heroCardImg(): string {
    return HeroManager.getHeroCardUrl(this.heroListData.url);
  }

  /** 替換英雄上場 */
  @Emit('changeOnline')
  private changeOnline() {
    return;
  }

  /** 解鎖英雄 */
  @Emit('unlockHero')
  private unlockHero() {
    return;
  }

  /** 選擇英雄 */
  @Emit('selectHero')
  private selectHero() {
    return;
  }

  /** 開啟英雄資訊 */
  @Emit('onOpenHeroInfoDialog')
  private onOpenHeroInfoDialog() {
    return;
  }
}
</script>

<style lang="scss" scoped>
.select-state {
  border-radius: 10px;
  outline: 5px solid #7dff47;
  box-shadow: 1px 6px #358612, inset 3px 3px #358612;
}
.box-shadow {
  box-shadow: 0px 3px 6px #000000e0;
}
.card-shadow {
  box-shadow: 5px 5px 15px #00000080;
}
</style>
