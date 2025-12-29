import { getPermission } from '../services/permiso.service.js';

export const tienePermisoRuta = async (moduloVar, id) => {
    const response = await getPermission('', '', '', `tipousuario.id:eq:${id}`);
    const permisos = response.items;
    if (!permisos) return false;

    return moduloVar.some(mod => {
        const permiso = permisos.find(
            p => p.modulo.var.toLowerCase().trim() === mod.toLowerCase().trim()
        );
        return permiso?.puedeconsultar === true;
    });
};

export const tieneAccesoModulo = (modulos, lista) => {
    if (!Array.isArray(modulos) || !Array.isArray(lista)) return false;

    const setModulos = new Set(
        modulos.map(m => m.toLowerCase().trim())
    );

    return lista.some(p =>
        setModulos.has(p.modulo.var.toLowerCase().trim())
    );
};
