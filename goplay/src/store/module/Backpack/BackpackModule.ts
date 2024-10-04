import { ActionContext, ReturnGetters } from '@/types/store';
import { getVSPBackpackAPI } from '@/api/adornment';
import { Message } from '@/helper/class/Common';
import { ItemType } from '@/helper/enum/AnswerGame';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { BackpackItem } from '@/helper/interface/Common';

interface BackpackState {
  /** 道具清單 */
  itemList: BackpackItem[];
}

const moduleState: BackpackState = {
  itemList: [],
};

const moduleGetters = {};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 設定背包道具清單
   *  @param state
   *  @param itemList 背包道具清單
   */
  setBackpackItemList(state: BackpackState, updateItemList: BackpackItem[]) {
    state.itemList = updateItemList;
  },

  /** 背包新增裝飾物數量
   *  @param state
   *  @param item 裝飾物
   */
  addBackpackItem(state: BackpackState, updateItem: BackpackItem) {
    // 先找該物品在背包內是否存在
    const index = state.itemList.findIndex((item) => item.itemUid === updateItem.itemUid);
    if (index === -1) {
      // 不存在則新增一筆
      state.itemList.push(updateItem);
    } else {
      // 存在則數量增加
      state.itemList[index].useNum = updateItem.useNum;
    }
  },

  /** 背包減少裝飾物數量
   *  @param state
   *  @param item 裝飾物
   */
  reduceBackpackItem(state: BackpackState, updateItem: BackpackItem) {
    // 先找該物品在背包內是否存在
    const index = state.itemList.findIndex((item) => item.itemUid === updateItem.itemUid);
    if (index === -1) {
      // 不存在報錯
      console.error(`${updateItem.itemUid}不存在於背包中`);
    } else {
      // 存在則扣除數量，數量<=0則從背包內移除
      state.itemList[index].useNum = updateItem.useNum;
      if (state.itemList[index].useNum <= 0) {
        state.itemList.splice(index, 1);
      }
    }
  },
};

const actions = {
  /** 取得使用者一般背包道具
   *  @param context
   */
  async getHeroj7BackPack(context: ActionContext<BackpackState, Getters>): Promise<void> {
    try {
      // API 取得道具背包資料
      const response: any = await getVSPBackpackAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 暫存資料
      context.commit('setBackpackItemList', response.resList as BackpackItem[]);
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 抓某些類型道具清單
   * @param context
   * @param itemType 道具型態
   * @returns
   */
  async getItemList(context: ActionContext<BackpackState, Getters>, itemType: ItemType): Promise<BackpackItem[]> {
    return context.state.itemList.filter((item) => item.itemType === itemType);
  },

  /** 判斷該道具是否為裝飾物
   * @param context
   * @param itemId 裝飾物道具ID
   * @returns BackpackItem
   */
  async getItem(context: ActionContext<BackpackState, Getters>, itemId: number): Promise<BackpackItem | undefined> {
    return context.state.itemList.find((backpackItem) => backpackItem.itemId === itemId);
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
