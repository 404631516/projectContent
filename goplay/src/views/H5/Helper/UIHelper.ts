import { GradeType, GradeTypeName, SemesterType, SemesterTypeName } from '@/helper/enum/Common';
import { ClassListItem, GradeItem, SchoolClass } from '@/helper/interface/TeacherAdmin';
import { ContestGameRecordName, ContestGameRecordType } from '@/helper/enum/TeacherAdmin';
import Object2D from '../Scripts/Components/Object2D';
import { zeroPad } from './MathHelper';

export default class UIHelper {
  //#region 色碼表(String)
  /** 黑色 */
  public static readonly blackString = '#000000';
  /** 銀色 */
  public static readonly silverString = '#C0C0C0';
  /** 栗色 */
  public static readonly maroonString = '#800000';
  /** 紅色 */
  public static readonly redString = '#FF0000';
  /** 印度紅 */
  public static readonly indianRedString = '#CD5C5C';
  /** 深藍色 */
  public static readonly navyString = '#000080';
  /** 藍色 */
  public static readonly blueString = '#0000FF';
  /** 紫色 */
  public static readonly purpleString = '#800080';
  /** 品紅色 */
  public static readonly fuchsiaString = '#FF00FF';
  /** 綠色 */
  public static readonly greenString = '#008000';
  /** 萊姆色 */
  public static readonly limeString = '#00FF00';
  /** 橄欖色 */
  public static readonly oliveString = '#808000';
  /** 黃色 */
  public static readonly yellowString = '#FFFF00';
  /** 墨綠色 */
  public static readonly tealString = '#008080';
  /** 青色 */
  public static readonly cyanString = '#00FFFF';
  /** 灰色 */
  public static readonly grayString = '#808080';
  /** 白色 */
  public static readonly whiteString = '#FFFFFF';
  //#endregion

  //#region 色碼表(Number)
  /** 黑色 */
  public static readonly blackNumber = 0x000000;
  /** 銀色 */
  public static readonly silverNumber = 0xc0c0c0;
  /** 栗色 */
  public static readonly maroonNumber = 0x800000;
  /** 紅色 */
  public static readonly redNumber = 0xff0000;
  /** 印度紅 */
  public static readonly indianRedNumber = 0xcd5c5c;
  /** 深藍色 */
  public static readonly navyNumber = 0x000080;
  /** 藍色 */
  public static readonly blueNumber = 0x0000ff;
  /** 紫色 */
  public static readonly purpleNumber = 0x800080;
  /** 品紅色 */
  public static readonly fuchsiaNumber = 0xff00ff;
  /** 綠色 */
  public static readonly greenNumber = 0x008000;
  /** 萊姆色 */
  public static readonly limeNumber = 0x00ff00;
  /** 橄欖色 */
  public static readonly oliveNumber = 0x808000;
  /** 黃色 */
  public static readonly yellowNumber = 0xffff00;
  /** 墨綠色 */
  public static readonly tealNumber = 0x008080;
  /** 青色 */
  public static readonly cyanNumber = 0x00ffff;
  /** 灰色 */
  public static readonly grayNumber = 0x808080;
  /** 白色 */
  public static readonly whiteNumber = 0xffffff;
  /** 能量條顏色 */
  public static readonly energyBarColor = 0x2ceaec;
  //#endregion

  /** 取得年級
   * @param classroom
   */
  public static toGrade(classroom: string): number {
    return +classroom.split('-')[0];
  }

  /** 取得班級
   * @param classroom
   */
  public static toClass(classroom: string): string[] {
    return classroom.split('-')[1]?.split(' ') ?? [];
  }

  /** 取得班級名稱
   * @param classroom
   */
  public static toChineseClass(classroom: string): string {
    const chineseGrade = this.toChineseGrade(this.toGrade(classroom));
    const classArray = this.toClass(classroom);
    const chineseClass = this.toChineseNumber(+classArray[0]);
    const classSub = classArray[1] ?? '';

    return `${chineseGrade}年${chineseClass}班${classSub}`;
  }

