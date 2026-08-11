import { User, UserPermissions, Role } from "@prisma/client";

export interface IJwtUserObj {
  userId: string;
  role: Role;
  name: string;
  schoolId: string | null | undefined;
  schoolName?: string | null;
  schoolLogo?: string | null;
  profilePic?: string | null;
}

export interface IPermissionListObj extends UserPermissions {
  user?: User;
}

export interface IUserPermission {
  [key: string]: IUserPermissionObj;
}

export interface IUserPermissionObj {
  access: boolean;
  permissions: IPermissionObj;
}

export interface IPermissionObj {
  create: number;
  read: number;
  update: number;
  delete: number;
  managePermissions: number;
}

export interface IUpdateUserPermissions {
  id: string;
  module: string;
  access: boolean;
  permission: IPermissionObj;
}
