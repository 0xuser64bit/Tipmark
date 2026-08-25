const REFERENCE_LENGTH = 32;

export function createTipReference(): Uint8Array {
  const reference = new Uint8Array(REFERENCE_LENGTH);
  crypto.getRandomValues(reference);
  return reference;
}

export function encodeTipReference(reference: Uint8Array): string {
  if (reference.length !== REFERENCE_LENGTH) {
    throw new Error("Tip reference must contain exactly 32 bytes.");
  }
  return Array.from(reference, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function decodeTipReference(value: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(value)) {
    throw new Error("Tip reference must be a 64-character hexadecimal value.");
  }

  return Uint8Array.from(value.match(/.{2}/g)!, (pair) => Number.parseInt(pair, 16));
}
