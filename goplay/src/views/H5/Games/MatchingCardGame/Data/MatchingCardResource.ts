import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { MatchingCardAudioType, MatchingCardString } from './MatchingCardConfig';

/** 圖片資源的資料夾路徑 */
export const commonImgUrl = `${Config.imgUrl}/img`;
export const matchingCardImgUrl = `${Config.imgUrl}/img/h5/matchingCard`;
/** json資源的資料夾路徑 */
export const matchingCardJsonUrl = `${Config.imgUrl}/json/matchingCard`;
/** 音樂資源的資料夾路徑 */
export const matchingCardAudioUrl = `${Config.imgUrl}/audio/matchingCard`;

/** 各資源的路徑及預設位置 */
export const matchingCardResourceData: ResourceData = {
  images: [
    {
      key: MatchingCardString.Background,
      url: `${matchingCardImgUrl}/bg.png`,
    },

    /** 卡背圖示 */
    {
      key: MatchingCardString.CardBackIcon,
      url: `${matchingCardImgUrl}/cardBackIcon_card_cover.png`,
    },
    /** 翻牌加速圖示 */
    {
      key: MatchingCardString.FlipSpeedUpIcon,
      url: `${matchingCardImgUrl}/flipSpeedUpIcon_icon.png`,
    },
    /** 左方提示底圖 */
    {
      key: MatchingCardString.LeftHintAvoidNotMatchPenaltyBG,
      url: `${matchingCardImgUrl}/leftHintAvoidNotMatchPenaltyBG_cardGradient.png`,
    },
    {
      key: MatchingCardString.LeftHintFlipSpeedUpBG,
      url: `${matchingCardImgUrl}/leftHintFlipSpeedUpBG_GradientOverlay.png`,
    },

    // 卡牌
    {
      key: MatchingCardString.CardBackImage,
      url: `${matchingCardImgUrl}/cardBackImage_card_cover.png`,
    },
    // 卡牌-配對成功字圖
    {
      key: MatchingCardString.CardMatchImage,
      url: `${matchingCardImgUrl}/cardMatchImage_match.png`,
    },
    /** 卡牌-配對成功獲得能量底圖 */
    {
      key: MatchingCardString.MatchGainEnergyBG,
      url: `${matchingCardImgUrl}/gainEnergyBG_GradientOverlay.png`,
    },
    /** 卡牌-配對失敗處罰底圖 */
    {
      key: MatchingCardString.NotMatchPenaltyEnergyBG,
      url: `${matchingCardImgUrl}/notMatchPenaltyEnergyBG_GradientOverlay.png`,
    },

    // 敵人干擾
    // 敵人發射物件
    {
      key: MatchingCardString.EnemyLaunchObjectImage,
      url: `${matchingCardImgUrl}/obstacle/enemyLaunchObjectImage.png`,
    },
    /** 敵人對話框 */
    {
      key: MatchingCardString.EnemyTalkFrame,
      url: `${matchingCardImgUrl}/obstacle/enemyTalkFrame_dialogue.png`,
    },
    // 干擾物圖片
    {
      key: MatchingCardString.ObstacleLockImage,
      url: `${matchingCardImgUrl}/obstacle/lockCardImage_lock_frame.png`,
    },
    {
      key: MatchingCardString.LockTouchImage,
      url: `${matchingCardImgUrl}/obstacle/lockTouchImage_touch.png`,
    },

    // 物品功能
    // 卡牌-瞄牌
    {
      key: MatchingCardString.CardSeeThroughIcon,
      url: `${matchingCardImgUrl}/seeThroughIcon_icon_eye.png`,
    },
    // 敵人凍結圖
    {
      key: MatchingCardString.FrozenEnemyImage,
      url: `${matchingCardImgUrl}/enemyFrozenImage_ice.png`,
    },
    // 敵人凍結剩餘秒數BG
    {
      key: MatchingCardString.FrozenEnemyRemainBg,
      url: `${matchingCardImgUrl}/frozenEnemyBg_time_frame.png`,
    },
  ],
  // 連續圖動畫
  spritesheets: [
    // 自動解鎖手指動畫
    {
      key: MatchingCardString.UnlockHandSprite,
      url: `${matchingCardImgUrl}/unlockHandSet.png`,
      frameConfig: {
        frameWidth: 174,
        frameHeight: 201,
      },
    },
  ],
  // 動作
  animations: [
    // 自動解鎖手指動畫
    {
      key: MatchingCardString.UnlockHandAnimsJson,
      url: `${matchingCardJsonUrl}/UnlockHandAnims.json`,
    },
  ],
  // 音樂
  audios: [
    // 背景音樂
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
    // 卡牌
    {
      key: MatchingCardAudioType.MoveCardSound,
      url: `${matchingCardAudioUrl}/card/moveCardSound.mp3`,
    },
    {
      key: MatchingCardAudioType.ClickOpenCardSound,
      url: `${matchingCardAudioUrl}/card/clickOpenCardSound.mp3`,
    },
    {
      key: MatchingCardAudioType.CoverCardSound,
      url: `${matchingCardAudioUrl}/card/coverCardSound.mp3`,
    },
    {
      key: MatchingCardAudioType.CardMatchSound,
      url: `${matchingCardAudioUrl}/card/cardMatchSound.mp3`,
    },
    {
      key: MatchingCardAudioType.CardNotMatchSound,
      url: `${matchingCardAudioUrl}/card/cardNotMatchSound.mp3`,
    },
    // 敵人
    {
      key: MatchingCardAudioType.EnemyLaunchObjectSound,
      url: `${matchingCardAudioUrl}/enemy/enemyLaunchObjectSound.mp3`,
    },
    {
      key: MatchingCardAudioType.LockCardSound,
      url: `${matchingCardAudioUrl}/enemy/lockCardSound.mp3`,
    },
    {
      key: MatchingCardAudioType.ClickLockCardSound,
      url: `${matchingCardAudioUrl}/enemy/clickLockCardSound.mp3`,
    },
    // 道具
    {
      key: MatchingCardAudioType.ClickItemIconSound,
      url: `${matchingCardAudioUrl}/item/clickItemIconSound.mp3`,
    },
    {
      key: MatchingCardAudioType.UnfreezeEnemySound,
      url: `${matchingCardAudioUrl}/item/unfreezeEnemySound.mp3`,
    },
    {
      key: MatchingCardAudioType.ExileThrowEnemySound,
      url: `${matchingCardAudioUrl}/item/exileThrowEnemySound.mp3`,
    },
  ],
};
