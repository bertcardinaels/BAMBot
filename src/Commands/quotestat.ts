import { getMessageFilters, getQuoteStats } from '../Functions';
import { Command } from '../Interfaces';

export const command: Command = {
    name: 'quotestats',
    aliases: ['qstat', 'qstats', 'quotestat'],
    run: async (client, message, messageContent) => {
        const { mentionedUsers, mentionedRoles, textFilter } = getMessageFilters(message, messageContent);
        const { reply, response } = await getQuoteStats(client, message.guild, mentionedUsers, mentionedRoles, textFilter);
        if(reply) message.reply(response);
        else message.channel.send(response);
    },
}