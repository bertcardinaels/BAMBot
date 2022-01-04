import { SlashCommand } from "../interfaces";
import { fixlist } from "./fixlist";
import { fixquote } from "./fixquote";
import { quote } from "./quote";
import { quotestat } from "./quotestat";
import { reinitialize } from "./reinitialize";

export const slashCommands: SlashCommand[] = [
    fixlist,
    fixquote,
    quote,
    quotestat,
    reinitialize,
];

export { fixlist } from "./fixlist";
export { fixquote } from "./fixquote";
export { quote } from "./quote";
export { quotestat } from "./quotestat";
export { reinitialize } from "./reinitialize";
