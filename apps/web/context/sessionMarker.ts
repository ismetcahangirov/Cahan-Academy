/**
 * Non-sensitive "admin is probably signed in" marker on the WEB origin.
 *
 * The refresh token is an HttpOnly cookie on the API origin (cahan-academy-api.vercel.app), which
 * the web middleware can never see. The middleware used to look for that cookie on the web origin,
 * so it redirected every /dashboard request (including client navigations after a successful
 * login) to /login. This marker only drives that UX redirect; it carries no token and grants
 * nothing. Real authorisation is enforced by the API on every request.
 */
export const ADMIN_MARKER_COOKIE = 'cahan_admin';

export function setAdminMarker(): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ADMIN_MARKER_COOKIE}=1; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

export function clearAdminMarker(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ADMIN_MARKER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
