<template>
  <!-- 開啟全螢幕，白底背景 -->
  <div
    class="absolute left-0 top-0 z-100 h-full w-full overflow-x-hidden overflow-y-auto bg-white"
    :style="{ display: isDialogVisible ? '' : 'none' }"
  >
    <!-- 遊戲輪盤比例16:9 -->
    <div
      class="absolute left-0 top-0 w-[100%] aspect-video flex-col bg-no-repeat bg-contain"
      :style="`background-image: url(${imgData.bg})`"
    >
      <!-- 背景點綴圖片(紅色光束) -->
      <img
        class="absolute left-[52.34%] top-[67%] w-[24.58%]"
        :style="{ visibility: gameWheelMode === GameWheelMode.ForcedCrossing ? 'visible' : 'hidden' }"
        :src="imgData.redImg"
      />
      <!-- 輪播圖上方開始提示圖 -->
      <img
        class="absolute left-[56.2%] top-[30%] w-[10.05%] z-1 pointer-events-none"
        :style="{ opacity: gameWheelMode === GameWheelMode.ForcedCrossing && isShowStartBtn ? 1 : 0 }"
        :src="imgData.startBtn"
      />
      <!-- 網頁上方 -->
      <div class="w-[100%] h-[12.8%] flex-row" :style="{ visibility: isSpining === false ? 'visible' : 'hidden' }">
        <!-- 左上標題 -->
        <div class="w-[38.8%] h-[68.8%] flex-row bg-gradient-to-r from-[#6E5DB1]">
          <span class="self-center w-[2%] h-[37.8%] ml-[5.8%] mr-[2%] bg-[#71FFF5]"></span>
          <span class="self-center text-white text-[1.93vw] font-bold <sm:hidden">
            {{ `${teamTypeName}/` }}
          </span>
          <span class="self-center text-white text-[1.93vw] font-bold">
            {{ title }}
          </span>
        </div>
        <!-- 中間標題 -->
        <div class="w-[44.6%] h-[55.8%] self-end">
          <div
            v-show="gameWheelMode === GameWheelMode.GoStraight"
            class="w-[100%] h-[100%] flex-row bg-gradient-to-r from-transparent to-transparent via-[#00A28CCB]"
          >
            <span class="self-center w-[100%] text-white text-[2.3vw]">
              {{ textData.goStraightTitle }}
            </span>
          </div>
        </div>
        <!-- 右上資訊 -->
        <div class="w-[16.6%] h-[69.6%] flex-row">
          <span
            class="self-center w-[95%] h-[60.4%] ml-[0%] rounded-xl flex-row justify-start bg-[#5E939B] bg-opacity-80"
          >
            <img class="self-center h-[110%] <sm:h-[85%]" :src="imgData.galaxyIcon" />
            <span class="self-center text-center text-white text-[1.25vw] <sm:hidden">
              {{ `${textData.universe}` }}
            </span>
            <span class="self-center text-center text-white text-[1.25vw]">
              {{ `${textData.energy}` }}
            </span>
            <span class="self-center text-center number text-[#1CFDFF] text-[1.46vw]">
              {{ `${universeEnergy}` }}
            </span>
            <span class="self-center text-center text-white text-[1.25vw] <md:hidden">
              {{ `${textData.universeEnergyUnit}` }}
            </span>
          </span>
        </div>
      </div>
      <!-- 網頁中段 -->
      <div
        class="w-[100%] h-[39.7%]"
        :style="{ overflow: gameWheelMode === GameWheelMode.GoStraight && isSpining === false ? 'hidden' : '' }"
      >
        <!-- 隨機遊戲內容區 -->
        <div
          v-show="gameWheelMode === GameWheelMode.GoStraight && isSpining === false"
          class="w-[100%] h-[100%] mb-[2%]"
        >
          <!-- 隨機遊戲按鈕 -->
          <img
            :src="imgData.goStraightImg"
            class="relative left-[61.1%] top-[53%] transform -translate-x-1/2 -translate-y-1/2 h-[100.5%] cursor-pointer"
            @click="onClickGoStraight"
          />
        </div>
        <!-- 輪播圖區 -->
        <div class="w-[100%] h-[115%] bg-[#45A5B980] transform -translate-y-1/25">
          <!-- 輪播圖 -->
          <div ref="swiper" class="swiper swiper-container">
            <div
              class="swiper-wrapper"
              :class="{
                'swiper-wrapper-spinning-prev': isSpining && isAutoplayRunning === false,
                'swiper-wrapper-spinning': isSpining && isAutoplayRunning,
              }"
            >
              <!-- 輪播物件 -->
              <div class="swiper-slide" v-for="(gameData, index) in gameDataList" :key="index">
                <div class="slide-content" :style="{ display: isDialogVisible ? '' : 'none' }">
                  <img class="bg" :src="gameData.url" />
                  <!-- 名稱 -->
                  <span class="title" :style="`background-image: url(${imgData.nameBg})`">
                    <h1 class="self-center text-white text-[1.77vw] font-bold">
                      {{ gameData.displayName }}
                    </h1>
                  </span>
                  <!-- Mask -->
                  <span class="imgMask"></span>
                </div>
              </div>
            </div>
            <!-- 方向箭頭 -->
            <div v-show="isSpining === false" class="swiper-button-next"></div>
            <div v-show="isSpining === false" class="swiper-button-prev"></div>
          </div>
          <!-- 阻擋輪播圖點擊事件 -->
          <div class="absolute top-0 w-[100%] h-[100%] z-1" v-show="isSpining"></div>
        </div>
      </div>
      <!-- 網頁下方 -->
      <div class="w-[100%] h-[47.5%] flex-row">
        <!-- 左下英雄人物圖區 -->
        <div class="w-[38.8%] h-[100%] transform translate-x-1/7 flex flex-row-reverse justify-start">
          <!-- 顯示1~5隻英雄人物圖 -->
          <div
            v-for="(heroData, index) in heroDataList"
            :key="index"
            class="w-[35%] -mx-[12%] flex flex-col justify-end"
            :style="{ 'z-index': floor(heroData.height), height: `${heroData.height}%` }"
          >
            <img :class="'transform ' + 'rotate-y-180 ' + 'w-[100%] '" :src="heroData.url" />
          </div>
        </div>
        <!-- 正下按鈕區 -->
        <div class="w-[44.6%] h-[85%]" :style="{ visibility: isSpining === false ? 'visible' : 'hidden' }">
          <!-- 隨機遊戲模式按鈕區 -->
          <div v-show="gameWheelMode === GameWheelMode.GoStraight" class="buttonBlock">
            <!-- 隨機遊戲按鈕 -->
            <div class="button" :style="`background-image: url(${imgData.btn2})`" @click="onClickGoStraight">
              <div class="title">
                <span>
                  {{ textData.goStraight }}
                </span>
              </div>
              <div class="content">
                <img :src="imgData.galaxyIcon" />
                <span>
                  {{ `${textData.consume}` }}
                </span>
                <span class="<sm:hidden">
                  {{ `${textData.universe}${textData.energy}` }}
                </span>
                <span class="number">
                  {{ `${goStraightEnergyCost}` }}
                </span>
              </div>
            </div>
            <!-- 隨機遊戲按鈕解釋 -->
            <div
              class="h-[11.7%] w-[55.16%] self-center flex-row justify-center rounded-md bg-black bg-opacity-80 pointer-events-none"
            >
              <img class="self-center w-[12%] -mt-[2%] <sm:hidden" :src="imgData.teleporterIcon" />
              <span class="self-center text-center text-white text-[1.35vw] <sm:hidden">
                {{ `${textData.goStraight}` }}
              </span>
              <span class="self-center text-center text-white text-[1.35vw]">
                {{ `${textData.goStraightContent}` }}
              </span>
            </div>
            <!-- 進入自選遊戲模式按鈕 -->
            <div
              class="button"
              :style="`background-image: url(${imgData.btn2})`"
              @click="gameWheelMode = GameWheelMode.ForcedCrossing"
            >
              <div class="title">
                <span>
                  {{ textData.forcedCrossing }}
                </span>
              </div>
              <div class="content">
                <img :src="imgData.galaxyIcon" />
                <span>
                  {{ `${textData.consume}` }}
                </span>
                <span class="<sm:hidden">
                  {{ `${textData.universe}${textData.energy}` }}
                </span>
                <span class="number">
                  {{ `${forcedCrossingEnergyCost}` }}
                </span>
              </div>
            </div>
            <!-- 進入自選遊戲模式解釋 -->
            <div
              class="h-[11.7%] w-[55.16%] self-center flex-row justify-center rounded-md bg-black bg-opacity-80 pointer-events-none"
            >
              <img class="self-center w-[12%] -mt-[2%] <sm:hidden" :src="imgData.teleporterIcon" />
              <span class="self-center text-center text-white text-[1.35vw] <sm:hidden">
                {{ `${textData.forcedCrossing}` }}
              </span>
              <span class="self-center text-center text-white text-[1.35vw]">
                {{ `${textData.forcedCrossingContent}` }}
              </span>
            </div>
          </div>
          <!-- 自選遊戲模式按鈕區 -->
          <div v-show="gameWheelMode === GameWheelMode.ForcedCrossing" class="buttonBlock">
            <!-- 返回隨機遊戲按鈕 -->
            <div
              class="backButton"
              :style="`background-image: url(${imgData.btn3})`"
              @click="gameWheelMode = GameWheelMode.GoStraight"
            >
              <div class="h-[100%] flex-row justify-start">
                <img class="self-center w-[8.5%] h-[45%] ml-[5%] transform rotate-180" :src="imgData.arrow" />
                <span class="self-center w-[69%] text-white text-[1.61vw]">
                  {{ textData.returnGoStraight }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, ModelSync, Emit, Component, Prop, Ref } from 'vue-property-decorator';
