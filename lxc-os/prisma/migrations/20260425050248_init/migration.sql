-- CreateEnum
CREATE TYPE "UserSex" AS ENUM ('MALE', 'FEMALE', 'OTHERS');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'teacher', 'student', 'parent', 'library', 'hostel', 'transport', 'account', 'staff', 'employee', 'driver', 'academics', 'group_admin', 'forum_user');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'PARENT', 'ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'RECEPTIONIST', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('ADMIN', 'DEVELOPER', 'VIEWER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "HostelType" AS ENUM ('BOYS', 'GIRLS', 'COED');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE');

-- CreateEnum
CREATE TYPE "HostelPaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "HostelPaymentMethod" AS ENUM ('CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "HostelAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE');

-- CreateEnum
CREATE TYPE "HostelComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('OCCUPIED', 'VACANT', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "BusMaintenanceAlertType" AS ENUM ('MILEAGE_BASED', 'TIME_BASED', 'CONDITION_BASED', 'PREDICTIVE');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'DEGRADED');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('MORNING', 'RETURN');

-- CreateEnum
CREATE TYPE "TripNotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "BusAttendanceStatus" AS ENUM ('BOARDED', 'ALIGHTED', 'MISSED');

-- CreateEnum
CREATE TYPE "ConcessionType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'FULL_WAIVER');

-- CreateEnum
CREATE TYPE "ConcessionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StudentLifecycleStatus" AS ENUM ('ACTIVE', 'ALUMNI', 'TRANSFERRED', 'DROPPED_OUT');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('FOUNDER_CEO', 'COFOUNDER_COO', 'CTO', 'CPO', 'CFO', 'BACKEND_ENGINEER', 'FRONTEND_ENGINEER', 'MOBILE_APP_DEVELOPER', 'FULL_STACK_DEVELOPER', 'AI_ML_ENGINEER', 'BLOCKCHAIN_ENGINEER', 'DEVOPS_ENGINEER', 'QA_ENGINEER', 'SECURITY_ENGINEER', 'PRODUCT_MANAGER', 'ASSOCIATE_PRODUCT_MANAGER', 'UI_UX_DESIGNER', 'UX_RESEARCHER', 'SALES_MANAGER', 'INSIDE_SALES_EXECUTIVE', 'FIELD_SALES_EXECUTIVE', 'PARTNERSHIP_MANAGER', 'MARKETING_MANAGER', 'DIGITAL_MARKETING_EXECUTIVE', 'CONTENT_WRITER', 'COMMUNITY_MANAGER', 'CUSTOMER_SUCCESS_MANAGER', 'IMPLEMENTATION_ENGINEER', 'SUPPORT_EXECUTIVE_L1', 'TECHNICAL_SUPPORT_L2_L3', 'TRAINING_ONBOARDING_SPECIALIST', 'SUPPORT', 'HR_MANAGER', 'HR_EXECUTIVE', 'RECRUITER', 'OPERATIONS_MANAGER', 'OFFICE_ADMIN', 'LEGAL_COMPLIANCE_OFFICER', 'ACCOUNTANT', 'FINANCE_EXECUTIVE', 'PAYROLL_MANAGER', 'GST_COMPLIANCE_EXECUTIVE', 'GOVERNMENT_CSR_LIAISON', 'INVESTOR_RELATIONS_MANAGER', 'GRANT_FUNDING_MANAGER');

-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StudentInvoiceStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'WAIVED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ADD', 'REMOVE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "paymentMethod" AS ENUM ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'ONLINE');

-- CreateEnum
CREATE TYPE "CompanyTransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "CompanyPaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'OTHER');

-- CreateEnum
CREATE TYPE "FinanceTransactionType" AS ENUM ('DEMAND_GENERATION', 'PAYMENT_COLLECTION', 'CHEQUE_CLEARANCE', 'CHEQUE_BOUNCE', 'REFUND', 'ADJUSTMENT', 'REVERSAL', 'CONCESSION');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'ONLINE', 'NEFT', 'RTGS', 'DD');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChequeStatus" AS ENUM ('PENDING_CLEARANCE', 'CLEARED', 'BOUNCED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SalaryPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PAID', 'UNPAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('REGULAR', 'FINE');

-- CreateEnum
CREATE TYPE "MessAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('HOME_VISIT', 'MEDICAL', 'EMERGENCY', 'OUTING');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "isLeaveApproved" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('FULL_DAY', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('BOOK', 'MAGAZINE', 'COMIC');

-- CreateEnum
CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'ISSUED', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('BUG', 'STORY', 'TASK', 'EPIC', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('ISSUED', 'RETURNED', 'OVERDUE', 'LOST');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'FILE');

