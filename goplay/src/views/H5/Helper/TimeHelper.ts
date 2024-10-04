export default class TimeHelper {
  /** 每秒的毫秒數。 */
  public static millisecondPerSecond: number = 1000;

  /**
   * 將時間戳記轉換為人類可讀的時間格式
   * @param dateString 時間戳記
   * @returns 人類可讀的時間格式
   */
  public static transformDateStringToHumanReadable(dateString: string): string {
    // 將日期字符串轉換為 Date 對象
    const date = new Date(dateString);
    return TimeHelper.formatToAsiaTaipeiLocaleString(date, false);
  }

  /**
   * 取得檔案名稱的時間戳記
   * @returns 檔案名稱的時間戳記
   */
  public static getFileNameTimestamp(): string {
    // 將日期字符串轉換為 Date 對象
    const today = new Date();
    const formattedDate = TimeHelper.formatToAsiaTaipeiLocaleString(today, true);
    // 替換日期字符串中的分隔符
    return formattedDate.replace(/\//g, '-').replace(/:/g, '-').replace(/ /g, '-');
  }

  /**
   * 使用 toLocaleString 格式化日期，指定時區為 Asia/Taipei (UTC+8)
   * @param date 日期
   * @param isIncludingSecond 是否包含秒
   * @returns 格式化後的日期字符串
   */
  public static formatToAsiaTaipeiLocaleString(date: Date, isIncludingSecond: boolean): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: isIncludingSecond ? '2-digit' : undefined,
      hour12: false,
    };

    // 轉換和格式化日期
    return date.toLocaleString('zh-TW', options);
  }

  /**
   * 取得今天的日期ID
   * @example 20240501
   * @returns 今天的日期ID (格式: YYYYMMDD)
   */
  public static getTodayDayId(): number {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 月份是從 0 開始的，所以要加 1
    const day = today.getDate();
    return year * 10000 + month * 100 + day;
  }
}
