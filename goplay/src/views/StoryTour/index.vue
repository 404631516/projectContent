<template>
  <div class="!overflow-hidden">
    <!-- 目錄和 banner -->
    <div class="fixed w-full shadow-2xl">
      <GeneralBanner :bannerImg="imgData.banner" :title="textData['gu-shi-bei-jing']" />
      <div class="h-20 flex justify-center items-center" bg="[#FFF]">
        <ul class="flex space-x-8 <sm:space-x-3">
          <template v-for="(item, index) in content">
            <li font="bold" text="2xl [#707070] <sm:xl" v-if="item.isShowTag" :key="index">
              <a
                p="x-2"
                :class="{
                  'pb-2 border-b-5 border-solid border-[#FDC327] text-[#FDC327]': item.id === selectContentId,
                }"
                :href="`#${item.id}`"
                >{{ item.name }}</a
              >
            </li>
          </template>
        </ul>
      </div>
    </div>
    <!-- 下方可滾動區域 -->
    <div
      id="content"
      class="overflow-y-scroll h-[calc(100vh-22rem)] <sm:h-[calc(100vh-15.8rem)] fixed top-22rem <sm:top-15.8rem scroll-smooth"
    >
      <!-- 宣傳影片 -->
      <div>
        <h3 id="promotionalVideo" class="w-64 flex items-center justify-evenly" m="x-auto y-2" text="3xl [#673E3E]">
          <img :src="imgData.bunIcon" />{{ textData['xuan-chuan-ying-pian'] }}
        </h3>
        <div class="w-2/4 h-[30vw] <lg:(w-5/6 h-[45vw])" m="x-auto">
          <iframe
            class="w-full h-full"
            src="https://www.youtube.com/embed/AYzCxhZ2KSM"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <!-- 神秘力量來襲 -->
      <div m="t-5" p="y-5" bg="[#F9F8F4]">
        <h3 id="storyOrigin" class="w-64 flex items-center justify-evenly" m="x-auto y-2" text="3xl [#673E3E]">
          <img :src="imgData.bunIcon" />{{ textData['shen-mi-li-liang-lai-xi'] }}
        </h3>
        <div
          v-for="(item, index) in storyTourInfo"
          :key="index"
          class="w-2/4 <lg:w-5/6 shadow-2xl rounded-b-4xl"
          m="x-auto"
          bg="[#FFF]"
        >
          <img :src="item.img" class="h-[30vw] <lg:h-[45vw]" m="x-auto" />
          <p font="bold" m="x-auto b-8" p="5" text="left 2xl [#A5A5A5]">
            {{ item.content }}
          </p>
        </div>
      </div>
      <!-- 裡宇宙 -->
      <div m="t-5" p="y-5" bg="[#F9F8F4]">
        <h3 id="innerWar" class="w-64 flex items-center justify-evenly" m="x-auto y-2" text="3xl [#673E3E]">
          <img :src="imgData.bunIcon" />{{ textData['li-yu-zhou-zhi-mi'] }}
        </h3>
        <div
          v-for="(item, index) in innerWarInfo"
          :key="index"
          class="w-2/4 <lg:w-5/6 shadow-2xl rounded-b-4xl"
          m="x-auto"
          bg="[#FFF]"
        >
          <img :src="item.img" class="h-[30vw] <lg:h-[45vw]" m="x-auto" />
          <p font="bold" m="x-auto b-8" p="5" text="left 2xl [#A5A5A5]">
            {{ item.content }}
          </p>
        </div>
      </div>
      <!-- 角色介紹 -->
      <div>
        <h3
          id="characterIntroduction"
          class="w-64 flex items-center justify-evenly"
          m="x-auto y-2"
          text="3xl [#673E3E]"
        >
          <img :src="imgData.bunIcon" />{{ textData['jiao-se-jie-shao'] }}
        </h3>
        <div class="grid grid-cols-[715px,715px] justify-center gap-5 <2xl:grid-cols-[715px] <sm:grid-cols-[390px]">
          <div
            v-for="(item, index) in storyHero"
            :key="index"
            :style="{ backgroundImage: `url(${imgData.heroCard})` }"
            class="w-full h-60 flex items-center <sm:h-36"
            bg="center cover no-repeat <sm:contain"
          >
            <img :src="item.img" class="h-70 <sm:h-full" m="r-8 b-15 <sm:b-5" />
            <div class="h-[80%] w-93 <sm:w-1/2" text="left">
              <h3
                m="b-2 <sm:b-[1px]"
                p="b-2 <sm:b-[1px]"
                border="b-2 solid [#FDC221]"
                font="bold"
                text="3xl [#FDC221] <sm:xl"
              >
                {{ item.title }}
              </h3>
              <div text="2xl [#A5A5A5] <sm:sm">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import { TranslateResult } from 'vue-i18n';
