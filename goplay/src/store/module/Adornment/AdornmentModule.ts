import { farmMapDataAPI, farmMapUnitAllAPI, farmMapUnitAPI, heroj7StoreAPI } from '@/api/adornment';
import { Message } from '@/helper/class/Common';
import { ItemType } from '@/helper/enum/AnswerGame';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { AdornmentPosition, AdornmentListData, MapData, PersonalBase, RoomStatus } from '@/helper/interface/Adornment';
import { BackpackItem } from '@/helper/interface/Common';
import { AdornmentGameData } from '@/helper/interface/Game';
import TableManager, { AdornmentItemData } from '@/manager/TableManager';
import { commit } from '@/store';
import { ActionContext, ReturnGetters } from '@/types/store';
import { AdornmentRoomSizeType } from '@/views/H5/Games/PersonalBase/Data/AdornmentConfig';

/** 房間佈置-初始遊戲資料 */
export interface AdornmentState {
  /** 使用者UID */
  userUid: number;
  /** 房間佈置頁面 */
  personalBaseList: PersonalBase[];
  /** 已放置裝飾物位置 */
  adornmentPositionList: Map<number, AdornmentPosition[]>;
  /** 遊戲設定 */
  gameData?: AdornmentGameData;
  /** 裝飾物總積分 */
  adornmentTotalScore: number;
  /** 可解鎖大房間的額度 */
  unlockBigRoomQuota: number;
  /** 可解鎖小房間的額度 */
  unlockSmallRoomQuota: number;
  /** 下次可解鎖大房間所需英雄積分 */
  unlockBigRoomNeedHeroPoint: number;
  /** 下次可解鎖小房間所需英雄積分 */
  unlockSmallRoomNeedHeroPoint: number;
  /** 裝飾物資料 */
  adornmentList: AdornmentListData[];
  /** 被拜訪者姓名 */
  visitedBaseOwnerName: string;
  /** 被拜訪者排名 */
  visitedBaseOwnerRank: number;
  /** 是否為拜訪 */
  isVisit: boolean;
  /** 開始佈置的道具ID */
  editAdornmentItemID: number;
}

const moduleState: AdornmentState = {
  userUid: -1,
  personalBaseList: [],
  adornmentPositionList: new Map<number, AdornmentPosition[]>(),
  adornmentTotalScore: 0,
  unlockBigRoomQuota: 0,
  unlockSmallRoomQuota: 0,
  unlockBigRoomNeedHeroPoint: 0,
  unlockSmallRoomNeedHeroPoint: 0,
  adornmentList: [],
  visitedBaseOwnerName: '',
  visitedBaseOwnerRank: -1,
  isVisit: false,
  editAdornmentItemID: -1,
};

