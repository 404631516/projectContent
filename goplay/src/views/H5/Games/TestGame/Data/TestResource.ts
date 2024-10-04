import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { TestString } from './TestConfig';

/** 圖片資源的資料夾路徑 */
export const testImgUrl = `${Config.imgUrl}/img/h5/test`;

/** json資源的資料夾路徑 */
export const testJsonUrl = `${Config.imgUrl}/json/test`;

/** 音效資源的資料夾路徑 */
export const testAudioUrl = `${Config.imgUrl}/audio/test`;

/** 各資源的路徑及預設位置 */
export const testResourceData: ResourceData = {
  images: [
    { key: TestString.Background, url: `${testImgUrl}/background.png` },
    { key: TestString.Wave, url: `${testImgUrl}/waves.png` },
    { key: TestString.String, url: `${testImgUrl}/string.png` },
    { key: TestString.Boat, url: `${testImgUrl}/player.png` },
    { key: TestString.FishingNet, url: `${testImgUrl}/item_fishingNet.png` },
    { key: TestString.IconScore, url: `${testImgUrl}/iconScore.png` },
    { key: TestString.IconEnvironmentalAddition, url: `${testImgUrl}/icon_garbage.png` },
  ],
  spritesheets: [
    {
      key: TestString.BoomFX,
      url: `${testImgUrl}/boomFX.png`,
      frameConfig: { frameWidth: 273, frameHeight: 278 },
    },
    {
      key: TestString.SpeedUpFx,
      url: `${testImgUrl}/speedUpFx.png`,
      frameConfig: { frameWidth: 175, frameHeight: 85 },
    },
    {
      key: TestString.InvincibleFx,
      url: `${testImgUrl}/invincibleFx.png`,
      frameConfig: { frameWidth: 95, frameHeight: 119 },
    },
    {
      key: TestString.FishBreathFx,
      url: `${testImgUrl}/breathFx.png`,
      frameConfig: { frameWidth: 512, frameHeight: 512 },
    },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${testAudioUrl}/BGM.mp3` },
    { key: TestString.AudioCast, url: `${testAudioUrl}/cast.mp3` },
    { key: TestString.AudioFishJump, url: `${testAudioUrl}/jump.mp3` },
    { key: TestString.AudioFishDrop, url: `${testAudioUrl}/drop.mp3` },
    { key: TestString.AudioFishingNet, url: `${testAudioUrl}/fishingNet.mp3` },
    { key: TestString.AudioInvisible, url: `${testAudioUrl}/invisible.mp3` },
    { key: TestString.AudioSpeedUp, url: `${testAudioUrl}/speedUp.mp3` },
    { key: TestString.AudioCatch, url: `${testAudioUrl}/catch.mp3` },
    { key: TestString.AudioHurt, url: `${Config.imgUrl}/audio/Gun shooting-02.mp3` },
  ],
};
