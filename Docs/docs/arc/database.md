# Base de Datos

## Descripción general

El sistema utiliza PostgreSQL como motor de base de datos relacional.
El esquema refleja la estructura organizacional y elementos operativos.

---

## Principales tablas del sistema

### 1. Usuarios

- Almacena credenciales y datos de acceso.

### 2. Roles

- Define permisos generales.

### 3. Módulos

- Representa áreas funcionales del sistema.

### 4. Permisos

- Define qué puede hacer cada rol en cada módulo.

### 5. Funcionarios

- Información de empleados.

### 6. Cargos

- Rol laboral del funcionario.

### 7. Turnos y Modalidades

- Manejo horario y modalidades.

### 8. Sucursales

- Manejo de las sucursales.

### 9. Vendedores

- Información de los vendedores.

---

## Buenas prácticas aplicadas

- Claves foráneas en todas las relaciones.
- Índices en campos de búsqueda frecuente.
- Auditorías de alto volumen en tabla separada.
