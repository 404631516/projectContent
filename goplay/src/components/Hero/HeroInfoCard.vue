<template>
  <div class="w-41 h-76.5 flex flex-col-reverse justify-center items-center relative">
    <!-- 未解鎖-->
    <template v-if="isLock">
      <div
        class="w-full h-full flex justify-center items-center absolute rounded-[20px] z-10"
        text="28px [#ffffff]"
        bg="[#00000080]"
      >
        {{ textData.unlockText }}
      </div>
    </template>
    <!-- 選取中 -->
    <template v-if="isHighlight">
      <!-- 選取邊框-->
      <div
        class="highlight-border w-[114%] h-[110%] top-[-7%] left-[-8%] flex justify-center items-center absolute"
        border="5 solid [#7DFF47]"
      />
    </template>
    <div class="w-[80%] h-full flex flex-col-reverse absolute" m="b-23">
      <!-- 選取文字-->
      <div
        v-if="isHighlight"
        class="rounded-[30px] z-10 shadow-default"
        m="t-1"
        text="xl [#ffffff]"
        border="2 solid [#ffffff]"
        bg="[#03ff35b3]"
      >
        {{ textData.selectText }}
      </div>
      <!-- 上場中-->
      <div
        v-if="isOnline"
        class="rounded-[30px] z-10 shadow-default"
        m="t-1"
        text="xl [#ffffff]"
        border="2 solid [#ffffff]"
        bg="[#d59434cc]"
      >
        {{ textData.onlineText }}
      </div>
      <!-- 換成隊長 -->
      <button
        v-if="isLock === false && isLeader === false"
        class="rounded-[30px] z-10 shadow-default from-[#2FF994] to-[#15CE00]"
        m="t-1"
        text="xl [#ffffff]"
        bg="gradient-to-b"
        @click="onChangeLeader(heroListData)"
      >
        {{ textData.changeLeaderText }}
      </button>
    </div>
    <!-- 英雄簡易元件 -->
    <HeroInfoComponent
      :heroListData="heroListData"
      :borderShapeType="BorderShapeType.NormalRect"
      :isShowLevel="true"
      :isShowAttribute="true"
      :isShowHeroItemType="true"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { HeroListData } from '@/helper/interface/Hero';
import { BorderShapeType } from '@/helper/enum/Hero';
import HeroInfoComponent from './HeroInfoComponent.vue';

@Component({
  components: {
    HeroInfoComponent,
  },
})
export default class HeroInfoCard extends Vue {
  /** 英雄資訊 */
  @Prop(Object) private heroListData!: HeroListData;
  /** 是否 選取中 */
  @Prop(Boolean) private isHighlight!: boolean;
  /** 是否 已解鎖 需要已解鎖 才可以觸發 onClick事件 */
  @Prop(Boolean) private isLock!: boolean;
  /** 是否已上場 */
  @Prop(Boolean) private isOnline!: boolean;
  /** 是否為隊長 */
  @Prop(Boolean) private isLeader!: boolean;

  /** 外框形狀 */
  private BorderShapeType = BorderShapeType;

  /** 文字資料 */
  private textData = {
    unlockText: '尚未解鎖',
    selectText: '選擇中',
    onlineText: '上場中',
    changeLeaderText: '換成隊長',
  };

  /** 替換隊長 */
  @Emit('onChangeLeader')
  private onChangeLeader(heroListData: HeroListData): void {
    return;
  }
}
</script>

<style lang="scss" scoped>
.highlight-border {
  border-radius: 25px;
  box-shadow: 1px 6px #358612, inset 3px 3px #358612;
  z-index: 10;
}
</style>
