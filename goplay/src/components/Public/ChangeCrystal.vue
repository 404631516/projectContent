<template>
  <el-dialog :visible.sync="isDialogVisible" @open="onOpen" destroy-on-close>
    <!-- 標題 -->
    <div slot="title">
      <h1 font="bold" text="4xl [#666666]">{{ textData.title }}</h1>
    </div>
    <div>
      <!-- 介紹 -->
      <div
        class="grid grid-cols-[112px,1fr] items-center rounded-[10px]"
        text="left xl <sm:base"
        border="1 solid [#A5A5A5]"
      >
        <img
          class="w-28 object-contain transform rotate-y-180"
          :src="imgData.hero"
        />
        <div>
          <span text="[#FDC221]">{{ textData.oneCoin }}</span
          ><span>{{ textData.canChange }}</span
          ><span text="[#00CCCE]">{{ textData.oneCrystal }}</span>
          <span>{{ textData.oh }}</span>
          <div>{{ textData.info }}</div>
        </div>
      </div>
      <!-- 兌換區 -->
      <div class="rounded-2xl" m="x-auto t-5" border="1 solid [#A5A5A5]">
        <div
          class="w-11/12 font-bold"
          m="x-auto"
          p="y-5"
          text="2xl [#666666]"
          border="b-2 solid [#C4C4C4]"
        >
          {{ textData.nowOwnCoin
          }}<span m="l-2" text="[#FDC221]">{{ userCoinNum }}</span>
        </div>
        <div m="t-3" text="[#878787] 2xl">
          {{ textData.enterChangeCoinNumber }}
        </div>
        <div class="h-8" text="[#FF7BA4] xl">
          {{ isCoinEnough ? '' : textData.noEnough }}
        </div>
        <div>
          <button
            @click="minChange"
            class="rounded-3xl shadow-default"
            p="x-2 y-1"
            bg="[#2BB8F4]"
            text="[#FFF] 2xl"
          >
            {{ textData.min }}
          </button>
          <input
            class="w-1/3 h-12 rounded"
            m="x-2"
            border="2 solid [#A5A5A5]"
            text=" center 2xl"
            type="number"
            v-model.number="changeCoin"
            placeholder="0"
          />
          <button
            @click="maxChange"
            class="rounded-3xl shadow-default"
            p="x-2 y-1"
            bg="[#2BB8F4]"
            text="[#FFF] 2xl"
          >
            {{ textData.max }}
          </button>
        </div>
        <div
          class="w-1/2 <sm:w-2/3 flex justify-evenly items-center"
          m="x-auto y-3"
          font="bold"
          text="2xl <sm:xl [#878787]"
        >
          <img class="w-9 object-contain" :src="imgData.crystal" />
          {{ textData.expectToGetCrystals }}
          <span text="[#00CCCE]">{{ crystalNum }}</span>
        </div>
        <!-- 確認兌換按鈕 -->
        <button
          @click="confirmChange"
          :class="
            isCoinEnough ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
          "
          class="w-11/12 rounded-2xl yellowGradient shadow-default"
          p="y-5"
          m="b-5"
          text="[#FFF] 3xl"
        >
          {{ textData.goChange }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Emit, ModelSync } from 'vue-property-decorator';
import { planetWarAdleduTradeAPI } from '@/api/planetWar';
import imgPath from '@/config/imgPath/imgPath';
import { Message } from '@/helper/class/Common'; // 訊息框
import { ResponseState } from '@/helper/enum/Common';
@Component({})
export default class ChangeCrystal extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 要兌換的金幣數 */
  private changeCoin: number | null = null;
  /** 使用者金幣數 */
  private userCoinNum: number = 0;
  /** 多少代幣換多少晶球倍率 */
  private rate: number = 1;
  /** 文字資料 */
  private textData = {
    title: '因材網代幣兌換',
    oneCoin: '1因材網代幣',
    canChange: '可以換成',
    noEnough: '餘額不足無法兌換',
    oneCrystal: '1晶球',
    oh: '哦!',
    info: '可以按全部也可以自己輸入想要兌換的數量!',
    nowOwnCoin: '目前擁有代幣',
    enterChangeCoinNumber: '請輸入想兌換的數量',
    min: 'Min',
    max: 'Max',
    expectToGetCrystals: '預計獲得晶球',
    goChange: '進行兌換',
  };
  /** 圖片資料 */
  private imgData = {
    hero: imgPath.fourHeroBaseUrl,
    crystal: imgPath.crystalBaseUrl,
  };
  /** 是否足夠兌換 */
  private get isCoinEnough(): boolean {
    if (this.changeCoin !== null) {
      if (this.userCoinNum >= this.changeCoin) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  /**  計算預計能換得晶球 */
  private get crystalNum(): number {
    if (this.changeCoin === null) {
      return 0;
    }
    return Math.floor(this.changeCoin * this.rate);
  }
  /** 最小兌換 */
  private minChange(): void {
    this.changeCoin = null;
  }
  /** 最大兌換 */
  private maxChange(): void {
    this.changeCoin = this.userCoinNum;
  }

  onOpen() {
    this.getPlanetWarAdleduTrade();
  }
  /** 兌換前判斷 */
  private confirmChange(): void {
    if (
      this.isCoinEnough &&
      this.changeCoin !== 0 &&
      this.changeCoin !== null
    ) {
      this.postPlanetWarAdleduTrade();
    }
  }
  /** 取得目前使用者金幣跟目前兌換比率 */
  private async getPlanetWarAdleduTrade() {
    try {
      // API 取得代幣兌換晶球比率
      const response: any = await planetWarAdleduTradeAPI.fetch({});
      if (response.result === ResponseState.Success) {
        this.userCoinNum = response.adlEduCoin;
        this.rate = response.adlEduRate;
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 使用者想換多少代幣給後端，回傳換到多少晶球 */
  private async postPlanetWarAdleduTrade() {
    try {
      // API 代幣兌換晶球
      const response: any = await planetWarAdleduTradeAPI.post({
        tradeAdlEduCoin: this.changeCoin,
      });
      if (response.result === ResponseState.Success) {
        this.passAddCrystal(response.addCrystal);
        this.closeDialog();
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 兌換的數量傳出去
   * @param crystalNum
   */
  @Emit('passAddCrystal')
  private passAddCrystal(crystalNum: number): number {
    return crystalNum;
  }

  /** 關掉彈窗 */
  @Emit('closeDialog')
  private closeDialog(): void {
    return;
  }
}
</script>

<style scoped>
>>> .el-dialog {
  max-width: 600px;
  width: 95%;
  border-radius: 30px;
}
>>> .el-dialog__close::before {
  font-size: 30px;
  font-weight: 700;
}
>>> .el-dialog__body {
  padding: 0px 20px 30px 20px;
}
</style>
