/**
 * FCM Core Service — all low-level send functions.
 */

import { messaging } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import Logger from "@/lib/utils/logger";

// Cast prisma to any so new models (FcmToken, PushNotificationLog) are accessible.
// These tables exist in the database — the TS type just doesn't know them yet because
// lib/prisma.ts casts to PrismaClientWithEvents (which predates our new models).
const db = prisma as any;

const FCM_BATCH_SIZE = 500; // FCM multicast limit

export interface FcmPayload {
  title:     string;
  body:      string;
  data?:     Record<string, string>;
  imageUrl?: string;
}

// ─── Low-level send helpers ──────────────────────────────────────────────────

/**
 * Send to a single FCM token.
 */
export async function sendToSingleToken(
  token:   string,
  payload: FcmPayload
): Promise<{ success: boolean; error?: string }> {
  if (!messaging) {
    Logger.warn("[FCM] Skipping — Firebase not initialised");
    return { success: false, error: "Firebase not initialised" };
  }
  try {
    await messaging.send({
      token,
      notification: { title: payload.title, body: payload.body, imageUrl: payload.imageUrl },
      data: payload.data ?? {},
      android: { priority: "high", notification: { sound: "default", channelId: "default" } },
      apns:    { payload: { aps: { sound: "default", badge: 1 } } },
    });
    return { success: true };
  } catch (err: any) {
    Logger.error("[FCM] sendToSingleToken failed", { token: token.slice(-6), err: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Send to multiple tokens in batches of 500.
 */
export async function sendToMultipleTokens(
  tokens:  string[],
  payload: FcmPayload
): Promise<{ successCount: number; failureCount: number; invalidTokens: string[] }> {
  if (!messaging || tokens.length === 0) {
    return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
  }

  let successCount = 0;
  let failureCount = 0;
  const invalidTokens: string[] = [];

  for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
    const batch = tokens.slice(i, i + FCM_BATCH_SIZE);
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title: payload.title, body: payload.body, imageUrl: payload.imageUrl },
        data: payload.data ?? {},
        android: { priority: "high", notification: { sound: "default", channelId: "default" } },
        apns:    { payload: { aps: { sound: "default", badge: 1 } } },
      });

      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((r: any, idx: number) => {
        if (!r.success && isInvalidToken(r.error?.code)) {
          invalidTokens.push(batch[idx]);
        }
      });
    } catch (err: any) {
      Logger.error("[FCM] sendToMultipleTokens batch failed", { err: err.message });
      failureCount += batch.length;
    }
  }

  return { successCount, failureCount, invalidTokens };
}

/**
 * Send to a FCM topic.
 */
export async function sendToTopic(
  topic:   string,
  payload: FcmPayload
): Promise<{ success: boolean; error?: string }> {
  if (!messaging) return { success: false, error: "Firebase not initialised" };
  try {
    await messaging.send({
      topic,
      notification: { title: payload.title, body: payload.body, imageUrl: payload.imageUrl },
      data: payload.data ?? {},
      android: { priority: "high", notification: { sound: "default", channelId: "default" } },
      apns:    { payload: { aps: { sound: "default", badge: 1 } } },
    });
    return { success: true };
  } catch (err: any) {
    Logger.error("[FCM] sendToTopic failed", { topic, err: err.message });
    return { success: false, error: err.message };
  }
}

// ─── High-level DB-aware helpers ─────────────────────────────────────────────

/**
 * Send to all active tokens for a given userId.
 */
export async function sendToUser(
  userId:  string,
  payload: FcmPayload
): Promise<{ successCount: number; failureCount: number }> {
  const records: Array<{ token: string }> = await db.fcmToken.findMany({
    where: { userId, isActive: true },
    select: { token: true },
  });
  if (!records.length) return { successCount: 0, failureCount: 0 };

  const tokens = records.map(r => r.token);
  const result = await sendToMultipleTokens(tokens, payload);
  await cleanupInvalidTokens(result.invalidTokens);
  return { successCount: result.successCount, failureCount: result.failureCount };
}

/**
 * Send to all active tokens for a given role within a school.
 */
