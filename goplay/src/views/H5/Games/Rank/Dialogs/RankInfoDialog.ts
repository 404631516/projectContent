import UIDialog from '../../../Scripts/Components/UIDialog';
import { RankString } from '../Data/RankConfig';
import RankItem from '../Component/RankItem';
import { RankListData } from '@/helper/interface/Rank';
import { RankRuleType } from '@/helper/enum/Common';

export default class RankInfoDialog extends UIDialog {
  /** 排行Item Map, key為playerId, value為對應的RankItem */
  private playerRankMap: Map<number, RankItem> = new Map<number, RankItem>();

  protected setUI(): void {
    // 標題
    this.addImage(RankString.TitleBG, 512, 70);
    this.addImage(RankString.Title, 512, 70);
  }

  /** 接收到排行榜資料更新
   * @param newRankData
   * @param rankRule
   */
  public onRankUpdate(newRankData: RankListData[], rankRule: RankRuleType): void {
    // 刪除離開排行榜者
    const deletePlayerIds = new Array<number>();
    this.playerRankMap.forEach((rankItem, playerId) => {
      // 新的排行榜中是否還有此人
      const playerRankData = newRankData.find((data) => {
        return data.playerId === playerId;
      });
      // 新的排行榜中沒有此人, 從排行榜移除
      if (playerRankData === undefined) {
        rankItem.selfDestroy();
        deletePlayerIds.push(playerId);
      }
    });
    // 從Map刪除
    deletePlayerIds.forEach((playerId) => {
      this.playerRankMap.delete(playerId);
    });

    // 更新現有排名
    for (const rankData of newRankData) {
      // 嘗試取得對應rankItem
      const rankItem = this.playerRankMap.get(rankData.playerId);
      // rankItem已存在, refresh()
      if (rankItem !== undefined) {
        rankItem.refresh(rankData);
      }
      // 新加入排行榜者, create RankItem
      else {
        const newRankItem = this.addObject(0, 0, RankItem);
        newRankItem.init(rankData, rankRule);
        this.playerRankMap.set(rankData.playerId, newRankItem);
      }
    }
  }
}
