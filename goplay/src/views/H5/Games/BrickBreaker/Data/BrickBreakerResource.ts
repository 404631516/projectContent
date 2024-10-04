import Config from '@/config/setting';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { BrickBreakerString } from './BrickBreakerConfig';

/** 圖片資源的資料夾路徑 */
export const brickBreakerImgUrl = `${Config.imgUrl}/img/h5/brickBreaker`;

/** json資源的資料夾路徑 */
export const brickBreakerJsonUrl = `${Config.imgUrl}/json/brickBreaker`;

/** 音樂資源的資料夾路徑 */
export const brickBreakerAudioUrl = `${Config.imgUrl}/audio/brickBreaker`;

/** 各資源的路徑及預設位置 */
export const brickBreakerResourceData: ResourceData = {
  images: [
    { key: BrickBreakerString.LocateIcon, url: `${brickBreakerImgUrl}/locate.png` },
    { key: BrickBreakerString.ZoomInIcon, url: `${brickBreakerImgUrl}/zoomIn.png` },
    { key: BrickBreakerString.ZoomOutIcon, url: `${brickBreakerImgUrl}/zoomOut.png` },
    { key: BrickBreakerString.SelfTag, url: `${brickBreakerImgUrl}/selfTag.png` },
    { key: BrickBreakerString.BossTag, url: `${brickBreakerImgUrl}/bossTag.png` },
    { key: BrickBreakerString.OfflineIcon, url: `${brickBreakerImgUrl}/offlineIcon.png` },
    { key: BrickBreakerString.BossHintIcon, url: `${brickBreakerImgUrl}/bossHintIcon.png` },
    { key: BrickBreakerString.FramePlayerInfo, url: `${brickBreakerImgUrl}/framePlayerInfo.png` },
    { key: BrickBreakerString.FrameRank, url: `${brickBreakerImgUrl}/frameRank.png` },
    { key: BrickBreakerString.FrameMap, url: `${brickBreakerImgUrl}/frameMap.png` },
    { key: BrickBreakerString.FrameHowToPlay, url: `${brickBreakerImgUrl}/frameHowToPlay.png` },
    { key: BrickBreakerString.FrameTimer, url: `${brickBreakerImgUrl}/frameTimer.png` },
    { key: BrickBreakerString.FrameHead, url: `${brickBreakerImgUrl}/frameHead.png` },
    { key: BrickBreakerString.FrameBlack, url: `${brickBreakerImgUrl}/frameBlack.png` },
    { key: BrickBreakerString.FramePurple, url: `${brickBreakerImgUrl}/framePurple.png` },
    { key: BrickBreakerString.FrameInfo, url: `${brickBreakerImgUrl}/frameInfo.png` },
    { key: BrickBreakerString.BossBG, url: `${brickBreakerImgUrl}/bossBG.png` },
    { key: BrickBreakerString.BossIcon, url: `${brickBreakerImgUrl}/bossIcon.png` },
    { key: BrickBreakerString.QuestionMarkIcon, url: `${brickBreakerImgUrl}/questionMarkIcon.png` },
    { key: BrickBreakerString.MapIcon, url: `${brickBreakerImgUrl}/mapIcon.png` },
    { key: BrickBreakerString.RankIcon, url: `${brickBreakerImgUrl}/rankIcon.png` },
    { key: BrickBreakerString.RankFrameGold, url: `${brickBreakerImgUrl}/rankFrameGold.png` },
    { key: BrickBreakerString.RankFrameNormal, url: `${brickBreakerImgUrl}/rankFrameNormal.png` },
    { key: BrickBreakerString.RankGoldMedal, url: `${brickBreakerImgUrl}/crown.png` },
    { key: BrickBreakerString.RankSliverMedal, url: `${brickBreakerImgUrl}/silver-medal.png` },
    { key: BrickBreakerString.RankBronzeMedal, url: `${brickBreakerImgUrl}/bronze-medal.png` },
    { key: BrickBreakerString.YellowButton, url: `${brickBreakerImgUrl}/go_btn.png` },
    { key: BrickBreakerString.TimerIcon, url: `${brickBreakerImgUrl}/timerIcon.png` },
    { key: BrickBreakerString.GradientOverlay, url: `${brickBreakerImgUrl}/gradientOverlay.png` },
    { key: BrickBreakerString.RedButton, url: `${brickBreakerImgUrl}/red_btn.png` },
    { key: BrickBreakerString.ButtonArrow, url: `${brickBreakerImgUrl}/arrow.png` },
    { key: BrickBreakerString.EventMsgLine, url: `${brickBreakerImgUrl}/line7.png` },
    { key: BrickBreakerString.RobotWarning, url: `${brickBreakerImgUrl}/robotWarning.png` },
    { key: BrickBreakerString.GridHighlight, url: `${brickBreakerImgUrl}/gridHighlight.png` },
    { key: BrickBreakerString.ItemShield, url: `${brickBreakerImgUrl}/iconShield.png` },
    { key: BrickBreakerString.ItemAxe, url: `${brickBreakerImgUrl}/iconAxe.png` },
    { key: BrickBreakerString.ItemFreezePrevent, url: `${brickBreakerImgUrl}/iconFreezePrevent.png` },
    { key: BrickBreakerString.NameFrame, url: `${brickBreakerImgUrl}/name_frame.png` },
    { key: BrickBreakerString.AvatarShieldImg, url: `${brickBreakerImgUrl}/avatarShieldImg.png` },
    {
      key: BrickBreakerString.AvatarFreezePreventImg,
      url: `${brickBreakerImgUrl}/avatarFreezePreventImg.png`,
    },
    { key: BrickBreakerString.ReconnectBG, url: `${brickBreakerImgUrl}/reconnectBG.png` },
    { key: BrickBreakerString.ReconnectIcon, url: `${brickBreakerImgUrl}/reconnectIcon.png` },
    { key: BrickBreakerString.ReconnectDot1, url: `${brickBreakerImgUrl}/reconnectDot1.png` },
    { key: BrickBreakerString.ReconnectDot2, url: `${brickBreakerImgUrl}/reconnectDot2.png` },
    { key: BrickBreakerString.ReconnectDot3, url: `${brickBreakerImgUrl}/reconnectDot3.png` },
  ],
  atlases: [
    {
      key: BrickBreakerString.ParticleBreakBrickImg,
      url: `${brickBreakerImgUrl}/particleBreakBrickImg.png`,
      textureXhrSetting: `${brickBreakerImgUrl}/particleBreakBrickImg.json`,
    },
    {
      key: BrickBreakerString.ParticleUnfreezeImg,
      url: `${brickBreakerImgUrl}/particleUnfreezeImg.png`,
      textureXhrSetting: `${brickBreakerImgUrl}/particleUnfreezeImg.json`,
    },
  ],
  jsons: [
    // 特效設定檔
    { key: BrickBreakerString.ParticleEmitterConfigs, url: `${brickBreakerJsonUrl}/ParticleEmitterConfigs.json` },
  ],
};
