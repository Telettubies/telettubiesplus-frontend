import React, { useCallback } from 'react';
import { axiosClient as api } from '@/api/axiosClient';
import { ErrorBox, useAction, useResource } from './common';

export function ChatIndexRecovery({ licitacionId }: { licitacionId: string }) {
  const action = useAction();
  const trabajos = useResource(useCallback(async (signal: AbortSignal) => (await api.get(`/licitaciones/${licitacionId}/trabajos`, { signal })).data as { id: string; estado: string; error?: string; detalle?: { operacion?: string } }[], [licitacionId]), rows => rows.some(row => row.detalle?.operacion === 'chat' && ['en_cola', 'en_ejecucion'].includes(row.estado)));
  const ultimo = trabajos.data?.find(row => row.detalle?.operacion === 'chat');
  return <div><ErrorBox error={action.error || trabajos.error}/><button disabled={action.busy || !!ultimo && ['en_cola', 'en_ejecucion'].includes(ultimo.estado)} onClick={() => void action.run(async () => { await api.post(`/licitaciones/${licitacionId}/indexar-chat`); trabajos.refresh(); })}>Recuperar índice del chat</button>{ultimo && <p role="status">Índice del chat: {ultimo.estado}{ultimo.error ? ` · ${ultimo.error}` : ''}</p>}</div>;
}
