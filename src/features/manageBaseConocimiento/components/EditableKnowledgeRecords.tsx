import React, { useState, useEffect } from 'react';
import {
  FiFileText,
  FiPlus,
  FiSave,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiFolder,
} from 'react-icons/fi';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

export type KnowledgeRecordCategory = 'contratos' | 'equipo' | 'financiero';

export interface EditableKnowledgeRecord {
  id: string;
  categoria: KnowledgeRecordCategory;
  codigo: string;
  titulo: string;
  detalle: string;
  valorMetrica: string;
  clasificacion: string;
  archivoFuente: string;
  ubicacionFuente: string;
  estado: 'Verificado' | 'Editado' | 'En revisión';
}

export interface SourceFileMeta {
  nombre: string;
  tipo: string;
  fechaCarga: string;
  registrosExtraidos: number;
  fragmentosVectoriales: number;
}

const INITIAL_SOURCE_FILES: SourceFileMeta[] = [
  {
    nombre: 'contratos.json v0.3',
    tipo: 'JSON Estructurado',
    fechaCarga: '2026-10-14 11:22',
    registrosExtraidos: 42,
    fragmentosVectoriales: 310,
  },
  {
    nombre: 'Soportes_Liquidacion_Obras.zip',
    tipo: 'Paquete PDF / Actas',
    fechaCarga: '2026-10-14 11:22',
    registrosExtraidos: 42,
    fragmentosVectoriales: 124,
  },
  {
    nombre: 'Hojas_de_Vida_Equipo_Clave.zip',
    tipo: 'Certificaciones y HV',
    fechaCarga: '2026-10-14 11:22',
    registrosExtraidos: 18,
    fragmentosVectoriales: 54,
  },
  {
    nombre: 'Certificado_RUP_Financiero_2026.pdf',
    tipo: 'Documento RUP Oficial',
    fechaCarga: '2026-10-14 11:22',
    registrosExtraidos: 8,
    fragmentosVectoriales: 24,
  },
];

