<template>
  <!--正常道具格-->

  <div
    class="flex justify-center items-center h-full w-full relative"
    border="rounded-10px"
    bg="[#000000cc]"
    text="4rem [#FFFFFF]"
  >
    <div
      v-if="isHighlight"
      class="w-[125%] h-[125%] absolute -left-[14%] click-box z-1"
      border="rounded-10px 5px solid [#7DFF47]"
    >
      <img class="w-[70%] absolute left-[15%] top-[112%]" :src="imgData.arrowDown" />
    </div>
    <div
      v-if="!isDefault"
      class="w-full h-full"
      bg="no-repeat cover center "
      border="rounded-10px 1px solid [#FFFFFF]"
      :style="{ backgroundImage: `url(${itemUrl})` }"
    >
      <div class="w-[100%] h-[40%] absolute -top-10 flex flex-col justify-center" m="b-[3.7%]" v-if="isNameVisible">
        <span text="16px [#FFFFFF]">{{ itemName }}</span>
        <span text="16px [#FDC221]">{{ textData.levelText }}{{ itemData.itemLevel }}</span>
      </div>
      <div
        v-if="isTypeVisible"
        class="w-[50%] h-[50%] -top-[15%] -left-[15%] absolute z-10"
        bg="no-repeat cover center"
        :style="{ backgroundImage: `url(${itemAttributeUrl})` }"
      ></div>
    </div>
    <template v-else-if="isEquipLocked"
      ><div><img :src="imgData.lockIcon" /></div
    ></template>
    <template v-else><div>+</div></template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import TableManager, { AntiTDItemData } from '@/manager/TableManager';
import Config from '@/config/setting';
import AntiTDManager from '../../manager/AntiTDManager';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import imgPath from '@/config/imgPath/imgPath';

/** 英雄道具列表中的 道具圖示 */
@Component({})
export default class AntiTDItemComponent extends Vue {
  /** 道具編號 */
  @Prop(Number) private itemId!: number;
  /** 名字開關 */
  @Prop(Boolean) private isNameVisible!: boolean;
  /** 類型開關 */
  @Prop(Boolean) private isTypeVisible!: boolean;
  /** 點選框開關 */
  @Prop(Boolean) private isHighlight!: boolean;
  /** 道具框是否鎖住 */
  @Prop(Boolean) private isEquipLocked!: boolean;

  /** 是否為空道具格 */
  private isDefault: boolean = true;
  /** 道具資料 */
  private itemData!: AntiTDItemData;
  /** 道具名稱 */
  private itemName: string = '';
  /** 道具圖片路徑 */
  private itemUrl: string = '';
  /** 屬性圖片路徑 */
  private itemAttributeUrl: string = '';

  /** 文字資料 */
  private textData = {
    levelText: 'Lv',
  };

  /** 圖片資料 */
  private imgData = {
    arrowDown: imgPath.downArrow,
    lockIcon: imgPath.planetMaskBaseUrl,
  };

  created() {
    this.updateItem();
  }

  /** 讀取道具資料
   * @param itemId 道具id
   */
  @Watch('itemId')
  private updateItem(): void {
    // 空道具
    this.isDefault = this.itemId === 0;
    if (this.isDefault) {
      return;
    }

    // 取得靜態資料
    const data = TableManager.antiTDItem.findOne(this.itemId);
    if (data === undefined) {
      console.error('no matching Id');
      return;
    }
    this.itemData = data;
    this.itemName = Localization.getText(LocalKeyType.Common, this.itemData.nameKey);
    this.itemUrl = `${Config.imgUrl}/img/h5/antiTD/Item/${this.itemData.url}`;
    this.itemAttributeUrl = AntiTDManager.getAntiTDItemTypeImageUrl(this.itemData.heroItemType);
  }
}
</script>
<style lang="scss" scoped>
.click-box {
  box-shadow: 1px 3px #358612, inset 3px 3px #358612;
}
</style>