import TableManager from '../../manager/TableManager';
/** 目錄的 id 跟 名稱 */
interface Menu {
  /** 目錄的中文名稱 */
  name: string;
  /** 目錄的id */
  id: string;
  /** 是否顯示 */
  isShowTag: boolean;
}
/**故事內容 */
interface StoryInfo {
  /** 故事內容 */
  content: string;
  /** 故事 img 圖 */
  img: string;
}
/** 英雄介紹表 */
interface HeroInfo {
  /** 英雄圖 */
  img: string;
  /** 英雄名稱 */
  title: TranslateResult;
  /** 英雄介紹 */
  content: TranslateResult;
}
@Component({
  components: {
    GeneralBanner,
  },
})
export default class Index extends Vue {
  /** 圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
    bunIcon: imgPath.bunIcon,
    heroCard: imgPath.storyHeroCard,
  };
  /** 文字資料 */
  private textData = {
    'gu-shi-bei-jing': '故事背景',
    'xuan-chuan-ying-pian': '宣傳影片',
    'shen-mi-li-liang-lai-xi': '神秘力量來襲',
    'li-yu-zhou-zhi-mi': '裡宇宙之謎',
    'jiao-se-jie-shao': '角色介紹',
  };

  /** 選單名稱和 id  */
  private readonly content: Menu[] = [
    {
      name: this.textData['xuan-chuan-ying-pian'],
      id: 'promotionalVideo',
      isShowTag: false,
    },
    {
      name: this.textData['shen-mi-li-liang-lai-xi'],
      id: 'storyOrigin',
      isShowTag: true,
    },
    {
      name: this.textData['li-yu-zhou-zhi-mi'],
      id: 'innerWar',
      isShowTag: true,
    },
    {
      name: this.textData['jiao-se-jie-shao'],
      id: 'characterIntroduction',
      isShowTag: true,
    },
  ];

  /** 目錄是否顯示列表 */
  private contentIntersectionList: boolean[] = new Array(this.content.length).fill(false);

  /** 目前選中目錄 id */
  private selectContentId: string = '';

  /** web API */
  private intersectionObserver = new IntersectionObserver(
    (observerArray: IntersectionObserverEntry[]) => {
      observerArray.forEach((observer) => {
        const index = this.content.findIndex((menu) => menu.id === observer.target.id);
        this.contentIntersectionList[index] = observer.isIntersecting;
      });
      const contentIndex = this.contentIntersectionList.findIndex((isIntersecting) => isIntersecting);
      if (contentIndex === -1) {
        return;
      }
      this.onChangeId(this.content[contentIndex].id);
    },
    {
      root: document.getElementById('content'),
      threshold: 0.5,
    }
  );

  // 裡宇宙
  private innerWarInfo: StoryInfo[] = [
    {
      content:
        '因雄們不斷探索宇宙深處，終於發現通往另一個平行空間『裡宇宙』的通道，那股充滿威脅的神秘力量似乎藏於其中。英雄們決定化守為攻，主動出擊！',
      img: imgPath.innerWar1,
    },
  ];
  /** 故事內容 */
  private storyTourInfo: StoryInfo[] = [
    {
      content: '在人類一直生存著的3度空間世界之外，其實還存在著一個充滿謎團的2度空間宇宙。',
      img: imgPath.firstStoryBaseUrl,
    },
    {
      content:
        '某天，這股神秘的力量大舉入侵地球，一直在暗中保護地球不受2度空間力量入侵的故事主角們，例如孫悟空、桃太郎、阿里巴巴、白雪公主等等，都在無預警間成為了敵人的俘虜。',
      img: imgPath.secondStoryBaseUrl,
    },
    {
      content: '面對地球存亡的危機，故事中的配角們挺身而出，甚至反派角色們也紛紛改邪歸正，他們決定為地球而戰！',
      img: imgPath.thirdStoryBaseUrl,
    },
  ];
  /** 英雄介紹表 */
  private storyHero: HeroInfo[] = [];

  mounted() {
    this.storyHero = this.getHeroInfoList();
    this.content.map((item) => {
      this.intersectionObserver.observe(document.getElementById(item.id)!);
    });
  }

  /**  拿取 table 的英雄資料重組 */
  private getHeroInfoList(): HeroInfo[] {
    return TableManager.hero.getAll().map((item: { url: string; nameKey: string; introKey: string }) => {
      return {
        img: `img/hero/${item.url}/${item.url}.png`,
        title: this.$t(`common.${item.nameKey}`),
        content: this.$t(`common.${item.introKey}`),
      };
    });
  }

  /** 更換目前選中目錄ID
   * @param selectId
   */
  private onChangeId(selectId: string): void {
    this.selectContentId = selectId;
  }
}
</script>
