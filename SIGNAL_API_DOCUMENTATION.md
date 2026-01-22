# Signal API - Documentación de Rutas y JSON

## Base URL
```
http://10.45.240.63:3016/signals
```

---

## 1. GET /signals - Obtener todas las señales

### Descripción
Obtiene todas las señales con filtros opcionales. La respuesta incluye el objeto `influx` completo con todos los campos de SourceData, incluyendo `name`.

### Query Parameters (todos opcionales)
- `departmentId` (number): Filtrar por departamento
- `subareaId` (number): Filtrar por subárea
- `equipmentId` (number): Filtrar por equipo
- `deviceId` (number): Filtrar por dispositivo
- `name` (string): Buscar por nombre (búsqueda parcial)
- `enabled` (boolean): Filtrar por estado habilitado/deshabilitado
- `sourceDataId` (number): Filtrar por fuente de datos (Influx)

### Ejemplo de Request
```typescript
// Sin filtros
GET /signals

// Con filtros
GET /signals?departmentId=2&subareaId=5&enabled=true&name=temperatura
```

### Ejemplo de Response
```json
[
  {
    "id": 1,
    "name": "Temperatura Tanque 1",
    "description": "Sensor de temperatura del tanque principal",
    "deviceId": 15,
    "influxId": 3,
    "sourceDataId": 3,
    "pyRun": "script.py",
    "enabled": true,
    "tag": "temp_tank_1",
    "influxQuery": "from(bucket: \"production\") |> range(start: -1h)",
    "influxParameter": {
      "measurement": "temperature",
      "field": "value"
    },
    "level": 1,
    "plannedId": 10,
    "config": {
      "threshold": 100,
      "unit": "Celsius"
    },
    "device": {
      "id": 15,
      "name": "Sensor Temp 01",
      "equipmentId": 8,
      "equipment": {
        "id": 8,
        "name": "Tanque Principal",
        "subareaId": 5,
        "subarea": {
          "id": 5,
          "name": "Producción",
          "departmentId": 2,
          "department": {
            "id": 2,
            "name": "Manufactura"
          }
        }
      }
    },
    "influx": {
      "id": 3,
      "name": "InfluxDB Production",
      "url": "http://influxdb.example.com:8086",
      "user": "admin",
      "token": "***",
      "bucket": "production",
      "nameInfo": "Producción principal"
    },
    "planning": {
      "id": 10,
      "name": "Plan Mensual"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
]
```

---

## 2. GET /signals/:id - Obtener una señal por ID

### Descripción
Obtiene una señal específica por su ID. Incluye todas las relaciones completas.

### Ejemplo de Request
```typescript
GET /signals/1
```

### Ejemplo de Response
```json
{
  "id": 1,
  "name": "Temperatura Tanque 1",
  "description": "Sensor de temperatura del tanque principal",
  "deviceId": 15,
  "influxId": 3,
  "sourceDataId": 3,
  "pyRun": "script.py",
  "enabled": true,
  "tag": "temp_tank_1",
  "influxQuery": "from(bucket: \"production\") |> range(start: -1h)",
  "influxParameter": {
    "measurement": "temperature",
    "field": "value"
  },
  "level": 1,
  "plannedId": 10,
  "config": {
    "threshold": 100,
    "unit": "Celsius",
    "alerts": {
      "min": 0,
      "max": 200
    }
  },
  "device": {
    "id": 15,
    "name": "Sensor Temp 01",
    "equipmentId": 8,
    "equipment": {
      "id": 8,
      "name": "Tanque Principal",
      "subareaId": 5,
      "subarea": {
        "id": 5,
        "name": "Producción",
        "departmentId": 2,
        "department": {
          "id": 2,
          "name": "Manufactura"
        }
      }
    }
  },
  "influx": {
    "id": 3,
    "name": "InfluxDB Production",
    "url": "http://influxdb.example.com:8086",
    "user": "admin",
    "token": "***",
    "bucket": "production",
    "nameInfo": "Producción principal"
  },
  "planning": {
    "id": 10,
    "name": "Plan Mensual"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

---

## 3. POST /signals - Crear señal

### Descripción
Crea una nueva señal. Después de guardar, recarga la señal con todas las relaciones (device, influx, planning).

### Ejemplo de Request
```typescript
POST /signals
Content-Type: application/json

