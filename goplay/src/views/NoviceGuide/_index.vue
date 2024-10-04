<template>
  <div>
    <div class="shadow-xl h-20 flex items-center overflow-hidden">
      <!-- 漫畫彈窗 -->
      <BaseDialog v-model="isComicsDialog">
        <ComicsContent :comicsId="comicsId" @onCloseComics="isComicsDialog = false"></ComicsContent>
      </BaseDialog>
      <!-- 可選擇區域目錄 -->
      <ul class="flex justify-evenly w-1/3 <lg:w-3/4 <sm:w-full" m="x-auto">
        <li class="<sm:hidden" font="bold" text="2xl [#707070] <sm:xl">
          {{ textData.content }}
        </li>
        <li v-for="(menuItem, index) in content" :key="index" font="bold" text="2xl [#707070]">
          <a
            :class="{
              'pb-2 border-b-5 border-solid border-[#FDC327] text-[#FDC327]': menuItem.id === selectContentId,
            }"
            :href="`#${menuItem.id}`"
            >{{ menuItem.name }}</a
          >
        </li>
      </ul>
    </div>
    <!-- 說明部分 包含三塊區域 -->
    <div
      id="content"
      class="fixed top-[22rem] <sm:top-[15.8rem] w-full h-[calc(100%-22rem)] <sm:h-[calc(100%-15.8rem)] overflow-y-scroll scroll-smooth"
    >
      <div
        v-for="(menuItem, index) in content"
        :key="index"
        class="min-h-full"
        p="y-10"
        :class="{ 'bg-[#F9F8F4]': index % 2 === 0 }"
      >
        <!-- 說明標題 -->
        <h3 :id="menuItem.id" class="inline-block relative" m="x-auto b-3" font="bold" text="4xl [#707070]">
          <img class="w-15 h-15 object-contain absolute -left-[73px] -bottom-[6px]" m="r-2" :src="menuItem.icon" />{{
            menuItem.title
          }}
        </h3>
        <!-- 說明副標 -->
        <p font="bold" text="2xl [#A5A5A5]">{{ menuItem.info }}</p>
        <div class="w-1/2 flex justify-center flex-wrap <lg:w-3/4 <sm:w-full" m="x-auto y-8" p="b-5">
          <!-- 各篇小卡片 -->
          <div
            v-for="(cardData, index) in menuItem.card"
            :key="index"
            @click="openNoviceContent(cardData.router, index)"
            class="w-55 h-68 shadow-xl cursor-pointer <sm:w-[45%]"
            m="y-4 x-5 <sm:x-1"
            bg="[#FFF]"
          >
            <img class="w-full h-1/2" :src="cardData.img" />
            <div m="t-5" text="3xl [#707070]">{{ cardData.first }}</div>
            <div text="3xl [#707070]">{{ cardData.second }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import ComicsContent from '@/components/NoviceGuide/ComicsContent.vue';
import BaseDialog from '@/components/Public/BaseDialog.vue';
import { GameTypeName, WebGameModeName } from '../../helper/enum/Common';

/** 目錄的 id 跟 名稱 各區域的標題副標 各卡片內容 */
interface NoviceContent {
  /** 目錄的中文名稱 */
  name: string;
  /** 目錄的id */
  id: string;
  /** 大標題旁邊icon */
  icon: string;
  /** 大標題 */
  title: string;
  /** 說明副標 */
  info: string;
  /** 各小卡的資訊欄位 */
  card: NoviceCard[];
}

/** 小卡的資訊 */
interface NoviceCard {
  /** 小卡圖 */
  img: string;
  /** 第一行  */
  first: string;
  /** 第二行 */
  second?: string;
  /** 路由 */
  router?: string;
}

@Component({
  components: {
    BaseDialog,
    ComicsContent,
  },
})
export default class Index extends Vue {
  /** 漫畫彈窗開關 */
  private isComicsDialog: boolean = false;

  /** 圖片資料 */
  private imgData = {
    towerDefenseBg: ImgPath.noviceDefenseBg,
    hamsterBg: ImgPath.noviceHamsterBg,
    bejeweledBg: ImgPath.noviceBejeweledBg,
    shooterBg: ImgPath.noviceShooterBg,
    parkourBg: ImgPath.noviceParkourBg,
    fishingBg: ImgPath.noviceFishingBg,
    bomberManBg: ImgPath.noviceBomberManBg,
    bubbleDragonBg: ImgPath.noviceBubbleDragonBg,
    matchingCardBg: ImgPath.noviceMatchingCardBg,
    piggyBg: ImgPath.novicePiggyBg,
    planetWar: ImgPath.novicePlanetWarBg,
    antiTD: ImgPath.noviceAntiTdBg,
    brickBreaker: ImgPath.noviceBrickBreakerBg,
    spaceGame1: ImgPath.spacialGame1,
    spaceGame2: ImgPath.spacialGame2,
    comics01: ImgPath.comics01,
    comics02: ImgPath.comics02,
    comics03: ImgPath.comics03,
    comics04: ImgPath.comics04,
    comics05: ImgPath.comics05,
    comics06: ImgPath.comics06,
    comics07: ImgPath.comics07,
    comics08: ImgPath.comics08,
    comics09: ImgPath.comics09,
    comics10: ImgPath.comics10,
    bunIcon: ImgPath.bunIcon,
    dogIcon: ImgPath.dogIcon,
    cowIcon: ImgPath.cowIcon,
    ETIcon: ImgPath.ETIcon,
  };

  /** 文字資料 */
  private textData = {
    content: '目錄',
    answerGame: '答題遊戲',
    levelGame: '關卡遊戲',
    raidersTips: '攻略秘笈',
    spacial: '其他類別',
    answerGameTitle: '答題遊戲玩法說明',
    answerGameInfo: '說明各種答題遊戲的規則玩法等。',
    levelGameTitle: '關卡遊戲玩法說明',
    levelGameInfo: '說明關卡遊戲的規則玩法等。',
    spacialGameTitle: '其他類別說明',
    spacialGameInfo: '說明其他類別的規則玩法等',
    raidersTipsTitle: '英雄攻略說明',
    raidersTipsInfo: '說明關於英雄的素質及屬性等。',
    towerDefenseTitle: `${GameTypeName.TowerDefense}篇`,
    hamsterTitle: `${GameTypeName.Hamster}篇`,
    bejeweledTitle: `${GameTypeName.Bejeweled}篇`,
    shooterTitle: `${GameTypeName.Shooter}篇`,
    parkourTitle: `${GameTypeName.Parkour}篇`,
    fishingTitle: `${GameTypeName.Fishing}篇`,
    bomberManTitle: `${GameTypeName.BomberMan}篇`,
    bubbleDragonTitle: `${GameTypeName.BubbleDragon}篇`,
    matchingCardTitle: `${GameTypeName.MatchingCard}篇`,
    piggyTitle: `${GameTypeName.Piggy}篇`,
    outerWarTitle: `${WebGameModeName.OuterWar}`,
    innerWarTitle: `${WebGameModeName.InnerWar}`,
    brickBreakerTitle: `${WebGameModeName.BrickBreaker}`,
    spacialGameTitle1: `${WebGameModeName.Adornment}`,
    spacialGameTitle2: '任務小精靈',
    gameInstructions: '遊戲說明',
    di: '第',
    huei: '回',
    one: '一',
    two: '二',
    three: '三',
    four: '四',
    five: '五',
    six: '六',
    seven: '七',
    eight: '八',
    nine: '九',
    ten: '十',
    comics1: '屬性篇',
    comics2: '生物兵器篇',
    comics3: '速度篇',
    comics4: '距離篇',
    comics5: '資源篇',
    comics6: '掉落篇',
    comics7: '解鎖英雄篇',
    comics8: '魔王賽篇',
    comics9: '敵人篇',
    comics10: '實戰篇',
  };

  /** 選單名稱和 id  */
  private content: NoviceContent[] = [
    {
      name: this.textData.answerGame,
      id: 'answerGame',
      icon: this.imgData.dogIcon,
      title: this.textData.answerGameTitle,
      info: this.textData.answerGameInfo,
      card: [
        {
          img: this.imgData.towerDefenseBg,
          first: this.textData.towerDefenseTitle,
          router: '/TowerRoomGuide',
        },
        {
          img: this.imgData.hamsterBg,
          first: this.textData.hamsterTitle,
          router: '/HamsterGuide',
        },
        {
          img: this.imgData.bejeweledBg,
          first: this.textData.bejeweledTitle,
          router: '/BejeweledGuide',
        },
        {
          img: this.imgData.shooterBg,
          first: this.textData.shooterTitle,
          router: '/ShooterGuide',
        },
        {
          img: this.imgData.parkourBg,
          first: this.textData.parkourTitle,
          router: '/ParkourGuide',
        },
        {
          img: this.imgData.fishingBg,
          first: this.textData.fishingTitle,
          router: '/FishingGuide',
        },
        {
          img: this.imgData.bomberManBg,
          first: this.textData.bomberManTitle,
          router: '/BombermanGuide',
        },
        {
          img: this.imgData.bubbleDragonBg,
          first: this.textData.bubbleDragonTitle,
          router: '/BubbleDragonGuide',
        },
        {
          img: this.imgData.matchingCardBg,
          first: this.textData.matchingCardTitle,
          router: '/MatchingCardGuide',
        },
        {
          img: this.imgData.piggyBg,
          first: this.textData.piggyTitle,
          router: '/PiggyGuide',
        },
      ],
    },
    {
      name: this.textData.levelGame,
      id: 'levelGame',
      icon: this.imgData.bunIcon,
      title: this.textData.levelGameTitle,
      info: this.textData.levelGameInfo,
      card: [
        {
          img: this.imgData.planetWar,
          first: this.textData.outerWarTitle,
          second: this.textData.gameInstructions,
          router: '/PlanetWarGuide',
        },
        {
          img: this.imgData.antiTD,
          first: this.textData.innerWarTitle,
          second: this.textData.gameInstructions,
          router: '/InnerWarGuide',
        },
        {
          img: this.imgData.brickBreaker,
          first: this.textData.brickBreakerTitle,
          second: this.textData.gameInstructions,
          router: '/BrickBreakerGuide',
        },
      ],
    },
    {
      name: this.textData.spacial,
      id: 'spacialGame',
      icon: this.imgData.ETIcon,
      title: this.textData.spacialGameTitle,
      info: this.textData.spacialGameInfo,
      card: [
        {
          img: this.imgData.spaceGame1,
          first: this.textData.spacialGameTitle1,
          second: this.textData.gameInstructions,
          router: '/AdornmentGuide',
        },
        {
          img: this.imgData.spaceGame2,
          first: this.textData.spacialGameTitle2,
          second: this.textData.gameInstructions,
          router: '/TaskGuide',
        },
      ],
    },
    {
      name: this.textData.raidersTips,
      id: 'raidersTips',
      icon: this.imgData.cowIcon,
      title: this.textData.raidersTipsTitle,
      info: this.textData.raidersTipsInfo,
      card: [
        {
          img: this.imgData.comics01,
          first: `${this.textData.di}${this.textData.one}${this.textData.huei}`,
          second: this.textData.comics1,
        },
        {
          img: this.imgData.comics02,
          first: `${this.textData.di}${this.textData.two}${this.textData.huei}`,
          second: this.textData.comics2,
        },
        {
          img: this.imgData.comics03,
          first: `${this.textData.di}${this.textData.three}${this.textData.huei}`,
          second: this.textData.comics3,
        },
        {
          img: this.imgData.comics04,
          first: `${this.textData.di}${this.textData.four}${this.textData.huei}`,
          second: this.textData.comics4,
        },
        {
          img: this.imgData.comics05,
          first: `${this.textData.di}${this.textData.five}${this.textData.huei}`,
          second: this.textData.comics5,
        },
        {
          img: this.imgData.comics06,
          first: `${this.textData.di}${this.textData.six}${this.textData.huei}`,
          second: this.textData.comics6,
        },
        {
          img: this.imgData.comics07,
          first: `${this.textData.di}${this.textData.seven}${this.textData.huei}`,
          second: this.textData.comics7,
        },
        {
          img: this.imgData.comics08,
          first: `${this.textData.di}${this.textData.eight}${this.textData.huei}`,
          second: this.textData.comics8,
        },
        {
          img: this.imgData.comics09,
          first: `${this.textData.di}${this.textData.nine}${this.textData.huei}`,
          second: this.textData.comics9,
        },
        {
          img: this.imgData.comics10,
          first: `${this.textData.di}${this.textData.ten}${this.textData.huei}`,
          second: this.textData.comics10,
        },
      ],
    },
  ];

  /** 目前選中目錄 id */
  private selectContentId: string = '';
  /** 要開啟漫畫的 ID */
  private comicsId: number = -1;

  mounted() {
    this.content.map((item) => {
      this.intersectionObserver.observe(document.getElementById(item.id)!);
    });
  }

  /** web API */
  private intersectionObserver = new IntersectionObserver(
    (observerObject: IntersectionObserverEntry[]) => {
      // if (observerObject[0].intersectionRatio > 0.4) {
      this.onChangeId(observerObject[0].target.id);
      // }
    },
    {
      root: document.getElementById('content'),
      rootMargin: '0px',
      threshold: 1,
    }
  );

  /** 打開路由或是漫畫彈窗
   * @param router
   */
  private openNoviceContent(router: string, index: number): void {
    if (!router) {
      this.comicsId = index;
      this.isComicsDialog = true;
      return;
    }
    this.$router.push(router);
  }

  /** 更換目前選中目錄ID
   * @param selectId
   */
  private onChangeId(selectId: string): void {
    this.selectContentId = selectId;
  }
}
</script>
