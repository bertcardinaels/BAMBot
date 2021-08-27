import Client from "../Client/client";
import { Message } from "discord.js";

interface Run {
    (client: Client, message: Message, messageContent: string): any;
}

export interface Command {
    name: string;
    description?: string;
    aliases?: string[];
    run: Run;
}