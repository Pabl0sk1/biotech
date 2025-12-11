# Vendedores

## Descripción

Almacena información de los vendedores del sistema.

## Modelo de datos

| Campo           | Tipo    | Descripción         |
| --------------- | ------- | ------------------- |
| id              | bigint  | Identificador único |
| nombre          | varchar | Nombre              |
| apellido        | varchar | Apellido            |
| nomape          | varchar | Nombre + Apellido   |
| nrodoc          | varchar | Documento           |
| nrotelefono     | varchar | Teléfono            |
| correo          | varchar | Correo electrónico  |
| fechanacimiento | date    | Fecha de nacimiento |

---

## Endpoints

### GET `/api/seller/list`

Lista todos los vendedores sin paginación.

### GET `/api/seller/list?page=0&size=10`

Lista todos los vendedores con paginación.

### GET `/api/seller/list?filter=id:eq:{id}`

Retorna los datos de un vendedor específico.

### POST `/api/seller/save`

Crea un nuevo vendedor.

### PUT `/api/seller/update/{id}`

Actualiza un vendedor existente.

### DELETE `/api/seller/delete/{id}`

Elimina un vendedor.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
        {
            "id": 1,
            "nomape": "Fredy, Gimenez",
            "nombre": "Fredy",
            "apellido": "Gimenez",
            "nrodoc": "9999999",
            "nrotelefono": "0983999999",
            "correo": "fredy@biosafras.com.py",
            "fechanacimiento": "1991-04-17"
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
            "nomape": "Fredy, Gimenez",
            "nombre": "Fredy",
            "apellido": "Gimenez",
            "nrodoc": "9999999",
            "nrotelefono": "0983999999",
            "correo": "fredy@biosafras.com.py",
            "fechanacimiento": "1991-04-17"
        },
        ...
    ]
}
```
