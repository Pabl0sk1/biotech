# Funcionarios

## Descripción

Representa los empleados de la empresa y sus datos personales y laborales.

## Modelo de datos

| Campo           | Tipo    | Descripción             |
| --------------- | ------- | ----------------------- |
| id              | bigint  | Identificador único     |
| cargo_id        | bigint  | Relación con Cargos     |
| sucursal_id     | bigint  | Relación con Sucursales |
| nombre          | varchar | Nombre del funcionario  |
| apellido        | varchar | Apellido                |
| nomape          | varchar | Nombre + Apellido       |
| nrodoc          | varchar | Documento               |
| nrotelefono     | varchar | Teléfono                |
| correo          | varchar | Correo electrónico      |
| fechanacimiento | date    | Fecha de nacimiento     |
| salario         | numeric | Salario                 |
| codigo          | varchar | Código interno          |

---

## Endpoints

### GET `/api/employee/list`

Lista todos los funcionarios sin paginación.

### GET `/api/employee/list?page=0&size=10`

Lista todos los funcionarios sin paginación.

### GET `/api/employee/list?filter=id:eq:{id}`

Retorna los datos de un funcionario específica.

### POST `/api/employee/save`

Crea un nuevo funcionario.

### PUT `/api/employee/update/{id}`

Actualiza un funcionario existente.

### DELETE `/api/employee/delete/{id}`

Elimina un funcionario.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
        {
            "id": 23,
            "cargo": {
                "id": 1,
                "cargo": "PROGRAMADOR"
            },
            "sucursal": {
                "id": 1,
                "sucursal": "001-Central Hernandarias"
            },
            "nomape": "Antonio, Vazquez",
            "nombre": "Antonio",
            "apellido": "Vazquez",
            "nrodoc": "999999",
            "nrotelefono": "",
            "correo": "antonio@biosafras.com.py",
            "fechanacimiento": "1978-06-21",
            "salario": 3000000,
            "codigo": 37
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
            "id": 23,
            "cargo": {
                "id": 1,
                "cargo": "PROGRAMADOR"
            },
            "sucursal": {
                "id": 1,
                "sucursal": "001-Central Hernandarias"
            },
            "nomape": "Antonio, Vazquez",
            "nombre": "Antonio",
            "apellido": "Vazquez",
            "nrodoc": "999999",
            "nrotelefono": "",
            "correo": "antonio@biosafras.com.py",
            "fechanacimiento": "1978-06-21",
            "salario": 3000000,
            "codigo": 37
        },
        ...
    ]
}
```
