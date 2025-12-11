# Auditoría

## Descripción

Registra todas las acciones de usuarios sobre el sistema, incluyendo operaciones, fechas, IP y equipo.

## Modelo de datos

| Campo       | Tipo     | Descripción                                        |
| ----------- | -------- | -------------------------------------------------- |
| id          | bigint   | Identificador único                                |
| usuario_id  | bigint   | Usuario que realizó la acción                      |
| fechahora   | datetime | Fecha y hora de la acción                          |
| fecha       | date     | Fecha de la acción                                 |
| programa    | varchar  | Programa o módulo utilizado                        |
| operacion   | varchar  | Operación realizada (crear, editar, eliminar, ver) |
| codregistro | varchar  | Código del registro afectado                       |
| ip          | varchar  | IP del equipo                                      |
| equipo      | varchar  | Nombre del equipo                                  |

---

## Endpoints

### GET `/api/access/list`

Lista todos los accesos sin paginación.

### GET `/api/access/list?page=0&size=10`

Lista todos los accesos con paginación.

### GET `/api/access/list?filter=id:eq:{id}`

Retorna los datos de un acceso específico.

### GET `/api/access/networkInfo`

Obtiene el ip y nombre de equipo de la pc que realiza la consulta.

### POST `/api/access/save`

Crea un nuevo acceso.

### PUT `/api/access/update/{id}`

Actualiza un acceso existente.

### DELETE `/api/access/delete/{id}`

Elimina un acceso.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
    {
      "id": 1,
      "usuario": {
        "id": 1,
        "nombreusuario": "ADMIN"
        ...
      },
      "fecha": "2025-12-10",
      "fechahora": "2025-12-10T10:07:00",
      "programa": "Login",
      "operacion": "Cerrar Sesión",
      "codregistro": 0,
      "ip": "127.0.1.1",
      "equipo": "biosoftware"
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
        "nombreusuario": "ADMIN"
        ...
      },
      "fecha": "2025-12-10",
      "fechahora": "2025-12-10T10:07:00",
      "programa": "Login",
      "operacion": "Cerrar Sesión",
      "codregistro": 0,
      "ip": "127.0.1.1",
      "equipo": "biosoftware"
    },
    ...
  ]
}
```
