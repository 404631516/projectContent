<template>
  <div>
    <!-- 使用者目前裝備的生物兵器 -->
    <div p="y-1" bg="[#f3edd5] bottom no-repeat" :style="{ backgroundImage: `url(${imgData.bgDot})` }">
      <p m="y-2" text="24px [#D69F05]">{{ textData.equipmentList }}</p>
      <div
        class="grid grid-cols-[repeat(4,112px)] <sm:grid-cols-[repeat(3,112px)] grid-rows-[repeat(2,150px)] <sm:grid-rows-[repeat(3,150px)] gap-2 justify-center"
      >
        <div v-for="weaponId in userInfo.queueWeaponIds" :key="weaponId">
          <TheWeapon
            class="w-28 h-28"
            :weaponId="weaponId"
            @click.native="
              isWeaponInfoDialog = true;
              currentClickWeaponId = weaponId;
            "
          />
          <button
            class="rounded-[20px] w-28 shadow-default"
            text="16px [#FFF]"
            font="bold"
            m="t-1"
            p="y-1"
            bg="[#DA3752CC]"
            border="1px solid [#FFF]"
            @click="onClickRemoveWeapon(weaponId)"
          >
            {{ textData.remove }}
          </button>
        </div>
        <TheWeapon class="w-28 h-28" v-for="emptyArrNum in notEquipmentNum" :key="`${emptyArrNum}*`" />
      </div>
    </div>
    <div class="w-2/3 <sm:w-[90%]" m="x-auto t-2">
      <!-- 獲得金幣或晶球方法 -->
      <button
        class="flex items-center shadow-default rounded-[80px]"
        border="2px solid [#FFF]"
        bg="[#000]"
        text="[#FFF] 20px"
        p="2"
        @click="onOpenWeaponHintDialog"
      >
        <img class="w-27px aspect-square object-contain" :src="imgData.questionMark" />{{ textData.crystalHint }}
      </button>
      <!-- 使用者目前有的金幣或晶球 -->
      <div class="flex grid grid-cols-[160px,160px,1fr] <sm:grid-cols-2 gap-3" m="t-2 l-3">
        <span
          class="grid grid-cols-[28px,28px,65px] gap-x-1 items-center rounded-[5px]"
          p="x-3 y-2"
          bg="[#00000080]"
          text="20px [#FFF]"
        >
          <img :src="imgData.ballIcon" /><span text="14px [#2CEAEC]">{{ textData.crystalName }}</span
          >{{ userInfo.crystalCoin }}
        </span>
        <span
          class="grid grid-cols-[28px,28px,65px] gap-x-2 items-center rounded-[5px]"
          p="x-3 y-2"
          bg="[#00000080]"
          text="20px [#FFF]"
        >
          <img :src="imgData.goldIcon" /><span text="14px [#FFDD00]">{{ textData.goldName }}</span
          >{{ userInfo.goldCoin }}
        </span>
        <span
          class="grid grid-cols-[28px,90px,28px,90px] <sm:col-span-full items-center rounded-[10px] justify-center items-center"
          text="18px [#A5A5A5]"
          border="1px solid [#3A3A3A59]"
          m="l-2"
        >
          <img :src="imgData.atkIcon" m="l-2" /><span class="text-center">{{ textData.atkHint }}</span>
          <img :src="imgData.magicIcon" m="l-7px" /><span class="text-left">{{ textData.magicHint }}</span>
        </span>
      </div>
      <!-- 所有生物兵器 -->
      <div
        class="grid grid-cols-[repeat(5,112px)] <sm:grid-cols-[repeat(3,112px)] grid-rows-2 gap-2 justify-center"
        m="t-5 b-2"
      >
        <div v-for="weaponData in sliceWeaponList[weaponListPage - 1]" :key="weaponData.id">
          <span text="[#A5A5A5] 15px">{{ $t(`common.${weaponData.nameKey}`) }}</span>
          <div
            class="relative cursor-pointer"
            m="t-1 b-2"
            @click="
              isWeaponInfoDialog = true;
              currentClickWeaponId = weaponData.id;
            "
          >
            <TheWeapon class="w-28 h-28" :weaponId="weaponData.id" />
            <div
              v-if="isWeaponLock(weaponData.id)"
              class="absolute aspect-square w-full top-0 left-0 rounded-[20px] flex justify-center items-center"
              p="x-2"
              text="22px [#2CEAEC]"
              bg="[#000] opacity-60"
            >
              {{ limitInfo(weaponData) }}
            </div>
          </div>
          <div
            v-if="isWeaponLock(weaponData.id)"
            class="grid items-center rounded-[10px]"
            bg="[#00000080]"
            text="[#FFF] 20px"
            p="y-1"
            :class="isBuyable(weaponData) ? 'grid-cols-[0.5fr,1fr,0.5fr]' : 'grid-cols-1'"
          >
            <img
              v-if="isBuyable(weaponData)"
              class="justify-self-end object-contain aspect-square w-3/5"
              :src="weaponData.crystalCost > 0 ? imgData.ballIcon : imgData.goldIcon"
            />
            {{
              !isBuyable(weaponData)
                ? textData.notForSele
                : weaponData.crystalCost > 0
                ? weaponData.crystalCost
                : weaponData.goldCost
            }}
          </div>
          <button
            v-else
            class="rounded-[30px] w-full"
            p="y-1"
            text="[#FFF] 20px"
            :class="
              isWeaponEquipped(weaponData)
                ? 'bg-[#D59434CC] cursor-default'
                : 'shadow-default bg-[#47D800D9] border-2 border-solid border-[#FFF]'
            "
            :disabled="isWeaponEquipped(weaponData)"
            @click="onClickEquipWeapon(weaponData)"
          >
            {{ isWeaponEquipped(weaponData) ? textData.inEquipment : textData.equipment }}
          </button>
        </div>
      </div>
      <!-- 換頁元件 -->
      <el-pagination
        layout="prev, pager, next"
        :total="allWeaponListCount"
        :page-size="weaponPerPage"
        @current-change="handleCurrentChange"
      />
      <!-- 卸下所有裝備按鈕和確定裝備按鈕 -->
      <div
        class="grid grid-cols-[repeat(2,200px)] <sm:grid-cols-[repeat(2,180px)] justify-center gap-x-4"
        m="t-2"
        text="[#FFF] 20px"
      >
        <button class="shadow-default rounded-[20px] blueGradient" p="y-2" font="bold" @click="onClickResetWeapon">
          {{ textData.removeAllText }}
        </button>
        <button class="shadow-default rounded-[20px] yellowGradient" p="y-2" font="bold" @click="onClickConfirmChange">
          {{ textData.confirmTitle }}
        </button>
      </div>
    </div>
    <!-- 生物兵器詳細內容 -->
    <WeaponInfoDialog
      v-model="isWeaponInfoDialog"
      :weaponId="currentClickWeaponId"
      :isWeaponLock="isWeaponLock(currentClickWeaponId)"
      @onUnlockWeapon="onClickUnlockWeapon(currentClickWeaponId)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import TheWeapon from '@/components/Public/TheWeapon.vue';