-- CreateEnum
CREATE TYPE "TaskNotificationType" AS ENUM ('UPDATED', 'COMMENTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationTrigger" AS ENUM ('STUDENT_ABSENT', 'FEE_PAID', 'FEE_DUE', 'HOLIDAY', 'EVENT', 'STUDENT_REGISTRATION', 'CUSTOM', 'TEACHER_REGISTRATION');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "CouponScope" AS ENUM ('GLOBAL', 'SPECIFIC_PLAN', 'SPECIFIC_FEATURE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PlanModelType" AS ENUM ('MODEL_A', 'MODEL_B');

-- CreateEnum
CREATE TYPE "SubscriptionFeatureStatus" AS ENUM ('ENABLED', 'DISABLED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('INITIATED', 'DOCS_PENDING', 'SETUP_IN_PROGRESS', 'TRAINING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('PENDING', 'ACTIVE', 'SHIFTED', 'LEFT', 'REJECTED');

-- CreateEnum
CREATE TYPE "MessType" AS ENUM ('VEG', 'NON_VEG', 'SPECIAL_DIET');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "DoubtStatus" AS ENUM ('OPEN', 'ANSWERED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DoubtPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('MARRIED', 'UNMARRIED', 'DIVORCED', 'SINGLE');

-- CreateEnum
CREATE TYPE "TodoStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('ALL', 'STUDENTS', 'STAFFS');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('CELEBRATION', 'TRAINING', 'MEETING', 'HOLIDAYS', 'CAMP');

-- CreateEnum
CREATE TYPE "discountType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "NewspaperStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TimelineAction" AS ENUM ('STATUS_CHANGE', 'ASSIGNEE_CHANGE', 'EDIT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "BehaviorIncidentType" AS ENUM ('SPEED_VIOLATION', 'HARSH_BRAKING', 'HARSH_ACCELERATION', 'ROUTE_DEVIATION', 'IDLE_TIME_EXCEEDED', 'RAPID_LANE_CHANGE');

-- CreateEnum
CREATE TYPE "BehaviorSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RegistrationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'CERTIFICATE', 'REPORT_CARD');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('STUDENT_ID', 'TEACHER_ID', 'BONAFIDE', 'NOC', 'TRANSFER', 'CHARACTER', 'EXPERIENCE', 'SALARY', 'ADMISSION', 'HOSTEL', 'SPORTS', 'SCHOLARSHIP', 'STAFF_ID', 'ACHIEVEMENT', 'FINAL_EXAM', 'TERM_REPORT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'NEGOTIATION', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "DemoStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "KPIType" AS ENUM ('LEADS_GENERATED', 'DEMOS_COMPLETED', 'SCHOOLS_ONBOARDED', 'TICKETS_RESOLVED', 'SALES_REVENUE');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('STUDENT', 'TEACHER', 'STAFF', 'OTHER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'AVAILABLE', 'FULFILLED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('PROMOTED', 'REPEATED', 'TRANSFERRED', 'DROPPED_OUT', 'GRADUATED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "LmsAccountType" AS ENUM ('ADMIN', 'STUDENT', 'INSTRUCTOR');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AppModule" AS ENUM ('SMS', 'LMS', 'AI');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TRIAL', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" TEXT,
    "email_address" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "profile_picture" TEXT,
    "password_hash" TEXT,
    "street_address" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "state_name" TEXT NOT NULL,
    "country_name" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "blood_type" TEXT NOT NULL,
    "gender" "UserSex" NOT NULL,
    "school_id" TEXT,
    "user_reputation" INTEGER NOT NULL DEFAULT 0,
    "reward_coins" INTEGER NOT NULL DEFAULT 0,
    "redeemed_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacher_id" TEXT,
    "student_id" TEXT,
    "parent_id" TEXT,
    "library_id" TEXT,
    "hostel_id" TEXT,
    "transport_id" TEXT,
    "account_id" TEXT,
    "employee_type" "EmployeeType",
    "department_id" TEXT,
    "designation_id" TEXT,
    "user_role" "Role" NOT NULL DEFAULT 'superadmin',
    "lastOnline" TIMESTAMP(3),
    "sidebar_preferences" JSONB,
    "school_group_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "lmsAccountType" "LmsAccountType",
    "active" BOOLEAN DEFAULT true,
    "approved" BOOLEAN DEFAULT true,
    "image" TEXT,
    "token" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "token_id" SERIAL NOT NULL,
    "reset_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "refresh_token_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("refresh_token_id")
);

-- CreateTable
CREATE TABLE "EventRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EventRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumUserProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "education_level" TEXT,
    "subjects_expertise" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumUserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" SERIAL NOT NULL,
    "guid" TEXT NOT NULL,
    "user_id" VARCHAR(255),
    "module_name" VARCHAR(255) NOT NULL,
    "module_permission" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_accounts" (
    "account_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "account_code" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "UserLoginLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "school_name" TEXT NOT NULL,
    "school_logo" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "school_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "lunch_end" TEXT DEFAULT '13:00',
    "lunch_start" TEXT DEFAULT '12:00',
    "period_duration" INTEGER NOT NULL DEFAULT 45,
    "school_closing" TEXT DEFAULT '16:00',
    "school_opening" TEXT DEFAULT '08:00',
    "group_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fcm_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device_info" TEXT,
    "school_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcm_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_logs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "target_type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "school_id" TEXT NOT NULL,
    "sent_by" TEXT NOT NULL,
    "trigger" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_versions" (
    "id" TEXT NOT NULL,
    "current_version" TEXT NOT NULL,
    "minimum_version" TEXT NOT NULL,
    "download_url" TEXT NOT NULL,
    "whats_new" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "app_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_groups" (
    "group_id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "group_logo" TEXT,
    "owner_id" TEXT NOT NULL,
    "branch_limit" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "school_groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "depatment_name" TEXT NOT NULL,
    "department_description" TEXT,
    "school_id" TEXT NOT NULL,
    "department_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "designation_id" TEXT NOT NULL,
    "designation_name" TEXT NOT NULL,
    "designation_description" TEXT,
    "school_id" TEXT NOT NULL,
    "designation_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "designation_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("designation_id")
);

-- CreateTable
CREATE TABLE "school_feature_requests" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "school_id" VARCHAR(255) NOT NULL,
    "module_name" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_feature_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolExpense" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "invoice_number" TEXT,
    "payment_method" "paymentMethod" NOT NULL,
    "school_id" TEXT NOT NULL,
    "bill_url" TEXT,

    CONSTRAINT "SchoolExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolIncome" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "invoice_number" TEXT,
    "payment_method" "paymentMethod" NOT NULL,
    "bill_url" TEXT,

    CONSTRAINT "SchoolIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeGroup" (
    "fee_group_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeGroup_pkey" PRIMARY KEY ("fee_group_id")
);

-- CreateTable
CREATE TABLE "school_summary" (
    "summary_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "total_students" INTEGER NOT NULL DEFAULT 0,
    "active_students" INTEGER NOT NULL DEFAULT 0,
    "total_teachers" INTEGER NOT NULL DEFAULT 0,
    "active_teachers" INTEGER NOT NULL DEFAULT 0,
    "total_staff" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_expenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending_payments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active_subscriptions" INTEGER NOT NULL DEFAULT 0,
    "subscription_status" TEXT NOT NULL,
    "total_classes" INTEGER NOT NULL DEFAULT 0,
    "total_subjects" INTEGER NOT NULL DEFAULT 0,
    "total_exams" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_summary_pkey" PRIMARY KEY ("summary_id")
);

-- CreateTable
CREATE TABLE "school_subscription_configs" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "plan_model" "PlanModelType" NOT NULL DEFAULT 'MODEL_A',
    "allowed_users" INTEGER NOT NULL DEFAULT 300,
    "bonus_users" INTEGER NOT NULL DEFAULT 0,
    "extra_user_price" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "grace_period_days" INTEGER NOT NULL DEFAULT 7,
    "is_read_only_after_grace" BOOLEAN NOT NULL DEFAULT true,
    "auto_suspend_after_grace" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_subscription_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_feature_configs" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "feature_name" TEXT NOT NULL,
    "status" "SubscriptionFeatureStatus" NOT NULL DEFAULT 'DISABLED',
    "monthly_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activated_on" TIMESTAMP(3),
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_feature_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolOnboarding" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'INITIATED',
    "assignedToId" TEXT,
    "steps" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "classId" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "marks_from" DOUBLE PRECISION NOT NULL,
    "marks_upto" DOUBLE PRECISION NOT NULL,
    "grade_point" DOUBLE PRECISION NOT NULL,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "room_number" TEXT,
    "class_name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "school_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ActiveStatus" DEFAULT 'ACTIVE',
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "day" "Day" NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT,
    "teacher_id" TEXT,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableDraft" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimetableDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "attachment" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roadmap_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassLeaderboard" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "academic_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentView" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "academic_year_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("academic_year_id")
);

-- CreateTable
CREATE TABLE "class_summary" (
    "summary_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "total_students" INTEGER NOT NULL DEFAULT 0,
    "active_students" INTEGER NOT NULL DEFAULT 0,
    "inactive_students" INTEGER NOT NULL DEFAULT 0,
    "average_attendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_attendance_days" INTEGER NOT NULL DEFAULT 0,
    "upcoming_exams" INTEGER NOT NULL DEFAULT 0,
    "completed_exams" INTEGER NOT NULL DEFAULT 0,
    "pending_assignments" INTEGER NOT NULL DEFAULT 0,
    "completed_assignments" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_summary_pkey" PRIMARY KEY ("summary_id")
);

-- CreateTable
CREATE TABLE "StudentAcademicRecord" (
    "id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "roll_number" TEXT NOT NULL,
    "promotion_status" "PromotionStatus" NOT NULL DEFAULT 'PROMOTED',
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT,

    CONSTRAINT "StudentAcademicRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hostel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HostelType" NOT NULL,
    "school_id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "address" TEXT,
    "warden_id" TEXT,
    "rules" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostel_id" TEXT NOT NULL,

    CONSTRAINT "HostelBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelFloor" (
    "id" TEXT NOT NULL,
    "floor_number" INTEGER NOT NULL,
    "name" TEXT,
    "block_id" TEXT NOT NULL,

    CONSTRAINT "HostelFloor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelRoom" (
    "id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "type" "RoomType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "has_ac" BOOLEAN NOT NULL DEFAULT false,
    "base_rent" DOUBLE PRECISION NOT NULL,
    "floor_id" TEXT NOT NULL,

    CONSTRAINT "HostelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelBed" (
    "id" TEXT NOT NULL,
    "bed_number" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "HostelBed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelAllocation" (
    "id" TEXT NOT NULL,
    "hostel_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "bed_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "AllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "HostelAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccommodationRequest" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "hostel_id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "AccommodationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelExpense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hostel_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelFee" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,
    "hostel_id" TEXT NOT NULL,
    "status" "FeeStatus" NOT NULL DEFAULT 'UNPAID',
    "type" "FeeType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "RoomType" NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'VACANT',
    "hostel_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transport" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Transport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL,
    "bus_number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "current_lat" DOUBLE PRECISION,
    "current_lng" DOUBLE PRECISION,
    "license" TEXT NOT NULL,
    "bus_id" TEXT,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_location_id" TEXT,
    "route_active" BOOLEAN NOT NULL DEFAULT false,
    "device_id" TEXT,
    "push_token" TEXT,
    "profile_photo" TEXT,
    "license_photo" TEXT,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLocation" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverNotification" (
    "notification_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "notification_content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverNotification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "Conductor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bus_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conductor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bus_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusStop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "route_id" TEXT,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickUpPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickUpPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusAttendance" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "bus_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BusAttendanceStatus" NOT NULL DEFAULT 'BOARDED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trip_id" TEXT,

    CONSTRAINT "BusAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "route_id" TEXT,
    "bus_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "status" "TripStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_degraded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TripType" NOT NULL DEFAULT 'MORNING',

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripStop" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "bus_stop_id" TEXT NOT NULL,
    "stop_latitude" DOUBLE PRECISION NOT NULL,
    "stop_longitude" DOUBLE PRECISION NOT NULL,
    "is_notified" BOOLEAN NOT NULL DEFAULT false,
    "is_arrived" BOOLEAN NOT NULL DEFAULT false,
    "arrived_at" TIMESTAMP(3),
    "expected_arrival" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripLocation" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripNotification" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT,
    "event_type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TripNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "webhook_url" TEXT,
    "webhook_sent" BOOLEAN NOT NULL DEFAULT false,
    "webhook_response" JSONB,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverBehaviorIncident" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "trip_id" TEXT,
    "school_id" TEXT NOT NULL,
    "incident_type" "BehaviorIncidentType" NOT NULL,
    "severity" "BehaviorSeverity" NOT NULL DEFAULT 'MEDIUM',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "actual_value" DOUBLE PRECISION,
    "duration_seconds" INTEGER,
    "expected_route_id" TEXT,
    "deviation_distance" DOUBLE PRECISION,
    "notified_admin" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverBehaviorIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverPerformanceScore" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "safety_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "punctuality_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "efficiency_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "compliance_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "total_trips" INTEGER NOT NULL DEFAULT 0,
    "total_distance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_duration" INTEGER NOT NULL DEFAULT 0,
    "incidents_count" INTEGER NOT NULL DEFAULT 0,
    "on_time_percentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "average_speed" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverPerformanceScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteOptimization" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "optimization_type" TEXT NOT NULL,
    "original_distance" DOUBLE PRECISION NOT NULL,
    "original_duration" INTEGER NOT NULL,
    "original_stop_count" INTEGER NOT NULL,
    "optimized_distance" DOUBLE PRECISION NOT NULL,
    "optimized_duration" INTEGER NOT NULL,
    "optimized_stop_order" JSONB NOT NULL,
    "estimated_savings" DOUBLE PRECISION NOT NULL,
    "traffic_conditions" TEXT,
    "weather_conditions" TEXT,
    "is_applied" BOOLEAN NOT NULL DEFAULT false,
    "applied_at" TIMESTAMP(3),
    "applied_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteOptimization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportAnalytics" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL,
    "total_buses" INTEGER NOT NULL DEFAULT 0,
    "active_buses" INTEGER NOT NULL DEFAULT 0,
    "bus_utilization_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_routes" INTEGER NOT NULL DEFAULT 0,
    "active_routes" INTEGER NOT NULL DEFAULT 0,
    "total_distance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "average_route_distance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_trips" INTEGER NOT NULL DEFAULT 0,
    "completed_trips" INTEGER NOT NULL DEFAULT 0,
    "on_time_trips" INTEGER NOT NULL DEFAULT 0,
    "delayed_trips" INTEGER NOT NULL DEFAULT 0,
    "on_time_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_students" INTEGER NOT NULL DEFAULT 0,
    "students_boarded" INTEGER NOT NULL DEFAULT 0,
    "students_alighted" INTEGER NOT NULL DEFAULT 0,
    "average_boarding_time" DOUBLE PRECISION,
    "total_drivers" INTEGER NOT NULL DEFAULT 0,
    "active_drivers" INTEGER NOT NULL DEFAULT 0,
    "average_driver_score" DOUBLE PRECISION,
    "total_incidents" INTEGER NOT NULL DEFAULT 0,
    "estimated_fuel_cost" DOUBLE PRECISION,
    "maintenance_cost" DOUBLE PRECISION,
    "total_cost" DOUBLE PRECISION,
    "cost_per_student" DOUBLE PRECISION,
    "cost_per_km" DOUBLE PRECISION,
    "route_efficiency" JSONB,
    "driver_performance" JSONB,
    "time_distribution" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusMaintenanceAlert" (
    "id" TEXT NOT NULL,
    "bus_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "alert_type" "BusMaintenanceAlertType" NOT NULL,
    "severity" "BehaviorSeverity" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "predicted_issue" TEXT,
    "predicted_date" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION,
    "current_mileage" DOUBLE PRECISION,
    "days_since_service" INTEGER,
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusMaintenanceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionCounter" (
    "school_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "next_seq" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "AdmissionCounter_pkey" PRIMARY KEY ("school_id","academic_year")
);

-- CreateTable
CREATE TABLE "StudentRemark" (
    "id" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentRemark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "admission_no" TEXT NOT NULL,
    "admission_date" TIMESTAMP(3) NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "religion" TEXT,
    "category" TEXT,
    "caste" TEXT,
    "mother_tongue" TEXT,
    "languages_known" TEXT NOT NULL,
    "father_name" TEXT NOT NULL,
    "father_email" TEXT,
    "father_phone" TEXT NOT NULL,
    "father_occupation" TEXT NOT NULL,
    "mother_name" TEXT NOT NULL,
    "mother_email" TEXT,
    "mother_phone" TEXT NOT NULL,
    "mother_occupation" TEXT,
    "guardian_name" TEXT NOT NULL,
    "guardian_relation" TEXT NOT NULL,
    "guardian_email" TEXT NOT NULL,
    "guardian_phone" TEXT NOT NULL,
    "guardian_occupation" TEXT NOT NULL,
    "guardian_address" TEXT NOT NULL,
    "are_siblings_studying" TEXT NOT NULL,
    "sibling_name" TEXT NOT NULL,
    "sibling_class" TEXT NOT NULL,
    "sibling_roll_no" TEXT NOT NULL,
    "sibling_admission_no" TEXT NOT NULL,
    "current_address" TEXT NOT NULL,
    "permanent_address" TEXT NOT NULL,
    "vehicle_number" TEXT,
    "route_id" TEXT,
    "bus_pickup_point" TEXT,
    "bus_stop_id" TEXT,
    "hostel_name" TEXT,
    "room_number" TEXT,
    "medical_certificate" TEXT NOT NULL,
    "transfer_certificate" TEXT NOT NULL,
    "medical_condition" TEXT NOT NULL,
    "allergies" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "school_name" TEXT,
    "address" TEXT,
    "school_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bus_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "classId" TEXT,
    "status" "StudentLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEvaluation" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "feedback" TEXT,
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_promotions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fromClassId" TEXT NOT NULL,
    "toClassId" TEXT NOT NULL,
    "fromSection" TEXT NOT NULL,
    "toSection" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "toSession" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentFaceData" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "face_image_url" TEXT NOT NULL,
    "face_embedding" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentFaceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concession" (
    "concession_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_fee_plan_id" TEXT NOT NULL,
    "fee_head_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "concession_type" "ConcessionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ConcessionStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concession_pkey" PRIMARY KEY ("concession_id")
);

-- CreateTable
CREATE TABLE "StudentRegistrationLink" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_admin_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRegistrationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRegistrationRequest" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT,
    "registration_link_id" TEXT NOT NULL,
    "form_data" JSONB NOT NULL,
    "status" "RegistrationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "admin_remark" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by_admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'parent',
    "password" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "date_of_join" TIMESTAMP(3),
    "father_name" TEXT NOT NULL,
    "mother_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "marital_status" "MaritalStatus" NOT NULL,
    "languages_known" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "work_experience" TEXT NOT NULL,
    "previous_school" TEXT NOT NULL,
    "previous_school_address" TEXT NOT NULL,
    "previous_school_phone" TEXT NOT NULL,
    "pan_number" TEXT,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "salary" INTEGER NOT NULL,
    "contract_type" TEXT DEFAULT 'Full Time',
    "date_of_payment" TIMESTAMP(3),
    "medical_leave" TEXT,
    "casual_leave" TEXT,
    "maternity_leave" TEXT,
    "sick_leave" TEXT,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "ifsc_code" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "route" TEXT,
    "hostel_name" TEXT,
    "room_number" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "face_image" TEXT,
    "resume" TEXT NOT NULL,
    "joining_letter" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "teacher_school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAttendance" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "face_matched" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendance_type" "AttendanceType" NOT NULL DEFAULT 'FULL_DAY',
    "attendance_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendance_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "selfie_image_url" TEXT,
    "verification_latency_ms" INTEGER,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherFaceData" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "face_image_url" TEXT NOT NULL,
    "face_embedding" BYTEA NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherFaceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employee_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_type" "EmployeeType" NOT NULL,
    "company" TEXT NOT NULL,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "department_id" TEXT,
    "designation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "employee_document_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("employee_document_id")
);

-- CreateTable
CREATE TABLE "Incharge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAttendance" (
    "employee_attendance_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "punch_in" TIMESTAMP(3),
    "punch_out" TIMESTAMP(3),
    "working_hours" DOUBLE PRECISION,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "attendance_type" "AttendanceType" NOT NULL DEFAULT 'FULL_DAY',
    "is_late_entry" BOOLEAN NOT NULL DEFAULT false,
    "is_early_exit" BOOLEAN NOT NULL DEFAULT false,
    "overtime_hours" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAttendance_pkey" PRIMARY KEY ("employee_attendance_id")
);

-- CreateTable
CREATE TABLE "EmployeeKPI" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "KPIType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "target" DOUBLE PRECISION,
    "period" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duty" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assigned_to" TEXT,
    "hostel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Duty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "payroll_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "payroll_period_start" TIMESTAMP(3) NOT NULL,
    "payroll_period_end" TIMESTAMP(3) NOT NULL,
    "payroll_gross_salary" DOUBLE PRECISION NOT NULL,
    "payroll_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payroll_net_salary" DOUBLE PRECISION NOT NULL,
    "payroll_payment_date" TIMESTAMP(3),
    "payroll_status" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
    "payroll_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payroll_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("payroll_id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "transaction_id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "transaction_quantity" INTEGER NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" TEXT NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT,
    "payment_method" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failure_reason" TEXT,
    "school_id" TEXT,
    "plan_id" TEXT,
    "invoice_number" TEXT,
    "invoice_url" TEXT,
    "office_invoice_url" TEXT,
    "receipt_number" TEXT,
    "receipt_url" TEXT,
    "description" TEXT,
    "student_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "SalaryPayment" (
    "salary_payment_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "salary_amount" INTEGER NOT NULL,
    "salary_period" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" "paymentMethod" NOT NULL,
    "payment_status" "SalaryPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "SalaryPayment_pkey" PRIMARY KEY ("salary_payment_id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "feedback_id" TEXT NOT NULL,
    "feedback_title" TEXT NOT NULL,
    "feedback_description" TEXT NOT NULL,
    "feedback_status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "feedback_attachment" TEXT,
    "school_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "PaymentSecret" (
    "payment_secret_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "key_id" TEXT NOT NULL,
    "key_secret" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSecret_pkey" PRIMARY KEY ("payment_secret_id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coins_used" INTEGER NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueTransaction" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "book_copy_id" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "status" "IssueStatus" NOT NULL DEFAULT 'ISSUED',
    "fine_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FineLedger" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FineLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceCounter" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLog" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "downloaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeHead" (
    "fee_head_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "revenue_account_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "fee_type" "BillingType" NOT NULL DEFAULT 'RECURRING',
    "fee_frequency" "FeeFrequency" NOT NULL DEFAULT 'MONTHLY',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "is_concession_eligible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeHead_pkey" PRIMARY KEY ("fee_head_id")
);

-- CreateTable
CREATE TABLE "student_invoice_items" (
    "invoice_item_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "fee_head_id" TEXT NOT NULL,
    "billing_month" INTEGER,
    "billing_year" INTEGER,
    "gross_amount" DOUBLE PRECISION NOT NULL,
    "concession_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_amount" DOUBLE PRECISION NOT NULL,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "StudentInvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_invoice_items_pkey" PRIMARY KEY ("invoice_item_id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "fee_structure_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "class_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("fee_structure_id")
);

-- CreateTable
CREATE TABLE "FeeStructureHead" (
    "fee_structure_head_id" TEXT NOT NULL,
    "fee_structure_id" TEXT NOT NULL,
    "fee_head_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeStructureHead_pkey" PRIMARY KEY ("fee_structure_head_id")
);

-- CreateTable
CREATE TABLE "StudentFeePlan" (
    "student_fee_plan_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "fee_structure_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentFeePlan_pkey" PRIMARY KEY ("student_fee_plan_id")
);

-- CreateTable
CREATE TABLE "StudentFeePlanHead" (
    "student_fee_plan_head_id" TEXT NOT NULL,
    "student_fee_plan_id" TEXT NOT NULL,
    "fee_head_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentFeePlanHead_pkey" PRIMARY KEY ("student_fee_plan_head_id")
);

-- CreateTable
CREATE TABLE "FinanceLedger" (
    "ledger_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "student_id" TEXT,
    "transaction_group_id" TEXT NOT NULL,
    "debit_account_id" TEXT NOT NULL,
    "credit_account_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction_type" "FinanceTransactionType" NOT NULL,
    "reference_table" TEXT,
    "reference_id" TEXT,
    "payment_id" TEXT,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceLedger_pkey" PRIMARY KEY ("ledger_id")
);

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "payment_request_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "payment_id" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("payment_request_id")
);

-- CreateTable
CREATE TABLE "ChequeDetail" (
    "cheque_detail_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "cheque_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "cheque_date" TIMESTAMP(3) NOT NULL,
    "status" "ChequeStatus" NOT NULL DEFAULT 'PENDING_CLEARANCE',
    "cleared_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "bounce_reason" TEXT,
    "penalty_amount" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChequeDetail_pkey" PRIMARY KEY ("cheque_detail_id")
);

-- CreateTable
CREATE TABLE "CompanyTransaction" (
    "id" TEXT NOT NULL,
    "transactionType" "CompanyTransactionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentMode" "CompanyPaymentMode" NOT NULL,
    "sourceOrRecipient" TEXT NOT NULL,
    "category" TEXT,
    "billUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_income" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "payment_method" "paymentMethod" NOT NULL DEFAULT 'CASH',
    "attachment" TEXT,
    "invoice_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_expense" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "payment_method" "paymentMethod" NOT NULL DEFAULT 'CASH',
    "attachment" TEXT,
    "invoice_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_expense_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL,
    "student_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,

    CONSTRAINT "ExamAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL,
    "status" "AttendanceStatus" DEFAULT 'ABSENT',
    "student_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "isApproved" "isLeaveApproved" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "from_date" TIMESTAMP(3) NOT NULL,
    "to_date" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "admin_note" TEXT,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "from_day" TIMESTAMP(3),
    "to_day" TIMESTAMP(3),
    "holiday_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "school_id" TEXT NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "class_id" TEXT NOT NULL,
    "pass_mark" INTEGER,
    "total_marks" INTEGER,
    "duration" INTEGER,
    "room_number" INTEGER,
    "subject_id" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "exam_id" TEXT,
    "assignment_id" TEXT,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Library" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryPolicy" (
    "id" TEXT NOT NULL,
    "library_id" TEXT NOT NULL,
    "max_books_student" INTEGER NOT NULL DEFAULT 3,
    "max_books_teacher" INTEGER NOT NULL DEFAULT 5,
    "issue_days_student" INTEGER NOT NULL DEFAULT 7,
    "issue_days_teacher" INTEGER NOT NULL DEFAULT 14,
    "fine_per_day" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "fine_grace_period" INTEGER NOT NULL DEFAULT 0,
    "lost_book_penalty" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isbn" TEXT,
    "type" "BookType" NOT NULL DEFAULT 'BOOK',
    "library_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "category_id" TEXT,
    "cover_image" TEXT,
    "description" TEXT,
    "language" TEXT DEFAULT 'English',
    "publication_year" INTEGER,
    "publisher" TEXT,
    "status" "BookStatus" NOT NULL DEFAULT 'ACTIVE',
    "class_id" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0.0,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCopy" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "status" "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barcode" TEXT NOT NULL,
    "rack_location" TEXT,

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryMember" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "memberType" "MemberType" NOT NULL DEFAULT 'STUDENT',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookDamageLog" (
    "id" TEXT NOT NULL,
    "book_copy_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookDamageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryAuditLog" (
    "id" TEXT NOT NULL,
    "library_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_documents" (
    "id" TEXT NOT NULL,
    "document_no" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "issued_by_id" TEXT NOT NULL,
    "issued_data" JSONB NOT NULL,
    "qr_code_url" TEXT,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issued_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "inventory_item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_description" TEXT,
    "item_quantity" INTEGER NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("inventory_item_id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "room_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" TEXT NOT NULL,
    "fee_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "DisputeMessage" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "senderId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "groupId" TEXT,
    "forwardedFromId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfflineMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskNotification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "notification_type" "TaskNotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "name" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "content" TEXT NOT NULL,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "triggerEvent" "NotificationTrigger",
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "triggerEvent" "NotificationTrigger",
    "status" "NotificationStatus" NOT NULL,
    "channelUsed" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationChannel" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriggerNotification" (
    "id" TEXT NOT NULL,
    "triggerEvent" "NotificationTrigger" NOT NULL,
    "schoolId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TriggerNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "msg91_templates" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "notificationType" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "smsTemplateId" TEXT,
    "whatsappTemplateId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "msg91_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'GENERAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "template_description" TEXT,
    "template_type" "DocumentType" NOT NULL,
    "template_category" "DocumentCategory" NOT NULL,
    "template_content" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "school_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan" (
    "plan_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plan_price" INTEGER NOT NULL,
    "discounted_price" INTEGER,
    "duration_days" INTEGER NOT NULL,
    "user_limit" INTEGER NOT NULL,
    "branch_limit" INTEGER NOT NULL DEFAULT 1,
    "razorpay_plan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "subscription_id" TEXT NOT NULL,
    "razorpayInvoiceId" TEXT,
    "school_id" TEXT,
    "plan_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "payment_id" TEXT NOT NULL,
    "receipt" TEXT,
    "order_id" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_limit" INTEGER,
    "branch_limit" INTEGER,
    "razorpay_subscription_id" TEXT,
    "is_auto_renew_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coupon_id" TEXT,
    "school_group_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "CouponType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "scope" "CouponScope" NOT NULL DEFAULT 'GLOBAL',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "maxUsage" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "plan_id" TEXT,
    "feature_key" TEXT,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "coins_earned" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnhancementLeaderboard" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "enhancement_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnhancementLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_dashboard_summary" (
    "summary_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "total_attendance_days" INTEGER NOT NULL DEFAULT 0,
    "present_days" INTEGER NOT NULL DEFAULT 0,
    "absent_days" INTEGER NOT NULL DEFAULT 0,
    "late_days" INTEGER NOT NULL DEFAULT 0,
    "attendance_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending_fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overdue_fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_assignments" INTEGER NOT NULL DEFAULT 0,
    "completed_assignments" INTEGER NOT NULL DEFAULT 0,
    "pending_assignments" INTEGER NOT NULL DEFAULT 0,
    "overdue_assignments" INTEGER NOT NULL DEFAULT 0,
    "average_score" DOUBLE PRECISION,
    "total_exams" INTEGER NOT NULL DEFAULT 0,
    "passed_exams" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_dashboard_summary_pkey" PRIMARY KEY ("summary_id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "userId" TEXT,
    "ip" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "requestHeaders" TEXT,
    "requestQuery" TEXT,
    "requestBody" TEXT,
    "responseBody" TEXT,
    "errorStack" TEXT,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "userAgent" TEXT,
    "deviceInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineLog" (
    "timeline_log_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "action" "TimelineAction" NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineLog_pkey" PRIMARY KEY ("timeline_log_id")
);

-- CreateTable
CREATE TABLE "ModuleUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "deviceType" TEXT NOT NULL,
    "duration" INTEGER,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticket_id" TEXT NOT NULL,
    "ticket_number" SERIAL NOT NULL,
    "ticket_title" TEXT NOT NULL,
    "ticket_description" TEXT NOT NULL,
    "ticket_category" TEXT,
    "ticket_status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "ticket_priority" "TicketPriority" NOT NULL DEFAULT 'LOW',
    "ticket_attachment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "school_id" TEXT,
    "user_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "employee_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "Todo" (
    "todo_id" TEXT NOT NULL,
    "todo_title" TEXT NOT NULL,
    "todo_description" TEXT NOT NULL,
    "todo_status" "TodoStatus" NOT NULL DEFAULT 'PENDING',
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("todo_id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "attachment" TEXT,
    "targetAudience" "TargetAudience" NOT NULL DEFAULT 'ALL',
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "announcement_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "class_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "purpose" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "entry_time" TIMESTAMP(3),
    "exit_time" TIMESTAMP(3),
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "class_id" TEXT,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doubt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chapter" TEXT,
    "difficulty" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "priority" "DoubtPriority" NOT NULL DEFAULT 'LOW',
    "status" "DoubtStatus" NOT NULL DEFAULT 'OPEN',
    "attachment_url" TEXT,

    CONSTRAINT "Doubt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PYQ" (
    "id" TEXT NOT NULL,
    "question" TEXT,
    "solution" TEXT,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "PYQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtReply" (
    "id" TEXT NOT NULL,
    "doubt_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" "Role" NOT NULL,
    "reply_content" TEXT NOT NULL,
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DoubtReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "coins_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "end_date" TIMESTAMP(3) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "start_date" TIMESTAMP(3) NOT NULL,
    "subject_id" TEXT NOT NULL,
    "time_limit" INTEGER NOT NULL DEFAULT 30,
    "title" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" TEXT[],
    "correct_answer" TEXT NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Newspaper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "article_attachments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "class_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "instructions" TEXT,
    "subject_id" TEXT,
    "submission_type" TEXT NOT NULL DEFAULT 'SUMMARY',

    CONSTRAINT "Newspaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewspaperSubmission" (
    "id" TEXT NOT NULL,
    "newspaper_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback" TEXT,
    "score" INTEGER,
    "content" TEXT NOT NULL,

    CONSTRAINT "NewspaperSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationQueue" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReservationQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeWork" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "attachment" TEXT,
    "status" "HomeworkStatus" NOT NULL DEFAULT 'PENDING',
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkSubmission" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "homework_id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback" TEXT,
    "score" INTEGER,

    CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "noticeDate" TIMESTAMP(3) NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "attachment" TEXT,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeRecipient" (
    "id" SERIAL NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,

    CONSTRAINT "NoticeRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeReadStatus" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkView" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "homework_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeworkView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialPeriod" (
    "financial_period_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_by" TEXT,
    "locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialPeriod_pkey" PRIMARY KEY ("financial_period_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_key" TEXT NOT NULL,
    "project_description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "lead_id" TEXT,
    "project_type" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" TEXT NOT NULL,
    "task_title" TEXT NOT NULL,
    "task_description" TEXT NOT NULL,
    "checklist" JSONB,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "task_status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "stage_id" TEXT,
    "task_priority" "TaskPriority" NOT NULL DEFAULT 'LOW',
    "deadline" TIMESTAMP(3),
    "issue_type" "IssueType" NOT NULL DEFAULT 'TASK',
    "severity" INTEGER,
    "story_points" INTEGER,
    "project_id" TEXT NOT NULL,
    "sprint_id" TEXT,
    "assigned_to_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "parent_id" TEXT,
    "epic_id" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" TEXT NOT NULL,
    "comment_content" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "attachment_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "GitHubRepo" (
    "github_repo_id" TEXT NOT NULL,
    "repo_name" TEXT NOT NULL,
    "repo_url" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubRepo_pkey" PRIMARY KEY ("github_repo_id")
);

-- CreateTable
CREATE TABLE "GitHubBranch" (
    "github_branch_id" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "branch_url" TEXT NOT NULL,
    "pr_url" TEXT,
    "pr_status" TEXT,
    "task_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubBranch_pkey" PRIMARY KEY ("github_branch_id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "sprint_id" TEXT NOT NULL,
    "sprint_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("sprint_id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "workflow_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("workflow_id")
);

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "workflow_stage_id" TEXT NOT NULL,
    "stage_name" TEXT NOT NULL,
    "stage_order" INTEGER NOT NULL,
    "workflow_id" TEXT NOT NULL,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("workflow_stage_id")
);

-- CreateTable
CREATE TABLE "Epic" (
    "epic_id" TEXT NOT NULL,
    "epic_title" TEXT NOT NULL,
    "epic_description" TEXT,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Epic_pkey" PRIMARY KEY ("epic_id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "label_id" TEXT NOT NULL,
    "label_name" TEXT NOT NULL,
    "label_color" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("label_id")
);

-- CreateTable
CREATE TABLE "TaskLabel" (
    "task_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,

    CONSTRAINT "TaskLabel_pkey" PRIMARY KEY ("task_id","label_id")
);

-- CreateTable
CREATE TABLE "TaskWatcher" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskWatcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubToken" (
    "github_token_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubToken_pkey" PRIMARY KEY ("github_token_id")
);

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OtpToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCall" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "joinToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isEnded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCallParticipant" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ScheduledCallParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinRequest" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingStage" "OnboardingStatus",
    "address" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demo" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "DemoStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "conductedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meetingLink" TEXT,
    "userId" TEXT,

    CONSTRAINT "Demo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "hostel_id" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalEmergency" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,
    "hostel_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalEmergency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutpassRequest" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "from_date" TIMESTAMP(3) NOT NULL,
    "to_date" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutpassRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoMeta" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogImage" TEXT,
    "canonical" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_upload_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "school_id" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_upload_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "requirements" TEXT[],
    "perks" TEXT[],
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "resume_url" TEXT,
    "cover_letter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" TEXT,
    "about" TEXT,
    "contactNumber" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseDescription" TEXT NOT NULL,
    "whatYouWillLearn" TEXT,
    "price" DOUBLE PRECISION,
    "thumbnail" TEXT,
    "tag" TEXT[],
    "instructions" TEXT[],
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "instructorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSection" (
    "id" TEXT NOT NULL,
    "sectionName" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timeDuration" TEXT,
    "description" TEXT,
    "videoUrl" TEXT,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "SubSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingAndReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "RatingAndReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "completedVideos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "style" TEXT,
    "currentSceneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "AiStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiScene" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "actions" JSONB,
    "whiteboard" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAudioFile" (
    "id" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "format" TEXT NOT NULL,
    "text" TEXT,
    "voice" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiImageFile" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiImageFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatSession" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "config" JSONB NOT NULL,
    "toolCalls" JSONB NOT NULL,
    "pendingToolCalls" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sceneId" TEXT,
    "lastActionIndex" INTEGER,

    CONSTRAINT "AiChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiPlaybackState" (
    "stageId" TEXT NOT NULL,
    "sceneIndex" INTEGER NOT NULL,
    "actionIndex" INTEGER NOT NULL,
    "consumedDiscussions" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiPlaybackState_pkey" PRIMARY KEY ("stageId")
);

-- CreateTable
CREATE TABLE "AiStageOutline" (
    "stageId" TEXT NOT NULL,
    "outlines" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiStageOutline_pkey" PRIMARY KEY ("stageId")
);

-- CreateTable
CREATE TABLE "AiMediaFile" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "posterUrl" TEXT,
    "prompt" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "error" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGeneratedAgent" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGeneratedAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_module_subscriptions" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "module" "AppModule" NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "payment_reference" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SCHOOL_BASED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_module_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_module_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "module" "AppModule" NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "payment_reference" TEXT,
    "source" TEXT NOT NULL DEFAULT 'DIRECT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_module_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GradeToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GradeToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClassToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClassToGrade" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassToGrade_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClassToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SubjectToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RoomToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoomToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ParentToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ParentToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_StudentPayments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentPayments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AttendanceToBus" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AttendanceToBus_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventRoles" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventSections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventSections_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EnrolledStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EnrolledStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_address_key" ON "User"("email_address");

-- CreateIndex
CREATE INDEX "User_school_id_idx" ON "User"("school_id");

-- CreateIndex
CREATE INDEX "User_email_address_idx" ON "User"("email_address");

-- CreateIndex
CREATE INDEX "User_phone_number_idx" ON "User"("phone_number");

-- CreateIndex
CREATE INDEX "User_user_role_idx" ON "User"("user_role");

-- CreateIndex
CREATE INDEX "User_school_id_user_role_idx" ON "User"("school_id", "user_role");

-- CreateIndex
CREATE INDEX "User_school_id_is_deleted_user_role_idx" ON "User"("school_id", "is_deleted", "user_role");

-- CreateIndex
CREATE INDEX "User_created_at_idx" ON "User"("created_at");

-- CreateIndex
CREATE INDEX "User_full_name_idx" ON "User"("full_name");

-- CreateIndex
CREATE INDEX "User_is_deleted_idx" ON "User"("is_deleted");

-- CreateIndex
CREATE INDEX "User_is_deleted_user_role_idx" ON "User"("is_deleted", "user_role");

-- CreateIndex
CREATE INDEX "User_lastOnline_idx" ON "User"("lastOnline");

-- CreateIndex
CREATE INDEX "User_state_name_idx" ON "User"("state_name");

-- CreateIndex
CREATE INDEX "User_teacher_id_idx" ON "User"("teacher_id");

-- CreateIndex
CREATE INDEX "User_student_id_idx" ON "User"("student_id");

-- CreateIndex
CREATE INDEX "User_parent_id_idx" ON "User"("parent_id");

-- CreateIndex
CREATE INDEX "User_department_id_idx" ON "User"("department_id");

-- CreateIndex
CREATE INDEX "User_designation_id_idx" ON "User"("designation_id");

-- CreateIndex
CREATE INDEX "User_school_group_id_idx" ON "User"("school_group_id");

-- CreateIndex
CREATE INDEX "User_library_id_idx" ON "User"("library_id");

-- CreateIndex
CREATE INDEX "User_transport_id_idx" ON "User"("transport_id");

-- CreateIndex
CREATE INDEX "User_account_id_idx" ON "User"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_reset_token_key" ON "PasswordResetToken"("reset_token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expires_at_idx" ON "PasswordResetToken"("expires_at");

-- CreateIndex
CREATE INDEX "PasswordResetToken_user_id_idx" ON "PasswordResetToken"("user_id");

-- CreateIndex
CREATE INDEX "PasswordResetToken_reset_token_idx" ON "PasswordResetToken"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_refresh_token_key" ON "RefreshToken"("refresh_token");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "RefreshToken"("user_id");

-- CreateIndex
CREATE INDEX "RefreshToken_refresh_token_idx" ON "RefreshToken"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "ForumUserProfile_user_id_key" ON "ForumUserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_user_id_key" ON "Account"("user_id");

-- CreateIndex
CREATE INDEX "Account_school_id_idx" ON "Account"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_guid_key" ON "user_permissions"("guid");

-- CreateIndex
CREATE INDEX "user_permissions_user_id_idx" ON "user_permissions"("user_id");

-- CreateIndex
CREATE INDEX "user_permissions_module_name_idx" ON "user_permissions"("module_name");

-- CreateIndex
CREATE INDEX "user_permissions_status_idx" ON "user_permissions"("status");

-- CreateIndex
CREATE INDEX "finance_accounts_school_id_academic_year_id_account_type_idx" ON "finance_accounts"("school_id", "academic_year_id", "account_type");

-- CreateIndex
CREATE INDEX "finance_accounts_is_system_idx" ON "finance_accounts"("is_system");

-- CreateIndex
CREATE UNIQUE INDEX "finance_accounts_school_id_academic_year_id_account_code_key" ON "finance_accounts"("school_id", "academic_year_id", "account_code");

-- CreateIndex
CREATE INDEX "UserLoginLog_userId_idx" ON "UserLoginLog"("userId");

-- CreateIndex
CREATE INDEX "UserLoginLog_role_idx" ON "UserLoginLog"("role");

-- CreateIndex
CREATE INDEX "UserLoginLog_timestamp_idx" ON "UserLoginLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "School_school_code_key" ON "School"("school_code");

-- CreateIndex
CREATE UNIQUE INDEX "School_user_id_key" ON "School"("user_id");

-- CreateIndex
CREATE INDEX "School_is_active_idx" ON "School"("is_active");

-- CreateIndex
CREATE INDEX "School_is_deleted_idx" ON "School"("is_deleted");

-- CreateIndex
CREATE INDEX "School_created_at_idx" ON "School"("created_at");

-- CreateIndex
CREATE INDEX "School_school_name_idx" ON "School"("school_name");

-- CreateIndex
CREATE INDEX "School_school_code_idx" ON "School"("school_code");

-- CreateIndex
CREATE INDEX "School_user_id_idx" ON "School"("user_id");

-- CreateIndex
CREATE INDEX "School_group_id_idx" ON "School"("group_id");

-- CreateIndex
CREATE INDEX "School_is_active_is_deleted_created_at_idx" ON "School"("is_active", "is_deleted", "created_at");

-- CreateIndex
CREATE INDEX "School_school_name_is_active_is_deleted_idx" ON "School"("school_name", "is_active", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "fcm_tokens_token_key" ON "fcm_tokens"("token");

-- CreateIndex
CREATE INDEX "fcm_tokens_school_id_idx" ON "fcm_tokens"("school_id");

-- CreateIndex
CREATE INDEX "fcm_tokens_user_id_user_type_idx" ON "fcm_tokens"("user_id", "user_type");

-- CreateIndex
CREATE INDEX "fcm_tokens_school_id_user_type_idx" ON "fcm_tokens"("school_id", "user_type");

-- CreateIndex
CREATE INDEX "fcm_tokens_school_id_is_active_idx" ON "fcm_tokens"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "push_notification_logs_school_id_idx" ON "push_notification_logs"("school_id");

-- CreateIndex
CREATE INDEX "push_notification_logs_school_id_created_at_idx" ON "push_notification_logs"("school_id", "created_at");

-- CreateIndex
CREATE INDEX "push_notification_logs_trigger_idx" ON "push_notification_logs"("trigger");

-- CreateIndex
CREATE UNIQUE INDEX "school_groups_owner_id_key" ON "school_groups"("owner_id");

-- CreateIndex
CREATE INDEX "school_groups_owner_id_idx" ON "school_groups"("owner_id");

-- CreateIndex
CREATE INDEX "school_groups_is_deleted_idx" ON "school_groups"("is_deleted");

-- CreateIndex
CREATE INDEX "school_groups_group_name_idx" ON "school_groups"("group_name");

-- CreateIndex
CREATE INDEX "Department_school_id_idx" ON "Department"("school_id");

-- CreateIndex
CREATE INDEX "Department_school_id_department_created_at_idx" ON "Department"("school_id", "department_created_at");

-- CreateIndex
CREATE INDEX "Designation_school_id_idx" ON "Designation"("school_id");

-- CreateIndex
CREATE INDEX "Designation_school_id_designation_created_at_idx" ON "Designation"("school_id", "designation_created_at");

-- CreateIndex
CREATE INDEX "school_feature_requests_school_id_idx" ON "school_feature_requests"("school_id");

-- CreateIndex
CREATE INDEX "school_feature_requests_user_id_idx" ON "school_feature_requests"("user_id");

-- CreateIndex
CREATE INDEX "school_feature_requests_module_name_idx" ON "school_feature_requests"("module_name");

-- CreateIndex
CREATE INDEX "SchoolExpense_school_id_idx" ON "SchoolExpense"("school_id");

-- CreateIndex
CREATE INDEX "SchoolExpense_category_id_idx" ON "SchoolExpense"("category_id");

-- CreateIndex
CREATE INDEX "SchoolExpense_date_idx" ON "SchoolExpense"("date");

-- CreateIndex
CREATE INDEX "SchoolExpense_school_id_date_idx" ON "SchoolExpense"("school_id", "date");

-- CreateIndex
CREATE INDEX "SchoolExpenseCategory_school_id_idx" ON "SchoolExpenseCategory"("school_id");

-- CreateIndex
CREATE INDEX "SchoolIncome_school_id_idx" ON "SchoolIncome"("school_id");

-- CreateIndex
CREATE INDEX "SchoolIncome_date_idx" ON "SchoolIncome"("date");

-- CreateIndex
CREATE INDEX "SchoolIncome_school_id_date_idx" ON "SchoolIncome"("school_id", "date");

-- CreateIndex
CREATE INDEX "Group_ownerId_idx" ON "Group"("ownerId");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "school_summary_school_id_key" ON "school_summary"("school_id");

-- CreateIndex
CREATE INDEX "school_summary_school_id_idx" ON "school_summary"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_subscription_configs_school_id_key" ON "school_subscription_configs"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_feature_configs_school_id_feature_name_key" ON "school_feature_configs"("school_id", "feature_name");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolOnboarding_schoolId_key" ON "SchoolOnboarding"("schoolId");

-- CreateIndex
CREATE INDEX "Section_classId_idx" ON "Section"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_classId_name_key" ON "Section"("classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_level_key" ON "Grade"("level");

-- CreateIndex
CREATE INDEX "Class_school_id_idx" ON "Class"("school_id");

-- CreateIndex
CREATE INDEX "Class_school_id_class_name_idx" ON "Class"("school_id", "class_name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_school_id_class_name_key" ON "Class"("school_id", "class_name");

-- CreateIndex
CREATE INDEX "Subject_school_id_idx" ON "Subject"("school_id");

-- CreateIndex
CREATE INDEX "Subject_class_id_idx" ON "Subject"("class_id");

-- CreateIndex
CREATE INDEX "Subject_school_id_class_id_idx" ON "Subject"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "Subject_status_idx" ON "Subject"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_class_id_name_key" ON "Subject"("class_id", "name");

-- CreateIndex
CREATE INDEX "Lesson_class_id_idx" ON "Lesson"("class_id");

-- CreateIndex
CREATE INDEX "Lesson_section_id_idx" ON "Lesson"("section_id");

-- CreateIndex
CREATE INDEX "Lesson_subject_id_idx" ON "Lesson"("subject_id");

-- CreateIndex
CREATE INDEX "Lesson_teacher_id_idx" ON "Lesson"("teacher_id");

-- CreateIndex
CREATE INDEX "Lesson_day_idx" ON "Lesson"("day");

-- CreateIndex
CREATE INDEX "Lesson_class_id_day_idx" ON "Lesson"("class_id", "day");

-- CreateIndex
CREATE INDEX "Lesson_section_id_day_idx" ON "Lesson"("section_id", "day");

-- CreateIndex
CREATE INDEX "Assignment_class_id_idx" ON "Assignment"("class_id");

-- CreateIndex
CREATE INDEX "Assignment_section_id_idx" ON "Assignment"("section_id");

-- CreateIndex
CREATE INDEX "Assignment_subject_id_idx" ON "Assignment"("subject_id");

-- CreateIndex
CREATE INDEX "Assignment_lesson_id_idx" ON "Assignment"("lesson_id");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "Assignment"("status");

-- CreateIndex
CREATE INDEX "Assignment_due_date_idx" ON "Assignment"("due_date");

-- CreateIndex
CREATE INDEX "Assignment_class_id_due_date_idx" ON "Assignment"("class_id", "due_date");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_student_id_idx" ON "AssignmentSubmission"("student_id");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_assignment_id_idx" ON "AssignmentSubmission"("assignment_id");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_submitted_at_idx" ON "AssignmentSubmission"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_student_id_assignment_id_key" ON "AssignmentSubmission"("student_id", "assignment_id");

-- CreateIndex
CREATE INDEX "Topic_roadmap_id_idx" ON "Topic"("roadmap_id");

-- CreateIndex
CREATE INDEX "Topic_is_completed_idx" ON "Topic"("is_completed");

-- CreateIndex
CREATE UNIQUE INDEX "ClassLeaderboard_student_id_key" ON "ClassLeaderboard"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentView_student_id_assignment_id_key" ON "AssignmentView"("student_id", "assignment_id");

-- CreateIndex
CREATE INDEX "AcademicYear_school_id_is_active_idx" ON "AcademicYear"("school_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_school_id_year_key" ON "AcademicYear"("school_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "class_summary_class_id_key" ON "class_summary"("class_id");

-- CreateIndex
CREATE INDEX "class_summary_school_id_idx" ON "class_summary"("school_id");

-- CreateIndex
CREATE INDEX "class_summary_class_id_idx" ON "class_summary"("class_id");

-- CreateIndex
CREATE INDEX "class_summary_school_id_class_id_idx" ON "class_summary"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_student_id_idx" ON "StudentAcademicRecord"("student_id");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_class_id_idx" ON "StudentAcademicRecord"("class_id");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_section_id_idx" ON "StudentAcademicRecord"("section_id");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_academic_year_idx" ON "StudentAcademicRecord"("academic_year");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_student_id_class_id_idx" ON "StudentAcademicRecord"("student_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAcademicRecord_student_id_academic_year_key" ON "StudentAcademicRecord"("student_id", "academic_year");

-- CreateIndex
CREATE INDEX "Hostel_school_id_idx" ON "Hostel"("school_id");

-- CreateIndex
CREATE INDEX "Hostel_warden_id_idx" ON "Hostel"("warden_id");

-- CreateIndex
CREATE INDEX "HostelBlock_hostel_id_idx" ON "HostelBlock"("hostel_id");

-- CreateIndex
CREATE INDEX "HostelFloor_block_id_idx" ON "HostelFloor"("block_id");

-- CreateIndex
CREATE INDEX "HostelRoom_floor_id_idx" ON "HostelRoom"("floor_id");

-- CreateIndex
CREATE INDEX "HostelBed_room_id_idx" ON "HostelBed"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "HostelAllocation_bed_id_key" ON "HostelAllocation"("bed_id");

-- CreateIndex
CREATE INDEX "HostelAllocation_hostel_id_idx" ON "HostelAllocation"("hostel_id");

-- CreateIndex
CREATE INDEX "HostelAllocation_student_id_idx" ON "HostelAllocation"("student_id");

-- CreateIndex
CREATE INDEX "HostelAllocation_bed_id_idx" ON "HostelAllocation"("bed_id");

-- CreateIndex
CREATE INDEX "HostelFee_due_date_idx" ON "HostelFee"("due_date");

-- CreateIndex
CREATE INDEX "HostelFee_hostel_id_idx" ON "HostelFee"("hostel_id");

-- CreateIndex
CREATE INDEX "HostelFee_status_idx" ON "HostelFee"("status");

-- CreateIndex
CREATE INDEX "HostelFee_student_id_due_date_idx" ON "HostelFee"("student_id", "due_date");

-- CreateIndex
CREATE INDEX "HostelFee_student_id_idx" ON "HostelFee"("student_id");

-- CreateIndex
CREATE INDEX "Room_hostel_id_idx" ON "Room"("hostel_id");

-- CreateIndex
CREATE INDEX "Room_hostel_id_status_idx" ON "Room"("hostel_id", "status");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Transport_user_id_key" ON "Transport"("user_id");

-- CreateIndex
CREATE INDEX "Transport_school_id_idx" ON "Transport"("school_id");

-- CreateIndex
CREATE INDEX "Transport_user_id_idx" ON "Transport"("user_id");

-- CreateIndex
CREATE INDEX "Transport_is_deleted_idx" ON "Transport"("is_deleted");

-- CreateIndex
CREATE INDEX "Bus_bus_number_idx" ON "Bus"("bus_number");

-- CreateIndex
CREATE INDEX "Bus_school_id_idx" ON "Bus"("school_id");

-- CreateIndex
CREATE INDEX "Bus_school_id_bus_number_idx" ON "Bus"("school_id", "bus_number");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_license_key" ON "Driver"("license");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_user_id_key" ON "Driver"("user_id");

-- CreateIndex
CREATE INDEX "Driver_school_id_idx" ON "Driver"("school_id");

-- CreateIndex
CREATE INDEX "Driver_bus_id_idx" ON "Driver"("bus_id");

-- CreateIndex
CREATE INDEX "Driver_user_id_idx" ON "Driver"("user_id");

-- CreateIndex
CREATE INDEX "Driver_license_idx" ON "Driver"("license");

-- CreateIndex
CREATE INDEX "Driver_route_active_idx" ON "Driver"("route_active");

-- CreateIndex
CREATE INDEX "DriverLocation_driver_id_idx" ON "DriverLocation"("driver_id");

-- CreateIndex
CREATE INDEX "DriverLocation_timestamp_idx" ON "DriverLocation"("timestamp");

-- CreateIndex
CREATE INDEX "DriverLocation_driver_id_timestamp_idx" ON "DriverLocation"("driver_id", "timestamp");

-- CreateIndex
CREATE INDEX "Conductor_bus_id_idx" ON "Conductor"("bus_id");

-- CreateIndex
CREATE INDEX "Conductor_school_id_idx" ON "Conductor"("school_id");

-- CreateIndex
CREATE INDEX "Route_school_id_idx" ON "Route"("school_id");

-- CreateIndex
CREATE INDEX "Route_bus_id_idx" ON "Route"("bus_id");

-- CreateIndex
CREATE INDEX "Route_school_id_bus_id_idx" ON "Route"("school_id", "bus_id");

-- CreateIndex
CREATE INDEX "BusStop_school_id_idx" ON "BusStop"("school_id");

-- CreateIndex
CREATE INDEX "BusStop_route_id_idx" ON "BusStop"("route_id");

-- CreateIndex
CREATE INDEX "BusStop_school_id_route_id_idx" ON "BusStop"("school_id", "route_id");

-- CreateIndex
CREATE INDEX "PickUpPoint_school_id_idx" ON "PickUpPoint"("school_id");

-- CreateIndex
CREATE INDEX "PickUpPoint_route_id_idx" ON "PickUpPoint"("route_id");

-- CreateIndex
CREATE INDEX "PickUpPoint_school_id_route_id_idx" ON "PickUpPoint"("school_id", "route_id");

-- CreateIndex
CREATE INDEX "BusAttendance_student_id_idx" ON "BusAttendance"("student_id");

-- CreateIndex
CREATE INDEX "BusAttendance_bus_id_idx" ON "BusAttendance"("bus_id");

-- CreateIndex
CREATE INDEX "BusAttendance_trip_id_idx" ON "BusAttendance"("trip_id");

-- CreateIndex
CREATE INDEX "BusAttendance_date_idx" ON "BusAttendance"("date");

-- CreateIndex
CREATE INDEX "BusAttendance_student_id_date_idx" ON "BusAttendance"("student_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BusAttendance_student_id_trip_id_key" ON "BusAttendance"("student_id", "trip_id");

-- CreateIndex
CREATE INDEX "Trip_driver_id_idx" ON "Trip"("driver_id");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- CreateIndex
CREATE INDEX "Trip_is_degraded_idx" ON "Trip"("is_degraded");

-- CreateIndex
CREATE INDEX "TripStop_trip_id_idx" ON "TripStop"("trip_id");

-- CreateIndex
CREATE INDEX "TripStop_bus_stop_id_idx" ON "TripStop"("bus_stop_id");

-- CreateIndex
CREATE INDEX "TripLocation_trip_id_idx" ON "TripLocation"("trip_id");

-- CreateIndex
CREATE INDEX "TripLocation_timestamp_idx" ON "TripLocation"("timestamp");

-- CreateIndex
CREATE INDEX "TripNotification_trip_id_idx" ON "TripNotification"("trip_id");

-- CreateIndex
CREATE INDEX "TripNotification_status_idx" ON "TripNotification"("status");

-- CreateIndex
CREATE INDEX "TripNotification_event_type_idx" ON "TripNotification"("event_type");

-- CreateIndex
CREATE INDEX "DriverBehaviorIncident_driver_id_idx" ON "DriverBehaviorIncident"("driver_id");

-- CreateIndex
CREATE INDEX "DriverBehaviorIncident_trip_id_idx" ON "DriverBehaviorIncident"("trip_id");

-- CreateIndex
CREATE INDEX "DriverBehaviorIncident_school_id_idx" ON "DriverBehaviorIncident"("school_id");

-- CreateIndex
CREATE INDEX "DriverBehaviorIncident_incident_type_idx" ON "DriverBehaviorIncident"("incident_type");

-- CreateIndex
CREATE INDEX "DriverBehaviorIncident_severity_idx" ON "DriverBehaviorIncident"("severity");

-- CreateIndex
CREATE INDEX "DriverBehaviorIncident_created_at_idx" ON "DriverBehaviorIncident"("created_at");

-- CreateIndex
CREATE INDEX "DriverBehaviorIncident_driver_id_created_at_idx" ON "DriverBehaviorIncident"("driver_id", "created_at");

-- CreateIndex
CREATE INDEX "DriverPerformanceScore_driver_id_idx" ON "DriverPerformanceScore"("driver_id");

-- CreateIndex
CREATE INDEX "DriverPerformanceScore_school_id_idx" ON "DriverPerformanceScore"("school_id");

-- CreateIndex
CREATE INDEX "DriverPerformanceScore_period_start_period_end_idx" ON "DriverPerformanceScore"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "DriverPerformanceScore_driver_id_period_start_period_end_pe_key" ON "DriverPerformanceScore"("driver_id", "period_start", "period_end", "period_type");

-- CreateIndex
CREATE INDEX "RouteOptimization_route_id_idx" ON "RouteOptimization"("route_id");

-- CreateIndex
CREATE INDEX "RouteOptimization_school_id_idx" ON "RouteOptimization"("school_id");

-- CreateIndex
CREATE INDEX "RouteOptimization_is_applied_idx" ON "RouteOptimization"("is_applied");

-- CreateIndex
CREATE INDEX "RouteOptimization_created_at_idx" ON "RouteOptimization"("created_at");

-- CreateIndex
CREATE INDEX "TransportAnalytics_school_id_idx" ON "TransportAnalytics"("school_id");

-- CreateIndex
CREATE INDEX "TransportAnalytics_period_start_period_end_idx" ON "TransportAnalytics"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "TransportAnalytics_period_type_idx" ON "TransportAnalytics"("period_type");

-- CreateIndex
CREATE UNIQUE INDEX "TransportAnalytics_school_id_period_start_period_end_period_key" ON "TransportAnalytics"("school_id", "period_start", "period_end", "period_type");

-- CreateIndex
CREATE INDEX "BusMaintenanceAlert_bus_id_idx" ON "BusMaintenanceAlert"("bus_id");

-- CreateIndex
CREATE INDEX "BusMaintenanceAlert_school_id_idx" ON "BusMaintenanceAlert"("school_id");

-- CreateIndex
CREATE INDEX "BusMaintenanceAlert_is_acknowledged_idx" ON "BusMaintenanceAlert"("is_acknowledged");

-- CreateIndex
CREATE INDEX "BusMaintenanceAlert_is_resolved_idx" ON "BusMaintenanceAlert"("is_resolved");

-- CreateIndex
CREATE INDEX "BusMaintenanceAlert_severity_idx" ON "BusMaintenanceAlert"("severity");

-- CreateIndex
CREATE INDEX "BusMaintenanceAlert_created_at_idx" ON "BusMaintenanceAlert"("created_at");

-- CreateIndex
CREATE INDEX "AdmissionCounter_school_id_idx" ON "AdmissionCounter"("school_id");

-- CreateIndex
CREATE INDEX "StudentRemark_student_id_idx" ON "StudentRemark"("student_id");

-- CreateIndex
CREATE INDEX "StudentRemark_teacher_id_idx" ON "StudentRemark"("teacher_id");

-- CreateIndex
CREATE INDEX "StudentRemark_class_id_idx" ON "StudentRemark"("class_id");

-- CreateIndex
CREATE INDEX "StudentRemark_created_at_idx" ON "StudentRemark"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Student_user_id_key" ON "Student"("user_id");

-- CreateIndex
CREATE INDEX "Student_school_id_idx" ON "Student"("school_id");

-- CreateIndex
CREATE INDEX "Student_school_id_status_idx" ON "Student"("school_id", "status");

-- CreateIndex
CREATE INDEX "Student_user_id_idx" ON "Student"("user_id");

-- CreateIndex
CREATE INDEX "Student_admission_no_idx" ON "Student"("admission_no");

-- CreateIndex
CREATE INDEX "Student_created_at_idx" ON "Student"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Student_school_id_admission_no_key" ON "Student"("school_id", "admission_no");

-- CreateIndex
CREATE INDEX "StudentEvaluation_student_id_idx" ON "StudentEvaluation"("student_id");

-- CreateIndex
CREATE INDEX "StudentEvaluation_teacher_id_idx" ON "StudentEvaluation"("teacher_id");

-- CreateIndex
CREATE INDEX "StudentEvaluation_class_id_idx" ON "StudentEvaluation"("class_id");

-- CreateIndex
CREATE INDEX "StudentEvaluation_subject_id_idx" ON "StudentEvaluation"("subject_id");

-- CreateIndex
CREATE INDEX "StudentEvaluation_student_id_class_id_idx" ON "StudentEvaluation"("student_id", "class_id");

-- CreateIndex
CREATE INDEX "StudentEvaluation_evaluated_at_idx" ON "StudentEvaluation"("evaluated_at");

-- CreateIndex
CREATE INDEX "student_promotions_studentId_idx" ON "student_promotions"("studentId");

-- CreateIndex
CREATE INDEX "student_promotions_fromClassId_idx" ON "student_promotions"("fromClassId");

-- CreateIndex
CREATE INDEX "student_promotions_toClassId_idx" ON "student_promotions"("toClassId");

-- CreateIndex
CREATE INDEX "student_promotions_academicYear_idx" ON "student_promotions"("academicYear");

-- CreateIndex
CREATE INDEX "student_promotions_createdAt_idx" ON "student_promotions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFaceData_student_id_key" ON "StudentFaceData"("student_id");

-- CreateIndex
CREATE INDEX "Concession_school_id_status_idx" ON "Concession"("school_id", "status");

-- CreateIndex
CREATE INDEX "Concession_student_fee_plan_id_idx" ON "Concession"("student_fee_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistrationLink_token_key" ON "StudentRegistrationLink"("token");

-- CreateIndex
CREATE INDEX "StudentRegistrationLink_school_id_idx" ON "StudentRegistrationLink"("school_id");

-- CreateIndex
CREATE INDEX "StudentRegistrationLink_token_idx" ON "StudentRegistrationLink"("token");

-- CreateIndex
CREATE INDEX "StudentRegistrationLink_is_active_expires_at_idx" ON "StudentRegistrationLink"("is_active", "expires_at");

-- CreateIndex
CREATE INDEX "StudentRegistrationRequest_school_id_idx" ON "StudentRegistrationRequest"("school_id");

-- CreateIndex
CREATE INDEX "StudentRegistrationRequest_academic_year_id_idx" ON "StudentRegistrationRequest"("academic_year_id");

-- CreateIndex
CREATE INDEX "StudentRegistrationRequest_registration_link_id_idx" ON "StudentRegistrationRequest"("registration_link_id");

-- CreateIndex
CREATE INDEX "StudentRegistrationRequest_status_idx" ON "StudentRegistrationRequest"("status");

-- CreateIndex
CREATE INDEX "StudentRegistrationRequest_school_id_status_idx" ON "StudentRegistrationRequest"("school_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_user_id_key" ON "Parent"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_user_id_key" ON "Teacher"("user_id");

-- CreateIndex
CREATE INDEX "Teacher_school_id_idx" ON "Teacher"("school_id");

-- CreateIndex
CREATE INDEX "Teacher_school_id_status_idx" ON "Teacher"("school_id", "status");

-- CreateIndex
CREATE INDEX "Teacher_user_id_idx" ON "Teacher"("user_id");

-- CreateIndex
CREATE INDEX "Teacher_teacher_school_id_idx" ON "Teacher"("teacher_school_id");

-- CreateIndex
CREATE INDEX "Teacher_status_idx" ON "Teacher"("status");

-- CreateIndex
CREATE INDEX "Teacher_created_at_idx" ON "Teacher"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAttendance_teacher_id_attendance_date_key" ON "TeacherAttendance"("teacher_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherFaceData_teacher_id_key" ON "TeacherFaceData"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_code_key" ON "Employee"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_user_id_key" ON "Employee"("user_id");

-- CreateIndex
CREATE INDEX "Employee_user_id_idx" ON "Employee"("user_id");

-- CreateIndex
CREATE INDEX "Employee_employee_code_idx" ON "Employee"("employee_code");

-- CreateIndex
CREATE INDEX "Employee_department_id_idx" ON "Employee"("department_id");

-- CreateIndex
CREATE INDEX "Employee_designation_id_idx" ON "Employee"("designation_id");

-- CreateIndex
CREATE INDEX "Employee_employee_type_idx" ON "Employee"("employee_type");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employee_id_idx" ON "EmployeeDocument"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeDocument_folder_idx" ON "EmployeeDocument"("folder");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employee_id_folder_idx" ON "EmployeeDocument"("employee_id", "folder");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_employee_id_idx" ON "EmployeeAttendance"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_date_idx" ON "EmployeeAttendance"("date");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_employee_id_date_idx" ON "EmployeeAttendance"("employee_id", "date");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_status_idx" ON "EmployeeAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAttendance_employee_id_date_key" ON "EmployeeAttendance"("employee_id", "date");

-- CreateIndex
CREATE INDEX "EmployeeKPI_employeeId_idx" ON "EmployeeKPI"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeKPI_type_idx" ON "EmployeeKPI"("type");

-- CreateIndex
CREATE INDEX "EmployeeKPI_period_idx" ON "EmployeeKPI"("period");

-- CreateIndex
CREATE INDEX "EmployeeKPI_date_idx" ON "EmployeeKPI"("date");

-- CreateIndex
CREATE INDEX "Payroll_school_id_idx" ON "Payroll"("school_id");

-- CreateIndex
CREATE INDEX "Payroll_school_id_payroll_status_idx" ON "Payroll"("school_id", "payroll_status");

-- CreateIndex
CREATE INDEX "Payroll_user_id_idx" ON "Payroll"("user_id");

-- CreateIndex
CREATE INDEX "Payroll_school_id_payroll_period_start_payroll_period_end_idx" ON "Payroll"("school_id", "payroll_period_start", "payroll_period_end");

-- CreateIndex
CREATE INDEX "Payroll_payroll_created_at_idx" ON "Payroll"("payroll_created_at");

-- CreateIndex
CREATE INDEX "InventoryTransaction_inventory_item_id_idx" ON "InventoryTransaction"("inventory_item_id");

-- CreateIndex
CREATE INDEX "InventoryTransaction_user_id_idx" ON "InventoryTransaction"("user_id");

-- CreateIndex
CREATE INDEX "InventoryTransaction_transaction_date_idx" ON "InventoryTransaction"("transaction_date");

-- CreateIndex
CREATE INDEX "InventoryTransaction_transaction_type_idx" ON "InventoryTransaction"("transaction_type");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpay_order_id_key" ON "Payment"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoice_number_key" ON "Payment"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receipt_number_key" ON "Payment"("receipt_number");

-- CreateIndex
CREATE INDEX "Payment_school_id_idx" ON "Payment"("school_id");

-- CreateIndex
CREATE INDEX "Payment_school_id_payment_status_idx" ON "Payment"("school_id", "payment_status");

-- CreateIndex
CREATE INDEX "Payment_student_id_idx" ON "Payment"("student_id");

-- CreateIndex
CREATE INDEX "Payment_payment_status_idx" ON "Payment"("payment_status");

-- CreateIndex
CREATE INDEX "Payment_payment_date_idx" ON "Payment"("payment_date");

-- CreateIndex
CREATE INDEX "Payment_created_at_idx" ON "Payment"("created_at");

-- CreateIndex
CREATE INDEX "Payment_razorpay_order_id_idx" ON "Payment"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "Payment_razorpay_payment_id_idx" ON "Payment"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "Payment_is_deleted_idx" ON "Payment"("is_deleted");

-- CreateIndex
CREATE INDEX "Payment_is_deleted_payment_date_idx" ON "Payment"("is_deleted", "payment_date");

-- CreateIndex
CREATE INDEX "SalaryPayment_school_id_idx" ON "SalaryPayment"("school_id");

-- CreateIndex
CREATE INDEX "SalaryPayment_school_id_payment_date_idx" ON "SalaryPayment"("school_id", "payment_date");

-- CreateIndex
CREATE INDEX "SalaryPayment_teacher_id_idx" ON "SalaryPayment"("teacher_id");

-- CreateIndex
CREATE INDEX "SalaryPayment_payment_status_idx" ON "SalaryPayment"("payment_status");

-- CreateIndex
CREATE INDEX "SalaryPayment_created_at_idx" ON "SalaryPayment"("created_at");

-- CreateIndex
CREATE INDEX "Feedback_school_id_idx" ON "Feedback"("school_id");

-- CreateIndex
CREATE INDEX "Feedback_school_id_feedback_status_idx" ON "Feedback"("school_id", "feedback_status");

-- CreateIndex
CREATE INDEX "Feedback_feedback_status_idx" ON "Feedback"("feedback_status");

-- CreateIndex
CREATE INDEX "Feedback_created_at_idx" ON "Feedback"("created_at");

-- CreateIndex
CREATE INDEX "Feedback_is_deleted_idx" ON "Feedback"("is_deleted");

-- CreateIndex
CREATE INDEX "Feedback_is_deleted_feedback_status_idx" ON "Feedback"("is_deleted", "feedback_status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSecret_school_id_key" ON "PaymentSecret"("school_id");

-- CreateIndex
CREATE INDEX "CoinTransaction_user_id_idx" ON "CoinTransaction"("user_id");

-- CreateIndex
CREATE INDEX "CoinTransaction_created_at_idx" ON "CoinTransaction"("created_at");

-- CreateIndex
CREATE INDEX "Transaction_user_id_idx" ON "Transaction"("user_id");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_created_at_idx" ON "Transaction"("created_at");

-- CreateIndex
CREATE INDEX "IssueTransaction_member_id_idx" ON "IssueTransaction"("member_id");

-- CreateIndex
CREATE INDEX "IssueTransaction_book_copy_id_idx" ON "IssueTransaction"("book_copy_id");

-- CreateIndex
CREATE INDEX "IssueTransaction_status_idx" ON "IssueTransaction"("status");

-- CreateIndex
CREATE INDEX "IssueTransaction_due_date_idx" ON "IssueTransaction"("due_date");

-- CreateIndex
CREATE INDEX "IssueTransaction_member_id_status_idx" ON "IssueTransaction"("member_id", "status");

-- CreateIndex
CREATE INDEX "FineLedger_member_id_idx" ON "FineLedger"("member_id");

-- CreateIndex
CREATE INDEX "FineLedger_transaction_id_idx" ON "FineLedger"("transaction_id");

-- CreateIndex
CREATE INDEX "FineLedger_status_idx" ON "FineLedger"("status");

-- CreateIndex
CREATE INDEX "FineLedger_created_at_idx" ON "FineLedger"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceCounter_school_id_yearMonth_key" ON "InvoiceCounter"("school_id", "yearMonth");

-- CreateIndex
CREATE INDEX "FeeHead_school_id_is_active_idx" ON "FeeHead"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "FeeHead_priority_idx" ON "FeeHead"("priority");

-- CreateIndex
CREATE INDEX "student_invoice_items_school_id_academic_year_id_student_id_idx" ON "student_invoice_items"("school_id", "academic_year_id", "student_id");

-- CreateIndex
CREATE INDEX "student_invoice_items_status_idx" ON "student_invoice_items"("status");

-- CreateIndex
CREATE INDEX "student_invoice_items_due_date_idx" ON "student_invoice_items"("due_date");

-- CreateIndex
CREATE INDEX "FeeStructure_school_id_academic_year_id_is_active_idx" ON "FeeStructure"("school_id", "academic_year_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructureHead_fee_structure_id_fee_head_id_key" ON "FeeStructureHead"("fee_structure_id", "fee_head_id");

-- CreateIndex
CREATE INDEX "StudentFeePlan_student_id_is_active_idx" ON "StudentFeePlan"("student_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFeePlan_school_id_academic_year_id_student_id_key" ON "StudentFeePlan"("school_id", "academic_year_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFeePlanHead_student_fee_plan_id_fee_head_id_key" ON "StudentFeePlanHead"("student_fee_plan_id", "fee_head_id");

-- CreateIndex
CREATE INDEX "FinanceLedger_school_id_academic_year_id_idx" ON "FinanceLedger"("school_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "FinanceLedger_student_id_idx" ON "FinanceLedger"("student_id");

-- CreateIndex
CREATE INDEX "FinanceLedger_transaction_group_id_idx" ON "FinanceLedger"("transaction_group_id");

-- CreateIndex
CREATE INDEX "FinanceLedger_debit_account_id_idx" ON "FinanceLedger"("debit_account_id");

-- CreateIndex
CREATE INDEX "FinanceLedger_credit_account_id_idx" ON "FinanceLedger"("credit_account_id");

-- CreateIndex
CREATE INDEX "FinanceLedger_transaction_type_idx" ON "FinanceLedger"("transaction_type");

-- CreateIndex
CREATE INDEX "FinanceLedger_created_at_idx" ON "FinanceLedger"("created_at");

-- CreateIndex
CREATE INDEX "FinanceLedger_reference_table_reference_id_idx" ON "FinanceLedger"("reference_table", "reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_idempotency_key_key" ON "PaymentRequest"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_payment_id_key" ON "PaymentRequest"("payment_id");

-- CreateIndex
CREATE INDEX "PaymentRequest_school_id_idempotency_key_idx" ON "PaymentRequest"("school_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "PaymentRequest_student_id_status_idx" ON "PaymentRequest"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChequeDetail_payment_id_key" ON "ChequeDetail"("payment_id");

-- CreateIndex
CREATE INDEX "ChequeDetail_status_idx" ON "ChequeDetail"("status");

-- CreateIndex
CREATE INDEX "ChequeDetail_cheque_date_idx" ON "ChequeDetail"("cheque_date");

-- CreateIndex
CREATE UNIQUE INDEX "internal_expense_categories_name_key" ON "internal_expense_categories"("name");

-- CreateIndex
CREATE INDEX "ExamAttendance_student_id_idx" ON "ExamAttendance"("student_id");

-- CreateIndex
CREATE INDEX "ExamAttendance_exam_id_idx" ON "ExamAttendance"("exam_id");

-- CreateIndex
CREATE INDEX "ExamAttendance_date_idx" ON "ExamAttendance"("date");

-- CreateIndex
CREATE INDEX "ExamAttendance_student_id_date_idx" ON "ExamAttendance"("student_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAttendance_student_id_exam_id_date_key" ON "ExamAttendance"("student_id", "exam_id", "date");

-- CreateIndex
CREATE INDEX "Attendance_student_id_idx" ON "Attendance"("student_id");

-- CreateIndex
CREATE INDEX "Attendance_lesson_id_idx" ON "Attendance"("lesson_id");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE INDEX "Attendance_student_id_date_idx" ON "Attendance"("student_id", "date");

-- CreateIndex
CREATE INDEX "Attendance_status_idx" ON "Attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_student_id_lesson_id_date_key" ON "Attendance"("student_id", "lesson_id", "date");

-- CreateIndex
CREATE INDEX "LeaveRequest_user_id_from_date_to_date_idx" ON "LeaveRequest"("user_id", "from_date", "to_date");

-- CreateIndex
CREATE INDEX "LeaveRequest_isApproved_idx" ON "LeaveRequest"("isApproved");

-- CreateIndex
CREATE INDEX "LeaveRequest_created_at_idx" ON "LeaveRequest"("created_at");

-- CreateIndex
CREATE INDEX "Holiday_school_id_idx" ON "Holiday"("school_id");

-- CreateIndex
CREATE INDEX "Holiday_date_idx" ON "Holiday"("date");

-- CreateIndex
CREATE INDEX "Exam_class_id_idx" ON "Exam"("class_id");

-- CreateIndex
CREATE INDEX "Exam_subject_id_idx" ON "Exam"("subject_id");

-- CreateIndex
CREATE INDEX "Exam_schedule_date_idx" ON "Exam"("schedule_date");

-- CreateIndex
CREATE INDEX "Exam_start_time_end_time_idx" ON "Exam"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "Result_student_id_idx" ON "Result"("student_id");

-- CreateIndex
CREATE INDEX "Result_exam_id_idx" ON "Result"("exam_id");

-- CreateIndex
CREATE INDEX "Result_assignment_id_idx" ON "Result"("assignment_id");

-- CreateIndex
CREATE INDEX "Result_student_id_exam_id_idx" ON "Result"("student_id", "exam_id");

-- CreateIndex
CREATE INDEX "Result_student_id_assignment_id_idx" ON "Result"("student_id", "assignment_id");

-- CreateIndex
CREATE INDEX "Result_created_at_idx" ON "Result"("created_at");

-- CreateIndex
CREATE INDEX "QuizResult_user_id_idx" ON "QuizResult"("user_id");

-- CreateIndex
CREATE INDEX "QuizResult_quiz_id_idx" ON "QuizResult"("quiz_id");

-- CreateIndex
CREATE INDEX "QuizResult_user_id_quiz_id_idx" ON "QuizResult"("user_id", "quiz_id");

-- CreateIndex
CREATE INDEX "QuizResult_created_at_idx" ON "QuizResult"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Library_user_id_key" ON "Library"("user_id");

-- CreateIndex
CREATE INDEX "Library_school_id_idx" ON "Library"("school_id");

-- CreateIndex
CREATE INDEX "Library_user_id_idx" ON "Library"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryPolicy_library_id_key" ON "LibraryPolicy"("library_id");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE INDEX "Book_isbn_idx" ON "Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "BookCopy_barcode_key" ON "BookCopy"("barcode");

-- CreateIndex
CREATE INDEX "BookCopy_book_id_idx" ON "BookCopy"("book_id");

-- CreateIndex
CREATE INDEX "BookCopy_status_idx" ON "BookCopy"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryMember_user_id_key" ON "LibraryMember"("user_id");

-- CreateIndex
CREATE INDEX "BookDamageLog_book_copy_id_idx" ON "BookDamageLog"("book_copy_id");

-- CreateIndex
CREATE INDEX "BookDamageLog_reportedDate_idx" ON "BookDamageLog"("reportedDate");

-- CreateIndex
CREATE INDEX "LibraryAuditLog_library_id_idx" ON "LibraryAuditLog"("library_id");

-- CreateIndex
CREATE INDEX "LibraryAuditLog_timestamp_idx" ON "LibraryAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "LibraryAuditLog_action_idx" ON "LibraryAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "DemoBooking_email_key" ON "DemoBooking"("email");

-- CreateIndex
CREATE UNIQUE INDEX "issued_documents_document_no_key" ON "issued_documents"("document_no");

-- CreateIndex
CREATE INDEX "issued_documents_school_id_idx" ON "issued_documents"("school_id");

-- CreateIndex
CREATE INDEX "issued_documents_target_user_id_idx" ON "issued_documents"("target_user_id");

-- CreateIndex
CREATE INDEX "issued_documents_document_no_idx" ON "issued_documents"("document_no");

-- CreateIndex
CREATE INDEX "InventoryItem_school_id_idx" ON "InventoryItem"("school_id");

-- CreateIndex
CREATE INDEX "InventoryItem_school_id_created_at_idx" ON "InventoryItem"("school_id", "created_at");

-- CreateIndex
CREATE INDEX "Notification_fee_id_idx" ON "Notification"("fee_id");

-- CreateIndex
CREATE INDEX "Notification_notification_type_idx" ON "Notification"("notification_type");

-- CreateIndex
CREATE INDEX "Notification_sent_at_idx" ON "Notification"("sent_at");

-- CreateIndex
CREATE INDEX "DisputeMessage_dispute_id_idx" ON "DisputeMessage"("dispute_id");

-- CreateIndex
CREATE INDEX "DisputeMessage_user_id_idx" ON "DisputeMessage"("user_id");

-- CreateIndex
CREATE INDEX "DisputeMessage_created_at_idx" ON "DisputeMessage"("created_at");

-- CreateIndex
CREATE INDEX "ContactMessage_user_id_idx" ON "ContactMessage"("user_id");

-- CreateIndex
CREATE INDEX "ContactMessage_created_at_idx" ON "ContactMessage"("created_at");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_recipientUserId_idx" ON "Message"("recipientUserId");

-- CreateIndex
CREATE INDEX "Message_groupId_idx" ON "Message"("groupId");

-- CreateIndex
CREATE INDEX "Message_is_deleted_idx" ON "Message"("is_deleted");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_recipientUserId_idx" ON "Message"("senderId", "recipientUserId");

-- CreateIndex
CREATE INDEX "OfflineMessage_userId_idx" ON "OfflineMessage"("userId");

-- CreateIndex
CREATE INDEX "OfflineMessage_senderId_idx" ON "OfflineMessage"("senderId");

-- CreateIndex
CREATE INDEX "OfflineMessage_createdAt_idx" ON "OfflineMessage"("createdAt");

-- CreateIndex
CREATE INDEX "TaskNotification_user_id_idx" ON "TaskNotification"("user_id");

-- CreateIndex
CREATE INDEX "TaskNotification_task_id_idx" ON "TaskNotification"("task_id");

-- CreateIndex
CREATE INDEX "TaskNotification_user_id_is_read_idx" ON "TaskNotification"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "TaskNotification_created_at_idx" ON "TaskNotification"("created_at");

-- CreateIndex
CREATE INDEX "CallNotification_userId_idx" ON "CallNotification"("userId");

-- CreateIndex
CREATE INDEX "CallNotification_callId_idx" ON "CallNotification"("callId");

-- CreateIndex
CREATE INDEX "CallNotification_userId_read_idx" ON "CallNotification"("userId", "read");

-- CreateIndex
CREATE INDEX "NotificationTemplate_schoolId_idx" ON "NotificationTemplate"("schoolId");

-- CreateIndex
CREATE INDEX "NotificationTemplate_type_idx" ON "NotificationTemplate"("type");

-- CreateIndex
CREATE INDEX "NotificationTemplate_triggerEvent_idx" ON "NotificationTemplate"("triggerEvent");

-- CreateIndex
CREATE INDEX "NotificationLog_schoolId_idx" ON "NotificationLog"("schoolId");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "NotificationLog_type_idx" ON "NotificationLog"("type");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationChannel_schoolId_idx" ON "NotificationChannel"("schoolId");

-- CreateIndex
CREATE INDEX "NotificationChannel_type_idx" ON "NotificationChannel"("type");

-- CreateIndex
CREATE INDEX "TriggerNotification_schoolId_idx" ON "TriggerNotification"("schoolId");

-- CreateIndex
CREATE INDEX "TriggerNotification_triggerEvent_idx" ON "TriggerNotification"("triggerEvent");

-- CreateIndex
CREATE INDEX "msg91_templates_schoolId_idx" ON "msg91_templates"("schoolId");

-- CreateIndex
CREATE INDEX "msg91_templates_eventType_idx" ON "msg91_templates"("eventType");

-- CreateIndex
CREATE INDEX "msg91_templates_schoolId_eventType_idx" ON "msg91_templates"("schoolId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "msg91_templates_schoolId_eventType_key" ON "msg91_templates"("schoolId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_key_key" ON "global_settings"("key");

-- CreateIndex
CREATE INDEX "global_settings_group_idx" ON "global_settings"("group");

-- CreateIndex
CREATE INDEX "global_settings_group_created_at_idx" ON "global_settings"("group", "created_at");

-- CreateIndex
CREATE INDEX "document_templates_school_id_idx" ON "document_templates"("school_id");

-- CreateIndex
CREATE INDEX "document_templates_template_type_idx" ON "document_templates"("template_type");

-- CreateIndex
CREATE INDEX "document_templates_template_category_idx" ON "document_templates"("template_category");

-- CreateIndex
CREATE INDEX "subscription_school_id_idx" ON "subscription"("school_id");

-- CreateIndex
CREATE INDEX "subscription_school_id_is_active_idx" ON "subscription"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "subscription_school_id_is_active_end_date_idx" ON "subscription"("school_id", "is_active", "end_date");

-- CreateIndex
CREATE INDEX "subscription_plan_id_idx" ON "subscription"("plan_id");

-- CreateIndex
CREATE INDEX "subscription_payment_id_idx" ON "subscription"("payment_id");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE INDEX "subscription_start_date_end_date_idx" ON "subscription"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "subscription_is_active_end_date_idx" ON "subscription"("is_active", "end_date");

-- CreateIndex
CREATE INDEX "subscription_created_at_idx" ON "subscription"("created_at");

-- CreateIndex
CREATE INDEX "subscription_school_group_id_idx" ON "subscription"("school_group_id");

-- CreateIndex
CREATE INDEX "subscription_is_deleted_idx" ON "subscription"("is_deleted");

-- CreateIndex
CREATE INDEX "subscription_is_deleted_is_active_end_date_plan_id_idx" ON "subscription"("is_deleted", "is_active", "end_date", "plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookLog_event_id_key" ON "WebhookLog"("event_id");

-- CreateIndex
CREATE INDEX "WebhookLog_event_id_idx" ON "WebhookLog"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_user_id_key" ON "Leaderboard"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "EnhancementLeaderboard_student_id_key" ON "EnhancementLeaderboard"("student_id");

-- CreateIndex
CREATE INDEX "EnhancementLeaderboard_school_id_idx" ON "EnhancementLeaderboard"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_dashboard_summary_student_id_key" ON "student_dashboard_summary"("student_id");

-- CreateIndex
CREATE INDEX "student_dashboard_summary_school_id_idx" ON "student_dashboard_summary"("school_id");

-- CreateIndex
CREATE INDEX "student_dashboard_summary_student_id_idx" ON "student_dashboard_summary"("student_id");

-- CreateIndex
CREATE INDEX "student_dashboard_summary_school_id_student_id_idx" ON "student_dashboard_summary"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "Dispute_user_id_idx" ON "Dispute"("user_id");

-- CreateIndex
CREATE INDEX "Dispute_transaction_id_idx" ON "Dispute"("transaction_id");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_created_at_idx" ON "Dispute"("created_at");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Log_method_idx" ON "Log"("method");

-- CreateIndex
CREATE INDEX "Log_status_idx" ON "Log"("status");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");

-- CreateIndex
CREATE INDEX "Log_path_idx" ON "Log"("path");

-- CreateIndex
CREATE INDEX "TimelineLog_task_id_idx" ON "TimelineLog"("task_id");

-- CreateIndex
CREATE INDEX "TimelineLog_timestamp_idx" ON "TimelineLog"("timestamp");

-- CreateIndex
CREATE INDEX "ModuleUsageLog_userId_idx" ON "ModuleUsageLog"("userId");

-- CreateIndex
CREATE INDEX "ModuleUsageLog_moduleName_idx" ON "ModuleUsageLog"("moduleName");

-- CreateIndex
CREATE INDEX "ModuleUsageLog_timestamp_idx" ON "ModuleUsageLog"("timestamp");

-- CreateIndex
CREATE INDEX "UsageLog_userId_idx" ON "UsageLog"("userId");

-- CreateIndex
CREATE INDEX "UsageLog_schoolId_idx" ON "UsageLog"("schoolId");

-- CreateIndex
CREATE INDEX "UsageLog_timestamp_idx" ON "UsageLog"("timestamp");

-- CreateIndex
CREATE INDEX "UsageLog_module_idx" ON "UsageLog"("module");

-- CreateIndex
CREATE INDEX "UsageLog_schoolId_module_timestamp_idx" ON "UsageLog"("schoolId", "module", "timestamp");

-- CreateIndex
CREATE INDEX "Ticket_school_id_idx" ON "Ticket"("school_id");

-- CreateIndex
CREATE INDEX "Ticket_school_id_ticket_status_idx" ON "Ticket"("school_id", "ticket_status");

-- CreateIndex
CREATE INDEX "Ticket_user_id_idx" ON "Ticket"("user_id");

-- CreateIndex
CREATE INDEX "Ticket_assigned_to_id_idx" ON "Ticket"("assigned_to_id");

-- CreateIndex
CREATE INDEX "Ticket_employee_id_idx" ON "Ticket"("employee_id");

-- CreateIndex
CREATE INDEX "Ticket_ticket_status_idx" ON "Ticket"("ticket_status");

-- CreateIndex
CREATE INDEX "Ticket_ticket_priority_idx" ON "Ticket"("ticket_priority");

-- CreateIndex
CREATE INDEX "Ticket_created_at_idx" ON "Ticket"("created_at");

-- CreateIndex
CREATE INDEX "Ticket_is_deleted_idx" ON "Ticket"("is_deleted");

-- CreateIndex
CREATE INDEX "Ticket_is_deleted_ticket_status_ticket_priority_idx" ON "Ticket"("is_deleted", "ticket_status", "ticket_priority");

-- CreateIndex
CREATE INDEX "Todo_school_id_idx" ON "Todo"("school_id");

-- CreateIndex
CREATE INDEX "Todo_school_id_todo_status_idx" ON "Todo"("school_id", "todo_status");

-- CreateIndex
CREATE INDEX "Todo_user_id_idx" ON "Todo"("user_id");

-- CreateIndex
CREATE INDEX "Todo_user_id_todo_status_idx" ON "Todo"("user_id", "todo_status");

-- CreateIndex
CREATE INDEX "Todo_created_at_idx" ON "Todo"("created_at");

-- CreateIndex
CREATE INDEX "Event_schoolId_idx" ON "Event"("schoolId");

-- CreateIndex
CREATE INDEX "Event_schoolId_start_idx" ON "Event"("schoolId", "start");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_is_deleted_idx" ON "Event"("is_deleted");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE INDEX "Announcement_class_id_idx" ON "Announcement"("class_id");

-- CreateIndex
CREATE INDEX "Announcement_is_deleted_idx" ON "Announcement"("is_deleted");

-- CreateIndex
CREATE INDEX "Announcement_date_idx" ON "Announcement"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_token_key" ON "Visitor"("token");

-- CreateIndex
CREATE INDEX "Visitor_school_id_idx" ON "Visitor"("school_id");

-- CreateIndex
CREATE INDEX "Visitor_class_id_idx" ON "Visitor"("class_id");

-- CreateIndex
CREATE INDEX "Visitor_valid_until_idx" ON "Visitor"("valid_until");

-- CreateIndex
CREATE INDEX "Visitor_created_at_idx" ON "Visitor"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_phone_valid_from_key" ON "Visitor"("phone", "valid_from");

-- CreateIndex
CREATE INDEX "Doubt_class_id_idx" ON "Doubt"("class_id");

-- CreateIndex
CREATE INDEX "Doubt_subject_id_idx" ON "Doubt"("subject_id");

-- CreateIndex
CREATE INDEX "Doubt_user_id_idx" ON "Doubt"("user_id");

-- CreateIndex
CREATE INDEX "Doubt_status_idx" ON "Doubt"("status");

-- CreateIndex
CREATE INDEX "Doubt_class_id_status_idx" ON "Doubt"("class_id", "status");

-- CreateIndex
CREATE INDEX "Doubt_created_at_idx" ON "Doubt"("created_at");

-- CreateIndex
CREATE INDEX "PYQ_class_id_idx" ON "PYQ"("class_id");

-- CreateIndex
CREATE INDEX "PYQ_subject_id_idx" ON "PYQ"("subject_id");

-- CreateIndex
CREATE INDEX "PYQ_uploader_id_idx" ON "PYQ"("uploader_id");

-- CreateIndex
CREATE INDEX "PYQ_year_idx" ON "PYQ"("year");

-- CreateIndex
CREATE INDEX "PYQ_created_at_idx" ON "PYQ"("created_at");

-- CreateIndex
CREATE INDEX "DoubtReply_doubt_id_idx" ON "DoubtReply"("doubt_id");

-- CreateIndex
CREATE INDEX "DoubtReply_user_id_idx" ON "DoubtReply"("user_id");

-- CreateIndex
CREATE INDEX "DoubtReply_created_at_idx" ON "DoubtReply"("created_at");

-- CreateIndex
CREATE INDEX "Competition_user_id_idx" ON "Competition"("user_id");

-- CreateIndex
CREATE INDEX "Competition_score_idx" ON "Competition"("score");

-- CreateIndex
CREATE INDEX "Competition_created_at_idx" ON "Competition"("created_at");

-- CreateIndex
CREATE INDEX "Roadmap_user_id_idx" ON "Roadmap"("user_id");

-- CreateIndex
CREATE INDEX "Roadmap_subject_id_idx" ON "Roadmap"("subject_id");

-- CreateIndex
CREATE INDEX "Roadmap_created_at_idx" ON "Roadmap"("created_at");

-- CreateIndex
CREATE INDEX "Quiz_class_id_idx" ON "Quiz"("class_id");

-- CreateIndex
CREATE INDEX "Quiz_subject_id_idx" ON "Quiz"("subject_id");

-- CreateIndex
CREATE INDEX "Quiz_class_id_subject_id_idx" ON "Quiz"("class_id", "subject_id");

-- CreateIndex
CREATE INDEX "Quiz_start_date_idx" ON "Quiz"("start_date");

-- CreateIndex
CREATE INDEX "Quiz_created_at_idx" ON "Quiz"("created_at");

-- CreateIndex
CREATE INDEX "QuizQuestion_quiz_id_idx" ON "QuizQuestion"("quiz_id");

-- CreateIndex
CREATE INDEX "Newspaper_class_id_idx" ON "Newspaper"("class_id");

-- CreateIndex
CREATE INDEX "Newspaper_user_id_idx" ON "Newspaper"("user_id");

-- CreateIndex
CREATE INDEX "Newspaper_subject_id_idx" ON "Newspaper"("subject_id");

-- CreateIndex
CREATE INDEX "Newspaper_status_idx" ON "Newspaper"("status");

-- CreateIndex
CREATE INDEX "Newspaper_created_at_idx" ON "Newspaper"("created_at");

-- CreateIndex
CREATE INDEX "NewspaperSubmission_newspaper_id_idx" ON "NewspaperSubmission"("newspaper_id");

-- CreateIndex
CREATE INDEX "NewspaperSubmission_student_id_idx" ON "NewspaperSubmission"("student_id");

-- CreateIndex
CREATE INDEX "NewspaperSubmission_submitted_at_idx" ON "NewspaperSubmission"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "ReservationQueue_book_id_idx" ON "ReservationQueue"("book_id");

-- CreateIndex
CREATE INDEX "ReservationQueue_member_id_idx" ON "ReservationQueue"("member_id");

-- CreateIndex
CREATE INDEX "ReservationQueue_status_idx" ON "ReservationQueue"("status");

-- CreateIndex
CREATE INDEX "HomeWork_class_id_idx" ON "HomeWork"("class_id");

-- CreateIndex
CREATE INDEX "HomeWork_subject_id_idx" ON "HomeWork"("subject_id");

-- CreateIndex
CREATE INDEX "HomeWork_due_date_idx" ON "HomeWork"("due_date");

-- CreateIndex
CREATE INDEX "HomeWork_status_idx" ON "HomeWork"("status");

-- CreateIndex
CREATE INDEX "HomeWork_class_id_due_date_idx" ON "HomeWork"("class_id", "due_date");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_student_id_idx" ON "HomeworkSubmission"("student_id");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_homework_id_idx" ON "HomeworkSubmission"("homework_id");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_submitted_at_idx" ON "HomeworkSubmission"("submitted_at");

-- CreateIndex
CREATE INDEX "Notice_schoolId_idx" ON "Notice"("schoolId");

-- CreateIndex
CREATE INDEX "Notice_createdById_idx" ON "Notice"("createdById");

-- CreateIndex
CREATE INDEX "Notice_publishDate_idx" ON "Notice"("publishDate");

-- CreateIndex
CREATE INDEX "Notice_createdAt_idx" ON "Notice"("createdAt");

-- CreateIndex
CREATE INDEX "NoticeRecipient_noticeId_idx" ON "NoticeRecipient"("noticeId");

-- CreateIndex
CREATE INDEX "NoticeReadStatus_noticeId_idx" ON "NoticeReadStatus"("noticeId");

-- CreateIndex
CREATE INDEX "NoticeReadStatus_studentId_idx" ON "NoticeReadStatus"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeReadStatus_noticeId_studentId_key" ON "NoticeReadStatus"("noticeId", "studentId");

-- CreateIndex
CREATE INDEX "FriendRequest_senderId_idx" ON "FriendRequest"("senderId");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_idx" ON "FriendRequest"("receiverId");

-- CreateIndex
CREATE INDEX "FriendRequest_status_idx" ON "FriendRequest"("status");

-- CreateIndex
CREATE INDEX "FriendRequest_senderId_status_idx" ON "FriendRequest"("senderId", "status");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_status_idx" ON "FriendRequest"("receiverId", "status");

-- CreateIndex
CREATE INDEX "Friend_user1Id_idx" ON "Friend"("user1Id");

-- CreateIndex
CREATE INDEX "Friend_user2Id_idx" ON "Friend"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_user1Id_user2Id_key" ON "Friend"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "Block_blockerId_idx" ON "Block"("blockerId");

-- CreateIndex
CREATE INDEX "Block_blockedUserId_idx" ON "Block"("blockedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedUserId_key" ON "Block"("blockerId", "blockedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkView_student_id_homework_id_key" ON "HomeworkView"("student_id", "homework_id");

-- CreateIndex
CREATE INDEX "FinancialPeriod_is_locked_idx" ON "FinancialPeriod"("is_locked");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialPeriod_school_id_academic_year_id_month_year_key" ON "FinancialPeriod"("school_id", "academic_year_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Project_project_key_key" ON "Project"("project_key");

-- CreateIndex
CREATE INDEX "Project_project_key_idx" ON "Project"("project_key");

-- CreateIndex
CREATE INDEX "Project_lead_id_idx" ON "Project"("lead_id");

-- CreateIndex
CREATE INDEX "Project_is_archived_idx" ON "Project"("is_archived");

-- CreateIndex
CREATE INDEX "Task_project_id_idx" ON "Task"("project_id");

-- CreateIndex
CREATE INDEX "Task_assigned_to_id_idx" ON "Task"("assigned_to_id");

-- CreateIndex
CREATE INDEX "Task_sprint_id_idx" ON "Task"("sprint_id");

-- CreateIndex
CREATE INDEX "Task_task_status_idx" ON "Task"("task_status");

-- CreateIndex
CREATE INDEX "Task_task_priority_idx" ON "Task"("task_priority");

-- CreateIndex
CREATE INDEX "Task_created_by_idx" ON "Task"("created_by");

-- CreateIndex
CREATE INDEX "Task_project_id_task_status_idx" ON "Task"("project_id", "task_status");

-- CreateIndex
CREATE INDEX "Task_project_id_sprint_id_idx" ON "Task"("project_id", "sprint_id");

-- CreateIndex
CREATE INDEX "Task_epic_id_idx" ON "Task"("epic_id");

-- CreateIndex
CREATE INDEX "Task_parent_id_idx" ON "Task"("parent_id");

-- CreateIndex
CREATE INDEX "Task_stage_id_idx" ON "Task"("stage_id");

-- CreateIndex
CREATE INDEX "Task_created_at_idx" ON "Task"("created_at");

-- CreateIndex
CREATE INDEX "Attachment_task_id_idx" ON "Attachment"("task_id");

-- CreateIndex
CREATE INDEX "GitHubRepo_project_id_idx" ON "GitHubRepo"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_project_id_key" ON "Workflow"("project_id");

-- CreateIndex
CREATE INDEX "WorkflowStage_workflow_id_idx" ON "WorkflowStage"("workflow_id");

-- CreateIndex
CREATE INDEX "Epic_project_id_idx" ON "Epic"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_project_id_user_id_key" ON "ProjectMember"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "Label_project_id_idx" ON "Label"("project_id");

-- CreateIndex
CREATE INDEX "Label_is_deleted_idx" ON "Label"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "TaskWatcher_task_id_user_id_key" ON "TaskWatcher"("task_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubToken_user_id_key" ON "GitHubToken"("user_id");

-- CreateIndex
CREATE INDEX "OtpToken_user_id_idx" ON "OtpToken"("user_id");

-- CreateIndex
CREATE INDEX "ScheduledCall_creatorId_idx" ON "ScheduledCall"("creatorId");

-- CreateIndex
CREATE INDEX "ScheduledCall_startTime_idx" ON "ScheduledCall"("startTime");

-- CreateIndex
CREATE INDEX "ScheduledCall_isActive_idx" ON "ScheduledCall"("isActive");

-- CreateIndex
CREATE INDEX "ScheduledCallParticipant_callId_idx" ON "ScheduledCallParticipant"("callId");

-- CreateIndex
CREATE INDEX "ScheduledCallParticipant_userId_idx" ON "ScheduledCallParticipant"("userId");

-- CreateIndex
CREATE INDEX "JoinRequest_callId_idx" ON "JoinRequest"("callId");

-- CreateIndex
CREATE INDEX "JoinRequest_status_idx" ON "JoinRequest"("status");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Demo_leadId_idx" ON "Demo"("leadId");

-- CreateIndex
CREATE INDEX "Demo_conductedById_idx" ON "Demo"("conductedById");

-- CreateIndex
CREATE INDEX "Demo_status_idx" ON "Demo"("status");

-- CreateIndex
CREATE INDEX "Demo_scheduledAt_idx" ON "Demo"("scheduledAt");

-- CreateIndex
CREATE INDEX "FollowUp_leadId_idx" ON "FollowUp"("leadId");

-- CreateIndex
CREATE INDEX "FollowUp_isCompleted_idx" ON "FollowUp"("isCompleted");

-- CreateIndex
CREATE INDEX "FollowUp_scheduledAt_idx" ON "FollowUp"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMeta_pageSlug_key" ON "SeoMeta"("pageSlug");

-- CreateIndex
CREATE INDEX "SeoMeta_pageSlug_idx" ON "SeoMeta"("pageSlug");

-- CreateIndex
CREATE INDEX "bulk_upload_jobs_school_id_idx" ON "bulk_upload_jobs"("school_id");

-- CreateIndex
CREATE INDEX "bulk_upload_jobs_status_idx" ON "bulk_upload_jobs"("status");

-- CreateIndex
CREATE INDEX "bulk_upload_jobs_type_idx" ON "bulk_upload_jobs"("type");

-- CreateIndex
CREATE INDEX "bulk_upload_jobs_created_at_idx" ON "bulk_upload_jobs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "AiStage_userId_idx" ON "AiStage"("userId");

-- CreateIndex
CREATE INDEX "AiScene_stageId_order_idx" ON "AiScene"("stageId", "order");

-- CreateIndex
CREATE INDEX "AiChatSession_stageId_createdAt_idx" ON "AiChatSession"("stageId", "createdAt");

-- CreateIndex
CREATE INDEX "AiMediaFile_stageId_type_idx" ON "AiMediaFile"("stageId", "type");

-- CreateIndex
CREATE INDEX "AiGeneratedAgent_stageId_idx" ON "AiGeneratedAgent"("stageId");

-- CreateIndex
CREATE INDEX "school_module_subscriptions_school_id_idx" ON "school_module_subscriptions"("school_id");

-- CreateIndex
CREATE INDEX "school_module_subscriptions_school_id_module_status_idx" ON "school_module_subscriptions"("school_id", "module", "status");

-- CreateIndex
CREATE INDEX "user_module_subscriptions_user_id_idx" ON "user_module_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "user_module_subscriptions_user_id_module_status_idx" ON "user_module_subscriptions"("user_id", "module", "status");

-- CreateIndex
CREATE INDEX "_GradeToStudent_B_index" ON "_GradeToStudent"("B");

-- CreateIndex
CREATE INDEX "_ClassToEvent_B_index" ON "_ClassToEvent"("B");

-- CreateIndex
CREATE INDEX "_ClassToGrade_B_index" ON "_ClassToGrade"("B");

-- CreateIndex
CREATE INDEX "_ClassToTeacher_B_index" ON "_ClassToTeacher"("B");

-- CreateIndex
CREATE INDEX "_SubjectToTeacher_B_index" ON "_SubjectToTeacher"("B");

-- CreateIndex
CREATE INDEX "_RoomToStudent_B_index" ON "_RoomToStudent"("B");

-- CreateIndex
CREATE INDEX "_ParentToStudent_B_index" ON "_ParentToStudent"("B");

-- CreateIndex
CREATE INDEX "_StudentPayments_B_index" ON "_StudentPayments"("B");

-- CreateIndex
CREATE INDEX "_AttendanceToBus_B_index" ON "_AttendanceToBus"("B");

-- CreateIndex
CREATE INDEX "_EventRoles_B_index" ON "_EventRoles"("B");

-- CreateIndex
CREATE INDEX "_EventSections_B_index" ON "_EventSections"("B");

-- CreateIndex
CREATE INDEX "_EnrolledStudents_B_index" ON "_EnrolledStudents"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "Designation"("designation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_group_id_fkey" FOREIGN KEY ("school_group_id") REFERENCES "school_groups"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumUserProfile" ADD CONSTRAINT "ForumUserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_accounts" ADD CONSTRAINT "finance_accounts_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_accounts" ADD CONSTRAINT "finance_accounts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "school_groups"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fcm_tokens" ADD CONSTRAINT "fcm_tokens_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_logs" ADD CONSTRAINT "push_notification_logs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_groups" ADD CONSTRAINT "school_groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_feature_requests" ADD CONSTRAINT "school_feature_requests_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_feature_requests" ADD CONSTRAINT "school_feature_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolExpense" ADD CONSTRAINT "SchoolExpense_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "SchoolExpenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolExpense" ADD CONSTRAINT "SchoolExpense_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolExpenseCategory" ADD CONSTRAINT "SchoolExpenseCategory_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolIncome" ADD CONSTRAINT "SchoolIncome_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeGroup" ADD CONSTRAINT "FeeGroup_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_summary" ADD CONSTRAINT "school_summary_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subscription_configs" ADD CONSTRAINT "school_subscription_configs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_feature_configs" ADD CONSTRAINT "school_feature_configs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolOnboarding" ADD CONSTRAINT "SchoolOnboarding_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolOnboarding" ADD CONSTRAINT "SchoolOnboarding_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassLeaderboard" ADD CONSTRAINT "ClassLeaderboard_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassLeaderboard" ADD CONSTRAINT "ClassLeaderboard_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentView" ADD CONSTRAINT "AssignmentView_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentView" ADD CONSTRAINT "AssignmentView_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_summary" ADD CONSTRAINT "class_summary_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_summary" ADD CONSTRAINT "class_summary_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicRecord" ADD CONSTRAINT "StudentAcademicRecord_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicRecord" ADD CONSTRAINT "StudentAcademicRecord_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicRecord" ADD CONSTRAINT "StudentAcademicRecord_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hostel" ADD CONSTRAINT "Hostel_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hostel" ADD CONSTRAINT "Hostel_warden_id_fkey" FOREIGN KEY ("warden_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelBlock" ADD CONSTRAINT "HostelBlock_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelFloor" ADD CONSTRAINT "HostelFloor_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "HostelBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelRoom" ADD CONSTRAINT "HostelRoom_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "HostelFloor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelBed" ADD CONSTRAINT "HostelBed_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "HostelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAllocation" ADD CONSTRAINT "HostelAllocation_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "HostelBed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAllocation" ADD CONSTRAINT "HostelAllocation_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAllocation" ADD CONSTRAINT "HostelAllocation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationRequest" ADD CONSTRAINT "AccommodationRequest_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationRequest" ADD CONSTRAINT "AccommodationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelFee" ADD CONSTRAINT "HostelFee_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_current_location_id_fkey" FOREIGN KEY ("current_location_id") REFERENCES "DriverLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLocation" ADD CONSTRAINT "DriverLocation_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverNotification" ADD CONSTRAINT "DriverNotification_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conductor" ADD CONSTRAINT "Conductor_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conductor" ADD CONSTRAINT "Conductor_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusStop" ADD CONSTRAINT "BusStop_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusStop" ADD CONSTRAINT "BusStop_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickUpPoint" ADD CONSTRAINT "PickUpPoint_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickUpPoint" ADD CONSTRAINT "PickUpPoint_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusAttendance" ADD CONSTRAINT "BusAttendance_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusAttendance" ADD CONSTRAINT "BusAttendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusAttendance" ADD CONSTRAINT "BusAttendance_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_bus_stop_id_fkey" FOREIGN KEY ("bus_stop_id") REFERENCES "BusStop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripLocation" ADD CONSTRAINT "TripLocation_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripNotification" ADD CONSTRAINT "TripNotification_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverBehaviorIncident" ADD CONSTRAINT "DriverBehaviorIncident_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverBehaviorIncident" ADD CONSTRAINT "DriverBehaviorIncident_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverBehaviorIncident" ADD CONSTRAINT "DriverBehaviorIncident_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverPerformanceScore" ADD CONSTRAINT "DriverPerformanceScore_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverPerformanceScore" ADD CONSTRAINT "DriverPerformanceScore_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteOptimization" ADD CONSTRAINT "RouteOptimization_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteOptimization" ADD CONSTRAINT "RouteOptimization_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportAnalytics" ADD CONSTRAINT "TransportAnalytics_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusMaintenanceAlert" ADD CONSTRAINT "BusMaintenanceAlert_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusMaintenanceAlert" ADD CONSTRAINT "BusMaintenanceAlert_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionCounter" ADD CONSTRAINT "AdmissionCounter_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRemark" ADD CONSTRAINT "StudentRemark_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRemark" ADD CONSTRAINT "StudentRemark_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRemark" ADD CONSTRAINT "StudentRemark_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_bus_pickup_point_fkey" FOREIGN KEY ("bus_pickup_point") REFERENCES "PickUpPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_bus_stop_id_fkey" FOREIGN KEY ("bus_stop_id") REFERENCES "BusStop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEvaluation" ADD CONSTRAINT "StudentEvaluation_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEvaluation" ADD CONSTRAINT "StudentEvaluation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEvaluation" ADD CONSTRAINT "StudentEvaluation_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEvaluation" ADD CONSTRAINT "StudentEvaluation_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_promotions" ADD CONSTRAINT "student_promotions_fromClassId_fkey" FOREIGN KEY ("fromClassId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_promotions" ADD CONSTRAINT "student_promotions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_promotions" ADD CONSTRAINT "student_promotions_toClassId_fkey" FOREIGN KEY ("toClassId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFaceData" ADD CONSTRAINT "StudentFaceData_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concession" ADD CONSTRAINT "Concession_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concession" ADD CONSTRAINT "Concession_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "FeeHead"("fee_head_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concession" ADD CONSTRAINT "Concession_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concession" ADD CONSTRAINT "Concession_student_fee_plan_id_fkey" FOREIGN KEY ("student_fee_plan_id") REFERENCES "StudentFeePlan"("student_fee_plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRegistrationLink" ADD CONSTRAINT "StudentRegistrationLink_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRegistrationLink" ADD CONSTRAINT "StudentRegistrationLink_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRegistrationRequest" ADD CONSTRAINT "StudentRegistrationRequest_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRegistrationRequest" ADD CONSTRAINT "StudentRegistrationRequest_registration_link_id_fkey" FOREIGN KEY ("registration_link_id") REFERENCES "StudentRegistrationLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRegistrationRequest" ADD CONSTRAINT "StudentRegistrationRequest_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherFaceData" ADD CONSTRAINT "TeacherFaceData_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "Designation"("designation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incharge" ADD CONSTRAINT "Incharge_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAttendance" ADD CONSTRAINT "EmployeeAttendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeKPI" ADD CONSTRAINT "EmployeeKPI_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duty" ADD CONSTRAINT "Duty_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duty" ADD CONSTRAINT "Duty_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "InventoryItem"("inventory_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSecret" ADD CONSTRAINT "PaymentSecret_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueTransaction" ADD CONSTRAINT "IssueTransaction_book_copy_id_fkey" FOREIGN KEY ("book_copy_id") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueTransaction" ADD CONSTRAINT "IssueTransaction_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "LibraryMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FineLedger" ADD CONSTRAINT "FineLedger_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "LibraryMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FineLedger" ADD CONSTRAINT "FineLedger_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "IssueTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceCounter" ADD CONSTRAINT "InvoiceCounter_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLog" ADD CONSTRAINT "InvoiceLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeHead" ADD CONSTRAINT "FeeHead_revenue_account_id_fkey" FOREIGN KEY ("revenue_account_id") REFERENCES "finance_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeHead" ADD CONSTRAINT "FeeHead_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_invoice_items" ADD CONSTRAINT "student_invoice_items_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_invoice_items" ADD CONSTRAINT "student_invoice_items_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "FeeHead"("fee_head_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_invoice_items" ADD CONSTRAINT "student_invoice_items_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_invoice_items" ADD CONSTRAINT "student_invoice_items_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructureHead" ADD CONSTRAINT "FeeStructureHead_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "FeeHead"("fee_head_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructureHead" ADD CONSTRAINT "FeeStructureHead_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "FeeStructure"("fee_structure_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeePlan" ADD CONSTRAINT "StudentFeePlan_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeePlan" ADD CONSTRAINT "StudentFeePlan_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "FeeStructure"("fee_structure_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeePlan" ADD CONSTRAINT "StudentFeePlan_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeePlan" ADD CONSTRAINT "StudentFeePlan_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeePlanHead" ADD CONSTRAINT "StudentFeePlanHead_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "FeeHead"("fee_head_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeePlanHead" ADD CONSTRAINT "StudentFeePlanHead_student_fee_plan_id_fkey" FOREIGN KEY ("student_fee_plan_id") REFERENCES "StudentFeePlan"("student_fee_plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceLedger" ADD CONSTRAINT "FinanceLedger_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceLedger" ADD CONSTRAINT "FinanceLedger_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceLedger" ADD CONSTRAINT "FinanceLedger_credit_account_id_fkey" FOREIGN KEY ("credit_account_id") REFERENCES "finance_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceLedger" ADD CONSTRAINT "FinanceLedger_debit_account_id_fkey" FOREIGN KEY ("debit_account_id") REFERENCES "finance_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceLedger" ADD CONSTRAINT "FinanceLedger_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceLedger" ADD CONSTRAINT "FinanceLedger_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceLedger" ADD CONSTRAINT "FinanceLedger_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequeDetail" ADD CONSTRAINT "ChequeDetail_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("payment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequeDetail" ADD CONSTRAINT "ChequeDetail_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_expense" ADD CONSTRAINT "internal_expense_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "internal_expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttendance" ADD CONSTRAINT "ExamAttendance_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttendance" ADD CONSTRAINT "ExamAttendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryPolicy" ADD CONSTRAINT "LibraryPolicy_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryMember" ADD CONSTRAINT "LibraryMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookDamageLog" ADD CONSTRAINT "BookDamageLog_book_copy_id_fkey" FOREIGN KEY ("book_copy_id") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryAuditLog" ADD CONSTRAINT "LibraryAuditLog_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeMessage" ADD CONSTRAINT "DisputeMessage_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeMessage" ADD CONSTRAINT "DisputeMessage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_forwardedFromId_fkey" FOREIGN KEY ("forwardedFromId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineMessage" ADD CONSTRAINT "OfflineMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineMessage" ADD CONSTRAINT "OfflineMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNotification" ADD CONSTRAINT "TaskNotification_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNotification" ADD CONSTRAINT "TaskNotification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallNotification" ADD CONSTRAINT "CallNotification_callId_fkey" FOREIGN KEY ("callId") REFERENCES "ScheduledCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallNotification" ADD CONSTRAINT "CallNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationChannel" ADD CONSTRAINT "NotificationChannel_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriggerNotification" ADD CONSTRAINT "TriggerNotification_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msg91_templates" ADD CONSTRAINT "msg91_templates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("payment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_school_group_id_fkey" FOREIGN KEY ("school_group_id") REFERENCES "school_groups"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnhancementLeaderboard" ADD CONSTRAINT "EnhancementLeaderboard_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnhancementLeaderboard" ADD CONSTRAINT "EnhancementLeaderboard_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_dashboard_summary" ADD CONSTRAINT "student_dashboard_summary_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_dashboard_summary" ADD CONSTRAINT "student_dashboard_summary_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "IssueTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineLog" ADD CONSTRAINT "TimelineLog_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doubt" ADD CONSTRAINT "Doubt_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doubt" ADD CONSTRAINT "Doubt_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doubt" ADD CONSTRAINT "Doubt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PYQ" ADD CONSTRAINT "PYQ_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PYQ" ADD CONSTRAINT "PYQ_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PYQ" ADD CONSTRAINT "PYQ_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtReply" ADD CONSTRAINT "DoubtReply_doubt_id_fkey" FOREIGN KEY ("doubt_id") REFERENCES "Doubt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtReply" ADD CONSTRAINT "DoubtReply_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Newspaper" ADD CONSTRAINT "Newspaper_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Newspaper" ADD CONSTRAINT "Newspaper_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Newspaper" ADD CONSTRAINT "Newspaper_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewspaperSubmission" ADD CONSTRAINT "NewspaperSubmission_newspaper_id_fkey" FOREIGN KEY ("newspaper_id") REFERENCES "Newspaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewspaperSubmission" ADD CONSTRAINT "NewspaperSubmission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationQueue" ADD CONSTRAINT "ReservationQueue_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationQueue" ADD CONSTRAINT "ReservationQueue_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "LibraryMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeWork" ADD CONSTRAINT "HomeWork_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeWork" ADD CONSTRAINT "HomeWork_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "HomeWork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeRecipient" ADD CONSTRAINT "NoticeRecipient_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeReadStatus" ADD CONSTRAINT "NoticeReadStatus_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeReadStatus" ADD CONSTRAINT "NoticeReadStatus_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkView" ADD CONSTRAINT "HomeworkView_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "HomeWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkView" ADD CONSTRAINT "HomeworkView_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_locked_by_fkey" FOREIGN KEY ("locked_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "Epic"("epic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("sprint_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "WorkflowStage"("workflow_stage_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubRepo" ADD CONSTRAINT "GitHubRepo_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubBranch" ADD CONSTRAINT "GitHubBranch_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflow"("workflow_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "Label"("label_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubToken" ADD CONSTRAINT "GitHubToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpToken" ADD CONSTRAINT "OtpToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCallParticipant" ADD CONSTRAINT "ScheduledCallParticipant_callId_fkey" FOREIGN KEY ("callId") REFERENCES "ScheduledCall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCallParticipant" ADD CONSTRAINT "ScheduledCallParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_callId_fkey" FOREIGN KEY ("callId") REFERENCES "ScheduledCall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demo" ADD CONSTRAINT "Demo_conductedById_fkey" FOREIGN KEY ("conductedById") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demo" ADD CONSTRAINT "Demo_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demo" ADD CONSTRAINT "Demo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalEmergency" ADD CONSTRAINT "MedicalEmergency_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutpassRequest" ADD CONSTRAINT "OutpassRequest_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CourseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSection" ADD CONSTRAINT "CourseSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CourseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingAndReview" ADD CONSTRAINT "RatingAndReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingAndReview" ADD CONSTRAINT "RatingAndReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStage" ADD CONSTRAINT "AiStage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiScene" ADD CONSTRAINT "AiScene_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "AiStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "AiStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPlaybackState" ADD CONSTRAINT "AiPlaybackState_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "AiStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStageOutline" ADD CONSTRAINT "AiStageOutline_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "AiStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMediaFile" ADD CONSTRAINT "AiMediaFile_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "AiStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedAgent" ADD CONSTRAINT "AiGeneratedAgent_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "AiStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_module_subscriptions" ADD CONSTRAINT "school_module_subscriptions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_module_subscriptions" ADD CONSTRAINT "user_module_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradeToStudent" ADD CONSTRAINT "_GradeToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradeToStudent" ADD CONSTRAINT "_GradeToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToEvent" ADD CONSTRAINT "_ClassToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToEvent" ADD CONSTRAINT "_ClassToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToGrade" ADD CONSTRAINT "_ClassToGrade_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToGrade" ADD CONSTRAINT "_ClassToGrade_B_fkey" FOREIGN KEY ("B") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToTeacher" ADD CONSTRAINT "_ClassToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToTeacher" ADD CONSTRAINT "_ClassToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToStudent" ADD CONSTRAINT "_RoomToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToStudent" ADD CONSTRAINT "_RoomToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentToStudent" ADD CONSTRAINT "_ParentToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentToStudent" ADD CONSTRAINT "_ParentToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentPayments" ADD CONSTRAINT "_StudentPayments_A_fkey" FOREIGN KEY ("A") REFERENCES "Payment"("payment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentPayments" ADD CONSTRAINT "_StudentPayments_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttendanceToBus" ADD CONSTRAINT "_AttendanceToBus_A_fkey" FOREIGN KEY ("A") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttendanceToBus" ADD CONSTRAINT "_AttendanceToBus_B_fkey" FOREIGN KEY ("B") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventRoles" ADD CONSTRAINT "_EventRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventRoles" ADD CONSTRAINT "_EventRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "EventRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventSections" ADD CONSTRAINT "_EventSections_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventSections" ADD CONSTRAINT "_EventSections_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnrolledStudents" ADD CONSTRAINT "_EnrolledStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnrolledStudents" ADD CONSTRAINT "_EnrolledStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
