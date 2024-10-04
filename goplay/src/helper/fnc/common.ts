import { Message } from '@/helper/class/Common';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import {
  HttpReadyState,
  HttpStatus,
  ResponseState,
  GATagActionStrType,
  GATagCategoryStrType,
  GATagCategoryIdType,
  GATagActionIdType,
  SubjectBackgroundColor,
  SubjectType,
} from '../enum/Common';
import { eventTriggerUseAPI } from '@/api/login';
import TableManager, { PriceData } from '@/manager/TableManager';
import { ShopItemData, ShopCartItem } from '../interface/AnswerGame';
import { randomNumber } from '@/views/H5/Helper/MathHelper';
import { TotalProps } from '../interface/Game';
import { VueGtag } from 'vue-gtag';
import { AdornmentListData } from '../interface/Adornment';
import { ErrorId } from '@/hero-api/dto/error-id';
import { SelectOption } from '../interface/Common';
import { SchoolClass } from '../interface/TeacherAdmin';
import { heroj7GetClassList } from '@/api/TeacherAdmin';
import UIHelper from '@/views/H5/Helper/UIHelper';

/** 偵測寬度
 * @param width 螢幕寬度
 */
export function handleScreen(width: number): boolean {
  let val = false;
  let fullWidth = window.innerWidth;
  window.onresize = () => {
    fullWidth = window.innerWidth;
  };
  if (fullWidth <= width) {
    val = true;
  } else {
    val = false;
  }
  return val;
}

