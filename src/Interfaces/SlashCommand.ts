import Client from "../Client/client";
import { ChatInputApplicationCommandData,  CommandInteraction, PermissionString } from "discord.js";

interface Run {
    (client: Client, interaction: CommandInteraction): any;
}

export interface SlashCommand extends ChatInputApplicationCommandData{
    permissions?: PermissionString[];
    run: Run;
}