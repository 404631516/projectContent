<template>
  <div class="planet-wrapper flex-pos" :style="`background: url(${planetWarBg})`">
    <template v-if="isShowClearDialog">
      <PlanetClearDialog v-model="isShowClearDialog" :img="clearImg" :text="clearText" />
    </template>
    <div class="planetlist-box w-[60%] <lg:w-[70%] <sm:w-[80%]">
      <!-- 當前關卡進度 -->
      <!-- <div class="fixed mr-200" text="30px [#FFF]">{{ currentStageName }}</div> -->
      <!-- 表/裡宇宙標示 -->
      <div
        class="w-314px pointer-events-none fixed flex justify-start items-center z-5 <sm:hidden"
        :style="`backgroundImage: url(${imgData.gradientBackground})`"
        bg="no-repeat center contain"
      >
        <img :src="portalIcon" class="inline-block ml-2" /><span text="30px [#FFF]">{{ portalText }}</span>
      </div>
      <!-- 因雄宇宙按鈕 -->
      <button
        class="top-[175px] w-auto fixed flex justify-start items-center z-5 bg-black bg-opacity-50 rounded-2xl p-[2px]"
        @click="onClickGoToHeroUniverse"
      >
        <img :src="imgData.universeArrow" class="inline-block" style="transform: scaleX(-1)" />
        <span text="30px [#FFF]">{{ textData.heroUniverse }}</span>
      </button>
      <!-- 總星數 -->
      <div class="fixed left-[70%] z-5 <sm:left-2" m="t-3 <2xl:t-4 <lg:t-30px <sm:t-0">
        <div
          class="grid grid-cols-[32px,70px,auto] gap-1 items-center"
          p="x-17px y-4px"
          bg="[#000000]"
          text="24px [#FFDE39] left <sm:16px"
          border="rounded-30px"
        >
          <img :src="imgData.starIcon" class="inline-block object-contain aspect-square <sm:transform <sm:scale-80" />
          <span text="20px [#FFFFFF] <sm:16px">{{ textData.totalStarCount }}</span>
          {{ totalStarCount }}
        </div>
        <!-- 玩法說明 -->
        <button
          v-if="planetWarType === PlanetWarType.Inner"
          class="shadow-default flex justify-center items-center"
          m="t-3 <sm:t-1"
          p="x-17px y-4px"
          border="2px solid [#FFF] rounded-80px"
          bg="[#000000CC]"
          text="20px [#FFF] <sm:16px"
          @click="onClickGuide"
        >
          <img :src="imgData.blueQuestionMark" m="r-10px" />{{ textData.guide }}
        </button>
      </div>
      <!--- 關卡顯示區 -->
      <div>
        <PointList :planetList="planetInfoList" @onClickPlanet="onClickPlanet" />
      </div>
      <!--- 下方位置 -->
      <div class="planetlist-bottom flex-pos">
        <!-- 表/裏宇宙按鈕 -->
        <button
          class="flex flex-col-reverse items-center bottom-[35%] right-[15%] fixed wormhole-btn image_animation <sm:(transform scale-50)"
          style="width: 256px; aspect-ratio: 1 / 1"
          :style="{ backgroundImage: `url(${wormholeIcon})` }"
          @click="onClickWormholeBtn"
        >
          <img class="w-28 h-11 object-contain absolute bottom-10" :src="underAnimationText" />
        </button>
        <div class="mask w-[99%] -left-[0%] <2xl:w-[100%]" :style="`background-image: url(${imgData.bottomMaskBg})`" />
        <!-- 塔防生物兵器 -->
        <div v-if="planetWarType == PlanetWarType.Outter" class="bottom-box">
          <div class="grid grid-cols-[1.5fr,1fr] gap-2 <lg:grid-cols-1">
            <!-- 英雄 -->
            <div class="hero-area grid grid-cols-1 grid-rows-[auto,82px]">
              <!-- 星球能量
              <div class="dare-area z-5" text="20px" p="x-47px y-7px">
                {{ textData.planetPower }}
                <span text="24px [#f2d253]">{{ planetPower }}</span>
              </div> -->
              <!-- 出戰英雄 -->
              <HeroAvatar
                class="z-5 max-w-600px row-start-2"
                bg="[#00000080]"
                border="3px solid [#FFFFFF]"
                v-if="onlineHero"
                :heroListData="onlineHero"
                :isShowChange="true"
                :isHalf="false"
                @onChangeHero="isChangeHero = true"
              ></HeroAvatar>
            </div>
            <!-- 生物兵器 -->
            <div class="weapon-click-area">
              <div class="weapon-title" @click="isShowAntiTDDialog = true">{{ textData.currentEquip }}</div>
              <div
                class="grid grid-cols-4 gap-3 rounded-10px max-w-500px max-h-220px cursor-pointer"
                m="t-1.5"
                p="3"
                bg="[#0d0d0d80]"
                border="3px solid [#FFF]"
                v-if="planetUserInfo"
                @click="isShowAntiTDDialog = true"
              >
                <TheWeapon
                  class="w-22 h-22"
                  v-for="weaponId in planetUserInfo.queueWeaponIds"
                  :key="weaponId"
                  :weaponId="weaponId"
                />
                <TheWeapon class="w-22 h-22" v-for="emptyNum in emptyWeaponNum" :key="`${emptyNum}*`" />
              </div>
            </div>
          </div>
        </div>
        <!-- 逆塔防隊伍 -->
        <div v-if="planetWarType == PlanetWarType.Inner" class="inside-world">
          <div>
            <!-- 星球能量
            <div class="dare-area">
              {{ textData.planetPower }}
              <span>{{ planetPower }}</span>
            </div> -->
            <!-- 逆塔防隊伍 -->
            <div class="weapon-click-area" @click="isShowAntiTDDialog = true">
              <AntiTDTeamPlace :antiTDHeroTeam="antiTDHeroTeam" :planetUserInfo="planetUserInfo" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 關卡資訊 -->
    <template v-if="isShowInfo">
      <PointInfo
        :msgVisible="isShowInfo"
        :infoData="planetDetailInfo"
        :planetWarType="planetWarType"
        :starMax="starMax"
        @onClickGo="onClickGo"
        @onClickClose="isShowInfo = false"
      />
    </template>
    <!-- 替換英雄 -->
    <div v-if="isChangeHero">
      <ReplaceHero v-model="isChangeHero" />
    </div>
    <!-- 生物兵器&逆塔防隊伍編輯介面 -->
    <AntiTDDialog
      v-model="isShowAntiTDDialog"
      :userInfo="planetUserInfo"
      :antiTDHeroTeam="heroDataList"
      :isShowPageTag="false"
      :startTabType="planetWarType"
      @onCloseDialog="isShowAntiTDDialog = false"
      @onOpenWeaponHintDialog="isWeaponHintDialog = true"
      @onOpenAntiTDHintDialog="isAntiTDHintDialog = true"
    />
    <!-- 生物兵器介紹彈窗 -->
    <WeaponHintDialog v-model="isWeaponHintDialog" />
    <!-- 逆塔防介紹彈窗 -->
    <AntiTDHintDialog v-model="isAntiTDHintDialog" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PointList from '@/components/PlanetWar/PointList.vue';
