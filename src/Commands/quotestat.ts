import { getMessageFilters, getQuoteStats } from '../common';
import { Command } from '../interfaces';

export const quotestat: Command = {
    name: 'quotestats',
    aliases: ['qstat', 'qstats', 'quotestat'],
    run: async (client, message, messageContent) => {
        const { mentionedUsers, mentionedRoles, textFilter, includeImage } = getMessageFilters(message, messageContent);
        const { reply, response } = await getQuoteStats(client, message.author, message.guild, mentionedUsers, mentionedRoles, textFilter, includeImage);
        if (reply) message.reply(response);
        else message.channel.send(response);
    },
}