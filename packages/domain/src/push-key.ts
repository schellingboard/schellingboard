const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// Written out because this package's types have no `atob`.
export function urlBase64ToUint8Array(
  base64Url: string
): Uint8Array<ArrayBuffer> {
  const digits = [...base64Url.replace(/[+]/g, "-").replace(/[/]/g, "_")]
    .filter((char) => char !== "=")
    .map((char) => {
      const digit = ALPHABET.indexOf(char);
      if (digit < 0) throw new Error(`Not a base64url character: ${char}`);
      return digit;
    });
  const bytes = new Uint8Array(Math.floor((digits.length * 6) / 8));
  let bits = 0;
  let held = 0;
  let at = 0;
  for (const digit of digits) {
    bits = (bits << 6) | digit;
    held += 6;
    if (held >= 8) {
      held -= 8;
      bytes[at++] = (bits >> held) & 0xff;
      bits &= (1 << held) - 1;
    }
  }
  return bytes;
}
