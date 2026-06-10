// Impersonation helpers — store/retrieve admin-impersonation state in sessionStorage

const KEY = 'admin_impersonation';

export function startImpersonation(user) {
  sessionStorage.setItem(KEY, JSON.stringify({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    security_code: user.security_code,
  }));
}

export function stopImpersonation() {
  sessionStorage.removeItem(KEY);
}

export function getImpersonatedUser() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isImpersonating() {
  return !!getImpersonatedUser();
}