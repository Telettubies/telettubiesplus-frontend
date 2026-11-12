import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '@/shared/hooks/useAuth';
import { useLogin } from '../hooks/useLogin';

describe('useLogin Hook (HU-F01)', () => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(AuthProvider, null, children);

  it('inicializa con el correo corporativo por defecto y permite cambiar estado visual', () => {
    const { result } = renderHook(() => useLogin(false), { wrapper });

    expect(result.current.email).toBe('admin@constructoraandina.com.co');
    expect(result.current.visualState).toBe('default');

    act(() => {
      result.current.setVisualState('invalid_credentials');
    });

    expect(result.current.visualState).toBe('invalid_credentials');
  });
});
