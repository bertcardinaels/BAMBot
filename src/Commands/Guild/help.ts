import { sendHelpMessage } from "../../Common";
import { Command } from "../../Interfaces";


const availableHelps: string[] = ['quote'];
export const command: Command = {
    name: 'help',
    aliases: ['h'],
    run: async (client, message, args) => {
        if (args.length === 0) return;
        const commandRequested = args[0].toLowerCase();
        if (['q', 'quote', 'quotestat', 'qstat', 'qstats', 'quotestats'].includes(commandRequested)) sendHelpMessage(message.channel);
    },
}