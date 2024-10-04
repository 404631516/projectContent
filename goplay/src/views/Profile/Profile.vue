<template>
  <div>
    <!-- 上方個人資訊 -->
    <div
      class="flex items-center justify-center <sm:flex-col shadow-default"
      m="t-5 <sm:t-0"
      p="y-15 <sm:y-5"
      bg="[#F9F8F4] bottom no-repeat"
      :style="{ backgroundImage: `url(${imgData.bgDot})` }"
    >
      <!-- 個人資訊區 -->
      <div class="grid items-center gap-x-5 grid-cols-[0.5fr,1fr] <sm:grid-cols-1" p="r-8 <sm:r-0">
        <!-- 隊長英雄 -->
        <div class="w-50 h-70" v-if="userAvatar">
          <HeroCard :heroListData="userHero" :isShowOnlineItem="false" />
        </div>
        <!-- 裝備資料 -->
        <div class="grid grid-rows-[1fr,0.5fr] gap-y-3" v-if="planetUserInfo">
          <!-- 生物兵器 -->
          <EquipmentList
            :heroList="antiTDHeroTeam"
            :weaponList="planetUserInfo.queueWeaponIds"
            :listType="PlanetWarType.Outter"
            @onOpenEditDialog="openAntiTDDialog(PlanetWarType.Outter)"
          />
          <!-- 逆塔防隊伍 -->
          <EquipmentList
            :heroList="antiTDHeroTeam"
            :weaponList="planetUserInfo.queueWeaponIds"
            :listType="PlanetWarType.Inner"
            @onOpenEditDialog="openAntiTDDialog(PlanetWarType.Inner)"
          />
        </div>
      </div>
      <!-- 個人闖關紀錄 -->
      <div p="y-2 l-8 <sm:l-0" text="[#878787] xl left" border="l-2 solid [#C4C4C4] <sm:r-0">
        <div class="flex items-end">
          <div class="flex items-center">
            <p m="r-10" text="5xl <sm:3xl left [#D69F05]">
              {{ userName }}
            </p>
            <div text="2xl <sm:xl [#D69F05]">
              <p>{{ textData.identity }}</p>
              <p>{{ textData.lv }}{{ userHeroLevel }}</p>
            </div>
          </div>
          <button
            class="w-20 h-8 shadow-default rounded-[60px] from-[#FF9191] to-[#FF5169]"
            m="l-5"
            text="[#FFF]"
            bg="gradient-to-b"
            @click="onSignOut"
          >
            {{ textData.logOut }}
          </button>
        </div>
        <div class="w-90 flex flex-col justify-evenly h-50">
          <p class="flex items-center">
            <span class="basis-[80px]">{{ textData.devilContest }}</span>
            <span class="basis-[200px]" m="r-2" text="[#00CCCE] 3xl right">{{
              userInfoPlayCount.bossContestPlayedCount
            }}</span>
            {{ textData.times }}
          </p>
          <p class="flex items-center">
            <span class="basis-[80px]">{{ textData.contest }}</span>
            <span class="basis-[200px]" m="r-2" text="[#00CCCE] 3xl right">{{
              userInfoPlayCount.contestPlayedCount
            }}</span>
            {{ textData.times }}
          </p>
          <p class="flex items-center">
            <span class="basis-[80px]">{{ textData.userPoint }}</span>
            <span class="basis-[200px]" m="r-2" text="[#FDC221] 3xl right">{{ userPoint }}</span>
            {{ textData.score }}
          </p>
          <p class="flex items-center">
            <span class="basis-[200px]">{{ textData.outerWorldProgress }}</span>
            <span class="basis-[150px]" text="20px [#666666] 3xl right">{{ userInfoPlayCount.warEndLevel }}</span>
          </p>
          <p class="flex items-center">
            <span class="basis-[200px]">{{ textData.innerWorldProgress }}</span>
            <span class="basis-[150px]" text="20px [#666666] 3xl right">{{ userInfoPlayCount.antiTDEndLevel }}</span>
          </p>
        </div>
        <button
          class="rounded-[60px] yellowGradient shadow-default w-80 h-10 justify-self-end"
          m="l-5 t-3"
          text="[#FFF]"
          @click="openPortfolio"
        >
          {{ textData.openPortfolio }}
        </button>
      </div>
    </div>
    <!-- 進度條 -->
    <template v-if="isShowUnlockProgress">
      <UnlockProgress m="t-2" :userPoint="userPoint" :heroScoreStep="heroScoreStep" :unlockLevel="currentLevel" />
    </template>
    <!-- 卡片列表 -->
    <div>
      <HeroCardList
        :heroCards="heroCards"
        :lockMessage="canUnlockHero"
        @openConfirmHeroDialog="openConfirmHeroDialog"
        @openUnlockHeroDialog="openUnlockHeroDialog"
        @onOpenHeroInfoDialog="onOpenHeroInfoDialog"
      />
    </div>
    <!-- 學生雷達圖 -->
    <div>
      <div><StudentRadarChart></StudentRadarChart></div>
    </div>
    <!-- 英雄首抽彈窗 -->
    <template v-if="isLogin">
      <FirstHeroDialog
        v-if="heroCount < 1"
        :heroCards="heroCards"
        @onOpenHeroInfoDialog="onOpenHeroInfoDialog"
        @chooseHero="openSelectHeroDialog"
      />
      <!-- 確認首抽英雄彈窗 -->
      <ConfirmFirstHero
        v-model="confirmFirstHeroDialogVisible"
        :firstHeroIndex="chooseHeroIndex"
        @closeDialog="confirmFirstHeroDialogVisible = false"
        @confirmHero="onHeroFirstChoice"
      />
    </template>
    <!-- 確認英雄彈窗 -->
    <ConfirmDialog :confirmDialogVisible="confirmHeroDialogVisible" @closeConfirmDialog="closeConfirmHeroDialog">
      <template v-slot>
        <p>
          {{ textData.comfirmSelect }}
          <span>{{ $t(`common.${confirmName}`) }}</span>
        </p>
        <div text="[#ff0000]">{{ textData.changeHint }}</div>
      </template>
    </ConfirmDialog>
    <!-- 解鎖英雄彈窗 -->
    <ConfirmDialog :confirmDialogVisible="unlockHeroDialogVisible" @closeConfirmDialog="closeUnlockHeroDialog">
      <template v-slot>
        <p>
          {{ textData.unlocked }}
          Lv{{ confirmLevel }} {{ $t(`common.${confirmName}`) }}
        </p>
      </template>
    </ConfirmDialog>
    <!-- 解鎖失敗提醒彈窗 -->
    <WarningDialog :warningDialogVisible="warningDialogVisible" @closeWarningDialog="closeWarningDialog">
      <template v-slot>
        <p>{{ warningInfo }}</p>
      </template>
    </WarningDialog>
    <!-- 生物兵器&逆塔防隊伍編輯介面 -->
    <AntiTDDialog
      v-model="isShowAntiTDDialog"
      :userInfo="planetUserInfo"
      :antiTDHeroTeam="antiTDHeroTeam"
      :isShowPageTag="true"
      :startTabType="openQueueType"
      @onCloseDialog="isShowAntiTDDialog = false"
      @onOpenWeaponHintDialog="isWeaponHintDialog = true"
      @onOpenAntiTDHintDialog="isAntiTDHintDialog = true"
    />
    <!-- 生物兵器說明介面 -->
    <WeaponHintDialog v-model="isWeaponHintDialog" />
    <!-- 逆塔防隊伍說明介面 -->
    <AntiTDHintDialog v-model="isAntiTDHintDialog" />
    <!-- 英雄介紹彈窗 -->
    <HeroInfoDialog v-model="isHeroInfoDialog" :heroId="heroInfoId" />
  </div>
