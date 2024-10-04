<template>
  <div>
    <el-dialog
      :visible.sync="isDialog"
      width="0%"
      top="0"
      :show-close="false"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :close-on-press-escape="false"
      :append-to-body="true"
    >
      <div class="w-full h-screen flex flex-col justify-center items-center">
        <!-- 快閃店標題 -->
        <h1 m="x-3 b-5" text="[#FDC221] 3xl">{{ textData.title }}</h1>
        <!-- 上方白色快閃店 -->
        <div class="w-1/2 <xl:w-[95%] rounded-3xl" m="x-auto" p="t-5 b-2" bg="white">
          <!-- title -->
          <div class="flex justify-between items-center" m="b-2" p="x-2">
            <div class="w-36 h-8 flex justify-evenly items-center rounded-xl" bg="[#FF5050CC]" text="[#FFF]">
              <span>{{ textData.timer }}</span>
              <Timer :countDown="true" :isShowTime="true" :time="countdownTime" @onTimeUp="onTimeUp"> </Timer>
            </div>
            <div class="rounded-xl" p="x-[18px] y-1" bg="[#4A4A4A]" text="xl [#FFF]">
              <span text="[#FDC221]">{{ textData.gameConditions }}</span>
              {{ priceData[0].gameCondition }}
            </div>
          </div>
          <!-- 淺米色部分 -->
          <div class="relative flex flex-col justify-center items-center" p="y-2" bg="[#F3EDD5]">
            <!-- 淺米色部分 title -->
            <div text="2xl [#D69F05]">
              {{ textData.equipHint }}
              <div
                v-if="priceData[0].itemInfo.length"
                class="absolute right-2 top-2 flex items-center rounded-xl space-x-2 <sm:static"
                p="1"
                text="base [#666666]"
                border="1 solid #3A3A3A59"
              >
                <span class="flex items-center" v-for="(itemInfo, index) in priceData[0].itemInfo" :key="index">
                  <img class="object-contain" m="r-2" :src="itemInfo.infoIcon" />
                  <span>{{ itemInfo.infoTitle }}</span>
                </span>
              </div>
            </div>
            <!-- 米色部分裝備 -->
            <div
              class="flex w-[95%] overflow-auto scrollbar <sm:justify-start"
              m="y-3"
              p="y-2"
              :class="priceData.length > 6 ? 'justify-start' : 'justify-center'"
            >
              <el-tooltip :value="false" placement="top" v-for="(itemData, index) in priceData" :key="index" m="x-1">
                <div slot="content">
                  <p>
                    {{ $t(`common.${itemData.gameItemData.itemNameKey}`) }}
                  </p>
                  <p>
                    {{ $t(`common.${itemData.itemContentKey}`) }}
                  </p>
                </div>
                <!-- 點擊購買 -->
                <div @click="onBuyItem(itemData, 1)" class="flex flex-col items-center cursor-pointer">
                  <!-- 道具名稱 -->
                  <p font="bold" text="xl">
                    {{ $t(`common.${itemData.gameItemData.itemNameKey}`) }}
                  </p>
                  <!-- 道具圖示 -->
                  <div
                    class="w-32 h-32 rounded-xl relative overflow-hidden"
                    m="auto"
                    border="2 solid [#FFF]"
                    bg="[#000000CC]"
                  >
                    <img class="w-full h-full object-contain" :src="itemData.gameItemData.itemImageUrl" />
                    <div
                      v-if="itemData.itemInfo.length"
                      class="absolute bottom-0 h-1/2 flex flex-col items-center justify-center w-full"
                      bg="[#000] opacity-50"
                    >
                      <div
                        v-for="(itemInfo, index2) in itemData.itemInfo"
                        :key="index2"
                        class="flex justify-evenly items-center w-2/3"
                        :style="{ color: `${itemInfo.cssClass}` }"
                      >
                        <img class="h-5 object-contain" :src="itemInfo.infoIcon" />
                        {{ itemInfo.infoValue }}
                      </div>
                    </div>
                  </div>
                  <!-- 道具價格 -->
                  <div
                    class="w-full flex items-center justify-center rounded-xl shadow-default"
                    m="t-3"
                    p="y-1"
                    border="2 solid [#FFF]"
                    bg="[#646464]"
                    text="[#FFF]"
                  >
                    <img :src="imgData.goldIcon" />
                    {{ itemData.itemCost }}
                  </div>
                </div>
              </el-tooltip>
            </div>
          </div>
          <!-- 玩家power -->
          <div
            class="flex items-center justify-center rounded-xl w-max"
            m="t-2 x-auto"
            p="x-2 y-1"
            bg="[#646464]"
            text="[#FFF]"
          >
            <img :src="imgData.goldIcon" />
            <span text="[#FFDD00]" m="x-2">{{ textData.power }}</span>
            {{ currentEnergy }}
          </div>
        </div>
        <div class="w-1/2 <xl:w-[95%] grid <sm:grid-rows-2 sm:grid-cols-[1fr,2fr,1fr]" m="t-8 x-auto">
          <div class="flex flex-col justify-center items-center sm:col-start-2">
            <!-- 購買裝備狀態 -->
            <div class="flex justify-center items-center rounded-10px" bg="[#00000080]" p="y-2 x-2">
              <div
                class="w-15 h-15 flex justify-center items-center flex-shrink-0 rounded-md relative"
                :style="{
                  'border-style': index < shoppingCart.length ? 'solid' : 'dashed',
                }"
                m="x-1"
                border="1 [#D9D6BE]"
                bg="black"
                v-for="(box, index) in cartMax"
                :key="index"
              >
                <span
                  class="absolute -top-5 w-full h-5 rounded-md"
                  text="center [#FFF]"
                  bg="[#302D58CC]"
                  v-if="index < shoppingCart.length"
                >
                  {{ shoppingCart[index].itemValue }}
                </span>
                <img
                  class="w-full h-full object-contain block"
                  v-if="index < shoppingCart.length"
                  :src="shoppingCart[index].itemImageUrl"
                />
                <span v-else text="[#F8F0AF] 4xl">{{ `+` }}</span>
                <button
                  class="w-4/5 absolute -bottom-2 left-[10%] rounded-2xl"
                  border="1 solid [#FFF]"
                  text="base [#FFF]"
                  bg="[#DA3752CC]"
                  v-if="index < shoppingCart.length"
                  @click="onRefundItem(shoppingCart[index])"
                >
                  {{ textData.refund }}
                </button>
              </div>
            </div>
            <span text="[#F8F0AF] xl">{{ textData.prompt }}</span>
          </div>
          <!-- 轉換按鈕 -->
          <button
            class="w-52 h-16 flex-shrink-0 flex justify-end items-center rounded-80px justify-self-center"
            border="3 solid [#FFF]"
            bg="[#000000CC]"
            @click="onClickConfirm"
          >
            <div>
              <p text="[#F1D103] base">{{ textData.exchangeComplete }}</p>
              <p text="[#FFF] xl">{{ textData.gameStart }}</p>
            </div>
            <img class="h-1/2" m="x-3" :src="imgData.arrowIcon" />
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Emit, Prop, ModelSync } from 'vue-property-decorator';
import Timer from '@/components/Public/Timer.vue';
import { Message } from '@/helper/class/Common'; // 訊息框
import { toShopCartItem } from '@/helper/fnc/common';
import { ShopItemData, ShopCartItem } from '@/helper/interface/AnswerGame';
import ImgPath from '@/config/imgPath/imgPath';

