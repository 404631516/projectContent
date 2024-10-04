import { TotalProps } from '@/helper/interface/Game';
import { HeroListData } from '@/helper/interface/Hero';

/** 翻翻牌-開始遊戲vue帶過來的資料 */
export interface MatchingCardGameData {
  /** 道具清單 */
  totalProps: TotalProps[];
  /** 出戰英雄資料 */
  heroListData: HeroListData;
}
