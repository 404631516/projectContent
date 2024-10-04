import { AnswerInfo, QuestionData } from './CommonStructure';
import { Protocol } from '../Netbase/Protocol';
import { ProtocolView } from '../Netbase/ProtocolView';
import {
  BrickBreakerAvatarData,
  BrickBreakerAvatarUpdateData,
  BrickBreakerBossData,
  BrickBreakerGrid,
  BrickBreakerGridEventType,
  BrickBreakerRankData,
  BrickBreakerVueUserAnswerData,
} from './BrickBreakerStructure';

export enum GetNextQuestionResultType {
  Success,
  GetAvatarFailed,
  GetQuestionFailed,
}

/** 各ptcl的名字, 封包收送時, 用於辨識封包類型 */
export enum BrickBreakerProtocolName {
  RPCBrickBreakerGetGameInfo = 'RPCBrickBreakerGetGameInfo',
  RPCBrickBreakerGetAvatarDataList = 'RPCBrickBreakerGetAvatarDataList',
  PTCLBrickBreakerAvatarUpdate = 'PTCLBrickBreakerAvatarUpdate',
  PTCLBrickBreakerGridUpdate = 'PTCLBrickBreakerGridUpdate',
  PTCLBrickBreakerBossUpdate = 'PTCLBrickBreakerBossUpdate',
  RPCBrickBreakerAvatarMove = 'RPCBrickBreakerAvatarMove',
  RPCBrickBreakerPlayerGetNextQuestion = 'RPCBrickBreakerPlayerGetNextQuestion',
  RPCBrickBreakerPlayerAnswerFinished = 'RPCBrickBreakerPlayerAnswerFinished',
  PTCLBrickBreakerRankData = 'PTCLBrickBreakerRankData',
  PTCLBrickBreakerPlayerReconnect = 'PTCLBrickBreakerPlayerReconnect',
}

/** server to client, 更新玩家avatar狀態 */
export class PTCLBrickBreakerAvatarUpdate extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.PTCLBrickBreakerAvatarUpdate);
  }
  public updateData!: BrickBreakerAvatarUpdateData;
  public avatarDataList!: BrickBreakerAvatarData[];
}

/** server to client, 更新地圖格子狀態 */
export class PTCLBrickBreakerGridUpdate extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.PTCLBrickBreakerGridUpdate);
  }
  public gridArray!: BrickBreakerGrid[];
}

/** server to client, 更新魔王狀態 */
export class PTCLBrickBreakerBossUpdate extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.PTCLBrickBreakerBossUpdate);
  }
  public bossData!: BrickBreakerBossData;
}

/** server to client, 通知玩家當事人, 他是斷線重連 */
export class PTCLBrickBreakerPlayerReconnect extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.PTCLBrickBreakerPlayerReconnect);
  }
}

/** 玩家請求, 取得地圖、遊戲時間等基本遊戲資訊 */
export class RPCBrickBreakerGetGameInfo extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.RPCBrickBreakerGetGameInfo);
  }
  public mapId!: number;
  public allGridData!: BrickBreakerGrid[];
  public mapHeight!: number;
  public mapWidth!: number;
  public playerMax!: number;
  public bossData!: BrickBreakerBossData;
  public gameStartAt!: number;
  public gameEndAt!: number;
  public serverNow!: number;
  public isGameStart!: boolean;
}

/** 玩家要求取得當前所有玩家資料 */
export class RPCBrickBreakerGetAvatarDataList extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.RPCBrickBreakerGetAvatarDataList);
  }
  public updateData!: BrickBreakerAvatarUpdateData;
  public avatarDataList!: BrickBreakerAvatarData[];
}

/** 玩家請求移動/觸發格子事件 */
export class RPCBrickBreakerAvatarMove extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.RPCBrickBreakerAvatarMove);
  }
  public inGridId!: number;
  public outIsSuccess!: boolean;
  public outEventType!: BrickBreakerGridEventType;
  public outAvatarUpdateData!: BrickBreakerAvatarUpdateData;
  public outAvatarData?: BrickBreakerAvatarData;
}

/** 玩家請求, 送上一題的答案, reply下一題題目 */
export class RPCBrickBreakerPlayerGetNextQuestion extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.RPCBrickBreakerPlayerGetNextQuestion);
  }
  public inAnswerInfo!: AnswerInfo;
  public outQuestionData!: QuestionData;
  public outResultType!: GetNextQuestionResultType;
}

/** 玩家在答題結束後送此封包, server根據答題結果決定下一個表演 */
export class RPCBrickBreakerPlayerAnswerFinished extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.RPCBrickBreakerPlayerAnswerFinished);
  }
  public isSuccess!: boolean;
  public avatarUpdateData!: BrickBreakerAvatarUpdateData;
  public avatarData!: BrickBreakerAvatarData;
}

/** broadcast結算顯示用資料 */
export class PTCLBrickBreakerRankData extends Protocol {
  constructor() {
    super(BrickBreakerProtocolName.PTCLBrickBreakerRankData);
  }
  /** 各項目mvp資料 */
  public rankData!: BrickBreakerRankData[];
  /** 遊戲遊玩時間(秒) */
  public gamePlaySec!: number;
  /** BOSS總血量 */
  public bossTotalHp!: number;
  /** BOSS剩餘血量 */
  public bossHp!: number;
  /** 所有玩家的答題相關統計資料, vue結算顯示用 */
  public userAnswerDatas!: BrickBreakerVueUserAnswerData[];
}

ProtocolView.registerProtocols({
  RPCBrickBreakerGetGameInfo,
  RPCBrickBreakerGetAvatarDataList,
  PTCLBrickBreakerAvatarUpdate,
  PTCLBrickBreakerGridUpdate,
  PTCLBrickBreakerBossUpdate,
  RPCBrickBreakerAvatarMove,
  RPCBrickBreakerPlayerGetNextQuestion,
  RPCBrickBreakerPlayerAnswerFinished,
  PTCLBrickBreakerRankData,
  PTCLBrickBreakerPlayerReconnect,
});