export async function sendToRole(
  schoolId: string,
  role:     string,
  payload:  FcmPayload,
  opts?:    { trigger?: string; sentBy?: string }
): Promise<{ successCount: number; failureCount: number }> {
  const records: Array<{ token: string }> = await db.fcmToken.findMany({
    where: { schoolId, userType: role, isActive: true },
    select: { token: true },
  });

  if (!records.length) return { successCount: 0, failureCount: 0 };

  const tokens = records.map(r => r.token);
  const result = await sendToMultipleTokens(tokens, payload);
  await cleanupInvalidTokens(result.invalidTokens);

  await logPush({
    schoolId,
    payload,
    targetType:   "role",
    target:       role,
    successCount: result.successCount,
    failureCount: result.failureCount,
    sentBy:       opts?.sentBy  ?? "system",
    trigger:      opts?.trigger,
  });

  return { successCount: result.successCount, failureCount: result.failureCount };
}

/**
 * Send to all active tokens for a list of user IDs.
 */
export async function sendToUsers(
  userIds:  string[],
  payload:  FcmPayload,
  schoolId: string,
  opts?:    { trigger?: string; sentBy?: string }
): Promise<{ successCount: number; failureCount: number }> {
  if (!userIds.length) return { successCount: 0, failureCount: 0 };

  const records: Array<{ token: string }> = await db.fcmToken.findMany({
    where: { userId: { in: userIds }, isActive: true },
    select: { token: true },
  });

  if (!records.length) return { successCount: 0, failureCount: 0 };

  const tokens = records.map(r => r.token);
  const result = await sendToMultipleTokens(tokens, payload);
  await cleanupInvalidTokens(result.invalidTokens);

  await logPush({
    schoolId,
    payload,
    targetType:   "bulk",
    target:       `${userIds.length} users`,
    successCount: result.successCount,
    failureCount: result.failureCount,
    sentBy:       opts?.sentBy  ?? "system",
    trigger:      opts?.trigger,
  });

  return { successCount: result.successCount, failureCount: result.failureCount };
}

// ─── Token management ─────────────────────────────────────────────────────────

export async function upsertToken(params: {
  userId:      string;
  userType:    string;
  token:       string;
  deviceInfo?: string;
  schoolId:    string;
}): Promise<void> {
  await db.fcmToken.upsert({
    where:  { token: params.token },
    update: {
      userId:     params.userId,
      userType:   params.userType,
      schoolId:   params.schoolId,
      deviceInfo: params.deviceInfo,
      isActive:   true,
      updatedAt:  new Date(),
    },
    create: {
      userId:     params.userId,
      userType:   params.userType,
      token:      params.token,
      deviceInfo: params.deviceInfo,
      schoolId:   params.schoolId,
      isActive:   true,
    },
  });

  // Deactivate stale tokens from same user + device type
  if (params.deviceInfo) {
    await db.fcmToken.updateMany({
      where: {
        userId:     params.userId,
        deviceInfo: params.deviceInfo,
        token:      { not: params.token },
        isActive:   true,
      },
      data: { isActive: false },
    });
  }
}

async function cleanupInvalidTokens(tokens: string[]): Promise<void> {
  if (!tokens.length) return;
  await db.fcmToken.updateMany({
    where: { token: { in: tokens } },
    data:  { isActive: false },
  });
  Logger.info(`[FCM] Cleaned up ${tokens.length} invalid token(s)`);
}

// ─── Logging ──────────────────────────────────────────────────────────────────

interface LogPushInput {
  schoolId:     string;
  payload:      FcmPayload;
  targetType:   string;
  target:       string;
  successCount: number;
  failureCount: number;
  sentBy:       string;
  trigger?:     string;
}

export async function logPush(input: LogPushInput): Promise<void> {
  try {
    const status =
      input.failureCount === 0 ? "sent"
      : input.successCount === 0 ? "failed"
      : "partial";

    await db.pushNotificationLog.create({
      data: {
        title:        input.payload.title,
        body:         input.payload.body,
        data:         input.payload.data ?? {},
        targetType:   input.targetType,
        target:       input.target,
        status,
        successCount: input.successCount,
        failureCount: input.failureCount,
        schoolId:     input.schoolId,
        sentBy:       input.sentBy,
        trigger:      input.trigger ?? null,
      },
    });
  } catch (err) {
    Logger.warn("[FCM] Failed to write push log", { err });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isInvalidToken(code?: string): boolean {
  return [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
    "messaging/invalid-argument",
  ].includes(code ?? "");
}
