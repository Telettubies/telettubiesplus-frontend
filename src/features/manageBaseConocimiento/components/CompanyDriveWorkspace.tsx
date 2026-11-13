import { services } from '@/features/connected/services';
import { useAuth } from '@/shared/hooks/useAuth';
import React, { useState, useRef, useMemo } from "react";
import {
  FiFolder,
  FiFolderPlus,
  FiUploadCloud,
  FiFileText,
  FiGrid,
  FiList,
  FiSearch,
  FiChevronRight,
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiX,
  FiHardDrive,
  FiFile,
  FiArrowLeft,
  FiDownload,
  FiEye,
} from "react-icons/fi";
import { shouldUseMock } from "@/shared/utils/mockSwitch";

export type FileType = "pdf" | "zip" | "json" | "sheet" | "doc";

export interface DriveFolder {
  id: string;
  name: string;
  color?: string;
  description: string;
  createdAt: string;
}

export interface DriveFile {
  id: string;
  folderId: string;
  name: string;
  type: FileType;
  size: string;
  uploadedAt: string;
  status: "Verificado" | "Indexado" | "En revisión";
  category: string;
}

const DEFAULT_FOLDERS: DriveFolder[] = [
  {
    id: "f-contratos",
    name: "01. Experiencia y Contratos",
    color: "amber",
    description:
      "Actas de liquidación, contratos estatales y certificados de obra",
    createdAt: "2026-10-14",
  },
  {
    id: "f-equipo",
    name: "02. Personal Clave y Hojas de Vida",
    color: "blue",
    description:
      "Hojas de vida, títulos universitarios y tarjetas profesionales",
    createdAt: "2026-10-14",
  },
  {
    id: "f-financiero",
    name: "03. Capacidad Financiera y RUP",
    color: "emerald",
    description: "Certificados RUP, balances auditados y capacidad residual K",
    createdAt: "2026-10-14",
  },
  {
    id: "f-calidad",
    name: "04. Certificaciones de Calidad e ISO",
    color: "indigo",
    description: "Certificados vigentes ISO 9001, 14001, 45001 y RUC",
    createdAt: "2026-10-14",
  },
  {
    id: "f-juridico",
    name: "05. Documentos Jurídicos y Empresa",
    color: "purple",
    description: "Cámara de Comercio, RUT de la DIAN y estatutos sociales",
    createdAt: "2026-10-14",
  },
];

const DEFAULT_FILES: DriveFile[] = [
  {
    id: "file-01",
    folderId: "f-contratos",
    name: "Contrato_2024_C08_Pavimentacion_Invias.pdf",
    type: "pdf",
    size: "14.8 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Vías primarias",
  },
  {
    id: "file-02",
    folderId: "f-contratos",
    name: "Acta_Liquidacion_Puente_Antioquia_2023.pdf",
    type: "pdf",
    size: "8.2 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Estructuras",
  },
  {
    id: "file-03",
    folderId: "f-contratos",
    name: "Certificado_Cumplimiento_ANI_Troncal.pdf",
    type: "pdf",
    size: "4.5 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Señalización",
  },
  {
    id: "file-04",
    folderId: "f-contratos",
    name: "Consolidado_Contratos_Experiencia.json",
    type: "json",
    size: "1.2 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Indexado",
    category: "Base estructurada",
  },
  {
    id: "file-05",
    folderId: "f-equipo",
    name: "HV_Director_Obra_IngCivil_Posgrado.pdf",
    type: "pdf",
    size: "3.4 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Personal directivo",
  },
  {
    id: "file-06",
    folderId: "f-equipo",
    name: "HV_Residente_Obras_Viales_5Anos.pdf",
    type: "pdf",
    size: "2.8 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Personal técnico",
  },
  {
    id: "file-07",
    folderId: "f-equipo",
    name: "Certificaciones_Laborales_Especialistas.zip",
    type: "zip",
    size: "18.6 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Indexado",
    category: "Soportes HV",
  },
  {
    id: "file-08",
    folderId: "f-financiero",
    name: "Certificado_RUP_Oficial_2026.pdf",
    type: "pdf",
    size: "2.1 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "RUP 2026",
  },
  {
    id: "file-09",
    folderId: "f-financiero",
    name: "Estados_Financieros_Auditados_2024_2025.pdf",
    type: "pdf",
    size: "5.9 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Financiero",
  },
  {
    id: "file-10",
    folderId: "f-financiero",
    name: "Calculo_Capacidad_Residual_K_Contratacion.xlsx",
    type: "sheet",
    size: "1.4 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Capacidad K",
  },
  {
    id: "file-11",
    folderId: "f-calidad",
    name: "Certificado_ISO_9001_Calidad_2026.pdf",
    type: "pdf",
    size: "1.8 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "ISO 9001",
  },
  {
    id: "file-12",
    folderId: "f-calidad",
    name: "Certificado_ISO_14001_Ambiental_2026.pdf",
    type: "pdf",
    size: "1.7 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "ISO 14001",
  },
  {
    id: "file-13",
    folderId: "f-calidad",
    name: "Certificado_ISO_45001_SST_2026.pdf",
    type: "pdf",
    size: "1.9 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "ISO 45001",
  },
  {
    id: "file-14",
    folderId: "f-juridico",
    name: "Camara_Comercio_Representacion_Legal.pdf",
    type: "pdf",
    size: "1.2 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Personería",
  },
  {
    id: "file-15",
    folderId: "f-juridico",
    name: "RUT_Actualizado_Dian_2026.pdf",
    type: "pdf",
    size: "0.8 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Tributario",
  },
  {
    id: "file-16",
    folderId: "f-juridico",
    name: "Estatutos_Sociales_Constructora_Andina.pdf",
    type: "pdf",
    size: "4.1 MB",
    uploadedAt: "2026-10-14 11:22",
    status: "Verificado",
    category: "Estatutos",
  },
];

