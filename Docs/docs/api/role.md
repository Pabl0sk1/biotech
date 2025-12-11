# Roles

## Descripción

Define los roles o tipos de usuarios del sistema, que determinan los permisos sobre módulos.

## Modelo de datos

| Campo       | Tipo    | Descripción         |
| ----------- | ------- | ------------------- |
| id          | bigint  | Identificador único |
| tipousuario | varchar | Nombre del rol      |

---

## Endpoints

### GET `/api/role/list`

Lista todos los roles sin paginación.

### GET `/api/role/list?page=0&size=10`

Lista todos los roles con paginación.

### GET `/api/role/list?filter=id:eq:{id}`

Retorna los datos de un rol específico.

### POST `/api/role/save`

Crea un nuevo rol.

### PUT `/api/role/update/{id}`

Actualiza un rol existente.

### DELETE `/api/role/delete/{id}`

Elimina un rol.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
    {
      "id": 1,
      "tipousuario": "Administrador"
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
      "cargo": "Administrador"
    },
    ...
  ]
}
```
