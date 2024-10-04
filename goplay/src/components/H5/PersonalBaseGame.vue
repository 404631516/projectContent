<template>
  <div class="overflow-hidden flex-pos flex-col">
    <!-- 標題區 -->
    <div class="w-full h-full">
      <!-- 個人基地的天 -->
      <div
        class="w-full top-0 flex items-center justify-evenly h-19.5 title_bar"
        border="b-8px solid [#D9C37C]"
        :bg="isOpenShop ? '[#E5D1B0]' : '[#FFFAEB]'"
      >
        <template v-if="isOpenShop === false">
          <!-- 按鈕區 -->
          <div class="flex space-x-2">
            <!-- 返回首頁 -->
            <button
              class="grid grid-cols-[1fr,3fr] items-center rounded-[30px] shadow-default yellowGradient"
              p="x-3 y-3"
              @click="onReturnHomePage"
            >
              <img :src="imgData.doubleArrow" class="w-5 transform rotate-180" />
              <p text="lg [#FFFFFF]">{{ textData.returnText }}</p>
            </button>
            <!-- 因雄宇宙 -->
            <button
              class="grid grid-cols-[1fr,3fr] items-center rounded-[30px] shadow-default blueGradient"
              p="x-3 y-3"
              @click="onGoToHeroUniverse"
            >
              <img :src="imgData.doubleArrow" class="w-5 transform rotate-180" />
              <p text="lg [#FFFFFF]">{{ textData.heroUniverse }}</p>
            </button>
          </div>

          <div class="flex flex-row information_block">
            <!-- 裝飾分 -->
            <div class="w-88 flex items-center justify-start relative">
              <img :src="imgData.frameRight" class="object-contain absolute" />
              <img :src="imgData.redBowTie" class="h-19.5 object-contain z-1" m="l-5" />
              <span class="z-1" text="xl [#FFF]" m="x-4">{{ textData.adornmentScore }}</span>
              <span class="z-1" text="2xl [#F7E735]">{{ adornmentTotalScore }}</span>
            </div>
            <!-- 擴張房間說明 -->
            <div class="w-105 flex items-center justify-end relative" :class="isVisitor ? 'hidden' : ''">
              <!-- 背景圖 -->
              <img :src="imgData.frameLeft" class="object-contain absolute" />
              <!-- 房子圖 -->
              <img :src="imgData.homeWhite" class="h-7 object-contain z-1" />
              <!-- 擴張房間 -->
              <span class="z-1" m="l-2" text="xl [#FFF]">{{ textData.extendRoom }}</span>
              <div class="grid grid-rows-2 z-1" m="x-3">
                <!-- 等級 -->
                <div class="flex">
                  <div class="w-7 aspect-square rounded-[50%] z-2" text="xl [#000]" bg="[#FFDE39]">
                    {{ currentLevel }}
                  </div>
                  <!-- 進度條 -->
                  <div class="w-35 h-3 rounded-[10px]" m="-l-1 t-2" text="left" bg="[#878787]">
                    <span
                      class="h-full block rounded-[10px]"
                      bg="[#FFDE39]"
                      :style="{ width: `${expProgress}%` }"
                    ></span>
                  </div>
                  <div class="w-7 aspect-square rounded-[50%] z-2" m="-l-2" text="xl [#000]" bg="[#FFDE39]">
                    {{ nextLevel }}
                  </div>
                </div>
                <!-- 分數 -->
                <div class="flex justify-between">
                  <span text="lg <xl:sm [#FDC221]">{{ currentLevelPoint }}</span>
                  <span text="lg <xl:sm [#FDC221]">{{ nextLevelPoint }}</span>
                </div>
              </div>
              <!-- 驚嘆號 -->
              <img
                :src="imgData.blueNotice"
                class="h-11 object-contain z-1 cursor-pointer"
                m="r-5 b-1"
                @click="onOpenHintDialog(true)"
              />
            </div>
          </div>
        </template>
      </div>
      <!-- Phaser遊戲 -->
      <div :id="containerId" />
    </div>
    <!-- 個人基地商店 -->
    <AdornmentStoreDialog
      v-model="isOpenShop"
      :isBuy="isBuy"
      @onChangeStoreState="onChangeStoreState"
      @onOpenAdornmentDetailDialog="onOpenDetailDialog"
    />
    <!-- 個人基地背包 -->
    <AdornmentBackpackDialog
      v-model="isOpenBackpack"
      @onGoStore="onGoStore"
      @onOpenAdornmentDetailDialog="onOpenDetailDialog"
    />
    <!-- 裝飾物詳細內容 -->
    <AdornmentDetailDialog
      v-model="isAdornmentDetailDialog"
      :adornmentData="currentAdornmentData"
      :isStore="isOpenShop"
      :isBuy="isBuy"
      @onSetAdornment="onSetAdornment"
    />
    <!-- 擴張房間說明 -->
    <AdornmentHintDialog v-model="isOpenHintDialog" @onCloseDialog="onOpenHintDialog(false)" />
    <!-- 同班同學列表 -->
    <PersonalBaseClassmate v-model="isShowClass" @goToVisitClassmate="classmateData = $event" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import AdornmentStoreDialog from '@/components/Public/AdornmentStoreDialog.vue';
