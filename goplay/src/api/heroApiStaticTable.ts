import { TableItem } from '@/hero-api/json-table/json.table';
import { fetchV2 } from './http-server';
import {
  GetAllStaticTableResultDto,
  GetStaticTableDto,
  GetStaticTableResultDto,
  StaticTableName,
} from '@/hero-api/dto/static-table.dto';

/**
 * hero-api user-resource
 */
export class StaticTableAPI {
  /**
   * 取得所有必要的靜態表格
   * @param staticTableName
   * @returns
   */
  public static getAllStaticTable(): Promise<GetAllStaticTableResultDto> {
    return fetchV2<GetAllStaticTableResultDto>('/v2/static-table/all', {}, new GetAllStaticTableResultDto());
  }

  /**
   * 取得指定的靜態表格
   * @param staticTableName
   * @returns
   */
  public static getStaticTable(staticTableName: StaticTableName): Promise<GetStaticTableResultDto> {
    const dto = new GetStaticTableDto();
    dto.staticTableName = staticTableName;
    return fetchV2<GetStaticTableResultDto>(
      '/v2/static-table',
      dto,
      new GetStaticTableResultDto(new Array<TableItem>())
    );
  }
}