{
  "name": "Temperatura Tanque 1",
  "description": "Sensor de temperatura",
  "deviceId": 15,
  "sourceDataId": 3,
  "tag": "temp_tank_1",
  "influxQuery": "from(bucket: \"production\") |> range(start: -1h)",
  "influxParameter": {
    "measurement": "temperature",
    "field": "value"
  },
  "pyRun": "script.py",
  "enabled": true,
  "level": 1,
  "plannedId": 10,
  "config": {
    "threshold": 100,
    "unit": "Celsius",
    "alerts": {
      "min": 0,
      "max": 200
    }
  }
}
```

### Campos del Request
- `name` (string, **requerido**): Nombre de la señal
- `description` (string, opcional): Descripción
- `deviceId` (number, opcional): ID del dispositivo
- `sourceDataId` (number, opcional): ID de la fuente de datos (Influx)
- `tag` (string, opcional): Tag de la señal
- `influxQuery` (string, opcional): Consulta InfluxDB (legacy)
- `influxParameter` (object, opcional): Parámetros de InfluxDB
- `pyRun` (string, opcional): Script Python a ejecutar
- `enabled` (boolean, opcional): Estado habilitado (default: true)
- `level` (number, opcional): Nivel
- `plannedId` (number, opcional): ID del plan
- `config` (object, opcional): Configuración JSON

### Ejemplo de Response
```json
{
  "id": 1,
  "name": "Temperatura Tanque 1",
  "description": "Sensor de temperatura",
  "deviceId": 15,
  "influxId": 3,
  "sourceDataId": 3,
  "pyRun": "script.py",
  "enabled": true,
  "tag": "temp_tank_1",
  "influxQuery": "from(bucket: \"production\") |> range(start: -1h)",
  "influxParameter": {
    "measurement": "temperature",
    "field": "value"
  },
  "level": 1,
  "plannedId": 10,
  "config": {
    "threshold": 100,
    "unit": "Celsius",
    "alerts": {
      "min": 0,
      "max": 200
    }
  },
  "device": {
    "id": 15,
    "name": "Sensor Temp 01",
    "equipmentId": 8,
    "equipment": {
      "id": 8,
      "name": "Tanque Principal",
      "subareaId": 5,
      "subarea": {
        "id": 5,
        "name": "Producción",
        "departmentId": 2,
        "department": {
          "id": 2,
          "name": "Manufactura"
        }
      }
    }
  },
  "influx": {
    "id": 3,
    "name": "InfluxDB Production",
    "url": "http://influxdb.example.com:8086",
    "user": "admin",
    "token": "***",
    "bucket": "production",
    "nameInfo": "Producción principal"
  },
  "planning": {
    "id": 10,
    "name": "Plan Mensual"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 4. PUT /signals/:id - Actualizar señal

### Descripción
Actualiza una señal existente. Después de guardar, recarga la señal con todas las relaciones.

### Ejemplo de Request
```typescript
PUT /signals/1
Content-Type: application/json

{
  "name": "Nuevo nombre de señal",
  "enabled": false,
  "config": {
    "threshold": 150,
    "unit": "Fahrenheit"
  }
}
```

### Campos del Request (todos opcionales)
- `name` (string): Nombre de la señal
- `description` (string): Descripción
- `deviceId` (number): ID del dispositivo
- `sourceDataId` (number): ID de la fuente de datos
- `tag` (string): Tag de la señal
- `influxQuery` (string): Consulta InfluxDB
- `influxParameter` (object): Parámetros de InfluxDB
- `pyRun` (string): Script Python
- `enabled` (boolean): Estado habilitado
- `level` (number): Nivel
- `plannedId` (number): ID del plan
- `config` (object): Configuración JSON

### Ejemplo de Response
```json
{
  "id": 1,
  "name": "Nuevo nombre de señal",
  "description": "Sensor de temperatura",
  "deviceId": 15,
  "influxId": 3,
  "sourceDataId": 3,
  "pyRun": "script.py",
  "enabled": false,
  "tag": "temp_tank_1",
  "influxQuery": "from(bucket: \"production\") |> range(start: -1h)",
  "influxParameter": {
    "measurement": "temperature",
    "field": "value"
  },
  "level": 1,
  "plannedId": 10,
  "config": {
    "threshold": 150,
    "unit": "Fahrenheit"
  },
  "device": {
    "id": 15,
    "name": "Sensor Temp 01",
    "equipmentId": 8,
    "equipment": {
      "id": 8,
      "name": "Tanque Principal",
      "subareaId": 5,
      "subarea": {
        "id": 5,
        "name": "Producción",
        "departmentId": 2,
        "department": {
          "id": 2,
          "name": "Manufactura"
        }
      }
    }
  },
  "influx": {
    "id": 3,
    "name": "InfluxDB Production",
    "url": "http://influxdb.example.com:8086",
    "user": "admin",
    "token": "***",
    "bucket": "production",
    "nameInfo": "Producción principal"
  },
  "planning": {
    "id": 10,
    "name": "Plan Mensual"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

---

## 5. DELETE /signals/:id - Eliminar señal

### Descripción
Elimina una señal por su ID.

### Ejemplo de Request
```typescript
DELETE /signals/1
```

### Ejemplo de Response
```
204 No Content
```

---

## 6. GET /devices/:id/signals - Señales de un dispositivo

### Descripción
Obtiene todas las señales de un dispositivo específico con filtros opcionales.

### Query Parameters (todos opcionales)
- `name` (string): Buscar por nombre
- `enabled` (boolean): Filtrar por estado
- `sourceDataId` (number): Filtrar por fuente de datos

### Ejemplo de Request
```typescript
GET /devices/15/signals
GET /devices/15/signals?enabled=true&name=temperatura
```

### Ejemplo de Response
```json
[
  {
    "id": 1,
    "name": "Temperatura Tanque 1",
    "description": "Sensor de temperatura",
    "deviceId": 15,
    "influxId": 3,
    "sourceDataId": 3,
    "enabled": true,
    "tag": "temp_tank_1",
    "influx": {
      "id": 3,
      "name": "InfluxDB Production",
      "url": "http://influxdb.example.com:8086",
      "user": "admin",
      "token": "***",
      "bucket": "production",
      "nameInfo": "Producción principal"
    },
    "device": {
      "id": 15,
      "name": "Sensor Temp 01",
      "equipmentId": 8
    },
    "planning": {
      "id": 10,
      "name": "Plan Mensual"
    }
  }
]
```

---

## Estructura de Datos

### Signal
```typescript
interface Signal {
  id: number;
  name: string;
  description?: string | null;
  deviceId?: number | null;
  sourceDataId?: number | null; // legacy
  influxId?: number | null; // ID de SourceData (Influx)
  pyRun?: string | null;
  enabled?: boolean;
  tag?: string | null;
  influxQuery?: string | null; // Consulta InfluxDB (legacy)
  influxParameter?: Record<string, any> | null;
  level?: number | null;
  plannedId?: number | null;
  config?: any;
  
  // Relaciones completas
  device?: {
    id: number;
    name: string;
    equipmentId?: number;
    equipment?: {
      id: number;
      name: string;
      subareaId?: number;
      subarea?: {
        id: number;
        name: string;
        departmentId?: number;
        department?: {
          id: number;
          name: string;
        };
      };
    };
  } | null;
  
  // Objeto completo de SourceData (Influx) con todos los campos incluyendo name
  influx?: {
    id: number;
    name: string; // ✅ Nombre incluido
    url: string;
    user: string;
    token: string;
    bucket: string;
    nameInfo?: string | null;
  } | null;
  
  planning?: {
    id: number;
    name?: string;
  } | null;
  
  createdAt?: string;
  updatedAt?: string;
}
```

---

## Notas Importantes

1. **Campo `influx`**: Ahora es un objeto completo que incluye todos los campos de SourceData, incluyendo el `name`. El nombre está disponible en `signal.influx.name`.

2. **Campo `influxId`**: Es el ID numérico de SourceData (Influx). Se puede usar para referencias rápidas.

3. **Campo `influxQuery`**: Es el string de consulta InfluxDB (legacy). Se mantiene para compatibilidad.

4. **Relaciones completas**: Después de crear o actualizar una señal, la respuesta incluye todas las relaciones completas (device con su jerarquía completa, influx completo, planning).

5. **Filtros combinables**: Todos los filtros en `GET /signals` son opcionales y se pueden combinar.

---

## Ejemplos de Código

### Axios - Obtener todas las señales
```typescript
import axios from 'axios';

const response = await axios.get('http://10.45.240.63:3016/signals', {
  params: {
    departmentId: 2,
    enabled: true,
    name: 'temperatura'
  }
});

const signals = response.data;
console.log(signals[0].influx?.name); // "InfluxDB Production"
```

### Axios - Crear señal
```typescript
import axios from 'axios';

const newSignal = {
  name: "Nueva Señal",
  description: "Descripción",
  deviceId: 15,
  sourceDataId: 3,
  enabled: true,
  config: {
    threshold: 100,
    unit: "Celsius"
  }
};

const response = await axios.post('http://10.45.240.63:3016/signals', newSignal);
const createdSignal = response.data;
console.log(createdSignal.influx?.name); // "InfluxDB Production"
```

### Fetch - Actualizar señal
```typescript
const updatedSignal = {
  name: "Nombre actualizado",
  enabled: false
};

const response = await fetch('http://10.45.240.63:3016/signals/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updatedSignal)
});

const signal = await response.json();
console.log(signal.influx?.name); // "InfluxDB Production"
```

---

## Cambios en el Backend

1. **Método `create`**: Después de guardar, recarga la señal con todas las relaciones (device, influx, planning).
2. **Método `update`**: Después de guardar, recarga la señal con todas las relaciones.
3. **Respuesta de Signal**: Ahora incluye el objeto `influx` completo con todos los campos de SourceData, incluyendo `name`.

Esto aplica a:
- `GET /signals` - Todas las señales
- `GET /signals/:id` - Una señal específica
- `POST /signals` - Crear señal
- `PUT /signals/:id` - Actualizar señal
- `GET /devices/:id/signals` - Señales de un dispositivo
- Cualquier filtro que devuelva señales

El nombre de SourceData estará disponible en `influx.name`.

