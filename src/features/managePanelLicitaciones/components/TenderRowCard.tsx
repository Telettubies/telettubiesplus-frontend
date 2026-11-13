import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import type { LicitacionPortafolioItem } from '@/api/types';
import { RecommendationBadge } from '@/shared/components/badges/RecommendationBadge';

interface TenderRowCardProps {
  item: LicitacionPortafolioItem;
  onOpenTender: (item: LicitacionPortafolioItem) => void;
}

export const TenderRowCard: React.FC<TenderRowCardProps> = ({ item, onOpenTender }) => {
  const isUrgent = item.dias_restantes <= 15;

  const renderPipelineBadge = () => {
    if (item.estado_pipeline === 'Completado') {
      return (
        <span className="text-emerald-700 text-xs font-medium">
          Completado
        </span>
      );
    }
    if (item.estado_pipeline === 'Fallido') {
      return (
        <span className="text-red-700 text-xs font-medium">
          Fallido
        </span>
      );
    }
    if (item.estado_pipeline === 'Nuevo Trabajo Registrado') {
      return (
        <div className="space-y-0.5">
          <span className="inline-block text-blue-700 text-xs font-medium">
            Nuevo Proceso
          </span>
          <p className="text-[11px] text-blue-600 underline">Ver progreso en vivo</p>
        </div>
      );
    }
    return (
      <span className="text-amber-700 text-xs font-medium">
        {item.estado_pipeline}
      </span>
    );
  };

  return (
    <tr
      onClick={() => onOpenTender(item)}
      className="hover:bg-slate-50/90 dark:hover:bg-[#232323] cursor-pointer transition-colors group"
    >
      <td className="py-4 px-4 text-xs font-medium text-slate-800 dark:text-zinc-200 whitespace-nowrap">
        {item.destacado ? `→ ${item.codigo_proceso}` : item.codigo_proceso}
      </td>
      <td className="py-4 px-4 text-xs font-semibold text-slate-900 dark:text-zinc-100 max-w-[200px] truncate">
        {item.entidad}
      </td>
      <td className="py-4 px-4 text-xs text-slate-600 dark:text-zinc-300 max-w-[280px] truncate">
        {item.objeto}
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <p className="text-xs font-normal text-slate-800 dark:text-zinc-200">{item.fecha_cierre}</p>
        <p
          className={`text-[11px] ${
            isUrgent ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-500 dark:text-zinc-400'
          }`}
        >
          {Number.isFinite(item.dias_restantes)?`${item.dias_restantes} días restantes`:'Sin fecha de cierre'}
        </p>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">{renderPipelineBadge()}</td>
      <td className="py-4 px-4 whitespace-nowrap">
        {item.recomendacion ? (
          <RecommendationBadge recomendacion={item.recomendacion} variant="table" />
        ) : (
          <span className="text-xs text-slate-400 dark:text-zinc-500">Sin recomendación</span>
        )}
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-right">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTender(item);
            }}
            className="text-xs font-medium text-brand-primary dark:text-[#3ECF8E] hover:underline"
          >
            Ver Matriz y Pliego
          </button>
          <span className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#2E2E2E] flex items-center justify-center text-slate-400 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200">
            <FiMoreVertical className="w-3.5 h-3.5" />
          </span>
        </div>
      </td>
    </tr>
  );
};

