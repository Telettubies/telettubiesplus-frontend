import React from 'react';
import { useOrganizationMembers } from '../hooks/useOrganizationMembers';
import { MembersTable } from './MembersTable';

export const MembersManagementView: React.FC = () => {
  const {
    members,
    inviteModalOpen,
    setInviteModalOpen,
    inviteError,
    blockedModalReason,
    setBlockedModalReason,
    pendingAction,
    setPendingAction,
    handleInvite,
    requestRoleToggle,
    requestRemoveMember,
    confirmPendingAction,
  } = useOrganizationMembers();

  return (
    <MembersTable
      members={members}
      inviteModalOpen={inviteModalOpen}
      setInviteModalOpen={setInviteModalOpen}
      inviteError={inviteError}
      blockedModalReason={blockedModalReason}
      setBlockedModalReason={setBlockedModalReason}
      pendingAction={pendingAction}
      setPendingAction={setPendingAction}
      onInvite={handleInvite}
      onRequestRoleToggle={requestRoleToggle}
      onRequestRemove={requestRemoveMember}
      onConfirmPendingAction={confirmPendingAction}
      showActionsColumn
    />
  );
};