/** 判斷設備系統 */
export function detectMob(): boolean {
  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

/** 檢查URL是否有效
 * @param url
 */
export async function isGetUrlValid(url: string): Promise<boolean> {
  // 發送請求
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.send();

  // 等待回覆
  await AsyncHelper.pendingUntil(() => request.readyState === HttpReadyState.Done);

  // 返回取得狀態
  return request.status === HttpStatus.OK;
}

/** 顯示API錯誤訊息
 * @param result
 */
export function handleAPIError(result: string, message: string): void {
  // 分辨API錯誤
  switch (result) {
    // 請求逾時
    case ResponseState.AdlEduTimeout:
      throw new Error(`因材網請求逾時(${message})`);
    // 請求失敗
    case ResponseState.AdlEduStatusFail:
      throw new Error(`因材網請求失敗(${message})`);
    // 請求回應錯誤
    case ResponseState.AdlEduRequestFail:
      throw new Error(`因材網請求回應錯誤(${message})`);

    // 未開放openId登入
    case ResponseState.AdlNotOpen:
      throw new Error(`未開放OpenId(${message})`);

    // 初始化任務失敗
    case ResponseState.QuestInitFaild:
      throw new Error(`初始化任務失敗(${message})`);
    // 重置任務失敗
    case ResponseState.QuestResetFaild:
      throw new Error(`重置任務失敗(${message})`);
    // 此任務沒有在靜態表中
    case ResponseState.QuestNoJsonDataError:
      throw new Error(`此任務沒有在靜態表中(${message})`);
    // 靜態表中不可接取任務
    case ResponseState.QuestNotInTimeRangeError:
      throw new Error(`靜態表中不可接取任務(${message})`);
    // 此任務已存在
    case ResponseState.QuestQuestAlreadyExist:
      throw new Error(`此任務已存在(${message})`);
    // 此任務已完成
    case ResponseState.QuestHaveQuestEnd:
      throw new Error(`此任務已完成(${message})`);
    // 前置任務未完成
    case ResponseState.QuestHaveQuestEnd:
      throw new Error(`前置任務未完成(${message})`);
    // 任務額外條件不符
    case ResponseState.QuestNotReachedQuestTakesCondition:
      throw new Error(`任務額外條件不符(${message})`);

    // 任務資料錯誤
    case ResponseState.QuestDBError:
      throw new Error(`任務資料錯誤(${message})`);
    // 任務不存在
    case ResponseState.QuestDataNullError:
      throw new Error(`任務不存在(${message})`);
    // 驗證任務未達領獎資格
    case ResponseState.QuestAbleReapError:
      throw new Error(`驗證任務未達領獎資格(${message})`);

    // 任務不是失敗狀態
    case ResponseState.QuestFlagStatusError:
      throw new Error(`任務不是失敗狀態(${message})`);

    // 帳號異常
    case ResponseState.SystemCode999:
      throw new Error(`帳號系統發生錯誤，代碼999，請恰客服人員`);

    // 房間密碼錯誤
    case ResponseState.ContestRoomPasswordIncorrect:
      throw new Error(`您輸入的賽局號碼或密碼有誤，請向您的老師確認`);
    // 房間人數已滿
    case ResponseState.ContestRoomUserAlreadyMax:
      throw new Error(`人數已達上限， 請向您的老師確認`);
    // 本賽事現在沒有開放房間
    case ResponseState.ContestRoomAreAllInvalid:
      throw new Error(`本賽事目前沒有可加入的賽局`);
    // 您被該房間禁止進入
    case ResponseState.ContestRoomUserHasBeenBanned:
      throw new Error(`您被該賽局禁止進入`);
    // 房間查找資料不存在的錯誤代號
    case ResponseState.ContestRoomNotFound:
      throw new Error(`您輸入的賽局號碼有誤，請向您的老師確認`);
    // 房間已過期
    case ResponseState.ContestRoomIsInvalid:
      throw new Error(`賽局已過期`);
    // 參賽房間已結束
    case ResponseState.ContestRoomIsFinished:
      throw new Error(`參賽賽局已結束`);
    // 參加者加入拒絕編輯
    case ResponseState.ContestGamingRoomEditDenied:
      throw new Error(`編輯失敗，已有使用者加入此賽局`);
    // 賽事模板過期拒絕修改或再開一局
    case ResponseState.ContestIsExpired:
      throw new Error(`該模板已過期!請選擇其它模板創立新賽局!`);

    // 不是自己的信件
    case ResponseState.NotSelfMail:
      throw new Error(`不是自己的信件`);
    // 無此信件資料
    case ResponseState.MailDataNotFound:
      throw new Error(`無此信件資料`);
    // 此信件無道具領取
    case ResponseState.MailNoItemCount:
      throw new Error(`此信件無道具領取`);
    // 此信件道具已領取
    case ResponseState.MailAlreadyGet:
      throw new Error(`此信件道具已領取`);
    // 未讀取或未領取的信件不可刪除
    case ResponseState.DeleteMailFail:
      throw new Error(`未讀取或未領取的信件不可刪除`);

    // 已經完成作答
    case ResponseState.FormsAlreadyParticipated:
      throw new Error(`已經完成作答`);
    // 問卷尚未開放作答
    case ResponseState.FormsIsNotInPublishedTime:
      throw new Error(`問卷尚未開放作答`);
    // 作答題目不完整
    case ResponseState.FormsAnswersIncomplete:
      throw new Error(`作答題目不完整`);

    // 未知錯誤
    default:
      console.error(`handleAPIError: result=${result}, message=${message}`);
      throw new Error(`${result} API錯誤: ${message}`);
  }
}

/**
 * 處理v2 API錯誤
 * @param result - 結果字串。
 * @param message - 錯誤訊息。
 */
export function handleV2APIError(result: string, message: string): void {
  switch (result) {
    case ErrorId.Unauthorized:
      Message.error(`未授權(${message})`);
    case ErrorId.DataNotFound:
      Message.error(`找不到資料(${message})`);
    case ErrorId.StillCoolingDown:
      Message.error(`冷卻中(${message})`);
    case ErrorId.DataAlreadyExist:
      Message.error(`資料已存在(${message})`);
    case ErrorId.UserNotFound:
      Message.error(`找不到使用者(${message})`);
    case ErrorId.AccountAlreadyExists:
      Message.error(`帳號已存在(${message})`);
    case ErrorId.InvalidCredentials:
      Message.error(`無效憑證(${message})`);
    case ErrorId.MultipleLogin:
      Message.error(`多重登入(${message})`);
    case ErrorId.InvalidToken:
      Message.error(`無效令牌(${message})`);
    case ErrorId.NetworkError:
      Message.error(`網路錯誤(${message})`);
    case ErrorId.InternalServerError:
      Message.error(`內部伺服器錯誤(${message})`);
    case ErrorId.NotEnoughResource:
      Message.error(`資源不足(${message})`);
    case ErrorId.InvalidArgument:
      Message.error(`無效參數(${message})`);
    case ErrorId.DatabaseError:
      Message.error(`資料庫錯誤(${message})`);
    case ErrorId.NotSupported:
      Message.error(`不支援(${message})`);

    // 未知錯誤
    default:
      Message.error(`${result}(${message})`);
  }
}

/** 轉換成購物車格式
 * @param itemData
 * @param amount
 */
export function toShopCartItem(itemData: ShopItemData, amount: number): ShopCartItem {
  const newCartItem: ShopCartItem = {
    itemId: itemData.gameItemData.itemId,
    itemNameKey: itemData.gameItemData.itemNameKey,
    itemValue: amount,
    itemCost: itemData.itemCost,
    itemImageUrl: itemData.gameItemData.itemImageUrl,
  };
  return newCartItem;
}

/** 轉換成道具清單格式
 * @param itemData
 */
export function toTotalProp(itemId: number, amount: number): TotalProps {
  const totalProps: TotalProps = {
    id: itemId,
    count: amount,
  };
  return totalProps;
}

/** 隨機增加道具進入購物車
 * @param itemList
 * @param shoppingCart
 * @param amount
 */
export function addRandomItem(itemList: ShopItemData[], shoppingCart: ShopCartItem[]): ShopCartItem {
  // 獲得道具: 隨機選取一個道具給予
  const itemIndex = randomNumber(itemList.length);
  const itemData = itemList[itemIndex];
  const gameItemData = itemData.gameItemData;

  // 答題獲得道具加入購物車
  const cartItem = shoppingCart.find((item) => item.itemId === gameItemData.itemId);

  // 購物車已經有此道具, 增加數量
  if (cartItem) {
    cartItem.itemValue += 1;
    return cartItem;
  }

  // 新增進入購物車
  const newCartItem = toShopCartItem(itemData, 1);
  shoppingCart.push(newCartItem);
  return newCartItem;
}

/** 計算裝飾交易價錢
 * @param {AdornmentListData} 裝飾品資料
 * @param {boolean} 是否是購買狀態
 * @param {number} 數量
 */
export function getAdornmentPrice(data: AdornmentListData, isBuy: boolean, count: number): number {
  const isCanCrystalTrade: boolean = data.crystalCost > 0;
  const sellPriceRatio: number = 2;
  // 購買
  if (isBuy) {
    return (isCanCrystalTrade ? data.crystalCost : data.goldCost) * count;
  }
  // 販售
  else {
    return Math.floor(isCanCrystalTrade ? data.crystalCost / sellPriceRatio : data.goldCost / sellPriceRatio) * count;
  }
}

/** 是否能交易
 *  @param item
 */
export function isBuyable(item: PriceData): boolean {
  return item.goldCost > 0 || item.crystalCost > 0;
}

/** 判斷裝飾物是否顯示尺寸 */
export function showAdornmentSize(adornmentData: AdornmentListData): boolean {
  return adornmentData.itemHeight > 0 && adornmentData.itemWidth > 0;
}

/** 傳入科目ID轉換成科目名稱
 * @param subjectId - 科目ID
 */
export function toSubjectName(subjectId: SubjectType): string {
  const subject = TableManager.subject.findOne(subjectId);
  if (subject == null) {
    console.error(`未知科目id=${subjectId}`);
  }
  return subject?.subject_groupings_name ?? '錯誤科目';
}

/** 傳入科目ID取得科目顏色
 * @param subjectId - 科目ID
 */
export function toSubjectColor(subjectId: number): string {
  const colorKey = SubjectType[subjectId];
  return Object.entries(SubjectBackgroundColor).find(([key, val]) => key === colorKey)?.[1] ?? '錯誤科目';
}

/** 觸發GA事件Api(統一)
 * @param categoryId 類別編號
 * @param actionId 動作編號
 * @param labelTxt 標籤編號
 * @param gtag GA物件
 * @param GAType GA文字類型
 * @param GACategory GA文字類型
 */
export async function sendGAEvent(
  categoryId: GATagCategoryIdType,
  actionId: GATagActionIdType,
  labelTxt: string,
  gtag: VueGtag,
  actionStr: GATagActionStrType,
  categoryStr: GATagCategoryStrType,
): Promise<void> {
  try {
    // 防呆
    if (gtag == null) {
      throw Error('gtag = null');
    }

    // GA事件紀錄
    gtag.event(actionStr, {
      event_category: categoryStr,
      event_label: labelTxt,
    });

    // 伺服器事件紀錄
    const data = {
      categoryId,
      actionId,
      labelTxt,
    };
    // API 紀錄事件
    const response: any = await eventTriggerUseAPI.fetch(data);
    if (response.result !== ResponseState.Success) {
      Message.error(response.result);
    }
  } catch (e) {
    Message.error(`${e}`);
  }
}

/** 設備判斷
 * @param useDevice 偵測判斷
 */
export function handleDeviceStr(useDevice: any): string {
  let deviceStr = '';
  // 微軟
  if (useDevice.includes('Windows')) {
    deviceStr = 'Microsoft_PC';
    if (useDevice.includes('Touch')) {
      deviceStr = 'Microsoft_Table';
      if (useDevice.includes('Mobile')) {
        deviceStr = 'Microsoft_Phone';
      }
    }
  } else if (useDevice.includes('Android')) {
    // 安卓
    deviceStr = 'Android_Table';
    if (useDevice.includes('Mobile')) {
      deviceStr = 'Android_Phone';
    }
  } else if (useDevice.includes('Mac')) {
    deviceStr = 'Apple_PC';
    // 蘋果
    if (useDevice.includes('iPad')) {
      deviceStr = 'Apple_Table';
    }
    if (useDevice.includes('iPhone')) {
      deviceStr = 'Apple_Phone';
    }
  } else {
    deviceStr = '無法辨別';
  }
  return deviceStr;
}

/** 取得全縣市選項 */
export function getCountyOptions(): SelectOption[] {
  // 取得全區域縣市資料
  const allCounty = TableManager.county.getAll();

  // 轉換成選項格式
  return [
    { value: -1, label: '全部縣市' },
    ...allCounty.map((county) => ({ value: county.id, label: county.countyName })),
  ];
}

/** 取得全年級選項 */
export function getGradeOptions(): SelectOption[] {
  // 全年級資料
  const allGrade = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

  // 轉換成選項格式
  return [{ value: -1, label: '全部年級' }, ...allGrade.map((grade, index) => ({ value: index + 1, label: grade }))];
}

/** 取得全科目類型選項 */
export function getSubjectTypeOptions(): SelectOption[] {
  // 取得全科目類型
  const allSubjectType = TableManager.subject.getAll();

  // 轉換成選項格式
  return [
    { value: -1, label: '全部科目' },
    ...allSubjectType.map((subject) => ({ value: subject.id, label: subject.subject_groupings_name })),
  ];
}

/** 取得年度班級
 * @param schoolId - 學校ID
 */
export async function getSchoolClassList(schoolId: number): Promise<SchoolClass[]> {
  // 取得年度班級
  const response: any = await heroj7GetClassList.fetch({ schoolId });
  return UIHelper.toSchoolClassList(response.classList);
}
