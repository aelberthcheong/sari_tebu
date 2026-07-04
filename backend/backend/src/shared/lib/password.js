import crypto from "node:crypto";

export async function verifyUserPasswordStrength(password) {
    const passwordHash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    const hashPrefix = passwordHash.slice(0, 5);
    const url = `https://api.pwnedpasswords.com/range/${hashPrefix}`;

    // NOTE: Ini adalah panggilan ke API eksternal (HaveIBeenPwned). Kalau API ini
    // down, timeout, atau server tidak punya akses internet keluar (mis. di
    // beberapa environment hosting), fetch() bisa throw. Sebelumnya error ini
    // tidak ditangkap sama sekali sehingga bocor ke error handler generik dan
    // muncul sebagai "Internal Server Error" (500) ke user saat mendaftar.
    //
    // Supaya proses registrasi tidak gagal total hanya karena API pihak ketiga
    // bermasalah, kita fail-open (anggap password "aman") dan catat error-nya
    // di log server untuk keperluan debugging.
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        let res;
        try {
            res = await fetch(url, { signal: controller.signal });
        } finally {
            clearTimeout(timeout);
        }

        if (!res.ok) {
            throw new Error(`Received status code ${res.status}`);
        }

        const lines = await res.text();
        for (const line of lines.split("\n")) {
            const hashSuffix = line.slice(0, 35).toLowerCase();
            if (passwordHash === hashPrefix + hashSuffix) {
                return false;
            }
        }

        return true;
    } catch (err) {
        console.error(
            "[verifyUserPasswordStrength] Gagal menghubungi pwnedpasswords API, melewati pengecekan:",
            err.message,
        );
        return true;
    }
}

export function verifyUserPasswordPattern(password) {
    if (password.length < 10 || password.length > 100) {
        return false;
    }

    for (const char of password) {
        const code = char.charCodeAt(0);
        if (code < 0x20 || code > 0x7e) {
            return false;
        }
    }

    if (password[0] === " " || password[password.length - 1] === " ") {
        return false;
    }

    return true;
}