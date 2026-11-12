import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { CategoriaRequisito, ItemVerificable } from '@/api/types';
import { groupItemsByCategory, calculateStateCounts } from '../utils/countVerification';
import { ComplianceBadge } from '@/shared/components/badges/ComplianceBadge';

interface CategoryAccordionProps {
  items: ItemVerificable[];
  onSelectItem: (item: ItemVerificable) => void;
}

const CATEGORY_META: { key: CategoriaRequisito; title: string }[] = [
  { key: 'habilitante', title: 'Requisitos Habilitantes' },
  { key: 'tecnico', title: 'Requisitos Técnicos' },
  { key: 'experiencia', title: 'Requisitos de Experiencia' },
  { key: 'plazo', title: 'Requisitos de Plazo y Ejecución' },
];

export const CategoryAccordion: React.FC<CategoryAccordionProps> = ({ items, onSelectItem }) => {
  const grouped = groupItemsByCategory(items);
  const [openCategories, setOpenCategories] = useState<Record<CategoriaRequisito, boolean>>({
    habilitante: true,
    tecnico: false,
    experiencia: false,
    plazo: false,
  });

  const toggleCategory = (cat: CategoriaRequisito) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-2.5" data-testid="category-accordions">
      {CATEGORY_META.map(({ key, title }) => {
        const catItems = grouped[key] || [];
        const counts = calculateStateCounts(catItems);
        const isOpen = openCategories[key];

        return (
          <div
            key={key}
            data-testid={`accordion-${key}`}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleCategory(key)}
              className="w-full px-4 py-3 flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-900">{title}</span>
                <span className="font-mono text-[11px] text-slate-500">
                  ({catItems.length} ítems)
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-emerald-700">{counts.cumple} Cumple</span>
                <span className="text-amber-700">{counts.cumple_parcialmente} Parcial</span>
                <span className="text-red-700">{counts.no_cumple} No Cumple</span>
                {isOpen ? (
                  <FiChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <FiChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="p-3 divide-y divide-slate-100 text-xs">
                {catItems.length === 0 ? (
                  <p
                    data-testid={`empty-category-${key}`}
                    className="text-xs text-slate-400 italic py-2 px-2"
                  >
                    Categoría sin requisitos registrados en este pliego (0 ítems).
                  </p>
                ) : (
                  catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="py-2 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-semibold text-slate-900">
                          {item.codigo_req}
                        </span>
                        <span className="font-mono text-slate-500">Numeral {item.numeral}</span>
                        <span className="text-slate-700 truncate">{item.descripcion_item}</span>
                      </div>
                      <ComplianceBadge estado={item.estado} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

