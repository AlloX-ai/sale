/**
 * Sonar / Echo OAuth + sale config.
 * Credentials come from the Echo founder dashboard:
 * https://app.echo.xyz/founder (Integration tab)
 *
 * Set these in `.env` / `.env.local` (Vite):
 *   VITE_SONAR_SALE_UUID
 *   VITE_SONAR_OAUTH_CLIENT_UUID
 *   VITE_SONAR_OAUTH_REDIRECT_URI  (must match dashboard; default /oauth/callback)
 */

const DEFAULT_FRONTEND_URL = "https://app.echo.xyz";
const DEFAULT_API_URL = "https://api.echo.xyz";

export const sonarSaleUUID = import.meta.env.VITE_SONAR_SALE_UUID || "";

export const sonarOAuthClientUUID =
  import.meta.env.VITE_SONAR_OAUTH_CLIENT_UUID || "";

export const sonarFrontendURL =
  import.meta.env.VITE_SONAR_FRONTEND_URL || DEFAULT_FRONTEND_URL;

export const sonarApiURL =
  import.meta.env.VITE_SONAR_API_URL || DEFAULT_API_URL;

/** Prefer explicit env; otherwise derive from the current origin at runtime. */
export function getSonarOAuthRedirectURI() {
  if (import.meta.env.VITE_SONAR_OAUTH_REDIRECT_URI) {
    return import.meta.env.VITE_SONAR_OAUTH_REDIRECT_URI;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/oauth/callback`;
  }
  return "https://app.allox.ai/oauth/callback";
}

/** True when OAuth client + sale UUID are configured. */
export const isSonarConfigured = Boolean(
  sonarOAuthClientUUID && sonarSaleUUID,
);

/** Config object for `SonarProvider`. */
export function getSonarProviderConfig() {
  return {
    clientUUID: sonarOAuthClientUUID,
    redirectURI: getSonarOAuthRedirectURI(),
    frontendURL: sonarFrontendURL,
    apiURL: sonarApiURL,
  };
}

/** Deep link into Sonar entity setup for this sale. */
export function getSonarHomeUrl(saleUUID = sonarSaleUUID) {
  if (!saleUUID) return `${sonarFrontendURL}/sonar`;
  return `${sonarFrontendURL}/sonar/${saleUUID}/home`;
}

export const SONAR_OAUTH_RETURN_PATH_KEY = "sonar_oauth_return_path";
