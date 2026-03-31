import { BadRequestError } from "../errors/BadRequestError.js";

export function trimOrThrow(value?: string, field = "value", message?: string) {
  const v = value?.trim();

  if (!message) {
    message = `${field} is required`;
  }

  if (!v) throw new BadRequestError(message);
  return v;
}
