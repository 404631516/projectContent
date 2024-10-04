<template>
  <div class="!overflow-x-hidden">
    <img :src="imgData.anniversaryTitle" />
    <div class="relative" m="b-25">
      <!-- 有登入 -->
      <div
        v-if="isLogin"
        class="absolute top-12vh left-48vw z-5 <xl:top-10vh <sm:(top-3vh left-44vw gap-y-0)"
        text="30px [#0B7285] left <xl:22px <sm:12px"
        font="bold"
      >
        <!-- 無資料 -->
        <template v-if="userAnniversaryData.heroCount === 0">
          <div
            class="flex items-center justify-center w-40vw h-50vh <xl:(h-35vh top-10vh) <sm:(h-10vh top-4vh) leading-normal"
            text="50px [#0B7285] <xl:22px <sm:12px"
            font="bold"
          >
            {{ textData.noData01 }}<br />
            {{ textData.noData02 }}
          </div>
        </template>
        <!-- 有資料 -->
        <template v-else>
          <p m="b-4 <xl:b-2">{{ textData.calculateInterval }}</p>
          <span text="50px [#0B7285] <xl:22px <sm:12px" font="bold">{{ textData.collected }}</span>
          <div class="grid grid-cols-2 grid-rows-3 gap-x-8 gap-y-10 <xl:gap-y-2 xl:w-35vw" m="l-3">
            <div class="flex flex-col items-center">
              <span text="99px [#FBBF4D] <xl:40px <sm:18px">{{ userAnniversaryData.heroCount }}</span>
              {{ textData.person }}{{ textData.hero }}
            </div>
            <div class="flex flex-col items-center">
              <span text="99px [#FBBF4D] <xl:40px <sm:18px">{{ userAnniversaryData.weaponCount }}</span>
              {{ textData.pecs }}{{ textData.weaponItem }}
            </div>
            <div class="flex flex-col items-center">
              <span text="99px [#FBBF4D] <xl:40px <sm:18px">{{ userAnniversaryData.antiTDCount }}</span>
              {{ textData.pecs }}{{ textData.antiTDItem }}
            </div>
            <div class="flex flex-col items-center">
              <span text="99px [#FBBF4D] <xl:40px <sm:18px">{{ changeToString(userAnniversaryData.goldCoin) }}</span>
              {{ textData.pecs }}{{ textData.gold }}
            </div>
            <div class="flex flex-col items-center col-span-2">
              <span text="99px [#FBBF4D] <xl:40px <sm:18px">{{ changeToString(userAnniversaryData.crystalCoin) }}</span>
              {{ textData.pecs }}{{ textData.crystal }}{{ textData.changeCoin }}
            </div>
          </div>
          <p text="50px [#0B7285] <xl:22px <sm:12px" font="bold" m="t-9 <xl:t-2">{{ textData.arrived }}</p>
          <div
            class="grid grid-cols-[1.5fr,2fr] grid-rows-2 gap-x-1 gap-y-5 <sm:(grid-cols-[1.5fr,1fr]) <sm:gap-y-1 xl:w-45vw items-end"
            m="t-9 <xl:t-0"
          >
            {{ textData.bossTotalScore }}
            <span text="99px [#FDC221] left <xl:40px <sm:18px">
              {{ userAnniversaryData.bossTotalScore }}
              <span text="29px [#0B7285] <xl:22px <sm:12px" font="bold">{{ textData.point }}</span>
            </span>
            {{ textData.joinQuizGame }}<br />{{ textData.joinBossGame }}
            <span text="99px [#FDC221] left <xl:40px <sm:18px">
              {{ userAnniversaryData.adlContestCount + userAnniversaryData.bossContestCount }}
              <span text="29px [#0B7285] <xl:22px <sm:12px" font="bold">{{ textData.count }}</span>
            </span>
          </div>
        </template>
      </div>
      <!-- 沒登入 -->
      <div
        v-else
        class="absolute flex items-center justify-center w-45vw h-50vh rounded-3xl top-14vh left-44vw z-5 <xl:(h-35vh top-10vh) <sm:(h-10vh top-4vh)"
        text="50px [#0B7285] <xl:22px <sm:14px"
        font="bold"
      >
        {{ textData.isNotLoginText }}
      </div>
      <img :src="imgData.anniversaryBanner01" />
    </div>
    <!-- 底下前往問卷列 -->
    <div class="fixed w-full h-25 flex items-center justify-center bottom-0 z-10" bg="[#000000cc]">
      <button class="yellowGradient rounded-3xl" m="auto" p="x-35 y-3.5" @click="goToQuestionnaire">
        <span text="xl [#FFFFFF] shadow-lightDefault">{{ textData.goToQuestionnaire }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { UserInfo2022Data } from '@/helper/interface/Login';
import { MenuWord } from '@/helper/enum/MenuName';
import { Message } from '@/helper/class/Common';

@Component({})
export default class AnniversaryPromotion extends Vue {
  /** 周年慶資料 */
  private userAnniversaryData: UserInfo2022Data = {} as UserInfo2022Data;

  /** 圖片資料 */
  private imgData = {
    anniversaryTitle: imgPath.anniversaryTitle,
    anniversaryBanner01: imgPath.anniversaryBanner01,
  };
  /** 文字資料 */
  private textData = {
    calculateInterval: '*計算區間2021/12/09～2022/12/09',
    collected: '已收集',
    hero: '英雄',
    weaponItem: '生物兵器',
    antiTDItem: '裡宇宙道具',
    gold: '金幣',
    crystal: '晶球',
    changeCoin: '(含因材網代幣轉換)',
    arrived: '已達成',
    bossTotalScore: '魔王賽總貢獻',
    joinQuizGame: '總參與答題遊戲次數與',
    joinBossGame: '魔王賽挑戰次數',
    person: '隻',
    pecs: '個',
    point: '分',
    count: '次',
    isNotLoginText: '登入帳號才能看見個人回顧資訊唷！',
    noData01: '原來是新同學！',
    noData02: '讓我們今年一起並肩作戰吧！',
    goToQuestionnaire: '前往問券挑戰',
  };

  /** 是否已登入 */
  private get isLogin(): boolean {
    return this.$$store.getters.isLogin;
  }

  async created() {
    if (this.isLogin) {
      this.userAnniversaryData = await this.$$store.dispatch('getUserInfo2022');
    }
  }

  /** 數量轉文字
   * @param count 數量
   */
  private changeToString(count: number): string {
    if (count != null) {
      const countString = count.toString();
      return countString.length > 4 ? `${countString.slice(0, -4)}萬` : countString;
    } else {
      return '';
    }
  }

  /** 跳轉去問卷 */
  private goToQuestionnaire(): void {
    if (this.isLogin === false) {
      Message.warn('請先登入');
      return;
    }

    // 用戶參加問巻
    this.$router.push({
      name: `${MenuWord.QuestionnaireInformation}`,
      params: { id: `1` },
    });
  }
}
</script>
