<template>
  <el-dialog :visible.sync="isDialogVisible" fullscreen :show-close="false">
    <div p="y-13"  bg="[#000000CC]">
      <h4 m="b-5" font="bold" text="8xl [#FDC221]">{{ textData.exchangeSuccessfully }}</h4>
      <div class="flex items-center justify-center w-[95%] max-w-150" m="x-auto" p="y-5" border="t-1 solid [#FFF]" text="[32px] [#FFF]">
        {{textData.getCryStal}}
        <img class="w-10 h-10 object-contain" m="x-3" :src="imgData.crystal">
        <span text="[#2CEAEC] 5xl">+{{crystalNum}}</span>
      </div>
      <div class="grid grid-cols-[172px,172px] gap-x-5 justify-center" m="t-3"> 
        <a class="w-43 blueGradient shadow-default rounded-[80px] block" text="xl [#FFF]" p="y-3" :href="adlHomeLink" target="_blank">
          {{ textData.backAdl }}
        </a>
        <button class="w-43 yellowGradient shadow-default rounded-[80px] block" text="xl [#FFF]" p="y-3" @click="closeCrystalMessage">{{ textData.confirm }}</button>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, ModelSync } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { QuickLink } from '@/helper/enum/QuickLink';

@Component({})
export default class CrystalMessage extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  @Prop() public crystalNum!: number;
  /**圖片資料 */
  private imgData = {
    crystal: imgPath.crystalBaseUrl,
  };
  /**文字資料 */
  private textData = {
    exchangeSuccessfully: '兌換成功',
    getCryStal: '獲得晶球',
    backAdl: '返回因材網',
    confirm: this.$t('common.confirm'),
  };
  private adlHomeLink = QuickLink.AdlHome; // 因材網首頁
  @Emit('closeCrystalMessage')
  private closeCrystalMessage() {
    return;
  }
}
</script>
<style scoped>
>>>.el-dialog{
  background: transparent;
  display: flex;
  align-items: center
}
>>>.el-dialog__body{
  width: 100%;
  padding: 0;
}
>>>.el-dialog__header{
  display: none;
}
</style>>
