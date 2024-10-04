<template>
  <div class="game-rueslt-warpper flex-pos">
    <el-dialog :visible="msgVisible" :show-close="false" :destroy-on-close="false" :lock-scroll="true">
      <!-- 答題成功 -->
      <template v-if="resultType === endTypeName.AnswerSuccess">
        <!-- 標題 -->
        <div slot="title" class="flex-pos column">
          <span>{{ textData.answerResultTitle }}</span>
          <span class="border"></span>
        </div>
        <!-- 作答結果細節 -->
        <div class="rueslt-body flex-pos">
          <ol>
            <!-- 總得分 -->
            <li>
              {{ textData.totalAnswerScoreTitle }}
              <span>{{ totalAnswerScore }}</span>
            </li>
            <!-- 答對數 -->
            <li>
              {{ textData.correct }}
              <span>{{ answerScore }}</span>
              {{ textData.question }}
            </li>
            <!-- 獲得能量 -->
            <li>
              {{ textData.gainEnergy }}
              <span class="img" :style="`background: url(${imgData.goldIcon})`"></span>
              <span>{{ totalEnergy }}</span>
            </li>
            <!-- 獲得道具 -->
            <li v-if="totalProps.length > 0">
              <div class="flex items-start">
                <p m="t-5">{{ textData.gainItem }}</p>
                <div class="flex flex-col pl-4">
                  <div v-for="(rewardItem, index) in totalProps" :key="index">
                    <div class="award-area w-full flex-pos left">
                      <span
                        :class="`award-${endTypeName.AnswerSuccess}`"
                        :style="`background: url(${rewardItem.itemImageUrl})`"
                      ></span>
                      <span
                        >{{ $t(`common.${rewardItem.itemNameKey}`) }}
                        <template v-if="rewardItem.itemValue > 1">+{{ rewardItem.itemValue }}</template></span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>
        <!-- 按鈕 -->
        <div slot="footer" class="flex-pos">
          <!-- 前往快閃店 -->
          <el-button @click="onConfirm">
            <span class="flex-pos" text="20px">{{ textData.toFlashShop }}</span>
          </el-button>
        </div>
      </template>
      <!-- 答題失敗 -->
      <template v-if="resultType === endTypeName.AnswerFail">
        <!-- 標題 -->
        <div slot="title">
          <span class="fail">{{ textData.answerFail }}</span>
        </div>
        <!-- 失敗提示 -->
        <div class="rueslt-body flex-pos">{{ textData.answerFailHint }}</div>
        <!-- 按鈕 -->
        <div slot="footer" class="flex-pos">
          <div>
            <!-- 返回排行 -->
            <el-button @click="onConfirm">
              <span class="flex-pos">{{ textData.confirmTitle }}</span>
            </el-button>
          </div>
        </div>
      </template>
      <!-- 遊戲結束 挑戰成功 -->
      <template v-if="resultType === endTypeName.Success">
        <!-- 標題 -->
        <div slot="title">
          <div class="flex-pos column">
            <div class="icon" :style="`background: url(${imgData.successIcon})`"></div>
            <!-- 星級 (目前只有星球大戰有) -->
            <StarBox v-if="planetWarStarCount" :starCount="planetWarStarCount" m="y-3" />
            <div class="border"></div>
          </div>
        </div>
        <!-- 過關獎勵 -->
        <div class="rueslt-body flex-pos">
          <!-- 星球大戰獎勵 -->
          <template v-if="webGameMode === webGameModeName.PlanetWar">
            <ol>
              <!-- 總得分 -->
              <li>
                {{ textData.totalAnswerScoreTitle }}
                <span>{{ gameScore }}</span>
              </li>
              <!-- 英雄經驗 -->
              <li>
                {{ textData.gainExp }}
                <span>{{ heroEx }}</span>
              </li>
              <!-- 獲得晶球 -->
              <li v-if="planetWarCrystal">
                {{ textData.gainCrystal }}
                <span>{{ planetWarCrystal }}</span>
              </li>
              <!-- 獲得金幣 -->
              <li v-show="planetWarGold">
                {{ textData.gainGold }}
                <span>{{ planetWarGold }}</span>
              </li>
              <!-- 獲得獎勵道具 -->
              <li v-if="contestGameAwardList.length > 0">
                <p>{{ textData.gainItem }}</p>
                <div
                  class="award-area planet flex-pos left"
                  v-for="(awardItem, index) in contestGameAwardList"
                  :key="index"
                >
                  <div class="weapon-img-box items-center grid grid-cols-[100px,auto]">
                    <div class="flex justify-center">
                      <img class="h-25 self-center" :src="`${getAwardItemImg(awardItem)}`" />
                    </div>
                    <span>
                      {{ `${getAwardItemNameKey(awardItem)}` }}
                    </span>
                  </div>
                </div>
              </li>
            </ol>
          </template>
          <!-- 答題小遊戲獎勵 -->
          <template v-else>
            <ol>
              <!-- 魔王傷害 -->
              <li v-if="isStartDevil">
                {{ textData.causeDamage }}
                <span>{{ totalAnswerScore }}{{ textData.damageTitle }}</span>
              </li>
              <!-- 總得分 -->
              <li v-if="!isStartDevil">
                {{ textData.totalAnswerScoreTitle }}
                <span>{{ gameScore }}</span>
              </li>
              <!-- 英雄經驗 -->
              <li>
                {{ textData.gainExp }}
                <span>{{ heroEx }}</span>
              </li>
              <!-- 獲得晶球 -->
              <li v-if="planetWarCrystal">
                {{ textData.gainCrystal }}
                <span>{{ planetWarCrystal }}</span>
              </li>
              <!-- 獲得金幣 -->
              <li>
                <div v-if="planetWarGold">
                  {{ textData.gainGold }}
                  <span>{{ planetWarGold }}</span>
                </div>
              </li>
              <!-- 獲得獎勵道具 -->
              <li v-if="contestGameAwardList.length > 0">
                <p>{{ textData.gainItem }}</p>
                <div
                  class="award-area planet flex-pos left"
                  v-for="(awardItem, index) in contestGameAwardList"
                  :key="index"
                >
                  <div class="weapon-img-box items-center grid grid-cols-[100px,auto]">
                    <div class="flex justify-center">
                      <img class="h-25 self-center" :src="`${getAwardItemImg(awardItem)}`" />
                    </div>
                    <span>
                      {{ `${getAwardItemNameKey(awardItem)}` }}
                    </span>
                  </div>
                </div>
              </li>
            </ol>
          </template>
        </div>
        <!-- 按鈕 -->
        <div slot="footer" class="flex-pos">
          <el-button @click="onConfirm">
            <span class="flex-pos">{{ textData.confirmTitle }}</span>
          </el-button>
        </div>
      </template>
      <!-- 遊戲結束 挑戰失敗 -->
      <template v-if="resultType === endTypeName.Fail">
        <div slot="title">
          <div class="flex-pos">
            <div class="icon" :style="`background: url(${imgData.failIcon})`"></div>
          </div>
        </div>
        <div class="rueslt-body flex-pos">
          <ol>
            <li>
              <!-- 星球大戰裏宇宙失敗提示 -->
              <span v-if="webGameMode === webGameModeName.PlanetWar && isPlanetInnerWorld">
                {{ planetInnerWorldTip }}
              </span>
              <!-- 通用失敗提示 -->
              <span v-else> {{ textData.tip }} </span>
            </li>
          </ol>
        </div>
        <div slot="footer" class="flex-pos">
          <el-button @click="onConfirm">
            <span class="flex-pos">確定</span>
          </el-button>
        </div>
      </template>
      <!-- 續命題 答題成功 -->
      <template v-if="resultType === endTypeName.ContinueSuccess">
        <!-- 標題 -->
        <div slot="title">
          <span>{{ textData.continueResultTitle }}</span>
        </div>
        <!-- 續命結果細節 -->
        <div class="rueslt-body flex-pos">
          <ol>
            <!-- 總得分 -->
            <li class="score-area">
              {{ textData.totalAnswerScoreTitle }}
              <span>{{ totalAnswerScore }}</span>
            </li>
            <!-- 答對數 -->
            <li>
              {{ textData.correct }}
              <span>{{ answerScore }}</span>
              {{ textData.question }}
            </li>
            <!-- 獲得道具 -->
            <li>
              <div class="flex items-start">
                <p m="t-5">{{ textData.gainItem }}</p>
                <div class="flex flex-col pl-4">
                  <div v-for="(rewardItem, index) in totalProps" :key="index">
                    <div class="award-area w-full flex-pos left">
                      <span class="img" :style="`background: url(${rewardItem.itemImageUrl})`"></span>
                      <span
                        >{{ $t(`common.${rewardItem.itemNameKey}`) }}
                        <template v-if="rewardItem.itemValue > 1">+{{ rewardItem.itemValue }}</template></span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>
        <!-- 按鈕 -->
        <div slot="footer" class="flex-pos">
          <el-button @click="onConfirm">
            <span class="flex-pos">{{ textData.continueGameTitle }}</span>
          </el-button>
        </div>
      </template>
      <!-- 續命題 答題失敗(全錯) -->
      <template v-if="resultType === endTypeName.ContinueFail">
        <!-- 標題 -->
        <div slot="title">
          <span>{{ textData.continueFailTitle }}</span>
        </div>
        <!-- 按鈕 -->
        <div slot="footer" class="flex-pos">
          <el-button @click="onConfirm">
            <span class="flex-pos">{{ textData.continueGameTitle }}</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { EndType } from '@/helper/enum/WebGame';
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { PlanetWarType, WebGameMode } from '@/helper/enum/Common';
import StarBox from '@/components/PlanetWar/_Props/StarList.vue';
import { ShopCartItem } from '@/helper/interface/AnswerGame';
import ImgPath from '@/config/imgPath/imgPath';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';
import { randomRange } from '@/views/H5/Helper/MathHelper';

