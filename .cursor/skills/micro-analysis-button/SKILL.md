---
name: micro-analysis-button
description: Explica el funcionamiento del botón de análisis (icono de matraz/flask) en la tabla de eventos de microbiología. Úsalo cuando el usuario pregunte por el botón con el número y el icono de matraz, o sobre cómo gestionar análisis de eventos.
---

# Botón de Análisis de Microbiología

Este skill detalla el funcionamiento, visualización y lógica detrás del botón de análisis presente en la tabla de eventos de calidad (específicamente en la vista de líder).

## Ubicación y Apariencia
El botón se encuentra en el componente `EventsTable` (`components/quality_v0/micro/events/events-table.tsx`), dentro de la columna **"análisis"**. 

- **Icono**: `FlaskConical` de la librería `lucide-react`.
- **Texto**: Muestra un número a la izquierda del icono que representa la cantidad de análisis realizados para ese evento (`event.analysisCount`).
- **Visibilidad**: Solo es visible para usuarios con rol de **Líder** (`view === "leader"`).

## Funcionamiento
Al hacer clic en el botón, se abre el modal de gestión de análisis (`AnalysisModal`):

1. **Validación**: El botón se deshabilita si el evento no ha sido confirmado (`sampleconfirm` es null) o si no hay un tipo de evento seleccionado.
2. **Acción**: Al activarse, establece el evento seleccionado (`setSelectedAnalysisEvent`) y abre el modal (`setAnalysisModalOpen(true)`).

## Contenido del Modal (AnalysisModal)
El modal desplegado permite gestionar los resultados de laboratorio asociados al evento:

- **Análisis Realizados**: Lista los análisis ya completados, mostrando su valor y fecha.
  - **Semáforo de Calidad**: Los resultados se comparan con un límite (`threshold`). Si cumplen la condición, se muestran en **verde** (pass); si no, en **rojo** (fail).
- **Análisis Pendientes**: Muestra formularios para ingresar nuevos resultados basados en los tipos de análisis configurados para ese evento.
  - **Tipos de entrada**: Soporta valores duales (MNPC/Numérico), booleanos (Positivo/Negativo), numéricos y texto.

## Información de la API

### Consulta de Análisis (Lectura)
Para obtener los análisis de un evento específico:
- **Servicio**: `getMicroAnalysisByEventId` en `lib/services/micro-analysis.service.ts`.
- **Endpoint**: `GET /micro-analysis/event/{eventId}`.
- **Respuesta**: Una lista de objetos `MicroAnalysis`.

### Creación de Análisis (Escritura)
Para registrar un nuevo resultado:
- **Servicio**: `createMicroAnalysis` en `lib/services/micro-analysis.service.ts`.
- **Endpoint**: `POST /micro-analysis`.
- **Payload**:
```json
{
  "eventId": 123,
  "typeId": "id-del-tipo",
  "options": "numeric|boolean|dual|string",
  "condition": "=|>=|<=|between|...",
  "value": "valor-del-resultado",
  "name": "Nombre del Análisis",
  "code": "COD-01",
  "threshold": "límite-esperado",
  "createdAt": "YYYY-MM-DD"
}
```

## Referencias de Código
- **Tabla**: `components/quality_v0/micro/events/events-table.tsx`
- **Modal**: `components/quality_v0/micro/events/analysis-modal.tsx`
- **Servicio**: `lib/services/micro-analysis.service.ts`
- **Tipos**: `lib/types/micro-analysis.ts`
