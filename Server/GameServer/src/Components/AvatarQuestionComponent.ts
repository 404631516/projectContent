import { PlayerAnswerLog } from '../MssrAgent';
import MathHelper from '../Netservice/MathHelper';
import {
  AnswerInfo,
  AnswerOptions,
  QuestionData,
  QuizData,
  QuizSource,
  ResponseState,
} from '../NetProtocol/CommonStructure';

enum AnswerStateType {
  NotAnswering = 0,
  /** 玩家取得題目後到送上來答案前 */
  Answering,
  /** 玩家vue所有題目答完後, phaser得知接下來的表演之前 */
  AllAnswerFinished,
}

export default class AvatarQuestionComponent {
  /** 當前答題狀態 */
  private currentAnswerState: AnswerStateType = AnswerStateType.NotAnswering;

  /** 亂序後的題庫Id, 這邊的questionId是指questionManager.questions的index */
  private questionIdList: number[];
  /** 亂序後的題庫Id, 當前用到第幾個題號了 */
  private currentQuestionIdListIndex: number = 0;

  /** 當前觸發事件後, 需要做答的題目array */
  private currentQuestionList: QuizData[] = [];
  /** 每一題的選項順序 */
  private optionOrderList: number[][] = [];
  /** 目前進行到第幾題, 0 base */
  private currentQuestOrder: number = -1;
  /** 本題是否答對 */
  private isCurrentQuestionCorrect: boolean = false;

  /** 玩家uid, 方便顯示error log用 */
  private uid: number;

