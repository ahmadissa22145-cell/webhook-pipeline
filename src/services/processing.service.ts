import { ProcessingActionType } from "../types/processingAction.type.js";
import { highValueAlertPipelineAction } from "./pipelineActions/highValueAlert.pipelineActions.js";
import { postNotificationPipelineAction } from "./pipelineActions/postNotification.pipelineAction.js";
import { sanitizePipelineAction } from "./pipelineActions/sanitizePipeline.Action.js";

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

  if (processingAction & ProcessingActionType.PostNotification) {
    result = postNotificationPipelineAction(payload);
    if (result === null) {
      return null;
    }
  }

  if (processingAction & ProcessingActionType.SANITIZE) {
    result = sanitizePipelineAction(payload);
    if (result === null) {
      return null;
    }
  }

  return result;
}