import {
  GATagActionIdType,
  GATagActionStrType,
  GATagCategoryIdType,
  GATagCategoryStrType,
  HeroJ7GameType,
  UniverseEnergyType,
  GameBoxType,
} from '@/helper/enum/Common';
import { randomNumber, randomRange, shuffle } from '@/views/H5/Helper/MathHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import imgPath from '@/config/imgPath/imgPath';
import { sendGAEvent, toSubjectName } from '@/helper/fnc/common';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import Swiper, { Navigation, Autoplay } from 'swiper';
import GameTypeHelper, { GameTypeData } from '@/views/H5/Helper/GameTypeHelper';
import 'swiper/swiper-bundle.min.css';
Swiper.use([Navigation, Autoplay]);

//#region interface、enum
/** 英雄資料 */
interface HeroData {
  /** 站位高度(數字越高站位越低) */
  height: number;
  /** 小遊戲截圖 */
  url: string;
}

/** 遊戲輪盤模式 */
export enum GameWheelMode {
  /** 隨機遊戲 */
  GoStraight = UniverseEnergyType.GoStraight,
  /** 自選遊戲 */
  ForcedCrossing = UniverseEnergyType.ForcedCrossing,
}
//#endregion interface、enum

@Component({})
export default class GameWheelDialog extends Vue {
  //#region decorator
  /** 此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 類型名稱 */
  @Prop(String) private teamTypeName!: string;
  /** 標題 */
  @Prop(String) private title!: string;
  /** Swiper所在Div區塊 */
  @Ref('swiper') private swiperDiv!: HTMLDivElement;
  //#endregion decorator

