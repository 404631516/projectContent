import Config from '@/config/setting';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { BubbleDragonString } from './BubbleDragonConfig';

/** 圖片資源的資料夾路徑 */
export const bubbleDragonImgUrl = `${Config.imgUrl}/img/h5/bubbleDragon`;
/** 音效資源的資料夾路徑 */
export const bubbleDragonAudioUrl = `${Config.imgUrl}/audio/bubbleDragon`;
/** json資源的資料夾路徑 */
export const bubbleDragonJsonUrl = `${Config.imgUrl}/json/bubbleDragon`;

/** 各資源的路徑及預設位置 */
export const bubbleDragonResourceData: ResourceData = {
  images: [
    // 背景圖
    {
      key: BubbleDragonString.Background,
      url: `${bubbleDragonImgUrl}/bg.png`,
    },
    // 音樂開啟
    {
      key: BubbleDragonString.SoundOnIcon,
      url: `${Config.imgUrl}/img/h5/baseScene/sound_on_icon.png`,
    },
    // 音樂關閉
    {
      key: BubbleDragonString.SoundOffIcon,
      url: `${Config.imgUrl}/img/h5/baseScene/sound_off_icon.png`,
    },
    // 上方牆壁
    {
      key: BubbleDragonString.TopWall,
      url: `${bubbleDragonImgUrl}/scene_walltop.png.png`,
    },
    // 下方牆壁
    {
      key: BubbleDragonString.BottomWall,
      url: `${bubbleDragonImgUrl}/scene_wallbottom.png`,
    },
    // 牆壁中間漸層
    {
      key: BubbleDragonString.Gradient,
      url: `${bubbleDragonImgUrl}/scene_gradient.png`,
    },
    // 英雄站的平台
    {
      key: BubbleDragonString.Platform,
      url: `${bubbleDragonImgUrl}/scene_platform.png`,
    },
    // 彈匣
    {
      key: BubbleDragonString.Magazine,
      url: `${bubbleDragonImgUrl}/scene_magazine.png`,
    },
    // 瞄準鏡
    {
      key: BubbleDragonString.Scope,
      url: `${bubbleDragonImgUrl}/item_scope.png`,
    },
    // 道具炸彈
    {
      key: BubbleDragonString.BombBubble,
      url: `${bubbleDragonImgUrl}/ItemBubble/bomb.png`,
    },
    // 道具穿甲
    {
      key: BubbleDragonString.PenetrateBubble,
      url: `${bubbleDragonImgUrl}/ItemBubble/penetrate.png`,
    },
    // 瞄準線路徑
    {
      key: BubbleDragonString.SupportLinePath,
      url: `${bubbleDragonImgUrl}/supportLine_path.png`,
    },
    // 瞄準線尾端
    {
      key: BubbleDragonString.SupportLineEnd,
      url: `${bubbleDragonImgUrl}/supportLine_end.png`,
    },
    // 防禦線
    {
      key: BubbleDragonString.DefenceLine,
      url: `${bubbleDragonImgUrl}/scene_defenceLine.png`,
    },
    // 提示圖案
    {
      key: BubbleDragonString.HintImage,
      url: `${Config.imgUrl}/img/h5/baseScene/info.png`,
    },
    // 提示背景
    {
      key: BubbleDragonString.HintBackground,
      url: `${Config.imgUrl}/img/h5/baseScene/frame.png`,
    },
  ],
  spritesheets: [
    // 泡泡圖集
    {
      key: BubbleDragonString.Bubble,
      url: `${bubbleDragonImgUrl}/bubble.png`,
      frameConfig: {
        // 寶石
        frameWidth: 62,
        frameHeight: 62,
      },
    },
    // 泡泡受傷圖集
    {
      key: BubbleDragonString.BubbleDamage,
      url: `${bubbleDragonImgUrl}/bubble_damage.png`,
      frameConfig: {
        // 寶石
        frameWidth: 62,
        frameHeight: 62,
      },
    },
    // 泡泡消失特效
    {
      key: BubbleDragonString.BubbleRemoveFX,
      url: `${bubbleDragonImgUrl}/removeBubbleFX.png`,
      frameConfig: {
        frameWidth: 256,
        frameHeight: 256,
      },
    },
  ],
  audios: [
    // 背景音樂
    {
      key: BaseSceneString.BGM,
      url: `${Config.cloudStorage}backgroundMusic/website/Games_music.mp3`,
    },
    // 清除音效
    {
      key: BubbleDragonString.SoundCleanBubble,
      url: `${bubbleDragonAudioUrl}/cleanBubble.mp3`,
    },
    // 生成音效
    {
      key: BubbleDragonString.SoundGrowUpBubble,
      url: `${bubbleDragonAudioUrl}/growUpBubble.mp3`,
    },
    // 反彈音效
    {
      key: BubbleDragonString.SoundReflectionBubble,
      url: `${bubbleDragonAudioUrl}/reflectionBubble.mp3`,
    },
    // 射擊音效
    {
      key: BubbleDragonString.SoundShootBubble,
      url: `${bubbleDragonAudioUrl}/shootBubble.mp3`,
    },
    // 裝填音效
    {
      key: BubbleDragonString.SoundCharge,
      url: `${bubbleDragonAudioUrl}/ballMovement.mp3`,
    },
    // 用道具音效
    {
      key: BubbleDragonString.SoundSwitchItem,
      url: `${bubbleDragonAudioUrl}/switchIterm.mp3`,
    },
  ],
  // 角色動畫
  animations: [
    // 爆風動畫
    {
      key: BubbleDragonString.JsonAnims,
      url: `${bubbleDragonJsonUrl}/Anims.json`,
    },
  ],
};
