import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import Config from '../../../../../config/setting';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { ParkourString } from './ParkourConfig';

/** 圖片資源的資料夾路徑 */
export const parkourImgUrl = `${Config.imgUrl}/img/h5/parkour`;

/** json資源的資料夾路徑 */
export const parkourJsonUrl = `${Config.imgUrl}/json/parkour`;

/** 音樂資源的資料夾路徑 */
export const parkourAudioUrl = `${Config.imgUrl}/audio/parkour`;

/** 各資源的路徑及預設位置 */
export const parkourResourceData: ResourceData = {
  images: [
    { key: ParkourString.Background0, url: `${parkourImgUrl}/0.png` },
    { key: ParkourString.Background1, url: `${parkourImgUrl}/1.png` },
    { key: ParkourString.Background2, url: `${parkourImgUrl}/2.png` },
    { key: ParkourString.Foreground0, url: `${parkourImgUrl}/3.png` },
    { key: ParkourString.Foreground1, url: `${parkourImgUrl}/4.png` },
    { key: ParkourString.IconScore, url: `${parkourImgUrl}/iconScore.png` },
    { key: ParkourString.TilesetLevelForest, url: `${parkourImgUrl}/LevelForestTileset.png` },
    { key: ParkourString.ImageParticlesBlue, url: `${parkourImgUrl}/blue.png` },
    { key: ParkourString.ImageParticlesRed, url: `${parkourImgUrl}/red.png` },
    { key: ParkourString.ImageParticlesYellow, url: `${parkourImgUrl}/yellow.png` },
  ],
  spritesheets: [
    {
      key: ParkourString.BoomFX,
      url: `${parkourImgUrl}/boomFX.png`,
      frameConfig: { frameWidth: 56, frameHeight: 56 },
    },
  ],
  jsons: [{ key: ParkourString.ParticleEmitterConfigs, url: `${parkourJsonUrl}/ParticleEmitterConfigs.json` }],
  audios: [
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
    { key: ParkourString.AudioJump, url: `${parkourAudioUrl}/jump.mp3` },
    { key: ParkourString.AudioDiamond, url: `${parkourAudioUrl}/diamond.mp3` },
    { key: ParkourString.AudioObjectFly, url: `${parkourAudioUrl}/objectFly.mp3` },
    { key: ParkourString.AudioMagnet, url: `${parkourAudioUrl}/magnet.mp3` },
    { key: ParkourString.AudioFly, url: `${parkourAudioUrl}/fly.mp3` },
    { key: ParkourString.AudioGiant, url: `${parkourAudioUrl}/giant.mp3` },
    { key: ParkourString.AudioSpeedUp, url: `${parkourAudioUrl}/speedUp.mp3` },
    { key: ParkourString.AudioHurt, url: `${Config.imgUrl}/audio/Gun shooting-02.mp3` },
  ],
  animations: [
    // 動態載入動畫設定
    {
      key: ParkourString.JsonAnims,
      url: `${parkourJsonUrl}/Anims.json`,
    },
  ],
};