</template>
<script lang="ts">
import Config from '@/config/setting';
import { Component, Vue } from 'vue-property-decorator';
import { PlanetWarType } from '@/helper/enum/Common';
import { ResponseState } from '@/helper/enum/Common';
import { userInfoAdlEduAPI } from '@/api/profile';
import { Message } from '@/helper/class/Common';
import HeroCard from '@/components/Public/HeroCard.vue';
import HeroCardList from '@/components/Profile/HeroCardList.vue';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog.vue';
import WarningDialog from '@/components/Dialog/WarningDialog.vue';
import FirstHeroDialog from '@/components/Profile/FirstHeroDialog.vue';
import UnlockProgress from '@/components/Profile/UnlockProgress.vue';
import { HeroListData, HeroTeamNet } from '@/helper/interface/Hero';
import { UserPlayCountInfo } from '@/helper/interface/Profile';
import { planetWarUserInfoAPI } from '@/api/planetWar';
import { PlanetUserInfoData } from '@/helper/interface/PlanetWar';
import ImgPath from '@/config/imgPath/imgPath';
import ConfirmFirstHero from '@/components/Profile/ConfirmFirstHero.vue';
import EquipmentList from '@/components/Profile/EquipmentList.vue';
import AntiTDDialog from '@/components/AntiTD/AntiTDDialog.vue';
import WeaponHintDialog from '@/components/PlanetWar/WeaponHintDialog.vue';
import AntiTDHintDialog from '@/components/AntiTD/AntiTDHintDialog.vue';
import HeroInfoDialog from '@/components/Profile/HeroInfoDialog.vue';
import RouteLocationNormalized, { NavigationGuardNext } from 'vue-router';
import TableManager, { HeroUnlockPointData } from '@/manager/TableManager';
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import StudentRadarChart from '@/components/Profile/StudentRadarChart.vue';

Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave', 'beforeRouteUpdate']);

