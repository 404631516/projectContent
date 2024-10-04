import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import Config from '../../../../../config/setting';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { Puzzle2048String } from './Puzzle2048Config';

/** 圖片資源的資料夾路徑 */
export const puzzle2048ImgUrl = `${Config.imgUrl}/img/h5/puzzle2048`;

/** json資源的資料夾路徑 */
export const puzzle2048JsonUrl = `${Config.imgUrl}/json/puzzle2048`;

/** 音樂資源的資料夾路徑 */
export const puzzle2048AudioUrl = `${Config.imgUrl}/audio/puzzle2048`;

/** 各資源的路徑及預設位置 */
export const puzzle2048ResourceData: ResourceData = {
  images: [
    {
      key: Puzzle2048String.Background,
      url: `${puzzle2048ImgUrl}/bg.png`,
    },
    {
      key: Puzzle2048String.Tile,
      url: `${puzzle2048ImgUrl}/tile_72x72.png`,
    },
    {
      key: Puzzle2048String.IconScore,
      url: `${puzzle2048ImgUrl}/iconScore_60x60.png`,
    },
  ],
  spritesheets: [
    {
      key: Puzzle2048String.Bomb,
      url: `${puzzle2048ImgUrl}/boomFX.png`,
      frameConfig: { frameWidth: 220, frameHeight: 256 },
    },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${puzzle2048AudioUrl}/BGM.mp3` },
    { key: Puzzle2048String.AudioUpgrade, url: `${puzzle2048AudioUrl}/upgrade.mp3` },
    { key: Puzzle2048String.AudioUseItem, url: `${puzzle2048AudioUrl}/useItem.mp3` },
    { key: Puzzle2048String.AudioReset, url: `${puzzle2048AudioUrl}/reset.mp3` },
  ],
};
