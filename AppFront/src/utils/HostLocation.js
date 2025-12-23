
export const HostLocation = (op = 0) => {

    let protocol = window.location.protocol;
    let hostname = window.location.hostname;
    let port = hostname === 'localhost' ? ':8082' : '/biotech';

    if (op === 1) return `${protocol}//${hostname}${port}`;
    else return `${protocol}//${hostname}${port}/api`;
}