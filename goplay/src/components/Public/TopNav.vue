<template>
  <div
    class="h-[60px] fixed z-50 top-0 w-full flex items-center justify-between shadow-xl"
    :style="{ backgroundColor: `${topNavBackgroundColor}` }"
    p="x-10 <xl:x-0"
  >
    <!-- 左方引導菜單按鈕 -->
    <div class="flex items-center h-full">
      <div
        bg="[#EBB030]"
        class="cursor-pointer grid items-center h-full <sm:w-15"
        grid="cols-3 rows-1 <sm:cols-1"
        p="x-3"
        font="bold"
        text="2xl [#FFF]"
        @click="onMenu"
      >
        <img class="<xl:col-span-1" :src="imgData.menuIcon" />
        <span class="<xl:col-span-2 <sm:hidden">{{ textData.menu }}</span>
      </div>
      <Breadcrumb class="<xl:hidden" m="l-2" />
    </div>
    <!-- 右方按鈕群 -->
    <div class="h-full flex items-center" m="<sm:l-2">
      <!-- 登入前 -->
      <template v-if="isLogin === false">
        <!-- 登入按鈕 -->
        <button
          data="LOGIN_BUTTON"
          class="w-75 <sm:w-60 h-4/5 shadow-xl rounded-3xl flex items-center justify-center"
          font="bold"
          text="[#C88B07] hover:[#409eff] 2xl"
          bg="[#FFFFFF] hover:[#ecf5ff]"
          border="1 solid [#EBB030]"
          @click="onLogin"
        >
          {{ textData.login }}
        </button>
      </template>
      <!-- 登入後 -->
      <template v-else>
        <!-- 宇宙能量 -->
        <div class="flex items-center" text="2xl [#505050]" m="r-1">
          <img :src="imgData.galaxyIcon" class="h-9 aspect-square object-contain mr-1" />
          <span class="<xl:hidden">{{ textData.universeEnergy }}</span>
          <span text="2xl [#00CCCE]">{{ universeEnergy }}</span>
          <span class="<xl:hidden">{{ textData.pointText }}</span>
        </div>
        <!-- 通知系統 -->
        <div class="relative cursor-pointer" :class="hasNewNotice ? 'notice-fade' : ''" m="x-4 <xl:x-1">
          <img :src="imgData.mailIcon" class="w-11 aspect-square" @click="onOpenNotice" />
          <img v-if="hasNewNotice" :src="imgData.redDot" class="w-4 aspect-square absolute top-0 -right-1.5" />
        </div>
        <!-- 晶球兌換 -->
        <button
          class="w-75 h-4/5 shadow-xl rounded-3xl flex <sm:hidden items-center justify-center bg-gradient-to-b from-[#6AB9FF] to-[#836BFF]"
          border="1 solid [#727272]"
          font="bold"
          text="[#FFF] 2xl"
          m="r-2"
          @click="onChangeCrystal"
        >
          <img m="r-1" class="w-8 h-8" :src="imgData.changeIcon" />
          {{ textData.coinExchangeForCrystal }}
        </button>
        <!-- 個人資訊 -->
        <button
          class="w-75 h-4/5 shadow-xl flex items-center justify-center rounded-3xl <sm:hidden"
          border="1 solid [#EBB030]"
          font="bold"
          text="[#C88B07] hover:[#409eff] 2xl"
          bg="[#FFFFFF] hover:[#ecf5ff]"
          @click="onClickUserInfo"
        >
          <img :src="heroImg" m="r-1" class="w-12 h-12" />
          {{ userName }}
        </button>
      </template>
      <!-- 音樂按鈕 -->
      <div>
        <template>
          <div @click="onAudioPlay(!isPlayImg)" class="cursor-pointer">
            <img :src="isPlayImg ? imgData.audioOnIcon : imgData.audioOffIcon" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import { SessionStorageKey } from '@/helper/enum/Common';
import Breadcrumb from './Breadcrumb.vue';
import { MenuName } from '../../helper/enum/MenuName';
import HeroManager, { HeroImgType } from '../../manager/HeroManager';
import audioPath from '../../config/audioPath';
import { DefaultColor } from '@/helper/enum/BackEnd';

@Component({
  components: {
    Breadcrumb,
  },
})
export default class TopNav extends Vue {
  /** 是否播放音樂中 */
  private isPlayAudio: boolean = true;
  /** 音樂物件 */
  private audio = new Audio();

  /** 文字資料 */
  private textData = {
    coinExchangeForCrystal: '因材網代幣兌換晶球',
    login: this.$t('common.signIn'),
    menu: '主選單',
    universeEnergy: '宇宙能量',
    pointText: '點',
  };

  /** 圖片資料 */
  private imgData = {
    audioOnIcon: ImgPath.audioOnBaseUrl,
    audioOffIcon: ImgPath.audioOffBaseUrl,
    menuIcon: ImgPath.menuIconBaseUrl,
    changeIcon: ImgPath.changeIconBaseUrl,
    galaxyIcon: ImgPath.galaxyIconUrl,
    mailIcon: ImgPath.mailBlueIcon,
    redDot: ImgPath.redDot,
  };

