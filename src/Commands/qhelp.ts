import { sendHelpMessage } from "../Functions";
import { Command } from "../Interfaces";

export const command: Command = {
    name: 'quotehelp',
    aliases: ['qhelp'],
    run: async (client, message, messageContent) => {
        sendHelpMessage(message.channel);
    },
}