@Component({
  components: {
    HeroCardList,
    ConfirmDialog,
    WarningDialog,
    FirstHeroDialog,
    HeroCard,
    UnlockProgress,
    ConfirmFirstHero,
    EquipmentList,
    AntiTDDialog,
    WeaponHintDialog,
    AntiTDHintDialog,
    HeroInfoDialog,
    StudentRadarChart,
  },
})
export default class Index extends Vue {
  /** 文字資料 */
  private textData = {
    identity: '身分',
    lv: 'LV',
    logOut: '登出',
    devilContest: '魔王賽',
    contest: '一般賽事',
    userPoint: '總積分',
    outerWorldProgress: '表宇宙星球大戰進度',
    innerWorldProgress: '裡宇宙星球大戰進度',
    openPortfolio: '前往我的學習歷程',
    score: '分',
    times: '場',
    checkWeapon: '查看生物兵器',
    comfirmSelect: '確定選擇',
    changeHint: '*按下確定後,裡宇宙隊伍陣容也會改變喔!',
    unlocked: '解鎖',
  };

  /** 圖片資料 */
  private imgData = {
    bgDot: ImgPath.bgDot,
  };

  /** 現在打開彈窗的狀態 */
  private openQueueType: PlanetWarType = PlanetWarType.Outter;

  // 進行過的賽事場次跟進度
  private userInfoPlayCount: UserPlayCountInfo = {
    contestPlayedCount: 0,
    bossContestPlayedCount: 0,
    warEndLevel: '',
    antiTDEndLevel: '',
  };

  // 顯示生物兵器彈窗開關
  private isShowAntiTDDialog: boolean = false;

  //#region 個人資訊及英雄相關
  private userName: string = this.$$store.getters.userName;
  private userPoint: number = 0;
  //#endregion

  //#region 組件顯示相關
  /** 是否顯示生物兵器說明頁面 */
  private isWeaponHintDialog: boolean = false;
  /** 是否顯示逆塔防隊伍說明頁面 */
  private isAntiTDHintDialog: boolean = false;
  /** 是否顯示英雄說明頁面 */
  private isHeroInfoDialog: boolean = false;
  /** 確認首抽英雄彈窗顯示 */
  private confirmFirstHeroDialogVisible: boolean = false;
  /** 確認英雄彈窗顯示 */
  private confirmHeroDialogVisible: boolean = false;
  /** 解鎖英雄彈窗顯示 */
  private unlockHeroDialogVisible: boolean = false;
  /** 提醒彈窗顯示 */
  private warningDialogVisible: boolean = false;
  /** 是否顯示積分進度表 */
  private isShowUnlockProgress: boolean = false;
  //#endregion

  //#region 組件資訊暫存
  /** 首抽選擇英雄 */
  private chooseHeroIndex: number = -1;
  /** 選擇英雄圖卡 */
  private heroCardIndex: number = -1;
  /** 選擇生物兵器圖卡 */
  private bioweaponCardsIndex: number = -1;
  /** 上場英雄編號 */
  private choiceHeroIndex: number = -1;
  /** 英雄介紹彈窗 ID */
  private heroInfoId: number = -1;
  /** 確認資訊(花費) */
  private confirmCost: number = 0;
  /** 確認資訊(等級) */
  private confirmLevel: number = 0;
  /** 確認資訊(名稱) */
  private confirmName: string = 'name';
  /** 確認資訊(圖片路徑) */
  private confirmImg: string = 'hero_card';
  /** 確認資訊(屬性) */
  private confirmAttribute: number = 0;
  /** 提醒資訊 */
  private warningInfo: string = '';
  /** 英雄分數等級表 */
  private heroScoreStep: HeroUnlockPointData[] = TableManager.heroUnlockPoint.getAll();
  //#endregion

