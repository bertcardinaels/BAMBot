import { ClientEvents } from "discord.js";
import Client from "../Client/client";

interface Run {
    (client: Client, ...args: any[]): any
}

export interface Event {
    name: keyof ClientEvents,
    run: Run,
}