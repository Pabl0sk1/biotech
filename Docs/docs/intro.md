---
sidebar_position: 1
---

# Introducción

Esta documentación describe todos los módulos, endpoints y componentes internos del sistema **Biotech**, una plataforma desarrollada con **Spring Boot**, **PostgreSQL** y **React**, orientada a gestión empresarial y control operacional.

Aquí encontrarás:

- Descripción técnica detallada de cada módulo de la API.
- Estructura de la arquitectura backend, frontend y base de datos.
- Ejemplos reales de requests y responses.
- Reglas de negocio y validaciones aplicadas en cada módulo.
- Estándares internos como filtrado, paginación, ordenamiento y auditoría automática.

## Cómo usar esta documentación

Todos los endpoints de listado soportan:

| Parámetro | Tipo    | Descripción                                 |
| --------- | ------- | ------------------------------------------- |
| `page`    | Integer | Número de página.                           |
| `size`    | Integer | Cantidad de ítems por página.               |
| `order`   | String  | Campo de ordenamiento.                      |
| `filter`  | String  | Expresión de filtros múltiples.             |
| `detail`  | String  | Define si se cargan relaciones adicionales. |

## Sistema de filtrado dinámico

El backend soporta filtros avanzados con operadores:

- `contains`
- `starts`
- `ends`
- `eq`, `neq`
- `gt`, `gte`
- `lt`, `lte`
- `between`

### String:

- contains, starts, ends, eq, neq

### Number/Date:

- eq, neq, gt, gte, lt, lte, between

## Ejemplo de Peticiones para cada parámetro

### Page y Size

```
GET /api/user/list?page=0&size=10
```

### Order

```
GET /api/user/list?order=id,asc
```

```
GET /api/user/list?order=id,desc
```

### Filter (Simple)

#### contains (contiene)

```
GET /api/user/list?filter=nombreusuario:contains:mi
```

#### starts (comienza con)

```
GET /api/user/list?filter=nombreusuario:starts:ad
```

#### ends (termina con)

```
GET /api/user/list?filter=nombreusuario:ends:min
```

#### eq (igual que)

```
GET /api/user/list?filter=id:eq:4
```

#### neq (distinto que)

```
GET /api/user/list?filter=activo:neq:false
```

#### gt (mayor que)

```
GET /api/user/list?filter=id:gt:2
```

#### gt (mayor o igual que)

```
GET /api/user/list?filter=id:gte:2
```

#### lt (menor que)

```
GET /api/user/list?filter=id:lt:8
```

#### lte (menor o igual que)

```
GET /api/user/list?filter=fechanacimiento:lte:1991-04-17
```

#### between (entre)

```
GET /api/user/list?filter=fechanacimiento:between:1991-04-17..2003-04-17
```

```
GET /api/user/list?filter=id:between:10..20
```

### Filter (Multiplo)

```
GET /api/user/list?filter=fechanacimiento:between:1991-04-17..2003-04-17;nombre:contains:el;activo:eq:true
```

### Filter (Relacionado)

```
GET /api/user/list?filter=tipousuario.tipousuario:contains:ad
```

```
GET /api/employee/list?filter=sucursal.sucursal:contains:001
```

### Detail (Si es que lo contiene)

```
GET /api/shift/list?detail=days
```

### Detail (Con filtros y paginación también)

```
GET /api/shift/list?detail=days&page=0&size=10&filter=dia:eq:lunes
```

## Módulos de la API

- [Cargos](api/position)
- [Funcionarios](api/employee)
- [Modulos](api/module)
- [Permisos](api/permission)
- [Sucursales](api/branch)
- [Modalidades](api/schedule)
- [Roles](api/role)
- [Turnos](api/shift)
- [Usuarios](api/user)
- [Vendedores](api/seller)