import { PlanetUserInfoData } from '@/helper/interface/PlanetWar';
import imgPath from '@/config/imgPath/imgPath';
import WeaponManager from '@/manager/WeaponManager';
import { WeaponTableData } from '@/helper/interface/Weapon';
import { Message } from '@/helper/class/Common';
import WeaponInfoDialog from '@/components/PlanetWar/WeaponInfoDialog.vue';
import { ResponseState, ResponseWeaponState } from '@/helper/enum/Common';
import { planetWarUnlockWeaponAPI } from '@/api/planetWar';
@Component({
  components: {
    TheWeapon,
    WeaponInfoDialog,
  },
})
export default class WeaponDialogContent extends Vue {
  /**使用者星球大戰資訊 */
  @Prop() private userInfo!: PlanetUserInfoData;
  /**所有生物兵器拆成10個一份 */
  private sliceWeaponList: WeaponTableData[][] = [];
  /**所有生物兵器總數 */
  private allWeaponListCount: number = 0;
  /**目前點到那個生物兵器 */
  private currentClickWeaponId: number = 0;
  /**目前在哪一頁 */
  private weaponListPage: number = 1;
  /**生物兵器詳細彈窗 */
  private isWeaponInfoDialog: boolean = false;

  private readonly weaponPerPage: number = window.innerWidth < 435 ? 6 : 10;

