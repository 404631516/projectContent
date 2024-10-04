<template>
  <div class="inline-block relative">
    <!-- 選中區 -->
    <input
      type="text"
      class="inline-block w-full rounded-5px cursor-pointer"
      :class="{ 'cursor-not-allowed': isDisabled }"
      bg="[#EEEADA]"
      p="l-0.75rem r-1rem y-0.5rem"
      ref="select"
      @click="isShowOptionContainer = !isShowOptionContainer"
      :placeholder="propPlaceholder"
      :disabled="isDisabled"
      v-model="inputValue"
    />
    <!-- 箭頭 -->
    <i
      class="el-icon-caret-top absolute !flex h-full items-center right-0.25rem top-0 pointer-events-none transition"
      :class="{
        'transform rotate-180': isShowOptionContainer,
        hidden: isDisabled,
      }"
    ></i>
    <!-- 選項區 -->
    <ul
      ref="optionContainer"
      data-show="false"
      class="z-50 option-list w-full max-h-60 rounded-5px overflow-y-auto shadow-default"
      bg="[#fff]"
      p="x-0.5rem y-0.5rem"
    >
      <li
        v-for="(option, index) in optionList"
        :key="index"
        class="rounded-5px"
        p="x-0.25rem"
        :class="{
          select: inputValue === option.value,
        }"
        @click="
          inputValue = option.value;
          selectValue = option.id;
          isShowOptionContainer = false;
        "
      >
        {{ option.value }}
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Ref,
  Watch,
  VModel,
} from 'vue-property-decorator';
import { createPopper } from '@popperjs/core';
@Component({
  components: {},
})
export default class BaseSelect extends Vue {
  /**選中區 */
  @Ref('select') readonly select!: HTMLInputElement;
  /**選項區 */
  @Ref('optionContainer') readonly optionContainer!: HTMLUListElement;
  /**選項資料 */
  @Prop({ type: Array, default: [] }) readonly optionList!: Array<{
    value: string;
    id: string | number;
  }>;
  /** placeholder */
  @Prop({ type: String, default: '' }) readonly propPlaceholder!: string;
  /** 外部綁定值 */
  @VModel({ default: '' }) selectValue!: string | number;
  /** 選中值 value */
  private inputValue: string = '';
  /** 是否禁用 */
  private isDisabled: boolean = false;
  /** 選項顯示開關 */
  private isShowOptionContainer: boolean = false;
  /** 選項只有一個禁用並選取 */
  @Watch('optionList')
  private onOnlyOption(
    optionList: Array<{
      value: string;
      id: string | number;
    }>
  ) {
    if (optionList.length === 1) {
      this.isDisabled = true;
      this.inputValue = optionList[0].value;
      this.selectValue = optionList[0].id;
    }
  }
  /** 設置選項開關 */
  @Watch('isShowOptionContainer')
  private onOpenOptionContainer(isShowOptionContainer: boolean) {
    if (isShowOptionContainer) {
      this.optionContainer.dataset.show = 'true';
      return;
    }
    this.optionContainer.dataset.show = 'false';
  }
  /** 創造下拉選單  */
  mounted() {
    createPopper(this.select, this.optionContainer, {
      placement: 'bottom',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
      ],
    });
  }
}
</script>

<style scoped>
[data-show='true'] {
  clip-path: inset(0% 0% 0% 0% round 5px);
}
[data-show='false'] {
  clip-path: inset(0% 0% 100% 0%);
}
.option-list {
  transition: clip-path 0.3s;
  border: 1px solid #e4e7ed;
}

.select {
  background: #eeeada;
}

.hidden {
  display: none !important;
}

li:hover {
  background: #eeeada;
}
</style>
