import { getConfigPaginado } from "../services/config.service";

export const LogoBase64 = async () => {
    const response = await getConfigPaginado(0);
    const tipo = response.list[0].tipo;
    const base64 = response.list[0].base64imagen;
    const entidad = response.list[0].entidad;
    return {
        entidad: entidad,
        tipo: tipo.replace("image/","").toUpperCase(),
        imagen: `data:${tipo};base64,${base64}`
    };
};
