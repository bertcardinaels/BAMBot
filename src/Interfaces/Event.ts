import { ClientEvents } from "discord.js";
import Client from "../client/client";

interface Run {
    (client: Client, ...args: any[]): any
}

export interface Event {
    name: keyof ClientEvents,
    run: Run,
}