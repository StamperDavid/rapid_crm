/**
 * API Configuration
 * 
 * This module provides environment-aware API configuration following industry best practices:
 * - Development: Uses Vite proxy for seamless development experience
 * - Production: Uses environment variables for deployment flexibility
 * - Fallback: Graceful degradation with sensible defaults
 */

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

/**
 * Get API configuration based on current environment
 */
export function getApiConfig(): ApiConfig {
  // In development, use relative URLs to leverage Vite proxy
  if (import.meta.env.DEV) {
    return {
      baseUrl: '/api',
      timeout: 10000,
      retryAttempts: 3,
    };
  }

  // In production, use environment variables with fallbacks
  const apiHost = import.meta.env.VITE_API_HOST || window.location.hostname;
  const apiPort = import.meta.env.VITE_API_PORT || '3001';
  const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'http';

  return {
    baseUrl: `${apiProtocol}://${apiHost}:${apiPort}/api`,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  };
}

/**
 * Get the current API base URL
 */
export function getApiBaseUrl(): string {
  const config = getApiConfig();
  console.log('[getApiBaseUrl] Config:', config);
  console.log('[getApiBaseUrl] Environment:', import.meta.env.MODE);
  console.log('[getApiBaseUrl] DEV:', import.meta.env.DEV);
  return config.baseUrl;
}

/**
 * Log current API configuration (for debugging)
 */
export function logApiConfig(): void {
  const config = getApiConfig();
  console.log('[ApiConfig] Current configuration:', {
    baseUrl: config.baseUrl,
    environment: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
  });
}
