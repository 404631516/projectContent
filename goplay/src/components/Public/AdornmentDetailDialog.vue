<template>
  <el-dialog :visible.sync="isDialogVisible" @open="tradeNum = 1">
    <!-- 彈窗標題 -->
    <template #title>
      {{ isStore ? (isBuy ? textData['gou-mai'] : textData['fan-mai']) : textData['xiang-xi-zi-xun'] }}
    </template>
    <!-- 家具資料 -->
    <div text="[#5D5D5D]">
      <!-- 家具圖片跟背包占格 -->
      <div class="grid grid-cols-[0.6fr,1fr,0.6fr] gap-x-2" m="b-2">
        <!-- 家具圖片 -->
        <img
          class="col-start-2 h-18 w-full object-contain"
          :src="`${Config.imgUrl}/img/h5/adornment/adornmentItem/${adornmentData.url}.png`"
        />
        <!-- 背包占格 -->
        <span class="h-5 grid grid-cols-[0.3fr,1fr] items-center rounded-16px" p="x-2" text="[#FFF]" bg="[#00000080]">
          <img :src="imgData.backpack" />
          {{ adornmentData.backpackNum ? adornmentData.backpackNum : 0 }}
        </span>
      </div>
      <!-- 家具名稱 -->
      <span font="bold" text="1.2rem">{{
        adornmentData.nameKey ? this.$t(`common.${adornmentData.nameKey}`) : ''
      }}</span>
      <!-- 家具尺寸和裝飾分 -->
      <div class="w-1/2 grid grid-cols-[0.3fr,1fr,0.8fr] grid-rows-2 items-center gap-1" m="x-auto y-4">
        <!-- 裝飾分 -->
        <img class="object-contain h-full" :src="imgData.redBowTie" />
        <span font="bold">{{ textData['zhuang-shi-fen'] }}</span>
        <span text="[#1FCC86]">{{ adornmentData.adornmentScore }}</span>
        <!-- 尺寸 -->
        <template v-if="showAdornmentSize(adornmentData)">
          <img class="object-contain h-full" :src="imgData.size" />
          <span font="bold">{{ textData['chi-cun'] }}</span>
          <span>{{ `${adornmentData.itemHeight}X${adornmentData.itemWidth}` }}</span>
        </template>
      </div>
      <!-- 家具敘述 -->
      <div class="rounded-12px" p="2" text="left" border="1px solid [#9D9D9D]">
        {{ adornmentData.contentKey ? this.$t(`common.${adornmentData.contentKey}`) : '' }}
      </div>
      <!-- 數量按鈕 -->
      <div
        v-if="isStore && isTrade"
        class="grid grid-cols-[0.3fr,1fr,0.3fr] w-3/5 gap-2 items-center justify-items-center"
        m="x-auto y-2"
      >
        <span class="col-start-2">{{ textData['shu-liang'] }}</span>
        <img class="col-start-1 cursor-pointer" :src="imgData.minus" @click="onDecrementTradeNum" /><span
          class="w-full rounded-12px"
          border="1px solid [#9D9D9D]"
          >{{ tradeNum }}</span
        ><img class="cursor-pointer" :src="imgData.plus" @click="onIncrementTradeNum" />
      </div>
      <!-- 購買跟販售按鈕 -->
      <button
        v-if="isStore && isTrade"
        class="w-1/2 rounded-12px grid grid-rows-2 font-bold"
        m="x-auto"
        p="x-4 y-2"
        bg="[#FFDE39]"
        @click="onTradeAdornment"
      >
        {{ isBuy ? textData['jin-hang-gou-mai'] : textData['fan-mai-zong-jia-ge'] }}
        <div class="h-1.5rem flex justify-center items-center" text="[#FFF]" bg="[#00000080]">
          <img
            class="h-9/10 object-contain"
            m="r-2"
            :src="adornmentData.crystalCost > 0 ? imgData.crystal : imgData.gold"
            alt=""
          />
          {{ getAdornmentPrice(adornmentData, isBuy, tradeNum) }}
        </div>
      </button>
      <!-- 前往佈置 -->
      <button
        v-if="isStore === false"
        class="yellowGradient rounded-60px shadow-default"
        m="y-3"
        p="x-6 y-2"
        text="[#FFF] xl"
        @click="onSetAdornment"
      >
        {{ textData['qian-wang-bu-zhi'] }}
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Vue, ModelSync, Component, Prop, Emit } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import { getAdornmentPrice, showAdornmentSize, isBuyable } from '@/helper/fnc/common';
import { AdornmentListData } from '@/helper/interface/Adornment';
import { ItemType } from '@/helper/enum/AnswerGame';
import Config from '@/config/setting';
import UIHelper from '@/views/H5/Helper/UIHelper';

@Component({})
export default class AdornmentDetailDialog extends Vue {
  /**此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 是否從商店進入 */
  @Prop({ default: false }) readonly isStore!: boolean;
  /** 現在開啟確認彈窗家具內容 */
  @Prop(Object) readonly adornmentData!: AdornmentListData;
  /** 現在購買還是販賣狀態 */
  @Prop({ default: true }) readonly isBuy!: boolean;

  private Config = Config;
  /** 交易數量 */
  private tradeNum: number = 1;

  /** 文字資料 */
  private textData = {
    'gou-mai': '購買',
    'fan-mai': '販賣',
    'zhuang-shi-fen': '裝飾分',
    'chi-cun': '尺寸',
    'shu-liang': '數量',
    'jin-hang-gou-mai': '進行購買',
    'fan-mai-zong-jia-ge': '販賣總價格',
    'xiang-xi-zi-xun': '詳細資訊',
    'qian-wang-bu-zhi': '前往佈置',
  };

