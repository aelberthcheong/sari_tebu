import ANSI from "../utils/ansi.js";

// TODO(AELBERTH): Tolong update middleware ini setelah logger yang betulan sudah dibuat
//                 direncanakan logger tsb bersifat platform-agnostic
//                 dan mengirimkan `.json` atau `.db`.
//
//                 Untuk sementara, middleware ini berfungsi hanya sebagai telemetry tambahan
//                 untuk tiap request yang diterima oleh backend.

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

/**
 * Returns middleware untuk menampilkan request-request yang telah diterima dan diproses oleh backend.
 * Menerima beberapa opsi, diantara-nya:
 *   - `pretty`: Memberi warna pada baris-baris log, set ke `false`
 *               jika baris-baris log tsb ingin disimpan pada file
 *               sehingga tidak diikut sertakan kode-kode ANSI escape sequence.
 */

export default function (options = {}) {
    return function (req, res, next) {
        if (process.env.NODE_ENV === "production") {
            return;
        }

        const start = process.hrtime.bigint();

        res.on("finish", function () {
            const dt = Number(process.hrtime.bigint() - start) / 1e6;
            const lines = [];

            // oxfmt-ignore
            const [date, time] = new Intl.DateTimeFormat("sv-SE", {
                year:   "numeric",
                month:  "2-digit",
                day:    "2-digit",
                hour:   "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(new Date())
              .split(' ');

            lines.push(date);
            lines.push(time);
            lines.push(req.method.padEnd(6));
            lines.push(req.url);

            const line = lines.join(" ");
            const dots = ".".repeat(
                Math.max(0, process.stdout.columns - line.length - 25),
            );

            if (options.pretty) {
                console.log(
                    [
                        " ",
                        `${ANSI.DIM}${date}${ANSI.RESET}`,
                        `${ANSI.BRIGHTWHITE}${time}${ANSI.RESET}`,
                        formatMethod(req.method),
                        `${ANSI.BRIGHTWHITE}${req.url}${ANSI.RESET}`,
                        `${ANSI.DIM}${dots}${ANSI.RESET}`,
                        formatStatus(res.statusCode),
                        `${ANSI.DIM}~ ${dt.toFixed(2)}ms${ANSI.RESET}`,
                    ].join(" "),
                );
                return;
            }

            console.log(
                [" ", line, dots, res.statusCode, `~ ${dt.toFixed(2)}ms`].join(
                    " ",
                ),
            );
        });

        next();
    };
}