  /** 個人資訊 */
  private planetUserInfo: PlanetUserInfoData | null = null;

  /** 逆塔防跟塔防 enum */
  private PlanetWarType = PlanetWarType;

  /** 判斷是否已登入 */
  private get isLogin(): boolean {
    return this.$$store.getters.isLogin;
  }

  /** 上場英雄頭像 */
  private get userHero(): HeroListData {
    return this.$$store.getters.onlineHero ?? ({} as HeroListData);
  }

  /** 上場英雄頭像 */
  private get userAvatar(): string {
    return this.$$store.getters.onlineHero?.url ?? '';
  }

  /** 上場英雄等級 */
  private get userHeroLevel(): number {
    return this.$$store.getters.onlineHero?.level ?? -1;
  }

  /** 全部英雄(有紀錄目前是否解鎖，是否上場，等級資訊) */
  private get heroCards(): HeroListData[] {
    return this.$$store.state.HeroManagerModule.heroList;
  }

  /** 使用者目前擁有英雄數量 */
  private get heroCount(): number {
    return this.$$store.getters.heroCount;
  }

  /** 是否能解鎖新英雄 */
  private get canUnlockHero(): boolean {
    return this.currentLevel > this.heroCount;
  }

  /** 現在等級 */
  private get currentLevel(): number {
    for (let i = 0; i < this.heroScoreStep.length; i++) {
      if (this.heroScoreStep[i].UnLockPoint > this.userPoint) {
        return i;
      }
    }
    return this.heroScoreStep.length;
  }

  /** 逆塔防隊伍 */
  private get antiTDHeroTeam(): Array<HeroListData | undefined> {
    return this.$$store.getters.antiTDHeroTeam;
  }

  /** 取得上場英雄順序 */
  private get onlineHeroIndex(): number {
    return this.heroCards.findIndex((hero) => hero.heroId === this.$$store.getters.onlineHero?.heroId);
  }

  created() {
    // 取得星球大戰個人資訊
    this.getPlanetWarUserInfo();
    // 使用者個人資訊
    this.getUserInfoAdiEdu();
    // 使用者目前總積分
    this.getHeroTotalPoint();
  }

  beforeRouteLeave(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    if (this.heroCount < 1) {
      return;
    }
    next();
  }

