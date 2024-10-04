<template>
  <div class="relative">
    <!-- 英雄尚未裝備完畢提示 -->
    <div
      class="flex items-center max-w-260px absolute -top-[30%] right-[5%] pr-1"
      v-if="isEmptyMember"
      text="21px [#FFFFFF]"
      border="rounded-30px"
      bg="[#FF4A4ACC]"
    >
      <img class="w-40px aspect-square object-contain" :src="imgData.exclamationMark" />{{ textData.emptyMemberText }}
    </div>
    <!-- 道具尚未裝備完畢提示 -->
    <div
      class="flex items-center max-w-260px absolute -top-[30%] right-[5%] pr-1"
      v-else-if="isEmptyItem"
      text="21px [#FFFFFF]"
      border="rounded-30px"
      bg="[#FF4A4ACC]"
    >
      <img class="w-40px aspect-square object-contain" :src="imgData.exclamationMark" />{{ textData.emptyItemText }}
    </div>
    <div
      class="grid grid-cols-[4fr,6fr,0.5fr,auto] max-w-520px max-h-82px <sm:w-380px max-h-120px items-center"
      m="b-20px"
      p="y-10px x-20px"
      bg="[#000000cf]"
      text="[#FFF]"
      border="3px solid [#FFF] rounded-60px"
    >
      <div class="flex items-center">
        <HeroInfoComponent
          class="w-68px h-68px <sm:w-50px <sm:h-50px"
          :heroListData="teamLeader"
          :borderShapeType="BorderShapeType.SmallCircle"
          :isShowLevel="false"
          :isShowAttribute="false"
          :isShowHeroItemType="false"
        />
      </div>
      <div text="22px left <sm:16px" m="l-16px <sm:l-0">
        <span>{{ textData.currentLeaderText }}</span>
        <div text="24px <sm:14px">{{ leaderName }}</div>
      </div>
      <div class="w-1px h-full" m="x-4 <sm:x-1" bg="[#FFF]" />
      <div>
        <div class="flex justify-start <sm:hidden">
          <span text="22px left <sm:16px">{{ textData.teamMemberText }}</span>
        </div>
        <div class="flex-row">
          <div class="flex-row" v-for="(hero, index) in teamMember" :key="index">
            <HeroInfoComponent
              class="w-10 h-10 mx-1 mt-0.5"
              :heroListData="hero"
              :borderShapeType="BorderShapeType.SmallCircle"
              :isShowLevel="false"
              :isShowAttribute="false"
              :isShowHeroItemType="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { AntiTDItemType } from '@/helper/enum/AntiTD';
import { PlanetUserInfoData } from '@/helper/interface/PlanetWar';
import AntiTDManager from '@/manager/AntiTDManager';
import HeroManager from '@/manager/HeroManager';
import TableManager from '@/manager/TableManager';
import { Table } from 'element-ui';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { BorderShapeType } from '../../helper/enum/Hero';
import { HeroListData } from '../../helper/interface/Hero';
import Localization, { LocalKeyType } from '../../views/H5/Scripts/Components/Localization';
import HeroInfoComponent from '../Hero/HeroInfoComponent.vue';

@Component({
  components: {
    /** 簡易英雄卡片 */
    HeroInfoComponent,
  },
})
/** 裡宇宙內的 英雄隊伍 介面 */
export default class AntiTDTeamPlace extends Vue {
  /** 隊伍上的 英雄資料列表 */
  @Prop(Array) private antiTDHeroTeam!: Array<HeroListData | undefined>;
  /** 星球大戰使用者資訊 */
  @Prop() private planetUserInfo!: PlanetUserInfoData;

  /** 隊長資料 */
  private teamLeader: HeroListData = {} as HeroListData;

  /** 隊員們資料 */
  private teamMember: Array<HeroListData | undefined> = [];

  /** 隊長名稱 */
  private leaderName: string = '';

  /** 英雄外框形狀 */
  private BorderShapeType = BorderShapeType;

  /** 文字資料 */
  private textData = {
    currentLeaderText: '當前隊長',
    teamMemberText: '隊伍成員',
    emptyMemberText: '隊伍成員尚未裝備完畢',
    emptyItemText: '尚有道具未裝備',
  };

  /** 圖片資料 */
  private imgData = {
    exclamationMark: imgPath.noticeUrl,
  };

  /** 判斷逆塔防英雄是否未裝備完畢 */
  private get isEmptyMember(): boolean {
    // 找出已裝備英雄清單
    const fillHeroList = this.antiTDHeroTeam.filter((hero) => hero != null);

    // 如果足夠英雄, 檢查是否裝滿
    if (this.antiTDHeroTeam.length < this.$$store.getters.heroCount) {
      return fillHeroList.length < this.antiTDHeroTeam.length;
    }
    // 如果不足夠英雄, 檢查是否全上場
    else {
      return fillHeroList.length < this.$$store.getters.heroCount;
    }
  }

  /** 判斷逆塔防道具是否全滿 */
  private get isEmptyItem(): boolean {
    for (const hero of this.antiTDHeroTeam) {
      if (hero != null) {
        // 取得英雄逆塔防道具種類
        const newHeroData = HeroManager.getHeroData(hero.heroId);
        if (newHeroData == null) {
          continue;
        }

        // 取得已解鎖道具符合類型個數
        const heroItemType: AntiTDItemType[] = JSON.parse(newHeroData.antiTDItemTypes);
        const matchItemCount = this.planetUserInfo.antiTDItemList.filter((item) =>
          heroItemType.includes(TableManager.antiTDItem.findOne(item)?.heroItemType ?? -1)
        ).length;

        // 無道具可裝備
        if (matchItemCount === 0) {
          continue;
        }

        // 裝備數
        const equipItemCount = hero.equipItemIds.filter((item) => item !== 0).length;
        // 英雄可裝備位置
        const antiTDItemCount: number = AntiTDManager.isEquipLocked(hero).filter(
          (item: boolean) => item === false
        ).length;

        // 可裝備數量大於裝備位置
        if (matchItemCount >= antiTDItemCount) {
          // 檢查是否裝滿
          if (equipItemCount === antiTDItemCount) {
            continue;
          }
        }
        // 可裝備數量小於裝備位置
        else {
          // 檢查是否已全裝
          if (equipItemCount === matchItemCount) {
            continue;
          }
        }
        return true;
      }
    }
    return false;
  }

  created() {
    this.updateTeam();
  }

  @Watch('antiTDHeroTeam')
  private updateTeam(): void {
    // 設定隊長 與 隊長名稱
    if (this.antiTDHeroTeam[0] !== undefined) {
      this.teamLeader = this.antiTDHeroTeam[0];
    }
    this.leaderName = Localization.getText(LocalKeyType.Common, this.teamLeader.name);

    this.teamMember.splice(0);
    // 設定隊員
    for (let i = 1; i < this.antiTDHeroTeam.length; ++i) {
      this.teamMember.push(this.antiTDHeroTeam[i]);
    }
  }
}
</script>
