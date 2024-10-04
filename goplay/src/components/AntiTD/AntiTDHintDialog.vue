<template>
  <el-dialog :visible.sync="isDialogVisible">
    <div slot="title" border="b-3px solid [#C1C1C1]" p="y-25px" text="32px [#B965C9]">
      {{ textData.title }}
    </div>
    <div slot="footer" class="flex justify-evenly"></div>
    <!--包含在dialog__body內-->
    <div class="h-full overflow-auto scrollbar content-box <sm:px-5px" p="x-64px">
      <h1 m="b-5px" text="25px [#00CCCE]" font="bold">
        {{ textData.subTitle }}
      </h1>
      <!--圖片-->
      <img :src="imgData.planetDescriptionUrl" class="description-image" />
      <!--文字-->
      <p v-for="(description, index) in descriptionArray" :key="index" text="20px [#A5A5A5]" class="description-text">
        {{ description }}
      </p>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, ModelSync } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';

/** 逆塔防 隊伍英雄位置編輯說明 面板 */
@Component({})
export default class AntiTDHintDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /**圖片資料*/
  private imgData = {
    planetDescriptionUrl: imgPath.planetDescriptionUrl,
  };

  /**文字資料*/
  private textData = {
    title: '裡宇宙隊伍編輯',
    subTitle: '裡宇宙隊伍',
  };

  private descriptionArray: string[] = [
    '(1) 點擊『選擇英雄』來為你的裡宇宙隊伍加入一起戰鬥的夥伴，可選擇的英雄必需是你已經解鎖的英雄角色。',
    '(2) 點擊英雄下方的道具方格，為你的英雄選擇戰鬥武器。',
    '(3) 依據英雄本身的屬性(圖示上方)，配對同屬性的道具(圖示左上方)。',
    '(4) 第二格欄位需在英雄等級達20級時才能解鎖選購唷！',
  ];
}
</script>
<style scoped>
::v-deep .el-dialog {
  width: 95%;
  max-width: 830px;
  border-radius: 30px;
}

::v-deep .el-dialog__body {
  padding-top: 0px;
  padding-bottom: 15px;
  padding-left: 36px;
  padding-right: 36px;
  height: 72vh;
  max-height: 830px;
}

::v-deep .el-dialog__header {
  padding-top: 0rem;
  padding-bottom: 14px;
  padding-left: 36px;
  padding-right: 36px;
  height: 99px;
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

.description-image {
  width: 100%;
  background-position: center;
  background-size: cover;
  margin: auto;
  margin-bottom: 17px;
}

.description-text {
  font-size: 20px;
  text-align: left;
  margin-bottom: 5px;
}
</style>