  /** 取得星球大戰用戶資訊 */
  private async getPlanetWarUserInfo(): Promise<void> {
    try {
      // API 取得星球大戰資訊
      const response: any = await planetWarUserInfoAPI.fetch({});
      if (response.result === ResponseState.Success) {
        this.planetUserInfo = response;
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得個人資訊 */
  private async getUserInfoAdiEdu(): Promise<void> {
    try {
      // API 取得個人資訊
      const response: any = await userInfoAdlEduAPI.fetch({});
      if (response.result === ResponseState.Success) {
        const data = response;
        this.userInfoPlayCount = {
          contestPlayedCount: data.adlSubjectContestPlayedCount,
          bossContestPlayedCount: data.bossContestPlayedCount,
          warEndLevel: data.planetWarEndLevel,
          antiTDEndLevel: data.antiTDEndLevel,
        };
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 後端取得使用者總積分 */
  private async getHeroTotalPoint(): Promise<void> {
    this.userPoint = await this.$$store.dispatch('getUserPoint');
    this.isShowUnlockProgress = true;
  }

  /** 登出 */
  private async onSignOut(): Promise<void> {
    try {
      // API 登出
      await this.$$store.dispatch('logout');
    } catch (e) {
      console.error(`${e}`);
      return;
    }

    // 登出成功提示
    Message.success('登出成功');

    // 返回首頁
    location.replace(`${Config.homePath}`);
  }

  /** 前往個人學習歷程 */
  private openPortfolio(): void {
    // 跳轉頁面
    this.$router.push(`${MenuName.Portfolio}`);
  }

  /** 開啟生物兵器&逆塔防隊伍介面
   * @param newOpenQueueType
   */
  private async openAntiTDDialog(newOpenQueueType: PlanetWarType): Promise<void> {
    // 設定當前介面類別
    this.openQueueType = newOpenQueueType;

    // 重新抓取星球大戰資訊
    await this.getPlanetWarUserInfo();

    // 顯示資訊
    this.isShowAntiTDDialog = true;
  }

  /** 更新英雄隊伍編制
   *  @param index 上場英雄列表序號
   */
  private async putHeroTeam(index: number): Promise<void> {
    try {
      // 更換上場英雄
      const heroData: HeroTeamNet = {
        subjectSeat: this.$$store.getters.subjectSeat,
        hid: this.heroCards[index].hid,
      };
      await this.$$store.dispatch('onChangeHero', heroData);

      // 通知
      Message.success('更換成功！');
    } catch (e) {
      return;
    }
  }

  /** 首次解鎖英雄 */
  private async onHeroFirstChoice(): Promise<void> {
    try {
      // 首抽
      await this.$$store.dispatch('onHeroFirstChoice', this.chooseHeroIndex);

      // 返回首頁
      location.replace(`${Config.homePath}`);
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 開啟首抽英雄確認彈窗
   * @param index 英雄列表序號
   */
  private openSelectHeroDialog(index: number) {
    this.chooseHeroIndex = index;
    // 開啟首抽英雄確認彈窗
    this.confirmFirstHeroDialogVisible = true;
  }

  /** 開啟英雄確認彈窗
   * @param index 英雄列表序號
   */
  private openConfirmHeroDialog(index: number) {
    if (this.onlineHeroIndex === index) {
      return;
    }
    this.choiceHeroIndex = index;
    // 確認彈窗資訊設定
    this.setConfirmInfo('hero', index, this.heroCards);
    // 開啟英雄確認彈窗
    this.confirmHeroDialogVisible = true;
  }

  /** 關閉英雄確認彈窗
   * @param comfirm 是否確定
   */
  private closeConfirmHeroDialog(comfirm: boolean) {
    this.confirmHeroDialogVisible = false;
    this.confirmInfoReset(); // 確認彈窗資訊重置
    if (comfirm) {
      if (this.choiceHeroIndex !== -1) {
        this.putHeroTeam(this.choiceHeroIndex);
      }
    }
  }

  /** 開啟英雄解鎖彈窗
   * @param index 英雄列表序號
   */
  private openUnlockHeroDialog(index: number) {
    // 積分不足
    if (this.canUnlockHero === false) {
      this.warningInfo = '積分不足，無法解鎖!';
      this.warningDialogVisible = true;
      return;
    }

    this.heroCardIndex = index;
    // 確認彈窗資訊設定
    this.setConfirmInfo('hero', index, this.heroCards);
    // 開啟英雄解鎖彈窗
    this.unlockHeroDialogVisible = true;
  }

  /** 關閉英雄解鎖彈窗
   * @param confirm 是否確定
   */
  private async closeUnlockHeroDialog(confirm: boolean) {
    this.unlockHeroDialogVisible = false;
    this.confirmInfoReset(); // 確認彈窗資訊重置
    const index = this.heroCardIndex;
    if (confirm) {
      if (index !== -1) {
        // 解鎖失敗
        if ((await this.$$store.dispatch('onUnlockHero', index)) === false) {
          this.warningInfo = '積分不足，無法解鎖!';
          this.warningDialogVisible = true;
        }
      }
    }
  }

  /** 開啟英雄說明輪播
   * @param index 英雄列表序號
   */
  private onOpenHeroInfoDialog(heroData: HeroListData) {
    this.isHeroInfoDialog = true;
    this.heroInfoId = heroData.heroId;
  }

  /** 關閉解鎖失敗提醒彈窗 */
  private closeWarningDialog() {
    this.warningDialogVisible = false;
  }

  /** 確認彈窗資訊重置 */
  private confirmInfoReset() {
    this.confirmCost = 0;
    this.confirmLevel = 0;
    this.confirmName = 'name';
    this.confirmImg = 'hero_card';
    this.confirmAttribute = 0;
  }

  /** 確認彈窗資訊設定
   * @param type 列表類型
   * @param index 列表序號
   * @param cards 列表內容
   */
  private setConfirmInfo(type: string, index: number, cards: any[]) {
    switch (type) {
      case 'weapon':
        this.confirmCost = cards[index].cost; // 花費晶球
        this.confirmLevel = cards[index].level; // 等級
        this.confirmName = cards[index].weaponId; // 名稱
        break;
      case 'hero':
        this.confirmLevel = cards[index].level; // 等級
        this.confirmName = cards[index].name; // 名稱
        this.confirmImg = cards[index].url; // 圖片
        this.confirmAttribute = cards[index].attribute; // 屬性
        break;
    }
  }
}
</script>
