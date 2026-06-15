import { resetDailyQuota } from "./apiKeyManager";

/**
 * Quota Reset Scheduler
 * Resets API quota daily at configured time (default: 17:00 JST)
 * JST = UTC + 9 hours
 */

let schedulerInterval: NodeJS.Timeout | null = null;
let lastResetDate: string | null = null;

/**
 * Get reset time from environment variables
 */
function getResetTime(): { hour: number; minute: number } {
  const hour = parseInt(process.env.QUOTA_RESET_HOUR_JST || "17", 10);
  const minute = parseInt(process.env.QUOTA_RESET_MINUTE_JST || "0", 10);
  return { hour, minute };
}

/**
 * Get current time in JST as hours and minutes
 */
function getJSTNow(): { hours: number; minutes: number; dateStr: string } {
  const now = new Date();
  // JST is UTC + 9 hours
  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const jstTime = new Date(now.getTime() + jstOffsetMs);
  const hours = jstTime.getUTCHours();
  const minutes = jstTime.getUTCMinutes();
  const dateStr = `${jstTime.getUTCFullYear()}-${String(jstTime.getUTCMonth() + 1).padStart(2, '0')}-${String(jstTime.getUTCDate()).padStart(2, '0')}`;
  return { hours, minutes, dateStr };
}

/**
 * Calculate milliseconds until next reset time for display purposes
 */
function getMillisecondsUntilNextReset(): number {
  const { hour: targetHour, minute: targetMinute } = getResetTime();
  const now = new Date();
  
  // Convert target JST time to UTC
  // JST = UTC + 9, so UTC = JST - 9
  const targetUTCHour = (targetHour - 9 + 24) % 24;
  const targetUTCMinute = targetMinute;

  // Create today's reset time in UTC
  const todayReset = new Date(now);
  todayReset.setUTCHours(targetUTCHour, targetUTCMinute, 0, 0);

  let nextReset = todayReset;
  // If we've already passed today's reset time, schedule for tomorrow
  if (now >= todayReset) {
    nextReset = new Date(todayReset);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }

  return Math.max(0, nextReset.getTime() - now.getTime());
}

/**
 * Start the quota reset scheduler
 */
export function startQuotaResetScheduler(): void {
  if (schedulerInterval) {
    console.log("[QuotaResetScheduler] Scheduler already running");
    return;
  }

  console.log("[QuotaResetScheduler] Starting quota reset scheduler");

  const { hour: resetHour, minute: resetMinute } = getResetTime();
  console.log(
    `[QuotaResetScheduler] Reset time configured: ${resetHour}:${String(resetMinute).padStart(2, '0')} JST (via QUOTA_RESET_HOUR_JST and QUOTA_RESET_MINUTE_JST env vars)`
  );

  // Calculate and display next reset time
  const msUntilReset = getMillisecondsUntilNextReset();
  const nextResetUTC = new Date(Date.now() + msUntilReset);
  console.log(
    `[QuotaResetScheduler] Next reset scheduled for: ${nextResetUTC.toISOString()} (${resetHour}:${String(resetMinute).padStart(2, '0')} JST)`
  );

  // Log current JST time for debugging
  const jstNow = getJSTNow();
  console.log(
    `[QuotaResetScheduler] Current JST time: ${jstNow.hours}:${String(jstNow.minutes).padStart(2, '0')} (date: ${jstNow.dateStr})`
  );

  // Check every 1 second for precise timing
  schedulerInterval = setInterval(async () => {
    const jst = getJSTNow();
    const { hour: resetHour, minute: resetMinute } = getResetTime();

    // Check if it's the configured reset time (allow a 1-minute window)
    if (jst.hours === resetHour && jst.minutes === resetMinute) {
      // Prevent duplicate resets on the same day
      if (lastResetDate === jst.dateStr) {
        return;
      }

      console.log(`[QuotaResetScheduler] Executing quota reset at ${resetHour}:${String(resetMinute).padStart(2, '0')} JST (${jst.dateStr})`);
      lastResetDate = jst.dateStr;

      try {
        await resetDailyQuota();
        console.log("[QuotaResetScheduler] Quota reset completed successfully");
      } catch (error) {
        console.error("[QuotaResetScheduler] Quota reset failed:", error);
        // Reset lastResetDate so it can retry
        lastResetDate = null;
      }
    }
  }, 1 * 1000); // Check every 1 second

  // Store the interval reference for cleanup
  (global as any).__quotaResetInterval = schedulerInterval;
}

/**
 * Stop the quota reset scheduler
 */
export function stopQuotaResetScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[QuotaResetScheduler] Scheduler stopped");
  }

  const interval = (global as any).__quotaResetInterval;
  if (interval) {
    clearInterval(interval);
    (global as any).__quotaResetInterval = null;
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  lastResetDate: string | null;
} {
  return {
    isRunning: schedulerInterval !== null,
    lastResetDate,
  };
}