import { AdornmentListData, ClassmateData, PersonalBase, RoomStatus } from '@/helper/interface/Adornment';
import AdornmentDetailDialog from '@/components/Public/AdornmentDetailDialog.vue';
import AdornmentHintDialog from '@/components/Public/AdornmentHintDialog.vue';
import TableManager, { AdornmentLevelData } from '@/manager/TableManager';
import { AdornmentGameData } from '@/helper/interface/Game';
import AdornmentBackpackDialog from '@/components/Public/AdornmentBackpackDialog.vue';
import BigNumber from 'bignumber.js';
import PersonalBaseClassmate from '@/components/Public/PersonalBaseClassmate.vue';
import { AdornmentGame, IAdornmentWeb } from '@/views/H5/Games/Common/PhaserGameStrategy';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RankingTabType } from '@/helper/enum/Common';

@Component({
  components: {
    AdornmentStoreDialog,
    AdornmentBackpackDialog,
    AdornmentDetailDialog,
    AdornmentHintDialog,
    PersonalBaseClassmate,
  },
})
export default class PersonalBaseGame extends Vue implements IAdornmentWeb {
  /** 遊戲表演座標 */
  private containerId: string = 'game-container';
  /** Phaser遊戲實例 */
  private adornmentGame!: AdornmentGame;
  /** 是否為購買狀態 */
  private isBuy: boolean = true;
  /** 是否開啟裝飾物詳細內容 */
  private isAdornmentDetailDialog: boolean = false;
  /** 是否從商店返回 */
  private isFromStore: boolean = false;
  /** 當前選到的裝飾物資料 */
  private currentAdornmentData: AdornmentListData = {} as AdornmentListData;
  /** 現在裝飾分數 */
  private currentLevelPoint: string = '';
  /** 現在裝飾等級 */
  private currentLevel: string = '';
  /** 下一個裝飾分數 */
  private nextLevelPoint: string = '';
  /** 下一個裝飾等級 */
  private nextLevel: string = '';
  /** 進度條%數 */
  private expProgress: number = 0;
  /** 是否顯示同班同學列表 */
  private isShowClass: boolean = false;
  /** 是否開啟房間擴張說明 */
  private isOpenHintDialog: boolean = false;
  /** 是否開啟商店 */
  private isOpenShop: boolean = false;
  /** 是否開啟背包 */
  private isOpenBackpack: boolean = false;
  /** 同學資料 */
  private classmateData?: ClassmateData;

  /** 文字資料 */
  private textData = {
    adornmentScore: '裝飾分',
    extendRoom: '擴張房間',
    returnText: '返回首頁',
    heroUniverse: '因雄宇宙',
  };

  /** 圖片資料 */
  private imgData = {
    doubleArrow: ImgPath.arrowTwoIconBaseUrl,
    personalTitle: ImgPath.personalTitleBar,
    frameRight: ImgPath.frameRightSlide,
    frameLeft: ImgPath.frameLeftSlide,
    redBowTie: ImgPath.redBowTie,
    homeWhite: ImgPath.homeWhiteUrl,
    blueNotice: ImgPath.blueNotice,
  };

  /** 房間列表 */
  private get personalBaseList(): PersonalBase[] {
    return this.$$store.state.AdornmentModule.personalBaseList;
  }

  /** 抓取裝飾總分 */
  private get adornmentTotalScore(): string {
    return new BigNumber(this.$$store.state.AdornmentModule.adornmentTotalScore).toFormat();
  }

  /** 是否為拜訪者 */
  private get isVisitor(): boolean {
    return this.$$store.state.AdornmentModule.isVisit;
  }

  async created() {
    // 預設進自家
    let userUid = this.$$store.getters.userUid;

    // 非本人, 儲存要查看的User房間
    if (this.$route.params.id != null) {
      userUid = Number(this.$route.params.id);
    }

    // 開始遊戲
    await this.startGame(userUid);
  }

  /** 關閉時摧毀遊戲 */
  destroyed() {
    // 關閉所有彈窗
    this.isShowClass = false;
    this.isOpenShop = false;
    this.isOpenBackpack = false;
    // 摧毀遊戲
    this.adornmentGame?.destroyGame();
  }