@Component({
  components: {
    StarBox,
  },
})
export default class ResultMsg extends Vue {
  /** 顯示開關 */
  @Prop(Boolean) private msgVisible!: boolean;
  /** 轉場類型 */
  @Prop() private resultType!: EndType;
  /** 遊戲類型 */
  @Prop() private webGameMode!: WebGameMode;
  /** 答對題數 */
  @Prop(Number) private answerScore!: number;
  /** 獲得總分數 */
  @Prop(Number) private totalAnswerScore!: number;
  /** 獲得總能量 */
  @Prop(Number) private totalEnergy!: number;
  /** 獲得道具 */
  @Prop() private totalProps!: ShopCartItem[];
  /** 是否開啟魔王賽 */
  @Prop(Boolean) private isStartDevil!: boolean;
  /** 遊戲總分數 */
  @Prop(Number) private gameScore!: number;
  /** 星球大戰星等 */
  @Prop(Number) private planetWarStarCount!: number;
  /** 星球大戰金幣 */
  @Prop(Number) private planetWarGold!: number;
  /** 星球大戰晶球 */
  @Prop(Number) private planetWarCrystal!: number;
  /** 獎勵道具 */
  @Prop(Array) private contestGameAwardList!: ContestGameAward[];
  /** 英雄獲得經驗值 */
  @Prop(Number) private heroEx!: number;

