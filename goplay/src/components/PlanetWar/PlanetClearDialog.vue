<template>
  <!-- 開啟全螢幕，白底背景 -->
  <div
    class="fixed left-0 top-[60px] z-100 h-full w-full overflow-x-hidden overflow-y-auto bg-white"
    :style="{ display: isDialogVisible ? '' : 'none' }"
  >
    <!-- 破關畫面 -->
    <div
      class="left-0 top-0 w-[100%] aspect-video flex-col bg-no-repeat bg-contain"
      :style="`background-image: url(${img})`"
    >
      <span
        class="<sm:text-[1rem] flex relative top-[22vw] left-[23vw] leading-[1.85vw] text-white font-sans clearText text-[1.55vw] whitespace-pre-line"
        >{{ text }}</span
      >
    </div>
    <!-- 確認按鈕 -->
    <button
      p="x-[6vw] y-[0.3vw]"
      class="yellowGradient relative bottom-[6vw] rounded-2xl"
      @click="isDialogVisible = false"
    >
      <span class="flex-pos text-white text-[1.3vw]">{{ textData.confirm }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { Vue, ModelSync, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class PlanetClearDialog extends Vue {
  /** 此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 破關畫面 */
  @Prop(String) private img!: string;
  /** 破關文字 */
  @Prop(String) private text!: string;

  /** 文字資料 */
  private readonly textData = {
    confirm: '確定',
  };
}
</script>

<style scoped>
.clearText {
  text-align: left;
  font: medium;
  letter-spacing: 0px;
  color: #ffffff;
  stroke: black;
  font-weight: 550;
  stroke-width: 2vw;
  stroke-opacity: 1;
  text-shadow: 0px 3px 6px #000000;
  opacity: 1;
}
</style>
