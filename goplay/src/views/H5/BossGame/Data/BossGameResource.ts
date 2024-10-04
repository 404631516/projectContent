import Config from '@/config/setting';
import { ResourceData } from '../../Scripts/Components/ResourceData';
import { BaseSceneString } from '../../Scripts/Data/BaseSceneConfig';
import { BossString } from '../BossConfig';

/** 圖片資源的資料夾路徑 */
export const bossImgUrl = `${Config.imgUrl}/img/h5/boss`;

/** 音樂資源的資料夾路徑 */
export const bossAudioUrl = `${Config.imgUrl}/audio/boss`;

/** 各資源的路徑及預設位置 */
export const bossResourceData: ResourceData = {
  images: [
    { key: BossString.Background, url: `${bossImgUrl}/bg.png` },
    { key: BossString.TalkBubble, url: `${bossImgUrl}/talkBubble.png` },
    { key: BossString.SelfTag, url: `${bossImgUrl}/selfTag.png` },
    { key: BossString.SelfTagArrow, url: `${bossImgUrl}/selfTagArrow.png` },
  ],
  spritesheets: [
    {
      key: BossString.EnemyDamageEffect,
      url: `${bossImgUrl}/EnemyDamageEffect.png`,
      frameConfig: { frameWidth: 256, frameHeight: 256 },
    },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${bossAudioUrl}/BGM.mp3` },
    { key: BossString.AttackSound1, url: `${bossAudioUrl}/punch.mp3` },
    { key: BossString.AttackSound2, url: `${bossAudioUrl}/kick.mp3` },
  ],
};