  /** 給Vue用於判別結算狀態 */
  private endTypeName: typeof EndType = EndType;

  /** 給Vue用於判別遊戲類型 */
  private webGameModeName: typeof WebGameMode = WebGameMode;

  /** 圖片資料 */
  private imgData = {
    goldIcon: ImgPath.flashShopGoldBaseUrl,
    successIcon: ImgPath.resultSuccessBaseUrl,
    failIcon: ImgPath.resultFailBaseUrl,
  };

  /** 文字資料 */
  private textData = {
    answerResultTitle: '答題成果',
    totalAnswerScoreTitle: '獲得分數',
    correct: '答對',
    question: '題',
    gainEnergy: '獲得能量',
    toFlashShop: '前往能量轉換',
    answerFail: '答題失敗',
    answerFailHint: '全錯無法進行小遊戲喔！',
    confirmTitle: '確定',
    gainCrystal: '獲得晶球',
    gainGold: '獲得金幣',
    causeDamage: '本次魔王共造成',
    damageTitle: '點傷害',
    gainExp: '獲得英雄經驗值',
    gainItem: '獲得獎勵',
    continueResultTitle: '續命答題成果',
    continueGameTitle: '繼續遊戲',
    continueFailTitle: '續命失敗',
    tip: '繼續加油！',
  };

  /** 星球大戰裏宇宙失敗提示清單 */
  private planetInnerWorldTipList: string[] = [
    '可嘗試看看不同英雄與技能搭配！',
    '提升英雄等級以面對更強勁的敵人!',
    '英雄面對同屬性敵人時，攻擊力會提升喔!',
  ];

  /** 是否為星球大戰裏宇宙 */
  private get isPlanetInnerWorld(): boolean {
    return this.$$store.state.PlanetWarModule.planetWarType === PlanetWarType.Inner;
  }

  /** 獲取星球大戰裏宇宙失敗提示 */
  private get planetInnerWorldTip(): string {
    return this.planetInnerWorldTipList[randomRange(0, this.planetInnerWorldTipList.length)];
  }

  /** 取得獎勵道具圖片
   * @param awardItem
   */
  private getAwardItemImg(awardItem: ContestGameAward): string {
    return RewardManager.getRewardItemImg(awardItem);
  }

  /** 取得獎勵道具多國Key
   * @param awardItem
   */
  private getAwardItemNameKey(awardItem: ContestGameAward): string {
    return RewardManager.getRewardItemName(awardItem);
  }

  /** 點擊確認 */
  @Emit('onConfirm')
  private onConfirm(): void {
    return;
  }
}
</script>
<style lang="scss">
.award-area {
  &.planet {
    min-height: 5vw;
    .weapon-img-box {
      span {
        display: inline-block;
        font-size: 24px;
        -webkit-text-stroke: 0.0625rem #ad7400;
        color: #fac11f !important;
        font-weight: bold;
        vertical-align: text-bottom;
      }
      img {
        vertical-align: middle;
      }
    }
  }
}
.game-rueslt-warpper {
  // 結算星等(調整大小)
  .star-box {
    width: 5vw !important;
    height: 8vh !important;
  }
}
</style>
