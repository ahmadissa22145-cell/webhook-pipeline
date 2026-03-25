import { isAlertPayload, AlertPayload } from "../../types/AlertPayload.type.js";

export function highValueAlertPipelineAction(payload: unknown) {
  if (!isAlertPayload(payload)) {
    return null;
  }

  const p = payload as AlertPayload;

  let level: "low" | "medium" | "high" | "critical" = "low";

  if (p.amount > 5000) level = "critical";
  else if (p.amount > 2000) level = "high";
  else if (p.amount > 1000) level = "medium";

  const isAlert = level === "high" || level === "critical";

  const userPart = p.userId ? `User: ${p.userId}` : "User: N/A";
  const countryPart = p.country ? `Country: ${p.country}` : "Country: N/A";
  const idPart = p.orderId;

  const alertMessage = isAlert
    ? `${level.toUpperCase()} ALERT — Transaction $${p.amount} detected.\n${userPart} | ${countryPart} | Order: ${idPart}`
    : `Transaction processed — $${p.amount} (${level})`;

  return {
    alert: isAlert,
    level,
    alertMessage,
    audit: {
      processedAt: new Date(),
      reason: isAlert ? "High value transaction detected" : "Normal processing",
    },
  };
}
