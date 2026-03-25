import { ProcessingActionType } from "../types/processingAction.type.js";

// Not Redy
export async function processPayloadService(
  processingAction: ProcessingActionType,
  payload: unknown,
) {
  if (payload) {
    processingAction += 1;
  }

  if (processingAction & ProcessingActionType.FILTER) {
    //logic
  }

  if (processingAction & ProcessingActionType.TRANSFORM) {
    //logic
  }

  if (processingAction & ProcessingActionType.ENRICH) {
    //logic
  }

  return payload;
}
