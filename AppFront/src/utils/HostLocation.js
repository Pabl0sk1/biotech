
export const HostLocation = () => {

    let init = "";
    let port = "";
    let hostname = window.location.hostname;

    if (hostname == "localhost") {
        init = "http"
        port = ":8082"
    } else init = "https";

    return `${init}://${hostname}${port}/api`;

}