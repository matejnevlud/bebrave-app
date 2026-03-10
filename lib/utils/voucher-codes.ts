const ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateVoucherCode(length: number = 10): string {
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALLOWED_CHARS.length);

    code += ALLOWED_CHARS[randomIndex];
  }

  return code;
}

export function generateUniqueVoucherCodes(
  count: number,
  existingCodes: Set<string>,
  length: number = 10,
): string[] {
  const codes: string[] = [];
  const maxAttempts = count * 10;
  let attempts = 0;

  while (codes.length < count && attempts < maxAttempts) {
    const code = generateVoucherCode(length);

    if (!existingCodes.has(code) && !codes.includes(code)) {
      codes.push(code);
    }
    attempts++;
  }

  if (codes.length < count) {
    throw new Error(
      `Could not generate ${count} unique codes. Only generated ${codes.length} codes.`,
    );
  }

  return codes;
}

export function isValidVoucherCodeFormat(code: string): boolean {
  if (!code || code.length < 6 || code.length > 20) {
    return false;
  }

  return /^[A-HJ-KM-NP-Z2-9]+$/.test(code.toUpperCase());
}

export function normalizeVoucherCode(code: string): string {
  return code.toUpperCase().replace(/[^A-HJ-KM-NP-Z2-9]/g, "");
}
