import { ProcessingActionType } from "../types/processingAction.type.js";
import { highValueAlertPipelineAction } from "./pipelineActions/highValueAlert.pipelineActions.js";
import { postNotificationPipelineAction } from "./pipelineActions/postNotification.pipelineAction.js";
import { sanitizePipelineAction } from "./pipelineActions/sanitizePipeline.Action.js";

/**
 * Processes payload based on configured pipeline actions
 *
 * Why:
 * - Dynamically apply multiple processing steps using bitmask flags
 * - Allow flexible composition of actions (ALERT, NOTIFICATION, SANITIZE)
 * - Stop processing early if any step invalidates the payload
 *
 * Design:
 * - Actions are applied sequentially in a fixed order
 * - Each step receives the result of the previous step (pipeline pattern)
 * - Bitwise flags are used to determine which actions to execute
 *
 * Flow:
 * - Start with original payload
 * - Apply enabled actions in order
 * - If any action returns null → stop processing immediately
 * - Return final processed payload
 **/

export async function processPayloadService(
  processingAction: ProcessingActionType,
  payload: unknown,
) {
  let result = payload;
  if (processingAction & ProcessingActionType.ALERT) {
    result = highValueAlertPipelineAction(result);
    if (result === null) {
      return null;
    }
  }

  if (processingAction & ProcessingActionType.PostNotification) {
    result = postNotificationPipelineAction(result);
    if (result === null) {
      return null;
    }
  }

  if (processingAction & ProcessingActionType.SANITIZE) {
    result = sanitizePipelineAction(result);
    if (result === null) {
      return null;
    }
  }

  return result;
}
