import { finishedReinitialization, startedReinitialization } from "../common";
import { Command } from "../interfaces";

export const reinitialize: Command = {
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