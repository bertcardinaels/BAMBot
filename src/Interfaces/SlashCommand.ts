import { ChatInputApplicationCommandData, CommandInteraction, PermissionString } from "discord.js";
import Client from "../Client/client";

interface Run {
    (client: Client, interaction: CommandInteraction): any;
}

export interface SlashCommand extends ChatInputApplicationCommandData{
    permissions?: PermissionString[];
    run: Run;
}