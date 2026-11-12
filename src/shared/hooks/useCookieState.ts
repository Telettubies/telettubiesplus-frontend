import { useState, useCallback } from 'react';
import { cookieStorage } from '../utils/cookieStorage';

export function useCookieState(cookieKey: string, defaultValue = ''): [string, (val: string) => void, () => void] {
  const [value, setValue] = useState<string>(() => cookieStorage.get(cookieKey) ?? defaultValue);

  const updateCookie = useCallback(
    (newVal: string) => {
      cookieStorage.set(cookieKey, newVal, 7);
      setValue(newVal);
    },
    [cookieKey]
  );

  const clearCookie = useCallback(() => {
    cookieStorage.remove(cookieKey);
    setValue(defaultValue);
  }, [cookieKey, defaultValue]);

  return [value, updateCookie, clearCookie];
}

