import { Protocol, PTCLDisconnected, PTCLError, SystemProtocolName } from '../Netbase/Protocol';
import { ProtocolHandler } from '../Netbase/ProtocolObservable';
import { Session } from '../Netbase/Session';
import { Composite } from './Composite';

/**
 * NetApp模組
 */
export abstract class NetComponent {
  protected netApp!: NetApp;

  public get session(): Session {
    return this.netApp.getSession();
  }

  public setNetApp(app: NetApp) {
    this.netApp = app;
  }

  public setHandler<T extends Protocol>(ptclName: string, handler: ProtocolHandler<T>): void {
    this.netApp.setHandler(ptclName, handler);
  }

  public abstract create(): void;
  public abstract start(): void;
  public abstract update(): void;
  public abstract onConnected(sn: Session): void;
  public abstract onDisconnected(sn: Session, ptcl: PTCLDisconnected): void;
}

/**
 * NetApp
 */
export class NetApp extends Composite<NetComponent> {
  private session: Session;

  constructor(session: Session) {
    super();
    this.session = session;

    this.setHandler(SystemProtocolName.PTCLConnected, (sn) => {
      this.visitComponent((component) => {
        component.onConnected(sn);
      });
    });

    this.setHandler<PTCLDisconnected>(SystemProtocolName.PTCLDisconnected, (sn, ptcl) => {
      this.visitComponent((component) => {
        component.onDisconnected(sn, ptcl);
      });
    });

    this.setHandler<PTCLError>(SystemProtocolName.PTCLError, (sn, ptcl) => {
      console.error(`NetApp Error ${sn.getType()} ${ptcl.message}`);
    });
  }

  public getSession(): Session {
    return this.session;
  }

  public setHandler<T extends Protocol>(ptclName: string, handler: (sn: Session, ptcl: T) => void): void {
    this.session.setHandler(ptclName, handler);
  }

  public async start(): Promise<void> {
    this.visitComponent((component) => {
      // 不在NetComponent的constructor裡設定NetApp,
      // 是因為new NetComponent時, NetApp可能還沒準備好
      // 此時NetComponent呼叫NetApp可能出現錯誤
      component.setNetApp(this);
      component.create();
    });

    await this.session.start();
    this.visitComponent((component) => {
      component.start();
    });
    return;
  }

  public update(): void {
    this.visitComponent((component) => {
      component.update();
    });
  }
}
