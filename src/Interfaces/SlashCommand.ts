import { ChatInputApplicationCommandData, CommandInteraction, PermissionString } from "discord.js";
import Client from "../client/client";

interface Run {
    (client: Client, interaction: CommandInteraction): any;
}

export interface SlashCommand extends ChatInputApplicationCommandData{
    permissions?: PermissionString[];
    run: Run;
}