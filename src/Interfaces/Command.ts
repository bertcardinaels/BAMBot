import { Message, PermissionString } from "discord.js";
import Client from "../Client/client";

interface Run {
    (client: Client, message: Message, messageContent: string): any;
}

export interface Command {
    name: string;
    description?: string;
    aliases?: string[];
    permissions?: PermissionString[];
    run: Run;
}