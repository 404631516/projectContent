<template v-if="false">
  <!-- 背景 -->
  <div class="flex flex-col shadow-default" m="t-12" p="x-45 y-3.5" bg="[#F9F8F4]">
    <!-- 標題 -->
    <span text="left 3xl [#D69F05]" font="bold">{{ partyEventUpload.title }}</span>
    <!-- 預設區 -->
    <template v-if="partyEventUpload.isShowDefault">
      <template v-if="partyEventUpload.defaultUrl">
        <!-- 規格提示 -->
        <span text="left lg [#666666]">{{ defaultTitle }}</span>
        <!-- 預覽圖 -->
        <img class="w-112 object-contain" :src="partyEventUpload.defaultUrl" />
      </template>
      <span v-else text="left lg [#666666]">{{ partyEventUpload.defaultText }}</span>
      <hr size="2px" m="y-3" />
    </template>
    <!-- 客製化區 -->
    <!-- 規格提示 -->
    <span text="left lg [#666666]">{{ changeTitle }}</span>
    <!-- 顯示時段 -->
    <DatePicker
      class="flex"
      v-if="customUrlList.length > 0"
      :startDate="partyEventData.startAt"
      :endDate="partyEventData.endAt"
      @onPick="onPickDate($event, partyEventData)"
    />
    <!-- 上傳圖片 -->
    <el-upload
      class="custom-uploader"
      action=""
      list-type="picture-card"
      :file-list="customUrlList"
      :auto-upload="false"
      :on-change="onUploadImage"
      :on-remove="onRemoveImage"
      :class="{
        disabled: partyEventUpload.isSingleImage && customUrlList.length > 0,
        sprinkles: partyEventUpload.limitWidth === sprinklesWidth,
        titleImg: partyEventUpload.limitWidth === titleImgWidth,
      }"
    >
      <!-- 上傳區 -->
      <i class="el-icon-plus" />
    </el-upload>
  </div>
</template>
<script lang="ts">
import { Component, ModelSync, Prop, Vue } from 'vue-property-decorator';
import DatePicker from '@/components/BackEndManagement/_FormProp/DatePicker.vue';
import { PartyEventData, PartyEventUpload } from '@/helper/interface/BackEndManagement';
import { ElUploadInternalFileDetail, FileListItem } from 'element-ui/types/upload';
import FileHelper from '@/views/H5/Helper/FileHelper';
import { Message } from '@/helper/class/Common';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import BackEndHelper from '@/views/H5/Helper/BackEndHelper';

@Component({
  components: {
    DatePicker,
  },
})
export default class EventImageUpload extends Vue {
  /** 更換的活動資料 */
  @ModelSync('eventData', 'change') partyEventData!: PartyEventData;
  /** 上傳組件預設資料 */
  @Prop() private partyEventUpload!: PartyEventUpload;

  /** 標題前圖片寬度 */
  private readonly titleImgWidth: number = 100;
  /** 掉落物寬度 */
  private readonly sprinklesWidth: number = 64;
  /** 圖片格式限制 */
  private readonly imageFileTypeLimit: string[] = ['image/jpeg', 'image/png'];

  /** 文字資料 */
  private textData = {
    defaultImage: '預設圖',
    changeImage: '變更圖',
  };

  /** 預設標題 */
  private get defaultTitle(): string {
    return `${this.textData.defaultImage} (${this.partyEventUpload.limitWidth} x ${this.partyEventUpload.limitHeight} ${this.partyEventUpload.limitSize}MB)`;
  }

  /** 替換標題 */
  private get changeTitle(): string {
    return `${this.textData.changeImage} (${this.partyEventUpload.limitWidth} x ${this.partyEventUpload.limitHeight} ${this.partyEventUpload.limitSize}MB)`;
  }

  /** 客製化圖片路徑 */
  private get customUrlList(): FileListItem[] {
    return this.toFileListItemList(this.partyEventData);
  }

  /** 選擇設定開啟時間&結束時間
   * @param pickedDate
   */
  private onPickDate(pickedDate: string[], partyEventData: PartyEventData): void {
    BackEndHelper.onPickDate(pickedDate, partyEventData);
  }

  /** 轉換成檔案格式
   * @param partyEventData
   */
  private toFileListItemList(partyEventData: PartyEventData): FileListItem[] {
    // 上傳資料為空
    if (partyEventData.argValue === '') {
      return [];
    }
    // 只上傳一張圖片
    else if (this.partyEventUpload.isSingleImage) {
      return [{ name: '', url: partyEventData.argValue }];
    }
    // 上傳多張圖片
    else {
      const fileListItemList: string[] = JSON.parse(partyEventData.argValue);
      return fileListItemList.map<FileListItem>((url) => {
        return { name: '', url };
      });
    }
  }

