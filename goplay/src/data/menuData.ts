import { UserRole } from '@/helper/enum/Common';
import { MenuName, MenuWord, MenuType } from '@/helper/enum/MenuName';
import { MenuData } from '@/helper/interface/Index';
import { WebGameName } from '@/helper/enum/WebGame';

const menuData: MenuData[] = [
  // 首頁
  {
    name: '回首頁',
    link: '/',
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 故事背景
  {
    name: MenuWord.StoryTour,
    link: `/${MenuName.StoryTour}`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 新手引導
  {
    name: MenuWord.NoviceGuide,
    link: `/${MenuName.NoviceGuide}`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 個人資訊
  {
    name: MenuWord.Profile,
    link: `/${MenuName.Profile}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 答題遊戲
  {
    name: MenuWord.CourseMenu,
    link: `/${MenuName.CourseMenu}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 魔王挑戰
  {
    name: MenuWord.WorldContest,
    link: `/${MenuName.WorldContest}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 因雄宇宙
  {
    name: MenuWord.HeroUniverse,
    link: `/${MenuName.HeroUniverse}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 星球大戰
  {
    name: MenuWord.PlanetWar,
    link: `/${MenuName.PlanetWar}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 星際論壇
  {
    name: MenuWord.InterstellarForum,
    link: `/${MenuName.InterstellarForum}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 問卷挑戰
  {
    name: MenuWord.QuestionnaireUser,
    link: `/${MenuName.QuestionnaireUser}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.MYR, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 個人基地
  {
    name: MenuWord.PersonalBase,
    link: `/${WebGameName.PersonalBaseGame}`,
    type: MenuType.router,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 代幣兌換
  {
    name: MenuWord.Exchange,
    link: '',
    type: MenuType.dialog,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
  // 問題回報
  {
    name: MenuWord.Report,
    link: 'https://docs.google.com/forms/d/e/1FAIpQLScS_1DWRKzD2RRDGV8BvyExNIXURHDaUC4ezXZivBZZLPzz4w/viewform',
    type: MenuType.link,
    userRole: [UserRole.None],
    children: [],
  },
  // 教師後台
  {
    name: MenuWord.TeacherAdmin,
    link: `/${MenuName.TeacherAdmin}`,
    type: MenuType.subDirectory,
    userRole: [UserRole.TCH],
    children: [
      // 數據儀表板
      {
        name: MenuWord.DataDashboardAnalysis,
        link: `/${MenuName.TeacherAdmin}/${MenuName.TeacherDataDashboard}`,
        type: MenuType.router,
        userRole: [UserRole.TCH],
        children: [],
      },
      // 賽事管理
      {
        name: MenuWord.Contest,
        link: `/${MenuName.TeacherAdmin}/${MenuName.Contest}`,
        type: MenuType.router,
        userRole: [UserRole.TCH],
        children: [],
      },
      // 教師派任務系統
      {
        name: MenuWord.StudyTask,
        link: `/${MenuName.TeacherAdmin}/${MenuName.StudyTask}`,
        type: MenuType.router,
        userRole: [UserRole.TCH],
        children: [],
      },
      // 任務完成狀態查詢
      {
        name: MenuWord.StudyTaskStatus,
        link: `/${MenuName.TeacherAdmin}/${MenuName.StudyTaskStatus}`,
        type: MenuType.router,
        userRole: [UserRole.TCH],
        children: [],
      },
    ],
  },
  // 管理者介面
  {
    name: MenuWord.BackEndManagement,
    link: '',
    type: MenuType.subDirectory,
    userRole: [UserRole.SUP, UserRole.MYR],
    children: [
      // 數據儀表板
      {
        name: MenuWord.DataDashboardAnalysis,
        link: `/${MenuName.BackEndManagement}/${MenuName.AdminDataDashboard}`,
        type: MenuType.router,
        userRole: [UserRole.SUP],
        children: [],
      },
      // 賽事管理
      {
        name: MenuWord.Contest,
        link: `/${MenuName.BackEndManagement}/${MenuName.Contest}`,
        type: MenuType.router,
        userRole: [UserRole.SUP],
        children: [],
      },
      // 活動管理
      {
        name: MenuWord.AdminSetting,
        link: `/${MenuName.BackEndManagement}/${MenuName.AdminSetting}`,
        type: MenuType.router,
        userRole: [UserRole.SUP],
        children: [],
      },
      // 學習歷程報表
      {
        name: MenuWord.LearningRecordStatistic,
        link: `/${MenuName.BackEndManagement}/${MenuName.LearningRecordStatistic}`,
        type: MenuType.router,
        userRole: [UserRole.SUP],
        children: [],
      },
      {
        name: '問卷系統',
        link: `/${MenuName.BackEndManagement}/${MenuName.QuestionnaireEdit}`,
        type: MenuType.router,
        userRole: [UserRole.SUP],
        children: [],
      },
      // 教師派獎管理
      {
        name: MenuWord.AdminTeacherAward,
        link: `/${MenuName.BackEndManagement}/${MenuName.AdminTeacherAward}`,
        type: MenuType.router,
        userRole: [UserRole.SUP],
        children: [],
      },
    ],
  },
  // 登出
  {
    name: MenuWord.SignOut,
    link: '',
    type: MenuType.dialog,
    userRole: [UserRole.SUP, UserRole.TCH, UserRole.STU],
    children: [],
  },
];

/** 測試頁面 */
const debugMenuData: MenuData[] = [
  // 測試頁面
  {
    name: '測試頁面',
    link: `/${MenuName.TestPage}`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 新遊戲
  {
    name: 'Phaser開發',
    link: `/${WebGameName.TestGame}`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 測試遊戲
  {
    name: '測試_貪食蛇',
    link: `/${WebGameName.TestGame}/23`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 測試遊戲
  {
    name: '測試_垂直跑酷',
    link: `/${WebGameName.TestGame}/24`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 測試遊戲
  {
    name: '測試_太空侵略者',
    link: `/${WebGameName.TestGame}/25`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
  // 測試遊戲
  {
    name: '測試_2048',
    link: `/${WebGameName.TestGame}/26`,
    type: MenuType.router,
    userRole: [UserRole.None],
    children: [],
  },
];

// 測試時加入測試頁面
if (process.env.NODE_ENV !== 'production') {
  menuData.push(...debugMenuData);
}

export default menuData;
