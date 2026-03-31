import { PostPayload } from "../../types/postPayload.type.js";

/**
 * Processes post notification payload
 *
 * Why:
 * - Validate required fields for notification (userName, content)
 * - Generate a human-readable message for downstream systems
 * - Standardize post-related notifications in the pipeline
 *
 * Note:
 * - Returns null if payload is invalid or missing required fields
 */
export function postNotificationPipelineAction(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const p = payload as PostPayload;

  if (!p.userName || !p.content) return null;

  const message = `${p.userName || "A user"} published a new post: ${p.content}`;

  return {
    userName: p.userName,
    message,

    audit: {
      processedAt: new Date(),
    },
  };
}
