import React from "react";
import { useNavigate } from "react-router-dom";
import { useTendersList } from "../hooks/useTendersList";
import { PortfolioKpiCards } from "./PortfolioKpiCards";
import { TendersFilterBar } from "./TendersFilterBar";
import { TendersTable } from "./TendersTable";
import { ROUTE_PATHS } from "@/routes/routePaths";

export const PortfolioActiveWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const {
    sourceTenders,
    visualState,
    switchVisualState,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    filteredTenders,
    clearFilters,
  } = useTendersList();

  return (
    <div className="space-y-6">
      {/* Encabezado Principal con CTA Directo */}
      <div className="pb-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            Portafolio de Licitaciones
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Gestión centralizada de pliegos, matrices de cumplimiento y
            viabilidad.
          </p>
        </div>
      </div>

      {/* Indicadores Ejecutivos */}
      <section aria-label="Indicadores de Procesos">
        <PortfolioKpiCards visualState={visualState} items={sourceTenders} />
      </section>

      {/* Explorador y Tabla */}
      <section
        aria-label="Listado de Procesos Licitatorios"
        className="space-y-3"
      >
        <TendersFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onNewTenderClick={() => navigate(ROUTE_PATHS.TENDER_UPLOAD)}
        />

        <TendersTable
          items={filteredTenders}
          visualState={visualState}
          searchQuery={searchQuery}
          onOpenTender={(item) => {
            if (
              item.estado_pipeline.includes("Extracción") ||
              item.estado_pipeline.includes("Nuevo") || item.estado_pipeline === "Fallido"
            ) {
              navigate(`/licitaciones/${item.codigo_proceso}/progreso`);
            } else {
              navigate(`/licitaciones/${item.codigo_proceso}`);
            }
          }}
          onNewTenderClick={() => navigate(ROUTE_PATHS.TENDER_UPLOAD)}
          onClearFilters={clearFilters}
          onRetryConnection={() => switchVisualState("default")}
        />
      </section>
    </div>
  );
};
