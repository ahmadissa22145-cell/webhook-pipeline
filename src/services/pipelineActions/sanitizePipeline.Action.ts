type SanitizePayload = {
  cardNumber?: string;
  email?: string;
};

/**
 * Sanitizes sensitive fields from payload
 *
 * Why:
 * - Protect sensitive information (card number, email)
 * - Prevent leaking personal data downstream
 * - Ensure safe data handling within the pipeline
 *
 * Note:
 * - Returns null if payload is invalid or contains no relevant fields
 */

export function sanitizePipelineAction(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const p = payload as SanitizePayload;

  if (!p.cardNumber && !p.email) return null;

  const result: SanitizePayload = {
    cardNumber: p.cardNumber,
    email: p.email,
  };

  if (typeof result.cardNumber === "string") {
    const last4 = result.cardNumber.slice(-4);
    result.cardNumber = `************${last4}`;
  }

  if (typeof result.email === "string") {
    const [name, domain] = result.email.split("@");
    if (name && domain) {
      result.email = `${name[0]}***@${domain}`;
    }
  }

  return {
    sanitized: true,
    data: result,
    audit: {
      processedAt: new Date(),
      action: "sanitize_and_filter",
    },
  };
}
