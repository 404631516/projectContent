export enum OptionType {
  /** 文字(簡答/詳答) */
  Text = 0,
  /** 單選 */
  OneSelect = 1,
  /** (最多選N個(含)以下)(<=) 多選:2 */
  LessSelect = 2,
  /** (必須選N個)(==) 多選:3 */
  EqualSelect = 3,
  /** (最少選N個(含)以上)(>=) 多選:4 */
  MoreSelect = 4,
}

export enum OptionTypeName {
  /** 文字(簡答/詳答) */
  Text = '簡答題',
  /** 單選 */
  OneSelect = '單選題',
  /** (最多選N個(含)以下)(<=) 多選:2 */
  LessSelect = '多選題(最多)',
  /** (必須選N個)(==) 多選:3 */
  EqualSelect = '多選題(必須)',
  /** (最少選N個(含)以上)(>=) 多選:4 */
  MoreSelect = '多選題(最少)',
}

/** 問巻排序方式 */
export enum QuestionnaireSortType {
  /** 前到後 */
  ascending = 0,
  /** 後到前 */
  descending = 1,
}

/** 問巻過濾方式 */
export enum QuestionnaireFilterState {
  /** 全部 */
  all = 0,
  /** 未參與 */
  notFill = 1,
  /** 已參與 */
  isFill = 2,
}