  /** 開始遊戲
   *  @param uid 使用者編號
   */
  private async startGame(uid: number): Promise<void> {
    // 是否拜訪
    const isVisit = uid !== this.$$store.getters.userUid;

    // 取得該user的所有房間內的裝飾物列表(personalBaseList)
    const personalBaseList = await this.$$store.dispatch('getAllPersonalBasePageList', uid);

    // 設定是否為拜訪
    this.$$store.commit('setAdornmentIsVisit', isVisit);

    // 拜訪時
    let gameData: AdornmentGameData | undefined;
    if (isVisit) {
      // 建立拜訪者房間資料
      gameData = await this.createVisitorGameData(uid, personalBaseList);
    }
    // 自家
    else {
      // 建立自己房間資料
      gameData = await this.createSelfGameData(uid, personalBaseList);
    }

    // 返回上一頁
    if (gameData === undefined) {
      this.onReturnHomePage();
      return;
    }

    // 設定GameData
    this.$$store.commit('setAdornmentGameData', gameData);

    // 開始遊戲
    this.adornmentGame = new AdornmentGame(gameData, this);
    this.adornmentGame.startGame(this.containerId, this.$$store.getters.isMute);
  }

  /** 重新開始遊戲
   *  @param uid 使用者編號
   */
  private restartGame(uid: number): void {
    // 摧毀目前遊戲
    this.adornmentGame?.destroyGame();

    // start Game
    this.startGame(uid);
  }

  /** 建立自己遊戲資料
   *  @param uid 使用者編號
   *  @param personalBaseList 房間列表
   */
  private async createSelfGameData(
    uid: number,
    personalBaseList: PersonalBase[],
  ): Promise<AdornmentGameData | undefined> {
    // 抓取使用者的背包資料(包含裝飾物和逆塔防道具)
    await this.$$store.dispatch('getHeroj7BackPack');
    // 塞gameData
    const userPoint = await this.$$store.dispatch('getUserPoint');
    const levelDataList = TableManager.adornmentLevel.getAll().filter((level) => userPoint >= level.nextLevelPoint);
    const levelData = levelDataList[levelDataList.length - 1];
    if (levelData == null) {
      console.error(`抓不到房間等級 levelData = null`);
      return;
    }

    // 組成房間狀態
    const roomStatus: RoomStatus = {
      roomList: personalBaseList,
      levelData,
    };
    this.$$store.commit('setUnlockRoomStatus', roomStatus);

    // 塞gameData
    const gameData: AdornmentGameData = {
      heroList: this.$$store.state.HeroManagerModule.heroNetList.map<number>((hero) => hero.heroId),
      heroTotalPoint: userPoint,
      adornmentLevelData: levelData,
      personalBaseList,
      adornmentPositionList: this.$$store.state.AdornmentModule.adornmentPositionList,
    };

    // 抓取裝飾等級
    this.setCurrentState(gameData);

    // 返回遊戲資料
    return gameData;
  }

  /** 建立拜訪者遊戲資料
   *  @param uid 使用者編號
   *  @param personalBaseList 房間列表
   */
  private async createVisitorGameData(uid: number, personalBaseList: PersonalBase[]): Promise<AdornmentGameData> {
    // 塞拜訪gameData
    return {
      heroList: await this.$$store.dispatch('getVisitorHeroList', uid),
      heroTotalPoint: -1,
      adornmentLevelData: {} as AdornmentLevelData,
      personalBaseList,
      adornmentPositionList: this.$$store.state.AdornmentModule.adornmentPositionList,
    };
  }

  /** 取得當前狀態
   *  @param gameData 使用者遊戲資料
   */
  private setCurrentState(gameData: AdornmentGameData): void {
    const userLevel = gameData.adornmentLevelData.id;
    const nextLevelData = TableManager.adornmentLevel.findOne(userLevel + 1);
    // 找不到代表積分超過靜態表最大值
    if (nextLevelData == null) {
      const preLevelData = TableManager.adornmentLevel.findOne(userLevel - 1);
      // 防呆
      if (preLevelData == null) {
        console.error(`抓不到前一個房間等級 preLevelData = null`);
        return;
      }

      this.currentLevelPoint = `${preLevelData.nextLevelPoint}`;
      this.currentLevel = `${preLevelData.id}`;
      this.nextLevelPoint = 'MAX';
      this.nextLevel = `${userLevel}`;
      this.expProgress = 100;
    } else {
      this.currentLevelPoint = `${gameData.adornmentLevelData.nextLevelPoint}`;
      this.currentLevel = `${userLevel}`;
      this.nextLevelPoint = `${nextLevelData.nextLevelPoint}`;
      this.nextLevel = `${nextLevelData.id}`;
      this.expProgress =
        ((gameData.heroTotalPoint - gameData.adornmentLevelData.nextLevelPoint) /
          (nextLevelData.nextLevelPoint - gameData.adornmentLevelData.nextLevelPoint)) *
        100;
    }
  }

