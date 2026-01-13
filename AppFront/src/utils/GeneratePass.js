
export const GeneratePass = () => {
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiales = '!@#$%&*';

    const todos = mayusculas + minusculas + numeros + especiales;

    let contrasena = '';

    // Asegurar al menos un carácter de cada tipo
    contrasena += mayusculas[Math.floor(Math.random() * mayusculas.length)];
    contrasena += minusculas[Math.floor(Math.random() * minusculas.length)];
    contrasena += numeros[Math.floor(Math.random() * numeros.length)];
    contrasena += especiales[Math.floor(Math.random() * especiales.length)];

    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
        contrasena += todos[Math.floor(Math.random() * todos.length)];
    }

    // Mezclar la contraseña
    contrasena = contrasena.split('').sort(() => Math.random() - 0.5).join('');

    return contrasena;
};
