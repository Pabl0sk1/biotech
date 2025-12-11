# Modalidades

## Descripción

Define los tipos de turnos disponibles en el sistema.

## Modelo de datos

| Campo | Tipo    | Descripción         |
| ----- | ------- | ------------------- |
| id    | bigint  | Identificador único |
| tipo  | varchar | Tipo de turno       |

---

## Endpoints

### GET `/api/schedule/list`

Lista todas las modalidades sin paginación.

### GET `/api/schedule/list?page=0&size=10`

Lista todas las modalidades con paginación.

### GET `/api/schedule/list?filter=id:eq:{id}`

Retorna los datos de una modalidad específica.

### POST `/api/schedule/save`

Crea una nueva modalidad.

### PUT `/api/schedule/update/{id}`

Actualiza una modalidad existente.

### DELETE `/api/schedule/delete/{id}`

Elimina una modalidad.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
    {
      "id": 1,
      "tipo": "Diurno"
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
      "tipo": "Diurno"
    },
    ...
  ]
}
```