  /** 文字資料 */
  private textData = {
    equipmentList: '裝備列表',
    remove: '卸下',
    crystalHint: '獲得金幣或晶球的方法',
    crystalName: '晶球',
    goldName: '金幣',
    atkHint: '砲塔攻擊力',
    magicHint: '消耗魔力',
    removeAllText: '卸下所有裝備',
    confirmTitle: '確定裝備',
    equipment: '裝備',
    inEquipment: '裝備中',
    notForSele: '未發售',
    crystalCost: '消耗晶球',
    goldCost: '消耗金幣',
    unlockTitle: '解鎖',
  };

  /** 圖片資料 */
  private imgData = {
    bgDot: imgPath.bgDot,
    /** 晶球icon  */
    ballIcon: imgPath.ballIconBaseUrl,
    /** 金幣icon */
    goldIcon: imgPath.goldIconBaseUrl,
    /** 攻擊力icon */
    atkIcon: imgPath.atkIconBaseUrl,
    /** 魔力icon */
    magicIcon: imgPath.magicIconBaseUrl,
    /** 問號icon */
    questionMark: imgPath.blueQuestionMark,
  };

  /** 計算有幾個空的 */
  private get notEquipmentNum(): number {
    return WeaponManager.weaponItemMax - this.userInfo.queueWeaponIds.length;
  }

  created() {
    // 取得所有生物兵器
    const allWeapon = WeaponManager.getWeaponTableList();
    // 設定生物兵器總長
    this.allWeaponListCount = allWeapon.length;
    // 切分頁
    this.sliceWeaponList = (() => {
      const result = [];
      while (allWeapon.length > 0) {
        result.push(allWeapon.splice(0, this.weaponPerPage));
      }
      return result;
    })();
  }

  /**顯示在生物兵器上狀態
   * @param weaponData
   */
  private limitInfo(weaponData: WeaponTableData): string {
    // 未解鎖
    if (!this.isBuyable(weaponData)) {
      return this.textData.notForSele;
    }

    if (weaponData.goldCost > 0) {
      return this.textData.goldCost + this.textData.unlockTitle;
    } else {
      return this.textData.crystalCost + this.textData.unlockTitle;
    }
  }

  /** 生物兵器是否未解鎖
   * @param weaponId
   */
  private isWeaponLock(weaponId: number): boolean {
    return this.userInfo.weaponIds.includes(weaponId) === false;
  }

  /** 生物兵器是否裝備中
   * @param weaponData
   */
  private isWeaponEquipped(weaponData: WeaponTableData): boolean {
    return this.userInfo.queueWeaponIds.includes(weaponData.id);
  }

  /** 是否可用購買取得
   * @param weaponData
   */
  private isBuyable(weaponData: WeaponTableData): boolean {
    return WeaponManager.isWeaponBuyable(weaponData);
  }

  /**換頁
   * @param page 頁數
   */
  private handleCurrentChange(page: number): void {
    this.weaponListPage = page;
  }

  /** 點擊裝備生物兵器
   * @param weaponData
   */
  private onClickEquipWeapon(weaponData: WeaponTableData): void {
    // 滿裝防呆
    if (this.userInfo.queueWeaponIds.length === WeaponManager.weaponItemMax) {
      Message.warn('超過放置數量');
      return;
    }

    // 加入裝備清單
    this.userInfo.queueWeaponIds.push(weaponData.id);
  }

