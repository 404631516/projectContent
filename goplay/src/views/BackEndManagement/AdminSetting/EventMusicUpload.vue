<template v-if="false">
  <!-- 背景 -->
  <div class="flex flex-col shadow-default" m="t-12" p="x-45 y-3.5" bg="[#F9F8F4]">
    <!-- 標題 -->
    <span text="left 3xl [#D69F05]" font="bold">{{ partyEventUpload.title }}</span>
    <!-- 預設區 -->
    <template v-if="partyEventUpload.isShowDefault">
      <span text="left lg [#666666]">{{ textData.bgmDefaultTitle }}</span>
      <audio :src="partyEventUpload.defaultUrl" controls />
    </template>
    <!-- 客製化區 -->
    <span text="left lg [#666666]">{{ textData.bgmCustomTitle }}</span>
    <!-- 有設定 -->
    <template v-if="musicUrl">
      <!-- 顯示時段 -->
      <DatePicker
        class="flex"
        :startDate="partyEventData.startAt"
        :endDate="partyEventData.endAt"
        @onPick="onPickDate($event, partyEventData)"
      />
      <!-- 預覽音樂 -->
      <audio audio :src="musicUrl" controls />
      <!-- 移除按鈕 -->
      <button
        class="w-max rounded-[30px] from-[#FF9191] to-[#FF5169]"
        p="x-5 y-1"
        bg="gradient-to-b"
        @click="onRemoveCustomMusic(partyEventData)"
      >
        <p text="xl [#FFFFFF] shadow-lightDefault">{{ textData.bgmRemoveTitle }}</p>
      </button>
    </template>
    <!-- 無設定 -->
    <template v-else>
      <!-- 上傳音樂 -->
      <el-upload
        class="custom-uploader music-uploader"
        action=""
        :auto-upload="false"
        :show-file-list="false"
        :on-change="onUploadMusic"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, ModelSync, Prop, Vue } from 'vue-property-decorator';
import DatePicker from '@/components/BackEndManagement/_FormProp/DatePicker.vue';
import { PartyEventData, PartyEventUpload } from '@/helper/interface/BackEndManagement';
import { ElUploadInternalFileDetail } from 'element-ui/types/upload';
import FileHelper from '@/views/H5/Helper/FileHelper';
import { Message } from '@/helper/class/Common';
import BackEndHelper from '@/views/H5/Helper/BackEndHelper';

@Component({
  components: {
    DatePicker,
  },
})
export default class EventMusicUpload extends Vue {
  /** 更換的活動資料 */
  @ModelSync('eventData', 'change') partyEventData!: PartyEventData;
  /** 上傳組件預設資料 */
  @Prop() private partyEventUpload!: PartyEventUpload;

  /** 音樂格式限制 */
  private readonly musicFileTypeLimit: string[] = ['audio/mp3', 'audio/mpeg'];

  /** 文字資料 */
  private textData = {
    bgmDefaultTitle: `預設${this.partyEventUpload.title} (${this.partyEventUpload.limitSize}MB)`,
    bgmCustomTitle: `更換${this.partyEventUpload.title} (${this.partyEventUpload.limitSize}MB)`,
    bgmRemoveTitle: `移除${this.partyEventUpload.title}`,
  };

  /** 客製化背景音樂 */
  private get musicUrl(): string {
    return this.partyEventData.argValue;
  }

  /** 選擇設定開啟時間&結束時間
   * @param pickedDate
   */
  private onPickDate(pickedDate: string[], partyEventData: PartyEventData): void {
    BackEndHelper.onPickDate(pickedDate, partyEventData);
  }

  /** 上傳背景音樂
   * @param file
   * @param fileList
   */
  private async onUploadMusic(file: ElUploadInternalFileDetail): Promise<boolean> {
    // 檢查圖片限制條件
    if (this.isMusicFileValid(file) === false) {
      return false;
    }

    // 上傳圖片
    this.partyEventData.argValue = await FileHelper.uploadBase64(file.raw);
    this.partyEventData.isClear = false;

    return true;
  }

  /** 移除客製化音樂
   *  @param partyEventData
   */
  private onRemoveCustomMusic(partyEventData: PartyEventData): void {
    BackEndHelper.clearPartyEventData(partyEventData);
  }

  /** 音樂檔案是否有效
   * @param uploadFile
   */
  private isMusicFileValid(uploadFile: ElUploadInternalFileDetail): boolean {
    // 檢查檔案格式
    if (this.musicFileTypeLimit.includes(uploadFile.raw.type) === false) {
      Message.warn('上傳格式不符!');
      return false;
    }

    // 檢查檔案大小
    if (uploadFile.size / 1024 / 1024 > this.partyEventUpload.limitSize) {
      Message.warn(`上傳音樂大小不能超過 ${this.partyEventUpload.limitSize}MB!`);
      return false;
    }

    return true;
  }
}
</script>
<style>
.custom-uploader {
  display: flex;
  flex-direction: column;
  margin-top: 0.75rem;
}
.custom-uploader.music-uploader .el-upload--text {
  width: 300px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  color: #8c939d;
  background-color: #fff;
  border: 1px dashed #c0ccda;
}
</style>
