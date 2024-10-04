<template>
  <div class="grid grid-cols-[10rem,12rem] gap-x-5 gap-y-1" font="bold">
    <!-- 行政區 -->
    <div text="[#D69F05]">
      {{ textData['hang-zheng-qu'] }}
    </div>
    <!-- 學校 -->
    <div text="[#D69F05]" v-show="schoolOption.length">
      {{ textData['xue-xiao'] }}
    </div>
    <!-- 行政區選擇 -->
    <BaseSelect
      class="w-10rem"
      :class="{ 'row-start-2': schoolOption.length === 0 }"
      v-model="selectCounty"
      :optionList="countyOption"
      propPlaceholder="請選擇行政區"
    />
    <!-- 學校選擇 -->
    <BaseSelect
      v-show="schoolOption.length"
      class="w-12rem"
      v-model="selectSchool"
      :optionList="schoolOption"
      propPlaceholder="請選擇學校"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator';
import BaseSelect from '@/components/Public/BaseSelect.vue';
import TableManager from '@/manager/TableManager';
import { Message } from '@/helper/class/Common';
import { CountyType, ResponseState } from '@/helper/enum/Common';
import { heroj7GetSchoolList } from '@/api/BackEndManagementStatisticReport';
import { handleAPIError } from '@/helper/fnc/common';

/**學校資料 */
export interface SchoolData {
  schoolId: number;
  schoolName: string;
}

/**選項格式 */
interface SelectOption {
  value: string;
  id: string | number;
}

@Component({
  components: {
    BaseSelect,
  },
})
export default class AreaSelect extends Vue {
  /** 固定行政區 */
  @Prop() readonly fixCounty!: CountyType;

  /** 選到行政區 id */
  private selectCounty: CountyType = CountyType.None;
  /** 選到學校 id */
  private selectSchool: string = '';

  /** 學校選項 */
  private schoolOption: SelectOption[] = [];

  /** 文字資料 */
  private textData = {
    'hang-zheng-qu': '行政區',
    'xue-xiao': '學校',
  };

  /** 整理行政區選項 */
  private get countyOption(): SelectOption[] {
    // 取得全區域縣市資料
    const allCounty = TableManager.county.getAll();

    // 無限制
    if (this.fixCounty === 0) {
      return [
        // 全國選項
        { value: '全國', id: CountyType.None },
        // 全區域縣市轉選項
        ...allCounty.map((countyData) => {
          return { value: countyData.countyName, id: countyData.id };
        }),
      ];
    }
    // 限制行一個政區
    else {
      return allCounty
        .filter((countyData) => countyData.id === this.fixCounty)
        .map((countyData) => {
          return { value: countyData.countyName, id: countyData.id };
        });
    }
  }

  /** 拿學校清單
   * @param selectCountyId
   */
  private async getHeroj7GetSchoolList(selectCountyId: CountyType): Promise<SelectOption[]> {
    const data = {
      countyId: selectCountyId,
    };
    try {
      // API 取得學校清單
      const res: any = await heroj7GetSchoolList.fetch(data);
      if (res.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(res.result, res.resMessage);
      }

      return res.schoolList.map((schoolData: SchoolData) => {
        return { value: schoolData.schoolName, id: schoolData.schoolId };
      });
    } catch (e) {
      Message.error(`${e}`);
      return [];
    }
  }

  /**更新 行政區域 資料 */
  @Watch('selectCounty')
  private async onChangeCounty(selectCounty: CountyType): Promise<void> {
    // 選到全國
    if (selectCounty === CountyType.None) {
      this.schoolOption.splice(0);
    }
    // 一般處理
    else {
      // 拿學校選項
      this.schoolOption = await this.getHeroj7GetSchoolList(selectCounty);
      // 行政區只有一個選項時學校選項要補全部
      if (this.countyOption.length === 1) {
        this.schoolOption.unshift({ value: '全部', id: -1 });
      }
    }

    // 通知外部區域選項更變
    this.onChangeSelectCountyId(selectCounty);
  }

  /**更新 學校 資料 */
  @Watch('selectSchool')
  private onChangeSchool(selectSchool: number): void {
    this.onChangeSelectSchoolId(selectSchool);
  }

  /** 選擇行政區域 */
  @Emit('onChangeSelectCountyId')
  private onChangeSelectCountyId(countyId: CountyType): void {
    return;
  }

  /** 選擇學校 */
  @Emit('onChangeSelectSchoolId')
  private onChangeSelectSchoolId(schoolId: number): void {
    return;
  }
}
</script>
<style scoped>
.row-start-2 {
  grid-row-start: 2;
}
</style>
