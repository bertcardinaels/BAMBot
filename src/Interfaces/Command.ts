import Client from "../Client/client";
import { Message, PermissionString } from "discord.js";

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