  /** 答題記錄 */
  private quizAnswer: Map<number, PlayerAnswerLog> = new Map<number, PlayerAnswerLog>();
  public getQuizAnswer(): { [k: string]: PlayerAnswerLog } {
    // 轉成object
    const result: Record<string, PlayerAnswerLog> = {};
    this.quizAnswer.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /** 上次取得題目時間, 計算答題時間用 */
  private lastGetQuestionAt: number = 0;

  constructor(uid: number, questionTotalCount: number) {
    this.uid = uid;

    // 設定this.questionIdList
    this.questionIdList = [];
    for (let i = 0; i < questionTotalCount; ++i) {
      this.questionIdList.push(i);
    }
    // 打亂順序
    this.questionIdList.sort(() => {
      return Math.random() - 0.5;
    });

    // 設定currentQuestionIndex
    this.currentQuestionIdListIndex = 0;
  }

  //#region initQuestions
  /** 取得題目index, 以便拿這些index去questionManager要題目
   * @param questionCount 幾題
   * @returns 題目index array
   */
  public getNextQuestionIndices(questionCount: number): number[] {
    const rtn: number[] = [];
    for (let i = 0; i < questionCount; ++i) {
      // 防呆
      if (this.currentQuestionIdListIndex >= this.questionIdList.length) {
        this.currentQuestionIdListIndex = 0;
      }
      // 取得在questionManager裡的index
      const questionId = this.questionIdList[this.currentQuestionIdListIndex];
      // 跟questionManager取得題目
      rtn.push(questionId);
      // 當前題號index++
      this.currentQuestionIdListIndex++;
    }
    return rtn;
  }

  /** 設定題目, 打亂選項順序, 更新答題狀態
   * @param questions 原始題目
   */
  public initQuestions(questions: QuizData[]): void {
    // 防呆, 題目取不到的情況
    if (questions.length === 0) {
      console.error(`BrickBreakerAvatar.initQuestions() error, questions is empty! uid ${this.uid}`);
      return;
    }
    // 防呆, 檢查答題狀態
    if (this.currentAnswerState !== AnswerStateType.NotAnswering) {
      console.error(
        `BrickBreakerAvatar.initQuestions() error, currentAnswerState is ${
          AnswerStateType[this.currentAnswerState]
        }! uid ${this.uid}`
      );
      return;
    }

    // 清空舊資料
    this.optionOrderList = [];

    // 打亂選項, 並記住正確答案位置
    for (const question of questions) {
      // 選項順序洗牌
      const optionOrder = [1, 2, 3, 4];
      const shuffledOptionOrder = MathHelper.shuffle(optionOrder);

      // 記錄選項順序
      this.optionOrderList.push(shuffledOptionOrder);

      // 根據亂序後的選項順序設定回題目
      const originOptions: AnswerOptions = {
        option1: question.options.option1,
        option2: question.options.option2,
        option3: question.options.option3,
        option4: question.options.option4,
      };
      question.options.option1 = this.getOptionString(originOptions, shuffledOptionOrder[0]);
      question.options.option2 = this.getOptionString(originOptions, shuffledOptionOrder[1]);
      question.options.option3 = this.getOptionString(originOptions, shuffledOptionOrder[2]);
      question.options.option4 = this.getOptionString(originOptions, shuffledOptionOrder[3]);
    }
    // 題目ID及正確選項存起來, 以便之後比對對錯
    this.currentQuestionList = questions;

    // 更新答題狀態
    this.currentAnswerState = AnswerStateType.Answering;
  }

  /** 根據optionNum(1~4), 回傳對應的選項文字(option1~option4) */
  private getOptionString(options: AnswerOptions, optionNum: number): string {
    switch (optionNum) {
      case 1:
        return options.option1;
      case 2:
        return options.option2;
      case 3:
        return options.option3;
      case 4:
        return options.option4;
      default:
        return '';
    }
  }
  //#endregion

  //#region onGetNextQuestion
  /** 收到封包, 回答上一題並取得下一題
   * @param answerInfo 上一題的答案
   * @param currentGridEventType 觸發事件類型
   * @returns 回傳格式包含上一題正確與否 & 是否答題結束 & 下一題題目
   */
  public onGetNextQuestion(answerInfo: AnswerInfo): QuestionData {
    // 回傳格式預設值
    let questionData: QuestionData = {
      questTotalCount: 0,
      questOrder: -1,
      quizData: {
        qid: '',
        questionMain: '',
        questionSub: '',
        options: {
          option1: '',
          option2: '',
          option3: '',
          option4: '',
        },
        seconds: 0,
        quizSource: QuizSource.Enableets,
      },
      isRoundOneEnd: false,
      isFinished: false,
      answerScore: 0,
      isCorrect: false,
      result: ResponseState.Success,
      resMessage: '',
    };

    // 防呆
    if (this.currentAnswerState !== AnswerStateType.Answering) {
      console.error(
        `BrickBreakerAvatar.onGetNextQuestion() error, unexpected AnswerStateType ${
          AnswerStateType[this.currentAnswerState]
        }, uid ${this.uid}`
      );
      questionData.isFinished = true;
      questionData.questTotalCount = this.currentQuestionList.length;
      return questionData;
    }

    // 確認上一題結果
    if (this.currentQuestOrder !== -1) {
      // 判斷對錯
      questionData = this.onPlayerAnswer(answerInfo, questionData);

      // 判斷是否答題結束
      // 答錯, 或題目都答過了, 則結束
      if (this.isCurrentQuestionCorrect === false || this.currentQuestOrder + 1 >= this.currentQuestionList.length) {
        questionData.isFinished = true;
        this.currentAnswerState = AnswerStateType.AllAnswerFinished;
      }
    }

    // 取得下一題
    questionData = this.getNextQuestion(questionData);

    questionData.questTotalCount = this.currentQuestionList.length;
    return questionData;
  }

  /** 收到玩家作答, 判斷對錯 */
  private onPlayerAnswer(answerInfo: AnswerInfo, questionData: QuestionData): QuestionData {
    // 防呆
    if (this.currentQuestionList.length === 0) {
      console.error(`BrickBreakerAvatar.onPlayerAnswer() error, currentQuestion undefined! uid ${this.uid}`);
      return questionData;
    }
    if (this.currentQuestOrder >= this.currentQuestionList.length) {
      console.error(
        `BrickBreakerAvatar.onPlayerAnswer() error, currentQuestionIndex ${this.currentQuestOrder} of ${this.currentQuestionList.length}, uid ${this.uid}`
      );
      return questionData;
    }

    // 判斷對錯
    const currentQuestionOptionOrder = this.optionOrderList[this.currentQuestOrder];
    const selectedOption = currentQuestionOptionOrder[answerInfo.answerIndex - 1];
    const isCorrect = selectedOption === 1;

    // 結果存起來
    questionData.isCorrect = isCorrect;
    this.isCurrentQuestionCorrect = isCorrect;

    // log參數
    const currentQuestion = this.currentQuestionList[this.currentQuestOrder];
    const now = Date.now();
    let usedTime = (now - this.lastGetQuestionAt) / 1000;
    usedTime = MathHelper.clamp(usedTime, 0, currentQuestion.seconds);
    // 記log
    this.quizAnswer.set(this.quizAnswer.size + 1, {
      qid: currentQuestion.qid,
      // 選項號碼從使用中的1234改成記錄用的0123
      answer: selectedOption - 1,
      answerTime: currentQuestion.seconds - usedTime,
      usedTime,
      // unixTime從毫秒轉成秒, DB統一以秒做紀錄
      unixTime: Math.floor(now / 1000),
    });

    return questionData;
  }

  /** 設定下一題進questionData */
  private getNextQuestion(questionData: QuestionData): QuestionData {
    // 更新當前題號
    this.currentQuestOrder++;
    questionData.questOrder = this.currentQuestOrder;
    // 填入題目
    if (this.currentQuestOrder < this.currentQuestionList.length) {
      questionData.quizData = this.currentQuestionList[this.currentQuestOrder];
    }

    this.lastGetQuestionAt = Date.now();

    return questionData;
  }
  //#endregion

  //#region onPlayerAnswerFinished
  /** 是否答題結束 */
  public isAnswerFinished(): boolean {
    return this.currentAnswerState === AnswerStateType.AllAnswerFinished;
  }

  /** 是否答對 */
  public isCorrect(): boolean {
    return this.isCurrentQuestionCorrect;
  }

  /** 計算答對題數 */
  public getCorrectCount(): number {
    return this.isCurrentQuestionCorrect ? this.currentQuestOrder : this.currentQuestOrder - 1;
  }

  /** 清空答題狀態 */
  public clearAnswerState() {
    this.currentQuestionList = [];
    this.optionOrderList = [];
    this.currentQuestOrder = -1;
    this.isCurrentQuestionCorrect = false;
    this.currentAnswerState = AnswerStateType.NotAnswering;
  }

  /** 取得答題記錄筆數(共答過多少題) */
  public getLogCount(): number {
    return this.quizAnswer.size;
  }

  /** 取得答題記錄總答對數 */
  public getLogCorrectCount(): number {
    let totalCorrectCount: number = 0;
    this.quizAnswer.forEach((playerAnswerLog) => {
      if (playerAnswerLog.answer === 0) {
        totalCorrectCount++;
      }
    });
    return totalCorrectCount;
  }
  //#endregion
}
