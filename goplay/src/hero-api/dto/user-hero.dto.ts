import { UserHero } from '../entity/user-hero.entity';
import { UserResource, UserResourceNumType } from '../entity/user-resource.entity';
import { ApiResOkBaseDto } from './api.dto';

/**
 * UserHerosResultDto 是一個用於表示用戶英雄結果的資料傳輸物件。
 */
export class UserHerosResultDto extends ApiResOkBaseDto {
  /**
   * 用戶的英雄列表。
   */
  userHeros: UserHero[];

  /**
   * 建構子，用於創建一個新的 UserHerosResultDto 實例。
   * @param userHeros 用戶的英雄列表。
   */
  constructor(userHeros: UserHero[]) {
    super();
    this.userHeros = userHeros;
  }
}

/**
 * UnlockUserHeroDto 是一個用於表示解鎖用戶英雄的資料傳輸物件。
 */
export class UnlockUserHeroDto {
  /**
   * 要解鎖的英雄的資料 ID，必須是正數。
   */
  dataId: number;

  constructor(dataId: number) {
    this.dataId = dataId;
  }
}

/**
 * UnlockUserHeroResultDto 是一個用於表示解鎖用戶英雄結果的資料傳輸物件。
 */
export class UnlockUserHeroResultDto extends ApiResOkBaseDto {
  /**
   * 已解鎖的用戶英雄。
   */
  userHero: UserHero;

  /**
   * 用戶的資源。
   */
  userResource: UserResource;

  /**
   * 建構子，用於創建一個新的 UnlockUserHeroResultDto 實例。
   * @param userHero 已解鎖的用戶英雄。
   * @param userResource 用戶的資源。
   */
  constructor(userHero: UserHero, userResource: UserResource) {
    super();
    this.userHero = userHero;
    this.userResource = userResource;
  }
}
