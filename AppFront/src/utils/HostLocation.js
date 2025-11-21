
export const HostLocation = () => {

    let init = "";
    let port = "";
    if (window.location.hostname == "localhost") {
        init = "http"
        port = ":8082"
    } else init = "https";

    return `${init}://${window.location.hostname}${port}/api`;

}