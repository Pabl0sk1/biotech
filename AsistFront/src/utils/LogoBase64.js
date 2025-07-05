import { getConfigPaginado } from "../services/config.service";

export const LogoBase64 = async () => {
    const response = await getConfigPaginado(0);
    const tipoImg = response.list[0].tipo;
    const baseImg = response.list[0].base64imagen;
    const entidadImg = response.list[0].entidad;
    return {
        entidad: entidadImg,
        tipo: tipoImg,
        base: baseImg,
        imagen: `data:image/${tipoImg};base64,${baseImg}`
    };
};
