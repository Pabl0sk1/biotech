# Módulos

## Descripción

Define los módulos del sistema a los cuales se asignan permisos por rol de usuario.

## Modelo de datos

| Campo    | Tipo    | Descripción       |
| -------- | ------- | ----------------- |
| id       | bigint  | Identificador     |
| var      | varchar | Variable interna  |
| moduloen | varchar | Nombre en inglés  |
| moduloes | varchar | Nombre en español |

---

## Endpoints

### GET `/api/module/list`

Lista todos los modulos sin paginación.

### GET `/api/module/list?page=0&size=10`

Lista todos los modulos con paginación.

### GET `/api/module/list?filter=id:eq:{id}`

Retorna los datos de un modulo específico.

### POST `/api/module/save`

Crea un nuevo módulo.

### PUT `/api/module/update/{id}`

Actualiza un módulo existente.

### DELETE `/api/module/delete/{id}`

Elimina un módulo.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
        {
            "id": 1,
            "moduloes": "usuarios",
            "moduloen": "users",
            "var": "AA00"
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
            "moduloes": "usuarios",
            "moduloen": "users",
            "var": "AA00"
        },
        ...
    ]
}
```
