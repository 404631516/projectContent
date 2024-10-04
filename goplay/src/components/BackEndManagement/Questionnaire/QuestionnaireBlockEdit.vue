<template>
  <div
    :class="{ 'bg-[#FFC4C4] bg-opacity-50': errorMessageList.length > 0 }"
    text="24px [#707070]"
    p="x-20px y-15px"
    border="rounded-10px 1px solid [#707070]"
  >
    <div class="handle flex justify-center" m="b-2"><img :src="imgData.moveDot" /></div>
    <div class="flex items-center">
      <span text="20px">{{ `${questionIndex + 1}.` }}</span>
      <!-- 題目 -->
      <input
        v-model="questionBlockData.questionMain"
        type="text"
        :placeholder="textData.question"
        :disabled="isPublish"
        :class="{ 'bg-[#F3F3F3] border-1px border-solid border-[#BFBFBF]': !isPublish }"
        text="[#636363]"
        class="w-900px"
        m="l-15px"
        p="10px"
      />
      <!-- 題型選擇 -->
      <div class="w-180px" m="l-30px">
        <template v-if="!isPublish">
          <SelectList
            :selectItemList="typeOptions"
            :selectedItem="questionBlockData.optionType"
            :placeholder="textData.pickOptionType"
            :isLock="false"
            :popperClassName="'reward'"
            @onSelect="onSelectOptionType"
          />
        </template>
        <template v-else>
          <span text="[#00CCCE]">{{ getOptionTypeName(questionBlockData.optionType) }}</span>
        </template>
      </div>
    </div>
    <div class="flex justify-between" p="r-20px">
      <!-- 選項區域 -->
      <!-- 簡答 -->
      <QuestionnaireBlockText
        ref="blockText"
        v-show="questionBlockData.optionType === OptionType.Text"
        v-model="questionBlockData.optionArg"
        :isEdit="isPublish"
        m="l-10"
      />
      <!-- 單選 -->
      <QuestionnaireBlockOneSelect
        ref="blockOneSelect"
        v-show="questionBlockData.optionType === OptionType.OneSelect"
        v-model="questionBlockData.optionArg"
        :isEdit="isPublish"
        m="l-10"
      />
      <!-- 多選題 -->
      <QuestionnaireBlockMultiSelect
        ref="blockMultiSelect"
        v-show="questionBlockData.optionType >= OptionType.LessSelect"
        v-model="questionBlockData.optionArg"
        :optionType="questionBlockData.optionType"
        :isEdit="isPublish"
        m="l-10"
      />
      <!-- 錯誤訊息 -->
      <div class="flex flex-col" m="t-20px">
        <div v-for="(errorText, index) in errorMessageList" :key="index" m="b-10px">
          <span class="flex items-center" text="[#FF6A6A] 18px">
            <img :src="imgData.warningIcon" m="r-2" />{{ errorText }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <div class="w-[98%] h-1px" m="t-10" border="solid b-1px [#707070]"></div>
    </div>
    <div class="flex justify-between items-center" m="t-5 l-3">
      <!-- 上傳圖片 -->
      <div class="flex items-center">
        <img :src="imgData.imgIcon" />
        {{ textData.picture }}
        <el-upload
          action=""
          list-type="picture"
          :file-list="questionPicsList"
          :auto-upload="false"
          :limit="questionPicsLimit"
          :on-change="onUploadQuestionPics"
          :on-remove="onRemoveQuestionPics"
          :disabled="isPublish"
          class="flex items-center"
          m="l-10px"
        >
          <button
            v-if="!isPublish && questionBlockData.questionSub.length === 0"
            p="15px"
            m="x-5"
            bg="[#18BBD5]"
            border="rounded-5px"
            text="[#FFF]"
          >
            {{ textData.clickToUpload }}
          </button>
        </el-upload>
      </div>
      <!-- 按鈕區 -->
      <div class="flex items-center">
        <!-- 未發佈 -->
        <template v-if="!isPublish">
          <!-- 複製區塊 -->
          <button class="flex items-center" text="[#FFF]" bg="[#18BBD5]" m="l-50px" p="10px" @click="onCopyBlock">
            <img :src="imgData.copyIcon" m="r-1" />{{ textData.cloneBlock }}
          </button>
          <!-- 刪除區塊 -->
          <button class="flex items-center" text="[#FFF]" bg="[#FF5875]" m="l-5" p="10px" @click="onDeleteBlock">
            <img :src="imgData.deleteIcon" m="r-1" />{{ textData.delete }}
          </button>
          <span class="h-56px w-3px" m="l-30px" bg="[#DCDCDC]"></span>
          <!-- 必填開關 -->
          <span m="l-5">{{ textData.required }}</span>
          <div
            class="w-82px h-31px shadow-box flex items-center"
            m="l-2"
            :class="isRequiredSwitch ? 'bg-[#57F3FF]' : 'bg-[#E6E6E6]'"
            border="rounded-30px"
            @click="onClickRequired"
          >
            <span
              class="w-39px h-39px inline-block shadow-button"
              :class="{ 'transition transform translate-x-50px': isRequiredSwitch }"
              bg="[#FFFFFF]"
              border="rounded-full"
            ></span>
          </div>
        </template>
        <!-- 已發佈 -->
        <template v-else>
          <!-- 題目開關 -->
          <img m="l-75" :src="isClosedSwitch ? imgData.closedIcon : imgData.openIcon" />
          <span m="l-1">
            {{ isClosedText }}
          </span>
          <div
            class="w-82px h-31px shadow-box flex items-center"
            m="l-2"
            :class="isClosedSwitch ? 'bg-[#E6E6E6]' : 'bg-[#57F3FF]'"
            border="rounded-30px"
            @click="onClickClosed"
          >
            <span
              class="w-39px h-39px inline-block shadow-button"
              :class="{ 'transition transform translate-x-50px': !isClosedSwitch }"
              bg="[#FFFFFF]"
              border="rounded-full"
            ></span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { base64UploadAPI } from '@/api/backend';
import imgPath from '@/config/imgPath/imgPath';
import config from '@/config/setting';
import { Message } from '@/helper/class/Common';
import { DBBoolean, ResponseState } from '@/helper/enum/Common';
import { OptionType, OptionTypeName } from '@/helper/enum/Questionnaire';
import { handleAPIError } from '@/helper/fnc/common';
import { SelectOption } from '@/helper/interface/BackEndManagement';
import { IQuestionBlock, QuestionBlockData } from '@/helper/interface/Questionnaire';
import { ElUploadInternalFileDetail, FileListItem } from 'element-ui/types/upload';
import { Component, Vue, VModel, Prop, Emit, Watch } from 'vue-property-decorator';
import SelectList from '../_FormProp/SelectList.vue';
import QuestionnaireBlockMultiSelect from './QuestionnaireBlockMultiSelect.vue';
import QuestionnaireBlockOneSelect from './QuestionnaireBlockOneSelect.vue';
import QuestionnaireBlockText from './QuestionnaireBlockText.vue';
import FileHelper from '@/views/H5/Helper/FileHelper';

@Component({
  components: {
    SelectList,
    QuestionnaireBlockText,
    QuestionnaireBlockOneSelect,
    QuestionnaireBlockMultiSelect,
  },
})
export default class QuestionnaireBlockEdit extends Vue {
  /** 題目資料 */
  @VModel({}) private questionBlockData!: QuestionBlockData;
  /** 題目位置 */
  @Prop(Number) private questionIndex!: number;
  /** 是否已發布 */
  @Prop(Boolean) private isPublish!: boolean;

  private OptionType = OptionType;

  /** 錯誤訊息 */
  private errorMessageList: string[] = [];
  /** 上傳圖片檔清單 */
  private questionPicsList: FileListItem[] = [];
  /** 圖片格式限制 */
  private readonly imageFileTypeLimit: string[] = ['image/jpeg', 'image/png'];
  /** 問卷活動圖片檔案大小限制 */
  private readonly imageSizeMax: number = 0.5;

  /** 題目圖片數量限制 */
  private readonly questionPicsLimit: number = 1;

  /** 必填開關 */
  private get isRequiredSwitch(): boolean {
    return this.questionBlockData.isRequire === DBBoolean.True;
  }

  /** 必填開關 */
  private get isClosedSwitch(): boolean {
    return this.questionBlockData.isClose === DBBoolean.True;
  }

  /** 取得關閉按鈕文字 */
  private get isClosedText(): string {
    return this.questionBlockData.isClose ? '題目關閉' : '題目開啟';
  }

  /** 取得題目種類ref */
  private get currentBlock(): IQuestionBlock {
    switch (this.questionBlockData.optionType) {
      case OptionType.Text:
        return this.$refs.blockText;
      case OptionType.OneSelect:
        return this.$refs.blockOneSelect;
      case OptionType.LessSelect:
      case OptionType.EqualSelect:
      case OptionType.MoreSelect:
        return this.$refs.blockMultiSelect;
    }
  }

  /** 題型選項 */
  private typeOptions: SelectOption[] = [
    { label: this.getOptionTypeName(OptionType.Text), value: OptionType.Text },
    { label: this.getOptionTypeName(OptionType.OneSelect), value: OptionType.OneSelect },
    { label: this.getOptionTypeName(OptionType.LessSelect), value: OptionType.LessSelect },
    { label: this.getOptionTypeName(OptionType.EqualSelect), value: OptionType.EqualSelect },
    { label: this.getOptionTypeName(OptionType.MoreSelect), value: OptionType.MoreSelect },
  ];

  public $refs!: {
    blockText: QuestionnaireBlockText;
    blockOneSelect: QuestionnaireBlockOneSelect;
    blockMultiSelect: QuestionnaireBlockMultiSelect;
  };

  /** 文字資料 */
  private textData = {
    question: '題目',
    pickOptionType: '選擇題型',
    picture: '圖片',
    enterPictureUrl: '請輸入圖片網址',
    cloneBlock: '複製區塊',
    delete: '刪除',
    required: '必填',
    clickToUpload: '點擊上傳',
  };

  /** 圖片資料 */
  private imgData = {
    copyIcon: imgPath.copyIcon,
    deleteIcon: imgPath.trashIcon,
    moveDot: imgPath.moveDot,
    imgIcon: imgPath.imageIcon,
    openIcon: imgPath.eyeIcon,
    closedIcon: imgPath.eyeHiddenIcon,
    warningIcon: imgPath.warning,
  };

  created() {
    // 讀取問卷活動圖片加入預覽
    if (this.questionBlockData.questionSub.length > 0) {
      this.questionPicsList = [{ name: `已上傳`, url: this.questionBlockData.questionSub }];
    }
  }

  /** 題目驗證 */
  public isQuestionBlockValid(): string[] {
    const errorMessage: string[] = [];
    // 題目不可為空
    if (this.questionBlockData.questionMain == null || this.questionBlockData.questionMain.length === 0) {
      errorMessage.push('題目不可為空!');
    }
    this.errorMessageList = errorMessage.concat(this.currentBlock.checkBlock());
    return this.errorMessageList;
  }

  /** 選擇題型
   *  @param optionType
   */
  private onSelectOptionType(optionType: OptionType): void {
    this.questionBlockData.optionType = optionType;
    switch (this.questionBlockData.optionType) {
      // 簡答題清空選項
      case OptionType.Text:
        this.questionBlockData.optionArg.options = [];
        this.questionBlockData.optionArg.limitCount = 0;
        break;
      // 單選題選項限制設定為1
      case OptionType.OneSelect:
        this.questionBlockData.optionArg.limitCount = 1;
        break;
      // 多選題選項限制設定為2
      case OptionType.LessSelect:
      case OptionType.EqualSelect:
      case OptionType.MoreSelect:
        this.questionBlockData.optionArg.limitCount = 2;
        break;
      default:
        console.error(`選擇題型錯誤,題型=${this.questionBlockData.optionType}`);
    }
  }

  /** 點擊必填開關 */
  private onClickRequired(): void {
    if (this.questionBlockData.isRequire === DBBoolean.False) {
      this.questionBlockData.isRequire = DBBoolean.True;
    } else {
      this.questionBlockData.isRequire = DBBoolean.False;
    }
  }

  /** 點擊題目開關 */
  private onClickClosed(): void {
    if (this.questionBlockData.isClose === DBBoolean.False) {
      this.questionBlockData.isClose = DBBoolean.True;
      this.onCloseBlock();
    } else {
      this.questionBlockData.isClose = DBBoolean.False;
      this.onOpenBlock();
    }
  }

  /** 上傳問卷資訊圖片
   * @param file
   * @param fileList
   */
  private async onUploadQuestionPics(
    file: ElUploadInternalFileDetail,
    fileList: ElUploadInternalFileDetail[]
  ): Promise<boolean> {
    // 檢查圖片限制條件
    if ((await this.isImageFileValid(file)) === false) {
      fileList.pop();
      return false;
    }

    // 上傳圖片
    const imageUrl = await this.uploadImageBase64(file.raw);
    this.questionBlockData.questionSub = imageUrl;
    return true;
  }

  /** 移除問卷資訊圖片
   * @param file
   * @param fileList
   */
  private onRemoveQuestionPics(file: ElUploadInternalFileDetail, fileList: ElUploadInternalFileDetail[]): void {
    // 防呆
    if (this.questionBlockData.questionSub.length === 0) {
      return;
    }

    // 清除圖片
    this.questionBlockData.questionSub = '';
  }

  /** 上傳Base64圖片
   * @param file
   */
  private async uploadImageBase64(file: File): Promise<string> {
    // 組成封包資料
    const data = {
      tag: 'AdminSetting',
      fileName: file.name,
      fileType: file.type,
      base64String: await FileHelper.toBase64(file),
    };

    try {
      // API 上傳Base64圖片
      const response: any = await base64UploadAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 返回圖片url
      return `${config.cloudStorage}${response.url}`;
    } catch (e) {
      console.error(`${e}`);
      return '';
    }
  }

  /** 圖片檔案是否有效
   * @param uploadFile
   */
  private async isImageFileValid(uploadFile: ElUploadInternalFileDetail): Promise<boolean> {
    // 檢查檔案格式
    if (this.imageFileTypeLimit.includes(uploadFile.raw.type) === false) {
      Message.warn('上傳格式不符!');
      return false;
    }

    // 檢查檔案大小
    if (uploadFile.size / 1024 / 1024 > this.imageSizeMax) {
      Message.warn(`上傳圖片大小不能超過 ${this.imageSizeMax}MB!`);
      return false;
    }

    // 圖片沒問題
    return true;
  }

  /** 轉換題型中文名稱
   * @param optionType
   */
  private getOptionTypeName(optionType: OptionType): string {
    const nameKey = OptionType[optionType];
    return Object.entries(OptionTypeName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤種類';
  }

  /** 偵測題目更動 */
  @Watch('questionBlockData', { deep: true })
  private onSave(questionBlock: QuestionBlockData) {
    // 已發佈題目不能改
    if (this.isPublish === false) {
      // 驗證題目
      if (this.isQuestionBlockValid().length > 0) {
        return;
      }

      // 儲存題目
      this.saveQuestionBlock();
    }
  }

  /** 複製問題 */
  @Emit('onCopyBlock')
  private onCopyBlock(): void {
    return;
  }

  /** 刪除問題 */
  @Emit('onDeleteBlock')
  private onDeleteBlock(): void {
    return;
  }

  /** 儲存題目 */
  @Emit('saveQuestionBlock')
  private saveQuestionBlock(): void {
    return;
  }

  /** 關閉問題 */
  @Emit('onCloseBlock')
  private onCloseBlock(): void {
    return;
  }

  /** 開啟問題 */
  @Emit('onOpenBlock')
  private onOpenBlock(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-select .el-input.el-input--suffix .el-input__inner {
  color: #4b4b4b !important;
  font-size: 20px !important;
}
.shadow-box {
  box-shadow: inset 0px 0px 6px #2a2a2a85;
}
.shadow-button {
  box-shadow: 0px 0px 6px #34343480;
}
::placeholder {
  color: #636363;
}
</style>