import { Message, Load } from '@/helper/class/Common';
import {
  planetWarUserInfoAPI,
  planetWarLevelAPI,
  planetWarBattleAPI,
  learningClassmateProgressAPI,
} from '@/api/planetWar';
import HeroAvatar from '@/components/WorldContest/Detall/HeroAvatar.vue';
import PointInfo from '@/components/PlanetWar/PointInfo.vue';
import { PlanetWarType, ResponseState, WebGameMode, UniverseEnergyType } from '@/helper/enum/Common';
import { QuickLink } from '@/helper/enum/QuickLink';
import ReplaceHero from '@/components/WorldContest/Detall/ReplaceHero.vue';
import { WebGameHelpName, EnemyWaveMode } from '@/helper/enum/WebGame';
import ImgPath from '@/config/imgPath/imgPath';
import AntiTDDialog from '@/components/AntiTD/AntiTDDialog.vue';
import WeaponHintDialog from '@/components/PlanetWar/WeaponHintDialog.vue';
import AntiTDHintDialog from '@/components/AntiTD/AntiTDHintDialog.vue';
import {
  UserFriendInfo,
  PlanetData,
  PlanetListInfo,
  PlanetDetailInfo,
  PlanetWarLevelDetailResultDto,
  PlanetUserInfoData,
} from '@/helper/interface/PlanetWar';
import { handleAPIError } from '@/helper/fnc/common';
import { TowerDefenseGameData, TotalProps, AntiTDGameData } from '@/helper/interface/Game';
import { HeroListData } from '../../helper/interface/Hero';
import AntiTDTeamPlace from '../../components/AntiTD/AntiTDTeamPlace.vue';
import TheWeapon from '@/components/Public/TheWeapon.vue';
import WeaponManager from '@/manager/WeaponManager';
import PendingManager, { PendingKey } from '../../manager/PendingManager';
import PlanetClearDialog from '@/components/PlanetWar/PlanetClearDialog.vue';
import { MenuName } from '@/helper/enum/MenuName';