  //#region readonly
  /** 文字資料 */
  private readonly textData = {
    /** 隨機遊戲標題 */
    goStraightTitle: '宇宙飛船檢測到可登錄地區',
    /** 隨機遊戲內容 */
    goStraightContent: '隨機進行挑戰！',
    /** 自選遊戲內容 */
    forcedCrossingContent: '自己選擇挑戰！',
    /** 隨機遊戲按鈕文字 */
    goStraight: '隨機遊戲',
    /** 進入自選遊戲模式按鈕文字 */
    forcedCrossing: '自選遊戲',
    /** 宇宙 */
    universe: '宇宙',
    /** 能量 */
    energy: '能量',
    /** 宇宙能量單位 */
    universeEnergyUnit: '點',
    /** 消耗 */
    consume: '消耗',
    /** 進入隨機遊戲模式按鈕文字 */
    returnGoStraight: '返回',
  };

  /** 圖片資料 */
  private readonly imgData = {
    /** 背景 */
    bg: imgPath.answerGameWheelBg,
    /** 背景紅色點綴 */
    redImg: imgPath.answerGameWheelRedImg,
    /** 隨機遊戲按鈕圖 */
    goStraightImg: imgPath.answerGameWheelGoStraightImg,
    /** 輪盤物件標題背景 */
    nameBg: imgPath.answerGameWheelNameBg,
    /** 按鈕1 */
    btn1: imgPath.btn01Url,
    /** 按鈕2 */
    btn2: imgPath.btn02Url,
    /** 按鈕3 */
    btn3: imgPath.btn03Url,
    /** 開始按鈕 */
    startBtn: imgPath.answerGameWheelStartBtn,
    /** 箭頭 */
    arrow: imgPath.arrowTwoIconBaseUrl,
    /** 宇宙能量Icon */
    galaxyIcon: imgPath.galaxyHaloIconUrl,
    /** 傳送飛船Icon */
    teleporterIcon: imgPath.teleporterIconUrl,
    /** 黑色漸層背景 */
    blackOverlayImg: imgPath.blackOverlayImgUrl,
    /** 加高黑色漸層背景 */
    blackOverlayPlusImg: imgPath.blackOverlayPlusImgUrl,
  };

