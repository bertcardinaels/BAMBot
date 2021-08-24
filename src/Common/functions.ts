import { Collection, GuildChannel, Message, Role, TextBasedChannels, TextChannel, User } from "discord.js";

const userMentionPattern = /<@!\d{18}>/;
const roleMentionPattern = /<@&\d{18}>/;
const quotePattern = /(".+"|'.+'|”.+”).*[~-]/;

export const isUserMention = (text: string) => userMentionPattern.test(text);
export const isRoleMention = (text: string) => roleMentionPattern.test(text);
export const filterQuotes = (quotes: Collection<string, Message>, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, mentionedWords: string[]): Collection<string, Message> => {
    return quotes.filter(quote => {
        if (!mentionedUsers && !mentionedRoles && !mentionedWords) return true;
        return (quote.mentions.users.hasAny(...mentionedUsers.map(user => user.id)) || quote.mentions.roles.hasAny(...mentionedRoles.map(role => role.id)) || (mentionedRoles.size === 0 && mentionedUsers.size === 0))
            && (mentionedWords.some(word => quote.content.toLowerCase().includes(word.toLowerCase())) || mentionedWords.length === 0);
    });
}
export const isQuote = (message: Message): boolean => quotePattern.test(message.content);

export const isQuoteChannel = (channel: GuildChannel): boolean => {
    return channel.type === 'GUILD_TEXT' && channel.name === 'quotes';
}

export const sendHelpMessage = (channel: TextBasedChannels): Promise<Message> => {
    return channel.send({
        content: null,
        embeds: [
            {
                title: "QuoteBot information",
                description: "Gathers all quotes from #quotes channels\nQuote format: `\"text goes here\" ~`, single quotes and - accepted too.\n\n```!quote search word @Mention```  Fetches a random quote\n - Can be filtered on search words separated by spaces (OR filter)\n - Can be filtered on mentions of users or roles (OR filter)\nAliases: `!q`\n\n```!quotestats ``` Shows stats on all gathered quotes\n - Can be filtered on search words separated by spaces (OR filter)\n - Can be filtered on mentions of users or roles (OR filter)\nAliases: `!qstat`, `!qstats`, `!quotestat`",
                color: 4211787
            }
        ]
    });
}