import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { AnimationTextureKey, SpaceInvadersString } from './SpaceInvadersConfig';
import { baseSceneImgUrl } from '@/views/H5/Scripts/Data/BaseSceneResource';

/** 圖片資源的資料夾路徑 */
export const spaceInvadersImgUrl = `${Config.imgUrl}/img/h5/spaceInvaders`;

/** 音效資源的資料夾路徑 */
export const spaceInvadersAudioUrl = `${Config.imgUrl}/audio/spaceInvaders`;

/** 各資源的路徑及預設位置 */
export const spaceInvadersResourceData: ResourceData = {
  images: [
    { key: SpaceInvadersString.Background, url: `${spaceInvadersImgUrl}/bg.png` },
    { key: SpaceInvadersString.BackgroundPlanet, url: `${spaceInvadersImgUrl}/planet.png` },
    { key: SpaceInvadersString.UiCover, url: `${spaceInvadersImgUrl}/uiCover_1024x128.png` },
    { key: SpaceInvadersString.HpBg, url: `${spaceInvadersImgUrl}/Power_176x34.png` },
    { key: SpaceInvadersString.HpIcon, url: `${spaceInvadersImgUrl}/lightning_24x32.png` },
    { key: SpaceInvadersString.IconScore, url: `${spaceInvadersImgUrl}/iconScore_48x48.png` },
    { key: SpaceInvadersString.EnemyBullet, url: `${spaceInvadersImgUrl}/enemyBullet.png` },
    { key: SpaceInvadersString.PlayerBullet, url: `${spaceInvadersImgUrl}/playerBullet.png` },
    { key: SpaceInvadersString.PlayerBulletCircle, url: `${spaceInvadersImgUrl}/playerBulletCircle.png` },
    { key: SpaceInvadersString.Ship, url: `${spaceInvadersImgUrl}/ship_48x48.png` },
    { key: SpaceInvadersString.Hurt, url: `${spaceInvadersImgUrl}/hurt.png` },
    { key: SpaceInvadersString.PlayerHp, url: `${spaceInvadersImgUrl}/playerHp_34x34.png` },
    { key: SpaceInvadersString.EnemyHp, url: `${spaceInvadersImgUrl}/enemyHp.png` },
    { key: SpaceInvadersString.ShipShield, url: `${spaceInvadersImgUrl}/shipShield.png` },
    { key: SpaceInvadersString.Obstacle1, url: `${spaceInvadersImgUrl}/obstacle1_168x168.png` },
    { key: SpaceInvadersString.Obstacle2, url: `${spaceInvadersImgUrl}/obstacle2_120x110.png` },
    { key: SpaceInvadersString.Obstacle3, url: `${spaceInvadersImgUrl}/obstacle3_164x122.png` },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${spaceInvadersAudioUrl}/BGM.mp3` },
    { key: SpaceInvadersString.AudioShoot, url: `${spaceInvadersAudioUrl}/shoot.mp3` },
    { key: SpaceInvadersString.AudioPlayerHurt, url: `${spaceInvadersAudioUrl}/playerHurt.mp3` },
    { key: SpaceInvadersString.AudioPlayerOnHitInvincible, url: `${spaceInvadersAudioUrl}/playerOnHitInvincible.mp3` },
    { key: SpaceInvadersString.AudioEnemyHurt, url: `${spaceInvadersAudioUrl}/enemyHurt.mp3` },
    { key: SpaceInvadersString.AudioEnemyKilled, url: `${spaceInvadersAudioUrl}/enemyKilled.mp3` },
    { key: SpaceInvadersString.AudioExplodeCircle, url: `${spaceInvadersAudioUrl}/explodeCircle.mp3` },
    { key: SpaceInvadersString.AudioExplodeLine, url: `${spaceInvadersAudioUrl}/explodeLine.mp3` },
    { key: SpaceInvadersString.AudioExplodeFullScreen, url: `${spaceInvadersAudioUrl}/explodeFullScreen.mp3` },
    { key: SpaceInvadersString.AudioSlowDown, url: `${spaceInvadersAudioUrl}/slowDown.mp3` },
    { key: SpaceInvadersString.AudioInvincible, url: `${spaceInvadersAudioUrl}/invincible.mp3` },
  ],
  spritesheets: [
    {
      key: AnimationTextureKey.AnimDestroy,
      url: `${spaceInvadersImgUrl}/animDestroy.png`,
      frameConfig: { frameWidth: 128, frameHeight: 128 },
    },
    {
      key: AnimationTextureKey.AnimLine,
      url: `${spaceInvadersImgUrl}/animLine.png`,
      frameConfig: { frameWidth: 64, frameHeight: 512 },
    },
    {
      key: AnimationTextureKey.AnimCircle,
      url: `${spaceInvadersImgUrl}/animCircle.png`,
      frameConfig: { frameWidth: 110, frameHeight: 128 },
    },
    {
      key: AnimationTextureKey.AnimFullScreen,
      url: `${spaceInvadersImgUrl}/animFullScreen.png`,
      frameConfig: { frameWidth: 440, frameHeight: 512 },
    },
    {
      key: AnimationTextureKey.AnimSlowDownEnemies,
      url: `${spaceInvadersImgUrl}/animSlowDownEnemies.png`,
      frameConfig: { frameWidth: 510, frameHeight: 512 },
    },
    {
      key: AnimationTextureKey.AnimEnemy1,
      url: `${spaceInvadersImgUrl}/enemy1.png`,
      frameConfig: { frameWidth: 64, frameHeight: 64 },
    },
    {
      key: AnimationTextureKey.AnimEnemy2,
      url: `${spaceInvadersImgUrl}/enemy2.png`,
      frameConfig: { frameWidth: 82, frameHeight: 128 },
    },
    {
      key: AnimationTextureKey.AnimEnemy3,
      url: `${spaceInvadersImgUrl}/enemy3.png`,
      frameConfig: { frameWidth: 25, frameHeight: 32 },
    },
    {
      key: AnimationTextureKey.AnimEnemy4,
      url: `${spaceInvadersImgUrl}/enemy4.png`,
      frameConfig: { frameWidth: 64, frameHeight: 64 },
    },
    {
      key: AnimationTextureKey.AnimEnemy5,
      url: `${spaceInvadersImgUrl}/enemy5.png`,
      frameConfig: { frameWidth: 82, frameHeight: 128 },
    },
    {
      key: AnimationTextureKey.AnimEnemy6,
      url: `${spaceInvadersImgUrl}/enemy6.png`,
      frameConfig: { frameWidth: 25, frameHeight: 32 },
    },
  ],
};
