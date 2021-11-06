import { base64UrlEncode, base64UrlDecode } from './base64url';

describe('Base64Url', () => {
  const unencoded = 'test-email+alias123@gmail.com';
  const encoded = 'dGVzdC1lbWFpbCthbGlhczEyM0BnbWFpbC5jb20';

  it('encodes string', () => {
    expect(base64UrlEncode(unencoded)).toBe(encoded);
  });

  it('decodes string', () => {
    expect(base64UrlDecode(encoded)).toBe(unencoded);
  });

  it('encodes, decodes', () => {
    const encoded = base64UrlEncode(unencoded);
    expect(base64UrlDecode(encoded)).toBe(unencoded);
  });
});
