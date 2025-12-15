# Backend (Spring Boot)

## Descripción general

El backend está construido con **Spring Boot**, implementando una arquitectura modular orientada a servicios.  
Provee la API REST que interactúa con el frontend (React) y la base de datos PostgreSQL.

---

## Tecnologías principales

- Java 17+
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- Maven

---

## Estructura del proyecto

```
AppBack/
 ├── config/
 ├── entity/
 ├── repository/
 ├── service/
 ├── controller/
 ├── github/
```

### Explicación rápida

- **config**: ajustes de configuraciones necesarias
- **entity**: entidades del sistema.
- **repository**: acceso a datos con JPA.
- **service**: lógica de negocio.
- **controller**: manejan las rutas HTTP.
- **github**: maneja la actualización de la app web con cada push.

---

## Seguridad

El backend utiliza un mecanismo basado en token (explicar tu caso: JWT, token propio, tablas, etc.).

Incluye:

- Filtro de autenticación
- Manejo de expiración de tokens
- Control de permisos por tipo de usuario (roles)
- Protección de endpoints con Spring Security

---

## Log de auditoría

El sistema registra:

- usuario_id
- fecha/hora
- operación
- programa
- ip
- equipo
- código del registro manipulado

---

## Comunicación con el frontend

El frontend React consume la API vía endpoints REST:

Ejemplo:

```
GET https://biotech.biosafrasgroup.com.py/api/user/list
```

---

## Manejo de errores

El backend retorna respuestas estructuradas:

- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

Con mensajes claros en formato JSON.

---

## Ejemplo básico de arquitectura

Frontend (React) → Backend (Spring Boot) → PostgreSQL

El backend expone los módulos:

- usuarios
- turnos
- permisos
- sucursales
- funcionarios
- modulos
- cargos
- roles
- modalidades
- vendedores
- etc.

Cada módulo tiene:

- entidad
- repositorio
- servicio
- controlador
