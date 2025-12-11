# Permisos

## Descripción

Gestiona los permisos que cada tipo de usuario tiene sobre cada módulo.

## Modelo de datos

| Campo          | Tipo    | Descripción                      |
| -------------- | ------- | -------------------------------- |
| id             | bigint  | Identificador único              |
| modulo_id      | bigint  | Relación con módulo              |
| tipousuario_id | bigint  | Relación con rol/tipo de usuario |
| puedeconsultar | boolean | Permiso de consultar             |
| puedeagregar   | boolean | Permiso de agregar               |
| puedeeditar    | boolean | Permiso de editar                |
| puedeeliminar  | boolean | Permiso de eliminar              |
| puedever       | boolean | Permiso de ver                   |

---

## Endpoints

### GET `/api/permission/list`

Lista todos los permisos sin paginación.

### GET `/api/permission/list?page=0&size=10`

Lista todos los permisos con paginación.

### GET `/api/permission/list?filter=id:eq:{id}`

Retorna los datos de un permiso específico.

### POST `/api/permission/save`

Crea un nuevo permiso.

### PUT `/api/permission/update/{id}`

Actualiza un permiso existente.

### DELETE `/api/permission/delete/{id}`

Elimina un permiso.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
        {
            "id": 1,
            "tipousuario": {
                "id": 1,
                "tipousuario": "Administrador"
            },
            "modulo": {
                "id": 1,
                "moduloes": "usuarios",
                ...
            },
            "puedeconsultar": true,
            "puedever": true,
            "puedeagregar": true,
            "puedeeditar": true,
            "puedeeliminar": true
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
            "tipousuario": {
                "id": 1,
                "tipousuario": "Administrador"
            },
            "modulo": {
                "id": 1,
                "moduloes": "usuarios",
                ...
            },
            "puedeconsultar": true,
            "puedever": true,
            "puedeagregar": true,
            "puedeeditar": true,
            "puedeeliminar": true
        },
        ...
    ]
}
```
