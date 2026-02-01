export function parseJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export type UserRole = 'admin' | 'user';

export function getUserInfoFromToken(token: string): { id: string; username: string; role: UserRole } | null {
  try {
    const decoded = parseJWT(token);
    if (decoded && decoded.data) {
      const data = JSON.parse(decoded.data);
      return {
        id: data.id || '',
        username: data.username || '',
        role: (data.role as UserRole) || 'user',
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