@Component({
  components: {
    HeroAvatar,
    PointInfo,
    PointList,
    ReplaceHero,
    AntiTDDialog,
    AntiTDTeamPlace,
    WeaponHintDialog,
    AntiTDHintDialog,
    TheWeapon,
    PlanetClearDialog,
  },
})
export default class Index extends Vue {
  /** 星球大戰類型 */
  private planetWarType: PlanetWarType = PlanetWarType.Outter;

  /** 星球詳細資訊 */
  private planetDetailInfo?: PlanetDetailInfo;

  /** 星球能量 */
  private planetPower: number = 0;

  /** 星球大戰使用者資訊 */
  private planetUserInfo: PlanetUserInfoData | null = null;

  /** 星球簡易資料 */
  private planetInfoList: PlanetListInfo[] = [];

  /** 顯示關卡資訊開關 */
  private isShowInfo: boolean = false;

  /** 替換英雄開關 */
  private isChangeHero: boolean = false;

  /** 生物兵器彈窗開關 */
  private isShowAntiTDDialog: boolean = false;

  /** 生物兵器介紹 */
  private isWeaponHintDialog: boolean = false;

  /** 逆塔防介紹 */
  private isAntiTDHintDialog: boolean = false;

  /** 傳送門標示 */
  private portalIcon: string = '';

  /** 傳送門文字 */
  private portalText: string = '';

  /** 宇宙背景 */
  private planetWarBg: string = '';

  /** 蟲洞Icon */
  private wormholeIcon: string = '';

  /** 動畫下文字圖片 */
  private underAnimationText: string = '';

  /** 每關星星總數 */
  private readonly starMax: number = 3;

  /** 總關卡數 */
  private planetTotalCount: number = 0;

  /** 是否顯示破關彈窗 */
  private isShowClearDialog: boolean = false;

  /** 破關圖片 */
  private clearImg: string = '';

  /** 破關文字 */
  private clearText: string = '';

  /** 星球大戰類型 */
  private PlanetWarType = PlanetWarType;

  /** 圖片資料 */
  private imgData = {
    /** 下方背景遮罩 */
    bottomMaskBg: ImgPath.planetBottomMaskUrl,
    /** 關卡星等Icon */
    starIcon: ImgPath.planetWarStarActive,
    blueQuestionMark: ImgPath.blueQuestionMark,
    gradientBackground: ImgPath.planetGradientBackground,
    planetOutterEnd: ImgPath.planetOutterEnd,
    planetInnerEnd: ImgPath.planetInnerEnd,
    planetOutterClear: ImgPath.planetOutterClear,
    planetInnerClear: ImgPath.planetInnerClear,
    universeArrow: ImgPath.universeArrow,
  };