  /** 英雄站位高度對照表 */
  private readonly heroPositionHeightTable: number[] = [80, 95, 80, 95, 87.5];

  /** 旋轉啟動時間(s) */
  private readonly spinStartTimeSec: number = 1.5;
  /** 旋轉一個Slide所花費的時間(s) */
  private readonly spinSpeedSec: number = 0.15;
  /** 旋轉基礎時間(s) */
  private readonly spinBaseDurationSec: number = 2;
  /** 旋轉結果停留時間(s) */
  private readonly spinResultTimeSec: number = 2;
  //#endregion readonly

  //#region import for Vue
  /** 引入Enum */
  private GameWheelMode = GameWheelMode;
  /** 引入函數 */
  private toSubjectName = toSubjectName;
  /** 引入函數 */
  private floor = Math.floor;
  //#endregion import for Vue

  //#region variable、getter
  /** 隨機遊戲所消耗的能量 */
  private goStraightEnergyCost: number = 0;
  /** 自選遊戲所消耗的能量 */
  private forcedCrossingEnergyCost: number = 0;
  /** Swiper元件 */
  private swiper!: Swiper;
  /** 遊戲輪盤處於什麼模式 */
  private gameWheelMode: GameWheelMode = GameWheelMode.GoStraight;
  /** 是否處於旋轉抽獎狀態 */
  private isSpining: boolean = false;
  /** 是否顯示輪盤上開始按鈕 */
  private isShowStartBtn: boolean = false;
  /** 是否處於自動播放狀態 */
  private isAutoplayRunning: boolean = false;
  /** 遊戲資料 */
  private gameDataList: GameTypeData[] = [];
  /** 英雄資料 */
  private heroDataList: HeroData[] = [];

  /** 獲取宇宙能量點數 */
  private get universeEnergy(): number {
    return this.$$store.state.LoginModule.universeEnergy;
  }

  /** 小遊戲類型 */
  private get gameType(): HeroJ7GameType {
    return this.gameDataList[this.swiper.realIndex % this.gameDataList.length].gameType;
  }
  //#endregion variable、getter

  //#region vue hook
  async created() {
    // 遍歷目前所有小遊戲
    this.gameDataList = GameTypeHelper.getGameBox(GameBoxType.AdlGameBox);
    // 打亂小遊戲順序
    shuffle(this.gameDataList);

    // 取得隨機順序英雄資料
    const heroList = shuffle(this.$$store.getters.heroList.slice(0));
    // 隨機 1~5 位英雄顯示數量
    const displayAmount = randomRange(0, Math.min(this.heroPositionHeightTable.length, heroList.length));
    for (let index = 0; index <= displayAmount; index++) {
      // 取得英雄資料與對照站位高度
      this.heroDataList.push({
        height: this.heroPositionHeightTable[index],
        url: HeroManager.getHeroImgUrl(heroList[index], HeroImgType.Default),
      });
    }

    // 獲取隨機遊戲能量消耗
    this.goStraightEnergyCost = await this.$$store.dispatch('getUniverseEnergyCost', UniverseEnergyType.GoStraight);
    // 獲取自選遊戲能量消耗
    this.forcedCrossingEnergyCost = await this.$$store.dispatch(
      'getUniverseEnergyCost',
      UniverseEnergyType.ForcedCrossing
    );
  }

