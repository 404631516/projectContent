<template>
  <el-dialog :visible.sync="isDialogVisible" :fullscreen="true" @open="open" destroy-on-close>
    <div
      class="w-full relative flex justify-center items-center text-[3vmax]"
      p="y-5"
      bg="[#DFD8BA]"
      text="[#A2804C]"
      font="bold"
    >
      <!-- 角色資訊 -->
      <img :src="imgData.user" class="w-[3vmax]" />
      {{ textData.characterInfo }}
      <!-- 關閉按鈕 -->
      <button class="absolute -top-1.5 -right-2" @click="isDialogVisible = false">
        <img :src="imgData.closeButton" class="w-[6vmax] object-contain <sm:w-[9vmax]" />
      </button>
    </div>
    <div class="w-full h-full relative">
      <!-- 左邊箭頭 -->
      <button
        class="absolute flex top-[40%] left-[3%] <sm:top-[20%] arrow-moveleft"
        @click="changeHeroInfo(currentHeroCardIndex - 1)"
      >
        <img :src="imgData.arrowYellow" class="h-[6vw] <sm:h-[16vw] z-5 object-contain" />
      </button>
      <!-- 中間內容 -->
      <div
        class="w-full h-full relative grid sm:grid-cols-2 <sm:grid-rows-[1fr,1fr]"
        :style="{
          background: `url(${imgData.cardInfoBg})`,
          'background-repeat': 'no-repeat',
          'background-size': 'auto',
        }"
      >
        <div class="relative">
          <span class="absolute top-[5%] left-[5%] text-[7vmax]" font="black" text="[#D1C9AB]">{{
            heroData.heroName
          }}</span>
          <!-- 卡片 -->
          <img
            :src="heroData.cardUrl"
            class="absolute w-[26vw] top-[10%] left-[40%] <sm:(w-[41vw] top-[20%]) opacity-50 transform rotate-5 aspect-card card-shadow"
          />
          <!-- 英雄 -->
          <img
            :src="heroData.heroUrl"
            class="absolute h-[70%] w-[60%] top-[20%] left-[20%] <sm:(top-[30%] left-[7%]) object-contain aspect-hero transform rotate-y-180 -rotate-10"
          />
        </div>
        <!-- 英雄內容 -->
        <div class="w-[80%] flex items-start flex-col" m="<sm:x-auto" p="t-7vw">
          <!-- 名稱等級 -->
          <span class="text-[3vmax]" m="b-1vw" text="[#A2804C]" font="bold"
            >{{ heroData.heroName }}{{ heroData.level }}</span
          >
          <!-- 分類類型 -->
          <div class="w-full flex flex-col" text="left" v-for="type in heroInfoTypeList" :key="type.key">
            <span class="text-[1.7vmax] rounded-2xl" p="y-0.5vw l-2vw" text="[#A2804C]" font="bold" bg="[#E6D7A2]">
              {{ type.typeKey }}
            </span>
            <!-- 資訊類型 -->
            <div
              v-for="info in type.content"
              :key="info.key"
              class="text-[1.7vmax] leading-12 <sm:leading-7"
              p="l-2vw"
              text="[#8F8F8F]"
            >
              <span text="[#464646]" font="bold">{{ info.key }}</span>
              <span v-for="description in info.description" :key="description.info" m="l-0.8vw">
                <img class="inline-block w-3vw" :src="description.imgUrl" v-if="description.imgUrl" />
                {{ description.info }}
                <span m="l-0.5vw" v-if="description.unit">{{ description.unit }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- 右邊箭頭 -->
      <button
        class="absolute flex top-[40%] right-[3%] <sm:top-[20%] arrow-moveright"
        @click="changeHeroInfo(currentHeroCardIndex + 1)"
      >
        <img :src="imgData.arrowYellow" class="transform rotate-y-180 h-[6vw] <sm:h-[16vw] z-5 object-contain" />
      </button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, VModel, Prop } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import AntiTDHelper from '@/views/H5/Games/AntiTDGame/Component/AntiTDHelper';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import { HeroListData } from '@/helper/interface/Hero';
import { Message } from '@/helper/class/Common';

/** 英雄全部屬性 */
interface HeroBaseData {
  /** 英雄名稱 */
  heroName: string;
  /** 英雄等級 */
  level: string;
  /** 卡片路徑 */
  cardUrl: string;
  /** 英雄全身圖路徑 */
  heroUrl: string;
}

/** 英雄資訊種類 */
interface HeroInfoType {
  /** 英雄資訊種類名稱 */
  typeKey: string;
  /** 內容 */
  content: HeroInfoData[];
}

/** 英雄屬性 */
interface HeroInfoData {
  /** 英雄屬性名稱 */
  key: string;
  /** 屬性介紹 */
  description: Array<{ imgUrl?: string; info: string; unit?: string }>;
}

@Component({})
export default class HeroInfoDialog extends Vue {
  /**彈窗 開關 */
  @VModel({ type: Boolean }) isDialogVisible!: boolean;
  /** 英雄 heroID */
  @Prop({ type: Number }) heroId!: number;
  /** 現在的heroCard順序 */
  private currentHeroCardIndex: number = -1;

