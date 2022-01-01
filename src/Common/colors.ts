export enum Colors {
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",

    Black = "\x1b[30m",
    Red = "\x1b[31m",
    Green = "\x1b[32m",
    Yellow = "\x1b[33m",
    Blue = "\x1b[34m",
    Magenta = "\x1b[35m",
    Cyan = "\x1b[36m",
    White = "\x1b[37m",

    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m",
}

export type ColorFn = (text: string) => string;
export const reset: ColorFn = (text: string): string => Colors.Reset + text;
export const black: ColorFn = (text: string): string => Colors.Black + text;
export const red: ColorFn = (text: string): string => Colors.Red + text;
export const green: ColorFn = (text: string): string => Colors.Green + text;
export const yellow: ColorFn = (text: string): string => Colors.Yellow + text;
export const blue: ColorFn = (text: string): string => Colors.Blue + text;
export const magenta: ColorFn = (text: string): string => Colors.Magenta + text;
export const cyan: ColorFn = (text: string): string => Colors.Cyan + text;
export const white: ColorFn = (text: string): string => Colors.White + text;

export const rainbow = [red, yellow, green, cyan, blue, magenta];
export const indexToRainbow = (index: number) => rainbow[index % rainbow.length];
export const bracketify = (text: string, color?: ColorFn): string => (color ? color(`[${text}]`) : `[${text}]`);
export const rainbowify = (text: string, index: number) => bracketify(text, indexToRainbow(index));
