import { BrickBreakerGridEventType } from '../../NetProtocol/BrickBreakerStructure';
import TableManager, { BrickBreakerEventData } from '../Table/TableManager';
import MathHelper from '../../Netservice/MathHelper';

export default class BrickBreakerHelper {
  //#region singleton
  private static _instance: BrickBreakerHelper;
  public static get instance(): BrickBreakerHelper {
    if (this._instance === undefined) {
      this._instance = new BrickBreakerHelper();
    }
    return this._instance;
  }
  //#endregion

  //#region 骰隨機事件及寶物的機率參數
  /** 事件靜態總表, 因為常常用到所以存起來 */
  private allEventTableData: Array<Readonly<BrickBreakerEventData>>;
  /** 紅磚骰出事件的機率陣列 */
  private brickEventProbability: number[];
  /** 寶物格子骰出寶物的機率陣列 */
  private treasureEventProbability: number[];
  /** 寶箱格子骰出寶物的機率陣列 */
  private answerTreasureEventProbability: number[];
  //#endregion

  constructor() {
    // 事件總表
    this.allEventTableData = TableManager.brickBreakerEvent.getAll();
    // 紅磚格子骰出事件的機率陣列
    this.brickEventProbability = [];
    for (const event of this.allEventTableData) {
      this.brickEventProbability.push(event.brickTriggerChance);
    }
    // 紅磚格子骰出事件的機率陣列
    this.treasureEventProbability = [];
    for (const event of this.allEventTableData) {
      this.treasureEventProbability.push(event.treasureTriggerChance);
    }
    // 紅磚格子骰出事件的機率陣列
    this.answerTreasureEventProbability = [];
    for (const event of this.allEventTableData) {
      this.answerTreasureEventProbability.push(event.answerTreasureTriggerChance);
    }
  }

  /** 取得隨機紅磚塊事件 */
  public getBrickRandomEvent(): BrickBreakerGridEventType {
    // 根據各機率骰出一個對應的index
    const randomEvent = MathHelper.getRandomObjectByProbabilityArray(
      this.allEventTableData,
      this.brickEventProbability
    );
    // 防呆, chanceArray有問題, 導致沒有任何事件被骰到的狀況
    if (randomEvent === undefined) {
      console.error('getBrickRandomEvent() error, randomEvent not found!');
      return BrickBreakerGridEventType.TriggerFailed;
    }
    // 回傳
    return randomEvent.id;
  }

  /** 取得隨機寶物事件 */
  public getTreasureRandomEvent(): BrickBreakerGridEventType {
    // 根據各機率骰出一個對應的index
    const randomEvent = MathHelper.getRandomObjectByProbabilityArray(
      this.allEventTableData,
      this.treasureEventProbability
    );
    // 防呆, chanceArray有問題, 導致沒有任何事件被骰到的狀況
    if (randomEvent === undefined) {
      console.error('getTreasureRandomEvent() error, randomEvent not found!');
      return BrickBreakerGridEventType.TriggerFailed;
    }
    // 回傳
    return randomEvent.id;
  }

  /** 取得隨機寶物事件 */
  public getAnswerTreasureRandomEvent(): BrickBreakerGridEventType {
    // 根據各機率骰出一個對應的index
    const randomEvent = MathHelper.getRandomObjectByProbabilityArray(
      this.allEventTableData,
      this.answerTreasureEventProbability
    );
    // 防呆, chanceArray有問題, 導致沒有任何事件被骰到的狀況
    if (randomEvent === undefined) {
      console.error('getAnswerTreasureRandomEvent() error, randomEvent not found!');
      return BrickBreakerGridEventType.TriggerFailed;
    }
    // 回傳
    return randomEvent.id;
  }
}
