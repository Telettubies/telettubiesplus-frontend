import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from './routePaths';
import { PrivateRoute } from './PrivateRoute';
import { RoleRoute } from './RoleRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterCompanyPage } from '@/pages/RegisterCompanyPage';
import { AcceptInvitationPage } from '@/pages/AcceptInvitationPage';
import { TendersListPage } from '@/pages/TendersListPage';
import { TenderUploadPage } from '@/pages/TenderUploadPage';
import { TenderProgressPage } from '@/pages/TenderProgressPage';
import { TenderAnalysisPage } from '@/pages/TenderAnalysisPage';
import { FocusedTenderPdfPage } from '@/pages/FocusedTenderPdfPage';
import { KnowledgeBasePage } from '@/pages/KnowledgeBasePage';
import { MembersManagementPage } from '@/pages/MembersManagementPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas de autenticación y registro */}
      <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.REGISTER} element={<RegisterCompanyPage />} />
      <Route path="/register" element={<RegisterCompanyPage />} />
      <Route path={ROUTE_PATHS.ACCEPT_INVITE} element={<AcceptInvitationPage />} />

      {/* Rutas privadas autenticadas */}
      <Route element={<PrivateRoute />}>
        <Route path={ROUTE_PATHS.ROOT} element={<Navigate to={ROUTE_PATHS.TENDERS_LIST} replace />} />
        <Route path={ROUTE_PATHS.TENDERS_LIST} element={<TendersListPage />} />
        <Route path={ROUTE_PATHS.TENDER_UPLOAD} element={<TenderUploadPage />} />
        <Route path={ROUTE_PATHS.TENDER_PROGRESS} element={<TenderProgressPage />} />
        <Route path={ROUTE_PATHS.TENDER_ANALYSIS} element={<TenderAnalysisPage />} />
        <Route path={ROUTE_PATHS.TENDER_FOCUSED_VIEW} element={<FocusedTenderPdfPage />} />

        {/* Rutas exclusivas de Administrador (HU-F03, HU-F04) */}
        <Route element={<RoleRoute allowedRole="administrador" />}>
          <Route path={ROUTE_PATHS.KNOWLEDGE_BASE} element={<KnowledgeBasePage />} />
          <Route path={ROUTE_PATHS.MEMBERS_MANAGEMENT} element={<MembersManagementPage />} />
        </Route>
      </Route>

      {/* Fallback a portafolio */}
      <Route path="*" element={<Navigate to={ROUTE_PATHS.TENDERS_LIST} replace />} />
    </Routes>
  );
};

