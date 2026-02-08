/**
 * Better Auth Configuration
 * Session-based authentication with httpOnly cookies
 * Phase 4: Enhanced for containerized/Kubernetes deployments
 */

export interface AuthConfig {
  secret: string;
  sessionMaxAge: number;
  cookieName: string;
  secureCookie: boolean;
  cookieDomain?: string;
  sameSite: 'strict' | 'lax' | 'none';
  trustProxy: boolean;
}

/**
 * Get authentication configuration from environment
 * Supports containerized deployments with configurable cookie domain
 */
export function getAuthConfig(): AuthConfig {
  const secret = process.env['AUTH_SECRET'];
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required');
  }

  const isProduction = process.env['NODE_ENV'] === 'production';
  const isKubernetes = !!process.env['KUBERNETES_SERVICE_HOST'];

  // Cookie domain for cross-subdomain sharing in K8s
  // Set COOKIE_DOMAIN=.example.com to share across subdomains
  const cookieDomain = process.env['COOKIE_DOMAIN'];

  // Trust proxy when running behind ingress controllers or load balancers
  const trustProxy = isProduction ||
    isKubernetes ||
    process.env['TRUST_PROXY'] === 'true';

  // SameSite policy:
  // - 'strict' for same-origin only (most secure)
  // - 'lax' for top-level navigation (default)
  // - 'none' for cross-site (requires secure=true)
  const sameSiteEnv = process.env['COOKIE_SAME_SITE'];
  const sameSite: 'strict' | 'lax' | 'none' =
    sameSiteEnv === 'strict' || sameSiteEnv === 'lax' || sameSiteEnv === 'none'
      ? sameSiteEnv
      : 'lax';

  return {
    secret,
    sessionMaxAge: parseInt(process.env['SESSION_MAX_AGE'] || '2592000', 10), // 30 days default
    cookieName: process.env['COOKIE_NAME'] || 'todo_session',
    secureCookie: isProduction || process.env['SECURE_COOKIE'] === 'true',
    cookieDomain,
    sameSite,
    trustProxy,
  };
}

/**
 * Get cookie options for Express session/auth middleware
 */
export function getCookieOptions(config: AuthConfig): {
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
} {
  return {
    maxAge: config.sessionMaxAge * 1000, // Convert to milliseconds
    httpOnly: true, // Always true for security
    secure: config.secureCookie,
    sameSite: config.sameSite,
    ...(config.cookieDomain && { domain: config.cookieDomain }),
    path: '/',
  };
}

/**
 * Validate auth configuration at startup
 * Throws if configuration is invalid or insecure in production
 */
export function validateAuthConfig(config: AuthConfig): void {
  const isProduction = process.env['NODE_ENV'] === 'production';

  // Check secret length
  if (config.secret.length < 32) {
    const message = 'AUTH_SECRET should be at least 32 characters for security';
    if (isProduction) {
      throw new Error(message);
    }
    console.warn(`[auth] Warning: ${message}`);
  }

  // Check secure cookie in production
  if (isProduction && !config.secureCookie) {
    throw new Error('Secure cookies must be enabled in production');
  }

  // Warn about sameSite=none without secure
  if (config.sameSite === 'none' && !config.secureCookie) {
    const message = 'sameSite=none requires secure=true';
    if (isProduction) {
      throw new Error(message);
    }
    console.warn(`[auth] Warning: ${message}`);
  }
}

// Lazy initialization to allow environment configuration
let _authConfig: AuthConfig | null = null;

export function getValidatedAuthConfig(): AuthConfig {
  if (!_authConfig) {
    _authConfig = getAuthConfig();
    validateAuthConfig(_authConfig);
  }
  return _authConfig;
}

// Legacy export for backward compatibility
export const authConfig = getAuthConfig();
