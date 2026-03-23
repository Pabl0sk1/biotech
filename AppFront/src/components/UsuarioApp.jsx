import { useState, useEffect } from 'react';
import { getUser, saveUser, updateUser, deleteUser } from '../services/usuario.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { getRole } from '../services/tipousuario.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';
import Duplicate from '../layouts/Duplicate.jsx';

export const UsuarioApp = ({ userLog, setUserLog }) => {

    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
    const [rowAVisualizar, setRowAVisualizar] = useState(null);
    const [rowDuplicado, setRowDuplicado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState({
        page: 0,
        size: 10,
        order: "",
        filter: []
    });

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setRowAEliminar(null);
                setRowAVisualizar(null);
                if (rowDuplicado) {
                    setRowDuplicado(null);
                    return;
                }
                setRowAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [rowDuplicado]);

    const selected = {
        id: null,
        tipousuario: null,
        sucursal: null,
        nombreusuario: "",
        contrasena: "",
        nomape: "",
        nombre: "",
        apellido: "",
        nrodoc: "",
        nrotelefono: "",
        correo: "",
        direccion: "",
        fechanacimiento: "",
        estado: "Activo",
        activo: true,
        online: false,
        vermapa: false,
        imagentipo: "",
        imagennombre: "",
        imagenurl: ""
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        tipousuario: {
            type: "object",
            options: roles,
            searches: ['tipousuario'],
            label: "Rol",
            getLabel: (item) => item?.tipousuario || "",
            module: ['sc03'],
            listPath: "/home/security/roles",
            popupTitle: "Roles",
            notnull: true,
            autofocus: true,
            order: 1
        },
        sucursal: {
            type: "object",
            options: sucursales,
            searches: ['sucursal'],
            label: "Sucursal",
            getLabel: (item) => item?.sucursal || "",
            module: ['gr03'],
            listPath: "/home/config/general/branchs",
            popupTitle: "Sucursales",
            notnull: true,
            order: 2
        },
        nombreusuario: { notnull: true, label: "Nombre de Usuario", order: 5, lettercase: "upper", size: 50 },
        contrasena: { type: "password", label: "Contraseña", notnull: true, order: 6, size: 30 },
        nomape: { size: 150, hidden: true },
        nombre: { size: 150, notnull: true, order: 3 },
        apellido: { size: 150, order: 4 },
        nrodoc: { label: "Nro. de documento", order: 7, size: 30 },
        nrotelefono: { type: "tel", label: "Nro. de teléfono", order: 8, size: 30 },
        correo: { type: "email", order: 9, size: 30 },
        direccion: { type: "textarea", label: "Dirección", order: 13, size: 150 },
        fechanacimiento: { type: "date", label: "Fecha de nacimiento", order: 10 },
        estado: { type: "select", options: ["Activo", "Inactivo"], order: 11 },
        activo: { hidden: true },
        vermapa: { type: "checkbox", label: "¿Puede ver informe Power-Bi?", order: 12 },
        online: { hidden: true },
        imagennombre: { hidden: true },
        imagentipo: { hidden: true },
        imagenurl: { hidden: true }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        nombreusuario: { label: "Usuario", type: "string", classname: "text-start", default: true },
        contrasena: { hidden: true },
        tipousuario: { label: "Rol", type: "string", field: "tipousuario.tipousuario", classname: "text-start", default: true },
        sucursal: { label: "Sucursal", type: "string", field: "sucursal.sucursal", classname: "text-start" },
        nomape: { label: "Nombre/Apellido", type: "string", classname: "text-start" },
        nombre: { hidden: true },
        apellido: { hidden: true },
        nrodoc: { label: "Nro. de documento", type: "string", classname: "text-end" },
        nrotelefono: { label: "Nro. de teléfono", type: "string", classname: "text-end" },
        correo: { label: "Correo", type: "string", classname: "text-start", default: true },
        fechanacimiento: { label: "Fecha de nacimiento", type: "date" },
        estado: {
            label: "Estado",
            type: "string",
            default: true,
            render: {
                rentype: "statusreg",
                renval1: "activo",
                renval2: "estado"
            }
        },
        activo: { hidden: true },
        vermapa: { label: "¿Puede ver informe Power-Bi?", type: "boolean" },
        online: { label: "¿Está en línea?", type: "boolean", default: true },
        direccion: { label: "Dirección", type: "string" },
        imagennombre: { hidden: true },
        imagentipo: { hidden: true },
        imagenurl: { hidden: true }
    };

    const recuperarUsuarios = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarRoles = async () => {
        const response = await getRole();
        setRoles(response.items);
    }

    const recuperarSucursales = async () => {
        const response = await getBranch();
        setSucursales(response.items);
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getUser(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc06`)
                ]);

                setUsuarios(response.items);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
                setPermiso(permission.items[0]);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarRoles();
        recuperarSucursales();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteUser(id);
        await AddAccess('Eliminar', id, userLog, "Usuarios");
        recuperarUsuarios();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        let activo = true;
        if (formData.estado == 'Inactivo') activo = false;

        let apellido = "";
        if (formData.apellido) apellido = ", " + formData.apellido;

        const rowAGuardar = {
            ...formData,
            nomape: formData.nombre + apellido,
            activo: activo
        };

        if (rowAGuardar.id) {
            await updateUser(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Usuarios");
        } else {
            const nuevoUsuario = await saveUser(rowAGuardar);
            await AddAccess('Insertar', nuevoUsuario.saved.id, userLog, "Usuarios");
        }
        recuperarUsuarios();
        setLoading(false);
        setRowAGuardar(null);
    };

    const verificarNombreUsuarioExistente = (nombreUsuario, id) => {
        return usuarios.some(u => u.nombreusuario.toLowerCase() === nombreUsuario.toLowerCase() && u.id !== id);
    };

    const handleSubmit = (formData) => {
        if (verificarNombreUsuarioExistente(formData.nombreusuario, formData.id)) {
            setRowDuplicado(true);
            return;
        }
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleView = async (row) => {
        await AddAccess('Visualizar', row.id, userLog, "Usuarios");
        setRowAVisualizar(row);
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowDuplicado && (
                <Duplicate setDuplicado={setRowDuplicado} title={'nombre de usuario'} gen={true} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'usuario'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Usuario"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Usuario"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'USUARIOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={usuarios}
                customReg={'user'}
                userLog={userLog}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => setRowAGuardar(selected)}
                onRefresh={refrescar}
                onErpImport={() => null}
                canAdd={permiso?.puedeagregar}
                canImport={permiso?.puedeimportar}
                showErpButton={false}
                showAddButton={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                canEdit={permiso?.puedeeditar}
                canDelete={permiso?.puedeeliminar}
                canView={permiso?.puedever}
                columnSettings={columnSettings}
            />
        </>
    );
};
