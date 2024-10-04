import imgPath from '@/config/imgPath/imgPath';
import { ShopItemData, GameItemData, ShopItemInfo } from '@/helper/interface/AnswerGame';
import {
  WebGameLog,
  TotalProps,
  TowerDefenseGameLog,
  TowerDefenseGameData,
  HamsterTotalProps,
  HamsterGameLog,
  HamsterGameData,
  BejeweledGameLog,
  BejeweledGameData,
  ShooterGameLog,
  ShooterGameData,
  ParkourGameLog,
  ParkourGameData,
  FishingGameLog,
  FishingGameData,
  BomberManGameLog,
  BomberManGameData,
  BubbleDragonGameData,
  BubbleDragonGameLog,
  MatchingCardGameLog,
  MatchingCardGameData,
  PiggyGameLog,
  PiggyGameData,
  SnakeGameLog,
  SnakeGameData,
  VerticalParkourGameLog,
  VerticalParkourGameData,
  SpaceInvadersGameData,
  SpaceInvadersGameLog,
  Puzzle2048GameLog,
  Puzzle2048GameData,
} from '@/helper/interface/Game';
import TableManager, { ItemData, MatchingCardItemData, PiggyItemData } from '@/manager/TableManager';
import { GameType, WebGameMode } from '@/helper/enum/Common';
import { Store } from '@/types/store';
import Config from '@/config/setting';
import { HeroListData } from '@/helper/interface/Hero';
import { MapItemType } from '../BomberMan/Data/BomberManConfig';
import { PiggyItemType } from '../Piggy/Data/PiggyConfig';

/** 答題設定 */
export abstract class BaseAnswerGameStrategy {
  /** 遊戲假圖背景圖 */
  public abstract gameBg: string;
  /** 遊戲說明圖 */
  public abstract gameHelpBg: string;
  /** 魔王遊戲說明圖 */
  public abstract bossGameHelpBg: string;

  /** 快閃店道具資料 */
  public abstract get priceData(): ShopItemData[];

  /** 答題失敗的遊戲紀錄 */
  public abstract get failGameLog(): WebGameLog;

  /** 遊戲設定 */
  public abstract setGameData(store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void;

  /** 道具資料轉換成遊戲道具資料
   * @param itemData
   * @param folderName
   */
  protected toGameItemData(itemData: ItemData, folderName: string): GameItemData {
    const shopItemData: GameItemData = {
      /** 道具ID */
      itemId: itemData.id,
      /** 道具名稱Key */
      itemNameKey: itemData.nameKey,
      /** 道具圖片路徑 */
      itemImageUrl: `${Config.imgUrl}/img/h5/${folderName}/${itemData.url}`,
    };
    return shopItemData;
  }
}

/** 塔防答題設定 */
export class DefenseAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerDefenseBg;
  public gameHelpBg = imgPath.gameHelpDefenseBg;
  public bossGameHelpBg = imgPath.gameHelpDefenseBg;

  public get priceData(): ShopItemData[] {
    // 取得生物兵器表
    const weaponList = TableManager.defenseWeapon.getAll();

    // 取得道具清單 (非星球大戰)
    const itemDataList = weaponList.filter((data) => data.isPlanetWar === 0);

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 砲塔攻擊力資訊
      const attackInfo: ShopItemInfo = {
        cssClass: '#FFDD00',
        infoIcon: imgPath.atkIconBaseUrl,
        infoTitle: '砲塔攻擊力',
        infoValue: itemData.attack,
      };

      // 砲塔消耗魔力資訊
      const magicInfo: ShopItemInfo = {
        cssClass: '#2CEAEC',
        infoIcon: imgPath.magicIconBaseUrl,
        infoTitle: '消耗魔力',
        infoValue: itemData.magic,
      };

      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'defense/shop'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [attackInfo, magicInfo],
        gameCondition: '挑戰時間結束前，英雄的血量沒有耗盡',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: TowerDefenseGameLog = {
      gameScore: 0,
      gameMode: GameType.WebTowerDefense,
      browser: navigator.userAgent,
      towerKills: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定塔防遊戲設定
    const gameData: TowerDefenseGameData = {
      gameMode: WebGameMode.WorldContest,
      heroListData,
      totalProps,
      mapId: 0,
      enemies: [], // DefenseGameScene會讀取預設敵人JSON
      countdownTime: $$store.state.AnswerGameModule.answerResult.topicCount * 5 + 200,
    };
    $$store.commit('setTowerDefenseGameData', gameData);
  }
}

/** 打地鼠答題設定 */
export class HamsterAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerHamsterBg;
  public gameHelpBg = imgPath.gameHelpHamsterBg;
  public bossGameHelpBg = imgPath.gameHelpHamsterBg;

