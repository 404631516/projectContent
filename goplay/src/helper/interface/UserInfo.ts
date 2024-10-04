import { ResponseState } from '../enum/Common';
import { MssrResultDto } from './Common';

export interface GetMssrSimpleUserInfoDto {
  /** 搜尋的學生ID列表 */
  searchCids: string[];
}

export class GetMssrSimpleUserInfoResultDto implements MssrResultDto {
  result: ResponseState;
  resMessage: string;
  /** Json格式的學生資訊 */
  data: string;
}
