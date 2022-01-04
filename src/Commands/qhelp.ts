import { sendHelpMessage } from "../common";
import { Command } from "../interfaces";

export const qhelp: Command = {
    name: 'quotehelp',
    aliases: ['qhelp'],
    run: async (client, message, messageContent) => {
        sendHelpMessage(message.channel);
    },
}