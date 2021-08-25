import { Collection, GuildChannel, Message, Role, TextBasedChannels, TextChannel, User } from "discord.js";

const userMentionPattern = /<@!\d{18}>/;
const roleMentionPattern = /<@&\d{18}>/;
const quotePattern = /(".+"|'.+'|”.+”).*[~-]/;
const searchPattern = /(".+"|'.+'|”.+”)/;

export const isQuote = (message: Message): boolean => quotePattern.test(message.content);
export const isUserMention = (text: string) => userMentionPattern.test(text);
export const isRoleMention = (text: string) => roleMentionPattern.test(text);

export const filterQuotes = (quotes: Collection<string, Message>, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, mentionedWords: string[]): Collection<string, Message> => {
    return quotes.filter(quote => {
        if (!mentionedUsers && !mentionedRoles && !mentionedWords) return true;
        return (quote.mentions.users.hasAny(...mentionedUsers.map(user => user.id)) || quote.mentions.roles.hasAny(...mentionedRoles.map(role => role.id)) || (mentionedRoles.size === 0 && mentionedUsers.size === 0))
            && (mentionedWords.some(word => quote.content.toLowerCase().includes(word.toLowerCase())) || mentionedWords.length === 0);
    });
}

export const getSearchSentence = (message: Message): string[] => message.content.match(searchPattern);

export const isQuoteChannel = (channel: GuildChannel): boolean =>
    channel.type === 'GUILD_TEXT' && channel.name === 'quotes';

export const sendNotInitializedReply = (message: Message): Promise<Message> =>
    message.reply('Quotes not yet initialized, please try again later');

export const sendNoQuotesReply = (message: Message): Promise<Message> =>
    message.reply('No quotes found in this server')

export const sendHelpMessage = (channel: TextBasedChannels): Promise<Message> =>
    channel.send({
        content: null,
        embeds: [
            {
                title: "QuoteBot information",
                description: "Gathers all quotes from #quotes channels\nQuote format: `\"text goes here\" ~`, single quotes `'` and `-` accepted too.\n\n```!quote ```  Fetches a random quote\nAliases: `!q`\n\n```!quotestats ``` Shows stats on all gathered quotes\nAliases: `!qstat`, `!qstats`, `!quotestat`\n\n```Filtering```Both commands can be filtered as follows:\n\n1. `!q laugh joke`: Quotes which include `laugh` or `joke` somewhere in the quote\n2. `!q \"Strict sentence\"`: Quotes which include the sentence part\n3. `!q @Mention`: Quotes which include the mentioned user or role\n\nCombining text (`1` or `2`) with mention (`3`) returns quotes which satisfy both",
                color: 4211787
            }
        ]
    });
