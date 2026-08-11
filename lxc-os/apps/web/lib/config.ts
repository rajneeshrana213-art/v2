const NODE_ENV = (process.env.NODE_ENV || "production") as string;

export const CONFIG = {
  NODE_ENV: NODE_ENV,
  APP_ENV: process.env.APP_ENV || "beta",
  APP_NAME: "LEARN-X-CHAIN-API",
  IS_DEVELOPMENT: NODE_ENV === "development",
  IS_SANDBOX: NODE_ENV === "uat",
  IS_PRODUCTION: NODE_ENV !== "uat" && NODE_ENV !== "development",
  FRONTEND_BASE_URL: process.env.FRONTEND_URL || "",
  BCRYPT_SALT: parseInt(process.env.BCRYPT_SALT ?? "10"),
  LIMIT: 50,

  // JWT — trim() ensures leading/trailing spaces in .env files don't cause
  // signature mismatches between sign (mobile-sign-in) and verify (verifyAuth).
  JWT_ACCESS_TOKEN_SECRET: (process.env.JWT_ACCESS_TOKEN_SECRET || "").trim(),
  JWT_REFRESH_TOKEN_SECRET: (process.env.JWT_REFRESH_TOKEN_SECRET || "").trim(),
  JWT_PRIVATE_KEY: (process.env.JWT_PRIVATE_KEY || "").trim(),
  JWT_DEFAULT_EXPIRY_TIME: "1d",
  JWT_LOGIN_TOKEN_EXPIRY_TIME: "1h",
  JWT_REFRESH_TOKEN_EXPIRY_TIME: "30d",

  // Email Settings
  EMAIL_IMAGE_BASE_URL: process.env.EMAIL_IMAGE_BASE_URL || "",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "",
  EMAIL_FROM_EMAIL: process.env.EMAIL_FROM_EMAIL || "",
  EMAIL_AUTH_USERNAME:
    process.env.EMAIL_AUTH_USERNAME || process.env.EMAIL_SERVER_USER || "",
  EMAIL_AUTH_PASSWORD:
    process.env.EMAIL_AUTH_PASSWORD || process.env.EMAIL_SERVER_PASSWORD || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  TEAM_NAME: "Team LearnXChain",
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "contact@learnxchain.com",

  // Google Captcha
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || "",

  // Brute Force
  MaxWrongAttemptsByIPperDay: 50,
  MaxConsecutiveFailsByUsernameAndIP: 10,
  MaxWrongAttemptsByUsernamePerDay: 20,
};