  public get priceData(): ShopItemData[] {
    const itemDataList = [...TableManager.hamsterDefense.getAll(), ...TableManager.hamsterHit.getAll()];

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'hamster/shop'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內消滅的地鼠數量達成目標數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: HamsterGameLog = {
      gameScore: 0,
      gameMode: GameType.WebHamster,
      browser: navigator.userAgent,
      hamsterKills: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 打地鼠裝備
    const hamsterTotalProps: HamsterTotalProps = {
      defense: [],
      attack: [],
    };

    totalProps.forEach((itemData) => {
      // 判斷防禦或是攻擊道具, 塞到相應的道具清單
      // 防禦道具
      if (TableManager.hamsterDefense.findOne(itemData.id) !== undefined) {
        hamsterTotalProps.defense.push(itemData);
      }
      // 攻擊道具
      else if (TableManager.hamsterHit.findOne(itemData.id) !== undefined) {
        hamsterTotalProps.attack.push(itemData);
      }
    });

    // 設定打地鼠遊戲設定
    const gameData: HamsterGameData = {
      totalProps: hamsterTotalProps,
      heroListData,
    };
    $$store.commit('setHamsterGameData', gameData);
  }
}

/** 消消樂答題設定 */
export class BejeweledAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerBejeweledBg;
  public gameHelpBg = imgPath.gameHelpBejeweledBg;
  public bossGameHelpBg = imgPath.gameHelpBejeweledBossBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.bejeweledBomb.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'bejeweled/shop'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內，總消除的英雄方塊達成目標值',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: BejeweledGameLog = {
      gameScore: 0,
      gameMode: GameType.WebBejeweled,
      browser: navigator.userAgent,
      bejeweledCount: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定消消樂遊戲設定
    const gameData: BejeweledGameData = {
      hid: heroListData.hid,
      bossId: $$store.getters.bossId,
      totalProps,
      // 消消樂消除目標由答對題數決定
      targetGems: $$store.state.AnswerGameModule.answerResult.topicCount * 10,
    };
    $$store.commit('setBejeweledGameData', gameData);
  }
}

/** 射擊答題設定 */
export class ShooterAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerShooterBg;
  public gameHelpBg = imgPath.gameHelpShooterBg;
  public bossGameHelpBg = imgPath.gameHelpShooterBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.shootBomb.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 砲塔攻擊力資訊
      const attackInfo: ShopItemInfo = {
        cssClass: '#FFDD00',
        infoIcon: imgPath.atkIconBaseUrl,
        infoTitle: '砲塔攻擊力',
        infoValue: itemData.attack,
      };

      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'shooter'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [attackInfo],
        gameCondition: '挑戰時間內順利消除所有目標物',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: ShooterGameLog = {
      gameScore: 0,
      gameMode: GameType.WebShooter,
      browser: navigator.userAgent,
      shootHp: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定射擊遊戲設定
    const gameData: ShooterGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setShooterGameData', gameData);
  }
}

/** 跑酷答題設定 */
export class ParkourAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerParkourBg;
  public gameHelpBg = imgPath.gameHelpParkourBg;
  public bossGameHelpBg = imgPath.gameHelpParkourBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.parkourItem.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'parkour'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內順利抵達終點，且積分達到目標數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: ParkourGameLog = {
      gameScore: 0,
      gameMode: GameType.WebParkour,
      browser: navigator.userAgent,
      diamondCount: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定跑酷遊戲設定
    const gameData: ParkourGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setParkourGameData', gameData);
  }
}

/** 釣魚答題設定 */
export class FishingAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerFishingBg;
  public gameHelpBg = imgPath.gameHelpFishingBg;
  public bossGameHelpBg = imgPath.gameHelpFishingBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.fishingItem.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'fishing'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內累計積分達成目標數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: FishingGameLog = {
      gameScore: 0,
      gameMode: GameType.WebFishing,
      browser: navigator.userAgent,
      catchAmount: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定釣魚遊戲設定
    const gameData: FishingGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setFishingGameData', gameData);
  }
}

/** 炸彈超人答題設定 */
export class BomberManAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerBomberManBg;
  public gameHelpBg = imgPath.gameHelpBomberManBg;
  public bossGameHelpBg = imgPath.gameHelpBomberManBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.bomberManItem.getAll();

    // 商店專用道具
    const shopItemList = itemDataList.filter((itemData) => itemData.isMapItem === MapItemType.StoreItem);

    // 轉換成快閃店商品格式
    return shopItemList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'bomberMan'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內達成目標分數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: BomberManGameLog = {
      gameScore: 0,
      gameMode: GameType.WebBomberMan,
      browser: navigator.userAgent,
      bomberKillCount: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定炸彈超人遊戲設定
    const gameData: BomberManGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setBomberManGameData', gameData);
  }
}

/** 泡泡龍答題設定 */
export class BubbleDragonAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerBubbleDragonBg;
  public gameHelpBg = imgPath.gameHelpBubbleDragonBg;
  public bossGameHelpBg = imgPath.gameHelpBubbleDragonBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.bubbleDragonItem.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'bubbleDragon'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內達成目標分數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: BubbleDragonGameLog = {
      gameScore: 0,
      gameMode: GameType.WebBubbleDragon,
      browser: navigator.userAgent,
      bubbleCount: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定泡泡龍遊戲設定
    const gameData: BubbleDragonGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setBubbleDragonGameData', gameData);
  }
}

