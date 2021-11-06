export function base64UrlEncode(
  input: string,
  charset: BufferEncoding = 'utf-8',
): string {
  const buff = Buffer.from(input, charset);
  return buff.toString('base64url');
}

export function base64UrlDecode(
  input: string,
  charset: BufferEncoding = 'utf-8',
): string {
  const buff = Buffer.from(input, 'base64url');
  return buff.toString(charset);
}
