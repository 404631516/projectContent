import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { HamsterString } from './HamsterConfig';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';

/** 塔防圖片資源的資料夾路徑 */
export const hamsterImgUrl = `${Config.imgUrl}/img/h5/hamster`;

/** 塔防json資源的資料夾路徑 */
export const hamsterJsonUrl = `${Config.imgUrl}/json/hamster`;

/** 塔防各資源的路徑及預設位置 */
export const hamsterResourceData: ResourceData = {
  images: [
    { key: HamsterString.Background, url: `${hamsterImgUrl}/bg.png` },
    { key: HamsterString.HoleMask, url: `${hamsterImgUrl}/mask.png` },
    { key: HamsterString.Icon, url: `${hamsterImgUrl}/icon_energy.png` },
    { key: HamsterString.HitEffect, url: `${hamsterImgUrl}/Hit_fx.png` },
    { key: HamsterString.Gradient, url: `${hamsterImgUrl}/gradient.png` },
    { key: HamsterString.Blood, url: `${hamsterImgUrl}/blood.png` },
    { key: HamsterString.HeartIcon, url: `${hamsterImgUrl}/heart.png` },
    { key: HamsterString.SoundOnIcon, url: `${hamsterImgUrl}/sound_on_icon.png` },
    { key: HamsterString.SoundOffIcon, url: `${hamsterImgUrl}/sound_off_icon.png` },
    { key: HamsterString.TargetIcon, url: `${hamsterImgUrl}/targetIcon.png` },
  ],
  spritesheets: [
    {
      key: HamsterString.NormalHit,
      url: `${hamsterImgUrl}/hamster_hit_default.png`,
      frameConfig: {
        frameWidth: 44,
        frameHeight: 85,
      },
    },
    {
      key: HamsterString.SpecialHit,
      url: `${hamsterImgUrl}/hamster_hit_1_s.png`,
      frameConfig: {
        frameWidth: 44,
        frameHeight: 85,
      },
    },
  ],
  jsons: [
    {
      key: HamsterString.HolePlace,
      url: `${hamsterJsonUrl}/HamsterHolePlace.json`,
    },
    {
      key: HamsterString.ParticleEmitterConfigs,
      url: `${hamsterJsonUrl}/ParticleEmitterConfigs.json`,
    },
  ],
  audios: [
    {
      key: HamsterString.OnHitHamsterSound,
      url: `${Config.imgUrl}/audio/Hamster-02(hit).mp3`,
    },
    {
      key: HamsterString.OnHamsterAttackSound,
      url: `${Config.imgUrl}/audio/Hamster-01(hit).mp3`,
    },
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
  ],
};
