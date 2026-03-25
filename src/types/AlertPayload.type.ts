export type AlertPayload = {
  amount: number;
  orderId: string;
  userId?: string;
  country?: string;
};

export function isAlertPayload(payload: unknown): payload is AlertPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "amount" in payload &&
    typeof payload.amount === "number" &&
    "orderId" in payload &&
    typeof payload.orderId === "string"
  );
}
