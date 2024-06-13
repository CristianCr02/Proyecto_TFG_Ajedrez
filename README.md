# Proyecto de Ajedrez Multijugador y Single Player

## Introducción

Este proyecto es una aplicación web de ajedrez que permite a los usuarios jugar partidas en tiempo real contra otros jugadores (multijugador) o contra una inteligencia artificial (single player). La aplicación utiliza WebSockets para la comunicación en tiempo real y proporciona funcionalidades como emparejamiento de jugadores, control de tiempo y promoción de piezas. Este documento describe la arquitectura, las funcionalidades implementadas y las futuras líneas de desarrollo del proyecto.

Para el desarrollo de este proyecto se ha empleado la API del GitHub: https://github.com/anzemur/chess-api con modificaciones adicionales.

## Arquitectura del Proyecto

### Frontend

- **Framework**: Angular
- **Componentes Clave**:
  - **Tablero de Ajedrez**: Representa el tablero y las piezas de ajedrez.
  - **Control de Tiempo**: Muestra el tiempo restante para cada jugador.
  - **Modal de Fin de Juego**: Aparece cuando la partida termina, mostrando el resultado y el historial de movimientos.
- **Servicios**:
  - `GameService`: Maneja las interacciones con la API backend.
  - `WebSocketService`: Maneja la comunicación en tiempo real con el backend usando WebSockets.

### Backend

- **Framework**: Node.js con Express
- **WebSocket**: Utilizado para la comunicación en tiempo real.
- **Base de Datos**: MongoDB (para almacenar información de usuarios y estadísticas de partidas).
- **APIs**: Proveen endpoints para mover piezas, verificar estado del juego, emparejar jugadores, etc.

## Funcionalidades Implementadas

### Modo Multijugador

#### Emparejamiento de Jugadores

1. **Entrada a la Cola de Emparejamiento**:
   - En el frontend, al iniciar la aplicación se llama a `enterPool` con el nombre de usuario.
   - En el backend, `handleEnterPool` agrega al usuario a una cola de espera y llama a `matchMaking` para intentar encontrar un oponente.

2. **Proceso de Emparejamiento**:
   - `matchMaking` verifica si hay al menos dos jugadores en la cola.
   - Si se encuentra un oponente, se crea una nueva partida (`createNewGame`).
   - Se asignan colores a los jugadores y se envían mensajes de inicio de partida a ambos jugadores.

#### Movimientos de Piezas

1. **Click en una Pieza**:
   - `pieceClicked` verifica si es el turno del jugador y llama a `checkPossibleMoves` para obtener los movimientos posibles.

2. **Mover Pieza**:
   - `movePiece` envía las coordenadas del movimiento al backend.
   - En el backend, `handleMove` procesa el movimiento, cambia el turno, verifica el estado del juego y notifica a ambos jugadores.

#### Control de Tiempo

1. **Inicio del Temporizador**:
   - `startTimer` en el backend inicia un temporizador que decrementa el tiempo del jugador actual.

2. **Cambio de Jugador**:
   - `switchPlayer` cambia el jugador actual y reinicia el temporizador.

#### Finalización del Juego

1. **Verificación del Estado del Juego**:
   - `checkCheckMate` verifica si el juego ha llegado a un estado de jaque mate, tablas, o alguna otra condición de fin de juego.

2. **Fin del Juego por Tiempo**:
   - `handleGameOverDueToTimeout` maneja la finalización del juego cuando se acaba el tiempo de un jugador, actualizando las estadísticas de los jugadores.

### Modo Single Player

#### Movimientos de Piezas

1. **Click en una Pieza**:
   - Similar al modo multijugador, `pieceClicked` verifica si es el turno del jugador y llama a `checkPossibleMoves` para obtener los movimientos posibles.

2. **Mover Pieza**:
   - `movePiece` envía las coordenadas del movimiento al backend.


#### Finalización del Juego

- Similar al modo multijugador, verificando condiciones de jaque mate, tablas, o tiempo agotado.

## Futuras Líneas de Desarrollo

1. **Mejoras en la Interfaz de Usuario**:
   - Implementación de animaciones para movimientos de piezas.
   - Mejora del diseño responsivo para diferentes dispositivos.

2. **Funcionalidades Adicionales**:
   - Sistema de clasificación y emparejamiento basado en ELO.

3. **Optimización del Backend**:
   - Implementación de pruebas unitarias y de integración.
   - Mejora en la gestión de conexiones WebSocket para soportar un mayor número de usuarios concurrentes.

4. **Características Sociales**:
   - Chat en tiempo real entre jugadores.
   - Lista de amigos y creación de partidas privadas.

5. **Análisis y Estadísticas**:
   - Análisis detallado de partidas con visualización de movimientos y estadísticas.
   - Generación de informes de rendimiento para los jugadores.

## Conclusión

Este proyecto de ajedrez multijugador y single player proporciona una plataforma robusta para jugar al ajedrez en tiempo real contra otros jugadores o contra una inteligencia artificial. La arquitectura basada en WebSockets y la implementación de características clave como el emparejamiento de jugadores y el control de tiempo aseguran una experiencia de usuario fluida y envolvente. Las futuras líneas de desarrollo apuntan a mejorar aún más la experiencia del usuario y añadir funcionalidades adicionales para hacer la plataforma más atractiva y competitiva.