  /** 控制Phaser遊戲是否暫停
   *  @param isPause 是否暫停
   */
  private pausePhaserGame(isPause: boolean): void {
    this.adornmentGame.adornmentGameScene.onOpenVueUI(isPause);
  }

  /** 開啟商店 */
  public async onOpenShop(): Promise<void> {
    this.isOpenShop = true;

    await AsyncHelper.pendingUntil(() => this.isOpenShop === false);
  }

  /** 開啟背包 */
  public async onOpenBackpack(): Promise<void> {
    this.isOpenBackpack = true;

    await AsyncHelper.pendingUntil(() => this.isOpenBackpack === false && this.isOpenShop === false);
  }

  /** 開啟同班同學列表 */
  public async onOpenClassmateList(): Promise<boolean> {
    // 沒有學校資訊不開啟
    if (this.$$store.getters.userSchoolId <= 0) {
      await this.$alert('此帳號不具備學校資訊', '提示');
    }
    // 開啟同班同學列表
    else {
      this.isShowClass = true;
    }

    // 等待彈窗關閉
    await AsyncHelper.pendingUntil(() => this.isShowClass === false);

    // 同班同學資料不為空,拜訪
    if (this.classmateData != null) {
      // 設定姓名
      this.$$store.commit('setVisitBaseOwnerName', this.classmateData.name);
      // 重置拜訪排名
      this.$$store.commit('setVisitBaseOwnerRank', 0);

      // 重開遊戲
      this.restartGame(this.classmateData.uid);

      // 清除資料
      this.classmateData = undefined;
      return true;
    }
    // 關閉彈窗
    else {
      return false;
    }
  }

  /** 開啟解鎖房間訊息 */
  public async onOpenUnlockRoomMessage(): Promise<boolean> {
    // 是否解鎖
    let isUnlock: boolean = false;
    await this.$msgbox({
      title: '解鎖模式',
      message: this.$createElement('p', undefined, [
        this.$createElement('span', { style: 'color : #A5A5A5' }, '選擇解鎖這間房間嗎？ '),
        this.$createElement('br', undefined),
        this.$createElement('span', { style: 'color : #FF5D5D' }, '一旦選擇就不能反悔喔！'),
      ]),
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })
      .then(() => {
        isUnlock = true;
      })
      .catch(() => {
        isUnlock = false;
      });

    return isUnlock;
  }

  /** 打開裝飾物詳細內容彈窗
   *  @param adornmentData 裝飾物內容
   */
  private onOpenDetailDialog(adornmentData: AdornmentListData): void {
    this.currentAdornmentData = adornmentData;
    this.isAdornmentDetailDialog = true;
  }

  /** 背包中前往商店 */
  private onGoStore(): void {
    this.isOpenBackpack = false;
    this.isOpenShop = true;
  }

  /** 換商店狀態 */
  private onChangeStoreState(): void {
    this.isBuy = !this.isBuy;
  }

  /** 前往佈置 */
  private onSetAdornment(): void {
    // 從背包前往佈置時關閉背包和詳細內容彈窗
    this.isOpenBackpack = false;
    this.isAdornmentDetailDialog = false;
    // 呼叫GameScene開啟佈置模式
    this.adornmentGame.adornmentGameScene.onOpenEditMode(this.currentAdornmentData.id);
  }

  /** 控制擴張房間說明彈窗
   *  @param isOpen 是否開啟
   */
  private onOpenHintDialog(isOpen: boolean): void {
    this.isOpenHintDialog = isOpen;
    this.adornmentGame.adornmentGameScene.onOpenVueUI(isOpen);
  }

  /** 回到首頁 */
  private onReturnHomePage(): void {
    this.$router.push('/');
  }

  /** 前往因雄宇宙 */
  private onGoToHeroUniverse(): void {
    this.$router.push({
      name: `${MenuName.HeroUniverse}`,
    });
  }

  /** 回到自己房間 */
  public goBackSelfHome(): void {
    this.restartGame(this.$$store.getters.userUid);
  }

  /** 回排行榜 */
  public goBackRankList(): void {
    // 跳轉回排行榜
    this.$router.push({
      name: `${MenuWord.RankingList}`,
      params: { id: `${RankingTabType.PersonalBaseRankList}` },
    });
  }
}
</script>
<style lang="scss" scoped>
.title-shadow {
  text-shadow: 0 1px #6d3e01, 0 -1px #6d3e01, 1px 0 #6d3e01, -1px 0 #6d3e01;
}
@media (max-width: 435px) {
  .title_bar {
    height: auto;
    flex-direction: column;
  }

  .information_block {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    justify-items: center;
  }
}
</style>
