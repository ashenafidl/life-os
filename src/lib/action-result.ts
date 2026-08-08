export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function actionError(error: string): ActionResult<never> {
  return { success: false, error };
}

/** Throw this for errors the client should actually see verbatim —
 * validation failures, "not found", auth failures. Anything else
 * thrown (a raw DB error, a network failure) is treated as unexpected
 * and masked with a generic message, since its real content could
 * leak internal details (query text, constraint names) to the caller. */
export class ActionError extends Error {}

/** Wraps a server action body: catches ActionError and returns its
 * message safely; catches anything else, logs the real error
 * server-side, and returns a generic message to the client. */
export async function runAction<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return actionSuccess(data);
  } catch (error) {
    if (error instanceof ActionError) {
      return actionError(error.message);
    }

    // oxlint-disable-next-line no-console
    console.error("[action] Unexpected error:", error);
    return actionError("Something went wrong. Please try again.");
  }
}
