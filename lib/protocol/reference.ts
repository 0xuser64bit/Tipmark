const REFERENCE_LENGTH = 32;

/**
 * A per-tip nonce, carried through the instruction and the event so the two can
 * be bound to each other during receipt verification. It is never displayed and
 * never parsed from user input, so it stays bytes end to end.
 */
export function createTipReference(): Uint8Array {
  const reference = new Uint8Array(REFERENCE_LENGTH);
  crypto.getRandomValues(reference);
  return reference;
}
