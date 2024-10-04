import dayjs, { Dayjs } from 'dayjs';

/** 時差 */
let timeDiff: number = 0;

/** 同步時間
 * @param serverTime
 */
export function syncTime(serverTime: number): void {
  const serverTimeinSeconds = (serverTime - (serverTime % 1000)) / 1000;
  timeDiff = serverTimeinSeconds - dayjs().unix();
}

/** 取得同步時間 */
export function syncDayjs(): Dayjs {
  return dayjs.unix(dayjs().unix() + timeDiff);
}

/** 時間未到
 * @param dateTime
 */
export function isNotYet(dateTime: string): boolean {
  if (dateTime == null) {
    return false;
  }
  return syncDayjs().isBefore(toDayjs(dateTime));
}

/** 時間已過
 * @param dateTime
 */
export function isPassed(dateTime: string): boolean {
  if (dateTime == null) {
    return false;
  }
  return syncDayjs().isAfter(toDayjs(dateTime));
}

/** 轉換成Dayjs格式
 * (iOS不能處理時間中間的"-", 轉換成"/")
 * @param time
 */
export function toDayjs(time: string): Dayjs {
  const date = dayjs(time);
  return date.isValid() ? date : dayjs(time.replace(/-/g, '/'));
}
