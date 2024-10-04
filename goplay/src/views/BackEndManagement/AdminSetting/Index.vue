<template>
  <div>
    <!-- 上方標題 -->
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <!-- 設定選項 -->
    <ul v-if="isShow" m="b-43.5">
      <template v-for="partyData in partyEventUploadList">
        <!-- 圖片上傳 -->
        <EventImageUpload
          v-if="partyData.uploadType === EventUploadType.Image"
          v-model="partyData.partyEventData"
          :key="partyData.title"
          :partyEventUpload="partyData"
        />
        <!-- 音樂上傳 -->
        <EventMusicUpload
          v-if="partyData.uploadType === EventUploadType.Music"
          v-model="partyData.partyEventData"
          :key="partyData.title"
          :partyEventUpload="partyData"
        />
        <!-- 顏色上傳 -->
        <EventColorUpload
          v-if="partyData.uploadType === EventUploadType.Color"
          v-model="partyData.partyEventData"
          :key="partyData.title"
          :partyEventUpload="partyData"
        />
      </template>
    </ul>
    <!-- 儲存按鈕 -->
    <div class="w-full h-30 flex items-center justify-center absolute bottom-0" bg="[#000000CC]">
      <button class="rounded-[30px] yellowGradient" p="x-17 y-3" :disabled="isSaving" @click="onSave">
        <p text="xl [#FFFFFF] shadow-lightDefault">{{ textData.onSaveTitle }}</p>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import { PartyEventEditData, PartyEventUpload } from '../../../helper/interface/BackEndManagement';
import { ResponseState } from '../../../helper/enum/Common';
import { partyEventEditAPI } from '@/api/backend';
import { handleAPIError } from '@/helper/fnc/common';
import router from '../../../router';
import { Message } from '../../../helper/class/Common';
import audioPath from '../../../config/audioPath';
import BackEndHelper from '@/views/H5/Helper/BackEndHelper';
import EventImageUpload from './EventImageUpload.vue';
import EventMusicUpload from './EventMusicUpload.vue';
import EventColorUpload from './EventColorUpload.vue';
import { DefaultColor, EventUploadType } from '@/helper/enum/BackEnd';

@Component({
  components: {
    GeneralBanner,
    EventImageUpload,
    EventMusicUpload,
    EventColorUpload,
  },
})
export default class Index extends Vue {
  /** 首頁圖寬度 */
  private readonly homeBannerWidth: number = 1920;
  /** 首頁圖高度 */
  private readonly homeBannerHeight: number = 720;
  /** 魔王圖寬度 */
  private readonly contestBannerWidth: number = 1920;
  /** 魔王圖高度 */
  private readonly contestBannerHeight: number = 476;
  /** 掉落物寬度 */
  private readonly sprinklesWidth: number = 64;
  /** 掉落物高度 */
  private readonly sprinklesHeight: number = 64;
  /** 按鈕背景圖寬度 */
  private readonly buttonBackgroundImgWidth: number = 1920;
  /** 按鈕背景圖高度 */
  private readonly buttonBackgroundImgHeight: number = 287;
  /** 單一按鈕圖寬度 */
  private readonly singleButtonImgWidth: number = 271;
  /** 單一按鈕圖高度 */
  private readonly singleButtonImgHeight: number = 205;
  /** 標題前圖片寬度 */
  private readonly titleImgWidth: number = 100;
  /** 標題前圖片高度 */
  private readonly titleImgHeight: number = 100;
  /** 檔案大小限制(MB) */
  private readonly imageSizeMax: number = 1;
  /** 音樂大小限制(MB) */
  private readonly musicSizeMax: number = 3;

  /** 圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
    defaultHomeBanner: imgPath.defaultBanner,
    defaultContestBanner: imgPath.contestDefaultBanner,
    courseMainButton: imgPath.mainbtn01,
    contestMainButton: imgPath.mainbtn02,
    planetMainButton: imgPath.mainbtn03,
    interstellarMainButton: imgPath.mainbtn04,
    roomContestMainButton: imgPath.mainbtn05,
  };

  /** 文字資料 */
  private textData = {
    title: '管理功能設定',
    homeBannerTitle: '首頁標頭圖',
    contestBannerTitle: '魔王賽首頁標頭圖',
    bgmTitle: '背景音樂',
    sprinklesTitle: '飄落物',
    timeBackgroundColorTitle: '時間背景色',
    buttonBackgroundImg: '按鈕背景圖',
    buttonBackgroundDefault: `預設顏色${DefaultColor.ButtonBackground}`,
    coursebuttonImg: '答題遊戲按鈕圖',
    contestbuttonImg: '魔王挑戰按鈕圖',
    planetbuttonImg: '星球大戰按鈕圖',
    interstellarbuttonImg: '星際論壇按鈕圖',
    roomContestbuttonImg: '校園賽事按鈕圖',
    titleImg: '標題前圖片',
    onSaveTitle: '儲存設定',
    topNavBackgroundColorTitle: 'topNav背景色',
  };

