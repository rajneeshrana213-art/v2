
import { checkDegradedTrips } from "../services/transport/trip-service";
import Logger from "../utils/logger";

export async function runTripDegradationCheck() {
  try {
    const result = await checkDegradedTrips();
    if (result.degradedCount > 0) {
      Logger.warn(
        `Trip degradation check: ${result.degradedCount} trip(s) marked as degraded`,
        { tripIds: result.tripIds }
      );
    }
    return { success: true, ...result };
  } catch (error: any) {
    Logger.error("Trip degradation cron job error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
