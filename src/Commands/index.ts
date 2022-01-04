import { Command } from "../interfaces";
import { help } from "./help";
import { qhelp } from "./qhelp";
import { quote } from "./quote";
import { quotestat } from "./quotestat";
import { reinitialize } from "./reinitialize";

export const commands: Command[] = [
    help,
    qhelp,
    quote,
    quotestat,
    reinitialize,
];

export { help } from "./help";
export { qhelp } from "./qhelp";
export { quote } from "./quote";
export { quotestat } from "./quotestat";
export { reinitialize } from "./reinitialize";
