import {shouldUseMock} from '@/shared/utils/mockSwitch';
import {supabaseClient} from '../services/authService';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { validateEnterprisePassword } from '../utils/authValidators';
import { MOCK_INVITATION_METADATA } from '../mockups/auth.mock';
import { useAuth, DEMO_REVISOR_PROFILE } from '@/shared/hooks/useAuth';

export type InvitationScreenState =
  | 'default'
  | 'weak_password'
  | 'expired_link'
  | 'provisioning'
  | 'configured';

export function useAcceptInvitation() {
  const { loginWithProfile,user,reloadIdentity } = useAuth();
  const [fullName, setFullName] = useState(shouldUseMock()?'Laura Gómez':'');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [screenState, setScreenState] = useState<InvitationScreenState>('default');

  const [invitationEmail,setInvitationEmail]=useState('');
  const [invitationError,setInvitationError]=useState<string|null>(null);
  useEffect(()=>{if(shouldUseMock())return;let alive=true;supabaseClient.auth.getSession().then(({data})=>{if(!alive)return;setInvitationEmail(data.session?.user.email||'');if(!data.session)setScreenState('expired_link');});return()=>{alive=false;};},[]);
  const validation = useMemo(
    () => validateEnterprisePassword(password, confirmPassword),
    [password, confirmPassword]
  );

  const handleSubmitInvitation = useCallback(
    async (onCompletedRedirect?: () => void) => {
      if (screenState === 'expired_link') return;

      if (!validation.isValid) {
        setScreenState('weak_password');
        return;
      }

      if(!shouldUseMock()){setScreenState('provisioning');const {error}=await supabaseClient.auth.updateUser({password,data:{full_name:fullName}});if(error){setInvitationError(error.message);setScreenState('default');return;}setScreenState('configured');reloadIdentity?.();onCompletedRedirect?.();return;}
      setScreenState('provisioning');
      await new Promise((res) => setTimeout(res, 450));
      setScreenState('configured');
      loginWithProfile(
        {
          ...DEMO_REVISOR_PROFILE,
          nombre: fullName || DEMO_REVISOR_PROFILE.nombre,
        },
        'jwt-invited-revisor-token'
      );
      if (onCompletedRedirect) {
        setTimeout(onCompletedRedirect, 550);
      }
    },
    [fullName, password, loginWithProfile, reloadIdentity, screenState, validation.isValid]
  );

  return {
    invitationError,
    metadata: shouldUseMock()?MOCK_INVITATION_METADATA:{organizacion:user?.organizacion_nombre||'Tu organización',tenantId:user?.organizacion_nombre||'',rolAsignado:user?.rol==='administrador'?'Administrador':user?.rol==='revisor'?'Revisor':'Asignado por la organización',invitadoPorRol:'Administrador de la organización',invitadoPorCorreo:'',fechaEnvio:'No disponible',correoInvitado:invitationEmail,estadoToken:screenState==='expired_link'?'Expired' as const:'Valid' as const,expiracionTexto:'Validado por Supabase'},
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validation,
    screenState,
    setScreenState,
    handleSubmitInvitation,
  };
}

