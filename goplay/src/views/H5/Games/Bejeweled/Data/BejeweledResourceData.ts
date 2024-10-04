import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { BejeweledNumber, BejeweledString } from './BejeweledConfig';

/** 塔防圖片資源的資料夾路徑 */
export const bejeweledImgUrl = `${Config.imgUrl}/img/h5/bejeweled`;

/** 塔防json資源的資料夾路徑 */
export const bejeweledJsonUrl = `${Config.imgUrl}/json/bejeweled`;

/** 塔防各資源的路徑及預設位置 */
export const bejeweledResourceData: ResourceData = {
  images: [
    // 背景
    { key: BejeweledString.BG, url: `${bejeweledImgUrl}/bg.png` },
    // 道具
    { key: 'gemsBomb1', url: `${bejeweledImgUrl}/gemsBomb1.png` },
    { key: 'gemsBomb2', url: `${bejeweledImgUrl}/gemsBomb2.png` },
    { key: 'gemsBomb3', url: `${bejeweledImgUrl}/gemsBomb3.png` },
    { key: 'gemsBomb4', url: `${bejeweledImgUrl}/gemsBomb4.png` },
    { key: 'gemsBomb5', url: `${bejeweledImgUrl}/gemsBomb5.png` },
    {
      key: BejeweledString.ItemHighLight,
      url: `${bejeweledImgUrl}/itemHighLight.png`,
    },
    // 能量值
    {
      key: BejeweledString.EnergyIcon,
      url: `${Config.imgUrl}/img/h5/baseScene/energy_icon.png`,
    },
    // 消除寶石數背景
    {
      key: BejeweledString.GradientOverlay,
      url: `${bejeweledImgUrl}/gradientOverlay.png`,
    },
    // 丟魔王的東西
    {
      key: BejeweledString.ThrowBossObject,
      url: `${bejeweledImgUrl}/throwBossObject.png`,
    },
    // 靜音icon
    {
      key: BejeweledString.SoundOffIcon,
      url: `${bejeweledImgUrl}/sound_off_icon.png`,
    },
    {
      key: BejeweledString.SoundOnIcon,
      url: `${bejeweledImgUrl}/sound_on_icon.png`,
    },
  ],
  spritesheets: [
    // 轉珠圖集
    {
      key: BejeweledString.Gems,
      url: `${bejeweledImgUrl}/gems.png`,
      frameConfig: {
        // 寶石
        frameWidth: BejeweledNumber.GemSize,
        frameHeight: BejeweledNumber.GemSize,
      },
    },
    {
      key: BejeweledString.EnemyDamageEffect,
      url: `${bejeweledImgUrl}/EnemyDamageEffect.png`,
      frameConfig: {
        frameWidth: 256,
        frameHeight: 256,
      },
    },
  ],
  atlases: [
    {
      key: BejeweledString.GemBombs,
      url: `${bejeweledImgUrl}/gemsBombs.png`,
      textureXhrSetting: `${bejeweledImgUrl}/gemsBombs.json`,
    },
    {
      key: BejeweledString.Flares,
      url: `${bejeweledImgUrl}/flares.png`,
      textureXhrSetting: `${bejeweledImgUrl}/flares.json`,
    },
  ],
  jsons: [
    {
      key: BejeweledString.ParticleEmitterConfigs,
      url: `${Config.imgUrl}/json/bejeweled/ParticleEmitterConfigs.json`,
    },
  ],
  audios: [
    {
      key: BejeweledString.DestroyGemsSound,
      url: `${Config.imgUrl}/audio/BejeweledBomb clear-03.mp3`,
    },
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
  ],
};
