import Config from '../setting';
const adornmentItemBaseUrl = `${Config.imgUrl}/img/h5/adornment/adornmentItem`;
const personalBaseGameImgPath = {
  adornmentItemBaseUrl: `${adornmentItemBaseUrl}`,
  /** 個人基地ICON */
  personalBaseIcon: `${require('@/assets/images/personalBaseGame/icon_furniture3.png')}`,
  /** 個人基地 */
  personalTitleBar: `${require('@/assets/images/personalBaseGame/title.png')}`,
  /* *購買背景 */
  buyBg: require('@/assets/images/personalBaseGame/buy_bg.png'),
  /** 販賣背景 */
  sellBg: require('@/assets/images/personalBaseGame/sell_bg.png'),
  /** 黑底白框右斜 */
  frameRightSlide: require('@/assets/images/personalBaseGame/frame_rightslide.svg'),
  /** 黑底白框左斜 */
  frameLeftSlide: require('@/assets/images/personalBaseGame/frame_leftslide.svg'),
};
export default personalBaseGameImgPath;
