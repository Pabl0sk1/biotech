
export const HostLocation = (op = 0) => {

    let init = "";
    let port = "";
    let hostname = window.location.hostname;

    if (hostname == "localhost") {
        init = "http"
        port = ":8082"
    } else init = "https";

    if (op == 1) return `${init}://${hostname}${port}/biotech`;
    else return `${init}://${hostname}${port}/api`;

}