import { ApiResOkBaseDto } from './api.dto';
import { GameConfigDto } from './game-config.dto';
/**
 * 遊戲時間結果 DTO。
 */
export class GameTimeResultDto extends ApiResOkBaseDto {
  constructor() {
    super();
    this.utcGameTime = Date.now();
  }
  /**
   * 遊戲時間。
   */
  utcGameTime: number;
}

/**
 * 遊戲表格結果 DTO。
 */
export class GameTableResultDto extends ApiResOkBaseDto {
  /** 遊戲設定 DTO。 */
  gameConfig: GameConfigDto;
}
