import { UserResource } from '@/hero-api/entity/user-resource.entity';
import { fetchV2 } from './http-server';
import { UserResourceResultDto } from '@/hero-api/dto/user-resource.dto';

/**
 * hero-api user-resource
 */
export class UserResourceAPI {
  public static getUserResource(): Promise<UserResourceResultDto> {
    return fetchV2<UserResourceResultDto>('/v2/user-resource', {}, new UserResourceResultDto(new UserResource()));
  }
}
