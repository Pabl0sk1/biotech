# Frontend (React)

## Descripción general

El frontend está desarrollado en **React**, consumiendo la API del backend mediante Axios o fetch, y gestionando sesiones con token.

---

## Tecnologías principales

- React
- React Router
- Axios
- Bootstrap
- Exceljs

---

## Estructura del proyecto

```
AppFront/
 ├── public/
 ├── src/
 │    ├── components/
 │    ├── services/
 │    ├── tasks/
 │    ├── utils/
```

### Explicación rápida

- **components**: pantallas de interfaces
- **services**: definiciones de endpoints
- **tasks**: lógica de tareas administrativas
- **utils**: algoritmos reutilizables

---

## Consumo de la API

```
axios.get(`${API_BASE_URL}/list`, {
    params: { page, size, order, filter, detail },
    headers: { Authorization: `Bearer ${token}` }
});
```

---

## Autenticación

El frontend:

- Almacena usuario (sessionStorage/localStorage)
- Controla expiración y redirecciones
- Restringe vistas según rol del usuario

---

## Diseño y UX

- Layout responsivo
- Formularios conectados a estados
- Validación básica antes de enviar al backend
