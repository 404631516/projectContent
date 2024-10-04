import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { ShootString } from './ShooterConfig';

/** 塔防圖片資源的資料夾路徑 */
export const shooterImgUrl = `${Config.imgUrl}/img/h5/shooter`;

/** 塔防json資源的資料夾路徑 */
export const shooterJsonUrl = `${Config.imgUrl}/json/shooter`;

/** 塔防各資源的路徑及預設位置 */
export const shooterResourceData: ResourceData = {
  images: [
    { key: ShootString.Background, url: `${shooterImgUrl}/bg.png` },
    { key: ShootString.Cannon, url: `${shooterImgUrl}/cannon_body.png` },
    { key: ShootString.Barrel, url: `${shooterImgUrl}/cannon_head.png` },
    {
      key: ShootString.MagicIcon,
      url: `${shooterImgUrl}/icon_energy.png`,
    },
    {
      key: ShootString.ItemHighLight,
      url: `${shooterImgUrl}/itemHighLight.png`,
    },
    {
      key: ShootString.SoundOnIcon,
      url: `${shooterImgUrl}/sound_on_icon.png`,
    },
    {
      key: ShootString.SoundOffIcon,
      url: `${shooterImgUrl}/sound_off_icon.png`,
    },
    { key: 'timer', url: `${shooterImgUrl}/gradient.png` },
    { key: 'explosion', url: `${shooterImgUrl}/explosion.png` },
  ],
  atlases: [
    {
      key: ShootString.ShootTargets,
      url: `${shooterImgUrl}/shootTargets.png`,
      textureXhrSetting: `${shooterImgUrl}/shootTargets.json`,
    },
  ],
  audios: [
    {
      key: ShootString.OnShootSound,
      url: `${Config.imgUrl}/audio/Gun shooting-02.mp3`,
    },
    {
      key: ShootString.OnHitSound,
      url: `${Config.imgUrl}/audio/BejeweledBomb clear-01.mp3`,
    },
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
  ],
};
