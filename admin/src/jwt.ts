import crypto from 'node:crypto';

// Secret key for JWT HMAC-SHA256 signature
const JWT_SECRET = process.env.JWT_SECRET || 'octotech-universal-admin-secret-key-2026-secure-jwt';

// 24 hours session duration
export const SESSION_DURATION_SECONDS = 24 * 60 * 60; // 86400 seconds

export interface JwtPayload {
  sub: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function signJwt(
  payload: { username: string; fullName: string; email: string; role: string },
  expiresInSeconds: number = SESSION_DURATION_SECONDS
): { token: string; exp: number; expiresIn: number } {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  
  const fullPayload: JwtPayload = {
    sub: payload.email || payload.username,
    username: payload.username,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    iat,
    exp
  };

  const encodeB64Url = (obj: any): string => 
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const headerEncoded = encodeB64Url(header);
  const payloadEncoded = encodeB64Url(fullPayload);
  const data = `${headerEncoded}.${payloadEncoded}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  return {
    token: `${data}.${signature}`,
    exp,
    expiresIn: expiresInSeconds
  };
}

export function verifyJwt(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token təqdim edilməyib' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Yanlış JWT formatı' };
  }

  const [headerB64, payloadB64, signature] = parts;
  const data = `${headerB64}.${payloadB64}`;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, error: 'İmza yoxlanışı uğursuz oldu' };
  }

  try {
    const payload: JwtPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { 
        valid: false, 
        error: 'Sessiyanın müddəti bitmişdir, yenidən daxil olun', 
        payload 
      };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: 'Payload oxunarkən xəta: ' + err.message };
  }
}
