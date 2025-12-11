# Configuración

## Descripción

El módulo Configuración almacena los parámetros generales del sistema, como correos, colores, imágenes y tipo de entidad.

## Modelo de datos

| Campo       | Tipo    | Descripción           |
| ----------- | ------- | --------------------- |
| id          | bigint  | Identificador único   |
| entidad     | varchar | Nombre de la entidad  |
| correo      | varchar | Correo principal      |
| colorpri    | varchar | Color principal       |
| colorsec    | varchar | Color secundario      |
| colorter    | varchar | Color de texto        |
| nombre      | varchar | Nombre del sistema    |
| tipo        | varchar | Tipo de configuración |
| nrotelefono | varchar | Teléfono principal    |
| imagenurl   | varchar | URL de la imagen/logo |

---

## Endpoints

### GET `/api/config/list`

Lista todas las configuraciones sin paginación.

### GET `/api/config/list?page=0&size=10`

Lista todas las configuraciones con paginación.

### GET `/api/config/list?filter=id:eq:{id}`

Retorna los datos de una configuración específica.

### POST `/api/config/save`

Crea una nueva configuración.

### PUT `/api/config/update/{id}`

Actualiza una configuración existente.

### DELETE `/api/config/deleteImage/{id}`

Elimina la imagen de una configuración.

---

## Ejemplo de Respuesta sin Paginación (GET)

```json
{
  "items": [
    {
      "id": 1,
      "entidad": "Biosafras Group",
      "correo": "comercial@biosafras.com.py",
      "nrotelefono": "0983999999",
      "colorpri": "#69d043",
      "colorsec": "#88cda3",
      "colorter": "#f68828",
      "nombre": "logo.png",
      "tipo": "image/png",
      "imagenurl": "/logo/7c502f4c-c88f-4621-ab91-55c7d18968b7_logo.png"
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
      "entidad": "Biosafras Group",
      "correo": "comercial@biosafras.com.py",
      "nrotelefono": "0983999999",
      "colorpri": "#69d043",
      "colorsec": "#88cda3",
      "colorter": "#f68828",
      "nombre": "logo.png",
      "tipo": "image/png",
      "imagenurl": "/logo/7c502f4c-c88f-4621-ab91-55c7d18968b7_logo.png"
    },
    ...
  ]
}
```
