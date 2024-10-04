<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :modal-append-to-body="false"
    :destroy-on-close="true"
    :before-close="onCloseDialog"
    top="8vh"
  >
    <!-- 標題 -->
    <div slot="title" class="w-[90%]" m="x-auto" p="y-6" border="b-1px solid #FFF" text="36px [#FFF]">
      {{ textData.title }}
    </div>
    <!-- 內文 -->
    <div class="h-142 scrollbar overflow-auto" m="r-[5%]" text="29px [#FFFFFF] left">
      <!-- 種類 -->
      <div
        v-for="(enumValue, enumKey, index) in BrickBreakMapItemStringType"
        :key="index"
        class="space-y-4"
        m="t-4"
        p="l-17.5"
      >
        <span text="[#3AFFFF]">{{ enumValue }}</span>
        <!-- 依種類取得道具顯示 -->
        <div v-for="(item, itemIndex) in getItemList(index)" :key="itemIndex" class="flex space-x-2">
          <!-- 圖片 -->
          <img :src="getImgUrl(item.imgUrl)" class="w-15 object-contain aspect-square" />
          <div class="flex flex-col">
            <!-- 名字 -->
            {{ getMultiLan(item.nameKey) }}
            <!-- 說明 -->
            <span text="20px">{{ getMultiLan(item.contentKey) }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, ModelSync } from 'vue-property-decorator';
import TableManager, { BrickBreakerMapItemData } from '@/manager/TableManager';
import { BrickBreakMapItemStringType, BrickBreakMapItemType } from '@/helper/enum/BrickBreak';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';

@Component({})
export default class BrickBreakerExplainDialog extends Vue {
  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 坦克大戰地圖物件字串型態 */
  private BrickBreakMapItemStringType = BrickBreakMapItemStringType;

  /** 文字資料 */
  private textData = {
    title: '物件說明',
  };

  /** 依種類取得物件列表
   *  @param index 種類
   */
  private getItemList(index: number): BrickBreakerMapItemData[] {
    return TableManager.brickBreakerMapItem.where(
      (item) => BrickBreakMapItemType[item.itemType] === Object.keys(BrickBreakMapItemStringType)[index]
    );
  }

  /** 取得多國語言
   *  @param value 多國語言key值
   */
  private getMultiLan(value: string): string {
    return Localization.getText(LocalKeyType.Common, value);
  }

  /** 取得圖片路徑
   *  @param url 物件檔名
   */
  private getImgUrl(url: string): string {
    return `${require('@/assets/images/brickbreak/' + url)}`;
  }

  /** 關掉dialog */
  onCloseDialog() {
    this.$$store.commit('setShowBrickBreakerExplainDialog', false);
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 660px;
  width: 95%;
  background: #000000cc;
  border-radius: 30px;
}
::v-deep .el-dialog__header {
  padding: 0px 0px 0px 0px;
}
::v-deep .el-dialog__body {
  padding: 20px 30px 30px 30px;
}
::v-deep .el-icon-close:before {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}
.scrollbar::-webkit-scrollbar {
  padding: 0px 0px 20px 0px;
  width: 10px;
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
