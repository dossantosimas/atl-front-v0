---
name: micro-analysis-comprehensive-guide
description: Guía maestra definitiva sobre el sistema de microbiología. Incluye flujos de trabajo, rutas de API, estructuras JSON detalladas y la lógica exacta de comparación de resultados. Úsalo como referencia única para desarrollo, depuración e integración.
---

# Guía Maestra de Micro-Análisis y Eventos

Esta guía consolida todo el conocimiento técnico y funcional sobre el ciclo de vida de los eventos de calidad y sus análisis asociados.

## 1. Ciclo de Vida del Evento

### Fase 1: Confirmación de Muestra (Operador)
El operador valida la toma de muestra y asigna un responsable.
- **Ruta API**: `PUT /micro-events/{id}`
- **JSON de Envío**:
  ```json
  {
    "sampleresponsableId": "uuid-persona",
    "sampleconfirm": "2026-05-04T14:30:00.000Z"
  }
  ```

### Fase 2: Registro de Análisis (Líder)
Una vez confirmado, el líder registra los resultados de laboratorio.
- **Ruta API**: `POST /micro-analysis`
- **JSON de Envío**:
  ```json
  {
    "eventId": 123,
    "typeId": "uuid-tipo-analisis",
    "value": "0.5",
    "options": "numeric",
    "condition": "<=",
    "threshold": "1.0",
    "name": "Bacterias Aerobias",
    "code": "WLD",
    "createdAt": "2026-05-04"
  }
  ```

## 2. Consultas de Datos (Lectura)

### Listar Análisis de un Evento
- **Ruta API**: `GET /micro-analysis/by-event/{eventId}`
- **JSON de Respuesta (Ejemplo)**:
  ```json
  [
    {
      "id": 501,
      "name": "Levadura Salvaje",
      "code": "YM+Cu",
      "value": "0",
      "threshold": "10",
      "condition": "<=",
      "options": "numeric",
      "type_id": "uuid-tipo-levadura",
      "created": "2026-04-22T19:00:00.000Z"
    }
  ]
  ```
  *Nota: El campo `type_id` viene en snake_case desde la API.*

## 3. Lógica Maestra de Comparación

La función `evaluationWithThreshold` utiliza los campos `value` y `threshold` del JSON del análisis para determinar el estado de calidad.

### Algoritmo de Decisión:
1. **Normalización**: Se limpian los strings con `.trim()`.
2. **Conversión Numérica**: Se intenta `parseFloat()` en ambos valores. Se activa la bandera `areNumbers` si ambos son numéricos válidos.
3. **Comparación por Condición**:
   - **`=`**: `valueStr === thresholdStr`
   - **`>` / `>=` / `<` / `<=`**: 
     - Si `areNumbers` es true: Comparación matemática (`valueNum <= thresholdNum`).
     - Si `areNumbers` es false: Comparación alfabética (`valueStr <= thresholdStr`).
   - **`!=`**: `valueStr !== thresholdStr`
   - **`between`**: 
     - Divide el `threshold` por el guion (ej: `"0-10"` -> `[0, 10]`).
     - Verifica: `value >= min && value <= max`.

### Estados de la UI:
- **`pass` (Verde)**: La condición se cumple.
- **`fail` (Rojo)**: La condición NO se cumple.
- **`no-threshold` (Gris)**: Falta el valor o el límite para comparar.

## 4. Mapeo de Entradas (`options`)
El campo `options` define qué componente de input se muestra en la UI:
- **`boolean`**: Selector de "Positivo / Negativo".
- **`dual`**: Input para "MNPC / Numérico".
- **`numeric`**: Input numérico estándar.
- **`string` / `otro`**: Área de texto libre.

## Referencias de Implementación
- **UI Modal**: `components/quality_v0/analysis-modal.tsx`
- **Servicio Eventos**: `lib/services/micro-events.service.ts`
- **Servicio Análisis**: `lib/services/micro-analysis.service.ts`
- **Tipos TS**: `lib/types/micro-analysis.ts`
