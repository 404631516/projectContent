<template>
  <div>
    <!-- 道具彈窗 -->
    <div v-if="isAntiTDItemContent">
      <AntiTDItemContent
        v-model="isAntiTDItemContent"
        :itemId="clickedItemId"
        :isEquip="isItemEquiped"
        :isLock="isItemLocked"
        :userInfo="userInfo"
        @onEquip="onEquipItem"
        @onUnequip="onUnequipItem"
        @onBuy="onBuyItem"
        @closeDialog="isAntiTDItemContent = false"
      />
    </div>
    <!-- 隊伍介面 -->
    <div
      class="relative bg-no-repeat"
      :style="{ backgroundImage: `url(${imgData.bgDot})` }"
      bg="[#E6D5F3] bottom"
      p="y-2 x-3"
    >
      <!-- 提示區 -->
      <div class="flex items-center justify-between">
        <!-- 說明彈窗按鈕 -->
        <button
          class="flex items-center rounded-80px shadow-default"
          p="x-2 y-1"
          border="2px solid [#FFF]"
          bg="[#000]"
          text="20px [#FFF]"
          @click="onOpenAntiTDHintDialog"
        >
          <img class="w-27px aspect-square object-contain" :src="imgData.questionMark" />{{ textData.antiTDHint }}
        </button>
        <!-- 換隊長提示 -->
        <div class="rounded-10px flex items-center" p="x-2 y-2" bg="[#4A4A4A]" text="18px [#FFF]">
          <img class="aspect-square w-30px object-contain inline-block" :src="imgData.exclamationMark" />{{
            textData.antiTDInfo
          }}
        </div>
      </div>
      <!-- 英雄卡 -->
      <div class="flex overflow-auto overflow-y-hidden scrollbar" m="y-5" p="t-2 <sm:b-10">
        <AntiTDHeroCard
          class="w-full h-110"
          p="x-2"
          v-for="(heroListData, index) in antiTDHeroTeam"
          :key="index"
          :border="index == 0 ? 'r-1 solid [#707070]' : ''"
          :heroListData="heroListData"
          :selectHeroEquipItem="selectHeroEquipItem(heroListData)"
          :isEquipLocked="AntiTDManager.isEquipLocked(heroListData)"
          :isTeamIndex="index"
          @onChangeLeader="onChangeLeader(index)"
          @onClickHero="onClickHero(index)"
          @onClickEquipItem="onClickItem(index, $event)"
        >
          <template v-slot:leader>
            <div
              v-if="index === 0"
              class="w-[100px] h-[40px] flex justify-center items-center bg-[#000000CC] rounded-[30px] absolute mt-[5%] ml-[10px] left-[-4%] top-[12%]"
              text="20px [#FFFFFF]"
            >
              <img :src="imgData.iconLeaderUrl" class="w-27px aspect-square object-contain mr-1" />
              {{ textData.leaderText }}
            </div>
          </template>
        </AntiTDHeroCard>
      </div>
      <!-- 道具列 -->
      <div v-if="isShowItemList">
        <AntiTDitemList
          class="absolute w-884px h-246px -bottom-230px <sm:w-[90%]"
          :userInfo="userInfo"
          :antiTDItemIds="userInfo.antiTDItemList"
          :antiTDEquipItemIds="equipItemList"
          :heroId="clickedItemHeroId"
          @onClickItem="openItemContent"
          @closeItemList="closeItemList"
        />
      </div>
    </div>
    <!-- 按鈕區 -->
    <div
      class="grid grid-cols-[200px,200px,1fr] gap-x-2 <sm:flex <sm:flex-col <sm:items-center"
      m="t-20px"
      p="x-3"
      text="20px [#FFF]"
    >
      <!-- 清空所有隊員 -->
      <button
        class="blueGradient rounded-[20px] shadow-default grid grid-cols-[22px,150px] <sm:mb-2"
        p="y-2 l-5"
        :disabled="isNoMemeber"
        @click="onClickClearAntiTDMember"
      >
        <img :src="imgData.whiteCross" /><span class="flex justify-start pl-1">{{ textData.cleanTeam }}</span>
      </button>
      <!-- 清空所有道具 -->
      <button
        class="blueGradient rounded-[20px] shadow-default grid grid-cols-[22px,150px] <sm:mb-2"
        p="y-2 l-5"
        :disabled="false"
        @click="onClickClearAllHeroItem"
      >
        <img :src="imgData.whiteCross" /><span class="flex justify-start pl-1">{{ textData.cleanItem }}</span>
      </button>
      <!-- 儲存隊伍 -->
      <button
        class="yellowGradient rounded-[60px] w-200px shadow-default justify-self-end <sm:mb-2"
        p="y-2"
        @click="onSaveTeam(antiTDHeroTeam)"
      >
        {{ textData.saveTeam }}
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Emit, Prop, Watch } from 'vue-property-decorator';
import AntiTDHeroCard from '@/components/AntiTD/AntiTDHeroCard.vue';
import AntiTDitemList from '@/components/AntiTD/AntiTDItemList.vue';
import { HeroListData } from '@/helper/interface/Hero';
import { PlanetUserInfoData } from '@/helper/interface/PlanetWar';
import { AntiTDDialogType } from '@/helper/enum/AntiTD';
import { Message } from '@/helper/class/Common';
import imgPath from '@/config/imgPath/imgPath';
import AntiTDItemContent from './AntiTDItemContent.vue';
import { planetWarUnlockHeroItemAPI } from '@/api/planetWar';
import { ResponseState } from '@/helper/enum/Common';
import AntiTDManager from '@/manager/AntiTDManager';