  /** 英雄資料 */
  private heroData: HeroBaseData = {} as HeroBaseData;

  /** 英雄屬性相關資料 */
  private heroInfoTypeList: HeroInfoType[] = [];

  /** 圖片資料 */
  private imgData = {
    user: ImgPath.userBrown,
    closeButton: ImgPath.closeButton,
    cardInfoBg: ImgPath.cardInfoBg,
    arrowYellow: ImgPath.arrowYellow,
  };

  /** 文字資料 */
  private textData = {
    characterInfo: '角色資訊',
  };

  /** 全部英雄(有紀錄目前是否解鎖，是否上場，等級資訊) */
  private get heroCards(): HeroListData[] {
    return this.$$store.state.HeroManagerModule.heroList;
  }

  open() {
    // 找到英雄資料
    const cardIndex = this.heroCards.findIndex((heroData) => {
      return heroData.heroId === this.heroId;
    });
    if (cardIndex === -1) {
      // 報錯
      Message.warn('未找到該英雄資料');
      return;
    }

    this.setHeroInfoData(cardIndex);
  }

  /** 設定英雄資訊資料
   * @param cardIndex
   */
  private setHeroInfoData(cardIndex: number): void {
    // 重複
    if (this.currentHeroCardIndex === cardIndex) {
      return;
    }
    this.currentHeroCardIndex = cardIndex;

    // 找到英雄資料
    const heroListData = this.heroCards[cardIndex];

    // 清空上一份資料
    this.heroInfoTypeList.splice(0);

    // 英雄相關資料
    const antiTDInfo = AntiTDHelper.getAntiTDInfo(heroListData);
    if (antiTDInfo === undefined) {
      return;
    }

    // 設定英雄名稱
    this.heroData.heroName = antiTDInfo.heroName;
    // 設定英雄等級
    this.heroData.level = heroListData.locked ? '未解鎖' : `Lv${heroListData.level}`;
    // 設定英雄圖片
    this.heroData.cardUrl = HeroManager.getHeroCardUrl(heroListData.url);
    // 設定英雄卡片圖片
    this.heroData.heroUrl = HeroManager.getHeroImgUrlByHeroId(heroListData.heroId, HeroImgType.Full);
    // 設定英雄資訊
    this.heroInfoTypeList.push(
      {
        typeKey: '類型資訊',
        content: [
          {
            key: '屬性',
            description: [{ imgUrl: antiTDInfo.heroAttributeUrl, info: antiTDInfo.heroAttributeName }],
          },
          {
            key: '可裝備道具種類',
            description: antiTDInfo.antiTDItemTypes.map((antiTD) => {
              return {
                imgUrl: antiTD.antiTDItemTypeUrl,
                info: antiTD.antiTDItemTypeName,
              };
            }),
          },
          {
            key: '類型',
            description: [{ info: antiTDInfo.normalAttackItemName }],
          },
        ],
      },
      {
        typeKey: '基本資訊',
        content: [
          {
            key: '基本攻擊力',
            description: [{ info: `${antiTDInfo.heroAntiTDAttack}` }],
          },
          {
            key: '冷卻時間',
            description: [{ info: `${antiTDInfo.coolDown}`, unit: 's' }],
          },
          {
            key: '攻擊距離',
            description: [{ info: `${antiTDInfo.attackRange}` }],
          },
          {
            key: '血量',
            description: [{ info: `${antiTDInfo.heroAntiTDHp}` }],
          },
          {
            key: '防禦',
            description: [{ info: `${antiTDInfo.heroAntiTDDefense}` }],
          },
        ],
      },
      {
        typeKey: '塔防資訊',
        content: [
          {
            key: '塔防化身',
            description: [{ info: antiTDInfo.sameWeaponName }],
          },
        ],
      }
    );
  }

  /** 箭頭切換英雄資訊
   *  @param nextCardIndex 下一個順序
   */
  private changeHeroInfo(nextCardIndex: number): void {
    // 循環顯示
    if (nextCardIndex > this.heroCards.length - 1) {
      nextCardIndex = 0;
    } else if (nextCardIndex < 0) {
      nextCardIndex = this.heroCards.length - 1;
    }

    // 改變heroId重抓資料
    this.setHeroInfoData(nextCardIndex);
  }
}
</script>

<style scoped>
::v-deep .el-dialog.is-fullscreen {
  overflow: hidden;
}
::v-deep .el-dialog__header {
  display: none;
}
::v-deep .el-dialog__body {
  height: 100%;
  padding: 0%;
}
.card-shadow {
  box-shadow: 20px 20px 60px;
}
.aspect-card {
  aspect-ratio: 55/74;
}
.aspect-hero {
  aspect-ratio: 40/35;
}
.arrow-moveleft {
  animation: MoveToLeft 1.5s infinite;
}
.arrow-moveright {
  animation: MoveToRight 1.5s infinite;
}
@keyframes MoveToLeft {
  from {
    left: 3%;
  }
  to {
    left: 0%;
  }
}
@keyframes MoveToRight {
  from {
    right: 3%;
  }
  to {
    right: 0%;
  }
}
</style>
