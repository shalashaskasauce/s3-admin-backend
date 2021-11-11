export function base64UrlEncode(
  input: string,
  charset: BufferEncoding = 'utf-8',
): string {
  const buff = Buffer.from(input, charset);
  // return buff.toString('base64url'); // node16+

  let s = buff.toString('base64').split('=')[0]; // Remove any trailing '='s
  s = s.replace('+', '-'); // 62nd char of encoding
  s = s.replace('/', '_'); // 63rd char of encoding
  return s;
}

export function base64UrlDecode(
  input: string,
  charset: BufferEncoding = 'utf-8',
): string {
  // node16+ for base64url :(
  // const buff = Buffer.from(input, 'base64url');
  // return buff.toString(charset);

  input = input.replace('-', '+'); // 62nd char of encoding
  input = input.replace('_', '/'); // 63rd char of encoding
  switch (input.length % 4) // Pad with trailing '='s
  {
      case 0: break; // No pad chars in this case
      case 2: input += "=="; break; // Two pad chars
      case 3: input += "="; break; // One pad char
  }
  const buff = Buffer.from(input, 'base64');
  return buff.toString(charset);
}
