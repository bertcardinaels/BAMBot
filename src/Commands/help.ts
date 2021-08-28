import { sendHelpMessage } from "../Common";
import { Command } from "../Interfaces";

export const command: Command = {
    name: 'help',
    aliases: ['h'],
    run: async (client, message, messageContent) => {
        const args = messageContent.split(/ +/g);        
        if (args.length === 0) return;
        const requestedCommand = args[0].toLowerCase();
        if (client.commands.get(requestedCommand) || client.aliases.get(requestedCommand)) sendHelpMessage(message.channel);
    },
}