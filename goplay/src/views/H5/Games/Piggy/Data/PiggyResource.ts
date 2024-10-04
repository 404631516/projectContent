import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { PiggyString } from './PiggyConfig';

/** 圖片資源的資料夾路徑 */
export const piggyImgUrl = `${Config.imgUrl}/img/h5/piggy`;

/** 各資源的路徑及預設位置 */
export const piggyResourceData: ResourceData = {
  images: [
    {
      key: PiggyString.Background,
      url: `${piggyImgUrl}/bg.png`,
    },
    {
      key: PiggyString.EnergyIcon,
      url: `${Config.imgUrl}/img/h5/shooter/icon_energy.png`,
    },
    {
      key: PiggyString.SoundOnIcon,
      url: `${Config.imgUrl}/img/h5/shooter/sound_on_icon.png`,
    },
    {
      key: PiggyString.SoundOffIcon,
      url: `${Config.imgUrl}/img/h5/shooter/sound_off_icon.png`,
    },
    {
      key: PiggyString.Platform,
      url: `${piggyImgUrl}/platform.png`,
    },
    {
      key: PiggyString.HeroPlatform,
      url: `${piggyImgUrl}/heroPlatform.png`,
    },
    {
      key: PiggyString.Shoot,
      url: `${piggyImgUrl}/UI/shootButton.png`,
    },
    {
      key: PiggyString.Using,
      url: `${piggyImgUrl}/UI/using.png`,
    },
    {
      key: PiggyString.BulletIcon,
      url: `${piggyImgUrl}/UI/bullet.png`,
    },
    {
      key: PiggyString.UpKeyIcon,
      url: `${piggyImgUrl}/UI/up.png`,
    },
    {
      key: PiggyString.DownKeyIcon,
      url: `${piggyImgUrl}/UI/down.png`,
    },
    {
      key: PiggyString.SpaceKeyIcon,
      url: `${piggyImgUrl}/UI/space.png`,
    },
    {
      key: PiggyString.BulletTag,
      url: `${piggyImgUrl}/UI/bulletTag.png`,
    },
    {
      key: PiggyString.ItemTag,
      url: `${piggyImgUrl}/UI/itemTag.png`,
    },
  ],
  audios: [
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
  ],
};