  mounted() {
    // 創建Swiper
    this.swiper = new Swiper(this.swiperDiv, {
      slidesPerView: 5,
      centeredSlides: true,
      loop: true,
      // 讓 autoplay transition 更順暢
      freeMode: true,
      // 向左與向右箭頭
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      initialSlide: 0,
      autoplay: {
        delay: 1,
        // 避免滑鼠一操作，autoplay 就停止
        disableOnInteraction: false,
      },
      // 註冊事件 Swiper 在 loop = true 時，直接在元素上綁定會失效，一定要透過 Swiper 綁定
      on: {
        // 點擊事件
        click: () => {
          // 過濾掉active slide以外的點擊
          if (this.swiper.clickedIndex !== this.swiper.activeIndex) {
            return;
          }
          // 執行自選遊戲
          this.onClickForcedCrossing();
        },
        touchMove: () => {
          this.isShowStartBtn = false;
        },
        touchEnd: () => {
          this.isShowStartBtn = true;
        },
        slideChangeTransitionStart: () => {
          this.isShowStartBtn = false;
        },
        slideChangeTransitionEnd: () => {
          this.isShowStartBtn = true;
        },
      },
    });

    // swiper 預設會執行 autoplay ,需手動關閉
    this.swiper.autoplay.stop();
  }
  //#endregion vue hook

  //#region gameWheelDialog function
  /** 隨機遊戲按鈕功能 */
  private async onClickGoStraight(): Promise<void> {
    // 確認消耗宇宙能量(消耗0不彈窗顯示)
    if (this.goStraightEnergyCost !== 0) {
      const isUseEnergy = await this.$$store.dispatch('useUniverseEnergy', UniverseEnergyType.GoStraight);
      if (isUseEnergy === false) {
        return;
      }
    }

    // 進入旋轉模式
    this.isSpining = true;
    await AsyncHelper.sleep(0.3);
    // 旋轉啟動表演，先往左滑，再往右
    this.swiper.slideNext(this.spinStartTimeSec * 1000);
    await AsyncHelper.sleep(this.spinStartTimeSec);
    // 開啟自動播放狀態，模擬旋轉
    this.isAutoplayRunning = true;
    this.swiper.params.speed = this.spinSpeedSec * 1000;
    this.swiper.autoplay.start();
    // 隨機給予旋轉時間
    const duration = this.spinBaseDurationSec + randomNumber(this.gameDataList.length) * this.spinSpeedSec;
    setTimeout(() => {
      this.swiper.autoplay.stop();
    }, duration * 1000);
    // 等待旋轉完成
    await AsyncHelper.pendingUntil(() => this.swiper.autoplay.running === false);

    // 停留，展示結果
    await AsyncHelper.sleep(this.spinResultTimeSec);

    // 開始小遊戲
    this.play();
  }

  /** 自選遊戲按鈕功能 */
  private async onClickForcedCrossing(): Promise<void> {
    // 確認消耗宇宙能量(消耗0不彈窗顯示)
    if (this.forcedCrossingEnergyCost !== 0) {
      const isUseEnergy = await this.$$store.dispatch('useUniverseEnergy', UniverseEnergyType.ForcedCrossing);
      if (isUseEnergy === false) {
        return;
      }
    }

    // GA 發送小遊戲類型
    await sendGAEvent(
      GATagCategoryIdType.Heroj7PlayGame,
      GATagActionIdType.Heroj7PlayGameType,
      `gameType=${this.gameType}`,
      this.$gtag,
      GATagActionStrType.Heroj7PlayGameType,
      GATagCategoryStrType.Heroj7PlayGame
    );

    // 開始小遊戲
    this.play();
  }

  /** 開始小遊戲 */
  private async play(): Promise<void> {
    // GA 遊戲輪盤模式
    await sendGAEvent(
      GATagCategoryIdType.Heroj7PlayGame,
      GATagActionIdType.Heroj7GameWheelMode,
      `gameWheelMode=${this.gameWheelMode}`,
      this.$gtag,
      GATagActionStrType.Heroj7GameWheelMode,
      GATagCategoryStrType.Heroj7PlayGame
    );

    // 關閉此Dialog
    this.isDialogVisible = false;

    // 發送信號給上一層組件
    this.onPlay(this.gameType);
  }
  //#endregion gameWheelDialog function

  /** 發送小遊戲開始信號 */
  @Emit('onPlay')
  private onPlay(gameType: HeroJ7GameType): void {
    return;
  }
}
</script>

<style scoped>
/* 數字文字左右間隔 2% */
.number {
  margin: 0 2% 0 2%;
}

/* 按鈕區 */
.buttonBlock {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 3%;
  row-gap: 1%;
}

