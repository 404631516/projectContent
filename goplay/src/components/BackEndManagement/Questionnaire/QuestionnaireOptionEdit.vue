<template>
  <div m="t-30px">
    <!-- 選項-->
    <div v-for="(option, index) in optionArg.options" :key="index">
      <div class="w-600px flex items-center" m="b-4">
        <div class="w-20px h-20px" border="rounded-5px 2px solid [#A5A5A5]"></div>
        <input
          v-model="optionArg.options[index]"
          type="text"
          :disabled="isEdit"
          m="l-5"
          p="x-5px"
          border="b-1px solid [#A5A5A5]"
        />
        <!-- 刪除選項 -->
        <template v-if="!isEdit && optionArg.options.length > 1">
          <button class="relative -left-20px" text="24px [#CFCFCF]" font="bold" @click="deleteOption(index)">
            <img class="w-[70%] aspect-square" :src="imgData.grayCross" />
          </button>
        </template>
      </div>
    </div>
    <!-- 新增選項 -->
    <template v-if="!isEdit">
      <button class="flex items-center" text="20px [#FFF]" bg="[#18BBD5]" p="x-20px y-1" @click="addNewOption">
        <span text="44px" font="bold">+</span>{{ textData.addOption }}
      </button>
    </template>
  </div>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { OptionArg } from '@/helper/interface/Questionnaire';
import { Component, Vue, VModel, Prop } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class QuestionnaireOptionEdit extends Vue {
  /** 選項資料 */
  @VModel() private optionArg!: OptionArg;
  /** 是否已發布 */
  @Prop(Boolean) private isEdit!: boolean;

  /** 文字資料 */
  private textData = {
    addOption: '新增選項',
  };

  /** 圖片資料 */
  private imgData = {
    grayCross: imgPath.grayCross,
  };

  /** 刪除選項
   *  @param index
   */
  private deleteOption(index: number): void {
    this.optionArg.options.splice(index, 1);
  }

  /** 新增選項 */
  private addNewOption(): void {
    this.optionArg.options.push('');
  }
}
</script>
