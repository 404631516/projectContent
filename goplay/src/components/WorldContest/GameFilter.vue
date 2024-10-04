<template>
  <div class="w-1024px <lg:w-full <lg:ml-0" m="l-18">
    <!-- 手機版顯示選中類型 -->
    <div class="hidden <sm:block" m="b-3">
      <span font="bold" text="2xl [#666666]">{{ textData.gameType }}</span>
      <p font="bold" text="3xl">{{ getGameName(selectGameType) }}</p>
    </div>
    <!-- 選項清單 -->
    <div class="grid grid-cols-[1fr,15fr]">
      <span font="bold" class="<sm:hidden" text="2xl [#666666]" m="x-2 y-2">{{ textData.gameType }}</span>
      <div class="flex justify-start flex-wrap <sm:justify-center">
        <label
          class="flex items-center"
          text="2xl [#666666]"
          m="r-2 y-2"
          v-for="(gameType, index) in gameFilterList"
          :key="index"
        >
          <input
            :class="{ 'bg-[#ebca28]': selectGameType === gameType }"
            class="appearance-none rounded w-5 h-5"
            m="r-2"
            border="1 solid [#A5A5A5]"
            type="radio"
            name="game"
            :value="gameType"
            @change="onSelectGameType(gameType)"
          />
          {{ getGameName(gameType) }}
        </label>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { HeroJ7GameType, TeamType, GameBoxType } from '@/helper/enum/Common';
import GameTypeHelper, { GameTypeData } from '../../views/H5/Helper/GameTypeHelper';

@Component({})
export default class GameFilter extends Vue {
  /** 選中遊戲類別 */
  @Prop() private selectGameType!: HeroJ7GameType;
  /** 選中賽事類別 */
  @Prop() private selectContestType!: TeamType;
  /** 是否全顯示不分類 */
  @Prop() private isShowAll!: boolean;

  /** 一般魔王賽選項 */
  private get normalContestList(): HeroJ7GameType[] {
    return [
      HeroJ7GameType.Total,
      ...GameTypeHelper.getGameBox(GameBoxType.AdlGameBox).map<HeroJ7GameType>((gameTypeData) => gameTypeData.gameType),
    ];
  }

  /** 新魔王賽選項 */
  private get newContestList(): HeroJ7GameType[] {
    return GameTypeHelper.getGameBox(GameBoxType.RoomGameBox).map<HeroJ7GameType>(
      (gameTypeData) => gameTypeData.gameType
    );
  }

  /** 文字資料 */
  private textData = {
    gameType: '類型',
  };

  /** 取得要顯示的遊戲選項 */
  private get gameFilterList(): HeroJ7GameType[] {
    // 全部顯示
    if (this.isShowAll) {
      return this.normalContestList.concat(this.newContestList);
    }

    // 依照頁籤類型顯示
    switch (this.selectContestType) {
      // 一般魔王賽
      case TeamType.WorldBoss:
        return this.normalContestList;
      // 新魔王賽
      case TeamType.Room:
        return this.newContestList;
      default:
        return this.normalContestList;
    }
  }

  /** 取得遊戲類別名稱
   * @param gameType
   */
  private getGameName(gameType: HeroJ7GameType): string {
    return GameTypeHelper.getGameTypeName(gameType);
  }

  @Emit('onSelectGameType')
  private onSelectGameType(gameType: HeroJ7GameType): void {
    return;
  }
}
</script>
