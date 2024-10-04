<template>
  <div>
    <!-- 內容 -->
    <div
      class="w-full bg-[#E6D5F3] p-0 bg-bottom bg-no-repeat grid grid-cols-[1fr,2fr,3fr,1fr] <sm:overflow-auto scrollbar"
      :style="{ backgroundImage: `url(${imgData.dotPurpleUrl})` }"
    >
      <!-- 左邊箭頭 -->
      <div class="self-center object-contain ml-[-40%]" @click="changeSelectMemberIndex(teamMemberIndex - 1)">
        <img :src="imgData.leftArrowUrl" />
      </div>
      <!-- 英雄卡片 -->
      <div class="grid grid-rows-[64px,3fr,48px] pr-8">
        <!-- 英雄圖片 -->
        <div class="row-start-2">
          <!-- 英雄簡易元件 -->
          <HeroInfoComponent
            class="w-41 h-76.5"
            :heroListData="antiTDHeroTeam[teamMemberIndex]"
            :borderShapeType="BorderShapeType.NormalRect"
            :isShowAttribute="true"
            :isShowHeroItemType="true"
            :isShowLevel="true"
          >
            <template v-slot:remove>
              <div>
                <!-- 卸下文字-->
                <button
                  v-if="isVisibleRemoveText"
                  class="highlight-text relative bottom-[-290%] <sm:left-[4%]"
                  p="x-44px"
                  border="2 solid [#ffffff]"
                  @click="removeCurrentHeroData(teamMemberIndex)"
                >
                  {{ textData.removeSelectHeroCard }}
                </button>
              </div>
            </template>
          </HeroInfoComponent>
        </div>
      </div>
      <!-- 詳細資訊 -->
      <div class="grid grid-rows-[64px,3fr,48px]">
        <div class="w-full h-[64px] flex flex-row justify-between items-center">
          <!-- 小型隊伍列表 -->
          <div class="flex flex-col">
            <!-- 隊長旗幟 -->
            <div class="w-full h-[10%]">
              <div class="w-[20%] h-full flex justify-center items-center">
                <img :src="imgData.iconLeaderUrl" class="mt-[-30%]" />
              </div>
            </div>
            <!-- 小圓框頭像 -->
            <div class="grid grid-cols-5 gap-1">
              <div v-for="(heroData, index) in antiTDHeroTeam" :key="index" @click="teamMemberIndex = index">
                <HeroInfoComponent
                  class="h-[40px] w-[40px]"
                  :heroListData="heroData"
                  :borderShapeType="BorderShapeType.SmallCircle"
                />
              </div>
            </div>
            <!-- 粉色選擇線 -->
            <div class="h-[5px] grid grid-cols-5 gap-1 mt-[4px]">
              <div
                v-for="index in antiTDHeroTeam.length"
                :key="index"
                class="w-full h-full rounded-[10px]"
                :style="{
                  'background-color': selectVisibleUnderLine(index - 1),
                }"
              ></div>
            </div>
          </div>
          <!-- 清空所有隊員 -->
          <button
            class="w-[203px] h-[37px] grid grid-cols-[22px,150px] pl-5 items-center blueGradient rounded-[20px] shadow-default text-[20px] text-[#FFFFFF]"
            :disabled="isNoMemeber"
            @click="clearAllTeamMember"
          >
            <img :src="imgData.whiteCross" /><span class="flex justify-start pl-1">{{
              textData.clearAllTeamMember
            }}</span>
          </button>
        </div>
        <!-- 英雄詳細內文 -->
        <AntiTDHeroContent class="w-[646px] h-[307px]" :heroListData="antiTDHeroTeam[teamMemberIndex]" />
        <!-- INFO內容 -->
        <div
          class="w-full h-[38px] pl-[5px] my-[5px] flex items-center bg-[#8B48B1] rounded-[30px] text-[18px] text-[#FFFFFF]"
        >
          <img :src="imgData.infoIconUrl" class="inline-block w-[30px] h-[30px] <xl:(w-[24px] h-[24px])" />
          {{ textData.infoContentText }}
        </div>
      </div>
      <!-- 右邊箭頭 -->
      <div
        class="self-center object-contain mr-[-40%] transform rotate-y-180"
        @click="changeSelectMemberIndex(teamMemberIndex + 1)"
      >
        <img :src="imgData.leftArrowUrl" />
      </div>
    </div>
    <!-- 卡片列表 -->
    <div class="hero-card-lists w-[90%] py-[30px] px-[20px]">
      <div
        v-for="(heroCard, heroCardIndex) in heroCards"
        :key="heroCardIndex"
        class="w-[163px] h-[306px]"
        :class="heroCardIndex !== 0 ? 'ml-5' : ''"
        @click="changeCurrentHeroData(heroCard)"
      >
        <HeroInfoCard
          :heroListData="heroCard"
          :isLock="heroCard.locked"
          :isHighlight="isHeroHighlight(heroCard)"
          :isOnline="isHeroOnline(heroCard)"
          :isLeader="isTeamLeader(heroCard)"
          @onChangeLeader="onChangeLeader"
        />
      </div>
    </div>
    <!-- 確定按鈕 -->
    <div class="w-full flex justify-center items-center mt-[10px]">
      <button
        class="w-[203px] h-[37px] flex justify-center items-center text-[20px] text-[#FFFFFF] yellowGradient rounded-[20px]"
        @click="onSaveTeam(antiTDHeroTeam)"
      >
        {{ textData.confirmSelect }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { HeroListData } from '@/helper/interface/Hero';
import { BorderShapeType } from '@/helper/enum/Hero';
import HeroInfoComponent from '../Hero/HeroInfoComponent.vue';
import HeroInfoCard from '../Hero/HeroInfoCard.vue';
import AntiTDHeroContent from './AntiTDHeroContent.vue';

@Component({
  components: {
    /** 隊伍成員 在詳細資訊 左側卡片 */
    HeroInfoComponent,
    /** 下方 英雄列表選單 英雄卡片 */
    HeroInfoCard,
    /** 內文資訊 */
    AntiTDHeroContent,
  },
})
/** 逆塔防面板 點擊英雄卡片 彈出的 英雄位置上場編輯 面板 */
export default class AntiTDTeamEdit extends Vue {
  /** 隊伍上的 英雄資料列表 */
  @Prop(Array) private antiTDHeroTeam!: Array<HeroListData | undefined>;

  /** 初始選擇隊員位置 */
  @Prop(Number) private startTeamMemberIndex!: number;

  /** 選擇的隊員位置 */
  private teamMemberIndex: number = 0;

  /** 外框形狀 */
  private BorderShapeType = BorderShapeType;

  /** 圖片資料 */
  private imgData = {
    /** info圖片 */
    infoIconUrl: imgPath.infoIcon,
    /** 紫色點圖 */
    dotPurpleUrl: imgPath.purpleDot,
    /** 朝左箭頭 */
    leftArrowUrl: imgPath.arrow,
    /** 隊長旗幟 */
    iconLeaderUrl: imgPath.leaderIconUrl,
    /** 白色叉叉 */
    whiteCross: imgPath.whiteCrossUrl,
  };

  /** 文字資料 */
  private textData = {
    antiTDTeamLeader: '隊長',
    antiTDTeamMember: '隊員',
    removeSelectHeroCard: '卸下',
    clearAllTeamMember: '清空所有隊員',
    infoContentText: '更換隊長也會同時更換塔防及代表英雄',
    confirmSelect: '確定選擇',
  };

  /** 帳號持有的角色卡片資訊 */
  private get heroCards(): HeroListData[] {
    return this.$$store.state.HeroManagerModule.heroList;
  }

  /** 是否顯示卸下文字 */
  private get isVisibleRemoveText(): boolean {
    // 隊長不顯示
    if (this.teamMemberIndex === 0) {
      return false;
    }

    // 沒有英雄資料不顯示
    if (this.antiTDHeroTeam[this.teamMemberIndex] == null) {
      return false;
    }

    return true;
  }

  /** 是否無隊員 */
  private get isNoMemeber(): boolean {
    for (let i = 1; i < this.antiTDHeroTeam.length; i++) {
      if (this.antiTDHeroTeam[i] != null) {
        return false;
      }
    }
    return true;
  }

  created() {
    // 設定選中英雄
    this.teamMemberIndex = this.startTeamMemberIndex;
  }

  /** 更換選擇的成員編號
   *  @param value 選中英雄的順序
   */
  private changeSelectMemberIndex(value: number): void {
    this.teamMemberIndex = value;
    // 如果超過陣列長度回到0
    if (this.teamMemberIndex >= this.antiTDHeroTeam.length) {
      this.teamMemberIndex = 0;
    }
    // 如果小於0回到最大陣列長度
    if (this.teamMemberIndex < 0) {
      this.teamMemberIndex = this.antiTDHeroTeam.length - 1;
    }
  }

  /** 替換英雄
   *  @param heroListData 英雄資料
   */
  private changeCurrentHeroData(heroListData: HeroListData): void {
    // 被鎖住不能選
    if (heroListData.locked) {
      return;
    }

    // 重複英雄不能選
    const heroData = this.antiTDHeroTeam.find((hero) => (hero?.hid ?? 0) === heroListData.hid);
    if (heroData !== undefined) {
      return;
    }

    this.antiTDHeroTeam.splice(this.teamMemberIndex, 1, heroListData);
    this.onTeamUpdate(this.antiTDHeroTeam);
  }

  /** 卸下英雄 */
  private removeCurrentHeroData(): void {
    this.antiTDHeroTeam.splice(this.teamMemberIndex, 1, undefined);
    this.onTeamUpdate(this.antiTDHeroTeam);
  }

  /** 選擇中可見底線
   *  @param index 隊伍中的順序
   */
  private selectVisibleUnderLine(index: number): string {
    if (this.teamMemberIndex === index) {
      return '#C641F5';
    } else {
      return 'transparent';
    }
  }

  /** 清空所有隊員 */
  private async clearAllTeamMember(): Promise<void> {
    try {
      // 確認
      await this.$confirm(`確定要清空所有隊員嗎？`, '系統通知', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
      });

      // 清除隊員
      const empty = this.antiTDHeroTeam.slice(1).fill(undefined);
      this.antiTDHeroTeam.splice(1, this.antiTDHeroTeam.length - 1, ...empty);

      this.onTeamUpdate(this.antiTDHeroTeam);
    } catch (e) {
      return;
    }
  }

  /** 判斷是否為選擇中的英雄
   *  @param currentHero 現在選擇中的英雄
   */
  private isHeroHighlight(currentHero: HeroListData): boolean {
    if (currentHero.locked) {
      return false;
    }

    // 是否為選中英雄
    return currentHero.hid === this.antiTDHeroTeam[this.teamMemberIndex]?.hid;
  }

  /** 判斷是否為上場的英雄
   *  @param currentHero 現在選擇中的英雄
   */
  private isHeroOnline(currentHero: HeroListData): boolean {
    // 空位置
    if (currentHero == null) {
      return false;
    }

    // 選擇中優先順位較高, 選擇中不顯示上場
    if (this.isHeroHighlight(currentHero)) {
      return false;
    }
    // 未解鎖
    else if (currentHero.hid <= 0) {
      return false;
    }

    // 英雄在隊伍裡要顯示上場中
    return this.antiTDHeroTeam.find((hero) => (hero?.hid ?? 0) === currentHero.hid) !== undefined;
  }

  /** 判斷是否為隊長
   *  @param currentHero 現在選擇中的英雄
   */
  private isTeamLeader(currentHero: HeroListData): boolean {
    return this.antiTDHeroTeam[0]?.hid === currentHero.hid;
  }

  /** 替換隊伍隊長
   *  @param changeHero 要替換成隊長的英雄
   */
  private onChangeLeader(changeHero: HeroListData): void {
    const index = this.antiTDHeroTeam.findIndex((hero) => hero?.hid === changeHero.hid);
    if (index === -1) {
      this.antiTDHeroTeam.splice(0, 1, changeHero);
    } else {
      this.antiTDHeroTeam.splice(index, 1, this.antiTDHeroTeam[0]);
      this.antiTDHeroTeam.splice(0, 1, changeHero);
    }
  }

  /** 未儲存更新逆塔防隊伍
   * @param unsaveHeroTeam
   */
  @Emit('onTeamUpdate')
  private onTeamUpdate(unsaveHeroTeam: Array<HeroListData | undefined>): void {
    return;
  }

  /** 更新逆塔防隊伍
   * @param newAntiTDHeroTeam
   */
  @Emit('onSaveTeam')
  private onSaveTeam(newAntiTDHeroTeam: Array<HeroListData | undefined>): void {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  width: 90vw;
  max-width: 930px;
  border-radius: 30px;
}
::v-deep .el-dialog__body {
  height: auto;
  padding: 0%;
}
::v-deep .el-icon-close::before {
  font-weight: bold;
  font-size: 36px;
  color: #bfbfbf;
}
.hero-card-lists::-webkit-scrollbar {
  width: 7px;
  border: 1px solid #fdc221;
  border-radius: 5px;
}
.hero-card-lists::-webkit-scrollbar-track {
  border-radius: 5px;
}
.hero-card-lists::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 3px;
}
.antitd-team-edit-wrapper {
  background-color: #ffffff;
}
.hero-card-lists {
  display: flex;
  align-items: center;
  overflow-x: scroll;
  margin-left: 5%;
}
.highlight-text {
  margin-bottom: -19%;
  font-size: 19px;
  color: #ffffff;
  background: #ff5875b3;
  border-radius: 30px;
  box-shadow: 0px 3px 6px #000000cc;
  z-index: 10;
}
.scrollbar::-webkit-scrollbar {
  height: 10px;
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