  /** 取得年級中文字
   * @param gradeType
   */
  public static toChineseGrade(gradeType: GradeType): string {
    const nameKey = GradeType[gradeType];
    return Object.entries(GradeTypeName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤年級';
  }

  /** 取得學期中文字
   * @param semesterType
   */
  public static toChineseSemester(semesterType: SemesterType): string {
    const nameKey = SemesterType[semesterType];
    return Object.entries(SemesterTypeName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤學期';
  }

  /** 取得歷程類型中文字
   * @param contestGameRecordType
   */
  public static toChineseContestGameRecordType(contestGameRecordType: ContestGameRecordType): string {
    const nameKey = ContestGameRecordType[contestGameRecordType];
    return Object.entries(ContestGameRecordName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤歷程類型';
  }

  /** 組合縣市和學校
   *  @param countyName 縣市別
   *  @param schoolName 學校名稱
   */
  public static combineCountySchool(countyName: string, schoolName: string): string {
    let countyNameAnother: string = '';
    // 判斷臺跟台
    if (countyName.indexOf('台') > -1) {
      countyNameAnother = countyName.replace('台', '臺');
    } else if (countyName.indexOf('臺') > -1) {
      countyNameAnother = countyName.replace('臺', '台');
    }
    // 含有縣市名稱不接縣市字串
    return schoolName.includes(countyName) || (countyNameAnother !== '' && schoolName.includes(countyNameAnother))
      ? schoolName
      : `${countyName}${schoolName}`;
  }

  /** 縮放物件, 使其照原比例, 填滿一個長方形範圍
   * @param object 要縮放的圖片/文字
   * @param targetHeight 目標顯示範圍(高)
   * @param targetWidth 目標顯示範圍(寬)
   */
  public static setScaleFill(
    object: Phaser.GameObjects.Text | Phaser.GameObjects.Image,
    targetHeight: number,
    targetWidth: number
  ) {
    // 長/寬縮放比
    const scalePropX = targetWidth / object.width;
    const scalePropY = targetHeight / object.height;
    // 取較小的邊
    const scaleProp = Math.min(scalePropX, scalePropY);
    // set scale
    object.setScale(scaleProp);
  }

  /** 縮放物件, 不維持原比例, 填滿一個長方形範圍
   * @param scaleObj 要縮放的圖片/文字
   * @param targetWidth 目標顯示範圍(寬)
   * @param targetHeight 目標顯示範圍(高)
   */
  public static scaleToTarget(
    scaleObj: Phaser.GameObjects.Text | Phaser.GameObjects.Image,
    targetWidth: number,
    targetHeight: number
  ) {
    // 長/寬縮放比
    scaleObj.scaleX = targetWidth / scaleObj.width;
    scaleObj.scaleY = targetHeight / scaleObj.height;
  }

  /** 計算Object2D物件位置的世界座標 */
  public static calcWorldPosition(targetObj: Object2D): Phaser.Math.Vector2 {
    const worldPos = new Phaser.Math.Vector2(targetObj.x, targetObj.y);
    let childObj: Phaser.GameObjects.GameObject = targetObj;
    while (childObj.parentContainer) {
      worldPos.x += childObj.parentContainer.x;
      worldPos.y += childObj.parentContainer.y;
      childObj = childObj.parentContainer;
    }
    return worldPos;
  }

  /**轉成中文數字
   * @param number 數字
   */
  public static toChineseNumber(num: number): string {
    const chineseNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    /**超過一百用拼的 */
    if (num > 100) {
      return `${num}`
        .split('')
        .map((numItem) => chineseNum[+numItem])
        .join('');
    }
    /**小於十用陣列 index 返回 */
    if (num <= 10) {
      return chineseNum[num];
    }

    if (num === 100) {
      return '一百';
    }

    const numberLength = `${num}`.length;
    const numArray = [];
    for (let i = 0; i <= numberLength - 1; i++) {
      const sliceNum = +`${num}`.slice(i, numberLength);
      if (sliceNum === 0) {
        continue;
      }
      /**處理 11 - 19 */
      if (sliceNum / 10 > 1 && sliceNum / 10 < 2) {
        numArray.push('十');
        continue;
      }
      /**處理大於 19 */
      if (sliceNum / 10 >= 2) {
        numArray.push(`${chineseNum[parseInt(`${sliceNum / 10}`, 10)]}十`);
        continue;
      }
      numArray.push(chineseNum[sliceNum]);
    }
    return numArray.join('');
  }

  /** 將總秒數，轉為分:秒的文字，並在不足位數補上0
   * @param totalSecond 總秒數
   */
  public static toMinuteSecondText(totalSecond: number): string {
    // 將總秒數，改以分鐘為單位表示
    const minute = Math.max(Math.floor(totalSecond / 60), 0);
    // 不足1分鐘的剩下秒數
    const second = Math.max(totalSecond % 60, 0);

    // 組成mm:ss文字，並補0
    return `${zeroPad(minute, 2)}:${zeroPad(second, 2)}`;
  }

  /**整理班級列表
   * @param classList 後端資料
   */
  public static toSchoolClassList(classList: ClassListItem[]): SchoolClass[] {
    const schoolClassList: SchoolClass[] = [];
    classList.map((classItem: ClassListItem) => {
      // 先找學年
      let currentAcademicYear = schoolClassList.find(
        (schoolItem: SchoolClass) => classItem.academicYear === schoolItem.academicYearId
      );
      // 沒有代表是新的學年, 新增學年資料
      if (currentAcademicYear === undefined) {
        currentAcademicYear = {
          academicYearId: classItem.academicYear,
          academicYearTitle: `${classItem.academicYear}年`,
          gradeChildren: [],
        };
        schoolClassList.push(currentAcademicYear);
      }

      // 再找年級
      const grade = +UIHelper.toGrade(classItem.classroom);
      let currentGrade = currentAcademicYear.gradeChildren.find((gradeItem: GradeItem) => gradeItem.grade === grade);
      // 沒有代表是新的年級
      if (currentGrade === undefined) {
        currentGrade = {
          grade,
          gradeString: `${UIHelper.toChineseGrade(grade)}年級`,
          classChildren: [],
        };
        currentAcademicYear.gradeChildren.push(currentGrade);
      }

      // 班級重複防呆
      if (currentGrade.classChildren.findIndex((classData) => classData.classId === classItem.classId) > -1) {
        console.error(`重複班級資料 classId=${classItem.classId}`);
        return;
      }

      currentGrade.classChildren.push({
        classId: classItem.classId,
        classNum: +UIHelper.toClass(classItem.classroom)[0],
        classString: UIHelper.toChineseClass(classItem.classroom),
      });
    });

    // 排序
    schoolClassList.sort((a, b) => a.academicYearId - b.academicYearId);
    schoolClassList.forEach((schoolClassListItem) => {
      schoolClassListItem.gradeChildren.sort((a, b) => a.grade - b.grade);
      schoolClassListItem.gradeChildren.forEach((classItem) => {
        classItem.classChildren.sort((a, b) => a.classNum - b.classNum);
      });
    });

    return schoolClassList;
  }
}