  /** 判斷是否登入狀態 */
  private get isLogin(): boolean {
    return this.$$store.getters.isLogin;
  }

  /** 音樂圖片更換 */
  private get isPlayImg(): boolean {
    return this.isPlayAudio;
  }

  /** 取得英雄圖像 */
  private get heroImg(): string {
    const heroListData = this.$$store.getters.onlineHero;
    if (heroListData == null) {
      return '';
    }
    return HeroManager.getHeroImgUrl(heroListData, HeroImgType.Default);
  }

  /** 取得使用者名稱 */
  private get userName(): string {
    return this.$$store.getters.userName;
  }

  /** 宇宙能量 */
  private get universeEnergy(): string {
    return `${this.$$store.state.LoginModule.universeEnergy}`;
  }

  /** 是否有新通知 */
  private get hasNewNotice(): boolean {
    return this.$$store.state.LoginModule.isNewNotice;
  }

  /** topNav背景色 */
  private get topNavBackgroundColor(): string {
    const topNavBackgroundColor = this.$$store.state.LoginModule.webAppConfig.topNavBackgroundColor;
    return topNavBackgroundColor.length > 0 ? `${topNavBackgroundColor}` : DefaultColor.TopNavBackground;
  }

  /** 音樂資源 */
  private get audioSource(): string {
    // 星球大戰音樂
    if (this.$route.path === `/${MenuName.PlanetWar}`) {
      return audioPath.planetWar;
    }

    // 活動音樂
    const partyMusic = this.$$store.state.LoginModule.webAppConfig.homeBGM;
    if (partyMusic !== '') {
      return partyMusic;
    }

    // 一般音樂
    return audioPath.defaultBGM;
  }

  mounted() {
    this.audio.src = this.audioSource;
    this.audio.loop = true;
    this.checkSession();

    // 宇宙能量補充提示
    const recoveryEnergy = this.$$store.state.LoginModule.recoveryEnergy;
    if (recoveryEnergy > 0) {
      this.$msgbox({
        title: '訊息',
        message: this.$createElement('p', { style: 'color : #A5A5A5; line-height : 1.5' }, [
          this.$createElement('span', undefined, '歡迎回來!'),
          this.$createElement('br', undefined, ''),
          this.$createElement('span', undefined, '恢復了'),
          this.$createElement('span', { style: 'color : #00CCCE' }, `${recoveryEnergy}`),
          this.$createElement('span', undefined, '點的宇宙能量'),
          this.$createElement('br', undefined, ''),
          this.$createElement('span', undefined, '請好好利用～'),
        ]),
        showCancelButton: false,
        confirmButtonText: '確定',
        center: true,
      }).then(() => {
        this.$$store.commit('setRecoveryEnergy', 0);
      });
    }
  }

  /** 確認 session 紀錄音樂狀態 */
  private checkSession(): void {
    if (this.audio.paused) {
      if (sessionStorage.getItem(SessionStorageKey.OpenWebAudio) === null) {
        this.audio.play();
        this.$$store.commit('setOpenWebAudio', true);
      } else {
        this.onAudioPlay(JSON.parse(sessionStorage.getItem(SessionStorageKey.OpenWebAudio)!));
      }
    }
  }

  /** 控制音樂開關 */
  private onAudioPlay(isPlay: boolean): void {
    this.isPlayAudio = isPlay;
    if (isPlay) {
      this.audio.play();
      this.$$store.commit('setOpenWebAudio', true);
    } else {
      this.audio.pause();
      this.$$store.commit('setOpenWebAudio', false);
    }
  }

  /** 到個人資訊頁 */
  private onClickUserInfo(): void {
    if (this.$route.name !== `${MenuName.Profile}`) {
      this.$router.replace(`/${MenuName.Profile}`);
    }
  }

  /** 部分頁面不放音樂 */
  @Watch('$route.name')
  private pauseRoute(): void {
    if (this.$route.meta?.isPlayHomeBGM ?? true) {
      this.$nextTick(() => {
        this.checkSession();
      });
    } else {
      this.audio.pause();
    }
  }

  /** 星球大戰換音樂 */
  @Watch('$route.path')
  private audioURL(route: string): void {
    const newSrc = this.audioSource;
    if (this.audio.currentSrc === newSrc) {
      return;
    }
    this.audio.src = newSrc;
  }

  /** 登入時 */
  @Emit('onLogin')
  private onLogin(): void {
    return;
  }

  /** 開啟導引選單時 */
  @Emit('onMenu')
  private onMenu(): void {
    return;
  }

  /** 因材網兌換代幣 */
  @Emit('onChangeCrystal')
  private onChangeCrystal(): void {
    return;
  }

  /** 開啟通知系統 */
  @Emit('onOpenNotice')
  private onOpenNotice(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.notice-fade {
  animation: FadeInOut 1s infinite;
}
@keyframes FadeInOut {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
