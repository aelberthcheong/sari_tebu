// Untuk mempelajari lebih lanjut mengenai ANSI Escape Sequence
// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

// oxfmt-ignore
export default {
    RESET:   `${"\x1B"}[0m`,
    BOLD:    `${"\x1B"}[1m`,
    DIM:     `${"\x1B"}[2m`,
    RED:     `${"\x1B"}[31m`,
    GREEN:   `${"\x1B"}[32m`,
    YELLOW:  `${"\x1B"}[33m`,
    BLUE:    `${"\x1B"}[34m`,
    MAGENTA: `${"\x1B"}[35m`,
    CYAN:    `${"\x1B"}[36m`,
    WHITE:   `${"\x1B"}[37m`,

    BRIGHTRED:     `${"\x1B"}[91m`,
    BRIGHTGREEN:   `${"\x1B"}[92m`,
    BRIGHTYELLOW:  `${"\x1B"}[93m`,
    BRIGHTBLUE:    `${"\x1B"}[94m`,
    BRIGHTMAGENTA: `${"\x1B"}[95m`,
    BRIGHTCYAN:    `${"\x1B"}[96m`,
    BRIGHTWHITE:   `${"\x1B"}[97m`,
};
