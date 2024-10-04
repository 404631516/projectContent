import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { BrickBreakerString } from '../../Data/BrickBreakerConfig';
import { BrickBreakerAvatarDataWithScore } from '../../Dialogs/BrickBreakerRankDialog';

export default class BrickBreakerRankObject extends Object2D {
  /** 英雄圖片 */
  private heroIcon!: Phaser.GameObjects.Image;
  /** 玩家姓名 */
  private nameText!: Phaser.GameObjects.Text;
  /** 分數 */
  private scoreText!: Phaser.GameObjects.Text;
  /** 離線icon */
  private offlineIcon!: Phaser.GameObjects.Image;

  public init(rankNumber: number): void {
    // 背景
    const bg = this.addImage(
      rankNumber === 1 ? BrickBreakerString.RankFrameGold : BrickBreakerString.RankFrameNormal,
      0,
      0
    );
    bg.setScale(0.52);
    // 排名圖案
    let rankIcon: Phaser.GameObjects.Image;
    const rankIconX = -60;
    const rankIconY = 0;
    switch (rankNumber) {
      case 1:
        rankIcon = this.addImage(BrickBreakerString.RankGoldMedal, rankIconX, rankIconY);
        rankIcon.setScale(0.4);
        break;
      case 2:
        rankIcon = this.addImage(BrickBreakerString.RankSliverMedal, rankIconX, rankIconY);
        rankIcon.setScale(0.5);
        break;
      case 3:
        rankIcon = this.addImage(BrickBreakerString.RankBronzeMedal, rankIconX, rankIconY);
        rankIcon.setScale(0.5);
        break;
      case 4:
      case 5:
        this.addText(rankNumber.toString(), rankIconX, rankIconY, {
          fontSize: '14px',
        });
        break;
      default:
        break;
    }

    // 生成英雄圖片
    const heroIconBg = this.addImage(BrickBreakerString.FrameHead, -30, 0);
    heroIconBg.setScale(0.5);
    this.heroIcon = this.addImage('', -30, 0);
    this.heroIcon.setScale(0.5);
    // 離線icon
    this.offlineIcon = this.addImage(BrickBreakerString.OfflineIcon, -30, 12);
    this.offlineIcon.setScale(0.5);
    // 玩家姓名
    this.nameText = this.addText('name', -6, -6, { fontSize: '20px' });
    this.nameText.setOrigin(0, 0.5);
    // 分數
    this.scoreText = this.addText('score', -6, 6, { fontSize: '14px', color: UIHelper.yellowString });
    this.scoreText.setOrigin(0, 0.5);
  }

  onUpdate(avatarScoreData: BrickBreakerAvatarDataWithScore | undefined): void {
    // show/hide
    const alpha = avatarScoreData === undefined ? 0 : 1;
    this.setAlpha(alpha);

    // 沒資料進來的情況(總人數不滿五人)
    if (avatarScoreData === undefined) {
      return;
    }

    // 尋找對應heroData
    const heroData = HeroManager.getHeroData(avatarScoreData.heroId);
    if (heroData === undefined) {
      console.error(
        'BrickBreakerGamePlayerComponent error, heroData undefined, ' + 'heroId = ' + avatarScoreData.heroId
      );
      return;
    }

    // 英雄圖案
    this.heroIcon.setTexture(`${heroData.nameKey}${HeroImgType.Head}`);
    // 離線icon
    this.offlineIcon.setVisible(avatarScoreData.isOnline === false);
    // 玩家姓名
    this.nameText.text = avatarScoreData.name;
    // 調整text scale, 靠縮放大小限制顯示範圍
    UIHelper.setScaleFill(this.nameText, 20, 80);
    // 分數
    this.scoreText.text = Localization.getText(LocalKeyType.Common, 'brickBreaker_rankDialog_objectScore', [
      avatarScoreData.score.toString(),
    ]);
  }
}
