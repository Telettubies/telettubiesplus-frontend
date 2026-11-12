import Cookies from 'js-cookie';

export const TOUR_COOKIE_NAME = 'criterio_guided_tour_v1';
export const TOUR_STORAGE_KEY = 'criterio_guided_tour_v1';

export const cookieStorage = {
  get(key: string): string | undefined {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const localVal = window.localStorage.getItem(key);
        if (localVal !== null) return localVal;
      }
    } catch {
      // fallback to cookies
    }
    return Cookies.get(key);
  },

  set(key: string, value: string, expiresDays = 7): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // ignore localStorage errors
    }
    Cookies.set(key, value, {
      expires: expiresDays,
      sameSite: 'Lax',
      path: '/',
    });
  },

  remove(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore localStorage errors
    }
    Cookies.remove(key, { path: '/' });
  },

  isTourCompleted(tourKey = TOUR_STORAGE_KEY): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = window.localStorage.getItem(tourKey);
        if (current === null) {
          window.localStorage.setItem(tourKey, 'pending');
          return false;
        }
        return current === 'completed';
      }
    } catch {
      // fallback to cookies
    }
    return Cookies.get(tourKey) === 'completed';
  },

  markTourCompleted(tourKey = TOUR_STORAGE_KEY): void {
    this.set(tourKey, 'completed', 30);
  },

  resetTour(tourKey = TOUR_STORAGE_KEY): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(tourKey, 'pending');
      }
    } catch {
      // ignore
    }
    Cookies.remove(tourKey, { path: '/' });
  },
};

