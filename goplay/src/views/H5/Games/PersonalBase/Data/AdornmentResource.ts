import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { AdornmentString } from './AdornmentConfig';

/** 圖片資源的資料夾路徑 */
export const commonImgUrl = `${Config.imgUrl}/img`;
export const adornmentImgUrl = `${Config.imgUrl}/img/h5/adornment`;
/** 音樂資源的資料夾路徑 */
export const adornmentAudioUrl = `${Config.imgUrl}/audio/adornment`;

/** 各資源的路徑及預設位置 */
export const adornmentResourceData: ResourceData = {
  images: [
    // 房間佈置-主畫面ui
    {
      key: AdornmentString.transparentFrame,
      url: `${adornmentImgUrl}/common/transparentFrame.png`,
    },
    {
      key: AdornmentString.backpackButton,
      url: `${adornmentImgUrl}/common/backpackBtn_bag.png`,
    },
    {
      key: AdornmentString.classmateButton,
      url: `${adornmentImgUrl}/common/classmateBtn_class.png`,
    },
    {
      key: AdornmentString.blackFrame,
      url: `${adornmentImgUrl}/common/black_frame.png`,
    },
    {
      key: AdornmentString.blackFrame2,
      url: `${adornmentImgUrl}/common/black_frame2.png`,
    },

    // 裝飾積分
    {
      key: AdornmentString.adornmentScoreIcon,
      url: `${adornmentImgUrl}/common/bowtie.png`,
    },

    // 佈置模式的背包
    {
      key: AdornmentString.backpackContainerBg,
      url: `${adornmentImgUrl}/common/backpackContainerBg_black_frame.png`,
    },
    {
      key: AdornmentString.backpackTypeTab,
      url: `${adornmentImgUrl}/common/backpackTypeTab_bookmark.png`,
    },
    {
      key: AdornmentString.backpackPageBtn,
      url: `${adornmentImgUrl}/common/backpackPageBtn_arrow.png`,
    },
    {
      key: AdornmentString.backpackCellBg,
      url: `${adornmentImgUrl}/common/backpackCellBg_item_frame.png`,
    },
    {
      key: AdornmentString.backpackItemScoreBg,
      url: `${adornmentImgUrl}/common/backpackItemScoreBg_bow_frame.png`,
    },
    {
      key: AdornmentString.backpackItemSizeBg,
      url: `${adornmentImgUrl}/common/backpackItemSizeBg_size_frame.png`,
    },
    {
      key: AdornmentString.backpackItemCountBg,
      url: `${adornmentImgUrl}/common/backpackItemCountBg_box_frame.png`,
    },
    {
      key: AdornmentString.backpackItemCount,
      url: `${adornmentImgUrl}/common/backpackItemCount_package.png`,
    },
    {
      key: AdornmentString.backpackEmptyBtn,
      url: `${adornmentImgUrl}/common/backpackEmptyBtn_blue_btn.png`,
    },
    {
      key: AdornmentString.backpackCellDragFrame,
      url: `${adornmentImgUrl}/common/backpackCellDragFrame_select.png`,
    },

    {
      key: AdornmentString.exitEditModeButton,
      url: `${adornmentImgUrl}/common/exitEditModeBtn.png`,
    },
    {
      key: AdornmentString.editModeButton,
      url: `${adornmentImgUrl}/common/editModeBtn.png`,
    },
    {
      key: AdornmentString.selfRoomButton,
      url: `${adornmentImgUrl}/common/selfRoomBtn.png`,
    },
    {
      key: AdornmentString.storeButton,
      url: `${adornmentImgUrl}/common/storeBtn_shop.png`,
    },

    // 等級解鎖
    {
      key: AdornmentString.canUnlockBg,
      url: `${adornmentImgUrl}/common/canUnlockBg_yellow32.png`,
    },
    {
      key: AdornmentString.canUnlock,
      url: `${adornmentImgUrl}/common/canUnlock_img.png`,
    },
    {
      key: AdornmentString.noUnlockHintBg,
      url: `${adornmentImgUrl}/common/noUnlockHintBg_black32.png`,
    },
    {
      key: AdornmentString.noUnlock,
      url: `${adornmentImgUrl}/common/noUnlock.png`,
    },
    {
      key: AdornmentString.unlockAnimatBg,
      url: `${adornmentImgUrl}/common/unlockAnimatBg_fx_frame32.png`,
    },

    // 房間建築物圖片
    // 建築物圖片
    {
      key: AdornmentString.partitionWall,
      url: `${adornmentImgUrl}/common/partitionWall.png`,
    },
    {
      key: AdornmentString.floorSlab,
      url: `${adornmentImgUrl}/common/floorSlab.png`,
    },
    {
      key: AdornmentString.bottomFloorBg,
      url: `${adornmentImgUrl}/common/bottomFloorBg_under_frame.png`,
    },
    // 裝飾物圖片
    {
      key: AdornmentString.defaultFloorImage,
      url: `${adornmentImgUrl}/adornmentItem/floor01.png`,
    },
    {
      key: AdornmentString.defaultWallImage,
      url: `${adornmentImgUrl}/adornmentItem/wall_05.png`,
    },
    {
      key: AdornmentString.backgroundAdornmentLight,
      url: `${adornmentImgUrl}/common/backgroundAdornmentLight.png`,
    },
    {
      key: AdornmentString.canPutFurnitureIcon,
      url: `${adornmentImgUrl}/common/canPutFurnitureIcon_dgreen_frame.png`,
    },
    {
      key: AdornmentString.canPutBackgroundIcon,
      url: `${adornmentImgUrl}/common/canPutBackgroundIcon_bgreen_frame.png`,
    },
    {
      key: AdornmentString.canPutFurniturePlus,
      url: `${adornmentImgUrl}/common/canPutFurniturePlus.png`,
    },
    {
      key: AdornmentString.noPutFurnitureIcon,
      url: `${adornmentImgUrl}/common/noPutFurnitureIcon_red_frame.png`,
    },
    {
      key: AdornmentString.dropFurnitureIcon,
      url: `${adornmentImgUrl}/common/dropFurnitureIcon_green_frame.png`,
    },
    {
      key: AdornmentString.dropBackgroundImage,
      url: `${adornmentImgUrl}/common/dropBackgroundImage_Rectangle396.png`,
    },
    // 拆缷裝飾物
    {
      key: AdornmentString.adornmentTearDownFrame,
      url: `${adornmentImgUrl}/common/adornmentTearDownFrame_inf_frame.png`,
    },
    {
      key: AdornmentString.adornmentTearDownBtn,
      url: `${adornmentImgUrl}/common/adornmentTearDownBtn_cancel.png`,
    },

    /** 英雄對話框 */
    {
      key: AdornmentString.heroTalkFrame,
      url: `${adornmentImgUrl}/common/heroTalkFrame_talk.png`,
    },

    /** 拜訪標題底圖 */
    {
      key: AdornmentString.visitTitleBg,
      url: `${adornmentImgUrl}/common/visitTitleBg_GradientOverlay.png`,
    },
    /** 拜訪提示-黑底 */
    {
      key: AdornmentString.visitHintBlackFrame,
      url: `${adornmentImgUrl}/common/visitHintBlackFrame_black50.png`,
    },
    /** 拜訪提示-綠框 */
    {
      key: AdornmentString.visitHintGreenFrame,
      url: `${adornmentImgUrl}/common/visitHintGreenFrame_fx_frame64.png`,
    },
    /** 拜訪提示-白線 */
    {
      key: AdornmentString.visitHintWhiteLine,
      url: `${adornmentImgUrl}/common/visitHintWhiteLine_Line7.png`,
    },
    /** 拜訪提示-圖示 */
    {
      key: AdornmentString.visitHintIcon,
      url: `${adornmentImgUrl}/common/visitClassmateHintIcon_home.png`,
    },
    /** 拜訪排行按鈕底圖 */
    {
      key: AdornmentString.visitRankBtnBg,
      url: `${adornmentImgUrl}/common/visitRankBtn_bg.png`,
    },
    /** 拜訪排行按鈕箭頭 */
    {
      key: AdornmentString.visitRankBtnArrow,
      url: `${adornmentImgUrl}/common/visitRankBtn_arrow.png`,
    },

    // 道具 圖片(在scene preload時載入)
  ],
  // UI合圖
  atlases: [
    // 裝飾物合圖
    {
      key: AdornmentString.adornmentAtlas,
      url: `${adornmentImgUrl}/adornmentSet.png`,
      textureXhrSetting: `${adornmentImgUrl}/adornmentSet.json`,
    },
  ],
  spritesheets: [
    // 英雄動畫圖(在scene preload時載入)
  ],
  // 音樂
  audios: [
    { key: BaseSceneString.BGM, url: `${adornmentAudioUrl}/bgm.mp3` },
    {
      key: AdornmentString.onPutAdornmentSound,
      url: `${adornmentAudioUrl}/putAdornmentSound.mp3`,
    },
    {
      key: AdornmentString.onTearDownAdornmentSound,
      url: `${adornmentAudioUrl}/tearDownAdornmentSound.mp3`,
    },
    {
      key: AdornmentString.onUnlockRoomSound,
      url: `${adornmentAudioUrl}/unlockRoomSound.mp3`,
    },
    {
      key: AdornmentString.onClickButtonSound,
      url: `${adornmentAudioUrl}/clickButtonSound.mp3`,
    },
  ],
};