const moduleGetters = {
  /** 判斷是否為最高等級 */
  isAdornmentMaxLevel(state: AdornmentState): boolean {
    if (state.gameData == null) {
      return false;
    }
    return state.gameData.heroTotalPoint >= state.gameData.adornmentLevelData.nextLevelPoint;
  },
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 初始化設定 adornmentList
   * @param state
   * @param adornmentList
   */
  setAdornmentList(state: AdornmentState, adornmentList: AdornmentListData[]) {
    state.adornmentList = adornmentList;
  },

  /** 更新 adornmentList
   * @param state
   * @param updateData
   */
  onUpdateAdornmentList(state: AdornmentState, updateData: BackpackItem) {
    state.adornmentList.forEach((adornment) => {
      if (adornment.id === updateData.itemId) {
        adornment.backpackNum = updateData.useNum;
        adornment.itemUid = updateData.itemUid;
      }
    });
  },

  /** 設定UID
   *  @param state
   *  @param uid 使用者ID
   */
  setAdornmentUserUid(state: AdornmentState, uid: number) {
    state.userUid = uid;
  },

  /** 設定房間佈置頁面列表
   *  @param state
   *  @param basePageList 房間頁面列表
   */
  setPersonalBase(state: AdornmentState, basePage: PersonalBase) {
    state.personalBaseList.push(basePage);
  },

  /** 解鎖房間佈置頁面
   *  @param state
   *  @param basePage 房間頁面
   */
  unlockPersonalBasePage(state: AdornmentState, basePage: PersonalBase) {
    const personalBasePage = state.personalBaseList.find((page) => page.farmMapUid === basePage.farmMapUid);
    if (personalBasePage == null) {
      // 新房間放進列表
      state.personalBaseList.push(basePage);
      // 創建新的裝飾物位置列表
      commit('createAdornmentPositionList', basePage.farmMapId);
    }
  },

  /** 裝飾物總積分
   * @param state
   * @param newTotalScore 總積分
   */
  setAdornmentTotalScore(state: AdornmentState, newTotalScore: number) {
    state.adornmentTotalScore = newTotalScore;
  },

  /** 設定裝飾物位置列表
   *  @param state
   *  @param itemPositionList 裝飾物位置列表
   */

  setAdornmentPositionList(state: AdornmentState, itemPositionList: AdornmentPosition[]) {
    // 存在則更新陣列
    state.adornmentPositionList.set(itemPositionList[0].farmMapId, itemPositionList);
  },

  /** 創建新的裝飾物位置列表
   *  @param state
   *  @param farmMapId 房間編號
   */
  createAdornmentPositionList(state: AdornmentState, farmMapId: number) {
    state.adornmentPositionList.set(farmMapId, []);
  },

  /** 放置裝飾物位置
   *  @param state
   *  @param itemPosition 裝飾物位置
   */
  addAdornmentPosition(state: AdornmentState, itemPosition: AdornmentPosition) {
    // 先找出是否存在該房間的裝飾物列表

    const itemPositionList = state.adornmentPositionList.get(itemPosition.farmMapId);
    if (itemPositionList == null) {
      // 不存在則報錯
      console.error(`${itemPosition.farmMapId}放置錯誤，取不到該房間編號`);
      return;
    } else {
      // 存在則塞一筆資料進Array
      itemPositionList.push(itemPosition);
    }
  },

  /** 移除裝飾物位置
   *  @param state
   *  @param itemPosition 裝飾物位置
   */
  deleteAdornmentPosition(state: AdornmentState, itemPosition: AdornmentPosition) {
    // 依MapId找到裝飾物位置列表
    const itemPositionList = state.adornmentPositionList.get(itemPosition.farmMapId);
    if (itemPositionList == null) {
      console.error(`${itemPosition.farmMapId}移除錯誤，取不到該房間頁面裝飾物列表`);
      return;
    }

    // 依MapUnitUid移除該裝飾物

    const index = itemPositionList.findIndex((item) => item.farmMapUnitUid === itemPosition.farmMapUnitUid);
    if (index === -1) {
      console.error(`${itemPosition.farmMapUnitUid}移除錯誤，取不到該裝飾物`);
      return;
    }

    // 從列表中移除裝飾物
    itemPositionList.splice(index, 1);
  },

  /** 移除裝飾物位置By房間位置
   *  @param state
   *  @param itemPosition 裝飾物位置
   */
  deleteAdornmentPositionByMapIndex(state: AdornmentState, itemPosition: AdornmentPosition) {
    // 依MapId找到裝飾物位置列表
    const itemPositionList = state.adornmentPositionList.get(itemPosition.farmMapId);
    if (itemPositionList == null) {
      console.error(`${itemPosition.farmMapId}移除錯誤，取不到該房間頁面裝飾物列表`);
      return;
    }

    // 依位置移除該裝飾物
    const index = itemPositionList.findIndex((item) => item.mapIndex === itemPosition.mapIndex);
    if (index === -1) {
      console.error(`${itemPosition.mapIndex}移除錯誤，取不到該裝飾物`);
      return;
    }

    // 從列表中移除裝飾物
    itemPositionList.splice(index, 1);
  },

  /** 清空房間列表
   *  @param state
   */
  clearPersonalBaseList(state: AdornmentState) {
    state.personalBaseList.splice(0);
  },

  /** 清空房間裝飾物列表
   *  @param state
   */
  clearAdornmentPositionList(state: AdornmentState) {
    state.adornmentPositionList.clear();
  },

  /** 設定遊戲資料
   * @param state
   * @param gameData 遊戲資料
   */
  setAdornmentGameData(state: AdornmentState, gameData: AdornmentGameData) {
    state.gameData = gameData;
  },

  /** 可解鎖大房間的額度 */
  setUnlockBigRoomQuota(state: AdornmentState, newBigRoomQuota: number) {
    state.unlockBigRoomQuota = newBigRoomQuota;
  },

  /** 可解鎖小房間的額度 */
  setUnlockSmallRoomQuota(state: AdornmentState, newSmallRoomQuota: number) {
    state.unlockSmallRoomQuota = newSmallRoomQuota;
  },

  /** 下次可解鎖大房間所需英雄積分 */
  setUnlockBigRoomNeedHeroPoint(state: AdornmentState, newHeroPoint: number) {
    state.unlockBigRoomNeedHeroPoint = newHeroPoint;
  },

  /** 下次可解鎖小房間所需英雄積分 */
  setUnlockSmallRoomNeedHeroPoint(state: AdornmentState, newHeroPoint: number) {
    state.unlockSmallRoomNeedHeroPoint = newHeroPoint;
  },

  /** 設定是否為拜訪
   * @param state
   * @param isVisit 是否為拜訪
   */
  setAdornmentIsVisit(state: AdornmentState, isVisit: boolean) {
    state.isVisit = isVisit;
  },

  /** 設定被拜訪者姓名
   * @param state
   * @param name 姓名
   */
  setVisitBaseOwnerName(state: AdornmentState, name: string) {
    state.visitedBaseOwnerName = name;
  },

  /** 設定被拜訪者排名
   * @param state
   * @param rank 排名
   */
  setVisitBaseOwnerRank(state: AdornmentState, rank: number) {
    state.visitedBaseOwnerRank = rank;
  },

  /** 計算 可解鎖房間的額度 及 下次可解鎖房間所需英雄積分
   *  @param state
   *  @param roomStatus 房間狀態
   */
  setUnlockRoomStatus(state: AdornmentState, roomStatus: RoomStatus) {
    // 等級靜態表
    const levelTableList = TableManager.adornmentLevel.getAll();

    // 從lv1~目前房間等級，累加大小房間的額度
    let unlockBigRoomQuota = 0;
    let unlockSmallRoomQuota = 0;
    for (let levelID = 1; levelID <= roomStatus.levelData.id; levelID++) {
      const levelTable = levelTableList[levelID - 1];
      if (levelTable == null) {
        console.error(`calcRoomUnlockQuota: levelTable is null. id=${levelID}`);
        return;
      }
      unlockBigRoomQuota += levelTable.unlockBigRoomQuota;
      unlockSmallRoomQuota += levelTable.unlockSmallRoomQuota;
    }

    // 檢查每一間房, 累計已解鎖房間數
    roomStatus.roomList.forEach((dbRoom) => {
      // 找出房間靜態表
      const roomTable = TableManager.adornmentRoom.findOne(dbRoom.farmMapId);
      if (roomTable == null) {
        console.error(`calcRoomUnlockCount: roomTable is null. id=${dbRoom.farmMapId}`);
        return;
      }

      // 區分大小房，減去額度
      switch (roomTable.roomSize) {
        case AdornmentRoomSizeType.Big:
          unlockBigRoomQuota--;
          break;
        case AdornmentRoomSizeType.Small:
          unlockSmallRoomQuota--;
          break;

        default:
          console.error(`calcRoomUnlockCount: undefine. roomSize=${roomTable.roomSize}`);
          break;
      }
    });

    // 儲存剩餘額度
    commit('setUnlockBigRoomQuota', unlockBigRoomQuota);
    commit('setUnlockSmallRoomQuota', unlockSmallRoomQuota);

    // 下一等級
    const nextLevelID = roomStatus.levelData.id + 1;
    // 到達最高等級，不需要計算
    if (nextLevelID > levelTableList.length) {
      commit('setUnlockBigRoomNeedHeroPoint', 0);
      commit('setUnlockSmallRoomNeedHeroPoint', 0);
      return;
    }

    // 計算解鎖大房間所需積分
    // 檢查目前lv到可解鎖房間的等級
    for (let checkLevelID = nextLevelID; checkLevelID < levelTableList.length; checkLevelID++) {
      const checkLevelData = levelTableList[checkLevelID - 1];
      // 檢查開啟房間的額度
      if (checkLevelData.unlockBigRoomQuota > 0) {
        commit('setUnlockBigRoomNeedHeroPoint', checkLevelData.nextLevelPoint);
        break;
      }
    }

    // 計算解鎖大房間所需積分
    // 檢查目前lv到可解鎖房間的等級
    for (let checkLevelID = nextLevelID; checkLevelID < levelTableList.length; checkLevelID++) {
      const checkLevelData = levelTableList[checkLevelID - 1];
      // 檢查開啟房間的額度
      if (checkLevelData.unlockSmallRoomQuota > 0) {
        commit('setUnlockSmallRoomNeedHeroPoint', checkLevelData.nextLevelPoint);
        break;
      }
    }
  },
};

