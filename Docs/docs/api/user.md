# Usuarios

## Descripción

El módulo de Usuarios gestiona la información de acceso y datos personales de los usuarios del sistema.  
Incluye credenciales, datos de contacto, rol asignado y su estado dentro de la organización.

## Modelo de datos

| Campo           | Tipo    | Descripción                     |
| --------------- | ------- | ------------------------------- |
| id              | bigint  | Identificador único             |
| tipousuario_id  | bigint  | Relación con la tabla roles     |
| sucursal_id     | bigint  | Relación con tabla sucursales   |
| nombreusuario   | varchar | Nombre de usuario para login    |
| contrasena      | varchar | Contraseña encriptada           |
| nombre          | varchar | Nombre del usuario              |
| apellido        | varchar | Apellido del usuario            |
| nomape          | varchar | Nombre + Apellido               |
| nrodoc          | varchar | Número de documento             |
| nrotelefono     | varchar | Teléfono                        |
| correo          | varchar | Correo electrónico              |
| direccion       | varchar | Dirección física                |
| estado          | boolean | Estado general                  |
| activo          | boolean | Cuenta habilitada/deshabilitada |
| fechanacimiento | date    | Fecha de nacimiento             |
| vermapa         | boolean | Permiso para ver mapa           |

---

## Endpoints

### GET `/api/user/list`

Lista todos los usuarios sin paginación.

### GET `/api/user/list?page=0&size=10`

Lista todos los usuarios con paginación.

### GET `/api/user/list?filter=id:eq:{id}`

Retorna los datos de un usuario específico.

### POST `/api/user/save`

Crea un nuevo usuario.

### POST `/api/user/login`

Validación para inicio de sesión.

### POST `/api/user/changePassword/{id}`

Actualiza la contraseña de un usuario específico.

### PUT `/api/user/update/{id}`

Actualiza un usuario existente.

### DELETE `/api/user/delete/{id}`

Elimina un usuario.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": {
    "id": 1,
    "tipousuario": {
      "id": 1,
      "tipousuario": "Administrador"
    },
    "sucursal": {
      "id": 2,
      "sucursal": "001-Central Hernandarias"
    },
    "nombreusuario": "JUANP",
    "contrasena": "12345",
    "nombre": "Juan",
    "apellido": "Pérez",
    "nomape": "Juan Pérez",
    "nrodoc": "4567892",
    "nrotelefono": "098112233",
    "correo": "juan@empresa.com",
    "direccion": "Hernandarias",
    "estado": "Activo",
    "activo": true,
    "fechanacimiento": "2001-04-17",
    "vermapa": true
  },
  ...
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
      "sucursal": {
        "id": 2,
        "sucursal": "001-Central Hernandarias"
      },
      "nombreusuario": "JUANP",
      "contrasena": "12345",
      "nombre": "Juan",
      "apellido": "Pérez",
      "nomape": "Juan Pérez",
      "nrodoc": "4567892",
      "nrotelefono": "098112233",
      "correo": "juan@empresa.com",
      "direccion": "Hernandarias",
      "estado": "Activo",
      "activo": true,
      "fechanacimiento": "2001-04-17",
      "vermapa": true
    },
    ...
  ]
}
```
