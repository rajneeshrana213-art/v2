import { ACCOUNT_TYPE } from '../lib/constants';

export type SidebarLinkItem = {
  id: number;
  name: string;
  path: string;
  icon: string;
  type?: string;
};

export const sidebarLinks: SidebarLinkItem[] = [
  {
    id: 1,
    name: 'My Profile',
    path: '/dashboard/my-profile',
    icon: 'VscAccount',
  },
  {
    id: 2,
    name: 'Dashboard',
    path: '/dashboard/instructor',
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: 'VscDashboard',
  },
  {
    id: 3,
    name: 'My Courses',
    path: '/dashboard/my-courses',
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: 'VscVm',
  },
  {
    id: 4,
    name: 'Add Course',
    path: '/dashboard/add-course',
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: 'VscAdd',
  },
  {
    id: 5,
    name: 'Enrolled Courses',
    path: '/dashboard/enrolled-courses',
    type: ACCOUNT_TYPE.STUDENT,
    icon: 'VscMortarBoard',
  },
  {
    id: 7,
    name: 'Cart',
    path: '/dashboard/cart',
    type: ACCOUNT_TYPE.STUDENT,
    icon: 'VscArchive',
  },
] ;

