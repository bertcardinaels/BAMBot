import Client from "../Client/client";
import { ChatInputApplicationCommandData,  CommandInteraction } from "discord.js";

interface Run {
    (client: Client, interaction: CommandInteraction): any;
}

export interface SlashCommand extends ChatInputApplicationCommandData{
    run: Run;
}