const INITIAL_RECORDS: EditableKnowledgeRecord[] = [
  {
    id: 'REC-001',
    categoria: 'contratos',
    codigo: 'CON-2024-C08',
    titulo: 'Rehabilitación y Pavimentación Corredor Vial Norte',
    detalle: 'INVIAS · 5.000 m² pavimentación asfáltica en vías primarias',
    valorMetrica: '14.850 SMMLV',
    clasificacion: 'UNSPSC 72141000',
    archivoFuente: 'contratos.json v0.3 / Acta_C08.pdf',
    ubicacionFuente: 'Línea 18 · Pág. 12',
    estado: 'Verificado',
  },
  {
    id: 'REC-002',
    categoria: 'contratos',
    codigo: 'CON-2023-A19',
    titulo: 'Construcción Puente Vehicular y Accesos Urbanos',
    detalle: 'Gobernación de Antioquia · Estructura en concreto postensado',
    valorMetrica: '21.300 SMMLV',
    clasificacion: 'UNSPSC 72141100',
    archivoFuente: 'contratos.json v0.3 / Acta_A19.pdf',
    ubicacionFuente: 'Línea 64 · Pág. 4',
    estado: 'Verificado',
  },
  {
    id: 'REC-003',
    categoria: 'contratos',
    codigo: 'CON-2022-M04',
    titulo: 'Mejoramiento Geométrico y Señalización Vial Troncal',
    detalle: 'ANI · Señalización horizontal y defensas metálicas 48 km',
    valorMetrica: '9.420 SMMLV',
    clasificacion: 'UNSPSC 72141003',
    archivoFuente: 'contratos.json v0.3',
    ubicacionFuente: 'Línea 102 · Pág. 8',
    estado: 'Verificado',
  },
  {
    id: 'REC-004',
    categoria: 'equipo',
    codigo: 'PER-DIR-01',
    titulo: 'Ing. Carlos Alberto Castro — Director de Obra',
    detalle: 'Ingeniero Civil · Especialista en Gerencia de Obras Civiles',
    valorMetrica: '9 años exp. específica',
    clasificacion: 'Matrícula COPNIA Vigente',
    archivoFuente: 'HV_Dir_Obra_Castro.pdf',
    ubicacionFuente: 'Pág. 2 · Folio 14',
    estado: 'Verificado',
  },
  {
    id: 'REC-005',
    categoria: 'equipo',
    codigo: 'PER-SST-02',
    titulo: 'Ing. Valentina Ríos — Especialista Ambiental y SST',
    detalle: 'Licencia SST vigente · Auditora Líder ISO 14001 / 45001',
    valorMetrica: '7 años exp. específica',
    clasificacion: 'ISO 14001 / 45001',
    archivoFuente: 'Hojas_de_Vida_Equipo_Clave.zip',
    ubicacionFuente: 'HV_Valentina_Rios.pdf · Pág. 1',
    estado: 'Verificado',
  },
  {
    id: 'REC-006',
    categoria: 'financiero',
    codigo: 'FIN-LIQ-2026',
    titulo: 'Índice de Liquidez (Activo Corriente / Pasivo Corriente)',
    detalle: 'Corte Fiscal 2025-12-31 · Validado en Cámara de Comercio',
    valorMetrica: '1,38 veces',
    clasificacion: 'RUP Financiero',
    archivoFuente: 'Certificado_RUP_Financiero_2026.pdf',
    ubicacionFuente: 'Sección 4.1 · Pág. 6',
    estado: 'Verificado',
  },
  {
    id: 'REC-007',
    categoria: 'financiero',
    codigo: 'FIN-END-2026',
    titulo: 'Nivel de Endeudamiento Total',
    detalle: 'Pasivo Total / Activo Total · Capacidad Residual K Validada',
    valorMetrica: '44,2 %',
    clasificacion: 'K = 68.500 SMMLV',
    archivoFuente: 'Certificado_RUP_Financiero_2026.pdf',
    ubicacionFuente: 'Sección 4.2 · Pág. 7',
    estado: 'Verificado',
  },
];

export interface EditableKnowledgeRecordsProps {
  initialRecords?: EditableKnowledgeRecord[];
}

