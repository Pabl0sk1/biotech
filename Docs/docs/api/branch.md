# Sucursales

## Descripción

Almacena las sucursales de la empresa.

## Modelo de datos

| Campo    | Tipo    | Descripción           |
| -------- | ------- | --------------------- |
| id       | bigint  | Identificador         |
| sucursal | varchar | Nombre de la sucursal |

---

## Endpoints

### GET `/api/branch/list`

Lista todas las sucursales sin paginación.

### GET `/api/branch/list?page=0&size=10`

Lista todas las sucursales con paginación.

### GET `/api/branch/list?filter=id:eq:{id}`

Retorna los datos de una sucursal específica.

### POST `/api/branch/save`

Crea una nueva sucursal.

### PUT `/api/branch/update/{id}`

Actualiza una sucursal existente.

### DELETE `/api/branch/delete/{id}`

Elimina una sucursal.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
    {
      "id": 1,
      "sucursal": "001-Central Hernandarias"
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
      "sucursal": "001-Central Hernandarias"
    },
    ...
  ]
}
```
