import { getConfigPaginado } from "../services/config.service";

export const LogoBase64 = async () => {
    const response = await getConfigPaginado(0);

    const tipoImg = response.configuraciones[0].tipo;
    const baseImg = response.configuraciones[0].base64imagen;
    const entidadImg = response.configuraciones[0].entidad;
    return {
        entidad: entidadImg,
        tipo: tipoImg,
        base: baseImg,
        imagen: `data:image/${tipoImg};base64,${baseImg}`
    };
};
