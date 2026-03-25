import { PostPayload } from "../../types/postPayload.type.js";
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
