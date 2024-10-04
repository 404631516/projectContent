import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { SnakeString } from './SnakeConfig';
import { baseSceneImgUrl } from '@/views/H5/Scripts/Data/BaseSceneResource';

/** 圖片資源的資料夾路徑 */
export const snakeImgUrl = `${Config.imgUrl}/img/h5/snake`;

/** 音效資源的資料夾路徑 */
export const snakeAudioUrl = `${Config.imgUrl}/audio/snake`;

/** 各資源的路徑及預設位置 */
export const snakeResourceData: ResourceData = {
  images: [
    { key: SnakeString.SnakeRight, url: `${snakeImgUrl}/head_right.png` },
    { key: SnakeString.SnakeLeft, url: `${snakeImgUrl}/head_left.png` },
    { key: SnakeString.SnakeUp, url: `${snakeImgUrl}/head_up.png` },
    { key: SnakeString.SnakeDown, url: `${snakeImgUrl}/head_down.png` },
    { key: SnakeString.BodyHorizontal, url: `${snakeImgUrl}/body_horizontal.png` },
    { key: SnakeString.BodyVertical, url: `${snakeImgUrl}/body_vertical.png` },
    { key: SnakeString.BodyRightUp, url: `${snakeImgUrl}/body_rightup.png` },
    { key: SnakeString.BodyRightDown, url: `${snakeImgUrl}/body_rightdown.png` },
    { key: SnakeString.BodyDownRight, url: `${snakeImgUrl}/body_downright.png` },
    { key: SnakeString.BodyUpRight, url: `${snakeImgUrl}/body_upright.png` },
    { key: SnakeString.TailRight, url: `${snakeImgUrl}/tail_right.png` },
    { key: SnakeString.TailLeft, url: `${snakeImgUrl}/tail_left.png` },
    { key: SnakeString.TailUp, url: `${snakeImgUrl}/tail_up.png` },
    { key: SnakeString.TailDown, url: `${snakeImgUrl}/tail_down.png` },
    { key: SnakeString.Background, url: `${snakeImgUrl}/bg.png` },
    { key: SnakeString.IconScore, url: `${snakeImgUrl}/iconScore_60x60.png` },
  ],
  spritesheets: [
    {
      key: SnakeString.FoodGenerateEffect,
      url: `${snakeImgUrl}/foodGenerateEffect.png`,
      frameConfig: { frameWidth: 35, frameHeight: 40 },
    },
    {
      key: SnakeString.EatEffect,
      url: `${snakeImgUrl}/eatEffect.png`,
      frameConfig: { frameWidth: 30, frameHeight: 40 },
    },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${snakeAudioUrl}/BGM.mp3` },
    { key: SnakeString.AudioEat, url: `${snakeAudioUrl}/eat.mp3` },
    { key: SnakeString.AudioHurt, url: `${snakeAudioUrl}/hit.mp3` },
    { key: SnakeString.AudioUseItem, url: `${snakeAudioUrl}/useItem.mp3` },
  ],
};