export const CompanyDriveWorkspace: React.FC = () => {
  const isMockEnabled = shouldUseMock("VITE_MOCK_CONOCIMIENTO");

  const [folders, setFolders] = useState<DriveFolder[]>(DEFAULT_FOLDERS);
  const [files, setFiles] = useState<DriveFile[]>(
    isMockEnabled ? DEFAULT_FILES : [],
  );
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "todos" | "pdf" | "zip" | "sheet" | "json"
  >("todos");

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const {user}=useAuth();
  const [backendRevision, reloadBackend] = useState(0);
  const sourceFiles = (sources: Awaited<ReturnType<typeof services.sources>>, summary: Awaited<ReturnType<typeof services.knowledge>>): DriveFile[] => {
    const folderIds: Record<string, string> = { contrato: 'f-contratos', capacidad: 'f-contratos', hoja_de_vida: 'f-equipo', financiero: 'f-financiero', certificacion: 'f-calidad', empresa: 'f-juridico' };
    return sources.map(source => ({
      id: source.id, folderId: folderIds[source.tipo] || 'f-juridico', name: source.titulo,
      type: 'json', size: '—', uploadedAt: source.creado_en,
      status: summary.indexacion?.estado === 'completado' ? 'Indexado' : 'En revisión', category: source.tipo,
    }));
  };
  const refreshBackend = async () => {
    const [sources, summary] = await Promise.all([services.sources(), services.knowledge()]);
    setFiles(sourceFiles(sources, summary));
    reloadBackend(value => value + 1);
  };
  React.useEffect(() => {
    if (isMockEnabled) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    setFiles([]);
    const load = async () => {
      try {
        const [sources, summary] = await Promise.all([services.sources(controller.signal), services.knowledge(controller.signal)]);
        if (controller.signal.aborted) return;
        setFiles(sourceFiles(sources, summary));
        if (summary.indexacion?.estado === 'fallido') showToast(summary.indexacion.error || 'La indexación falló. Puedes reintentarlo con Reindexar.');
        if (summary.indexacion?.estado === 'en_cola' || summary.indexacion?.estado === 'en_ejecucion') timer = setTimeout(load, 3000);
      } catch (error) {
        if (!controller.signal.aborted) showToast((error as Error).message);
      }
    };
    void load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [isMockEnabled, user?.organizacion_id, backendRevision]);
  const uploadBackend = async (selected: FileList) => {
    try {
      if (selected.length !== 1 || !selected[0].name.toLowerCase().endsWith('.json')) throw new Error('El backend admite un único JSON estructurado. Los demás formatos se mantienen pendientes de integración.');
      if (!window.confirm('Esta carga reemplaza toda la base de conocimiento de tu organización. ¿Continuar?')) return;
      await services.uploadKnowledge(selected[0]);
      showToast('Base guardada. La indexación se ha encolado.');
      await refreshBackend();
    } catch (error) {
      showToast((error as Error).message || 'No se pudo cargar el archivo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const currentFolder = useMemo(
    () => folders.find((f) => f.id === currentFolderId) || null,
    [folders, currentFolderId],
  );

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchFolder = currentFolderId
        ? file.folderId === currentFolderId
        : true;
      const matchType =
        typeFilter === "todos" ? true : file.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        file.name.toLowerCase().includes(q) ||
        file.category.toLowerCase().includes(q);
      return matchFolder && matchType && matchSearch;
    });
  }, [files, currentFolderId, typeFilter, searchQuery]);

  const filteredFolders = useMemo(() => {
    if (currentFolderId) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return folders;
    return folders.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q),
    );
  }, [folders, currentFolderId, searchQuery]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if(!isMockEnabled){showToast('Las carpetas se conservan en la interfaz; su creación en el servidor todavía no está disponible.');setIsNewFolderOpen(false);return;}
    const name = newFolderName.trim();
    if (!name) return;
    const newFolder: DriveFolder = {
      id: `folder-${Date.now()}`,
      name,
      description: "Carpeta de información corporativa de la empresa",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setIsNewFolderOpen(false);
    showToast(`Carpeta "${name}" creada con éxito.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!isMockEnabled){if(e.target.files)void uploadBackend(e.target.files);return;}
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const targetFolderId = currentFolderId || folders[0]?.id || "f-contratos";
    const targetFolder = folders.find((f) => f.id === targetFolderId);

    const newDriveFiles: DriveFile[] = Array.from(uploaded).map((file, idx) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let detectedType: FileType = "pdf";
      if (ext === "zip" || ext === "rar") detectedType = "zip";
      else if (ext === "json") detectedType = "json";
      else if (ext === "xlsx" || ext === "xls" || ext === "csv")
        detectedType = "sheet";
      else if (ext === "doc" || ext === "docx") detectedType = "doc";

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

      return {
        id: `file-${Date.now()}-${idx}`,
        folderId: targetFolderId,
        name: file.name,
        type: detectedType,
        size: `${sizeMb === "0.0" ? "0.5" : sizeMb} MB`,
        uploadedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        status: "Indexado",
        category: targetFolder?.name.replace(/^\d+\.\s*/, "") || "General",
      };
    });

    setFiles((prev) => [...newDriveFiles, ...prev]);
    showToast(
      `${uploaded.length} archivo(s) subido(s) a "${targetFolder?.name || "Mi Unidad"}".`,
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if(!isMockEnabled){void uploadBackend(e.dataTransfer.files);return;}
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const targetFolderId = currentFolderId || folders[0]?.id || "f-contratos";
    const targetFolder = folders.find((f) => f.id === targetFolderId);

    const newDriveFiles: DriveFile[] = Array.from(droppedFiles).map(
      (file, idx) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        let detectedType: FileType = "pdf";
        if (ext === "zip" || ext === "rar") detectedType = "zip";
        else if (ext === "json") detectedType = "json";
        else if (ext === "xlsx" || ext === "xls" || ext === "csv")
          detectedType = "sheet";

        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

        return {
          id: `file-drop-${Date.now()}-${idx}`,
          folderId: targetFolderId,
          name: file.name,
          type: detectedType,
          size: `${sizeMb === "0.0" ? "0.5" : sizeMb} MB`,
          uploadedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          status: "Indexado",
          category: targetFolder?.name.replace(/^\d+\.\s*/, "") || "General",
        };
      },
    );

    setFiles((prev) => [...newDriveFiles, ...prev]);
    showToast(
      `${droppedFiles.length} archivo(s) agregado(s) a "${targetFolder?.name || "Mi Unidad"}".`,
    );
  };

  const handleDeleteFile = (id: string, name: string) => {
    if(!isMockEnabled){showToast('La eliminación individual de fuentes aún no está disponible. Puedes reemplazar la base mediante una nueva carga JSON.');return;}
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showToast(`Archivo "${name}" eliminado.`);
  };

  const renderFileIcon = (type: FileType) => {
    switch (type) {
      case "pdf":
        return (
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
            PDF
          </div>
        );
      case "zip":
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
            ZIP
          </div>
        );
      case "sheet":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
            XLS
          </div>
        );
      case "json":
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
            JSON
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
            DOC
          </div>
        );
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleFileDrop}
      className="space-y-6 font-sans relative"
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={isMockEnabled}
        accept={isMockEnabled ? '.pdf,.zip,.json,.xlsx,.xls,.docx,.doc' : '.json'}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header Principal Unificado sin textos duplicados */}
      <div className="pb-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <FiHardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Fichero Corporativo de la Empresa
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Repositorio central organizado por carpetas con documentos de
                experiencia, finanzas y certificaciones para alimentar el
                análisis de pliegos.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones Principales estilo Drive */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isMockEnabled&&<><a href="/base-conocimiento-ejemplo.json" download className="text-xs text-brand-primary underline">Ejemplo JSON</a><button type="button" onClick={()=>void refreshBackend().catch(e=>showToast(e.message))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs">Actualizar</button><button type="button" onClick={()=>void services.reindex().then(()=>{showToast('Indexación encolada.');reloadBackend(value=>value+1);}).catch(e=>showToast(e.message))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs">Reindexar</button></>}

          <button
            type="button"
            onClick={() => setIsNewFolderOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <FiFolderPlus className="w-4 h-4 text-slate-600" />
            <span>Nueva Carpeta</span>
          </button>
          <button
            type="button"
            data-tour="knowledge-uploader"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <FiUploadCloud className="w-4 h-4" />
            <span>Subir Archivo</span>
          </button>
        </div>
      </div>

      {/* Barra de Resumen / Métricas de Almacenamiento */}
      <div
        data-tour="knowledge-kpis"
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs"
      >
        <div className="space-y-0.5">
          <span className="text-slate-400 font-medium">Carpetas Activas</span>
          <p className="text-base font-bold text-slate-800">
            {folders.length} carpetas
          </p>
        </div>
        <div className="space-y-0.5 sm:border-l sm:border-slate-100 sm:pl-4">
          <span className="text-slate-400 font-medium">
            Total de Documentos
          </span>
          <p className="text-base font-bold text-slate-800">
            {files.length} archivos
          </p>
        </div>
        <div className="space-y-0.5 sm:border-l sm:border-slate-100 sm:pl-4">
          <span className="text-slate-400 font-medium">
            Capacidad Utilizada
          </span>
          <p className="text-base font-bold text-slate-800">
            {files.length === 0 ? "0.0 MB" : "71.2 MB"} / 5 GB
          </p>
        </div>
      </div>

      {/* Barra de Búsqueda, Filtros y Vista Cuadrícula/Lista */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb de Navegación estilo Google Drive */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 overflow-x-auto py-1">
          {currentFolder && (
            <>
              <FiChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-900 font-semibold truncate max-w-[220px]">
                {currentFolder.name}
              </span>
            </>
          )}
        </div>

        {/* Controles de Búsqueda y Modos de Vista */}
        <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-80 md:w-96">
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el fichero..."
              aria-label="Buscar en el fichero"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary shadow-2xs"
            />
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Vista en Cuadrícula"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-brand-primary text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Vista en Lista"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-brand-primary text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: Carpetas estilo Google Drive */}
      {filteredFolders.length > 0 && !currentFolderId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold uppercase tracking-wider text-slate-600 text-[11px]">
              Carpetas ({filteredFolders.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {filteredFolders.map((folder) => {
              const count = files.filter(
                (f) => f.folderId === folder.id,
              ).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="group bg-white border border-slate-200/90 hover:border-brand-primary/50 hover:shadow-card p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/80 group-hover:scale-105 transition-transform">
                      <FiFolder className="w-4 h-4 fill-amber-500/20" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {count} {count === 1 ? "archivo" : "archivos"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 group-hover:text-brand-primary line-clamp-1">
                      {folder.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {folder.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: Archivos (Cuadrícula o Lista) */}
      <div data-tour="knowledge-editable-records" className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            {currentFolderId && (
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:underline"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a carpetas</span>
              </button>
            )}
            <span className="font-semibold uppercase tracking-wider text-slate-600 text-[11px]">
              {currentFolder
                ? `Archivos en ${currentFolder.name}`
                : "Todos los Documentos"}{" "}
              ({filteredFiles.length})
            </span>
          </div>

          {/* Filtros rápidos por tipo */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {(
              [
                { id: "todos", label: "Todos" },
                { id: "pdf", label: "PDFs" },
                { id: "sheet", label: "Planillas" },
                { id: "zip", label: "Paquetes ZIP" },
                { id: "json", label: "Datos JSON" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  typeFilter === t.id
                    ? "bg-slate-800 dark:bg-[#0D7A4D] text-white font-medium dark:ring-1 dark:ring-[#3ECF8E]/30"
                    : "bg-white dark:bg-[#1C1C1C] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-[#2E2E2E] hover:bg-slate-50 dark:hover:bg-[#232323]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zona Vacía cuando no hay archivos */}
        {filteredFiles.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            className={`rounded-2xl border-2 border-dashed p-10 text-center flex flex-col items-center justify-center space-y-3 transition-colors ${
              isDragOver
                ? "border-brand-primary bg-brand-primary/5"
                : "border-slate-200 bg-white/70"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FiFolder className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {currentFolder
                  ? `No hay documentos en "${currentFolder.name}"`
                  : "Fichero corporativo vacío"}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Arrastre archivos aquí desde su computadora o pulse el botón
                para cargar documentos de soporte.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-hover transition-colors cursor-pointer shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Subir Documento</span>
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* VISTA EN CUADRÍCULA ESTILO GOOGLE DRIVE */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const folderName =
                folders.find((f) => f.id === file.folderId)?.name || "General";
              return (
                <div
                  key={file.id}
                  className="group bg-white border border-slate-200/90 rounded-2xl p-4 hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <h4
                      className="text-xs font-semibold text-slate-900 group-hover:text-brand-primary line-clamp-2 leading-snug"
                      title={file.name}
                    >
                      {file.name}
                    </h4>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <p className="text-[11px] text-slate-400 truncate">
                        📁 {folderName}
                      </p>
                      <span
                        className={`text-[11px] font-medium shrink-0 ${
                          file.status === "Verificado"
                            ? "text-emerald-600"
                            : file.status === "Indexado"
                            ? "text-blue-600"
                            : "text-amber-600"
                        }`}
                      >
                        {file.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{file.size}</span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          showToast(isMockEnabled ? `Descargando "${file.name}"...` : 'La API todavía no ofrece descarga individual de fuentes.')
                        }
                        title="Descargar archivo"
                        className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        title="Eliminar de la carpeta"
                        className="p-1 rounded text-slate-500 dark:text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/15 dark:hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VISTA EN LISTA / TABLA ESTILO GOOGLE DRIVE */
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-medium">
                  <th className="py-3 px-4">Nombre del Documento</th>
                  <th className="py-3 px-4">Carpeta</th>
                  <th className="py-3 px-4">Tamaño</th>
                  <th className="py-3 px-4">Modificación</th>
                  <th className="py-3 px-4">Estado IA</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.map((file) => {
                  const folderName =
                    folders.find((f) => f.id === file.folderId)?.name ||
                    "General";
                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <FiFileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span
                            className="font-semibold text-slate-800 truncate max-w-xs"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        📁 {folderName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {file.size}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {file.uploadedAt}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-medium ${
                            file.status === "Verificado"
                              ? "text-emerald-600"
                              : file.status === "Indexado"
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        >
                          {file.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              showToast(isMockEnabled ? `Descargando "${file.name}"...` : 'La API todavía no ofrece descarga individual de fuentes.')
                            }
                            title="Descargar archivo"
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            title="Eliminar archivo"
                            className="p-1 rounded-lg text-slate-500 dark:text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/15 dark:hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear Nueva Carpeta */}
      {isNewFolderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFolderPlus className="w-5 h-5 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-900">
                  Nueva Carpeta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre de la carpeta
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="ej. Contratos Obra Civil 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-hover disabled:opacity-50 cursor-pointer"
                >
                  Crear Carpeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Flotante de Confirmación */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-lg animate-in slide-in-from-bottom-2"
        >
          <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
