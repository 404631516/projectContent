<template>
  <div class="flex self-center text-left text-[#FFF]">
    <el-checkbox
      v-model="isCheckAll"
      :Indeterminate="isIndeterminate"
      class="check-all"
      @change="onCheckAll"
    >
      {{ textData.checkAllTitle }}
    </el-checkbox>
    <el-checkbox-group v-model="newCheckList" @change="onCheck">
      <el-checkbox
        v-for="(option, index) in checkOptionList"
        :label="option.optionValue"
        :key="index"
      >
        {{ option.optionText }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';

/** 選項資訊 */
export interface CheckboxOption {
  /** 選項文字 */
  optionText: string;
  /** 選項值 */
  optionValue: number;
}

@Component({})
export default class CheckboxGroup extends Vue {
  /** 選項清單 */
  @Prop(Array) private checkOptionList!: CheckboxOption[];
  /** 當前選擇 */
  @Prop(Array) private checkedList!: number[];

  /** 取得全選選擇列表 */
  private allCheckList: number[] = [];

  /** 當前選項 */
  private newCheckList: number[] = [];

  /** 是否全選 */
  private isCheckAll: boolean = false;
  /** 是否有選但非全選 */
  private get isIndeterminate(): boolean {
    return this.isCheckAll === false && this.newCheckList.length > 0;
  }

  /** 取得結果選擇列表 */
  private get resultCheckList(): number[] {
    return [
      ...this.newCheckList,
      ...this.checkedList.filter(
        (checkValue) => this.allCheckList.includes(checkValue) === false
      ),
    ];
  }

  /** 文字資料 */
  private textData = {
    checkAllTitle: '全部',
  };

  created() {
    // 設定選項
    this.allCheckList = this.checkOptionList.map<number>(
      (option) => option.optionValue
    );

    // 從清單中選出這次要處理的選項
    this.checkedList.forEach((check) => {
      if (this.allCheckList.includes(check)) {
        this.newCheckList.push(check);
      }
    });

    // 更新是否全選
    this.isCheckAll = this.newCheckList.length === this.allCheckList.length;
  }

  /** 選擇全部 */
  private onCheckAll(): void {
    this.newCheckList.splice(0);
    if (this.isCheckAll) {
      this.allCheckList.forEach((checkValue) => {
        this.newCheckList.push(checkValue);
      });
    }
    this.onCheckUpdate(this.resultCheckList);
  }

  /** 選擇單一 */
  private onCheck(): void {
    this.isCheckAll = this.newCheckList.length === this.allCheckList.length;
    this.onCheckUpdate(this.resultCheckList);
  }

  /** 選項更新 */
  @Emit('onCheckUpdate')
  private onCheckUpdate(resultCheckList: number[]): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.check-all {
  margin-right: 1.5vw;
  vertical-align: middle;
}
</style>
