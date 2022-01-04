import { Event } from "../interfaces";
import { messageCreate } from "./messageCreate";
import { messageDelete } from "./messageDelete";
import { messageUpdate } from "./messageUpdate";
import { ready } from "./ready";

export const events: Event[] = [
    messageCreate,
    messageDelete,
    messageUpdate,
    ready,
];

export { messageCreate } from "./messageCreate";
export { messageDelete } from "./messageDelete";
export { messageUpdate } from "./messageUpdate";
export { ready } from "./ready";