export const EditableKnowledgeRecords: React.FC<EditableKnowledgeRecordsProps> = ({
  initialRecords = INITIAL_RECORDS,
}) => {
  const [records, setRecords] = useState<EditableKnowledgeRecord[]>(initialRecords);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);
  const [activeCategory, setActiveCategory] = useState<'todos' | KnowledgeRecordCategory>('todos');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleFieldChange = (
    id: string,
    field: keyof EditableKnowledgeRecord,
    value: string
  ) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? {
              ...rec,
              [field]: value,
              estado: 'Editado',
            }
          : rec
      )
    );
  };

  const handleAddRecord = () => {
    const targetCategory: KnowledgeRecordCategory =
      activeCategory === 'todos' ? 'contratos' : activeCategory;
    const newId = `REC-${String(records.length + 1).padStart(3, '0')}`;
    const newRecord: EditableKnowledgeRecord = {
      id: newId,
      categoria: targetCategory,
      codigo: `NUEVO-${records.length + 1}`,
      titulo: 'Nuevo registro de capacidad organizacional',
      detalle: 'Especifique entidad, alcance o certificación acreditada',
      valorMetrica: '1.000 SMMLV',
      clasificacion: 'UNSPSC 72141000',
      archivoFuente: 'contratos.json v0.3 (Edición Manual)',
      ubicacionFuente: 'Agregado en plataforma',
      estado: 'Editado',
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleRemoveRecord = (id: string) => {
    setRecords((prev) => prev.filter((rec) => rec.id !== id));
  };

  const handleSaveAll = () => {
    setRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        estado: 'Verificado',
      }))
    );
    setSavedNotice('Cambios guardados correctamente.');
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const filteredRecords = records.filter((rec) => {
    const matchesCat = activeCategory === 'todos' || rec.categoria === activeCategory;
    const matchesSource =
      selectedSourceFilter === 'todos' ||
      rec.archivoFuente.toLowerCase().includes(selectedSourceFilter.toLowerCase());
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      rec.codigo.toLowerCase().includes(q) ||
      rec.titulo.toLowerCase().includes(q) ||
      rec.detalle.toLowerCase().includes(q) ||
      rec.archivoFuente.toLowerCase().includes(q) ||
      rec.clasificacion.toLowerCase().includes(q);
    return matchesCat && matchesSource && matchesSearch;
  });

  return (
    <section data-tour="knowledge-editable-records" className="space-y-8 pt-4">
      {/* 1. Fuentes Documentales y Archivos de Origen */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className={`${TYPOGRAPHY.title} text-base`}>
              Archivos Fuente y Trazabilidad de Origen
            </h2>
            <p className={TYPOGRAPHY.body}>
              Seleccione un archivo fuente para filtrar qué registros e información provienen de cada documento cargado.
            </p>
          </div>
          {selectedSourceFilter !== 'todos' && (
            <button
              type="button"
              onClick={() => setSelectedSourceFilter('todos')}
              className={`${TYPOGRAPHY.label} text-slate-900 underline`}
            >
              Mostrar todos los archivos fuente
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-white/50 text-center">
            <p className="text-xs font-medium text-slate-600">
              No hay archivos de origen cargados en la base de conocimiento
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Cargue contratos.json, archivos ZIP con soportes o certificados RUP en la sección superior para comenzar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INITIAL_SOURCE_FILES.map((file) => {
              const isSelected = selectedSourceFilter === file.nombre.split(' ')[0];
              return (
                <button
                  key={file.nombre}
                  type="button"
                  onClick={() =>
                    setSelectedSourceFilter(isSelected ? 'todos' : file.nombre.split(' ')[0])
                  }
                  className={`text-left py-3.5 px-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-primary bg-white ring-1 ring-brand-primary'
                      : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-slate-900 font-semibold text-xs truncate">
                      <FiFolder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{file.nombre}</span>
                    </span>
                  </div>
                  <p className={`${TYPOGRAPHY.label} block`}>{file.tipo}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>{file.registrosExtraidos} registros</span>
                    <span className="text-emerald-700 font-medium text-xs">Activo</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Tabla Detallada y Editable de Información Extraída */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className={`${TYPOGRAPHY.title} text-base`}>
              Información Detallada y Editable de la Organización
            </h2>
            <p className={TYPOGRAPHY.body}>
              Edite cualquier campo directamente para ajustar valores, códigos UNSPSC, certificaciones o referencias al archivo de origen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleAddRecord}
              data-testid="add-knowledge-record-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Agregar Registro</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              data-testid="save-knowledge-records-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
            >
              <FiSave className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        {savedNotice && (
          <div
            role="status"
            data-testid="knowledge-saved-banner"
            className="flex items-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
          >
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Filter & Search Bar directly on canvas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'todos', label: `Todos (${records.length})` },
                {
                  id: 'contratos',
                  label: `Contratos (${records.filter((r) => r.categoria === 'contratos').length})`,
                },
                {
                  id: 'equipo',
                  label: `Equipo y HV (${records.filter((r) => r.categoria === 'equipo').length})`,
                },
                {
                  id: 'financiero',
                  label: `Financieros y RUP (${records.filter((r) => r.categoria === 'financiero').length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-white/80 text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar contrato, perfil, archivo..."
              aria-label="Buscar en registros de la base de conocimiento"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>

        {/* Open Editable Table */}
        <div className="overflow-x-auto border-y border-slate-200 bg-white/60">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Código</th>
                <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Título / Concepto y Alcance</th>
                <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Valor / Métrica</th>
                <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Clasificación / UNSPSC</th>
                <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Archivo Fuente y Origen</th>
                <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Estado</th>
                <th className={`py-3.5 px-4 text-right ${TYPOGRAPHY.label}`}>Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <p className="text-xs font-semibold text-slate-800 mb-1">
                      No hay registros ni contratos cargados en la base de conocimiento
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                      Sube tus archivos de experiencia (contratos.json o contratos.zip) o carga los datos simulados de demostración.
                    </p>
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleAddRecord}
                        className="px-4 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover cursor-pointer shadow-2xs"
                      >
                        + Añadir registro manual
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center">
                    <p className="text-xs font-semibold text-slate-700">
                      No se encontraron registros que coincidan con la búsqueda o categoría seleccionada
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-white transition-colors align-top">
                  {/* Código editable */}
                  <td className="py-4 px-4 w-36">
                    <input
                      type="text"
                      aria-label={`Código de ${rec.id}`}
                      value={rec.codigo}
                      onChange={(e) => handleFieldChange(rec.id, 'codigo', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
                    />
                  </td>

                  {/* Título y Detalle editables */}
                  <td className="py-4 px-4 space-y-1.5 min-w-[260px]">
                    <input
                      type="text"
                      aria-label={`Título de ${rec.id}`}
                      value={rec.titulo}
                      onChange={(e) => handleFieldChange(rec.id, 'titulo', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      aria-label={`Detalle de ${rec.id}`}
                      value={rec.detalle}
                      onChange={(e) => handleFieldChange(rec.id, 'detalle', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white bg-transparent text-xs text-slate-600 focus:outline-none"
                    />
                  </td>

                  {/* Valor / Métrica editable */}
                  <td className="py-4 px-4 w-40">
                    <input
                      type="text"
                      aria-label={`Valor de ${rec.id}`}
                      value={rec.valorMetrica}
                      onChange={(e) => handleFieldChange(rec.id, 'valorMetrica', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
                    />
                  </td>

                  {/* Clasificación / UNSPSC editable */}
                  <td className="py-4 px-4 w-44">
                    <input
                      type="text"
                      aria-label={`Clasificación de ${rec.id}`}
                      value={rec.clasificacion}
                      onChange={(e) => handleFieldChange(rec.id, 'clasificacion', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white bg-transparent text-xs text-slate-700 focus:outline-none"
                    />
                  </td>

                  {/* Archivo fuente y ubicación editable */}
                  <td className="py-4 px-4 min-w-[220px] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <FiFileText className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      <input
                        type="text"
                        aria-label={`Archivo fuente de ${rec.id}`}
                        value={rec.archivoFuente}
                        onChange={(e) => handleFieldChange(rec.id, 'archivoFuente', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      aria-label={`Ubicación fuente de ${rec.id}`}
                      value={rec.ubicacionFuente}
                      onChange={(e) =>
                        handleFieldChange(rec.id, 'ubicacionFuente', e.target.value)
                      }
                      className="w-full px-2.5 py-0.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white bg-transparent text-xs text-slate-500 focus:outline-none"
                    />
                  </td>

                  {/* Estado (solo color de texto sin cápsula) */}
                  <td className="py-4 px-4 whitespace-nowrap pt-5">
                    {rec.estado === 'Editado' ? (
                      <span className="text-amber-700 text-xs font-medium">
                        Editado
                      </span>
                    ) : (
                      <span className="text-emerald-700 text-xs font-medium">
                        Verificado
                      </span>
                    )}
                  </td>

                  {/* Eliminar */}
                  <td className="py-4 px-4 text-right pt-5">
                    <button
                      type="button"
                      onClick={() => handleRemoveRecord(rec.id)}
                      title="Eliminar registro"
                      aria-label={`Eliminar registro ${rec.codigo}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

