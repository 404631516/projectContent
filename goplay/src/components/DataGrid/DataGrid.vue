<template>
  <div class="p-[20px]" v-loading="isLoading">
    <div>
      <!-- Debug -->
      <el-button-group v-if="debugFlag">
        <el-button @click="debugMessage(pagedResult)" round size="small"> API result </el-button>
        <el-button @click="debugMessage(normalColumns)" round size="small"> 取得column </el-button>
        <el-button @click="debugMessage(expandColumns)" round size="small"> 取得expand column </el-button>
        <el-button @click="debugMessage(listDataDto)" round size="small"> 顯示查詢 </el-button>
      </el-button-group>
      <!-- 篩選區塊 -->
      <div v-if="isShowFilterBlock">
        <!-- 功能區塊 -->
        <div class="flex items-center mb-[15px]">
          <!-- 匯出Excel -->
          <el-button @click="exportExcel" round size="small">
            {{ $t('form.export') }} {{ $t('form.excel') }}
          </el-button>
          <!-- 進階查詢開關 -->
          <div>
            <span class="ml-2 text-sm text-gray-800" :class="{ 'text-blue-500': advancedSearch }">
              {{ $t('common.advanced') }}{{ $t('common.search') }}
            </span>
            <el-switch class="left-[10px]" v-model="advancedSearch" active-color="#13ce66" inactive-color="#dcdfe6">
            </el-switch>
          </div>
        </div>
        <!-- 分隔線 -->
        <div class="h-[2px] bg-gray-300 mb-4"></div>
        <!-- 篩選列 -->
        <el-row>
          <div class="flex items-center mb-2.5">
            <!-- 鎖定查詢欄位 -->
            <div
              v-if="lockFilterField"
              class="inline-block p-[9px] border border-solid border-[#dcdfe6] rounded-md bg-white text-xl"
            >
              {{ getColumnByKey(lockFilterField).label }}
            </div>
            <!-- 非鎖定，自由選擇欄位 -->
            <el-select
              v-else
              :placeholder="$t('common.column')"
              v-model="listDataDto.filterField"
              @change="onFilterFieldChange"
            >
              <el-option v-for="(column, index) in queryColumns" :key="index" :label="column.label" :value="column.key">
              </el-option>
            </el-select>
            <!-- 查詢運算符，開啟進階查詢才會顯示 -->
            <el-select
              class="ml-1.5"
              v-show="advancedSearch"
              :placeholder="$t('common.operation')"
              v-model="listDataDto.filterOperator"
            >
              <el-option
                v-for="(operator, index) in getQueryColumnOperatorList()"
                :key="index"
                :label="$t('common.' + operator)"
                :value="operator"
              >
              </el-option>
            </el-select>
            <!-- 字串查詢 -->
            <el-input
              class="ml-1.5"
              v-if="listDataDto.filterField && getColumnByKey(listDataDto.filterField).filterType == FilterType.Text"
              :placeholder="$t('common.label')"
              v-model="listDataDto.filterValue"
              clearable
              style="width: 400px"
            >
            </el-input>
            <!-- 列舉查詢 -->
            <el-select
              class="ml-1.5"
              v-if="listDataDto.filterField && getColumnByKey(listDataDto.filterField).filterType == FilterType.Enum"
              :placeholder="$t('common.pleaseSelect')"
              v-model="listDataDto.filterValue"
            >
              <el-option
                v-for="(enumOption, index) in getColumnByKey(listDataDto.filterField).filterEnum"
                :key="index"
                :label="enumOption.label"
                :value="enumOption.value"
              >
              </el-option>
            </el-select>
            <!-- 清除查詢條件按鈕 -->
            <el-button
              v-if="lockFilterField === ''"
              class="rounded-full p-3"
              :style="{ marginLeft: '6px' }"
              @click="
                listDataDto.filterField = '';
                listDataDto.filterValue = '';
              "
              round
              size="small"
            >
              <img :src="imgPath.grayCross" class="h-[22px] w-[22px]" />
            </el-button>
          </div>
        </el-row>
        <!-- 查詢按鈕 -->
        <el-button class="w-21 flex items-center" @click="applyQuery()" round size="small">
          <div class="flex items-center justify-between w-full">
            <img class="w-4 h-4 text-current overflow-hidden" :src="imgPath.search" />
            {{ $t('common.search') }}
          </div>
        </el-button>
      </div>
      <!-- 資料列表 -->
      <el-table
        :header-cell-style="tableHeaderCellStyle"
        :cell-style="tableCellStyle"
        :data="pagedResult.entities"
        class="w-[100%] mb-[15px]"
        @sort-change="onSortChange"
      >
        <!--顯示擴充欄位-->
        <el-table-column type="expand" v-if="expandColumns.length > 0">
          <template v-slot="props">
            <el-form label-position="left" inline class="ml-0 mb-0 w-[50%]">
              <el-form-item v-for="(column, index) in expandColumns" :key="index" :label="column.label">
                <span>{{ getColumnValue(column, props.$index) }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <!--顯示欄位-->
        <el-table-column
          v-for="(column, index) in normalColumns"
          :key="index"
          :label="column.label"
          :width="column.width"
          :sortable="column.sortable ? 'custom' : false"
        >
          <template v-slot="scope">{{ getColumnValue(column, scope.$index) }}</template>
        </el-table-column>
        <!--顯示操作列-->
        <el-table-column
          v-if="actions.length > 0"
          fixed="right"
          :label="$t('common.operate')"
          :width="actionColumnWidth"
        >
          <template v-slot="scope">
            <el-button-group>
              <el-tooltip
                v-for="(action, index) in actions"
                :key="index"
                effect="dark"
                :content="action.tip"
                :open-delay="1"
                placement="top"
              >
                <el-button
                  @click="handleAction(action, scope.$index)"
                  :type="action.type || 'primary'"
                  round
                  size="small"
                >
                  <img v-if="action.icon" :src="action.icon" class="w-[22px] h-[22px]" />
                  {{ action.text }}
                </el-button>
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分頁 -->
      <div class="block">
        <el-pagination
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
          :current-page="listDataDto.page"
          :page-sizes="[20, 50, 100]"
          :page-size="listDataDto.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagedResult.total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FilterOperator, ListDataDto, PagedResultDto } from '@/hero-api/dto/core.dto';
import { Action, Column } from '@/helper/interface/DataGrid';
import { MessageBox, TableColumn } from 'element-ui';
import { SortOrders } from 'element-ui/types/table-column';
import { Message } from '@/helper/class/Common';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import imgPath from '@/config/imgPath/imgPath';
import { FilterType } from '@/helper/enum/DataGrid';
import { MessageBoxInputData } from 'element-ui/types/message-box';
import FileHelper from '@/views/H5/Helper/FileHelper';
import TimeHelper from '@/views/H5/Helper/TimeHelper';
import { cellCallbackParams } from 'element-ui/types/table';

@Component({})
export default class DataGrid<T extends object> extends Vue {
  /** Import給Vue使用 */
  protected readonly FilterOperator = FilterOperator;
  protected readonly FilterType = FilterType;
  protected readonly imgPath = imgPath;

  /** 資料獲取函數  */
  @Prop({ type: Function, required: true }) readonly fetchApi: (listDataDto: ListDataDto) => Promise<PagedResultDto<T>>;
  /** 欄位 */
  @Prop({ type: Array, required: true }) readonly columns: Column[];
  /** 針對查詢結果的操作選項 */
  @Prop({ type: Array, default: () => [] }) readonly actions: Action[];
  /** 操作欄寬度 */
  @Prop({ type: Number, default: 220 }) readonly actionColumnWidth: number;
  /** 是否顯示篩選區塊 */
  @Prop({ type: Boolean, default: true }) readonly isShowFilterBlock: boolean;
  /** 是否開啟 debug 模式 */
  @Prop({ type: Boolean, default: false }) readonly debugFlag: boolean;
  /** 鎖定查詢欄位 */
  @Prop({ type: String, default: '' }) readonly lockFilterField: string;

  /** 表格標題Cell樣式 */
  @Prop({ type: Function, default: () => {} }) readonly tableHeaderCellStyle: (header: cellCallbackParams) => {};
  /** 表格內容Cell樣式 */
  @Prop({ type: Function, default: () => {} }) readonly tableCellStyle: (row: cellCallbackParams) => {};

  /**
   * 取得一般欄位(非展開欄位)
   * @returns 欄位列表
   */
  protected get normalColumns(): Column[] {
    return this.columns.filter((column) => column.expand === undefined || column.expand === false);
  }

  /**
   * 取得展開欄位
   * @returns 展開欄位列表
   */
  protected get expandColumns(): Column[] {
    return this.columns.filter((column) => column.expand);
  }

  /**
   * 取得可查詢的欄位
   * @returns 可查詢的欄位列表
   */
  protected get queryColumns(): Column[] {
    return this.columns.filter((column) => column.filterType !== undefined);
  }

  /** 進階查詢開關 */
  protected advancedSearch: boolean = false;
  /** 查詢參數 */
  protected listDataDto: ListDataDto = {
    page: 1,
    pageSize: 20,
    sortField: '',
    sortDescending: false,
    filterField: '',
    filterOperator: FilterOperator.Like,
    filterValue: '',
  };
  /** 查詢結果 */
  protected pagedResult: PagedResultDto<T> = {
    page: -1,
    pageSize: -1,
    total: -1,
    entities: [],
    result: '',
  };
  /** 是否載入中 */
  isLoading: boolean = true;

  created() {
    // 假如有鎖定查詢欄位
    if (this.lockFilterField) {
      // 依照鎖定欄位設定查詢參數
      const column = this.getColumnByKey(this.lockFilterField);
      this.listDataDto.filterField = column.key;
      this.onFilterFieldChange();
    }

    // 取得資料
    this.fetchData();
  }

  /** 取得列表資料 */
  protected async fetchData(): Promise<void> {
    this.isLoading = true;

    this.triggerOnFilterValueChangeEvent();
    this.pagedResult = await this.fetchApi(this.listDataDto);

    this.isLoading = false;
  }

  /** 觸發查詢值改變事件 */
  protected triggerOnFilterValueChangeEvent(): void {
    this.columns.forEach((column) => {
      // 如果 column 沒有 onChangeField 方法，則返回
      if (column.onFilterValueChange === undefined) {
        return;
      }

      // 如果 queryCondition 的 field 不等於 column 的 key，則返回
      if (this.listDataDto.filterField !== column.key) {
        return;
      }

      // 調用 onChangeField 方法
      if (this.listDataDto.filterValue) {
        column.onFilterValueChange(this.listDataDto.filterValue);
      }
    });
  }

  /**
   * 取得欄位
   * @param key 欄位 key
   * @returns 欄位
   */
  protected getColumnByKey(key: string): Column {
    const findColumn = this.queryColumns.find((column) => column.key === key);
    if (findColumn === undefined) {
      Helper.assert(ErrorId.VariableUndefined, `找不到欄位：${key}`);
      return {} as Column;
    }

    return findColumn;
  }

  /**
   * 取得欄位
   * @param label 欄位 label
   * @returns 欄位
   */
  protected getColumnByLabel(label: string): Column {
    const findColumn = this.queryColumns.find((column) => column.label === label);
    if (findColumn === undefined) {
      Helper.assert(ErrorId.VariableUndefined, `找不到欄位：${label}`);
      return {} as Column;
    }

    return findColumn;
  }

  /**
   * 取得欄位值
   * @param column 欄位
   * @param index 索引
   * @returns 欄位值
   */
  protected getColumnValue(column: Column, index: number): string {
    if (this.pagedResult === undefined || this.pagedResult.entities.length <= index) {
      return '';
    }

    const entity = this.pagedResult.entities[index];
    // 取得 entity 的所有欄位
    const entityEntries = Object.entries(entity);
    // 找到對應的欄位跟值
    const findEntry = entityEntries.find((entry) => entry[0] === column.key);
    if (findEntry === undefined) {
      Helper.assert(ErrorId.VariableUndefined, `找不到欄位：${column.key}`);
      return '';
    }

    // 如果欄位有 transform 函數，則使用 transform 函數來獲取值
    return column.transform ? column.transform(findEntry[1]) : findEntry[1];
  }

  /**
   * 取得查詢欄位的運算符列表
   * @returns 運算符列表
   */
  protected getQueryColumnOperatorList(): FilterOperator[] {
    const operatorList: FilterOperator[] = [];

    // 空值不處理
    if (this.listDataDto.filterField === undefined || this.listDataDto.filterField === '') {
      return operatorList;
    }

    const column = this.getColumnByKey(this.listDataDto.filterField);
    switch (column.filterType) {
      // 字串支援的運算符
      case FilterType.Text:
        operatorList.push(FilterOperator.Equal);
        operatorList.push(FilterOperator.Like);
        operatorList.push(FilterOperator.NotEqual);
        break;
      // 列舉支援的運算符
      case FilterType.Enum:
        operatorList.push(FilterOperator.Equal);
        operatorList.push(FilterOperator.NotEqual);
        break;
      // 未支援的類型
      default:
        Helper.assert(ErrorId.VariableUndefined, `未知的欄位類型：${column.filterType}`);
        break;
    }

    return operatorList;
  }

  /** 查詢欄位改變時的回調函數 */
  protected onFilterFieldChange(): void {
    // 空值不處理
    if (this.listDataDto.filterField === undefined || this.listDataDto.filterField === '') {
      return;
    }

    const column = this.getColumnByKey(this.listDataDto.filterField);
    switch (column.filterType) {
      // 文字查詢預設Like
      case FilterType.Text:
        this.listDataDto.filterOperator = FilterOperator.Like;
        break;
      // 列舉查詢預設Equal
      case FilterType.Enum:
        this.listDataDto.filterOperator = FilterOperator.Equal;
        break;
      // 未支援的類型
      default:
        Helper.assert(ErrorId.VariableUndefined, `未知的欄位類型：${column.filterType}`);
        break;
    }

    this.listDataDto.filterValue = column.defaultFieldValue || '';
  }

  /** 頁面Size改變回調函數 */
  protected onPageSizeChange(val: number): void {
    this.listDataDto.pageSize = val;
    this.fetchData();
  }

  /** 頁面改變回調函數 */
  protected onPageChange(val: number): void {
    this.listDataDto.page = val;
    this.fetchData();
  }

  /** 排序改變回調函數
   * @param event 排序事件 column 欄位資料 order 排序方式
   */
  protected onSortChange(event: { column: TableColumn; order: SortOrders }): void {
    const column = this.getColumnByLabel(event.column.label);
    this.listDataDto.sortField = column.key;
    this.listDataDto.sortDescending = event.order === 'descending';
    this.fetchData();
  }

  /**
   * 處理操作
   * @param action 操作
   * @param index 資料索引
   */
  protected handleAction(action: Action, index: number): void {
    // 取得對應列資料後呼叫操作綁定的事件
    const row = this.pagedResult.entities[index];
    this.$emit(action.eventId, row, this.pagedResult);
  }

  /** 查詢 */
  protected applyQuery(): void {
    this.listDataDto.page = 1;
    this.fetchData();
  }

  /** 匯出Excel */
  protected async exportExcel(): Promise<void> {
    this.isLoading = true;

    await MessageBox.prompt(this.$t('common.inputFileName').toString(), '提示', {
      confirmButtonText: '匯出',
      cancelButtonText: '取消',
    })
      .then(async (data) => {
        const inputData = data as MessageBoxInputData;
        const excelName = `${inputData.value}_${TimeHelper.getFileNameTimestamp()}.xlsx`;
        const jsonData = this.transformPagedResultToJson();
        FileHelper.exportJsonDataToExcel(excelName, jsonData);
        Message.success('成功');
      })
      .catch(() => {
        Message.info('取消匯出');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  /**
   * 轉換分頁結果為 JSON 格式
   * @returns JSON 格式化的資料
   */
  private transformPagedResultToJson(): Array<Record<string, any>> {
    const jsonData = this.pagedResult.entities.map((entity: T) => {
      const row: Record<string, any> = {};

      this.columns.forEach((column) => {
        const value = entity[column.key as keyof T];
        row[column.label] = column.transform ? column.transform(value) : value;
      });

      return row;
    });

    return jsonData;
  }

  /**
   * Debug訊息列印
   * @param value 要列印的值
   */
  protected debugMessage(value: any): void {
    console.log(JSON.stringify(value, null, 4));
    Message.info(JSON.stringify(value, null, 4));
  }
}
</script>

<style scoped lang="scss">
@media (max-width: 500px) {
  ::v-deep .el-pagination {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
  }
}
</style>