  /** 音樂資料 */
  private audioData = {
    defaultBGMUrl: audioPath.defaultBGM,
  };

  /** 活動設定資料 */
  private partyEventEditData: PartyEventEditData = {} as PartyEventEditData;
  /** 已取得資料, 可以顯示 */
  private isShow: boolean = false;
  /** 儲存中 */
  private isSaving: boolean = false;
  /** 上傳組件所需資料 */
  private partyEventUploadList: PartyEventUpload[] = [];
  /** 上傳類型 */
  private EventUploadType = EventUploadType;

  async created() {
    // 取得編輯資料
    const result = await this.getPartyEventEdit();
    if (result == null) {
      Message.error('取得活動編輯資料失敗');
      router.go(-1);
      return;
    }

    this.partyEventEditData = result;
    this.partyEventUploadList = [
      // 首頁標頭圖
      {
        partyEventData: this.partyEventEditData.homeBanner,
        uploadType: EventUploadType.Image,
        title: this.textData.homeBannerTitle,
        isShowDefault: true,
        isSingleImage: false,
        defaultUrl: this.imgData.defaultHomeBanner,
        defaultText: '',
        limitWidth: this.homeBannerWidth,
        limitHeight: this.homeBannerHeight,
        limitSize: this.imageSizeMax,
      },
      // 魔王賽首頁標頭圖
      {
        partyEventData: this.partyEventEditData.contestBanner,
        uploadType: EventUploadType.Image,
        title: this.textData.contestBannerTitle,
        isShowDefault: true,
        isSingleImage: false,
        defaultUrl: this.imgData.defaultContestBanner,
        defaultText: '',
        limitWidth: this.contestBannerWidth,
        limitHeight: this.contestBannerHeight,
        limitSize: this.imageSizeMax,
      },
      // 首頁背景音樂
      {
        partyEventData: this.partyEventEditData.homeBGM,
        uploadType: EventUploadType.Music,
        title: this.textData.bgmTitle,
        isShowDefault: true,
        isSingleImage: false,
        defaultUrl: this.audioData.defaultBGMUrl,
        defaultText: '',
        limitWidth: 0,
        limitHeight: 0,
        limitSize: this.musicSizeMax,
      },
      // 飄落物
      {
        partyEventData: this.partyEventEditData.sprinklesUrl,
        uploadType: EventUploadType.Image,
        title: this.textData.sprinklesTitle,
        isShowDefault: false,
        isSingleImage: true,
        defaultUrl: '',
        defaultText: '',
        limitWidth: this.sprinklesWidth,
        limitHeight: this.sprinklesHeight,
        limitSize: this.imageSizeMax,
      },
      // 時間背景色
      {
        partyEventData: this.partyEventEditData.timeBackgroundColor,
        uploadType: EventUploadType.Color,
        title: this.textData.timeBackgroundColorTitle,
        isShowDefault: true,
        isSingleImage: false,
        defaultUrl: '',
        defaultText: DefaultColor.TimeBackground,
        limitWidth: 0,
        limitHeight: 0,
        limitSize: 0,
      },
      // 按鈕背景圖
      {
        partyEventData: this.partyEventEditData.buttonBackgroundImg,
        uploadType: EventUploadType.Image,
        title: this.textData.buttonBackgroundImg,
        isShowDefault: true,
        isSingleImage: true,
        defaultUrl: '',
        defaultText: this.textData.buttonBackgroundDefault,
        limitWidth: this.buttonBackgroundImgWidth,
        limitHeight: this.buttonBackgroundImgHeight,
        limitSize: this.imageSizeMax,
      },
      // 答題遊戲按鈕圖
      {
        partyEventData: this.partyEventEditData.coursebuttonImg,
        uploadType: EventUploadType.Image,
        title: this.textData.coursebuttonImg,
        isShowDefault: true,
        isSingleImage: true,
        defaultUrl: this.imgData.courseMainButton,
        defaultText: '',
        limitWidth: this.singleButtonImgWidth,
        limitHeight: this.singleButtonImgHeight,
        limitSize: this.imageSizeMax,
      },
      // 魔王挑戰按鈕圖
      {
        partyEventData: this.partyEventEditData.contestbuttonImg,
        uploadType: EventUploadType.Image,
        title: this.textData.contestbuttonImg,
        isShowDefault: true,
        isSingleImage: true,
        defaultUrl: this.imgData.contestMainButton,
        defaultText: '',
        limitWidth: this.singleButtonImgWidth,
        limitHeight: this.singleButtonImgHeight,
        limitSize: this.imageSizeMax,
      },
      // 星球大戰按鈕圖
      {
        partyEventData: this.partyEventEditData.planetbuttonImg,
        uploadType: EventUploadType.Image,
        title: this.textData.planetbuttonImg,
        isShowDefault: true,
        isSingleImage: true,
        defaultUrl: this.imgData.planetMainButton,
        defaultText: '',
        limitWidth: this.singleButtonImgWidth,
        limitHeight: this.singleButtonImgHeight,
        limitSize: this.imageSizeMax,
      },
      // 校園賽事按鈕圖
      {
        partyEventData: this.partyEventEditData.roomcontestbuttonImg,
        uploadType: EventUploadType.Image,
        title: this.textData.roomContestbuttonImg,
        isShowDefault: true,
        isSingleImage: true,
        defaultUrl: this.imgData.roomContestMainButton,
        defaultText: '',
        limitWidth: this.singleButtonImgWidth,
        limitHeight: this.singleButtonImgHeight,
        limitSize: this.imageSizeMax,
      },
      // 星際論壇按鈕圖
      {
        partyEventData: this.partyEventEditData.interstellarbuttonImg,
        uploadType: EventUploadType.Image,
        title: this.textData.interstellarbuttonImg,
        isShowDefault: true,
        isSingleImage: true,
        defaultUrl: this.imgData.interstellarMainButton,
        defaultText: '',
        limitWidth: this.singleButtonImgWidth,
        limitHeight: this.singleButtonImgHeight,
        limitSize: this.imageSizeMax,
      },
      // 標題前圖片
      {
        partyEventData: this.partyEventEditData.titleImg,
        uploadType: EventUploadType.Image,
        title: this.textData.titleImg,
        isShowDefault: false,
        isSingleImage: true,
        defaultUrl: '',
        defaultText: '',
        limitWidth: this.titleImgWidth,
        limitHeight: this.titleImgHeight,
        limitSize: this.imageSizeMax,
      },
      // topNav背景色
      {
        partyEventData: this.partyEventEditData.topNavBackgroundColor,
        uploadType: EventUploadType.Color,
        title: this.textData.topNavBackgroundColorTitle,
        isShowDefault: true,
        isSingleImage: false,
        defaultUrl: '',
        defaultText: DefaultColor.TopNavBackground,
        limitWidth: 0,
        limitHeight: 0,
        limitSize: 0,
      },
    ];
    // 資料取得完畢
    this.isShow = true;
  }