/** 翻翻牌答題設定 */
export class MatchingCardAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerMatchingCardBg;
  public gameHelpBg = imgPath.gameHelpMatchingCardBg;
  public bossGameHelpBg = this.gameHelpBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.matchingCardItem.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'matchingCard'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內達成目標分數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: MatchingCardGameLog = {
      gameScore: 0,
      gameMode: GameType.WebMatchingCard,
      browser: navigator.userAgent,
      killCount: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定翻翻牌遊戲設定
    const gameData: MatchingCardGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setMatchingCardGameData', gameData);
  }
}

/** 小豬大野狼答題設定 */
export class PiggyAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerPiggyBg;
  public gameHelpBg = imgPath.gameHelpPiggyBg;
  public bossGameHelpBg = this.gameHelpBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.piggyItem.where(
      (item: Readonly<PiggyItemData>) => item.piggyItemType > PiggyItemType.None,
    );

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'piggy'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內達成目標分數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: PiggyGameLog = {
      gameScore: 0,
      gameMode: GameType.WebPiggy,
      browser: navigator.userAgent,
      killCount: 0,
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定小豬遊戲設定
    const gameData: PiggyGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setPiggyGameData', gameData);
  }
}

/** 貪食蛇答題設定 */
export class SnakeAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerSnakeBg;
  public gameHelpBg = imgPath.gameHelpSnakeBg;
  public bossGameHelpBg = this.gameHelpBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.snakeItem.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'snake'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內達成目標分數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): WebGameLog {
    const gameLog: SnakeGameLog = {
      gameScore: 0,
      gameMode: GameType.WebSnake,
      browser: navigator.userAgent,
      eatFoods: [],
      snakeLength: 0,
      useProps: [],
    };
    return gameLog;
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定遊戲設定
    const gameData: SnakeGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setSnakeGameData', gameData);
  }
}

/** 垂直跑酷答題設定 */
export class VerticalParkourAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerVerticalParkourBg;
  public gameHelpBg = imgPath.gameHelpVerticalParkourBg;
  public bossGameHelpBg = this.gameHelpBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.verticalParkourItem.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'verticalParkour'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '躲避怪物，獲取鑰匙解鎖寶箱並收集金幣，使積分達到目標數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): VerticalParkourGameLog {
    return {
      gameScore: 0,
      gameMode: GameType.WebVerticalParkour,
      browser: navigator.userAgent,
      useProps: [],
      coinCount: 0,
    };
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定垂直跑酷遊戲設定
    const gameData: VerticalParkourGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setVerticalParkourGameData', gameData);
  }
}

/** 太空侵略者答題設定 */
export class SpaceInvadersAnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerSpaceInvadersBg;
  public gameHelpBg = imgPath.gameHelpSpaceInvadersBg;
  public bossGameHelpBg = this.gameHelpBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.spaceInvadersItem.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'spaceInvaders'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '挑戰時間內達成目標分數',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): SpaceInvadersGameLog {
    return {
      gameScore: 0,
      gameMode: GameType.WebSpaceInvaders,
      browser: navigator.userAgent,
      useProps: [],
      killCount: 0,
    };
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定遊戲設定
    const gameData: SpaceInvadersGameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setSpaceInvadersGameData', gameData);
  }
}

/** 2048答題設定 */
export class Puzzle2048AnswerGame extends BaseAnswerGameStrategy {
  public gameBg = imgPath.answerPuzzle2048Bg;
  public gameHelpBg = imgPath.gameHelpPuzzle2048Bg;
  public bossGameHelpBg = this.gameHelpBg;

  public get priceData(): ShopItemData[] {
    // 取得道具清單
    const itemDataList = TableManager.puzzle2048Item.getAll();

    // 轉換成快閃店商品格式
    return itemDataList.map<ShopItemData>((itemData) => {
      // 快閃店商品資料
      const shopItemData: ShopItemData = {
        gameItemData: this.toGameItemData(itemData, 'puzzle2048'),
        itemContentKey: itemData.contentKey,
        itemCost: itemData.energy,
        itemInfo: [],
        gameCondition: '合併數字達到高分',
      };
      return shopItemData;
    });
  }

  public get failGameLog(): Puzzle2048GameLog {
    return {
      gameScore: 0,
      gameMode: GameType.WebPuzzle2048,
      browser: navigator.userAgent,
      useProps: [],
    };
  }

  public setGameData($$store: Store, heroListData: HeroListData, totalProps: TotalProps[]): void {
    // 設定垂直跑酷遊戲設定
    const gameData: Puzzle2048GameData = {
      totalProps,
      heroListData,
    };
    $$store.commit('setPuzzle2048GameData', gameData);
  }
}
