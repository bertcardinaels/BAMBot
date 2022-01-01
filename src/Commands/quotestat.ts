import { getMessageFilters, getQuoteStats } from '../Common';
import { Command } from '../Interfaces';

export const command: Command = {
    name: 'quotestats',
    aliases: ['qstat', 'qstats', 'quotestat'],
    run: async (client, message, messageContent) => {
        const { mentionedUsers, mentionedRoles, textFilter, includeImage } = getMessageFilters(message, messageContent);
        const { reply, response } = await getQuoteStats(client, message.author, message.guild, mentionedUsers, mentionedRoles, textFilter, includeImage);
        if (reply) message.reply(response);
        else message.channel.send(response);
    },
}