  /** 取得當前活動設定 */
  private async getPartyEventEdit(): Promise<PartyEventEditData | undefined> {
    try {
      // API 取得活動設定
      const response: any = await partyEventEditAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      return {
        homeBanner: BackEndHelper.toPartyEventData(response.config.homeBanner),
        contestBanner: BackEndHelper.toPartyEventData(response.config.contestBanner),
        homeBGM: BackEndHelper.toPartyEventData(response.config.homeBGM),
        sprinklesUrl: BackEndHelper.toPartyEventData(response.config.sprinklesUrl),
        timeBackgroundColor: BackEndHelper.toPartyEventData(response.config.timeBackgroundColor),
        buttonBackgroundImg: BackEndHelper.toPartyEventData(response.config.buttonBackgroundImg),
        coursebuttonImg: BackEndHelper.toPartyEventData(response.config.coursebuttonImg),
        contestbuttonImg: BackEndHelper.toPartyEventData(response.config.contestbuttonImg),
        planetbuttonImg: BackEndHelper.toPartyEventData(response.config.planetbuttonImg),
        roomcontestbuttonImg: BackEndHelper.toPartyEventData(response.config.roomcontestbuttonImg),
        interstellarbuttonImg: BackEndHelper.toPartyEventData(response.config.interstellarbuttonImg),
        titleImg: BackEndHelper.toPartyEventData(response.config.titleImg),
        topNavBackgroundColor: BackEndHelper.toPartyEventData(response.config.topNavBackgroundColor),
      };
    } catch (e) {
      console.error(`${e}`);
    }
  }

  /** 儲存活動設定 */
  private async onSave(): Promise<void> {
    // 上傳前檢查
    if (this.isUploadValid() === false) {
      return;
    }

    // 設定儲存中, 防連點
    this.isSaving = true;

    try {
      // API 上傳活動設定
      const response: any = await partyEventEditAPI.put(this.partyEventEditData);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 取得節慶活動資料
      await this.$$store.dispatch('getWebAppConfig');

      // 成功提示
      Message.info('活動設定儲存成功');
    } catch (e) {
      Message.warn(`${e}`);
    } finally {
      this.isSaving = false;
    }
  }

  /** 檢查上傳資料無誤 */
  private isUploadValid(): boolean {
    let errorMessage: string = '';
    // 迴圈檢查每筆資料
    this.partyEventUploadList.forEach((partyEventUpload) => {
      // 空設定
      if (partyEventUpload.partyEventData.argValue === '') {
        return;
      }

      // 開始結束時間檢查
      if (partyEventUpload.partyEventData.startAt === '' || partyEventUpload.partyEventData.endAt === '') {
        errorMessage += `${partyEventUpload.title}沒有設定開始結束時間<br/>`;
      }
    });

    // 錯誤
    if (errorMessage.length > 0) {
      // 顯示錯誤訊息
      this.$message.error({
        dangerouslyUseHTMLString: true,
        message: errorMessage,
      });

      return false;
    }
    // 檢查無誤
    else {
      return true;
    }
  }
}
</script>