@Component({
  components: {
    Timer,
  },
})
export default class FlashShop extends Vue {
  @ModelSync('isOpen', 'change', { type: Boolean }) isDialog!: boolean;
  /** 顯示快閃店 */
  @Prop(Boolean) private msgVisible!: boolean;
  /** 商品清單 */
  @Prop(Array) private priceData!: ShopItemData[];
  /** 能量值 */
  @Prop(Number) private totalEnergy!: number;
  /** 購物車 */
  @Prop(Array) private shoppingCart!: ShopCartItem[];

  /** 道具購買上限 */
  private readonly cartMax: number = 5;

  /** 道具購買時限 */
  private readonly countdownTime: number = 30;

  /** 已花費的能量值 */
  private energySpend: number = 0;

  /** 當前可用能量值 */
  private get currentEnergy(): number {
    return this.totalEnergy - this.energySpend;
  }

  /** 圖片資料 */
  private imgData = {
    arrowIcon: ImgPath.flashShopArrowBaseUrl,
    goldIcon: ImgPath.flashShopGoldBaseUrl,
    atkIcon: ImgPath.atkIconBaseUrl,
    magicIcon: ImgPath.magicIconBaseUrl,
  };

  /** 文字資料 */
  private textData = {
    title: '能量轉換',
    timer: '倒數',
    equipHint: '點擊裝備轉換',
    refund: '退貨',
    gameStart: '開始遊戲',
    exchangeComplete: '轉換完成',
    turretAttack: '砲塔攻擊力',
    consumeMana: '消耗魔力',
    power: 'POWER',
    prompt: '點選道具金額進行購買',
    gameConditions: '過關條件',
  };

