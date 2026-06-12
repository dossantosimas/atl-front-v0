---
name: create-micro-event-manual
description: Guía técnica sobre el funcionamiento del botón y modal para crear eventos de microbiología manualmente. Úsalo cuando el usuario pregunte cómo se crean eventos nuevos o sobre la lógica del modal de creación manual.
---

# Creación Manual de Eventos de Microbiología

Este skill detalla el funcionamiento del modal `CreateEventModal`, utilizado para registrar eventos que no fueron detectados automáticamente por el sistema.

## 1. Funcionamiento del Modal
El modal permite al usuario ingresar los datos básicos para dar de alta un nuevo evento en el sistema.

- **Componente**: `CreateEventModal` (`components/quality_v0/micro/events/create-event-modal.tsx`).
- **Campos Requeridos**:
  - **Elemento**: Seleccionado mediante un buscador (`ElementsCombobox`). Los elementos se filtran por el `typeId` actual.
  - **Fecha y Hora**: Se utiliza un input de tipo `datetime-local`. Esta fecha se aplica tanto a la confirmación de la muestra como al inicio del stream.

## 2. Lógica de Negocio
- **Carga de Elementos**: Al abrir el modal, se llama a `getMicroElementsByType(typeId)` para obtener los equipos/elementos válidos para ese tipo de evento.
- **Procesamiento de Fecha**: El valor del input se convierte a formato ISO (`toISOString()`) antes de enviarse a la API.
- **Valores por Defecto**: El campo `value` se envía siempre como `0` en la creación manual.

## 3. Integración con la API

### Crear Evento Manual
- **Servicio**: `createMicroEvent` en `lib/services/micro-events.service.ts`.
- **Ruta API**: `POST /micro-events/manual`.
- **Estructura del Payload (JSON)**:
  ```json
  {
    "elementId": 45,                // ID numérico del elemento/equipo
    "typeId": "uuid-del-tipo",      // ID del tipo de evento de calidad
    "sampleconfirm": "ISO-DATE",    // Fecha de confirmación
    "streamstardate": "ISO-DATE",   // Fecha de inicio del evento
    "value": 0                      // Valor inicial por defecto
  }
  ```

## 4. Referencias de Código
- **Modal de Creación**: `components/quality_v0/micro/events/create-event-modal.tsx`.
- **Buscador de Elementos**: `components/quality_v0/micro/events/elements-combobox.tsx`.
- **Servicio API**: `lib/services/micro-events.service.ts`.
- **Servicio Elementos**: `lib/services/micro-elements.service.ts`.
- **Tipos**: `lib/types/micro-elements.ts`, `lib/types/micro-events.ts`.
