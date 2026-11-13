import { services } from '@/features/connected/services';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { notifyError } from '@/features/connected/adapters';
import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import type { ItemVerificable } from '@/api/types';
import { sanitizeSpreadsheetCell } from '@/shared/utils/sanitizeText';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';

interface ExportExcelButtonProps {
  codigoProceso: string;
  items: ItemVerificable[];
  pendingReviewCount: number;
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  codigoProceso,
  items,
  pendingReviewCount,
}) => {
  const [showWarningModal, setShowWarningModal] = useState(false);

  const triggerDownload = () => {
    setShowWarningModal(false);
    if(!shouldUseMock()){void services.excel(codigoProceso).then(blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`matriz-${codigoProceso}.xlsx`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}).catch(notifyError);return;}
    const headers = [
      'ID Requisito',
      'Numeral',
      'Página PDF',
      'Categoría',
      'Requisito Resumido',
      'Estado',
      'Evidencia Vinculada',
      'Brecha / Faltante',
      'Revisado Manualmente',
    ];

    const rows = items.map((i) => [
      sanitizeSpreadsheetCell(i.codigo_req),
      sanitizeSpreadsheetCell(i.numeral),
      sanitizeSpreadsheetCell(i.ubicacion.pagina),
      sanitizeSpreadsheetCell(i.categoria),
      sanitizeSpreadsheetCell(i.descripcion_item),
      sanitizeSpreadsheetCell(i.estado),
      sanitizeSpreadsheetCell(i.evidencia?.fuente_nombre || '—'),
      sanitizeSpreadsheetCell(i.faltante || 'Ninguno'),
      sanitizeSpreadsheetCell((i.revisiones ?? []).length > 0 ? 'Sí' : 'No'),
    ]);

    const csvContent = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Matriz_Cobertura_${codigoProceso}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClick = () => {
    if (pendingReviewCount > 0) {
      setShowWarningModal(true);
    } else {
      triggerDownload();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        data-testid="export-excel-btn"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
        title="Descargar matriz en formato CSV / Excel"
      >
        <FiDownload className="w-3 h-3 text-slate-500" />
        <span>Exportar Matriz a Excel</span>
      </button>

      <ConfirmModal
        isOpen={showWarningModal}
        title="Requisitos pendientes de revisión"
        description={`Existen ${pendingReviewCount} requisitos pendientes de revisión manual. El archivo exportado incluirá estos puntos como pendientes. ¿Desea descargar la matriz ahora?`}
        confirmLabel="Descargar matriz"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={triggerDownload}
        onCancel={() => setShowWarningModal(false)}
      />
    </>
  );
};

