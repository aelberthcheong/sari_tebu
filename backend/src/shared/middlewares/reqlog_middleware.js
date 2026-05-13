import ANSI from "../utils/ansi.js";

function timestamp() {
    const [date, time] = new Intl.DateTimeFormat("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
        .format(new Date())
        .split(" ");
    return `${ANSI.DIM}${date}${ANSI.RESET} ${time}${ANSI.RESET}`;
}

function formatStatus(status) {
    if (status >= 500) return `${ANSI.RED}${status}${ANSI.RESET}`;
    if (status >= 400) return `${ANSI.YELLOW}${status}${ANSI.RESET}`;
    if (status >= 300) return `${ANSI.CYAN}${status}${ANSI.RESET}`;
    return `${ANSI.GREEN}${status}${ANSI.RESET}`;
}

// oxfmt-ignore
function formatMethod(method) {
    return `${
        {
            GET:     ANSI.BRIGHTGREEN,
            POST:    ANSI.BRIGHTYELLOW,
            PUT:     ANSI.BRIGHTBLUE,
            PATCH:   ANSI.BRIGHTMAGENTA,
            DELETE:  ANSI.BRIGHTRED,
        }[method] || ANSI.WHITE
    }${method.padEnd(6)}${ANSI.RESET}`;
}

function formatElapsedTime(time) {
    return `${ANSI.DIM}~ ${time.toFixed(2)}ms${ANSI.RESET}`;
}

function stripAnsi(str) {
    /* oxlint-disable-next-line no-control-regex */
    return str.replace(/\x1B\[[0-9;]*m/g, "");
}

export default function (options = {}) {
    const _ = options;
    return function (req, res, next) {
        const start = process.hrtime.bigint();

        // TODO: agak jelek sih implementasi ini, kalau bisa tolong diperbaiki
        res.on("finish", () => {
            const dt = Number(process.hrtime.bigint() - start) / 1e6;

            const timLine = timestamp();
            const metLine = formatMethod(req.method);
            const urlLine = req.url;
            const staLine = formatStatus(res.statusCode);
            const delLine = formatElapsedTime(dt);

            const size =
                [timLine, metLine, urlLine, staLine, delLine]
                    .map(stripAnsi)
                    .join(" ").length + 7; // +2 untuk leading spaces, +3 untuk ending spaces, +1 untuk byproduct join dots

            const dots = `${ANSI.DIM}${".".repeat(Math.max(0, process.stdout.columns - size))}${ANSI.RESET}`;

            console.log(
                `  ${[timLine, metLine, urlLine, dots, staLine, delLine].join(" ")}`,
            );
        });

        next();
    };
}
