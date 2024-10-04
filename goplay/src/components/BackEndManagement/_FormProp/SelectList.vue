<template>
  <div>
    <el-select
      class="w-full block"
      v-model="currentItem"
      :popper-class="popperClassName"
      :placeholder="placeholder"
      :disabled="isLock"
      :no-match-text="placeholder"
      @change="onSelect"
    >
      <el-option
        v-for="(item, index) in selectItemList"
        :label="item.label"
        :value="item.value"
        :key="index"
      ></el-option>
    </el-select>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import { SelectOption } from '@/helper/interface/BackEndManagement';

@Component({})
export default class SelectList extends Vue {
  /** 選項清單 */
  @Prop(Array) private selectItemList!: SelectOption[];
  /** 當前選中選項 */
  @Prop() private selectedItem!: number | string;
  /** 選擇提示 */
  @Prop(String) private placeholder!: string;
  /** 是否鎖住不能編輯 */
  @Prop(Boolean) private isLock!: boolean;
  /** 彈出提示框的類別名稱 */
  @Prop(String) private popperClassName!: string;

  /** 當前選中選項 */
  private currentItem: number | string | null = null;

  created() {
    // 判斷傳入的類別
    if (typeof this.selectedItem === 'number' && this.selectedItem < 0) {
      return;
    } else if (typeof this.selectedItem === 'string' && this.selectedItem === '') {
      return;
    }

    this.currentItem = this.selectedItem;
  }

  /** 選項更新
   * @param newSelectItemList 新的選項清單
   */
  @Watch('selectItemList')
  private onOptionChange(newSelectItemList: SelectOption[]): void {
    const selectedIndex = newSelectItemList.findIndex((option) => option.value === this.currentItem);
    if (selectedIndex === -1) {
      this.currentItem = null;
      this.onSelect(-1);
    }
  }

  /** 選中選項 */
  @Emit('onSelect')
  private onSelect(resultItem: number | string): void {
    return;
  }
}
</script>