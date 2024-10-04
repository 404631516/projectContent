import Config from '@/config/setting';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { RankString } from './RankConfig';

/** 圖片資源的資料夾路徑 */
export const imgUrl = `${Config.imgUrl}/img/h5/rank`;

/** 各資源的路徑 */
export const rankResourceData: ResourceData = {
  images: [
    // 背景
    { key: RankString.BG, url: `${imgUrl}/bg.png` },
    // 標題
    { key: RankString.Title, url: `${imgUrl}/title_t.png` },
    { key: RankString.TitleBG, url: `${imgUrl}/gradient_overlay.png` },
    // rank長條
    { key: RankString.RankFrame1, url: `${imgUrl}/frame_yellow.png` },
    { key: RankString.RankFrame2, url: `${imgUrl}/frame_gray.png` },
    { key: RankString.RankFrame3, url: `${imgUrl}/frame_brown.png` },
    { key: RankString.RankFrameOther, url: `${imgUrl}/frame_blue.png` },
    // rank number
    { key: RankString.RankNumber0, url: `${imgUrl}/0.png` },
    { key: RankString.RankNumber1, url: `${imgUrl}/1.png` },
    { key: RankString.RankNumber2, url: `${imgUrl}/2.png` },
    { key: RankString.RankNumber3, url: `${imgUrl}/3.png` },
    { key: RankString.RankNumber4, url: `${imgUrl}/4.png` },
    { key: RankString.RankNumber5, url: `${imgUrl}/5.png` },
    { key: RankString.RankNumber6, url: `${imgUrl}/6.png` },
    { key: RankString.RankNumber7, url: `${imgUrl}/7.png` },
    { key: RankString.RankNumber8, url: `${imgUrl}/8.png` },
    { key: RankString.RankNumber9, url: `${imgUrl}/9.png` },
    { key: RankString.RankNumberWin, url: `${imgUrl}/1win.png` },
    // 按鈕
    { key: RankString.BackToTop, url: `${imgUrl}/backToTop.png` },
  ],
};
