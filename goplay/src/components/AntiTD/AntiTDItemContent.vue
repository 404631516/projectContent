<template>
  <el-dialog :visible.sync="isDialogVisible" :modal-append-to-body="false" :append-to-body="true">
    <!-- 標題 -->
    <div slot="title" border="b-1px solid [#C7C7C7]" font="bold" p="y-15px" text="4xl [#B965C9] center">
      {{ textData.title }}
    </div>
    <!-- 英雄道具資訊 -->
    <div class="h-full overflow-auto scrollbar">
      <div class="flex justify-center items-center flex-col">
        <!-- 道具圖片 -->
        <AntiTDItemComponent
          class="w-114px h-114px"
          :itemId="itemId"
          :isNameVisible="false"
          :isTypeVisible="false"
          :isEquipLocked="false"
          :isHighlight="false"
        />
        <!-- 道具名稱 -->
        <div m="t-1" text="24px [#FDC221]">
          {{ textData.levelText }}{{ itemData.itemLevel }}
          <span text="26px [#878787]">{{ itemName }}</span>
        </div>
        <!-- 數值資料 -->
        <div class="grid grid-rows-4 flex justify-center w-[85%] gap-3 <sm:w-full" m="x-auto t-14.5px" text="20px ">
          <!-- 冷卻時間 -->
          <div class="flex items-end justify-center">
            <img class="object-contain" m="r-1" :src="imgData.atkIcon" />
            {{ textData.cooldownText }}
            <span m="l-2" text="[#D69F05]">{{ itemData.cooldown }}{{ textData.secondText }}</span>
          </div>
          <!-- 消耗魔力 -->
          <div class="flex items-end justify-center">
            <img class="object-contain" m="r-1" :src="imgData.magicIcon" />
            {{ textData.magicText }}
            <span m="l-2" text="[#00CCCE]">{{ itemData.magic }}</span>
          </div>
          <!-- 效果距離 -->
          <div class="flex items-end justify-center">
            <img class="object-contain" m="r-1" :src="imgData.effectRangeIcon" />
            {{ textData.rangeText }}
            <span m="l-2" text="[#00CCCE]">{{ itemData.range }}</span>
          </div>
          <!-- 效果 -->
          <div class="flex items-end justify-center">
            <img class="object-contain" m="r-1" :src="imgData.effectIcon" />
            {{ textData.effectText }}
            <span m="l-2" text="[#D69F05]">{{ itemEffect }}</span>
          </div>
        </div>
        <!-- 內容格 -->
        <div class="w-[90%]" border="rounded-10px 1px solid [#C7C7C7]" p="x-15px" text="left [#000]" m="t-31.5px">
          <!-- 道具類型-->
          <div
            class="grid grid-cols-[120px,120px] justify-center"
            p="y-2"
            border="b-1px solid [#C7C7C7]"
            text="1.25rem [#5D5D5D]"
          >
            <span class="flex items-center">
              <img class="inline-block object-contain aspect-square w-6" m="r-0.5" :src="imgData.atkIcon" />
              {{ textData.typeText }}</span
            >
            <span class="flex items-center">
              <img
                class="inline-block object-contain aspect-square w-6"
                m="r-0.5"
                :src="itemTypeData.antiTDItemTypeUrl"
              />
              {{ itemTypeData.antiTDItemTypeName }}</span
            >
          </div>
          <!-- 內容文字 -->
          <div p="y-35px" text="1.125rem [#6B6B6B]">
            {{ itemContent }}
          </div>
        </div>
        <!-- 解鎖按鈕 -->
        <button
          class="w-[50%] grid grid-cols-1 justify-center shadow-default"
          bg="cover [#ffde39]"
          border="rounded-20px"
          shadow="[#00000033]"
          m="t-17px b-10px"
          p="x-3 y-2"
          @click="onClickBuy"
          v-if="isBuyable && isLock"
        >
          <div font="bold" text="1.5rem">
            {{ textData.unlockText }}
          </div>
          <!-- 晶球 -->
          <div
            class="flex justify-center items-center"
            bg="[#00000080]"
            m="t-6px"
            border="rounded-10px"
            text="1.2rem [#FFFFFF]"
            v-if="isLock && itemData.crystalCost > 0"
          >
            <img class="object-contain aspect-square" :src="imgData.ballIcon" />
            {{ itemData.crystalCost }}
          </div>
          <!-- 金幣 -->
          <div
            class="flex justify-center items-center"
            bg="[#00000080]"
            m="t-6px"
            border="rounded-10px"
            text="1.2rem [#FFFFFF]"
            v-if="isLock && itemData.goldCost > 0"
          >
            <img class="object-contain aspect-square" :src="imgData.goldIcon" />
            {{ itemData.goldCost }}
          </div>
        </button>
        <!-- 裝備/卸下 & 取消 -->
        <div class="w-full flex justify-between" m="t-24px b-10px" p="x-35px" v-if="!isLock">
          <!-- 取消 -->
          <button
            class="w-[37%] shadow-default"
            p="y-8px"
            border="rounded-80px 1px solid [#B9B9B9]"
            shadow="[#00000033]"
            text="1.25rem"
            @click="onCloseDialog"
          >
            {{ textData.cancelText }}
          </button>
          <!-- 裝備 -->
          <button
            class="w-[37%] yellowGradient shadow-default"
            p="y-8px"
            border="rounded-80px"
            shadow="[#00000033]"
            text="1.25rem [#FFFFFF]"
            v-if="!isEquip"
            @click="onEquip(itemId)"
          >
            {{ textData.equipText }}
          </button>
          <!-- 卸下 -->
          <button
            class="w-[37%] from-[#FF9191] to-[#FF5169] shadow-default"
            p="y-8px"
            border="rounded-80px"
            bg="gradient-to-b"
            shadow="[#00000033]"
            text="1.25rem [#FFFFFF]"
            v-if="isEquip"
            @click="onUnequip(itemId)"
          >
            {{ textData.unEquipText }}
          </button>
        </div>
        <!-- 未發售 -->
        <div
          class="w-[40%] flex justify-center items-center from-[#FFFFFF] via-[#000000CC] to-[#FFFFFF]"
          m="t-20px  b-10px"
          p="y-10px"
          bg=" gradient-to-r"
          text="[#FFFFFF] 1.4rem"
          v-if="!isBuyable && isLock"
        >
          {{ textData.notBuyableText }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Vue, Prop, Emit, Component, ModelSync } from 'vue-property-decorator';
