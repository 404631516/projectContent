<template>
  <div class="flex flex-col items-center" text="[#666666]">
    <!-- 問卷名稱 -->
    <div class="w-978px items-center grid grid-cols-[10px,80px,888px]" m="b-5">
      <p text="[#FF4E4E]">*</p>
      {{ textData.title }}
      <input
        v-model.trim="questionForm.title"
        type="text"
        :disabled="isPublish"
        :class="isPublish ? '' : 'border-solid border-1px border-[#B7B7B7]'"
        m="l-72px"
        p="x-3 y-4"
      />
    </div>
    <!-- 問卷副標題 -->
    <div class="w-978px items-center grid grid-cols-[110px,868px]" m="b-5">
      <p m="l-10px">{{ textData.subTitle }}</p>
      <input
        v-model.trim="questionForm.titleSub"
        type="text"
        :disabled="isPublish"
        :class="isPublish ? '' : 'border-solid border-1px border-[#B7B7B7]'"
        w="816px"
        m="l-52px"
        p="x-3 y-4"
      />
    </div>
    <!-- 問卷活動日期 -->
    <div class="w-978px items-center grid grid-cols-[10px,120px,848px]" m="b-5">
      <p text="[#FF4E4E]">*</p>
      {{ textData.date }}
      <span class="flex justify-start items-center" m="l-32px" p="x-3 y-4">
        <p text="18px">{{ textData.start }}</p>
        <el-date-picker
          v-model="questionForm.startAt"
          type="datetime"
          format="yyyy/MM/dd HH:mm"
          :disabled="isStart"
          :placeholder="textData.pickDate"
          :picker-options="pickerOptions"
          m="l-14px"
        />
        <p text="[#979797]" m="x-2">—</p>
        <p text="18px">{{ textData.end }}</p>
        <el-date-picker
          v-model="questionForm.endAt"
          type="datetime"
          format="yyyy/MM/dd HH:mm"
          :disabled="isEnd"
          :placeholder="textData.pickDate"
          :picker-options="pickerOptions"
          m="l-14px"
        />
      </span>
    </div>
    <!-- 活動圖片上傳 -->
    <div class="w-978px flex justify-start items-start" m="b-5">
      <p class="inline-block" m="l-10px t-3">{{ textData.contentPics }}</p>
      <el-upload
        action=""
        list-type="picture"
        :file-list="contentPicsList"
        :auto-upload="false"
        :on-change="onUploadContentPics"
        :on-remove="onRemoveContentPics"
        :disabled="isEnd"
        class="w-300px"
        m="l-30px"
      >
        <div slot="trigger" class="w-300px flex justify-start">
          <button p="15px" bg="[#18BBD5]" border="rounded-5px" text="[#FFF]">
            {{ textData.clickToUpload }}
          </button>
        </div>
        <p class="leading-normal" m="t-1" text="left 18px">{{ textData.contentPicsText }}</p>
      </el-upload>
    </div>
    <!-- 內容說明連結 -->
    <div class="w-978px items-center grid grid-cols-[130px,848px]" m="b-5">
      <p m="l-10px">{{ textData.referLink }}</p>
      <input
        v-model.trim="questionForm.referLink"
        type="text"
        :placeholder="isPublish ? textData.none : textData.enterreferLink"
        :disabled="isEnd"
        w="816px"
        m="l-32px"
        p="x-3 y-4"
        border="solid 1px [#B7B7B7]"
      />
    </div>
    <!-- 問卷內容說明 -->
    <div class="w-978px items-start grid grid-cols-[10px,120px,848px]" m="b-5">
      <p m="t-16px" text="[#FF4E4E]">*</p>
      <p m="t-16px">{{ textData.content }}</p>
      <textarea
        v-model.trim="questionForm.content"
        :placeholder="textData.enterContent"
        :disabled="isEnd"
        w="816px"
        h="180px"
        m="l-32px"
        p="x-3 y-4"
        border="solid 1px [#B7B7B7]"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { base64UploadAPI } from '@/api/backend';
