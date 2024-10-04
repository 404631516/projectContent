import { MssrSimpleUserInfo } from '@/hero-api/module/mssr/bridge/dto/bridge-user.dto';
import { postV2 } from './http-server';
import { GetMssrSimpleUserInfoDto, GetMssrSimpleUserInfoResultDto } from '@/helper/interface/UserInfo';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';

export class UserInfoAPI {
  public static async getSimpleUserInfo(
    getMssrSimpleUserInfoDto: GetMssrSimpleUserInfoDto,
  ): Promise<MssrSimpleUserInfo[]> {
    const getMssrSimpleUserInfoResult = await postV2(
      '/simpleUserInfo',
      getMssrSimpleUserInfoDto,
      new GetMssrSimpleUserInfoResultDto(),
    );

    try {
      const simpleUserInfoList: MssrSimpleUserInfo[] = JSON.parse(getMssrSimpleUserInfoResult.data);
      return simpleUserInfoList;
    } catch (error) {
      Helper.assert(ErrorId.JsonParseFailed, 'simpleUserInfo is undefined');
      return [];
    }
  }
}
