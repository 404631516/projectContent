import { base64UploadAPI } from '@/api/backend';
import config from '@/config/setting';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { AsyncHelper } from './AsyncHelper';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

export default class FileHelper {
  /** 是否為空物件
   * @param object
   */
  public static isEmptyObject(object: any): boolean {
    if (object == null) {
      return true;
    }

    return Object.keys(object).length === 0;
  }

  /**分隔陣列
   * @param {T[]} 要拆分的陣列
   * @param {number} 幾個一份
   */
  public static sliceChunkArray<T>(array: T[], size: number = 1): T[][] {
    size = Math.max(Math.floor(size), 0);
    const length = array == null ? 0 : array.length;
    if (!length || size < 1) {
      return [];
    }
    let index = 0;
    let resIndex = 0;
    const result = new Array(Math.ceil(length / size));

    while (index < length) {
      result[resIndex++] = array.slice(index, (index += size));
    }
    return result;
  }

  /** 檔案轉換成Base64
   * @param file
   */
  public static async toBase64(file: File): Promise<string> {
    // 建立檔案閱讀器
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // 等待檔案讀完
    await AsyncHelper.pendingUntil(() => reader.readyState === FileReader.DONE);

    // 去掉前綴, 只留base64的部分
    return String(reader.result).split(',')[1];
  }

  /** 上傳Base64檔案
   * @param file
   */
  public static async uploadBase64(file: File): Promise<string> {
    // 組成封包資料
    const data = {
      tag: 'AdminSetting',
      fileName: file.name,
      fileType: file.type,
      base64String: await FileHelper.toBase64(file),
    };

    try {
      // API 上傳Base64檔案
      const response: any = await base64UploadAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 返回檔案url
      return `${config.cloudStorage}${response.url}`;
    } catch (e) {
      console.error(`${e}`);
      return '';
    }
  }

  /**
   * 將JSON資料匯出成Excel
   * @param excelName Excel檔案名稱
   * @param data JSON資料
   */
  public static exportJsonDataToExcel(excelName: string, data: Array<Record<string, any>>): void {
    // 將資料轉換為工作表
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 建立新的工作簿
    const workbook = XLSX.utils.book_new();

    // 將工作表添加到工作簿中
    XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet');

    // 將工作簿轉換為二進位字串
    const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    // 將二進位字串轉換為 ArrayBuffer
    const buffer = new ArrayBuffer(workbookBinary.length);
    const view = new Uint8Array(buffer);

    for (let i = 0; i !== workbookBinary.length; ++i) {
      view[i] = workbookBinary.charCodeAt(i) & 0xff;
    }

    // 建立 Blob 並觸發下載
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, excelName);
  }
}