/* 按鈕元件 */
.button {
  align-self: center;
  width: 60.16%;
  height: 33.97%;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-position-y: 50%;
  cursor: pointer;
}

/* 按鈕標題 */
.button .title {
  width: 100%;
  height: 52.5%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* 按鈕標題文字 */
.button .title span {
  align-self: center;
  font-weight: bold;
  font-size: 2.96vw;
  color: white;
  text-shadow: 0 3px 6px #00000080;
}

/* 按鈕內容 */
.button .content {
  width: 100%;
  height: 40%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* 按鈕內容icon */
.button .content img {
  align-self: center;
  height: 120%;
  margin-top: -2%;
  margin-right: -2%;
}

/* 按鈕內容文字 */
.button .content span {
  align-self: center;
  color: black;
  font-size: 1.61vw;
  margin-top: -1%;
}

/* 返回按鈕 */
.backButton {
  align-self: center;
  width: 62%;
  height: 18%;
  margin-top: 20.5%;
  margin-left: 16%;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-position-y: 50%;
  z-index: 0;
  cursor: pointer;
}

/* 寬度放大並置中，讓輪播物件有一半超出螢幕(美術風格) */
.swiper-container {
  height: 100%;
  margin-left: 50%;
  transform: translateX(-50%);
  width: 185%;
}

/* 將所有輪播物件往右偏移，實現輪播中心物件靠右 */
.swiper-wrapper {
  margin-left: 6%;
}

/* 開啟轉動表演時的transition */
.swiper-wrapper-spinning-prev {
  -webkit-transition-timing-function: cubic-bezier(0.66, -1.72, 1, 0.05) !important;
  -o-transition-timing-function: cubic-bezier(0.66, -1.72, 1, 0.05) !important;
  transition-timing-function: cubic-bezier(0.66, -1.72, 1, 0.05) !important;
}

/* 處於轉動表演時的transition */
.swiper-wrapper-spinning {
  -webkit-transition-timing-function: linear !important;
  -o-transition-timing-function: linear !important;
  transition-timing-function: linear !important;
}

/* slide 調整 */
.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  align-self: center;
  transition: all 200ms linear;
}

/* 被選中時放大，並顯示可點擊pointer*/
.swiper-slide-active .slide-content {
  width: 100%;
  height: 82%;
  cursor: pointer;
}
/* 被選中時關閉mask */
.swiper-slide-active .slide-content .imgMask {
  opacity: 0;
}
/* 被選中時顯示名稱 */
.swiper-slide-active .slide-content .title {
  opacity: 1;
}

/* slide內容調整 */
.slide-content {
  transition: all 200ms linear;
  position: relative;
  display: flex;
  justify-content: center;
  width: 72%;
  height: 64%;
}
.slide-content .bg {
  height: 100%;
  object-fit: cover;
  border-radius: 2%;
  background-color: white;
  padding: 0.5%;
  box-shadow: 0 0 10px #97fff4;
}
.slide-content .imgMask {
  position: absolute;
  width: 99%;
  height: 99%;
  top: 0.5%;
  border-radius: 2%;
  background-color: #000000bd;
  opacity: 0.5;
  transition: all 200ms linear;
}
.slide-content .title {
  position: absolute;
  width: 99%;
  top: 5%;
  padding-top: 1.5%;
  padding-bottom: 1.5%;
  display: flex;
  justify-content: center;
  background-size: cover;
  opacity: 0;
  transition: all 200ms linear;
}

/* 替換輪播圖右箭頭圖片 */
.swiper-button-next {
  position: absolute;
  margin-top: 0px;
  top: 50%;
  transform: translateY(-50%);
  right: 24%;
}
.swiper-button-next::after {
  content: url('../../../assets/images/dialog/fast-forward.png');
  transform: scaleX(-1) scaleY(2);
}
/* 替換輪播圖左箭頭圖片 */
.swiper-button-prev {
  position: absolute;
  margin-top: 0px;
  top: 50%;
  transform: translateY(-50%);
  left: 24%;
}
.swiper-button-prev::after {
  content: url('../../../assets/images/dialog/fast-forward.png');
  transform: scaleY(2);
}

/** 調整輪播圖箭頭位置 */
.swiper-slide-next .slide-content {
  transform: translateX(-20%);
}
.swiper-slide-prev .slide-content {
  transform: translateX(-18%);
}
</style>
