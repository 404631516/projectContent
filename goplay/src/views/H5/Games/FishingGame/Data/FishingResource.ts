import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { FishingString } from './FishingConfig';

/** 圖片資源的資料夾路徑 */
export const fishingImgUrl = `${Config.imgUrl}/img/h5/fishing`;

/** json資源的資料夾路徑 */
export const fishingJsonUrl = `${Config.imgUrl}/json/fishing`;

/** 音效資源的資料夾路徑 */
export const fishingAudioUrl = `${Config.imgUrl}/audio/fishing`;

/** 各資源的路徑及預設位置 */
export const fishingResourceData: ResourceData = {
  images: [
    { key: FishingString.Background, url: `${fishingImgUrl}/background.png` },
    { key: FishingString.Wave, url: `${fishingImgUrl}/waves.png` },
    { key: FishingString.String, url: `${fishingImgUrl}/string.png` },
    { key: FishingString.Boat, url: `${fishingImgUrl}/player.png` },
    { key: FishingString.FishingNet, url: `${fishingImgUrl}/item_fishingNet.png` },
    { key: FishingString.IconScore, url: `${fishingImgUrl}/iconScore.png` },
    { key: FishingString.IconEnvironmentalAddition, url: `${fishingImgUrl}/icon_garbage.png` },
  ],
  spritesheets: [
    {
      key: FishingString.BoomFX,
      url: `${fishingImgUrl}/boomFX.png`,
      frameConfig: { frameWidth: 273, frameHeight: 278 },
    },
    {
      key: FishingString.SpeedUpFx,
      url: `${fishingImgUrl}/speedUpFx.png`,
      frameConfig: { frameWidth: 175, frameHeight: 85 },
    },
    {
      key: FishingString.InvincibleFx,
      url: `${fishingImgUrl}/invincibleFx.png`,
      frameConfig: { frameWidth: 95, frameHeight: 119 },
    },
    {
      key: FishingString.FishBreathFx,
      url: `${fishingImgUrl}/breathFx.png`,
      frameConfig: { frameWidth: 512, frameHeight: 512 },
    },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${fishingAudioUrl}/BGM.mp3` },
    { key: FishingString.AudioCast, url: `${fishingAudioUrl}/cast.mp3` },
    { key: FishingString.AudioFishJump, url: `${fishingAudioUrl}/jump.mp3` },
    { key: FishingString.AudioFishDrop, url: `${fishingAudioUrl}/drop.mp3` },
    { key: FishingString.AudioFishingNet, url: `${fishingAudioUrl}/fishingNet.mp3` },
    { key: FishingString.AudioInvisible, url: `${fishingAudioUrl}/invisible.mp3` },
    { key: FishingString.AudioSpeedUp, url: `${fishingAudioUrl}/speedUp.mp3` },
    { key: FishingString.AudioCatch, url: `${fishingAudioUrl}/catch.mp3` },
    { key: FishingString.AudioHurt, url: `${Config.imgUrl}/audio/Gun shooting-02.mp3` },
  ],
};
