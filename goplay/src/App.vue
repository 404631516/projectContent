<template>
  <div class="goplay-warpper" id="app" v-if="isLoginDone">
    <!-- 交換晶球組件 -->
    <ChangeCrystal
      v-model="isShowChangeCrystal"
      @passAddCrystal="onChangeCrystalSuccess"
      @closeDialog="isShowChangeCrystal = false"
    />
    <!-- 獲得晶球提示 -->
    <CrystalMessage
      v-model="isShowCrystalMessage"
      :crystalNum="crystalNum"
      @closeCrystalMessage="isShowCrystalMessage = false"
    />
    <template v-if="isShowNotice">
      <NoticeDialog v-model="isShowNotice" />
    </template>
    <!-- 上方區塊 -->
    <TopNav
      class="top-nav"
      v-show="isShowTop"
      @onMenu="isShowMenu = !isShowMenu"
      @onLogin="isShowLogin = true"
      @onChangeCrystal="isShowChangeCrystal = true"
      @onOpenNotice="isShowNotice = true"
    />
    <!-- 各頁面 -->
    <router-view :class="isShowTop ? 'main' : 'noTopNav'" />
    <!-- 選單 -->
    <MenuTree v-model="isShowMenu" @openChangeCrystal="isShowChangeCrystal = true" />
    <!-- 登入框 -->
    <Login v-model="isShowLogin" @onCloseLogin="isShowLogin = false" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Login from '@/components/Public/Login.vue';
import MenuTree from '@/components/Public/MenuTree.vue';
import TopNav from '@/components/Public/TopNav.vue';
import { Message } from '@/helper/class/Common';
import {
  GATagActionStrType,
  GATagCategoryStrType,
  GATagActionIdType,
  GATagCategoryIdType,
  BroadcastEventType,
  CookieStr,
  LocalStorageStr,
  UserRole,
} from '@/helper/enum/Common';
import { sendGAEvent } from '@/helper/fnc/common';
import { MenuName } from './helper/enum/MenuName';
import ChangeCrystal from '@/components/Public/ChangeCrystal.vue';
import CrystalMessage from '@/components/Public/CrystalMessage.vue';
import Config from './config/setting';
import { Setting } from './config/Common';
import { AdlLoginInfo } from './helper/interface/Login';
import NoticeDialog from './components/Public/NoticeDialog.vue';
import { ServerTableLoader } from './hero-api/server-table-loader';
import { TableManager } from './hero-api/json-entity/table.manager';

@Component({
  components: {
    TopNav,
    MenuTree,
    Login,
    ChangeCrystal,
    CrystalMessage,
    NoticeDialog,
  },
})
export default class Index extends Vue {
  /** 晶球兌換獲得數量 */
  private crystalNum: number = 0;

  /** 開關晶球兌換介面 */
  private isShowChangeCrystal: boolean = false;
  /** 開關晶球獎勵窗 */
  private isShowCrystalMessage: boolean = false;
  /** 開關左邊漢堡選單 */
  private isShowMenu: boolean = false;
  /** 開關登入介面 */
  private isShowLogin: boolean = false;
  /** 登入完成 */
  private isLoginDone: boolean = false;
  /** 開關通知系統彈窗 */
  private isShowNotice: boolean = false;
  /** 同步通知IntervalId */
  private notificationIntervalId: number = -1;
  /** 同步通知間隔時間 */
  private readonly notificationIntervalTime: number = 5;

  /** 上方選單開關 */
  private get isShowTop(): boolean {
    // 進入phaser遊戲關閉上方bar
    return this.$route.meta?.isTopNav ?? true;
  }

