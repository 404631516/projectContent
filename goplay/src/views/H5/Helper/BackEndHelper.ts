import { PartyEventData } from '@/helper/interface/BackEndManagement';

export default class BackEndHelper {
  /** 清除活動設定
   * @param partyEventData
   */
  public static clearPartyEventData(partyEventData: PartyEventData): void {
    Object.assign(partyEventData, this.toPartyEventData(null));
  }

  /** 轉換成客戶端格式
   * @param apiPartyEventData
   */
  public static toPartyEventData(apiPartyEventData: PartyEventData | null): PartyEventData {
    // 未設定, 回傳預設格式
    if (apiPartyEventData == null) {
      return {
        argValue: '',
        startAt: '',
        endAt: '',
        isClear: true,
      };
    }
    // 轉換成客戶端格式
    else {
      return {
        ...apiPartyEventData,
        isClear: false,
      };
    }
  }

  /** 選擇設定開啟時間&結束時間
   * @param pickedDate
   * @param partyEventData
   */
  public static onPickDate(pickedDate: string[], partyEventData: PartyEventData): void {
    if (pickedDate == null) {
      partyEventData.startAt = '';
      partyEventData.endAt = '';
      return;
    }
    partyEventData.startAt = pickedDate[0].toString();
    partyEventData.endAt = pickedDate[1].toString();
  }
}
