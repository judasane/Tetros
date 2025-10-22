<div align="center">

# Tetros: El Tejedor Cósmico

**Un juego de bloques con mecánicas innovadoras y temática cósmica**

[![Angular](https://img.shields.io/badge/Angular-20.1-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
![Coverage](https://img.shields.io/badge/Coverage-%E2%89%A580%25-brightgreen)

[Características](#características-principales) •
[Inicio Rápido](#inicio-rápido) •
[Desarrollo](#desarrollo) •
[Pruebas](#pruebas) •
[Despliegue](#despliegue) •
[Herramientas IA](#herramientas-ia)

</div>

---

## Descripción

> *En la vasta y silenciosa expansión donde nacen las estrellas y se desvanecen las galaxias, existe un telar de energía cósmica. Tú, alma valiente, eres el Tejedor, encargado de un deber eterno: dar forma al tejido mismo de la realidad a partir de fragmentos de luz estelar que caen.*

**Tetros** no es un simple juego; es una prueba de concentración, una danza de creación y disolución al borde del vacío. A medida que los bloques celestiales —los restos de estrellas moribundas— descienden de los cielos, debes guiarlos, rotarlos y alinearlos en perfectos e ininterrumpidos filamentos cósmicos.

Si fallas, el caos consumirá el tablero. Si tienes éxito, traerás orden al universo, una línea resplandeciente a la vez.

---

## Características Principales

- **🎮 Mecánicas Clásicas Mejoradas**: Sistema de bloques basado en Tetris con físicas precisas
- **⚡ Poderes Arcanos**: 4 habilidades únicas que alteran la realidad del juego
  - Rayo Celestial: Elimina líneas específicas
  - Flujo Temporal: Ralentiza la caída de piezas
  - Transmutación Caótica: Cambia la forma de las piezas
  - Convergencia Destinada: Elimina bloques individuales
- **📱 Controles Táctiles**: Soporte completo para dispositivos móviles
- **🎨 Tema Cósmico**: Interfaz dark/light con estética estelar
- **🏆 Sistema de Puntuación**: Scoring avanzado con multiplicadores
- **⏸️ Pausa Inteligente**: El juego se pausa automáticamente al cambiar de pestaña
- **🎯 Arquitectura Moderna**: Angular 20 con signals, zoneless y standalone components
- **🧪 Alta Calidad**: ≥80% de cobertura de pruebas

---

## Stack Tecnológico

| Categoría | Tecnologías |
|----------|-------------|
| **Framework** | Angular 20.1 (zoneless, signals) |
| **Build Tool** | Vite 6.2 + AnalogJS |
| **Lenguaje** | TypeScript 5.8 |
| **Estilos** | Tailwind CSS + CSS personalizado |
| **Gestión de Estado** | Angular Signals + RxJS 7.8 |
| **Pruebas** | Vitest (unit, ≥80% coverage) |
| **Linting** | ESLint + Prettier |

---

## Inicio Rápido

### Requisitos Previos

- **Node.js** v22.x o superior
- **npm** (viene con Node.js)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/judasane/Tetros.git
   cd Tetros
   npm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   Se abre en `http://localhost:4200` con recarga en caliente habilitada.

3. **Construir para producción**
   ```bash
   npm run build
   npm run preview  # Previsualizar build de producción
   ```

---

## Desarrollo

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo con HMR |
| `npm run build` | Crear build de producción |
| `npm run preview` | Servir build de producción localmente |
| `npm test` | Ejecutar pruebas unitarias con Vitest |
| `npm run test:ui` | Abrir interfaz interactiva de pruebas |
| `npm run test:coverage` | Generar reporte de cobertura (≥80% threshold) |
| `npm run lint` | Lint y auto-arreglar código |
| `npx tsc --noEmit` | Verificar tipos sin construir |

### Estructura del Proyecto

```
Tetros/
├── src/
│   ├── app/
│   │   ├── components/        # Componentes UI (board, piece, cell, etc.)
│   │   ├── services/          # Lógica del juego (game-loop, input, animation)
│   │   └── utils/             # Utilidades (piece.utils, board.utils, game-logic.utils)
│   ├── app.component.ts       # Componente raíz
│   └── index.tsx              # Punto de entrada de la aplicación
├── .github/
│   └── workflows/             # Pipelines CI/CD
├── angular.json               # Configuración de Angular
├── vite.config.ts             # Configuración del bundler Vite
└── package.json
```

### Estándares de Código

#### TypeScript & Documentación
- **Tipado Completo**: Todo el código debe estar correctamente tipado
- **Sin `any` types**: Usar tipado apropiado o `unknown` cuando sea necesario
- **Code Quality**: Seguir los principios de Clean Code

#### Estilo & Formato
- **Prettier**: Formato automático de código
- **ESLint**: Reglas de linting personalizadas
- **Tailwind CSS**: Estilos utility-first
- **Soporte de Tema**: Todos los estilos deben soportar modo dark/light

#### Convenciones de Commits
Seguir [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat(game): add new power-up mechanic
fix(input): resolve keyboard event handling
docs(readme): update installation instructions
test(utils): add piece rotation tests
refactor(services): improve game loop performance
```

---

## Pruebas

### Pruebas Unitarias (Vitest)

```bash
npm test                    # Ejecutar todas las pruebas
npm run test:ui             # Interfaz interactiva
npm run test:coverage       # Generar reporte de cobertura
```

- **Requisito de Cobertura**: ≥80% líneas/ramas/funciones
- **Ubicación**: Las pruebas están colocadas junto a los archivos fuente (`*.spec.ts`)
- **Reportes**: Reportes de cobertura HTML en `./coverage/`

**Ejecutar pruebas específicas:**
```bash
npm test -- src/services/game-loop.service.spec.ts
```

### Arquitectura de Pruebas

**Componentes Principales Probados:**
- `GameLoopService`: Ciclo principal del juego
- `GameFacadeService`: Orquestación de servicios
- `InputService`: Manejo de controles de usuario
- `AnimationService`: Sistema de animaciones
- `PowerUpService`: Sistema de poderes
- Utilidades: piece.utils, board.utils, game-logic.utils

---

## Despliegue

### Ambientes

| Ambiente | Rama | URL | Trigger de Deploy |
|----------|------|-----|-------------------|
| **Production** | `development` | TBD | Merge a `development` |
| **Preview** | Ramas PR | TBD | Creación de PR |

### Pipeline CI/CD

**GitHub Actions** workflow (`.github/workflows/`):
1. **Build Once**: Build de producción único
2. **Parallel Jobs**: Linting y pruebas unitarias en paralelo
3. **Coverage Check**: Verifica threshold ≥80%
4. **Deploy**: Despliegue automático (cuando se configure)

### Despliegue Manual

```bash
# Construir bundle de producción
npm run build

# Los archivos están en dist/ listos para despliegue
```

---

## Controles del Juego

### Teclado

| Tecla(s)    | Acción                      |
|-------------|-----------------------------|
| `◄ ►`       | Mover Pieza Lateralmente    |
| `▲`         | Rotar Pieza                 |
| `▼`         | Acelerar Descenso           |
| `Espacio`   | Caída Instantánea           |
| `C`         | Guardar Pieza (Hold)        |
| `P`         | Pausar Juego                |
| `1` - `4`   | Usar Poder                  |

### Controles Táctiles

- **Swipe Izquierda/Derecha**: Mover pieza
- **Tap**: Rotar pieza
- **Swipe Abajo**: Acelerar caída
- **Botones de Poder**: Toca para activar

---

## Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estas guías:

### Antes de Contribuir

1. **Lee la Documentación**: Revisa [AGENTS.md](./AGENTS.md) para guías operacionales
2. **Revisa Issues**: Busca issues existentes o crea uno nuevo
3. **Fork del Repositorio**: Crea tu propio fork

### Workflow de Desarrollo

1. **Crear Rama**: `git checkout -b feat/mi-feature`
2. **Desarrollar**: Sigue estándares de código y añade pruebas
3. **Probar**: Asegura que el 100% del pipeline pase
   ```bash
   npm run lint
   npm test
   npm run build
   ```
4. **Commit**: Usa mensajes de commit convencionales
5. **Push**: `git push origin feat/mi-feature`
6. **Pull Request**: Con descripción clara y screenshots para cambios UI

### Proceso de Revisión de Código

- Todos los PRs requieren pasar las verificaciones de CI/CD
- El código debe mantener ≥80% de cobertura de pruebas
- Al menos una aprobación de mantenedor requerida

---

## Resolución de Problemas

### Problemas Comunes

**Puerto ya en uso**
```bash
npx kill-port 4200
```

**Problemas de dependencias**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Errores de TypeScript**
```bash
npx tsc --noEmit  # Verificar sin construir
```

**Fallas en pruebas**
```bash
npm test -- --reporter=verbose  # Output detallado
npm run test:ui                 # Debugging interactivo
```

---

## Arquitectura Destacada

### Patrones Modernos de Angular

- **Zoneless**: Sin dependencia de Zone.js para mejor rendimiento
- **Signals**: Gestión de estado reactivo con Angular signals
- **Standalone Components**: Arquitectura modular y tree-shakeable
- **OnPush Detection**: Estrategia de detección de cambios optimizada
- **Dependency Injection**: Arquitectura basada en servicios

### Optimizaciones de Rendimiento

- **Vite**: Builds de desarrollo y producción ultra-rápidos
- **Lazy Loading**: Componentes cargados bajo demanda
- **Renderizado Eficiente**: OnPush + signals minimizan re-renders
- **RequestAnimationFrame**: Animaciones suaves y eficientes

---

## Herramientas IA

### Archivo Aplanado del Repositorio

Este proyecto genera automáticamente un **archivo aplanado del repositorio** (`flattened_Tetros_*.txt`) que contiene todo el código base en un solo archivo de texto. Esto es particularmente útil para asistentes de IA y modelos de lenguaje grandes (LLMs).

#### ¿Qué es el Archivo Aplanado?

El archivo aplanado es una instantánea completa del repositorio que incluye:
- Todos los archivos de código fuente con delimitadores claros
- Archivos de configuración (package.json, tsconfig.json, etc.)
- Archivos de documentación
- Metadata (rama, commit hash, timestamp de generación)

**Ejemplo de encabezado:**
```
==================================
FLATTENED: Tetros
Type: Game Project
Generated at: Tue Oct 22 19:16:20 UTC 2025
Branch: main
Commit: d591534226351c245c3cd523f8b2b71cdd716a70
Repository: judasane/Tetros
==================================
```

#### Casos de Uso

**Para Asistentes de IA:**
- Proporciona contexto completo del proyecto en un solo archivo
- Permite mejores sugerencias de código y comprensión
- Ayuda con refactorización entre archivos y análisis
- Útil para generar documentación completa

**Para Desarrolladores:**
- Vista rápida del proyecto y búsqueda de código
- Debugging y análisis
- Preparación de code reviews
- Documentación y archivo del proyecto
- Compartir contexto completo con herramientas externas

**Para Análisis de Código:**
- Herramientas de análisis estático
- Métricas de calidad de código
- Análisis de dependencias
- Detección de patrones

#### Cómo Funciona

El archivo aplanado se genera automáticamente por CI/CD:
1. **Trigger**: En cada push a ramas principales
2. **Generación**: GitHub Actions procesa todos los archivos
3. **Formato**: Cada archivo está claramente delimitado con marcadores de inicio/fin
4. **Almacenamiento**: Commiteado al repositorio con timestamp en el nombre

#### Formato del Archivo

```
--- START OF FILE: path/to/file.ts ---
[contenido del archivo]
--- END OF FILE: path/to/file.ts ---

--- START OF FILE: path/to/another.ts ---
[contenido del archivo]
--- END OF FILE: path/to/another.ts ---
```

#### Usando con Herramientas de IA

**Con Claude Code / Asistentes de IA:**
```bash
# El AI puede referenciar el archivo aplanado para contexto completo
"Por favor revisa el archivo flattened_Tetros_*.txt para la estructura del proyecto"
```

**Beneficios:**
- ✅ Un solo archivo = contexto completo
- ✅ No necesidad de cargar archivos uno por uno
- ✅ Preserva estructura de archivos y relaciones
- ✅ Incluye metadata para versionado
- ✅ Excelente para análisis offline

> **Nota**: El archivo aplanado se regenera en cada despliegue para mantenerlo sincronizado con el código más reciente.

---

## Recursos

- **[AGENTS.md](./AGENTS.md)** - Guías operacionales de agentes de IA y estándares de desarrollo
- **[Angular Docs](https://angular.dev/)** - Documentación oficial de Angular
- **[Vite Guide](https://vitejs.dev/)** - Documentación de la herramienta de build Vite
- **[Vitest Docs](https://vitest.dev/)** - Framework de pruebas unitarias
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first

---

## Licencia

MIT License © 2025 Judas Añe

---

## Soporte

- **Issues**: [GitHub Issues](https://github.com/judasane/Tetros/issues)
- **Contacto**: [@judasane](https://x.com/judasane)

---

<div align="center">

**Construido con Angular 20 • Impulsado por Vite • Probado con Vitest**

> *El universo espera a su maestro. ¿Aceptarás el desafío o te perderás en la interminable cascada del caos?*

</div>