  /** 處理購買
   * @param itemData 轉換的道具
   * @param amount 轉換數量
   */
  private onBuyItem(itemData: ShopItemData, amount: number): void {
    // 計算商品數量金額
    const requireMoney = Math.floor(itemData.itemCost) * Math.floor(amount);

    // 金額不足
    if (requireMoney > this.currentEnergy) {
      Message.warn('您不夠能量轉換喔');
      return;
    }

    // 找到先前購買欄位 (找不到 = -1)
    const cartIndex = this.shoppingCart.findIndex((cartItem) => cartItem.itemId === itemData.gameItemData.itemId);

    // 防呆, 沒有可使用的購物車欄位
    if (cartIndex < 0 && this.shoppingCart.length === this.cartMax) {
      Message.warn('超過放置道具數量囉');
      return;
    }

    // 扣除購買金額
    this.energySpend += requireMoney;

    // 新購買
    if (cartIndex < 0) {
      this.shoppingCart.push(toShopCartItem(itemData, amount));
    }
    // 增加購買數量
    else {
      this.shoppingCart[cartIndex].itemValue += amount;
    }
  }

  /** 處理退貨
   * @param cartItem 退貨道具
   */
  private onRefundItem(cartItem: ShopCartItem): void {
    // 返還金額
    this.energySpend -= cartItem.itemCost;

    // 減少數量
    cartItem.itemValue -= 1;

    // 數量低於1, 從購物車移除
    if (cartItem.itemValue < 1) {
      const removeIndex = this.shoppingCart.findIndex((itemData) => itemData.itemId === cartItem.itemId);
      this.shoppingCart.splice(removeIndex, 1);
    }
  }

  /** 點擊確認 */
  private onClickConfirm(): void {
    // 至少要購買一個道具
    if (this.shoppingCart.length < 1) {
      Message.warn('至少要購買一個道具喔');
      return;
    }

    // 購買完成
    return this.onConfirmBuy();
  }

  /** 處理倒計時歸0時自動轉換最低金額道具 */
  @Emit('onTimeUp')
  private onTimeUp(): void {
    // 還沒有買到道具數量上限
    if (this.shoppingCart.length !== this.cartMax) {
      // 排序商品
      this.priceData.sort((itemA: ShopItemData, itemB: ShopItemData) => {
        if (itemA.itemCost === itemB.itemCost) {
          return 0;
        }
        return itemA.itemCost > itemB.itemCost ? 1 : -1;
      });

      // 檢查使用者是否有購買最便宜商品
      const cheapItem = this.priceData[0];
      const cheapIndex = this.shoppingCart.findIndex((itemData) => itemData.itemId === cheapItem.gameItemData.itemId);

      // 沒有購買最便宜的商品, 把商品加入購物車, 放在最前頭
      if (cheapIndex < 0) {
        this.shoppingCart.push(toShopCartItem(cheapItem, 0));
      }
    }

    // 按照價格排序(便宜最優先)
    this.shoppingCart.sort((itemA: ShopCartItem, itemB: ShopCartItem) => {
      if (itemA.itemCost === itemB.itemCost) {
        return 0;
      }
      return itemA.itemCost > itemB.itemCost ? 1 : -1;
    });

    // 把剩餘的錢都用在買最便宜的道具上
    const cheapestItem = this.shoppingCart[0];
    if (this.currentEnergy >= cheapestItem.itemCost) {
      cheapestItem.itemValue += Math.floor(this.currentEnergy / cheapestItem.itemCost);
    }
    // 若玩家沒有買最便宜的道具，且錢不夠買最便宜的道具, 移除便宜道具
    else if (cheapestItem.itemValue === 0) {
      this.shoppingCart.shift();
    }
  }

  /** 確定購買 */
  @Emit('onConfirmBuy')
  private onConfirmBuy(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog__wrapper {
  background-color: #ffffff30;
}
::v-deep .el-dialog {
  margin: 0px;
}
::v-deep .el-dialog__header {
  display: none;
}
::v-deep .el-dialog__body {
  padding: 0px;
  width: 100vw;
  height: 100%;
}
.scrollbar::-webkit-scrollbar {
  height: 21px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
