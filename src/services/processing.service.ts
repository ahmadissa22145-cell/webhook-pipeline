import { ProcessingActionType } from "../types/processingAction.type.js";
import { highValueAlertPipelineAction } from "./pipelineActions/highValueAlert.pipelineActions.js";

//in progress
export async function processPayloadService(
  processingAction: ProcessingActionType,
  payload: unknown,
) {
  let result = payload;
  if (processingAction & ProcessingActionType.ALERT) {
    result = highValueAlertPipelineAction(payload);
    if (result === null) {
      return null;
    }
  }

  if (processingAction & ProcessingActionType.TRANSFORM) {
    // logic
  }

  if (processingAction & ProcessingActionType.ENRICH) {
    //logic
  }

  return result;
}
