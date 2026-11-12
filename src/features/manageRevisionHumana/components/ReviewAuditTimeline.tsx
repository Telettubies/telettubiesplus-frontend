import React from 'react';

export interface AuditEntry {
  id: string;
  codigo: string;
  autor: string;
  fecha: string;
  comentario: string;
}

export interface ReviewAuditTimelineProps {
  entries: AuditEntry[];
}

export const ReviewAuditTimeline: React.FC<ReviewAuditTimelineProps> = ({ entries }) => {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">
        Historial de Resoluciones Auditadas (HU-B23)
      </h4>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-[12px]"
          >
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span className="font-semibold text-slate-800">{entry.codigo}</span>
              <span>
                {entry.autor} · {entry.fecha}
              </span>
            </div>
            <p className="mt-1 text-slate-700">{entry.comentario}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