  /** 上傳客製化圖片
   * @param file
   * @param fileList
   */
  private async onUploadImage(
    file: ElUploadInternalFileDetail,
    fileList: ElUploadInternalFileDetail[]
  ): Promise<boolean> {
    // 檢查圖片限制條件
    if ((await this.isImageFileValid(file)) === false) {
      fileList.pop();
      return false;
    }

    // 轉換圖片為base64
    const imageUrl = await FileHelper.uploadBase64(file.raw);
    // 上傳一張圖片
    if (this.partyEventUpload.isSingleImage) {
      this.partyEventData.argValue = imageUrl;
      this.partyEventData.isClear = false;
    }
    // 上傳多張圖片
    else {
      // 第一筆
      if (this.partyEventData.argValue === '') {
        this.partyEventData.argValue = `["${imageUrl}"]`;
      }
      // 加入陣列
      else {
        const imageList: string[] = JSON.parse(this.partyEventData.argValue);
        imageList.push(imageUrl);
        this.partyEventData.argValue = JSON.stringify(imageList);
      }
      this.partyEventData.isClear = false;
    }

    return true;
  }

  /** 圖片檔案是否有效
   * @param uploadFile
   */
  public async isImageFileValid(uploadFile: ElUploadInternalFileDetail): Promise<boolean> {
    // 檢查檔案格式
    if (this.imageFileTypeLimit.includes(uploadFile.raw.type) === false) {
      Message.warn('上傳格式不符!');
      return false;
    }

    // 檢查檔案大小
    if (uploadFile.size / 1024 / 1024 > this.partyEventUpload.limitSize) {
      Message.warn(`上傳圖片大小不能超過 ${this.partyEventUpload.limitSize}MB!`);
      return false;
    }

    // 檢查圖片大小
    const url = window.URL.createObjectURL(uploadFile.raw);
    let isLoadDone: boolean = false;
    const image = new Image();
    image.onload = () => (isLoadDone = true);
    image.onerror = () => (isLoadDone = true);
    image.src = url;

    await AsyncHelper.pendingUntil(() => {
      return isLoadDone;
    });

    if (image.height !== this.partyEventUpload.limitHeight || image.width !== this.partyEventUpload.limitWidth) {
      this.$message.error('圖片大小不符!');
      return false;
    }

    // 圖片沒問題
    return true;
  }

  /** 移除客製化圖片
   * @param file
   * @param fileList
   */
  private onRemoveImage(file: ElUploadInternalFileDetail, fileList: ElUploadInternalFileDetail[]): void {
    // 一張圖片移除
    if (this.partyEventUpload.isSingleImage) {
      BackEndHelper.clearPartyEventData(this.partyEventData);
    }
    // 多張圖片移除一張
    else {
      const imageList: string[] = JSON.parse(this.partyEventData.argValue);
      // 防呆
      if (imageList.length === 0) {
        return;
      }
      // 最後一筆, 直接清除設定
      else if (imageList.length === 1) {
        BackEndHelper.clearPartyEventData(this.partyEventData);
      }
      // 清除指定圖片
      else {
        const index = imageList.findIndex((url) => url === file.url);
        if (index > -1) {
          imageList.splice(index, 1);
          this.partyEventData.argValue = JSON.stringify(imageList);
        }
      }
    }
  }
}
</script>
<style>
.custom-uploader {
  display: flex;
  flex-direction: column;
  margin-top: 0.75rem;
}
.custom-uploader .el-upload-list--picture-card {
  display: flex;
  flex-direction: column;
}
.custom-uploader.disabled .el-upload--picture-card {
  display: none !important;
}
.custom-uploader.sprinkles .el-upload--picture-card {
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  color: #8c939d;
  background-color: #fff;
  border: 1px dashed #c0ccda;
}
.custom-uploader .el-upload-list--picture-card .el-upload-list__item {
  width: 448px;
  height: auto;
}
.custom-uploader.sprinkles .el-upload-list--picture-card .el-upload-list__item {
  width: 44px;
  height: auto;
}
.custom-uploader.titleImg .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: auto;
}
.custom-uploader .el-upload-list__item.is-success .el-upload-list__item-status-label {
  display: none;
}
</style>
