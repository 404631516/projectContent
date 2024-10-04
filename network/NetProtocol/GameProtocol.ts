import { Protocol } from '../Netbase/Protocol';
import { ProtocolView } from '../Netbase/ProtocolView';
import { UserJoinGameResult, ServiceUserInfo } from './CommonStructure';

/** 各ptcl的名字, 封包收送時, 用於辨識封包類型 */
export enum GameProtocolName {
  RPCUserJoinGame = 'RPCUserJoinGame',
  PTCLGameStart = 'PTCLGameStart',
  PTCLGameEnd = 'PTCLGameEnd',
}

/** 玩家要求加入遊戲 */
export class RPCUserJoinGame extends Protocol {
  constructor() {
    super(GameProtocolName.RPCUserJoinGame);
  }
  public inRoomUserToken!: string;
  public inUserInfo!: ServiceUserInfo;
  public outResult!: UserJoinGameResult;
}

/** server to client, broadcast遊戲開始 */
export class PTCLGameStart extends Protocol {
  constructor() {
    super(GameProtocolName.PTCLGameStart);
  }
}

/** broadcast遊戲結束 */
export class PTCLGameEnd extends Protocol {
  constructor() {
    super(GameProtocolName.PTCLGameEnd);
  }
}

ProtocolView.registerProtocols({
  RPCUserJoinGame,
  PTCLGameStart,
  PTCLGameEnd,
});