  /** 圖片資料 */
  private imgData = {
    backpack: ImgPath.backpack,
    redBowTie: ImgPath.redBowTie,
    size: ImgPath.sizeIcon,
    plus: ImgPath.plus,
    minus: ImgPath.minus,
    crystal: ImgPath.crystalBaseUrl,
    gold: ImgPath.goldBaseUrl,
  };

  /** 計算價錢 */
  private getAdornmentPrice = getAdornmentPrice;
  /** 判斷是否顯示裝飾物尺寸 */
  private showAdornmentSize = showAdornmentSize;

  /** 使用者晶球數 */
  private get crystalNum(): number {
    return this.$$store.state.PlanetWarModule.crystalCoin;
  }

  /** 使用者金幣數 */
  private get goldNum(): number {
    return this.$$store.state.PlanetWarModule.goldCoin;
  }

  /** 是否可交易 */
  private get isTrade(): boolean {
    return isBuyable(this.adornmentData);
  }

  /** 增加交易數量 */
  private onIncrementTradeNum(): void {
    this.tradeNum++;
  }

  /** 減少交易數量 */
  private onDecrementTradeNum(): void {
    if (this.tradeNum === 1) {
      return;
    }
    this.tradeNum--;
  }

  /** 交易流程
   * @Param {boolean} isTradeCrystal
   */
  private async onTradeAdornment(): Promise<void> {
    const tradeStr = this.adornmentData.crystalCost > 0 ? '晶球' : '金幣';
    const tradeMoney = getAdornmentPrice(this.adornmentData, this.isBuy, this.tradeNum);
    const tradeData = {
      itemUid: this.adornmentData.itemUid ?? 0,
      itemId: this.adornmentData.id,
      itemType: ItemType.AdornmentItem,
      useNum: this.tradeNum,
    };

    try {
      if (this.isBuy) {
        if (await this.onConfirmBuy(tradeMoney, tradeStr)) {
          await this.$$store.dispatch('buyAdornmentStoreItem', tradeData);
          this.$alert('購買成功!', '成功');
          this.isDialogVisible = false;
        }
      } else {
        if (await this.onConfirmSell(tradeMoney, tradeStr)) {
          await this.$$store.dispatch('sellAdornmentStoreItem', tradeData);
          this.$alert('販賣成功!', '成功');
          this.isDialogVisible = false;
        }
      }
    } catch (e) {
      this.$alert(`${e}`, '錯誤');
    }
  }

  /** 購買流程
   * @param tradeMoney 交易金額
   * @param tradeStr 晶球或金幣字串
   */
  private async onConfirmBuy(tradeMoney: number, tradeStr: string): Promise<boolean> {
    const h = this.$createElement;
    if (tradeMoney > (this.adornmentData.crystalCost > 0 ? this.crystalNum : this.goldNum)) {
      this.$alert(`${tradeStr}不足`, '提示');
      return false;
    }
    return await this.$msgbox({
      title: '商品購買',
      message: h('p', { style: 'color: #A5A5A5' }, [
        h('span', {}, '花費'),
        h('span', { style: 'color: #FDC221' }, `${tradeMoney}`),
        h('span', {}, `${tradeStr}購買`),
        h('span', { style: 'color: #00CCCE' }, `${this.tradeNum}個${this.$t(`common.${this.adornmentData.nameKey}`)}`),
        h('span', {}, '?'),
      ]),
      showCancelButton: true,
      cancelButtonText: '取消',
    })
      .then(() => {
        return true;
      })
      .catch((e) => {
        return false;
      });
  }

  /** 販賣流程
   * @param tradeStr 晶球或金幣字串
   * @param tradeData 交易資料
   */
  private async onConfirmSell(tradeMoney: number, tradeStr: string): Promise<boolean> {
    const h = this.$createElement;
    if (this.tradeNum > (this.adornmentData.backpackNum ?? 0)) {
      this.$alert(`背包沒有足夠數量`, '提示');
      return false;
    }
    return await this.$msgbox({
      title: '商品販賣',
      message: h('p', { style: 'color: #A5A5A5' }, [
        h('div', {}, [
          h('span', {}, '販賣'),
          h(
            'span',
            { style: 'color: #00CCCE' },
            `${this.tradeNum}個${this.$t(`common.${this.adornmentData.nameKey}`)},`
          ),
        ]),
        h('div', {}, [
          h('span', {}, '將獲得'),
          h('span', { style: 'color: #FDC221' }, `${tradeMoney}`),
          h('span', {}, `${tradeStr}?`),
        ]),
        h('div', { style: 'color: #FF5656' }, [
          h('span', { style: 'vertical-align: top' }, '*'),
          h('span', {}, '售出的價格是買價的1/2'),
        ]),
      ]),
      showCancelButton: true,
      cancelButtonText: '取消',
    })
      .then(() => {
        return true;
      })
      .catch((e) => {
        return false;
      });
  }

  /** 前往布置 */
  @Emit('onSetAdornment')
  private onSetAdornment() {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 21rem;
  width: 95%;
  border-radius: 12px;
}
::v-deep .el-dialog__header {
  width: 90%;
  margin: 0px auto;
  font-weight: 900;
  font-size: 24px;
  border-bottom: 1px solid #000;
}
::v-deep .el-dialog__body {
  padding: 8px 20px;
}
::v-deep .el-dialog__headerbtn {
  top: 24px;
}
::v-deep .el-dialog__close {
  font-weight: 900;
  font-size: 24px;
}
</style>