const actions = {
  /** 初始化裝飾物列表
   * @param context
   */
  async initAdornmentData(context: ActionContext<AdornmentState, Getters>): Promise<void> {
    // 篩選背包道具為裝飾物
    const userBackPack: BackpackItem[] = await context.dispatch('getItemList', ItemType.AdornmentItem);
    // 取得裝飾物列表
    const adornmentList: AdornmentItemData[] = TableManager.adornmentItem.getAll();
    // 初始化裝飾物列表持有數量
    const adornmentItemList = adornmentList.map<AdornmentListData>((adornmentItem) => {
      const backPackData = userBackPack.find((backPackItem) => backPackItem.itemId === adornmentItem.id);
      const adornmentStoreItem = Object.assign({}, adornmentItem) as AdornmentListData;
      adornmentStoreItem.backpackNum = backPackData?.useNum ?? 0;
      adornmentStoreItem.itemUid = backPackData?.itemUid ?? -1;
      return adornmentStoreItem;
    });
    context.commit('setAdornmentList', adornmentItemList);
  },

  /** 取得已解鎖房間裝飾物列表
   *  @param context
   *  @param userUid 使用者UID
   */
  async getAllPersonalBasePageList(
    context: ActionContext<AdornmentState, Getters>,
    userUid: number
  ): Promise<PersonalBase[]> {
    // 取得一個新的使用者應清空所有房間列表
    context.commit('clearPersonalBaseList');
    // 取得一個新的使用者應清空所有裝飾物列表
    context.commit('clearAdornmentPositionList');

    // 組成封包
    const data = {
      uid: userUid,
    };

    try {
      // API取得已解鎖所有房間裝飾物列表
      const response: any = await farmMapUnitAllAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }
      // 暫存使用者UID
      context.commit('setAdornmentUserUid', userUid);

      // 整理回傳資料
      const pageList: MapData[] = response.mapDatas as MapData[];

      // 加總計算佈置分數
      let totalScore = 0;
      // 設定頁面列表
      for (const mapDetail of pageList) {
        context.commit('setPersonalBase', mapDetail.mapData);

        totalScore += mapDetail.mapData.adornmentScore;
        // 設定裝飾物位置列表
        if (mapDetail.units.length === 0) {
          // 長度為0則創建一個空陣列
          context.commit('createAdornmentPositionList', mapDetail.mapData.farmMapId);
        } else {
          // 不為0則更新陣列
          context.commit('setAdornmentPositionList', mapDetail.units);
        }
      }
      context.commit('setAdornmentTotalScore', totalScore);

      return context.state.personalBaseList;
    } catch (e) {
      Message.error(`${e}`);
      return [];
    }
  },

  /** 解鎖房間佈置頁面
   *  @param context
   *  @param pageId 要解鎖頁面的編號
   */
  async onUnlockPersonalBasePage(context: ActionContext<AdornmentState, Getters>, pageId: number): Promise<void> {
    // 組成封包
    const data = {
      farmMapId: pageId,
    };

    // API請求解鎖
    const response: any = await farmMapDataAPI.post(data);
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤
      handleAPIError(response.result, response.resMessage);
    }

    // 更新暫存內房間資料
    context.commit('unlockPersonalBasePage', response as PersonalBase);

    // 防呆
    const gameData = context.state.gameData;
    if (gameData == null) {
      console.error('onUnlockPersonalBasePage gameData is null');
      return;
    }

    // 更新房間解鎖資訊
    const roomStatus: RoomStatus = {
      roomList: context.state.personalBaseList,
      levelData: gameData.adornmentLevelData,
    };
    context.commit('setUnlockRoomStatus', roomStatus);
  },

  /** 放置裝飾物
   *  @param context
   *  @param itemPositionData 要放置的裝飾物位置資料
   */
  async placeAdornmentPosition(
    context: ActionContext<AdornmentState, Getters>,
    itemPositionData: AdornmentPosition
  ): Promise<AdornmentPosition | undefined> {
    // 檢查是否有itemId
    const adornmentItem: BackpackItem = await context.dispatch('getItem', itemPositionData.itemId);
    if (adornmentItem == null) {
      console.error(`${itemPositionData.itemId}未找到裝飾物`);
      return;
    }

    if (adornmentItem.itemType !== ItemType.AdornmentItem) {
      console.error(`${itemPositionData.itemId}該道具非裝飾物`);
      return;
    }

    // 組成封包
    const data = {
      itemUid: adornmentItem.itemUid,
      farmMapId: itemPositionData.farmMapId,
      farmMapIndex: itemPositionData.mapIndex,
      directionType: itemPositionData.directionType,
    };

    // API 放置裝飾物
    const response: any = await farmMapUnitAPI.post(data);
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤
      handleAPIError(response.result, response.resMessage);
    }

    // 裝飾物總積分
    const totalScore = Number(response.adornmentTotalScore);
    context.commit('setAdornmentTotalScore', totalScore);

    const itemOld = response.itemOld as BackpackItem;
    if (itemOld != null) {
      // 該位置上的裝飾物先移除
      context.commit('deleteAdornmentPositionByMapIndex', response as AdornmentPosition);
      // 舊的裝飾物收回背包
      context.commit('addBackpackItem', itemOld);
    }

    const itemNew = response.itemNew as BackpackItem;
    // 新放上去的裝飾物減少數量
    context.commit('reduceBackpackItem', itemNew);

    const adornmentPosition = response as AdornmentPosition;
    // 回傳新的位置加進列表中
    context.commit('addAdornmentPosition', adornmentPosition);
    return adornmentPosition;
  },

  /** 移除裝飾物
   *  @param context
   *  @param itemPositionData 要移除的裝飾物位置資料
   */
  async removeAdornmentPosition(
    context: ActionContext<AdornmentState, Getters>,
    itemPositionData: AdornmentPosition
  ): Promise<void> {
    // 組成封包
    const data = {
      farmMapUnitUid: itemPositionData.farmMapUnitUid,
    };

    try {
      // API 移除裝飾物
      const response: any = await farmMapUnitAPI.remove(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 裝飾物總積分
      const totalScore = Number(response.adornmentTotalScore);
      context.commit('setAdornmentTotalScore', totalScore);

      // 從位置上移除掉
      context.commit('deleteAdornmentPosition', itemPositionData);
      // 背包中增加物品
      const item: BackpackItem = {
        itemUid: response.itemUid,
        itemId: response.itemId,
        itemType: ItemType.AdornmentItem,
        useNum: response.useNum,
      };
      context.commit('addBackpackItem', item);
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 修改裝飾物位置(同一張page上)
   *  @param context
   *  @param itemPositionData 要修改的裝飾物位置資料
   */
  async changeAdornmentPosition(
    context: ActionContext<AdornmentState, Getters>,
    itemPositionData: AdornmentPosition
  ): Promise<void> {
    // 先抓出該房間裝飾物列表
    const itemPositionList = context.state.adornmentPositionList.get(itemPositionData.farmMapId);
    if (itemPositionList == null) {
      console.error(`${itemPositionData.farmMapId}找不到該房間裝飾物列表`);
      return;
    }
    // 找出原本的裝飾物位置
    const oldItemPosition = itemPositionList.find((item) => item.farmMapUnitUid === itemPositionData.farmMapUnitUid);
    // 如果沒有移動裝飾物則警告返回
    if (
      oldItemPosition != null &&
      oldItemPosition.mapIndex === itemPositionData.mapIndex &&
      oldItemPosition.directionType === itemPositionData.directionType
    ) {
      console.warn(`${itemPositionData.farmMapUnitUid}位置沒有變動`);
      return;
    }

    // 組成封包
    const data = {
      farmMapUnitUid: itemPositionData.farmMapUnitUid,
      targetFarmMapIndex: itemPositionData.mapIndex,
      directionType: itemPositionData.directionType,
    };

    try {
      // API 修改裝飾物位置
      const response: any = await farmMapUnitAPI.put(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 移過去的位置上有裝飾物
      const itemOld = response.itemOld as BackpackItem;
      if (itemOld != null) {
        // 該位置上的裝飾物先移除
        context.commit('deleteAdornmentPositionByMapIndex', response as AdornmentPosition);
        // 舊的裝飾物收回背包
        context.commit('addBackpackItem', itemOld);
      }

      // 舊的位置上移除掉
      context.commit('deleteAdornmentPosition', itemPositionData);
      // 回傳新的位置加進列表中
      context.commit('addAdornmentPosition', response as AdornmentPosition);
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 購買裝飾物道具
   *  @param context
   *  @param item 要購買的道具
   */
  async buyAdornmentStoreItem(context: ActionContext<AdornmentState, Getters>, item: BackpackItem): Promise<void> {
    // 組成封包
    const data = {
      itemId: item.itemId,
      useNum: item.useNum,
    };

    // API 購買裝飾物道具
    const response: any = await heroj7StoreAPI.fetch(data);
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤
      handleAPIError(response.result, response.resMessage);
      return;
    }
    // 整理回傳資料
    const returnItem: BackpackItem = {
      itemUid: response.item.itemUid,
      itemId: response.item.itemId,
      itemType: ItemType.AdornmentItem,
      useNum: response.item.useNum,
    };
    // 增加背包內物品
    context.commit('addBackpackItem', returnItem);
    // 修改 adornmentList
    context.commit('onUpdateAdornmentList', returnItem);
    // 更新使用者 coin
    context.commit('updateUserCoin', {
      crystalCoin: response.crystalCoin,
      goldCoin: response.goldCoin,
    });
  },

  /** 販賣裝飾物道具
   *  @param context
   *  @param item 要販賣的道具
   */
  async sellAdornmentStoreItem(context: ActionContext<AdornmentState, Getters>, item: BackpackItem): Promise<void> {
    // 組成封包
    const data = {
      itemUid: item.itemUid,
      useNum: item.useNum,
    };

    // API 販賣裝飾物道具
    const response: any = await heroj7StoreAPI.post(data);
    if (response.result !== ResponseState.Success) {
      // 顯示錯誤
      handleAPIError(response.result, response.resMessage);
    }
    // 整理回傳資料
    const returnItem: BackpackItem = {
      itemUid: response.item.itemUid,
      itemId: response.item.itemId,
      itemType: ItemType.AdornmentItem,
      useNum: response.item.useNum,
    };

    // 減少背包內物品
    context.commit('reduceBackpackItem', returnItem);
    // 修改 adornmentList
    context.commit('onUpdateAdornmentList', returnItem);
    // 更新使用者 coin
    context.commit('updateUserCoin', {
      crystalCoin: response.crystalCoin,
      goldCoin: response.goldCoin,
    });
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
