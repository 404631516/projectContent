<template>
  <!-- 生物兵器資訊-->
  <div class="info-pos">
    <ol>
      <li>
        <div class="flex-pos left">
          <div class="img-box">
            <img :src="imgData.atkIcon" />
          </div>
          <slot name="attack"></slot>
        </div>
      </li>
      <li>
        <div class="flex-pos left">
          <div class="img-box">
            <img :src="imgData.magicIcon" />
          </div>
          <slot name="magic"></slot>
        </div>
      </li>
    </ol>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';

/** 生物兵器 道具資訊 */
@Component({})
export default class WeaponItemInfo extends Vue {
  /** 圖片資料 */
  private imgData = {
    /** 攻擊力icon */
    atkIcon: ImgPath.atkIconBaseUrl,
    /** 魔力icon */
    magicIcon: ImgPath.magicIconBaseUrl,
  };
}
</script>
<style lang="scss" scoped></style>
