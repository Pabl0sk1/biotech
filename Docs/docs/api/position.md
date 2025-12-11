# Cargos

## Descripción

Almacena los cargos que pueden tener los funcionarios.

## Modelo de datos

| Campo | Tipo    | Descripción         |
| ----- | ------- | ------------------- |
| id    | bigint  | Identificador único |
| cargo | varchar | Nombre del cargo    |

---

## Endpoints

### GET `/api/position/list`

Lista todos los cargos sin paginación.

### GET `/api/position/list?page=0&size=10`

Lista todos los cargos con paginación.

### GET `/api/position/list?filter=id:eq:{id}`

Retorna los datos de un cargo específico.

### POST `/api/position/save`

Crea un nuevo cargo.

### PUT `/api/position/update/{id}`

Actualiza un cargo existente.

### DELETE `/api/position/delete/{id}`

Elimina un cargo.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
    {
      "id": 1,
      "cargo": "PROGRAMADOR"
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
      "cargo": "PROGRAMADOR"
    },
    ...
  ]
}
```
