<template>
  <div>
    <!-- 回新手引導 -->
    <div class="h-20 flex justify-center items-center shadow-2xl">
      <router-link class="w-3/4 flex justify-start items-center" text="2xl [#FDC327]" font="bold" to="/NoviceGuide"
        ><img class="transform rotate-180" m="r-2" :src="imgData.yellowArrow" />{{
          textData.backGuideList
        }}</router-link
      >
    </div>
    <!-- 各遊戲內容 -->
    <div class="h-[calc(100vh-22rem)] overflow-y-scroll" bg="[#F9F8F4]">
      <div class="w-1/2 <xl:w-3/4 flex items-center flex-col" bg="[#E3DDC2]" m="x-auto">
        <h1
          class="w-4/5 flex justify-center items-center"
          font="bold"
          p="y-5"
          border="b-3 dashed [#A49347]"
          text="4xl [#5A5A5A]"
        >
          <img :src="imgData.starIcon" />{{ routerContent.title }}
        </h1>
        <template v-for="(content, index) in routerContent.content">
          <img :key="index" class="w-4/5" m="y-8" border="5 solid [#FFF]" :src="content.img" />
          <div
            :key="`${index}-1`"
            class="w-4/5 relative rounded-3xl whitespace-pre-line"
            m="x-auto y-5"
            p="8"
            bg="[#FFF]"
            font="bold"
            text="left 2xl [#A5A5A5]"
          >
            <img
              class="absolute -top-6 -left-5 <xl:(-top-15 -left-15) <lg:(-top-10 -left-10) transform -rotate-12"
              :src="imgData.dogIcon"
            />
            {{ content.info }}
          </div>
        </template>
        <!-- 影片內容 -->
        <div class="w-4/5" p="y-5" border="b-3 t-3 dashed [#A49347]" v-if="routerContent.videoUrl !== undefined">
          <div class="flex flex-col justify-center items-center h-140 <sm:h-32" m="y-8" bg="[#FFF]">
            <template v-if="routerContent.videoUrl === ''">
              <img class="h-4/5 object-contain" :src="imgData.videoHero" />
              <span class="rounded-3xl" m="-t-5" p="x-10 y-2" bg="[#FFAE20CC]" text="3xl [#FFF] <sm:xl">{{
                textData.videoInfo
              }}</span>
            </template>
            <iframe
              v-else
              class="w-full h-full"
              :src="routerContent.videoUrl"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <div
            class="relative rounded-3xl whitespace-pre-line"
            m="x-auto y-5"
            p="8"
            bg="[#FFF]"
            font="bold"
            text="left 2xl [#A5A5A5]"
          >
            <img
              class="absolute -top-6 -left-5 <xl:(-top-15 -left-15) <lg:(-top-10 -left-10) transform -rotate-12"
              :src="imgData.dogIcon"
            />
            {{ textData.videoDetailInfo }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import ImgPath from '@/config/imgPath/imgPath';
import { Vue } from 'vue-property-decorator';
import { GameTypeName, WebGameModeName } from '@/helper/enum/Common';
interface Content {
  /** 圖 */
  img: string;
  /** 文 */
  info: string;
}

/** 教學內容資料 */
interface GuideData {
  /**標題 */
  title: string;
  /** 內容 */
  content: Content[];
  /**影片網址 */
  videoUrl?: string;
}

export default class GameContent extends Vue {
  /** 圖片資料 */
  private imgData = {
    yellowArrow: ImgPath.rightDoubleArrow,
    starIcon: ImgPath.starIcon,
    videoHero: `${ImgPath.heroBaseUrl}/chr_P06/chr_P06.png`,
    dogIcon: ImgPath.dogIcon,
    towerDefenseHelp: ImgPath.gameHelpDefenseBg,
    hamsterHelp: ImgPath.gameHelpHamsterBg,
    bejeweledHelp: ImgPath.gameHelpBejeweledBg,
    shooterHelp: ImgPath.gameHelpShooterBg,
    parkourHelp: ImgPath.gameHelpParkourBg,
    fishingHelp: ImgPath.gameHelpFishingBg,
    bomberManHelp: ImgPath.gameHelpBomberManBg,
    bubbleDragonHelp: ImgPath.gameHelpBubbleDragonBg,
    bubbleDragon2Help: ImgPath.gameHelpBubbleDragon2Bg,
    matchingCardHelp: ImgPath.gameHelpMatchingCardBg,
    matchingCard2Help: ImgPath.gameHelpMatchingCard2Bg,
    piggyManHelp: ImgPath.gameHelpPiggyBg,
    piggyMan2Help: ImgPath.gameHelpPiggy2Bg,
    planetWarHelp: ImgPath.novicePlanetWarHelpBg,
    innerWar1Help: ImgPath.noviceInnerWar1HelpBg,
    innerWar2Help: ImgPath.noviceInnerWar2HelpBg,
    innerWar3Help: ImgPath.noviceInnerWar3HelpBg,
    adornment1Help: ImgPath.adornment1HelpBg,
    adornment2Help: ImgPath.adornment2HelpBg,
    adornment3Help: ImgPath.adornment3HelpBg,
    task1Help: ImgPath.task1HelpBg,
    task2Help: ImgPath.task2HelpBg,
    BrickBreaker1Help: ImgPath.brickBreaker1HelpBg,
    BrickBreaker2Help: ImgPath.brickBreaker2HelpBg,
  };
  /** 文字資料 */
  private textData = {
    backGuideList: '回新手引導首頁',
    videoInfo: '影片製作中，請耐心等候',
    videoDetailInfo: `想要更詳細的教學也可以搭配影片觀看！ 一起跟英雄快樂學習吧！`,
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
    planetWarTitle: `${WebGameModeName.OuterWar}`,
    innerWarTitle: `${WebGameModeName.InnerWar}`,
    brickBreakerTitle: `${WebGameModeName.BrickBreaker}篇`,
    adornmentTitle: `${WebGameModeName.Adornment}`,
    taskTitle: '任務小精靈篇',
    bejeweledInfo: `簡單的三消遊戲，停留太久時間消除方塊，魔力值會持續下降直到遊戲結束。
      善用能量道具能幫助消除更多英雄方塊，也能順利補回魔力值。`,
    bombManInfo: `利用滑鼠點擊決定英雄走動的路線，在路線中放置炸彈來清除阻擋去處的磚牆。
      清除地圖上的敵人才能成功過關。`,
    bubbleDragonInfo: '上下調整瞄準的角度發射氣泡,累積三顆黏在一起就能順利消除氣泡!!',
    bubbleDragon2Info: '使用特殊的道具讓消除氣泡更順利吧!',
    matchingCardInfo: '點擊翻開覆蓋的牌卡,記住牌卡的圖形,只要連續翻開相同花色就算配對成功!!配對時,小心敵人的干擾!!',
    matchingCard2Info: '使用特殊的道具讓配對卡片更順利吧!',
    piggyInfo: '上下控制砲台位置發射子彈消滅敵人!!若敵人降落地面後只能靠道具清除!',
    piggy2Info: '使用特殊的道具讓消滅高血量敵人更順利吧!',
    fishingInfo: `利用滑鼠左右拖曳可以移動船身，垂釣釣具則能順利將海中釣物釣起。
      保護海洋，人人有責，垃圾也能讓你點石成金。`,
    hamsterInfo: `不同的地鼠具有不同的血量與技能，要特別注意某些地鼠不能攻擊，不甚攻擊可能會造成損血。
      每隻地鼠需攻擊的次數可能不同，善用道具可以達到事半功倍的成效。`,
    parkourInfo: `沿途不斷吃星星能有助回覆魔力值。小心路上出現的不速之客，撞到他可是會損耗魔力值喔！
      善用道具有助獲得積分。`,
    planetWarInfo: `裝備強而有力的生物兵器，是過關的關鍵因素，每個關卡的裝備需求可能不盡相同。
      高等級或特殊生物兵器的獲取，會來自平日的學習做答或參加節慶限定的魔王賽。`,
    reverseTowerDefenseInfo: `每位英雄都是你的戰鬥夥伴，不同的英雄具有不同的道具技能，上戰場前須先組好你的專屬隊伍，才能無往不利的對敵軍發動攻擊。`,
    shooterInfo: `透過拋物線的路徑引導，瞄準目標物進行攻擊，發射前記得先選擇使用的子彈類型唷！
      全部的目標物皆銷毀才算成功。`,
    towerRoomInfo: `小遊戲中魔力值的來源，是仰賴消滅敵軍才能增長。
      每放置一枚砲塔都會消耗相對的魔力值，魔力值不足可是無法連續擺放砲塔的唷！`,
    innerWarInfo1: `選擇一個好隊長可以幫助團隊加分更多
熟悉鍵盤的操作能讓遊戲進行更順暢`,
    innerWarInfo2: `努力補充魔力值才能不斷發動攻擊技能
選擇正確的隊友順序是破關的重要策略`,
    innerWarInfo3: `了解道具功效能讓你更事半功倍
英雄們的普通攻擊也能為戰鬥帶來不錯的成效`,
    adornmentInfo1: `不論你的積分是否足夠，系統都會送你解鎖第一間房間，快來開啟你的個人基地佈置吧！`,
    adornmentInfo2: `想要把你的房間佈置的更豐富，就快到商店逛一逛囉！
買好買滿，讓房間佈置成為你驕傲的成果！`,
    adornmentInfo3: `積分越高可以解鎖的房間數就越多！
多多拜訪參觀同學的房間，增加你佈置的靈感！`,
    taskInfo1: `1. 按時將每日任務接取並達成，就能順利獲得任務獎勵唷！
    2. 只要在接取後7天內完成每週任務，即可獲得任務獎勵。`,
    taskInfo2: `1. 沒有在時限內完成的任務，會占用掉可接取任務的額度， 要記得去點選放棄任務唷！
    2. 已經完成的任務，記得要點領取鍵收獎勵唷！`,
    brickBreakerInfo1: `1. 進到賽局前的等待大廳可以先查看磚塊及道具說明。
    2. 看到出生點的YOU字樣，就是你的英雄正在此處跟你招手。`,
    brickBreakerInfo2: `1. 每敲一塊磚塊都需要經過答題的試煉！
    2. 取得道具數量越多，離MVP的目標就又更進一步囉！`,
  };

  /**教學內容陣列全部 */
  private guideDataList: GuideData[] = [
    {
      title: this.textData.towerDefenseTitle,
      content: [
        {
          img: this.imgData.towerDefenseHelp,
          info: this.textData.towerRoomInfo,
        },
      ],
      videoUrl: 'https://www.youtube.com/embed/GmV_wUEpnWY',
    },
    {
      title: this.textData.hamsterTitle,
      content: [{ img: this.imgData.hamsterHelp, info: this.textData.hamsterInfo }],
      videoUrl: 'https://www.youtube.com/embed/QJ3E2v9jf0A',
    },
    {
      title: this.textData.bejeweledTitle,
      content: [{ img: this.imgData.bejeweledHelp, info: this.textData.bejeweledInfo }],
      videoUrl: 'https://www.youtube.com/embed/rFhrZDlotW0',
    },
    {
      title: this.textData.shooterTitle,
      content: [{ img: this.imgData.shooterHelp, info: this.textData.shooterInfo }],
      videoUrl: 'https://www.youtube.com/embed/8Y5KM5U8Fko',
    },
    {
      title: this.textData.parkourTitle,
      content: [{ img: this.imgData.parkourHelp, info: this.textData.parkourInfo }],
      videoUrl: 'https://www.youtube.com/embed/f8Bl23zDLao',
    },
    {
      title: this.textData.fishingTitle,
      content: [{ img: this.imgData.fishingHelp, info: this.textData.fishingInfo }],
      videoUrl: 'https://www.youtube.com/embed/qye0ogq_0JI',
    },
    {
      title: this.textData.bomberManTitle,
      content: [{ img: this.imgData.bomberManHelp, info: this.textData.bombManInfo }],
      videoUrl: 'https://www.youtube.com/embed/JjIxxWT22JA',
    },
    {
      title: this.textData.bubbleDragonTitle,
      content: [
        { img: this.imgData.bubbleDragonHelp, info: this.textData.bubbleDragonInfo },
        { img: this.imgData.bubbleDragon2Help, info: this.textData.bubbleDragon2Info },
      ],
      videoUrl: 'https://www.youtube.com/embed/VilCBkoiKzU',
    },
    {
      title: this.textData.matchingCardTitle,
      content: [
        { img: this.imgData.matchingCardHelp, info: this.textData.matchingCardInfo },
        { img: this.imgData.matchingCard2Help, info: this.textData.matchingCard2Info },
      ],
      videoUrl: 'https://www.youtube.com/embed/XddUC2EoFTk',
    },
    {
      title: this.textData.piggyTitle,
      content: [
        { img: this.imgData.piggyManHelp, info: this.textData.piggyInfo },
        { img: this.imgData.piggyMan2Help, info: this.textData.piggy2Info },
      ],
      videoUrl: 'https://www.youtube.com/embed/mh7t_m3fDO4',
    },
    {
      title: this.textData.planetWarTitle,
      content: [
        {
          img: this.imgData.planetWarHelp,
          info: this.textData.planetWarInfo,
        },
      ],
      videoUrl: 'https://www.youtube.com/embed/Frpm_bfZpIo',
    },
    {
      title: this.textData.innerWarTitle,
      content: [
        { img: this.imgData.innerWar1Help, info: this.textData.innerWarInfo1 },
        { img: this.imgData.innerWar2Help, info: this.textData.innerWarInfo2 },
        { img: this.imgData.innerWar3Help, info: this.textData.innerWarInfo3 },
      ],
      videoUrl: 'https://www.youtube.com/embed/Cjp4fqjvI9M',
    },
    {
      title: this.textData.adornmentTitle,
      content: [
        { img: this.imgData.adornment1Help, info: this.textData.adornmentInfo1 },
        { img: this.imgData.adornment2Help, info: this.textData.adornmentInfo2 },
        { img: this.imgData.adornment3Help, info: this.textData.adornmentInfo3 },
      ],
      videoUrl: 'https://www.youtube.com/embed/3tcFCLk9_p0',
    },
    {
      title: this.textData.taskTitle,
      content: [
        { img: this.imgData.task1Help, info: this.textData.taskInfo1 },
        { img: this.imgData.task2Help, info: this.textData.taskInfo2 },
      ],
    },
    {
      title: this.textData.brickBreakerTitle,
      content: [
        { img: this.imgData.BrickBreaker1Help, info: this.textData.brickBreakerInfo1 },
        { img: this.imgData.BrickBreaker2Help, info: this.textData.brickBreakerInfo2 },
      ],
    },
  ];

  /**用路由抓現在哪篇教學 */
  private get routerContent(): GuideData | undefined {
    return this.guideDataList.find((guideData) => {
      return guideData.title === this.$route.meta?.name;
    });
  }
}
</script>