  /** 卸下生物兵器
   * @param weaponId
   */
  private onClickRemoveWeapon(weaponId: number): void {
    // 找到要卸下的生物兵器
    const removeIndex = this.userInfo.queueWeaponIds.findIndex((equipWeaponId) => equipWeaponId === weaponId);

    // 防呆
    if (removeIndex < -1) {
      console.error(`無法卸下生物兵器${weaponId}, 不存在於裝備列表中: ${this.userInfo.queueWeaponIds}`);
    }

    // 從裝備列表中卸下
    this.userInfo.queueWeaponIds.splice(removeIndex, 1);
  }

  /** 重置生物兵器 */
  private onClickResetWeapon(): void {
    this.userInfo.queueWeaponIds = [];
    Message.info('已卸下所有裝備');
  }

  /** 點擊解鎖生物兵器
   * @param weaponId
   */
  private onClickUnlockWeapon(weaponId: number): void {
    const weaponData = WeaponManager.getWeaponTableData(weaponId);
    if (weaponData == null) {
      Message.error(`沒有生物兵器資料,WeaponID = ${weaponId}`);
      return;
    }

    // 檢查晶球是否足夠
    if (weaponData.crystalCost > this.userInfo.crystalCoin) {
      Message.warn('水晶不足');
      return;
    }

    // 檢查金幣是否足夠
    if (weaponData.goldCost > this.userInfo.goldCoin) {
      Message.warn('金幣不足');
      return;
    }

    // 檢查前一級是否解鎖
    if (this.isWeaponLock(weaponData.unlockId)) {
      Message.warn('此生物兵器前一個等級未解鎖');
      return;
    }

    // 判斷有晶球跟金幣才可解鎖
    this.$confirm(`確認解鎖  ${this.$t(`common.${weaponData.nameKey}`)}?`, '提示', {
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      type: 'warning',
    })
      // 確認解鎖
      .then(() => {
        this.onUnlockWeapon(weaponId);
        this.isWeaponInfoDialog = false;
      })
      // 取消解鎖
      .catch(() => {
        Message.info('已取消解鎖');
      });
  }

  /** 點擊解鎖生物兵器
   * @param weaponId
   */
  private async onUnlockWeapon(weaponId: number): Promise<void> {
    try {
      // API 解鎖
      const response: any = await planetWarUnlockWeaponAPI.post({
        weaponId,
      });
      if (response.result !== ResponseState.Success) {
        // 拋錯誤訊息
        this.onWeaponAPIError(response.result, response.resMessage);
      }
      this.userInfo.crystalCoin = response.crystalCoin;
      this.userInfo.goldCoin = response.goldCoin;
      // 更新生物兵器背包
      this.userInfo.weaponIds = response.weaponIds;

      // 顯示解鎖成功
      Message.success('解鎖成功');
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 生物兵器API錯誤
   * @param result
   * @param message
   */
  private onWeaponAPIError(result: ResponseWeaponState, message: string): void {
    switch (result) {
      case ResponseWeaponState.WeaponNotOwn:
        throw new Error('非此用戶持有生物兵器');
      case ResponseWeaponState.WeaponIsNull:
        throw new Error('此生物兵器不存在');
      case ResponseWeaponState.WeaponUpgradeError:
        throw new Error('此生物兵器前一個等級未解鎖');
      case ResponseWeaponState.WeaponUnlock:
        throw new Error('此生物兵器不可解鎖');
      case ResponseWeaponState.GoldNotBuy:
        throw new Error('金幣不足');
      case ResponseWeaponState.CrystalNotBuy:
        throw new Error('水晶不足');
      default:
        throw new Error(`result: ${result} resMessage: ${message}`);
    }
  }

  /** 打開獲得金球或晶球的方法 */
  @Emit('onOpenWeaponHintDialog')
  private onOpenWeaponHintDialog(): void {
    return;
  }

  /**確定裝備 */
  @Emit('onClickConfirmChange')
  private onClickConfirmChange(): void {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-pager li.active {
  color: #d69f05;
}
::v-deep .el-pager li {
  min-width: 29px;
}
::v-deep .el-dialog__body {
  padding-top: 0px !important;
}
</style>
