import { finishedReinitialization, startedReinitialization } from "../Common";
import { Command } from "../Interfaces";

export const command: Command = {
    name: 'reinitialize',
    aliases: ['reinit'],
    permissions: ['ADMINISTRATOR'],
    run: async (client, message, messageContent) => {
        client.deleteGuild(message.guild);
        await message.reply(startedReinitialization);
        await client.initializeQuotes(message.guild);
        await message.reply(finishedReinitialization);
    },
}