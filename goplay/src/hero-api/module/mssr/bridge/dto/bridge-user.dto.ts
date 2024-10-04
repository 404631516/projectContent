import { UserRole } from '@/hero-api/entity/user.entity';
import { MssrApiResDto } from './mssr-api.dto';

/**
 * 取得英雄id列表的response
 */
export class BridgeHeroListVisitorResultDto extends MssrApiResDto {
  /**
   * 英雄id列表
   */
  heroIds: number[];
}

/**
 * 來自mssr的簡易使用者資訊, 不可移去shared資料夾, 因為這是mssr專屬的資料結構
 * 想要回傳類似架構的話, 需另外定義class SimpleUserInfo, 因為不應該在hero-api系統內繼續使用"cid"這個變數名稱
 */
export class MssrSimpleUserInfo {
  cid: number;
  userName: string;
  schoolName: string;
  classroom: string;
  role: UserRole;
  picture: string;
}
