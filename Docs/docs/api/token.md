# Tokens

## Descripción

Gestiona los tokens de autenticación de los usuarios.

## Modelo de datos

| Campo               | Tipo     | Descripción                |
| ------------------- | -------- | -------------------------- |
| id                  | bigint   | Identificador único        |
| usuario_id          | bigint   | Usuario al que pertenece   |
| token               | varchar  | Valor del token            |
| activo              | boolean  | Estado del token           |
| estado              | varchar  | Estado general             |
| fechacreacion       | datetime | Fecha de creación          |
| fechaexpiracion     | datetime | Fecha de expiración        |
| fechahoracreacion   | datetime | Fecha y hora de creación   |
| fechahoraexpiracion | datetime | Fecha y hora de expiración |

---

## Endpoints

### GET `/api/token/list`

Lista todos los tokens sin paginación.

### GET `/api/token/list?page=0&size=10`

Lista todos los tokens con paginación.

### GET `/api/token/list?filter=id:eq:{id}`

Retorna los datos de un token específico.

### POST `/api/token/save`

Crea un nuevo token.

### PUT `/api/token/update/{id}`

Actualiza un token existente.

### DELETE `/api/token/delete/{id}`

Elimina un token.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
        {
            "id": 1,
            "usuario": {
                "id": 1,
                "nombreusuario": "ADMIN",
                ...
            },
            "token": "aaaaaaaaaaaaaa111111111111111",
            "fechacreacion": "9999-09-09",
            "fechahoracreacion": "9999-09-09T11:24:37.596301",
            "fechaexpiracion": "9999-09-09",
            "fechahoraexpiracion": "9999-09-09T11:24:37.596301",
            "estado": "Activo",
            "activo": true
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
            "usuario": {
                "id": 1,
                "nombreusuario": "ADMIN",
                ...
            },
            "token": "aaaaaaaaaaaaaa111111111111111",
            "fechacreacion": "9999-09-09",
            "fechahoracreacion": "9999-09-09T11:24:37.596301",
            "fechaexpiracion": "9999-09-09",
            "fechahoraexpiracion": "9999-09-09T11:24:37.596301",
            "estado": "Activo",
            "activo": true
        },
        ...
    ]
}
```
