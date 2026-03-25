import {
  createDeliveryService,
  incrementDeliveryAttemptsService,
  updateDeliveryStatusService,
} from "../services/delivery.service.js";
import { DeliveryStatus } from "../types/deliveryStatus.type.js";
import { logger } from "../utils/logger.js";

const maxDeliveryAttempts = 3; // Delivery attempts
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
      const delivery = await createDeliveryService(jobId, sub.id, result);

      for (let attempt = 1; attempt <= maxDeliveryAttempts; attempt++) {
        try {
          await updateDeliveryStatusService(
            delivery.id,
            DeliveryStatus.SENDING,
          );
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

          if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`);
          }

          await updateDeliveryStatusService(
            delivery.id,
            DeliveryStatus.DELIVERED,
            response.status,
          );
          return true;
        } catch (error) {
          logger.error(error);

          await incrementDeliveryAttemptsService(delivery.id);
          await new Promise((res) =>
            setTimeout(res, 2000 * attempt + Math.random() * 500),
          );

          if (attempt === maxDeliveryAttempts) {
            await updateDeliveryStatusService(
              delivery.id,
              DeliveryStatus.FAILED,
            );
            return false;
          }

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
