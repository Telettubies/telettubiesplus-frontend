import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { AuthProvider, useAuth } from '@/shared/hooks/useAuth';
import { LoginForm } from '@/features/manageAuth/components/LoginForm';
import { RegisterCompanyForm } from '@/features/manageAuth/components/RegisterCompanyForm';
import { supabaseClient } from '@/features/manageAuth/services/authService';
const flags=['VITE_USE_MOCKS','VITE_MOCK_AUTH','VITE_MOCK_PANEL','VITE_MOCK_CONOCIMIENTO'];
let previous:Record<string,string|undefined>;
beforeEach(()=>{
 previous=Object.fromEntries(flags.map(k=>[k,process.env[k]]));
 process.env.VITE_USE_MOCKS='true';
 process.env.VITE_MOCK_AUTH='false';process.env.VITE_MOCK_PANEL='false';process.env.VITE_MOCK_CONOCIMIENTO='false';
 sessionStorage.clear();localStorage.clear();
});
afterEach(()=>{for(const k of flags){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}jest.restoreAllMocks();});
function Profile(){const a=useAuth();return <p data-testid="profile">{a.user?.organizacion_nombre}|{a.user?.correo}|{a.user?.rol}</p>;}
it('true activa todos los mocks aunque queden flags granulares apagados',()=>{
 for(const key of ['VITE_MOCK_AUTH','VITE_MOCK_PANEL','VITE_MOCK_CONOCIMIENTO'])expect(shouldUseMock(key)).toBe(true);
 expect(shouldUseMock()).toBe(true);
 process.env.VITE_USE_MOCKS='false';expect(shouldUseMock()).toBe(false);expect(shouldUseMock('VITE_MOCK_AUTH')).toBe(false);
 process.env.VITE_USE_MOCKS='true';
});
it('mantiene flags granulares cuando no se define el interruptor global',()=>{
 delete process.env.VITE_USE_MOCKS;expect(shouldUseMock('VITE_MOCK_PANEL')).toBe(false);process.env.VITE_MOCK_PANEL='true';expect(shouldUseMock('VITE_MOCK_PANEL')).toBe(true);
});
it('el proveedor mock mantiene el perfil y selector de roles originales',()=>{
 function RoleProbe(){const a=useAuth();return <><Profile/><button onClick={()=>a.switchDemoRole('revisor')}>Cambiar</button></>;}
 render(<AuthProvider><RoleProbe/></AuthProvider>);
 expect(screen.getByTestId('profile')).toHaveTextContent('Constructora Andina S.A.S.');expect(screen.getByTestId('profile')).toHaveTextContent('administrador');
 fireEvent.click(screen.getByText('Cambiar'));expect(screen.getByTestId('profile')).toHaveTextContent('revisor');
});
it('login original funciona sin consultar Supabase real',async()=>{
 const realLogin=jest.spyOn(supabaseClient.auth,'signInWithPassword');const onSuccess=jest.fn();
 render(<MemoryRouter><AuthProvider initialAuthenticated={false}><LoginForm onSuccessRedirect={onSuccess}/><Profile/></AuthProvider></MemoryRouter>);
 expect(screen.getByText('Continue with Google')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText(/^Contraseña$/i),{target:{value:'Password123!'}});
 fireEvent.click(screen.getByTestId('login-submit-button'));
 await waitFor(()=>expect(onSuccess).toHaveBeenCalled());
 expect(screen.getByTestId('profile')).toHaveTextContent('administrador');expect(realLogin).not.toHaveBeenCalled();
});
it('registro original conserva los cuatro pasos y crea un perfil de demo',async()=>{
 process.env.VITE_MOCK_AUTH='true';
 render(<MemoryRouter initialEntries={['/registro']}><AuthProvider initialAuthenticated={false}><Routes><Route path="/registro" element={<RegisterCompanyForm/>}/><Route path="/licitaciones" element={<Profile/>}/></Routes></AuthProvider></MemoryRouter>);
 expect(screen.getByText('Registro de Organización en CRITERIO')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText(/Nombre o razón social/),{target:{value:'Empresa Mock Original'}});
 fireEvent.click(screen.getByTestId('register-step-card-2'));
 fireEvent.change(screen.getByLabelText(/Nombre completo/),{target:{value:'Persona de Prueba'}});
 fireEvent.change(screen.getByLabelText(/Correo electrónico corporativo/),{target:{value:'admin@mock.example'}});
 fireEvent.change(document.getElementById('reg-admin-pass')!,{target:{value:'Password123!'}});
 fireEvent.change(document.getElementById('reg-admin-confirm')!,{target:{value:'Password123!'}});
 fireEvent.click(screen.getByTestId('register-step-card-3'));expect(screen.getByText('Revise y confirme los datos de su organización')).toBeInTheDocument();
 fireEvent.submit(screen.getByTestId('register-submit-btn').closest('form')!);
 await waitFor(()=>expect(screen.getByTestId('profile')).toHaveTextContent('Empresa Mock Original'));
 expect(screen.getByTestId('profile')).toHaveTextContent('admin@mock.example');
});

it('Continuar no envía accidentalmente el formulario al cambiar de paso',()=>{
 render(<MemoryRouter><AuthProvider><RegisterCompanyForm/></AuthProvider></MemoryRouter>);
 fireEvent.change(screen.getByLabelText(/Nombre o razón social/),{target:{value:'Empresa de prueba'}});
 const event=new MouseEvent('click',{bubbles:true,cancelable:true});
 fireEvent(screen.getByTestId('register-next-btn'),event);
 expect(event.defaultPrevented).toBe(true);
 expect(screen.getByText('Cuenta del administrador principal')).toBeInTheDocument();
});