  /** 文字資料 */
  private textData = {
    planetPower: '星球能量',
    currentEquip: '目前裝備生物兵器',
    totalStarCount: '總星數',
    guide: '玩法說明',
    clearOutter: '經歷重重的考驗，\n因雄們證明了自己的努力和成長！！\n期待再一次的考驗！！！',
    clearInner: '突破困難的障礙，\n因雄們超越了自己的極限！！\n期待再一次的挑戰！！！',
    heroUniverse: '因雄宇宙',
  };

  /** 計算總星數 */
  private get totalStarCount(): string {
    let starCount: number = 0;
    for (const planet of this.planetInfoList) {
      if (planet.isOpen === true) {
        starCount = starCount + planet.starCount;
      }
    }

    // 組成字串
    return starCount.toString() + '/' + (this.starMax * this.planetTotalCount).toString();
  }

  /** 逆塔防隊伍 */
  private get heroDataList() {
    return this.$$store.getters.antiTDHeroTeam;
  }

  /** 出戰英雄 */
  private get onlineHero(): HeroListData | undefined {
    return this.$$store.getters.onlineHero;
  }

  /** 上場生物兵器 */
  private get totalProps(): TotalProps[] {
    if (this.planetUserInfo == null) {
      return [];
    }

    // 組成生物道具清單
    return this.planetUserInfo.queueWeaponIds.map<TotalProps>((weaponId) => {
      const totalProp: TotalProps = {
        id: weaponId,
        count: 1,
      };
      return totalProp;
    });
  }

  /** 英雄隊伍 */
  private get antiTDHeroTeam(): Array<HeroListData | undefined> {
    return this.$$store.getters.antiTDHeroTeam;
  }

  /** 計算幾個未裝備的生物兵器 */
  private get emptyWeaponNum(): number {
    return WeaponManager.weaponItemMax - (this.planetUserInfo?.queueWeaponIds.length ?? 0);
  }

  /** 當前進度關卡 */
  private get currentStageName(): string {
    const closedStageIndex: number = this.planetInfoList.findIndex((planet: PlanetListInfo) => planet.isOpen === false);
    return this.planetInfoList[closedStageIndex - 1]?.levelName ?? '';
  }

  async created() {
    // 取得個人闖關資訊
    await this.getPlanetWarUserInfo();

    // 檢查是否導回
    if (this.$route.params.id) {
      this.planetWarType = Number(this.$route.params.id);
    }

    // 刷新頁面
    this.refresh(this.planetWarType);
  }

  /** 刷新頁面
   * @param newPlanetWarType
   */
  private async refresh(newPlanetWarType: PlanetWarType): Promise<void> {
    // 取得好友資訊
    const friendProgressList = await this.getPlanetWarClassmateProgress(newPlanetWarType);

    // 取得關卡資訊
    await this.getPlanetWarLevel(friendProgressList, newPlanetWarType);

    // 切換圖片
    switch (newPlanetWarType) {
      case PlanetWarType.Outter:
        this.portalIcon = ImgPath.planetOuterWorldPortal;
        this.portalText = '表宇宙';
        this.planetWarBg = ImgPath.planetBgBaseUrl;
        this.wormholeIcon = ImgPath.planetInnerWorldAnimation;
        this.underAnimationText = ImgPath.planetInnerWorldText;
        this.clearImg = this.imgData.planetOutterClear;
        this.clearText = this.textData.clearOutter;
        break;
      case PlanetWarType.Inner:
        this.portalIcon = ImgPath.planetInnerWorldPortal;
        this.portalText = '裡宇宙';
        this.planetWarBg = ImgPath.planetBgBaseUrl2;
        this.wormholeIcon = ImgPath.planetOutterWorldAnimation;
        this.underAnimationText = ImgPath.planetOutterWorldText;
        this.clearImg = this.imgData.planetInnerClear;
        this.clearText = this.textData.clearInner;
        break;
    }

    // 切換表裡宇宙
    this.planetWarType = newPlanetWarType;
  }

