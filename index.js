// index.js
const yargs = require("yargs");
const CachingProxyServer = require("./server");

let serverInstance = null;

const startServer = (port, origin) => {
    if (!serverInstance) {
        serverInstance = new CachingProxyServer(port, origin);
        serverInstance.start();
    } else {
        console.log(
            "Server is already running. Please stop it before starting a new one."
        );
    }
};

const clearCache = () => {
    if (serverInstance) {
        serverInstance.clearCache();
        console.log("Cache cleared successfully.");
    } else {
        console.log("No running server instance to clear cache from.");
    }
};

yargs
    .command(
        "start",
        "Start the caching proxy server",
        {
            port: {
                describe: "Port to run server on",
                demandOption: true,
                type: "number",
            },
            origin: {
                describe: "Origin server URL",
                demandOption: true,
                type: "string",
            },
        },
        (argv) => {
            const { port, origin } = argv;
            startServer(port, origin);
        }
    )
    .command("clear", "Clear the cache", {}, clearCache)
    .help().argv;