import AntiTDItemComponent from '@/components/AntiTD/AntiTDItemComponent.vue';
import TableManager, { AntiTDItemData } from '@/manager/TableManager';
import imgPath from '@/config/imgPath/imgPath';
import { AntiTDItemType } from '@/helper/enum/AntiTD';
import AntiTDManager from '@/manager/AntiTDManager';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import { AntiTDItemTypeData } from '@/helper/interface/AntiTD';
import { PlanetUserInfoData } from '@/helper/interface/PlanetWar';
import { Message } from '@/helper/class/Common';
import { InteractionType } from '@/helper/enum/Combat';

// 逆塔防效果資料
interface AntiTDItemEffectData {
  /** 互動數值變化 */
  interactionValue: number;
  /** 是否為百分比 */
  isPercentage: boolean;
  /** 道具互動類型(魔力、攻擊力、速度等) */
  interactionType: InteractionType;
}

/** 英雄隊伍編輯面板 道具列表中 點選道具 彈出 裝備/購買面板 */
@Component({
  components: {
    AntiTDItemComponent,
  },
})
export default class AntiTDItemContent extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 道具資訊 */
  @Prop(Number) private itemId!: number;
  /** 是否未解鎖 */
  @Prop(Boolean) private isLock!: boolean;
  /** 是否已裝備 */
  @Prop(Boolean) private isEquip!: boolean;
  /** 使用者資料 */
  @Prop() private userInfo!: PlanetUserInfoData;
  /** 道具資料 */
  private itemData!: AntiTDItemData;
  /** 道具名稱 */
  private itemName!: string;
  /** 道具類型資料 */
  private itemTypeData!: AntiTDItemTypeData;
  /** 道具內容 */
  private itemContent: string = '';
  /** 效果文字 */
  private itemEffect: string = '';
  /** 是否可購買 */
  private isBuyable: boolean = true;
  /** */
  private readonly ignoreInteractionValueItemType: InteractionType[] = [
    InteractionType.ClearNegative,
    InteractionType.Invincible,
    InteractionType.Revive,
    InteractionType.IgnoreFront,
    InteractionType.Freeze,
  ];

  /** 文字資料 */
  private textData = {
    title: '道具說明',
    levelText: 'Lv',
    typeText: '道具類型',
    magicText: '消耗魔力',
    effectText: '效果',
    rangeText: '效果距離',
    cooldownText: '冷卻時間',
    secondText: '秒',
    unlockText: '進行解鎖',
    equipText: '裝備',
    unEquipText: '卸下',
    cancelText: '取消',
    notBuyableText: '未發售',
  };

  /** 圖片路徑 */
  private imgData = {
    /** 攻擊力icon */
    atkIcon: imgPath.atkIconBaseUrl,
    /** 魔力icon */
    magicIcon: imgPath.magicIconBaseUrl,
    /** 晶球icon  */
    ballIcon: imgPath.ballIconBaseUrl,
    /** 金幣icon */
    goldIcon: imgPath.goldIconBaseUrl,
    /** 效果距離icon */
    effectRangeIcon: imgPath.attackRange,
    /** 效果icon */
    effectIcon: imgPath.attackSpeed,
  };

  created() {
    // 取得靜態資料
    const data = TableManager.antiTDItem.findOne(this.itemId);
    if (data === undefined) {
      console.error(`no matching itemId= ${this.itemId}`);
      return;
    }
    // 存itemData
    this.itemData = data;

    // 存名稱
    this.itemName = Localization.getText(LocalKeyType.Common, this.itemData.nameKey);

    // 存種類名稱與圖片路徑
    const typeData = AntiTDManager.getAntiTDItemTypeData(this.itemData.heroItemType);
    if (typeData === undefined) {
      console.error(`no type data heroItemType= ${this.itemData.heroItemType}`);
      return;
    }

    this.itemTypeData = typeData;

    // 存內容
    this.itemContent = Localization.getText(LocalKeyType.Common, this.itemData.contentKey);

    // 效果資料整理
    const antiTDItemEffect = this.getItemEffectData(this.itemData);

    // 取得效果文字
    this.getItemEffectText(this.itemData, antiTDItemEffect);

    // 是否為未發售
    this.isBuyable = AntiTDManager.isAntiTDItemBuyable(this.itemData);
  }

  /** 取得道具效果資料
   *  @param itemData
   */
  private getItemEffectData(itemData: AntiTDItemData): AntiTDItemEffectData[] {
    return [
      {
        interactionValue: itemData.interactionValue,
        isPercentage: itemData.isPercentage,
        interactionType: itemData.interactionType,
      },
      {
        interactionValue: itemData.interactionValue2,
        isPercentage: itemData.isPercentage2,
        interactionType: itemData.interactionType2,
      },
    ];
  }

  /** 組合效果說明字串
   * @param itemData 道具資料
   * @param antiTDItemEffect 道具效果
   */
  private getItemEffectText(itemData: AntiTDItemData, antiTDItemEffect: AntiTDItemEffectData[]): void {
    // 道具設定防呆
    if (
      antiTDItemEffect.every((effect) => effect.interactionType === 0) && // 道具無任何效果
      itemData.spawnOnHitItemId === -1 && // 無生成道具
      itemData.heroItemType !== AntiTDItemType.Summon // 非召喚類道具
    ) {
      this.itemEffect = '道具設定錯誤';
      console.error(`道具設定錯誤,id=${itemData.id}`);
      return;
    }

    // 取得效果時間
    if (itemData.interactionTime > 0) {
      this.itemEffect = itemData.interactionTime.toString() + '秒內';
    }
    let count: number = 0;
    for (const antiTDItemEffectData of antiTDItemEffect) {
      // 如果類型為0
      if (antiTDItemEffectData.interactionType === 0) {
        // 判斷是否有生成道具
        if (itemData.spawnOnHitItemId !== -1) {
          const spawnItem = TableManager.antiTDItem.findOne(itemData.spawnOnHitItemId);
          if (spawnItem !== undefined) {
            this.getItemEffectText(spawnItem, this.getItemEffectData(spawnItem));
          } else {
            console.error(`找不到對應生成道具，spawnOnHitItemId = ${itemData.spawnOnHitItemId}`);
          }
        } else {
          // 判斷是否為召喚類
          if (itemData.heroItemType === AntiTDItemType.Summon) {
            // 影子英雄說明
            this.itemEffect = '召喚自己的分身';
          }
        }
        return;
      }

      // 中間增加連接詞
      if (count > 0 && count < antiTDItemEffect.length) {
        this.itemEffect += '及';
      }

      // 取得效果數值
      if (
        antiTDItemEffectData.interactionValue !== 0 &&
        this.ignoreInteractionValueItemType.includes(antiTDItemEffectData.interactionType) === false
      ) {
        this.itemEffect += antiTDItemEffectData.interactionValue.toString();
      }
      // 取得是否為百分比
      if (antiTDItemEffectData.isPercentage === true) {
        this.itemEffect += '%';
      }
      // 取得類型文字
      this.interactionTypeText(antiTDItemEffectData.interactionType);
      count++;
    }
  }

  /** 互動類型文字
   * @param interactionType 道具資料
   */
  private interactionTypeText(interactionType: InteractionType): void {
    switch (interactionType) {
      case InteractionType.Hp:
        this.itemEffect += '血量';
        break;
      case InteractionType.InteractionValue:
        this.itemEffect += '攻擊力';
        break;
      case InteractionType.LaunchRate:
        this.itemEffect += '攻速';
        break;
      case InteractionType.Defense:
        this.itemEffect += '防禦力';
        break;
      case InteractionType.Speed:
        this.itemEffect += '移動速度';
        break;
      case InteractionType.Range:
        this.itemEffect += '攻擊範圍';
        break;
      case InteractionType.AllPositive:
        this.itemEffect += '全狀態';
        break;
      case InteractionType.ClearNegative:
        this.itemEffect += '清除負值狀態';
        break;
      case InteractionType.Invincible:
        this.itemEffect += '無敵';
        break;
      case InteractionType.Revive:
        this.itemEffect += '復活';
        break;
      case InteractionType.Freeze:
        this.itemEffect += '冰凍';
        break;
      case InteractionType.IgnoreFront:
        this.itemEffect += '無視前方180度敵人攻擊';
        break;
    }
  }

  /** 點擊解鎖按鈕 */
  private onClickBuy(): void {
    // 檢查金幣是否足夠
    if (this.itemData.goldCost > 0) {
      if (this.userInfo.goldCoin < this.itemData.goldCost) {
        Message.warn('金幣不足!');
        return;
      }
    }

    // 檢查晶球是否足夠
    if (this.itemData.crystalCost > 0) {
      if (this.userInfo.crystalCoin < this.itemData.crystalCost) {
        Message.warn('晶球不足!');
        return;
      }
    }

    // 檢查前一級是否解鎖
    if (this.itemData.unlockId !== -1 && this.userInfo.antiTDItemList.includes(this.itemData.unlockId) === false) {
      Message.warn('此道具前一個等級未解鎖');
      return;
    }

    // 購買道具
    this.onBuy(this.itemData.id);
  }

  /**裝備道具
   * @param itemId 道具編號
   */
  @Emit('onEquip')
  private onEquip(itemId: number): void {
    return;
  }

  /**解除裝備道具
   * @param itemId 道具編號
   */
  @Emit('onUnequip')
  private onUnequip(itemId: number): void {
    return;
  }

  /**購買道具
   * @param itemId 道具編號
   */
  @Emit('onBuy')
  private onBuy(itemId: number): void {
    return;
  }

  /** 關閉彈窗 */
  @Emit('closeDialog')
  private onCloseDialog(): void {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  width: 95%;
  max-width: 550px;
  border-radius: 30px;
  z-index: 50;
}

::v-deep .el-dialog__body {
  padding-top: 0px;
  padding-bottom: 20px;
  padding-left: 25px;
  padding-right: 25px;
  height: 60vh;
  max-height: 575px;
}

::v-deep .el-dialog__header {
  padding-top: 0rem;
  padding-bottom: 11px;
  padding-left: 25px;
  padding-right: 25px;
  height: 82px;
}

::v-deep .el-icon-close::before {
  font-weight: bold;
  font-size: 22px;
  color: #bfbfbf;
}

.scrollbar::-webkit-scrollbar {
  width: 7px;
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
