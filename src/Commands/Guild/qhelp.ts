import { TextChannel } from "discord.js";
import { sendHelpMessage } from "../../Common";
import { Command } from "../../Interfaces";

export const command: Command = {
    name: 'quotehelp',
    aliases: ['qhelp'],
    run: async (client, message, args) => {
        sendHelpMessage(message.channel);
    },
}