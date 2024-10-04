<template>
  <div class="flex-pos">
    <div v-for="star in starList" :key="star.id">
      <div
        v-show="star === 1"
        class="star-box"
        :style="{ backgroundImage: `url(${imgData.starActive})` }"
      ></div>
      <div
        v-show="star === 0"
        class="star-box"
        :style="{ backgroundImage: `url(${imgData.starEmpty})` }"
      ></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
@Component({})
export default class StarList extends Vue {
  @Prop({ default: 0 }) private starCount!: number;

  /** 每關星星總數 */
  private readonly starMax: number = 3;

  /** 圖片資料 */
  private imgData = {
    starActive: imgPath.planetWarStarActive,
    starEmpty: imgPath.planetWarStarEmpty,
  };

  /** 獲取通關星星個數 */
  private get starList() {
    const data: number[] = [];
    for (let i = 0; i < this.starMax; i++) {
      data.push(i < this.starCount ? 1 : 0);
    }
    return data;
  }
}
</script>
<style lang="scss" scoped>
.star-box {
  width: 2vw;
  height: 4vh;
  background-size: contain !important;
  background-repeat: no-repeat !important;
}

@media (max-width: 768px) {
  .star-box {
    width: 4vw;
    height: 4vh;
  }
}

@media (max-width: 640px) {
  .star-box {
    width: 4vw;
    height: 4vh;
  }
}
</style>
