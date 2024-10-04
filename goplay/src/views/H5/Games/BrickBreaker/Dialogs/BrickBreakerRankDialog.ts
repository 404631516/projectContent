import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import { BrickBreakerAvatarData, getBrickBreakerAvatarScore } from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import UIDialog from '@/views/H5/Scripts/Components/UIDialog';
import BrickBreakerRankObject from '../Components/Dialog/BrickBreakerRankObject';
import { BrickBreakerString } from '../Data/BrickBreakerConfig';
import BrickBreakerGameScene from '../Scenes/BrickBreakerGameScene';

export interface BrickBreakerAvatarDataWithScore extends BrickBreakerAvatarData {
  score: number;
}

export default class BrickBreakerRankDialog extends UIDialog {
  /** 指定為BrickBreakerGameScene使用 */
  public declare scene: BrickBreakerGameScene;

  /** 當前玩家人數提示 */
  private playerNumberText!: Phaser.GameObjects.Text;

  /** 所有玩家資料 */
  private avatarScoreDataMap: Map<number, BrickBreakerAvatarDataWithScore> = new Map<
    number,
    BrickBreakerAvatarDataWithScore
  >();

  private rankObjects: BrickBreakerRankObject[] = [];

  protected setUI(): void {
    // 遊戲人數提示
    const gameInfoBgImg = this.addImage(BrickBreakerString.FrameMap, 910, 26);
    gameInfoBgImg.setScale(0.54, 0.54);
    gameInfoBgImg.setInteractive({ useHandCursor: true });
    const mapIcon = this.addImage(BrickBreakerString.MapIcon, 840, 22);
    mapIcon.setScale(0.54, 0.54);
    this.playerNumberText = this.addText('', 864, 26, { fontSize: '14px' });
    this.playerNumberText.setOrigin(0, 0.5);

    // 背景
    const rankBgImg = this.addImage(BrickBreakerString.FrameRank, 910, 210);
    rankBgImg.setScale(0.54, 0.54);
    rankBgImg.setInteractive({ useHandCursor: true });

    // title
    const rankIcon = this.addImage(BrickBreakerString.RankIcon, 850, 70);
    rankIcon.setScale(0.6);
    const rankTitle = this.addText(
      Localization.getText(LocalKeyType.Common, 'brickBreaker_rankDialog_title'),
      860,
      70,
      { fontSize: '14px' }
    );
    rankTitle.setOrigin(0, 0.5);

    // rankObjects
    const rankObjectY = 110;
    const rankObjectYOffset = 48;
    for (let i = 0; i < 5; ++i) {
      const rankObject = this.addObject(910, rankObjectY + rankObjectYOffset * i, BrickBreakerRankObject);
      rankObject.init(i + 1);
      this.rankObjects.push(rankObject);
    }

    // openVueButton
    const openVueButton = this.addImage(BrickBreakerString.YellowButton, 910, 350);
    openVueButton.setScale(0.56);
    openVueButton.setInteractive({ useHandCursor: true });
    openVueButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // 通知BrickBreakerGameScene
      this.scene.onClickScoreBoardButton();
    });
    this.addText(Localization.getText(LocalKeyType.Common, 'brickBreaker_rankDialog_scoreBoardButton'), 910, 348, {
      fontSize: '12px',
    });
  }

  /** 收到avatar通知
   * @param avatarData 更新的avatarData
   */
  public onAvatarDataUpdate(avatarData: BrickBreakerAvatarData): void {
    // 新增/更新一筆avatarData
    this.upsertAvatarData(avatarData);
    // 更新畫面
    this.refreshUI();
  }

  /** 取得avatarScoreDataMap */
  public getAvatarScoreDataMap(): Map<number, BrickBreakerAvatarDataWithScore> {
    return this.avatarScoreDataMap;
  }

  /** 新增/更新一筆avatarData
   * @param avatarData 資料更新的avatarData
   */
  private upsertAvatarData(avatarData: BrickBreakerAvatarData): void {
    // 計算綜合分數
    const avatarScoreData: BrickBreakerAvatarDataWithScore = {
      ...avatarData,
      score: getBrickBreakerAvatarScore(avatarData),
    };
    // 更新或新增avatarScoreData
    this.avatarScoreDataMap.set(avatarScoreData.uid, avatarScoreData);
  }

  /** 更新畫面 */
  private refreshUI(): void {
    // 取得依分數排序的avatarData array
    const sortedAvatarDataList = Array.from(this.avatarScoreDataMap.values());
    sortedAvatarDataList.sort((a, b) => {
      return b.score - a.score;
    });
    // 更新人數
    this.playerNumberText.text = Localization.getText(LocalKeyType.Common, 'brickBreaker_rankDialog_playerNumber', [
      sortedAvatarDataList.length.toString(),
    ]);
    // 更新rankObjects
    for (let i = 0; i < this.rankObjects.length; ++i) {
      this.rankObjects[i].onUpdate(sortedAvatarDataList[i]);
    }
    // 通知storeHelper, 更新vue資料
    StoreHelper.$$store.commit('setPlayerScoreList', sortedAvatarDataList);
  }
}
