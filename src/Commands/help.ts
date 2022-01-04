import { sendHelpMessage } from "../common";
import { Command } from "../interfaces";

export const help: Command = {
    name: 'help',
    aliases: ['h'],
    run: async (client, message, messageContent) => {
        const args = messageContent.split(/ +/g);        
        if (args.length === 0) return;
        const requestedCommand = args[0].toLowerCase();
        if (client.commands.get(requestedCommand) || client.aliases.get(requestedCommand)) sendHelpMessage(message.channel);
    },
}