  async created() {
    // 監聽廣播
    this.registerBroadcast();

    try {
      // 因材網轉跳登入
      const adlLoginData = this.$cookie.get(CookieStr.AdlGame);
      // 檢查adlLoginData != null && !== <string>'undefined' (Chrome錯誤)
      const adlLoginInfo: AdlLoginInfo | null =
        adlLoginData != null ? (adlLoginData !== 'undefined' ? JSON.parse(adlLoginData) : null) : null;
      if (adlLoginInfo != null) {
        // 因材網登入
        await this.$$store.dispatch('loginOp', adlLoginInfo.token);

        // 成功登入後移除網址帶的因材網轉跳資料
        this.$router.push('/');
      }
      // 已登入刷新
      else if (Config.isWithCredentials === false || this.$cookie.get(`${CookieStr.Login}`) != null) {
        // 取得個人資訊
        const userInfo = localStorage.getItem(LocalStorageStr.UserInfo);
        if (userInfo != null) {
          // 設定個人資訊
          await this.$$store.dispatch('onLogin', JSON.parse(userInfo));
        }
      }

      // 登入後要做的事
      if (this.$$store.getters.isLogin) {
        // 取得英雄清單
        await this.$$store.dispatch('getHeroList');

        // 檢查首抽
        if (this.$$store.getters.heroCount <= 0) {
          this.$router.replace(`/${MenuName.Profile}`);
        }
        // 登入取得資訊
        else {
          // 取得使用者編輯權限
          await this.$$store.dispatch('getUserAuthority');

          // 取得上場英雄
          await this.$$store.dispatch('getHeroTeam');

          // 取得宇宙能量
          await this.$$store.dispatch('getUniverseEnergy');

          // 取得使用者是否有新通知
          await this.$$store.dispatch('getNotification');

          // 取得因雄宇宙進行中任務列表
          await this.$$store.dispatch('refreshRunningTaskList');

          // 取得教師任務進行中任務列表
          await this.$$store.dispatch('refreshRunningStudyTaskList');

          // 跟hero-api取得靜態表資料
          await ServerTableLoader.initTableLoader();
          // 載入所有靜態表
          TableManager.instance.loadAll();

          // 設定通知同步
          this.registerNotificationSync();

          // 廣播分頁登入
          try {
            new BroadcastChannel(Setting.boardcastKey).postMessage([
              BroadcastEventType.login,
              this.$$store.getters.userUid,
            ]);
          } catch (e) {
            console.log(`BroadcastChannel Error: ${e}`);
          }
        }

        // 因材網轉跳賽事
        if (adlLoginInfo != null && adlLoginInfo.gameLinkId !== '') {
          await this.onAdlEduContest(adlLoginInfo.gameLinkId);
        }
      }

      // 取得節慶活動資料
      await this.$$store.dispatch('getWebAppConfig');

      // 登入流程完成
      this.isLoginDone = true;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 監聽廣播 */
  private registerBroadcast(): void {
    try {
      new BroadcastChannel(Setting.boardcastKey).onmessage = (evt: MessageEvent) => {
        const message: string[] = evt.data;
        switch (message[0]) {
          // 登出
          case BroadcastEventType.logout:
            if (this.$$store.getters.isLogin) {
              // 別處已登出, 返回首頁
              location.replace(`${Config.homePath}`);
            }
            break;
          // 登出
          case BroadcastEventType.login:
            // 如果非當前登入帳號, 返回首頁
            if (+message[1] !== this.$$store.getters.userUid) {
              location.reload();
            }
            break;
        }
      };
    } catch (e) {
      console.log(`BroadcastChannel Error: ${e}`);
    }
  }

  /** 設定同步通知 */
  private registerNotificationSync(): void {
    this.notificationIntervalId = window.setInterval(() => {
      // 如果處在登出狀態, 不做事
      if (this.$$store.state.LoginModule.authority === UserRole.None) {
        return;
      }

      // 取得使用者是否有新通知
      this.$$store.dispatch('getNotification');
    }, this.notificationIntervalTime * 1000);
  }

  /** 轉跳因材網賽事網頁
   * @param gameLinkId
   */
  private async onAdlEduContest(gameLinkId: string): Promise<void> {
    // 透過gameLink取得賽事ID
    const contestId = await this.$$store.dispatch('getAdlEduGameLink', gameLinkId);
    if (contestId < -1) {
      return;
    }

    // GA 因材網轉跳答題遊戲事件
    await sendGAEvent(
      GATagCategoryIdType.AdlLinkGame,
      GATagActionIdType.AdlLinkGame,
      `賽事-${contestId}`,
      this.$gtag,
      GATagActionStrType.AdlLinkGame,
      GATagCategoryStrType.AdlLinkGame,
    );

    // 轉跳賽事頁面
    this.$router.push({
      name: `${MenuName.ContestInfoDetail}`,
      params: { id: `${contestId}` },
    });
  }

  /** 打開獲得晶球彈窗
   * @param crystal 獲得多少晶球
   */
  private onChangeCrystalSuccess(crystal: number): void {
    this.crystalNum = crystal;
    this.isShowCrystalMessage = true;
  }

  /** 開關TopNav時 */
  @Watch('isShowTop')
  private onShowTop(): void {
    // 初始化完成前不做
    if (this.isLoginDone === false) {
      return;
    }

    // 設定同步
    if (this.isShowTop) {
      // 尚未設定
      if (this.notificationIntervalId === -1) {
        this.registerNotificationSync();
      }
    }
    // 取消同步
    else {
      window.clearInterval(this.notificationIntervalId);
      this.notificationIntervalId = -1;
    }
  }
}
</script>
<style lang="scss">
@import './scss/index.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  overflow: hidden;
}

.goplay-warpper {
  .main {
    // +TopNav高度
    padding-top: 3.75rem;
    height: 100%;
    overflow: auto;
  }

  .noTopNav {
    padding-top: 0;
    overflow: hidden;
  }
}

/* Demo Purpose Only*/
.demo {
  font-family: 'Raleway', sans-serif;
  color: #fff;
  display: block;
  margin: 0 auto;
  padding: 15px 0;
  text-align: center;
}

.demo a {
  font-family: 'Raleway', sans-serif;
  color: #000;
}

.v-modal {
  opacity: 0.8 !important;
}

.loading {
  // 將API-loading中提示圖移到最上方
  z-index: 999999 !important;
}
</style>
