import "dotenv/config";
import app from "./app.js";
import ANSI from "./shared/utils/ansi.js";

async function init() {
    const host = process.env.HOST;
    const port = process.env.PORT;

    app.listen(port, host, function () {
        console.log(
            [
                `  ${ANSI.BRIGHTYELLOW}Server running on ${ANSI.BRIGHTWHITE}[http://${host}:${port}]${ANSI.RESET}.\n`,
                `  ${ANSI.BRIGHTYELLOW}Press ${ANSI.BRIGHTWHITE}<Ctrl+C>${ANSI.RESET}${ANSI.BRIGHTYELLOW} to stop the server${ANSI.RESET}\n`,
            ].join("\n"),
        );
    });
}

if (import.meta.main) {
    await init();
}
