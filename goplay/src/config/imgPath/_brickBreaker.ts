import Config from '../setting';
const brickBreakerImgUrl = `${Config.imgUrl}/img/h5/brickBreaker`;

const brickBreakerImgPath = {
  /** 皇冠ICON */
  crownIcon: `${brickBreakerImgUrl}/crown.png`,
  /** 銀牌ICON */
  silverMedal: `${brickBreakerImgUrl}/silver-medal.png`,
  /** 銅牌ICON */
  bronzeMedal: `${brickBreakerImgUrl}/bronze-medal.png`,
  /** 盾牌道具 */
  brickBreakerShield: `${brickBreakerImgUrl}/iconShield.png`,
  /** 攻擊道具 */
  brickBreakerAxe: `${brickBreakerImgUrl}/iconAxe.png`,
  /** 冰凍保護道具 */
  brickBreakerFreezePrevent: `${brickBreakerImgUrl}/iconFreezePrevent.png`,
  /** 離線圖示 */
  fx_offline: `${brickBreakerImgUrl}/offlineIcon.png`,
  /** YOU圖 */
  selfTag: `${require('@/assets/images/icon/selfTag.png')}`,
  /** MVP */
  mvpImg: `${require('@/assets/images/icon/mvp.png')}`,
};
export default brickBreakerImgPath;
