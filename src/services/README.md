# Arquitectura de Servicios - Tetros

## Flujo de Datos
Usuario (Teclado/Touch)
↓
InputService
↓
GameActionsService ←→ BoardService
↓              ↓
GameStateService ← AnimationService
↑
GameLoopService → GameActionsService
↑
PowerUpService

## Responsabilidades

### GameStateService
- Single source of truth para todo el estado del juego
- Solo contiene signals, sin lógica de negocio
- No tiene dependencias con otros servicios

### BoardService
- Operaciones sobre el tablero (clear lines, apply gravity)
- Lee y modifica el estado a través de GameStateService

### AnimationService
- Cálculo del ghost piece
- Control de modos de animación (smooth/step)
- Cálculo de posiciones visuales

### GameActionsService
- Lógica core del juego (mover, rotar, lock piece)
- Orquesta cambios entre Board y State
- Valida movimientos

### GameLoopService
- Motor temporal con requestAnimationFrame
- Controla velocidad de caída según nivel
- Maneja el drop automático

### InputService
- Traducción de teclas a acciones
- Implementación de DAS/ARR
- No conoce reglas del juego

### PowerUpService
- Sistema modular de power-ups
- Cada power-up como estrategia independiente

### GameFacade
- Orquestador principal
- Expone API pública para componentes
- Maneja inicio/pausa/reinicio del juego

## Testing

Para testear un servicio individual:
1. Mock sus dependencias
2. Test de estado inicial
3. Test de cada método público
4. Test de edge cases

## Agregar Nuevas Features

Para agregar un nuevo power-up:
1. Añadir tipo en GameStateService
2. Implementar lógica en PowerUpService
3. Mapear tecla en InputService (opcional)
