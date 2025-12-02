import { getConfig } from "../services/config.service";

export const LogoImg = async () => {
    const response = await getConfig();
    const result = response.items[0];

    return {
        entidad: result.entidad,
        tipo: result.tipo.split('/')[1],
        imagen: result.imagenurl
    };
};
