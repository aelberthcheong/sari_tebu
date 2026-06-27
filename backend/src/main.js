import "dotenv/config";
import app from "./app.js";

async function init() {
    const host = process.env.HOST;
    const port = process.env.PORT;

    app.listen(port, host, function () {
        console.log(
            [
                `  \x1b[93mServer running on \x1b[97m[http://${host}:${port}]\x1b[0m.`,
                `  \x1b[93mPress \x1b[97m<Ctrl+C>\x1b[0m\x1b[93m to stop the server\x1b[0m`,
                ``,
            ].join("\n"),
        );
    });
}

if (import.meta.main) {
    await init();
}
