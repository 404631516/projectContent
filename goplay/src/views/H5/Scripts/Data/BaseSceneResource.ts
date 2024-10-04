import Config from '@/config/setting';
import { ResourceData } from '../Components/ResourceData';
import { BaseSceneString } from './BaseSceneConfig';

/** 圖片資源的資料夾路徑 */
export const baseSceneImgUrl = `${Config.imgUrl}/img/h5/baseScene`;
/** 音效資源的資料夾路徑 */
export const baseSceneAudioUrl = `${Config.imgUrl}/audio/baseScene`;

/** 各資源的路徑及預設位置 */
export const baseSceneResource: ResourceData = {
  images: [
    {
      key: BaseSceneString.ItemHighlight,
      url: `${baseSceneImgUrl}/itemHighLight.png`,
    },
    {
      key: BaseSceneString.GradientGray,
      url: `${baseSceneImgUrl}/gradientGray.png`,
    },
    {
      key: BaseSceneString.TargetGradient,
      url: `${baseSceneImgUrl}/targetGradient.png`,
    },
    {
      key: BaseSceneString.GradientGreen,
      url: `${baseSceneImgUrl}/gradientGreen.png`,
    },
    {
      key: BaseSceneString.GradientRed,
      url: `${baseSceneImgUrl}/gradientRed.png`,
    },
    {
      key: BaseSceneString.GradientPurple,
      url: `${baseSceneImgUrl}/gradientPurple.png`,
    },
    {
      key: BaseSceneString.RectanglePurple,
      url: `${baseSceneImgUrl}/rectanglePurple.png`,
    },
    {
      key: BaseSceneString.EnergyIcon,
      url: `${baseSceneImgUrl}/energy_icon.png`,
    },
    {
      key: BaseSceneString.TimerIcon,
      url: `${baseSceneImgUrl}/Clock_38x38.png`,
    },
    {
      key: BaseSceneString.PopupTweenFrame,
      url: `${baseSceneImgUrl}/popupTweenFrame_yellow_frame.png`,
    },
    {
      key: BaseSceneString.SoundOnIcon,
      url: `${baseSceneImgUrl}/sound_on_icon.png`,
    },
    {
      key: BaseSceneString.SoundOffIcon,
      url: `${baseSceneImgUrl}/sound_off_icon.png`,
    },
    { key: BaseSceneString.InfoIcon, url: `${baseSceneImgUrl}/info.png` },
    { key: BaseSceneString.ItemLv0, url: `${baseSceneImgUrl}/lv0.png` },
    { key: BaseSceneString.ItemLv1, url: `${baseSceneImgUrl}/lv1.png` },
    { key: BaseSceneString.ItemLv2, url: `${baseSceneImgUrl}/lv2.png` },
    { key: BaseSceneString.ItemLv3, url: `${baseSceneImgUrl}/lv3.png` },
    { key: BaseSceneString.ItemLv4, url: `${baseSceneImgUrl}/lv4.png` },
    { key: BaseSceneString.ItemLv5, url: `${baseSceneImgUrl}/lv5.png` },
    { key: BaseSceneString.HpBarBg, url: `${baseSceneImgUrl}/hp_frame.png` },
    { key: BaseSceneString.HpBarValue, url: `${baseSceneImgUrl}/hp.png` },
    { key: BaseSceneString.HpHeartValue, url: `${baseSceneImgUrl}/heart.png` },
    // 道具快捷鍵
    { key: BaseSceneString.ItemKey1, url: `${baseSceneImgUrl}/itemKey1.png` },
    { key: BaseSceneString.ItemKey2, url: `${baseSceneImgUrl}/itemKey2.png` },
    { key: BaseSceneString.ItemKey3, url: `${baseSceneImgUrl}/itemKey3.png` },
    { key: BaseSceneString.ItemKey4, url: `${baseSceneImgUrl}/itemKey4.png` },
    { key: BaseSceneString.ItemKey5, url: `${baseSceneImgUrl}/itemKey5.png` },
    { key: BaseSceneString.ItemKey6, url: `${baseSceneImgUrl}/itemKey6.png` },
    { key: BaseSceneString.ItemKey7, url: `${baseSceneImgUrl}/itemKey7.png` },
    { key: BaseSceneString.ItemKey8, url: `${baseSceneImgUrl}/itemKey8.png` },
    { key: BaseSceneString.ItemKey9, url: `${baseSceneImgUrl}/itemKey9.png` },
    { key: BaseSceneString.ItemKey0, url: `${baseSceneImgUrl}/itemKey0.png` },
  ],
  audios: [
    { key: BaseSceneString.CountDownSound, url: `${baseSceneAudioUrl}/CountDownSound.mp3` },
    { key: BaseSceneString.HpSfx, url: `${baseSceneAudioUrl}/hpSfx.mp3` },
    { key: BaseSceneString.HpSfxNegative, url: `${baseSceneAudioUrl}/hpSfxNegative.mp3` },
  ],
};
