import { useParams } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { services } from '@/features/connected/services';
import { emptyMatrix,matrixView } from '@/features/connected/adapters';
import { useState, useCallback, useEffect } from 'react';
import { MOCK_RESULTADO_LICITACION } from '../mockups/matrizResultado.mock';
import { sortGapsHabilitantesFirst } from '../utils/sortGapsHabilitantesFirst';
import type {
  ResultadoLicitacion,
  ItemVerificable,
  EstadoCumplimiento,
  RecomendacionLicitacion,
} from '@/api/types';

export type MatrixVisualPreset =
  | 'default' // Pág. 32: REQ-014 Cita verificada 100%
  | 'unverified_citation' // Pág. 36: Cita No Verificada en Fuente (78% < 85%)
  | 'expired_pdf_url' // Pág. 35: URL temporal S3 expirada
  | 'skeleton'; // Pág. 37: Skeleton loading

export function useTenderMatrix(initialResult: ResultadoLicitacion = MOCK_RESULTADO_LICITACION) {
  const mock=shouldUseMock('VITE_MOCK_MATRIZ');
  const {id=''}=useParams();const {user}=useAuth();
  const [resultado, setResultado] = useState<ResultadoLicitacion>(()=>mock?initialResult:emptyMatrix(id));
  const [isLoading,setLoading]=useState(!mock);const [error,setError]=useState<string|null>(null);const [revision,refresh]=useState(0);
  useEffect(()=>{if(mock||!id)return;const c=new AbortController();let timer:ReturnType<typeof setTimeout>;setLoading(true);setError(null);const load=async()=>{try{const value=await services.result(id,c.signal);if(c.signal.aborted)return;if(value.kind==='ready'){const matrix=matrixView(value.value);setResultado(matrix);setSelectedItem(previous=>previous?matrix.items.find(item=>item.id===previous.id)||null:null);setLoading(false);}else if(value.kind==='failed'){setLoading(false);setError(value.value.error||'El análisis falló. Reinténtalo desde progreso.');}else timer=setTimeout(load,2000);}catch(e){if(!c.signal.aborted){setError((e as Error).message);setLoading(false);}}};void load();const invalidate=()=>refresh(n=>n+1);window.addEventListener('criterio:resultado',invalidate);return()=>{c.abort();clearTimeout(timer);window.removeEventListener('criterio:resultado',invalidate);};},[id,mock,user?.organizacion_id,revision]);
  // Por defecto el mock no selecciona ningún ítem hasta que el usuario haga clic
  const [selectedItem, setSelectedItem] = useState<ItemVerificable | null>(null);
  const [expandedDetailItem, setExpandedDetailItem] = useState<ItemVerificable | null>(null);
  useEffect(() => {
    if (!mock) { setResultado(emptyMatrix(id)); setSelectedItem(null); setExpandedDetailItem(null); }
  }, [id, user?.organizacion_id, mock]);
  const [visualPreset, setVisualPreset] = useState<MatrixVisualPreset>('default');

  const applyHumanReviewUpdate = useCallback(
    (
      itemId: string,
      nuevoEstado: EstadoCumplimiento,
      comentario: string,
      autorNombre = 'Laura Gómez'
    ) => {
      if(!mock){window.dispatchEvent(new Event('criterio:resultado'));return;}
      setResultado((prev) => {
        const updatedItems = prev.items.map((item) => {
          if (item.id !== itemId && item.codigo_req !== itemId) return item;
          const newHistory = [
            ...(item.revisiones ?? []),
            {
              id: `rev-${Date.now()}`,
              autor_nombre: autorNombre,
              fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
              estado_anterior: item.estado,
              estado_nuevo: nuevoEstado,
              comentario,
            },
          ];
          return {
            ...item,
            estado: nuevoEstado,
            revisiones: newHistory,
          };
        });

        const hasHabilitanteNoCumple = updatedItems.some(
          (i) => i.categoria === 'habilitante' && i.estado === 'no_cumple'
        );
        const nextRecomendacion: RecomendacionLicitacion =
          nuevoEstado === 'no_cumple' && hasHabilitanteNoCumple
            ? 'no_presentarse'
            : prev.recomendacion;

        return {
          ...prev,
          recomendacion: nextRecomendacion,
          items: updatedItems,
          brechas: sortGapsHabilitantesFirst(updatedItems),
        };
      });
    },
    [mock]
  );

  return {
    isLoading,error,reloadResult:()=>refresh(n=>n+1),
    resultado,
    setResultado,
    selectedItem,
    setSelectedItem,
    expandedDetailItem,
    setExpandedDetailItem,
    visualPreset,
    setVisualPreset,
    applyHumanReviewUpdate,
  };
}