  /** 取得星球大戰用戶資訊 */
  private async getPlanetWarUserInfo(): Promise<void> {
    try {
      // API 取得星球大戰個人資訊
      const response: any = await planetWarUserInfoAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 設定星球大戰個人資訊
      this.planetUserInfo = response as PlanetUserInfoData;

      // 設定星球能量
      this.planetPower = this.planetUserInfo.planetPower;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得好友資訊
   * @param learnSid 大關編號
   */
  private async getPlanetWarClassmateProgress(learnSid: number): Promise<UserFriendInfo[]> {
    // 打包資料
    const data = { learnSid };
    try {
      // API 取得好友進度
      const response: any = await learningClassmateProgressAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 返回好友星球進度
      return response.users as UserFriendInfo[];
    } catch (e) {
      Message.error(`${e}`);
    }

    return [];
  }

  /** 取得星球簡易資訊
   * @param progress 用戶朋友資訊
   * @param learnSid 大關編號
   */
  private async getPlanetWarLevel(progress: UserFriendInfo[], learnSid: number): Promise<void> {
    // 打包資料
    const data = { learnSid };
    try {
      // API 取得星球關卡資訊
      const response: any = await planetWarLevelAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 轉換成星球清單資料
      const plantDataList = response.levelList as PlanetData[];
      this.planetInfoList = plantDataList.map<PlanetListInfo>((planetData) => {
        // 關卡ID
        const learnLid = planetData.learnLid;
        // 圖片ID (取尾數)
        const imageIndex = (learnLid - 1).toString().slice(-1);

        // 轉換成星球簡易資訊
        const info: PlanetListInfo = {
          isOpen: planetData.isOpen,
          learnLid,
          levelName: planetData.levelName,
          starCount: planetData.starCount,
          planetBg: `${ImgPath.planetBgUrl}planet_${imageIndex}.png`,
          userFriends: progress.filter((friend) => {
            // 找出在當前關卡的好友 (沒有進度的好友自動排在第一關)
            return friend.highLid === learnLid || (friend.highLid === 0 && learnLid === plantDataList[0].learnLid);
          }),
        };
        return info;
      });

      // 紀錄總關卡數
      this.planetTotalCount = this.planetInfoList.length;
      // 破關
      if (this.planetInfoList[this.planetInfoList.length - 1].starCount > 0) {
        // 轉換成星球簡易資訊
        const info: PlanetListInfo = {
          isOpen: true,
          learnLid: -1,
          levelName: '恭喜!!',
          starCount: 0,
          planetBg: learnSid === PlanetWarType.Outter ? this.imgData.planetOutterEnd : this.imgData.planetInnerEnd,
          userFriends: [],
        };
        this.planetInfoList.push(info);
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 開始星球大戰塔防
   * @param detailData
   */
  private startTowerDefense(detailData: PlanetWarLevelDetailResultDto): void {
    // 沒有裝備生物兵器防呆
    if (this.totalProps.length <= 0) {
      Message.warn('您尚未裝備兵器');
      return;
    }

    // 根據模式排序敵人
    detailData.enemyWaves.forEach((wave) => {
      if (wave.mode === EnemyWaveMode.Random) {
        // Fisher-Yates Shuffle
        const array = wave.enemies;
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }
    });

    // 英雄資料防呆
    const heroListData = this.$$store.getters.onlineHero;
    if (heroListData === undefined) {
      console.error(`startPlanetWar() Error: 無法取得英雄資料`);
      return;
    }

    // 設定塔防遊戲設定
    const gameData: TowerDefenseGameData = {
      gameMode: WebGameMode.PlanetWar,
      heroListData,
      totalProps: this.totalProps,
      mapId: detailData.targetId,
      enemies: detailData.enemyWaves,
      countdownTime: -1, // 星球大戰沒有限時間
    };
    this.$$store.commit('setPlanetTowerDefenseGameData', gameData);

    // 開始星球大戰
    this.startPlanetWar(detailData);
  }

  /** 開始星球大戰逆塔防
   * @param detailData
   */
  private startAntiTD(detailData: PlanetWarLevelDetailResultDto): void {
    // 設定逆塔防遊戲設定
    const gameData: AntiTDGameData = {
      heroListDataList: this.$$store.getters.antiTDHeroTeam.filter((hero): hero is HeroListData => hero !== undefined),
      mapId: detailData.targetId,
      heroLevelCap: detailData.heroLevelCap,
      enemies: detailData.enemyWaves,
    };

    this.$$store.commit('setAntiTDGameData', gameData);

    // 開始星球大戰
    this.startPlanetWar(detailData);
  }

  /** 開始星球大戰
   * @param infoData
   */
  private async startPlanetWar(detailData: PlanetWarLevelDetailResultDto): Promise<void> {
    // 消耗宇宙能量
    const isUseEnergy = await this.$$store.dispatch('useUniverseEnergy', UniverseEnergyType.PlanetWar);
    if (isUseEnergy === false) {
      return;
    }

    // 預備開始封包
    const data = {
      learnLid: detailData.learnLid,
      hid: this.$$store.getters.onlineHeroHId,
    };
    try {
      // 開啟讀取中
      Load.use(true);

      // API 開始星球大戰
      const response: any = await planetWarBattleAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 設定星球大戰資訊
      this.$$store.commit('setPlanetWarLearnLid', detailData.learnLid);
      this.$$store.commit('setPlanetWarLearnLogId', response.learnLogId);
      this.$$store.commit('setPlanetWarType', this.planetWarType);

      // 關閉資訊顯示
      this.isShowInfo = false;

      // 開啟顯示遊戲顯示
      this.$router.replace({
        name: `${WebGameHelpName.PlanetGameHelp}`,
        params: { id: `${detailData.learnLid}` },
      });

      Load.use(false);
    } catch (e) {
      Load.use(false);
      Message.error(`${e}`);
    }
  }

  /** 切換 表/裡 宇宙 */
  private async onClickWormholeBtn(): Promise<void> {
    // 防連點
    if (PendingManager.startPending(PendingKey.WaitForWormhole) === false) {
      return;
    }

    // 刷新頁面
    await this.refresh(this.planetWarType === PlanetWarType.Outter ? PlanetWarType.Inner : PlanetWarType.Outter);

    // 解除防連點
    PendingManager.finishPending(PendingKey.WaitForWormhole);
  }

  /** 點擊星球
   * @param listInfo 星球詳細資訊
   */
  private onClickPlanet(listInfo: PlanetListInfo): void {
    // 如果點擊破關星球則彈另一個窗
    if (listInfo.learnLid === -1) {
      this.isShowClearDialog = true;
      return;
    }

    // 取得星球資訊
    this.getPlanetInfoData(listInfo);
  }

  /** 取得星球資訊
   * @param listInfo 星球詳細資訊
   */
  private async getPlanetInfoData(listInfo: PlanetListInfo): Promise<void> {
    // 防連點
    if (PendingManager.startPending(PendingKey.WaitForPlanet) === false) {
      return;
    }

    // 組合發送封包
    const data = {
      learnLid: listInfo.learnLid,
    };
    try {
      // API 發送封包
      const planetWarLevelDetail: PlanetWarLevelDetailResultDto = await planetWarLevelAPI.getLevelDetail(data);
      if (planetWarLevelDetail.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(planetWarLevelDetail.result, planetWarLevelDetail.resMessage);
      }

      // 儲存星球細節資料
      this.planetDetailInfo = {
        listInfo,
        detailData: planetWarLevelDetail,
      };

      // 開啟星球細節顯示介面
      this.isShowInfo = true;
    } catch (e) {
      Message.error(`${e}`);
    } finally {
      PendingManager.finishPending(PendingKey.WaitForPlanet);
    }
  }

  /** 前往挑戰
   * @param infoData
   */
  private async onClickGo(infoData: PlanetDetailInfo): Promise<void> {
    // 未裝英雄防呆
    if (this.$$store.getters.onlineHeroHId < 0) {
      await this.$confirm('尚未選擇英雄喔!', '提示', {
        confirmButtonText: '確認',
        showCancelButton: false,
        type: 'warning',
      });

      this.$router.push(`${QuickLink.Profile}`);
      return;
    }

    // 沒有星球能量防呆
    if (this.planetPower <= 0) {
      Message.warn('星球能量不足喔');
      return;
    }

    // 根據表裡分遊戲類別
    switch (this.planetWarType) {
      // 塔防
      case PlanetWarType.Outter:
        // 開始遊戲
        this.startTowerDefense(infoData.detailData);
        break;
      // 逆塔防
      case PlanetWarType.Inner:
        this.startAntiTD(infoData.detailData);
        break;
    }
  }

  /** 點擊前往教學 */
  private onClickGuide(): void {
    this.$router.push('/InnerWarGuide');
  }

  /** 點擊前往英雄宇宙 */
  private onClickGoToHeroUniverse(): void {
    this.$router.replace({
      name: `${MenuName.HeroUniverse}`,
    });
  }
}
</script>
<style lang="scss" scoped>
.planet-wrapper {
  position: relative;
  background-color: #0c3546;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-size: contain !important;
}
.weapon-click-area {
  position: relative;
}
.planetlist-box {
  position: relative;
  height: 100%;
  .planetlist-top {
    position: absolute;
    top: 0;
    margin-top: 1vw;
    width: 100%;
    height: 3vw;
  }
  .point-area {
    width: 100%;
    height: auto;
    .point-item {
      width: 100%;
      height: 120px;
      padding: 20px;
      background-color: #e8e8e8;
      color: #000;
      cursor: pointer;
      &:hover {
        background-color: rgb(246, 246, 246);
      }
    }
    .point-content {
      width: 100%;
      height: 100px;
    }
    .point-btn {
      width: 100%;
      height: 100px;
    }
  }
  .inside-world {
    min-width: 560px;
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .dare-area {
      width: 40%;
      height: 3vh;
      line-height: 2vh;
      color: #fff;
      background-color: #000c;
      border-radius: 30px;
      padding: 0.3vw;
      margin-bottom: 0.5vw;
      display: flex;
      justify-content: center;
      flex-direction: row;
      span {
        color: #f2d253;
      }
    }
  }
  .planetlist-bottom {
    position: fixed;
    z-index: 10;
    left: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    .mask {
      position: absolute;
      height: 100%;
      background-size: contain;
      background-repeat: repeat-x;
      background-position: bottom left;
    }
    .bottom-box {
      width: 60%;
      height: auto;
      .hero-area {
        margin: 0 0 2vw;
        .dare-area {
          max-width: 234px;
          color: #fff;
          background-color: #000c;
          border-radius: 30px;
          margin-bottom: 14px;
        }
        .hero-avatar-wrapper {
          background-color: #0d0d0d80;
          width: 90%;
        }
      }
      .weapon-title {
        cursor: pointer;
        max-width: 180px;
        border-radius: 20px;
        font-size: 20px;
        padding: 0.5vw;
        background-color: #000000cc;
        color: #2ae2e4;
      }
      .weapon-pos {
        position: relative;
        width: 87%;
        height: auto;
        margin: 1vw auto;
      }
    }
  }
}

@media (max-width: 1024.1px) {
  .planetlist-box {
    .planetlist-bottom {
      .mask {
        background-repeat: no-repeat;
      }
      .bottom-box {
        width: 95%;
      }
      .wormhole-btn {
        right: 10%;
      }
    }
  }
}

@media (max-width: 820px) {
  .planetlist-box {
    .planetlist-bottom {
      .wormhole-btn {
        right: -5%;
      }
    }
  }
}

@media (max-width: 435px) {
  .planetlist-box {
    .planetlist-bottom {
      .wormhole-btn {
        width: 64px;
        top: 0%;
        right: -20%;
      }
    }
  }
}
.image_animation {
  animation: planetship steps(8) 1s infinite;
}
@keyframes planetship {
  to {
    background-position: 0 -800%;
  }
}
</style>
