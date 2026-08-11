export * from "./super-admin-service";
export * from "./school-admin-service";
export * from "./student-service";
export * from "./teacher-service";
export * from "./parent-service";
export * from "./employee-service";
export * from "./group-admin-service";

import { SuperAdminService } from "./super-admin-service";
import { SchoolAdminService } from "./school-admin-service";
import { StudentService } from "./student-service";
import { TeacherService } from "./teacher-service";
import { ParentService } from "./parent-service";
import { EmployeeService } from "./employee-service";
import { GroupAdminService } from "./group-admin-service";

export const DashboardService = {
  superAdmin: SuperAdminService,
  schoolAdmin: SchoolAdminService,
  student: StudentService,
  teacher: TeacherService,
  parent: ParentService,
  employee: EmployeeService,
  groupAdmin: GroupAdminService,
};
