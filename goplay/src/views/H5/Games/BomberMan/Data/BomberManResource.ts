import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { BomberManString, BomberManNumber } from './BomberManConfig';

/** 圖片資源的資料夾路徑 */
export const commonImgUrl = `${Config.imgUrl}/img`;
export const bomberManImgUrl = `${Config.imgUrl}/img/h5/bomberMan`;

/** json資源的資料夾路徑 */
export const bomberManJsonUrl = `${Config.imgUrl}/json/bomberMan`;

/** 音樂資源的資料夾路徑 */
export const bomberManAudioUrl = `${Config.imgUrl}/audio/bomberMan`;

/** 各資源的路徑及預設位置 */
export const bomberManResourceData: ResourceData = {
  images: [
    // 通用
    { key: BomberManString.SoundOnIcon, url: `${Config.imgUrl}/img/h5/shooter/sound_on_icon.png` },
    { key: BomberManString.SoundOffIcon, url: `${Config.imgUrl}/img/h5/shooter/sound_off_icon.png` },
    // 主畫面ui
    { key: BomberManString.PutBombBtnBg, url: `${bomberManImgUrl}/global/RectangleButton.png` },
    { key: BomberManString.ActiveSkillTag, url: `${bomberManImgUrl}/global/RectangleGreen.png` },
    { key: BomberManString.PassiveSkillTag, url: `${bomberManImgUrl}/global/RectangleBlue.png` },
    { key: BomberManString.SkillTipBg, url: `${bomberManImgUrl}/global/frame.png` },
    { key: BomberManString.GradientGrayCenter, url: `${bomberManImgUrl}/global/GradientGrayCenter.png` },
    { key: BomberManString.GradientGrayBottom, url: `${bomberManImgUrl}/global/GradientGrayBottom.png` },
    { key: BomberManString.GradientGrayRight, url: `${bomberManImgUrl}/global/GradientGrayRight.png` },
    { key: BomberManString.GradientPurple, url: `${bomberManImgUrl}/global/GradientPurple.png` },
    { key: BomberManString.GradientRed, url: `${bomberManImgUrl}/global/GradientRed.png` },
    { key: BomberManString.GradientYellow, url: `${bomberManImgUrl}/global/GradientYellow.png` },
    { key: BomberManString.WavePromptIcon, url: `${bomberManImgUrl}/global/info.png` },
    { key: BomberManString.WavePromptBG, url: `${bomberManImgUrl}/global/RectanglePurple.png` },
    // map
    { key: BomberManString.Tiles, url: `${bomberManImgUrl}/map/tileset.png` },
    // 地圖物件 圖片
    { key: BomberManString.BrickWallIcon, url: `${bomberManImgUrl}/mapObject/Wall.png` },
    { key: BomberManString.GlassWallIcon, url: `${bomberManImgUrl}/mapObject/GlassWall.png` },
    // 效果
    { key: BomberManString.AntiBlastEffect, url: `${bomberManImgUrl}/effect/antiBlastEffect.png` },
    { key: BomberManString.InvincibleEffect, url: `${bomberManImgUrl}/effect/invincibleEffect.png` },
    { key: BomberManString.ImageParticleThroughWall, url: `${bomberManImgUrl}/effect/throughWallLineFx.png` },
    { key: BomberManString.ImageParticleThroughBomb, url: `${bomberManImgUrl}/effect/throughBombLineFx.png` },
    { key: BomberManString.ImageParticleThroughWall, url: `${bomberManImgUrl}/effect/throughWallLineFx.png` },
    // 道具 圖片(在scene preload時載入)
  ],
  spritesheets: [
    // 英雄動畫圖(在scene preload時載入)

    // 敵人動畫圖(在scene preload時載入)

    // 地圖物件-炸彈
    {
      key: BomberManString.BombSprite,
      url: `${bomberManImgUrl}/mapObject/BombSprite.png`,
      frameConfig: {
        frameWidth: BomberManNumber.tileSize,
        frameHeight: BomberManNumber.tileSize,
      },
    },
    // 地圖物件-炸彈爆風
    {
      key: BomberManString.BlastEndSprite,
      url: `${bomberManImgUrl}/mapObject/BlastEnd.png`,
      frameConfig: {
        frameWidth: BomberManNumber.tileSize,
        frameHeight: BomberManNumber.tileSize,
      },
    },
    {
      key: BomberManString.BlastLinkSprite,
      url: `${bomberManImgUrl}/mapObject/BlastLink.png`,
      frameConfig: {
        frameWidth: BomberManNumber.tileSize,
        frameHeight: BomberManNumber.tileSize,
      },
    },
    {
      key: BomberManString.BlastCenterSprite,
      url: `${bomberManImgUrl}/mapObject/BlastCenter.png`,
      frameConfig: {
        frameWidth: BomberManNumber.tileSize,
        frameHeight: BomberManNumber.tileSize,
      },
    },
    // 地圖物件 炸毀牆
    {
      key: BomberManString.DestroyBrickWall,
      url: `${bomberManImgUrl}/mapObject/DestroyBrickWall.png`,
      frameConfig: {
        frameWidth: BomberManNumber.tileSize,
        frameHeight: BomberManNumber.tileSize,
      },
    },
    {
      key: BomberManString.DestroyGlassWall,
      url: `${bomberManImgUrl}/mapObject/DestroyGlassWall.png`,
      frameConfig: {
        frameWidth: BomberManNumber.tileSize,
        frameHeight: BomberManNumber.tileSize,
      },
    },

    // 效果
    {
      key: BomberManString.EnemyDeadFX,
      url: `${bomberManImgUrl}/effect/enemyDeadBoomFX.png`,
      frameConfig: { frameWidth: 256, frameHeight: 256 },
    },
  ],
  audios: [
    { key: BaseSceneString.BGM, url: `${bomberManAudioUrl}/bgm.mp3` },
    // 地圖音效
    { key: BomberManString.AudioBombExplosion, url: `${bomberManAudioUrl}/bombExplosion.mp3` },
    { key: BomberManString.AudioGainItem, url: `${bomberManAudioUrl}/gainItem.mp3` },
    { key: BomberManString.AudioKillEnemy, url: `${bomberManAudioUrl}/killEnemy.mp3` },
    { key: BomberManString.AudioPutBomb, url: `${bomberManAudioUrl}/putBomb.mp3` },
    { key: BomberManString.AudioHitEnemy, url: `${bomberManAudioUrl}/hitEnemy.mp3` },
    { key: BomberManString.AudioShieldHitEnemy, url: `${bomberManAudioUrl}/shieldHitEnemy.mp3` },
    // 使用道具音效
    { key: BomberManString.AudioThroughWall, url: `${bomberManAudioUrl}/item/throughWall.mp3` },
    { key: BomberManString.AudioThroughBomb, url: `${bomberManAudioUrl}/item/throughBomb.mp3` },
    { key: BomberManString.AudioAntiBlast, url: `${bomberManAudioUrl}/item/antiBlast.mp3` },
    { key: BomberManString.AudioInvincible, url: `${bomberManAudioUrl}/item/invincible.mp3` },
  ],
  tilemaps: [
    // map
    { key: `${BomberManString.TileMap}1`, url: `${bomberManJsonUrl}/map/map1.json` },
  ],
  jsons: [
    // 特效設定檔
    { key: BomberManString.ParticleEmitterConfigs, url: `${bomberManJsonUrl}/ParticleEmitterConfigs.json` },
  ],
  // 角色動畫
  animations: [
    // 爆風動畫
    {
      key: BomberManString.BlastAnimsJson,
      url: `${bomberManJsonUrl}/mapObject/BlastAnims.json`,
    },
    // 炸彈動畫
    {
      key: BomberManString.BombAnimsJson,
      url: `${bomberManJsonUrl}/mapObject/BombAnims.json`,
    },
    // 牆動畫
    {
      key: BomberManString.WallAnimsJson,
      url: `${bomberManJsonUrl}/mapObject/WallAnims.json`,
    },
    // 其他動畫
    {
      key: BomberManString.AnimsJson,
      url: `${bomberManJsonUrl}/Anims.json`,
    },
  ],
};
