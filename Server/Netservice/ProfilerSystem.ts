import fs from 'fs';
import moment from 'moment';
import osu from 'node-os-utils';
import os from 'os';

/** 系統效能快照 */
interface Snapshot {
  time: number;
  cpuLast: number;
  memory: number;
  sendCount: number;
  sendSize: number;
  recevieCount: number;
  recevieSize: number;
  connection: number;
  fps: number;
  roomCount: number;
}

export default class ProfilerSystem {
  /** 系統效能快照Array */
  private static allSnapshot: Snapshot[] = [];

  /** 壓測數據統計, 封包送出size(字元數) */
  private static totalSendSize: number = 0;
  /** 壓測數據統計, 封包送出數 */
  private static totalSendCount: number = 0;
  /** 壓測數據統計, 封包接收size(字元數) */
  private static totalReceiveSize: number = 0;
  /** 壓測數據統計, 封包接收數 */
  private static totalReceiveCount: number = 0;
  /** 壓測數據統計, 當前連線數 */
  private static connectionCount: number = 0;
  /** 壓測數據統計, 當前房間數 */
  private static roomCount: number = 0;

  /** (last)cpu使用率, 只能取last, 無法取當前frame的 */
  private static lastCpuPercentage: number = 0;

  /** (last)壓測數據統計, 封包送出size */
  private static lastTotalSendSize: number = 0;
  /** (last)壓測數據統計, 封包送出數 */
  private static lastTotalSendCount: number = 0;
  /** (last)壓測數據統計, 封包接收size */
  private static lastTotalReceiveSize: number = 0;
  /** (last)壓測數據統計, 封包接收數 */
  private static lastTotalReceiveCount: number = 0;

  /** 是否啟動ProfilerSystem */
  public static isEnable: boolean = false;

  /** 上次snapshot到現在經過的frame數 */
  private static frameCount: number = 0;

  /** 程式開始時間點 */
  private static startAt: number;
  /** 下次要記錄系統效能快照的時間點 */
  private static nextSec: number = 1;

  /** 檔案筆數上限, 一份檔案最多輸出x秒的資料 */
  private static outputPeriodInSec: number;

  constructor(outputPeriodInSec: number) {
    ProfilerSystem.isEnable = true;
    ProfilerSystem.startAt = Date.now();
    ProfilerSystem.outputPeriodInSec = outputPeriodInSec;

    // 先算好lastCpuPercentage
    osu.cpu.usage().then((cpuPercentage) => {
      ProfilerSystem.lastCpuPercentage = cpuPercentage;
    });

    process.on('SIGINT', () => {
      console.log('Caught interrupt signal');
      ProfilerSystem.outputFile();
      process.exit();
    });
  }

  public static update() {
    this.frameCount++;
    // 程式開始到現在的總秒數
    const currentSec = (Date.now() - this.startAt) / 1000;
    // 未到需要紀錄snapshot的時間, return
    if (currentSec < this.nextSec) {
      return;
    }
    // 紀錄系統效能快照
    this.setSnapshot(this.frameCount);
    // frameCount歸零
    this.frameCount = 0;
    // 下次snapshot的時間
    this.nextSec++;
    // 還沒超出檔案筆數設定上限, return
    if (this.allSnapshot.length < this.outputPeriodInSec) {
      return;
    }
    // 超出檔案筆數設定上限, 輸出csv檔
    this.outputFile();
  }

  /** 取得系統效能快照並存進allSnapshot */
  private static setSnapshot(frameCount: number): void {
    // 記憶體使用量
    const memoryUsagePercentage = (1 - os.freemem() / os.totalmem()) * 100;
    // 取得當前各壓力數值
    const snapshot: Snapshot = {
      sendCount: this.totalSendCount - this.lastTotalSendCount,
      sendSize: this.totalSendSize - this.lastTotalSendSize,
      recevieCount: this.totalReceiveCount - this.lastTotalReceiveCount,
      recevieSize: this.totalReceiveSize - this.lastTotalReceiveSize,
      time: (Date.now() - this.startAt) / 1000,
      cpuLast: this.lastCpuPercentage,
      memory: memoryUsagePercentage,
      connection: this.connectionCount,
      fps: frameCount,
      roomCount: this.roomCount,
    };

    // 紀錄壓力數值
    this.allSnapshot.push(snapshot);

    // 重算cpuPercentage
    osu.cpu.usage().then((cpuPercentage) => {
      ProfilerSystem.lastCpuPercentage = cpuPercentage;
    });
    // 紀錄各數據last
    this.lastTotalSendCount = this.totalSendCount;
    this.lastTotalSendSize = this.totalSendSize;
    this.lastTotalReceiveCount = this.totalReceiveCount;
    this.lastTotalReceiveSize = this.totalReceiveSize;

    // this.showSnapshot();
  }

  /** console顯示最後一次snapshot內容 */
  public static showSnapshot(): void {
    const lastSnapshot = this.allSnapshot[this.allSnapshot.length - 1];
    console.log(lastSnapshot);
  }

  /** 將紀錄輸出成檔案 */
  public static outputFile(): void {
    // 輸出
    let csvBuffer: string = '';
    csvBuffer += 'time,';
    csvBuffer += 'cpuLast,';
    csvBuffer += 'memory,';
    csvBuffer += 'connection,';
    csvBuffer += 'sendCount,';
    csvBuffer += 'sendSize,';
    csvBuffer += 'recevieCount,';
    csvBuffer += 'recevieSize,';
    csvBuffer += 'fps,';
    csvBuffer += 'roomCount\n';

    this.allSnapshot.forEach((snapShot) => {
      csvBuffer += snapShot.time + ',';
      csvBuffer += snapShot.cpuLast + ',';
      csvBuffer += snapShot.memory + ',';
      csvBuffer += snapShot.connection + ',';
      csvBuffer += snapShot.sendCount + ',';
      csvBuffer += snapShot.sendSize + ',';
      csvBuffer += snapShot.recevieCount + ',';
      csvBuffer += snapShot.recevieSize + ',';
      csvBuffer += snapShot.fps + ',';
      csvBuffer += snapShot.roomCount + '\n';
    });

    const formattedDate = moment(Date.now()).format('YYYYMMDD_HHmm_ss');
    const fileName = formattedDate + '.csv';

    fs.writeFileSync(fileName, csvBuffer);

    // 清空舊紀錄
    this.allSnapshot = [];
  }

  /** 送出封包時呼叫, 紀錄送出封包大小及數量 */
  public static onSend(sendSize: number): void {
    this.totalSendSize += sendSize;
    this.totalSendCount++;
  }

  /** 收到封包時呼叫, 紀錄收到封包大小及數量 */
  public static onReceive(receiveSize: number): void {
    this.totalReceiveSize += receiveSize;
    this.totalReceiveCount++;
  }

  /** 更新連線數 */
  public static updateConnectionCount(connectionCount: number): void {
    this.connectionCount = connectionCount;
  }

  /** 更新房間數 */
  public static updateRoomCount(roomCount: number): void {
    this.roomCount = roomCount;
  }
}