@Component({
  components: {
    AntiTDHeroCard,
    AntiTDitemList,
    AntiTDItemContent,
  },
})
export default class AntiTDDialogContent extends Vue {
  /** 使用者資料 */
  @Prop() private userInfo!: PlanetUserInfoData;
  /** 逆塔防隊伍資料 */
  @Prop(Array) private antiTDHeroTeam!: Array<HeroListData | undefined>;

  /** 被選中的英雄 */
  private selectedHeroIndex: number = -1;

  /** 被選中的道具 */
  private selectedItemIndex: number = -1;

  /** 顯示道具清單 */
  private isShowItemList: boolean = false;

  /** 裝備道具數量 */
  private readonly antiTDItemCount: number = 2;

  /** 道具彈窗開關 */
  private isAntiTDItemContent: boolean = false;

  /** 道具列表對應英雄hid */
  private clickedItemHeroId: number = 0;

  /** 道具列表被點擊道具id */
  private clickedItemId: number = 0;

  /** 道具列表點擊道具是否已解鎖 */
  private isItemLocked: boolean = true;

  /** 道具列表點擊道具是否已裝備 */
  private isItemEquiped: boolean = false;

  /** 逆塔防狀態 enum */
  private AntiTDDialogType = AntiTDDialogType;

  private AntiTDManager = AntiTDManager;

  /** 文字資料 */
  private textData = {
    antiTDHint: '裡宇宙隊伍編輯',
    antiTDInfo: '更換隊長也會同時更換塔防及代表英雄',
    cleanTeam: '清空所有隊員',
    cleanItem: '清空所有道具',
    saveTeam: '儲存隊伍設定',
    leaderText: '隊長',
  };

  /** 圖片資料 */
  private imgData = {
    exclamationMark: imgPath.noticeUrl,
    questionMark: imgPath.blueQuestionMark,
    bgDot: imgPath.purpleDot,
    iconLeaderUrl: imgPath.leaderIconUrl,
    whiteCross: imgPath.whiteCrossUrl,
  };

  /** 是否無隊員 */
  private get isNoMemeber(): boolean {
    for (let i = 1; i < this.antiTDHeroTeam.length; i++) {
      if (this.antiTDHeroTeam[i] != null) {
        return false;
      }
    }
    return true;
  }

  /** 取得被選中英雄的裝備道具 */
  private get equipItemList(): number[] {
    const hero = this.antiTDHeroTeam[this.selectedHeroIndex];
    return hero?.equipItemIds ?? [];
  }

  /** 道具選取狀況
   * @param heroListData
   */
  private selectHeroEquipItem(heroListData: HeroListData): boolean[] {
    // 空位置
    if (heroListData == null) {
      return [false, false];
    }

    // 找到選中英雄位置
    const newSelectHeroIndex = this.antiTDHeroTeam.findIndex((hero) => (hero?.hid ?? 0) === heroListData.hid);

    // 返回道具選中狀態
    const selectStatus: boolean[] = [];
    for (let i = 0; i < this.antiTDItemCount; i++) {
      selectStatus.push(this.selectedHeroIndex === newSelectHeroIndex && i === this.selectedItemIndex);
    }

    return selectStatus;
  }

  /** 點擊道具
   * @param hid
   * @param itemIndex
   */
  private onClickItem(heroIndex: number, itemIndex: number): void {
    // 點擊空英雄道具
    const selectHero = this.antiTDHeroTeam[heroIndex];
    if (selectHero == null) {
      return;
    }

    // 點擊相同道具
    if (heroIndex === this.selectedHeroIndex && itemIndex === this.selectedItemIndex) {
      // 重複點擊關閉道具清單
      if (this.isShowItemList) {
        this.closeItemList();
      }
      return;
    }

    // 如果第2格鎖住
    if (AntiTDManager.isEquipLocked(selectHero)[itemIndex]) {
      Message.info(`此道具格將在英雄等級${AntiTDManager.equipLimitLevel}等解鎖`);
      return;
    }

    // 更新選項
    this.selectedHeroIndex = heroIndex;
    this.selectedItemIndex = itemIndex;
    // 英雄id傳入道具列表
    this.clickedItemHeroId = selectHero.heroId;
    // 開啟道具列表
    this.isShowItemList = true;
    // 如果裝備格不為空直接開啟道具彈窗
    if (this.equipItemList[this.selectedItemIndex] != null && this.equipItemList[this.selectedItemIndex] !== 0) {
      this.openItemContent(this.equipItemList[this.selectedItemIndex]);
    }
  }

