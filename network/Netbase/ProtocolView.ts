import {
  Protocol,
  ProtocolHeader,
  PTCLConnected,
  PTCLDisconnected,
  PTCLError,
  PTCLNotifyConnect,
  PTCLUnknown,
} from './Protocol';

interface IProtocolTypes {
  [key: string]: new () => Protocol;
}

export class ProtocolView {
  public static registerProtocol(type: new () => Protocol): boolean {
    ProtocolView.ptclTypes.set(type.name, type);
    console.debug(`Register protocol: ${type.name}`);
    return true;
  }

  public static registerProtocols(protocolTypes: IProtocolTypes) {
    Object.keys(protocolTypes).forEach((protocolName) => {
      ProtocolView.ptclTypes.set(protocolName, protocolTypes[protocolName]);
    });
  }

  public static generateProtocol(name: string, source?: object): Protocol | null {
    if (name == null) {
      // 可能是攻擊,不處理
      return null;
    }

    const creator = ProtocolView.ptclTypes.get(name);
    if (creator === undefined) {
      console.error(`ProtocolView.GenProtocol fail, can not create ${name} instance.`);
      return null;
    }

    const instance = new creator();
    if (source != null) {
      Object.assign(instance, source);
    }

    return instance;
  }

  private static ptclTypes = new Map<string, new () => Protocol>();
}

ProtocolView.registerProtocols({
  PTCLConnected,
  PTCLNotifyConnect,
  PTCLDisconnected,
  PTCLUnknown,
  PTCLError,
});
