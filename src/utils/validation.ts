import { BadRequestError } from "../errors/BadRequestError.js";

export function trimOrThrow(value?: string, field = "value") {
  const v = value?.trim();
  if (!v) throw new BadRequestError(`${field} is required`);
  return v;
}
