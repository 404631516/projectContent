import { UserOwnedUpdateAtEntity } from './base.entity';

export class UserHero extends UserOwnedUpdateAtEntity {
  heroUid: number;

  dataId: number;
}
