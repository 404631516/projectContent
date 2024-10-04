import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import Config from '../../../../../config/setting';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { VerticalParkourString } from './VerticalParkourConfig';
import { baseSceneImgUrl } from '@/views/H5/Scripts/Data/BaseSceneResource';

/** 圖片資源的資料夾路徑 */
export const verticalParkourImgUrl = `${Config.imgUrl}/img/h5/verticalParkour`;

/** json資源的資料夾路徑 */
export const verticalParkourJsonUrl = `${Config.imgUrl}/json/verticalParkour`;

/** 音樂資源的資料夾路徑 */
export const verticalParkourAudioUrl = `${Config.imgUrl}/audio/verticalParkour`;

/** 各資源的路徑及預設位置 */
export const verticalParkourResourceData: ResourceData = {
  images: [
    { key: VerticalParkourString.MagicIcon, url: `${baseSceneImgUrl}/Icon_magic_32x32.png` },
    { key: VerticalParkourString.MagicBar, url: `${verticalParkourImgUrl}/Bar_328x38.png` },
    { key: VerticalParkourString.MagicBarBg, url: `${verticalParkourImgUrl}/BarBg_328x38.png` },
    { key: VerticalParkourString.Grass, url: `${verticalParkourImgUrl}/grass_1024x512.png` },
    { key: VerticalParkourString.Skateboard, url: `${verticalParkourImgUrl}/skateboard_46x108.png` },
    { key: VerticalParkourString.Hurt, url: `${verticalParkourImgUrl}/hurt.png` },
    { key: VerticalParkourString.Treasure, url: `${verticalParkourImgUrl}/treasure_64x64.png` },
    { key: VerticalParkourString.Key, url: `${verticalParkourImgUrl}/key_64x64.png` },
    { key: VerticalParkourString.Coin, url: `${verticalParkourImgUrl}/coin_64x64.png` },
    { key: VerticalParkourString.Obstacle1, url: `${verticalParkourImgUrl}/obstacle01_190x154.png` },
    { key: VerticalParkourString.Obstacle2, url: `${verticalParkourImgUrl}/obstacle02_138x84.png` },
  ],
  spritesheets: [
    {
      key: VerticalParkourString.Invincible,
      url: `${verticalParkourImgUrl}/invincibleFx.png`,
      frameConfig: { frameWidth: 20, frameHeight: 32 },
    },
    {
      key: VerticalParkourString.Bomb,
      url: `${verticalParkourImgUrl}/boomFX.png`,
      frameConfig: { frameWidth: 40, frameHeight: 40 },
    },
    {
      key: VerticalParkourString.Unlock,
      url: `${verticalParkourImgUrl}/unlock.png`,
      frameConfig: { frameWidth: 40, frameHeight: 40 },
    },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${verticalParkourAudioUrl}/BGM.mp3` },
    { key: VerticalParkourString.AudioCoin, url: `${verticalParkourAudioUrl}/coin.mp3` },
    { key: VerticalParkourString.AudioKey, url: `${verticalParkourAudioUrl}/key.mp3` },
    { key: VerticalParkourString.AudioTreasure, url: `${verticalParkourAudioUrl}/treasure.mp3` },
    { key: VerticalParkourString.AudioHurt, url: `${verticalParkourAudioUrl}/hurt.mp3` },
    { key: VerticalParkourString.AudioInvincible, url: `${verticalParkourAudioUrl}/invincible.mp3` },
    { key: VerticalParkourString.AudioBomb, url: `${verticalParkourAudioUrl}/bomb.mp3` },
    { key: VerticalParkourString.AudioAvatar, url: `${verticalParkourAudioUrl}/avatar.mp3` },
    { key: VerticalParkourString.AudioMagnet, url: `${verticalParkourAudioUrl}/magnet.mp3` },
  ],
};
