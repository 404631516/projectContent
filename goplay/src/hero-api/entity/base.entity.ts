import { User } from './user.entity';

export class UserOwnedEntity {
  /**擁有者, 用來填充用*/
  user: User;
  /**擁有者UID */
  uid: number;
  /**建立時間 */
  createdAt: Date;
}

export class UserOwnedUpdateAtEntity extends UserOwnedEntity {
  /**更新時間 */
  updatedAt: Date;
}

export class UserOwnedUniqueEntity {
  /**擁有者, 用來填充用*/
  user: User;
  /**擁有者UID */
  uid: number;
  /**建立時間 */
  createdAt: Date;
}

export class UserOwnedUniqueUpdateAtEntity extends UserOwnedUniqueEntity {
  /**更新時間 */
  updatedAt: Date;
}
