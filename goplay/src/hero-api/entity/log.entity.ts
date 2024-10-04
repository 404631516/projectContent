import { UserOwnedEntity } from './base.entity';
import { EventResourceLogType } from '../dto/log-event.dto';

export interface LogAdminOperationOptions {
  uid: number;
  path: string;
  method: string;
  query: string;
  body: string;
  spendTime: number;
  result: string;
  message: string;
}

export class LogAdminOperation extends UserOwnedEntity {
  constructor(options: LogAdminOperationOptions) {
    super();
    this.uid = options.uid;
    this.path = options.path;
    this.method = options.method;
    this.query = options.query;
    this.body = options.body;
    this.spendTime = options.spendTime;
    this.result = options.result;
    this.message = options.message;
  }

  logUid: number;

  path: string;

  method: string;

  query: string;

  body: string;

  spendTime: number;

  result: string;

  message: string;
}

export interface LogUserResourceOptions {
  dataField: string;
  updatedValue: number;
  changeAmount: number;
  operation: LogUserResourceOperation;
  logType: EventResourceLogType;
  dataId: number;
  extraData?: string;
}

export enum LogUserResourceOperation {
  Increase = 'Increase',
  Decrease = 'Decrease',
  TimeUpdate = 'TimeUpdate',
}

export class LogUserResource extends UserOwnedEntity {
  constructor(options: LogUserResourceOptions) {
    super();
    this.dataField = options.dataField;
    this.updatedValue = options.updatedValue;
    this.changeAmount = options.changeAmount;
    this.operation = options.operation;
    this.logType = options.logType;
    this.dataId = options.dataId;
  }

  logUid: number;

  dataField: string;

  updatedValue: number;

  changeAmount: number;

  operation: LogUserResourceOperation;

  logType: EventResourceLogType;

  dataId: number;

  extraData: string = '';
}

export enum LogUserGameOperation {
  Play = 'Play',
  Collect = 'Collect',
  Unlock = 'Unlock',
}
