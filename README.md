# TenderComply – Analizador de Pliegos (Frontend)

Plataforma frontend moderna para el análisis inteligente de pliegos de licitación, evaluación de cumplimiento normativo y técnico, gestión de base de conocimientos organizacional y revisión colaborativa con asistencia de IA.

---

## 🚀 Tecnologías Principales

- **Framework**: React 18 + Vite + TypeScript
- **Estilos & Animaciones**: Tailwind CSS, Framer Motion, React Icons
- **Gestión de Estado & Red**: Context API, Axios con interceptores y capa de mocks desacoplada
- **Visualización de Documentos**: `react-pdf` con capa de resaltado dinámico de coordenadas y evidencias
- **Onboarding**: React Joyride para tour guiado interactivo
- **Testing**: Jest + React Testing Library (unitarias e integración), Playwright (E2E)

---

## 📁 Estructura del Proyecto

```text
frontend/
├── src/
│   ├── api/                  # Cliente HTTP, interceptores, contratos y endpoints
│   ├── features/             # Módulos organizados por dominio de negocio:
│   │   ├── manageAuth/               # Autenticación, registro, invitaciones y roles
│   │   ├── manageBaseConocimiento/   # Repositorio documental e indexación de empresa
│   │   ├── manageCargaPliego/        # Subida de pliegos, validaciones y polling de progreso
│   │   ├── manageDashboardMatriz/    # Matriz de cumplimiento, filtros y recomendaciones
│   │   ├── manageGestionMiembros/    # Administración de equipo y roles
│   │   ├── managePanelLicitaciones/  # Bandeja de licitaciones y estados
│   │   ├── manageRevisionHumana/     # Flujo de aprobación/rechazo y shift de IA
│   │   └── manageVisorPliego/        # Visor de PDF sincronizado con evidencias
│   ├── pages/                # Páginas y vistas principales
│   ├── routes/               # Enrutamiento protegido por autenticación y roles (RBAC)
│   └── shared/               # Componentes UI reutilizables, hooks, utilidades y temas
├── e2e/                      # Pruebas End-to-End con Playwright
└── public/                   # Recursos estáticos
```

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Telettubies/telettubiesplus-frontend.git
cd telettubiesplus-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Copia el archivo de ejemplo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Configura las variables según tu entorno:
- `VITE_USE_MOCKS`: Establece `true` para desarrollo autónomo con datos mock o `false` para conectar al backend real.
- `VITE_API_URL`: URL base del API backend.
- `VITE_APP_ENV`: Entorno de ejecución (`development`, `staging`, `production`).

---

## 💻 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo local en el puerto 5173 |
| `npm run build` | Compila la aplicación optimizada para producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm test` | Ejecuta las pruebas unitarias y de integración con Jest |
| `npm run test:e2e` | Ejecuta la suite de pruebas End-to-End con Playwright |

---

## 👥 Equipo

Desarrollado por **Telettubies**.
