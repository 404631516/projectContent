import { UserRole } from '@/helper/enum/Common';
import { ChartTarget, ComType } from '@/helper/enum/TeacherAdmin';
export interface SearchOptionData {
    name: ChartTarget;
    userRole: UserRole[];
    comType: ComType[];
  }
export const searchOptionData: SearchOptionData[] = [
  {
    name: ChartTarget.SubjectTime,
    userRole: [UserRole.TCH],
    comType: [ComType.None],
  },
  {
    name: ChartTarget.LoginUser,
    userRole: [UserRole.TCH],
    comType: [ComType.None],
  },
  {
    name: ChartTarget.LoginCount,
    userRole: [UserRole.SUP, UserRole.MYR, UserRole.TCH],
    comType: [ComType.None],
  },
  {
    name: ChartTarget.ForumDataCount,
    userRole: [UserRole.SUP, UserRole.MYR, UserRole.TCH],
    comType: [ComType.None],
  },
  {
    name: ChartTarget.OnlineTime,
    userRole: [UserRole.SUP, UserRole.MYR, UserRole.TCH],
    comType: [ComType.None],
  },
  {
    name: ChartTarget.CountyLoginCount,
    userRole: [UserRole.SUP],
    comType: [ComType.Country],
  },
  {
    name: ChartTarget.CountyOnlineTime,
    userRole: [UserRole.SUP],
    comType: [ComType.Country],
  },
  {
    name: ChartTarget.SchoolLoginCount,
    userRole: [UserRole.SUP, UserRole.MYR],
    comType: [ComType.City],
  },
  {
    name: ChartTarget.SchoolOnlineTime,
    userRole: [UserRole.SUP, UserRole.MYR],
    comType: [ComType.City],
  },
];
