<template>
  <div
    class="w-full h-100vh flex justify-center items-center pointer-events-auto overflow-hidden"
  >
    <div class="w-[70Vh] h-full overflow-auto <sm:(w-full h-full)">

      <!-- 漫畫圖 -->
      <div
        class="relative"
        bg="no-repeat cover center <sm:contain"
        :style="{
          backgroundImage: `url(${comicsList[comicsId]})`,
          width: `${magnification}%`,
          height: `${magnification}%`,
        }"
      >
        <i
        @click="onCloseComics"
        class="el-icon-close cursor-pointer absolute right-0 top-0 hidden <sm:block"
        font="before:black"
        text="[#FFF] 5xl"
      ></i>
      </div>
    </div>
    <div
      class="flex flex-col justify-between items-start h-full <sm:hidden"
      m="l-8"
    >
      <!-- 關掉彈窗 -->
      <i
        @click="onCloseComics"
        class="el-icon-close cursor-pointer"
        font="before:black"
        text="[#BFBFBF] 3xl"
      ></i>
      <!-- 放大縮小按鈕 -->
      <div class="flex flex-col justify-between h-55">
        <button
          @click="zoom('in')"
          class="w-25 h-25 rounded-1"
          bg="[#3DE92380]"
          border="3 soldi [#FFF]"
        >
          <i class="el-icon-plus" font="before:black" text="[#FFF] 5xl"></i>
        </button>
        <button
          @click="zoom('out')"
          class="w-25 h-25 rounded-1"
          bg="[#3DE92380]"
          border="3 soldi [#FFF]"
        >
          <i class="el-icon-minus" font="before:black" text="[#FFF] 5xl"></i>
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';

@Component({
  components: {},
})
export default class ComicsContent extends Vue {
  /** 要開啟漫畫圖的index */
  @Prop() private comicsId!: number;

  /** 漫畫圖的陣列 */
  private comicsList: string[] = [
    imgPath.comicsContent1,
    imgPath.comicsContent2,
    imgPath.comicsContent3,
    imgPath.comicsContent4,
    imgPath.comicsContent5,
    imgPath.comicsContent6,
    imgPath.comicsContent7,
    imgPath.comicsContent8,
    imgPath.comicsContent9,
    imgPath.comicsContent10,
  ];
  /** 放大的倍率 */
  private magnification: number = 100;

  /** 放大縮小
   * @param 'in'放大'out'縮小
   */
  private zoom(type: 'in' | 'out'): void {
    if (type === 'in') {
      this.magnification += 10;
    }
    if (type === 'out') {
      if (this.magnification === 100) {
        return;
      }
      this.magnification -= 10;
    }
  }
  /**關掉彈窗 */
  @Emit('onCloseComics')
  private onCloseComics(): void {
    return;
  }
}
</script>
<style scoped></style>
