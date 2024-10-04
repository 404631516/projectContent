export interface IProtocolHeader {
  ptclName: string;
  id: number;
}

export interface IProtocol {
  header: IProtocolHeader;
}

export enum PTCLDisconnectReason {
  /** 伺服器正常斷線 */
  Normal,
  /** server通知client斷線, 短時間內收到多個相同類型的封包, 超出限制則斷線 */
  CallCountMax,
  /** server通知client斷線, 重複登入, 舊連線斷線 */
  DuplicateConnection,

  Error,
}

/** 各ptcl的名字, 封包收送時, 用於辨識封包類型 */
export enum SystemProtocolName {
  PTCLUnknown = 'PTCLUnknown',
  PTCLConnected = 'PTCLConnected',
  PTCLNotifyConnect = 'PTCLNotifyConnect',
  PTCLError = 'PTCLError',
  PTCLDisconnected = 'PTCLDisconnected',
  PTCLServerListening = 'PTCLServerListening',
}

export class ProtocolHeader {
  public ptclName = '';
  public id: number = Protocol.invalidId;
  public rpcId: number = Protocol.invalidId;
}

export class Protocol {
  public static readonly invalidId = -1;
  public header = new ProtocolHeader();
  constructor(ptclName: string) {
    this.header.ptclName = ptclName;
  }

  public getId(): number {
    return this.header.id;
  }

  public setId(id: number) {
    this.header.id = id;
  }

  public getName(): Readonly<string> {
    return this.header.ptclName;
  }

  public isSystemProtocol(): boolean {
    return false;
  }
}

export class SystemProtocol extends Protocol {
  public isSystemProtocol(): boolean {
    return true;
  }
}

export class ErrorRPCTimeout extends Error {}

export class ErrorSystemError extends Error {}

export class PTCLUnknown extends SystemProtocol {
  constructor() {
    super(SystemProtocolName.PTCLUnknown);
  }
}

export class PTCLConnected extends SystemProtocol {
  constructor() {
    super(SystemProtocolName.PTCLConnected);
  }
}

export class PTCLNotifyConnect extends SystemProtocol {
  constructor() {
    super(SystemProtocolName.PTCLNotifyConnect);
  }
  public connectionId = 0;
}

export class PTCLError extends SystemProtocol {
  constructor() {
    super(SystemProtocolName.PTCLError);
  }
  public message = '';
}

export class PTCLDisconnected extends SystemProtocol {
  constructor() {
    super(SystemProtocolName.PTCLDisconnected);
  }
  public reason: PTCLDisconnectReason = PTCLDisconnectReason.Normal;
}

export class PTCLServerListening extends SystemProtocol {
  constructor() {
    super(SystemProtocolName.PTCLServerListening);
  }
}