import config from '@/config/setting';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { QuestionnaireData } from '@/helper/interface/Questionnaire';
import dayjs from 'dayjs';
import { Message } from 'element-ui';
import { ElUploadInternalFileDetail, FileListItem } from 'element-ui/types/upload';
import { Component, Vue, VModel, Prop } from 'vue-property-decorator';
import DatePicker from '../_FormProp/DatePicker.vue';
import FileHelper from '@/views/H5/Helper/FileHelper';
import { isPassed } from '../../../manager/TimeSyncManager';

@Component({
  components: { DatePicker },
})
export default class QuestionnaireDetail extends Vue {
  /** 問卷資料 */
  @VModel() private questionForm!: QuestionnaireData;

  /** 是否已發布 */
  @Prop(Boolean) private isPublish!: boolean;

  /** 是否已開始 */
  private isStart: boolean = false;
  /** 是否已結束 */
  private isEnd: boolean = false;
  /** 上傳圖片檔清單 */
  private contentPicsList: FileListItem[] = [];
  /** 圖片格式限制 */
  private readonly imageFileTypeLimit: string[] = ['image/jpeg', 'image/png'];
  /** 問卷活動圖片檔案大小限制 */
  private readonly imageSizeMax: number = 0.5;

  /** 日期選擇限制 */
  private pickerOptions = {
    disabledDate: (time: Date) => {
      const currentTime = dayjs().subtract(1, 'day');
      return dayjs(time.getTime()) < currentTime;
    },
  };

  /** 文字資料 */
  private textData = {
    title: '問卷名稱',
    subTitle: '問卷副標題',
    date: '問卷活動日期',
    start: '起始時間',
    end: '結束時間',
    pickDate: '請選擇日期',
    contentPics: '活動圖片上傳',
    contentPicsText: '上傳檔案格式為jpg/png,並且大小不超過0.5mb,建議尺寸為寬度800像素,高度不限',
    clickToUpload: '點擊上傳',
    enterImageUrl: '請輸入圖片連結網址',
    referLink: '內容說明連結',
    enterreferLink: '請輸入連結網址',
    content: '問卷內容說明',
    enterContent: '請輸入內容說明文字',
    none: '無',
  };

  created() {
    // 讀取問卷活動圖片加入預覽
    this.contentPicsList = this.questionForm.contentPics.map((picture, index) => {
      return { name: `已上傳-${index}`, url: picture };
    });
    this.isStart = isPassed(this.questionForm.startAt);
    this.isEnd = isPassed(this.questionForm.endAt);
  }

  /** 上傳問卷資訊圖片
   * @param file
   * @param fileList
   */
  private async onUploadContentPics(
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
    this.questionForm.contentPics.push(imageUrl);
    return true;
  }

  /** 移除問卷資訊圖片
   * @param file
   * @param fileList
   */
  private onRemoveContentPics(file: ElUploadInternalFileDetail, fileList: ElUploadInternalFileDetail[]): void {
    const imageList: string[] = this.questionForm.contentPics;
    // 防呆
    if (imageList.length === 0) {
      return;
    }
    // 清除指定圖片
    else {
      const index = imageList.findIndex((url) => url === file.url);
      if (index > -1) {
        imageList.splice(index, 1);
      }
    }
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
      Message.error(`${e}`);
      Message.warning(`${file.name}上傳失敗`);
      return '';
    }
  }

  /** 圖片檔案是否有效
   * @param uploadFile
   */
  private async isImageFileValid(uploadFile: ElUploadInternalFileDetail): Promise<boolean> {
    // 檢查檔案格式
    if (this.imageFileTypeLimit.includes(uploadFile.raw.type) === false) {
      Message.warning('上傳格式不符!');
      return false;
    }

    // 檢查檔案大小
    if (uploadFile.size / 1024 / 1024 > this.imageSizeMax) {
      Message.warning(`上傳圖片大小不能超過 ${this.imageSizeMax}MB!`);
      return false;
    }

    // 圖片沒問題
    return true;
  }
}
</script>
