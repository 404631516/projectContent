<template>
  <el-dialog :visible.sync="isDialogVisible" append-to-body @open="onOpen">
    <!-- 標題 -->
    <div
      slot="title"
      font="bold"
      text="36px [#666666] center"
      p="b-4"
      border="b-3 solid [#C1C1C1]"
    >
      {{ textData.weapon }}
    </div>
    <!-- 生物兵器內容 -->
    <div v-if="weaponData" text="center 22px [#878787]">
      <div class="relative flex justify-center items-center" m="b-3">
        <img
          v-if="isWeaponLock"
          class="aspect-square w-20 object-contain absolute"
          :src="imgData.lockIcon"
        />
        <img
          class="aspect-square w-36 object-contain"
          :src="`${imgData.weaponBaseUrl + weaponData.url}`"
        />
      </div>
      {{ $t(`common.${weaponData.nameKey}`) }}
      <!-- 能力內容 -->
      <div class="grid grid-cols-2 w-4/5 <sm:w-full" m="x-auto t-3 b-5">
        <span class="flex items-center" text="20px [#5d5d5d]">
          <img
            class="w-8 aspect-square object-contain"
            m="r-1"
            :src="imgData.attack"
          />
          {{ textData.attack }}
          <span m="l-2" text="[#D69F05]">{{ weaponData.attack }}</span>
        </span>
        <span class="flex items-center" text="20px [#5d5d5d]">
          <img
            class="w-8 aspect-square object-contain"
            m="r-1"
            :src="imgData.magic"
          />
          {{ textData.magic }}
          <span m="l-2" text="[#00CCCE]">{{ weaponData.magic }}</span>
        </span>
        <span class="flex items-center" text="20px [#5d5d5d]">
          <img
            class="w-8 aspect-square object-contain"
            m="r-1"
            :src="imgData.attackSpeed"
          />
          {{ textData.attackSpeed }}
          <span m="l-2" text="[#D69F05]">{{
            `${weaponData.attackSpeed} ${textData.speedUnit}`
          }}</span>
        </span>
        <span class="flex items-center" text="20px [#5d5d5d]">
          <img
            class="w-8 aspect-square object-contain"
            m="r-1"
            :src="imgData.attackRange"
          />
          {{ textData.attackRange }}
          <span m="l-2" text="[#D69F05]">{{ weaponData.attackRange }}</span>
        </span>
      </div>
      <!-- 生物兵器敘述 -->
      <div class="rounded-[10px]" p="y-5" border="1px solid [#C7C7C7]">
        {{ $t(`common.${weaponData.contentKey}`) }}
      </div>
      <button
        class="rounded-[20px] w-64"
        text="[#613C0A] 24px"
        bg="[#FFDE39]"
        p="y-3 x-3"
        m="t-3"
        v-if="isBuyable(weaponData) && isWeaponLock"
        @click="onUnlockWeapon"
      >
        {{ textData.goUnlock }}
        <div
          class="rounded-[10px] flex items-center justify-center"
          p="y-2"
          m="t-2"
          text="20px [#FFF]"
          bg="[#00000080]"
        >
          <img
            class="w-5 aspect-square object-contain"
            m="r-1"
            :src="
              weaponData.crystalCost > 0 ? imgData.ballIcon : imgData.goldIcon
            "
          />
          {{
            weaponData.crystalCost > 0
              ? weaponData.crystalCost
              : weaponData.goldCost
          }}
        </div>
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, ModelSync, Emit } from 'vue-property-decorator';
import WeaponManager from '@/manager/WeaponManager';
import { WeaponTableData } from '@/helper/interface/Weapon';
import imgPath from '@/config/imgPath/imgPath';

@Component({
  components: {},
})
export default class WeaponInfoDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 打開哪個生物兵器介紹 */
  @Prop(Number) private weaponId!: number;
  /** 是否解鎖的生物兵器 */
  @Prop(Boolean) private isWeaponLock!: boolean;

  /** 生物兵器資料 */
  private weaponData: WeaponTableData | null | undefined = null;

  /** 文字資料 */
  private textData = {
    weapon: '生物兵器',
    attack: '攻擊力',
    magic: '魔力',
    attackSpeed: '攻擊速度',
    attackRange: '攻擊距離',
    speedUnit: '次/s',
    goUnlock: '進行解鎖',
  };

  /** 圖片資料 */
  private imgData = {
    weaponBaseUrl: imgPath.weaponBaseUrl,
    attack: imgPath.atkIconBaseUrl,
    magic: imgPath.magicIconBaseUrl,
    attackSpeed: imgPath.attackSpeed,
    attackRange: imgPath.attackRange,
    ballIcon: imgPath.ballIconBaseUrl,
    goldIcon: imgPath.goldIconBaseUrl,
    lockIcon: imgPath.lockIcon,
  };

  /** 開啟彈窗找到生物兵器 */
  onOpen() {
    this.weaponData = WeaponManager.getWeaponTableData(this.weaponId);
  }

  /** 是否可用購買取得
   * @param weaponData
   */
  private isBuyable(weaponData: WeaponTableData): boolean {
    return WeaponManager.isWeaponBuyable(weaponData);
  }

  /** 解鎖生物兵器 */
  @Emit('onUnlockWeapon')
  private onUnlockWeapon(): void {
    return;
  }
}
</script>
<style scoped>
>>> .el-dialog {
  max-width: 540px;
  width: 95%;
  border-radius: 30px;
}
>>> .el-dialog__body {
  padding: 0px 20px 20px 20px;
}
>>> .el-dialog__header {
  padding: 20px 20px 0px;
}
>>> .el-icon-close:before {
  font-size: 32px;
  color: #bfbfbf;
  font-weight: 700;
}
</style>
