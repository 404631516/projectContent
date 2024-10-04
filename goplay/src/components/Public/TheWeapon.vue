<template>
  <div class="aspect-square relative rounded-[10px]" border="2px solid [#D9D6BE]" bg="[#000000CC]">
    <!-- 生物兵器 -->
    <div
      v-if="weaponId"
      class="h-full grid"
      p="t-[2%]"
      text="xl [#FFF]"
      bg="no-repeat contain "
      :style="{
        backgroundImage: `url(${imgData.weaponBaseUrl + weaponData.url})`,
      }"
    >
      <img class="absolute -top-[15%] -left-[15%] w-4/9 h-4/9 z-10" :src="weaponAttribute" />
      {{ `lv ${weaponData.level}` }}
      <div class="self-end rounded-b-[10px]" p="b-[2%]" bg="[#000] opacity-50">
        <span class="grid grid-cols-3 items-center" text="15px [#FFDD00]"
          ><img class="w-[35%] h-full object-contain justify-self-end" :src="imgData.attackIcon" />{{
            weaponData.attack
          }}</span
        >
        <span class="grid grid-cols-3 items-center" text="15px [#2CEAEC]"
          ><img class="w-[35%] h-full object-contain justify-self-end" :src="imgData.magicIcon" />{{
            weaponData.magic
          }}</span
        >
      </div>
    </div>
    <!-- 沒有裝備生物兵器 -->
    <div v-else class="flex justify-center items-center h-full" text="xl [#FFF]">
      {{ textData.notYetEquipped }}
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import WeaponManager from '@/manager/WeaponManager';
import { WeaponTableData } from '@/helper/interface/Weapon';
import imgPath from '@/config/imgPath/imgPath';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';
@Component({
  components: {},
})
export default class TheWeapon extends Vue {
  /**生物兵器ID (沒傳會顯示沒有裝備) */
  @Prop() readonly weaponId!: number;
  /**文字資料 */

  private textData = {
    notYetEquipped: '尚未裝備',
  };
  /**圖片資料 */
  private imgData = {
    weaponBaseUrl: imgPath.weaponBaseUrl,
    attackIcon: imgPath.itemAttackBaseUrl,
    magicIcon: imgPath.itemMagicBaseUrl,
  };

  /**個別生物兵器資料 */
  private weaponData!: WeaponTableData | undefined;
  /**屬性圖片 */
  private weaponAttribute!: string;

  created() {
    if (this.weaponId) {
      this.weaponData = WeaponManager.getWeaponTableData(this.weaponId);
      this.weaponAttribute = AttributeHelper.getAttributeIconImgUrl(this.weaponData!.attribute);
    }
  }
}
</script>
