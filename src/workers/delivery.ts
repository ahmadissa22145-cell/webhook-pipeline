import {
  createDeliveryService,
  incrementDeliveryAttemptsService,
  updateDeliveryStatusService,
} from "../services/delivery.service.js";
import { DeliveryStatus } from "../types/deliveryStatus.type.js";
import { logger } from "../utils/logger.js";

const maxDeliveryAttempts = 3; // maximum retries per subscriber

/**
 * Delivers processed results to subscribers with retry logic
 *
 * Why:
 * - Ensure reliable delivery to external endpoints
 * - Track delivery attempts and status per subscriber
 * - Retry failed deliveries with backoff
 */
export async function deliverToSubscribersWithRetry(
  subscribers: {
    id: string;
    url: string;
  }[],
  jobId: string,
  eventId: string,
  result: unknown,
) {
  return await Promise.allSettled(
    subscribers.map(async (sub) => {
      // Create delivery record for tracking this subscriber delivery
      const delivery = await createDeliveryService(jobId, sub.id, result);

      // Retry loop for delivery attempts
      for (let attempt = 1; attempt <= maxDeliveryAttempts; attempt++) {
        try {
          // Mark as sending before request
          await updateDeliveryStatusService(
            delivery.id,
            DeliveryStatus.SENDING,
          );

          // Send HTTP request to subscriber endpoint
          const response = await fetch(sub.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventId,
              result,
            }),
          });

          // Treat not ok as failure
          if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`);
          }

          // Mark delivery as successful
          await updateDeliveryStatusService(
            delivery.id,
            DeliveryStatus.DELIVERED,
            response.status,
          );

          return true;
        } catch (error) {
          logger.error(error); // Log failure for debugging/monitoring

          // Increment attempt counter in DB
          await incrementDeliveryAttemptsService(delivery.id);

          // Backoff strategy (increasing delay + randomness)
          await new Promise((res) =>
            setTimeout(res, 2000 * attempt + Math.random() * 500),
          );

          // If max attempts reached mark as FAILED
          if (attempt === maxDeliveryAttempts) {
            await updateDeliveryStatusService(
              delivery.id,
              DeliveryStatus.FAILED,
            );
            return false;
          }

          // Otherwise mark as RETRYING
          await updateDeliveryStatusService(
            delivery.id,
            DeliveryStatus.RETRYING,
          );
        }
      }

      return false;
    }),
  );
}
