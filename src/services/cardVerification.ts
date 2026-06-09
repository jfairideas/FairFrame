const SERIAL_CHARS = "0123456789ABCDEF";

export function generateDisplaySerial(year = new Date().getFullYear()): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += SERIAL_CHARS[Math.floor(Math.random() * SERIAL_CHARS.length)];
  }
  return `FF-${year}-${code}`;
}

export function isValidDisplaySerial(serial: string): boolean {
  return /^FF-\d{4}-[0-9A-F]{6}$/.test(serial);
}