  /** 關閉道具列表 */
  public closeItemList(): void {
    this.isShowItemList = false;
    this.selectedItemIndex = -1;
  }

  /** 清空所有隊員 */
  private async onClickClearAntiTDMember(): Promise<void> {
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

  /** 清空所有道具 */
  private async onClickClearAllHeroItem(): Promise<void> {
    try {
      // 確認
      await this.$confirm(`確定要清空所有道具嗎？`, '系統通知', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
      });

      // 清除所有道具
      for (const hero of this.antiTDHeroTeam) {
        if (hero != null) {
          const empty = hero.equipItemIds.fill(0);
          hero.equipItemIds.splice(0, hero.equipItemIds.length, ...empty);
        }
      }
      this.onTeamUpdate(this.antiTDHeroTeam);
    } catch (e) {
      return;
    }
  }

  /** 開啟道具彈窗
   * @param itemId
   */
  private openItemContent(itemId: number): void {
    // 取得點選的道具裝備在角色上的位置
    const index = this.equipItemList.findIndex((equipItemId) => equipItemId === itemId);

    // 點選當前選中的裝備或未裝備道具才會開啟道具彈窗
    if (index === this.selectedItemIndex || index === -1) {
      this.clickedItemId = itemId;
      this.isItemLocked = this.userInfo.antiTDItemList.includes(itemId) === false;
      this.isItemEquiped = index !== -1;
      this.isAntiTDItemContent = true;
    }
  }

  /** 點擊裝備道具
   * @param itemId
   */
  private onEquipItem(itemId: number): void {
    // 取得英雄
    const heroListData = this.antiTDHeroTeam[this.selectedHeroIndex];
    if (heroListData == null) {
      console.error(`onEquipItem Error: undefined hero`);
      return;
    }

    // 如果第一次裝備
    if (heroListData.equipItemIds.length < this.antiTDItemCount) {
      heroListData.equipItemIds = [];
      for (let i = 0; i < this.antiTDItemCount; i++) {
        heroListData.equipItemIds.push(this.selectedItemIndex === i ? itemId : 0);
      }
    }
    // 更新裝備中
    else {
      heroListData.equipItemIds.splice(this.selectedItemIndex, 1, itemId);
    }

    // 關閉介面
    this.isAntiTDItemContent = false;
    this.closeItemList();
  }

  /** 點擊卸下裝備道具
   * @param itemId
   */
  private onUnequipItem(itemId: number): void {
    // 取得英雄
    const heroListData = this.antiTDHeroTeam[this.selectedHeroIndex];
    if (heroListData == null) {
      console.error(`onUnequipItem Error: undefined hero`);
      return;
    }

    // 找到道具位置
    const itemIndex = heroListData.equipItemIds.findIndex((equipItemId) => equipItemId === itemId);

    // 防呆
    if (itemIndex < 0) {
      return;
    }

    // 卸下道具
    heroListData.equipItemIds.splice(itemIndex, 1, 0);

    // 關閉介面
    this.isAntiTDItemContent = false;
    this.closeItemList();
  }

  /** 解鎖道具
   * @param itemId 道具編號
   */
  private async onBuyItem(itemId: number): Promise<void> {
    // 組成封包
    const data = { itemId };
    try {
      // API 解鎖道具
      const response: any = await planetWarUnlockHeroItemAPI.post(data);
      if (response.result !== ResponseState.Success) {
        throw Error(response.result);
      }

      // 加入道具清單
      this.userInfo.antiTDItemList.push(response.itemId);
      this.userInfo.goldCoin = response.goldCoin;
      this.userInfo.crystalCoin = response.crystalCoin;

      // 關閉介面
      this.isAntiTDItemContent = false;

      // 顯示設置成功
      Message.success('購買成功');
    } catch (e) {
      Message.warn(`${e}`);
    }
  }

  /** 替換隊伍隊長
   *  @param index 要替換成隊長的隊員順序
   */
  private onChangeLeader(index: number): void {
    const tmpHero = this.antiTDHeroTeam[index];
    this.antiTDHeroTeam.splice(index, 1, this.antiTDHeroTeam[0]);
    this.antiTDHeroTeam.splice(0, 1, tmpHero);
    this.closeItemList();
  }

  /** 切換到英雄修改頁面 */
  @Emit('onClickHero')
  private onClickHero(heroIndex: number): void {
    return;
  }

  /** 隊伍更新
   *  @param newAntiTDTeam 更動後英雄隊伍
   */
  @Emit('onTeamUpdate')
  private onTeamUpdate(newAntiTDTeam: Array<HeroListData | undefined>): void {
    return;
  }

  /** 儲存隊伍
   * @param newAntiTDTeam 更動後英雄隊伍
   */
  @Emit('onSaveTeam')
  private onSaveTeam(newAntiTDTeam: Array<HeroListData | undefined>): void {
    return;
  }

  /** 打開逆塔防提示 */
  @Emit('onOpenAntiTDHintDialog')
  private onOpenAntiTDHintDialog(): void {
    return;
  }
}
</script>
<style scoped>
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
