import { getMessageFilters, getRandomQuote } from "../Common";
import { Command } from "../Interfaces";

export const command: Command = {
    name: 'quote',
    aliases: ['q'],
    run: async (client, message, messageContent) => {
        const { mentionedUsers, mentionedRoles, textFilter, includeImage } = getMessageFilters(message, messageContent);
        const { reply, response } = await getRandomQuote(client, message.author, message.guild, mentionedUsers, mentionedRoles, textFilter, includeImage);
        if (reply) message.reply(response);
        else message.channel.send(response);
    },
}