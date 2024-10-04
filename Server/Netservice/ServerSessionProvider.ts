import { Express } from 'express';
import { Session, SessionProvider } from '../Netbase/Session';

/**
 * Server Sessoin用參數
 *
 */
export interface ISessionSSEServerOption {
  path: string;
  app?: Express;
  port?: number;
  uidDecoder: (token: string) => number;
}

/**
 * Sessoin Provider
 */
export abstract class ServerSessionProvider extends SessionProvider {
  public abstract createServer(option: ISessionSSEServerOption): Session;
}
