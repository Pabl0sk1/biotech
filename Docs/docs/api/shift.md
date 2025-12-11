# Turnos

## Descripción

Define los turnos asignables a los funcionarios.

## Modelo de datos

| Campo        | Tipo    | Descripción              |
| ------------ | ------- | ------------------------ |
| id           | bigint  | Identificador único      |
| tipoturno_id | bigint  | Relación con modalidades |
| descripcion  | varchar | Descripción del turno    |
| horaent      | time    | Hora de entrada          |
| horasal      | time    | Hora de salida           |
| horades      | time    | Hora de descanso         |
| thoras       | numeric | Total de horas           |
| extporcen    | numeric | Porcentaje de extensión  |

---

## Endpoints

### GET `/api/shift/list`

Lista todos los turnos sin paginación.

### GET `/api/shift/list?page=0&size=10`

Lista todos los turnos con paginación.

### GET `/api/shift/list?filter=id:eq:{id}`

Retorna los datos de un turno específico.

### POST `/api/shift/save`

Crea un nuevo turno.

### PUT `/api/shift/update/{id}`

Actualiza un turno existente.

### DELETE `/api/shift/delete/{id}`

Elimina un turno.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
    {
      "id": 1,
      "tipoturno": {
        "id": 1,
        "tipo": "Diurno"
      },
      "descripcion": "Turno A",
      "horaent": "07:00:00",
      "horasal": "17:00:00",
      "horades": "01:00:00",
      "thoras": 50,
      "extporcen": 0,
      "turnodia": [
        {
          "id": 1,
          "dia": "Lunes"
        },
        ...
      ]
    },
    ...
  ]
}
```

## Ejemplo de Respuesta con Paginación (GET)

```json
{
  "totalItems": 10,
  "itemsPerPage": 100,
  "totalPages": 10,
  "currentPage": 0,
  "items": [
    {
      "id": 1,
      "tipoturno": {
        "id": 1,
        "tipo": "Diurno"
      },
      "descripcion": "Turno A",
      "horaent": "07:00:00",
      "horasal": "17:00:00",
      "horades": "01:00:00",
      "thoras": 50,
      "extporcen": 0,
      "turnodia": [
        {
          "id": 1,
          "dia": "Lunes"
        },
        ...
      ]
    },
    ...
  ]
}
```
