import Config from '@/config/setting';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { HeroUniverseString } from './HeroUniverseConfig';

/** 圖片資源的資料夾路徑 */
export const heroUniverseImgUrl = `${Config.imgUrl}/img/h5/heroUniverse`;

/** json資源的資料夾路徑 */
export const heroUniverseJsonUrl = `${Config.imgUrl}/json/heroUniverse`;

/** 音樂資源的資料夾路徑 */
export const heroUniverseAudioUrl = `${Config.imgUrl}/audio/heroUniverse`;

/** 各資源的路徑及預設位置 */
export const heroUniverseResourceData: ResourceData = {
  images: [
    {
      // 飛船
      key: HeroUniverseString.Ship,
      url: `${heroUniverseImgUrl}/ship.png`,
    },
    {
      // 返回按鈕
      key: HeroUniverseString.ReturnButton,
      url: `${heroUniverseImgUrl}/returnButton.png`,
    },
    {
      // 返回按鈕箭頭Icon
      key: HeroUniverseString.ReturnButtonArrow,
      url: `${heroUniverseImgUrl}/returnButtonArrow.png`,
    },
    {
      // 驚嘆號
      key: HeroUniverseString.ExclamationMark,
      url: `${heroUniverseImgUrl}/npcEffect/exclamationMark.png`,
    },
    {
      // 問號
      key: HeroUniverseString.QuestionMark,
      url: `${heroUniverseImgUrl}/npcEffect/questionMark.png`,
    },
    {
      // 任務進行中記號
      key: HeroUniverseString.ProgressMark,
      url: `${heroUniverseImgUrl}/npcEffect/progressMark.png`,
    },
  ],
};
