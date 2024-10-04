import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { DefenseString } from './DefenseConfig';

/** 塔防圖片資源的資料夾路徑 */
export const defenseImgUrl = `${Config.imgUrl}/img/h5/defense`;

/** 塔防json資源的資料夾路徑 */
export const defenseJsonUrl = `${Config.imgUrl}/json/defense`;

/** 塔防各資源的路徑及預設位置 */
export const defenseResourceData: ResourceData = {
  images: [
    { key: DefenseString.MagicIcon, url: `${defenseImgUrl}/magic_icon.png` },
    { key: DefenseString.Arrow, url: `${defenseImgUrl}/arrow.png` },
    { key: DefenseString.Zone, url: `${defenseImgUrl}/zone.png` },
    { key: DefenseString.StageTag, url: `${defenseImgUrl}/gradient_state.png` },
    { key: DefenseString.SoundOnIcon, url: `${defenseImgUrl}/sound_on_icon.png` },
    { key: DefenseString.SoundOffIcon, url: `${defenseImgUrl}/sound_off_icon.png` },
  ],
  spritesheets: [
    {
      key: DefenseString.EnemyDamageEffect,
      url: `${defenseImgUrl}/EnemyDamageEffect.png`,
      frameConfig: {
        frameWidth: 256,
        frameHeight: 256,
      },
    },
  ],
  jsons: [
    {
      key: DefenseString.DefaultMapData,
      url: `${defenseJsonUrl}/MapData_0.json`,
    },
    {
      key: DefenseString.DefaultEnemyData,
      url: `${defenseJsonUrl}/EnemyData_0.json`,
    },
  ],
  audios: [
    {
      key: DefenseString.OnShootSound,
      url: `${Config.imgUrl}/audio/gun.mp3`,
    },
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
  ],
};
