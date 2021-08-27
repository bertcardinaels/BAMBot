import { Collection, Guild, GuildChannel, Message, MessagePayload, MessageOptions, Role, TextBasedChannels, User, CommandInteraction } from "discord.js";
import ExtendedClient from "../Client/client";

const userMentionPattern = /<@!\d{18}>/;
const roleMentionPattern = /<@&\d{18}>/;
const quotePattern = /(".+"|'.+'|”.+”).*[~-]/;
const strictSearchPattern = /"([^"]*)"|'([^']*)'|”([^”]*)”/g;

export const isQuote = (message: Message): boolean => quotePattern.test(message.content);
export const isUserMention = (text: string) => userMentionPattern.test(text);
export const isRoleMention = (text: string) => roleMentionPattern.test(text);

export const filterQuotes = (quotes: Collection<string, Message>, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[]): Collection<string, Message> => {
    return quotes.filter(quote => {
        if (!mentionedUsers && !mentionedRoles && !textFilter) return true;
        return (quote.mentions.users.hasAny(...mentionedUsers.map(user => user.id)) || quote.mentions.roles.hasAny(...mentionedRoles.map(role => role.id)) || (mentionedRoles.size === 0 && mentionedUsers.size === 0))
            && (textFilter.length === 0 || textFilter.some(word => quote.content.toLowerCase().includes(word.toLowerCase())));
    });
}

export const getStrictSearches = (text: string): string[] => Array.from(text.matchAll(strictSearchPattern), match => match[0]);

export const getMessageFilters = (message: Message, messageContent: string): { mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[] } => {
    const mentionedUsers = message.mentions.users;
    const mentionedRoles = message.mentions.roles;
    const strictSearches = getStrictSearches(messageContent);
    let content = messageContent;
    strictSearches.forEach(sentence => content = content.replace(sentence, '').trim());
    const words = content.split(/ +/g).filter(word => !isUserMention(word) && !isRoleMention(word));
    const textFilter = words.concat(strictSearches.map(term => term.substring(1, term.length - 1)));
    return { mentionedUsers, mentionedRoles, textFilter };
}

export const getInteractionFilters = (interaction: CommandInteraction): { mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[] } => {
    const mentionedUsers: Collection<string, User> = new Collection();
    const userOption = interaction.options.get('user');
    if (userOption?.user) mentionedUsers.set(userOption.user.id, userOption.user);
    const mentionedRoles: Collection<string, Role> = new Collection();
    const roleOption = interaction.options.get('role');
    if (roleOption?.role) mentionedRoles.set(roleOption.role.id, roleOption.role as Role);

    const strictSearches = interaction.options.get('sentence')?.value as string;
    const searchWords = interaction.options.get('words')?.value as string;
    const textFilter: string[] = [];
    if (strictSearches) textFilter.push(strictSearches);
    if (searchWords) textFilter.push(...searchWords.trim().split(/ +/g));
    return { mentionedUsers, mentionedRoles, textFilter };
}

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
                description: "Gathers all quotes from #quotes channels\nQuote format: `\"text goes here\" ~ @Quotee`, single quotes `'` and `-` accepted too.\n\n**Commands**\n```!quote ```  Fetches a random quote\nAliases: `!q`\nSlash command: `/quote`\n\n```!quotestats ``` Shows stats on all gathered quotes\nAliases: `!qstat`, `!qstats`, `!quotestat`\nSlash command: `/quotestats`\n\n**Filtering**\nBoth commands can be filtered as follows:\n1. `!q laugh joke`: Quotes which include `laugh` or `joke` somewhere in the quote\n2. `!q \"set of words\"` Quotes which include the set of words, single `'` works\n3. `!q @Mention`: Quotes which include the mentioned user or role\n\nCombining text filters (`1` or `2`) with mention filters (`3`) returns quotes which satisfy both kinds of filters.",
                color: 4211787
            }
        ]
    });

export const getRandomQuote = async (client: ExtendedClient, guild: Guild, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[]): Promise<{ reply: boolean, response: string | MessagePayload | MessageOptions }> => {
    if (!client.quotesInitialized) {
        return {
            reply: true,
            response: 'Quotes not yet initialized, please try again later',
        };
    }
    const guildQuotes = client.quotes[guild.id];
    if (!guildQuotes) {
        return {
            reply: true,
            response: 'No quotes found in this server',
        };
    }

    const quotes = filterQuotes(guildQuotes, mentionedUsers, mentionedRoles, textFilter);
    const quote = quotes.random();

    if (!quote) {
        return {
            reply: true,
            response: 'No quote found found for this query',
        };
    }

    const creator = await quote.guild.members.fetch({ user: quote.author });
    return {
        reply: false,
        response: {
            content: null,
            embeds: [
                {
                    description: `${quote.content} \n\n[Link to message](${quote.url})`,
                    color: 4211787,
                    footer: {
                        text: `Written by ${creator?.displayName ?? quote.author.username}  •  ${quote.createdAt.getDate()}/${quote.createdAt.getMonth() + 1}/${quote.createdAt.getFullYear()}`
                    }
                }
            ]
        }
    };
}

export const getQuoteStats = async (client: ExtendedClient, guild: Guild, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[]): Promise<{ reply: boolean, response: string | MessagePayload | MessageOptions }> => {
    if (!client.quotesInitialized) {
        return {
            reply: true,
            response: 'Quotes not yet initialized, please try again later',
        };
    }
    const guildQuotes = client.quotes[guild.id];
    if (!guildQuotes) {
        return {
            reply: true,
            response: 'No quotes found in this server',
        };
    }

    const quotes = filterQuotes(guildQuotes, mentionedUsers, mentionedRoles, textFilter);

    if (quotes.size < 1) {
        return {
            reply: true,
            response: 'No quotes found for this query',
        };
    }

    const mentions: {
        [id: string]: {
            mentioned: User | Role,
            count: number,
        }
    } = {};
    const authors: {
        [id: string]: {
            author: User,
            count: number,
        }
    } = {};
    const wordsCount = textFilter.map(word => ({ word, count: 0 }));

    quotes.forEach(quote => {
        quote.mentions.users.forEach(user => {
            if (mentions[user.id]) {
                mentions[user.id].count++
            } else {
                mentions[user.id] = {
                    mentioned: user,
                    count: 1,
                }
            }
        });
        quote.mentions.roles.forEach(role => {
            if (mentions[role.id]) {
                mentions[role.id].count++
            } else {
                mentions[role.id] = {
                    mentioned: role,
                    count: 1,
                }
            }
        });
        const author = quote.author;
        if (authors[author.id]) {
            authors[author.id].count++
        } else {
            authors[author.id] = {
                author,
                count: 1,
            }
        }
        wordsCount.forEach(word => {
            if (quote.content.includes(word.word)) word.count++;
        });
    });

    const mostMentioned = Object.values(mentions).sort((a, b) => b.count - a.count).slice(0, 10).map(mentionObject => `${mentionObject.mentioned.toString()} (${mentionObject.count})`).join(`\n`);
    const mostAuthored = Object.values(authors).sort((a, b) => b.count - a.count).slice(0, 10).map(mentionObject => `${mentionObject.author.toString()} (${mentionObject.count})`).join(`\n`);
    const filterApplied = ((): string => {
        const filter = [];
        if (textFilter.length) filter.push(`Quotes which include ${textFilter.map(word => `\`${word}\``).join(`, `)}`);
        if (mentionedUsers.size || mentionedRoles.size) {
            if (filter.length) filter.push(`**and**`);
            filter.push(`${filter.length ? '' : 'Quotes'} which include ${[...mentionedUsers.map(user => user.toString()), ...mentionedRoles.map(role => role.toString())].join(`, `)}`);
        }
        if (filter.length) return filter.join(`\n`);
        else return null;
    })();

    const messageFields: {
        name: string,
        value: string,
    }[] = [];
    messageFields.push({
        name: 'Amount of quotes',
        value: quotes.size.toString()
    });
    messageFields.push({
        name: 'Most mentioned in quotes',
        value: mostMentioned.length ? mostMentioned : 'Nobody'
    });
    messageFields.push({
        name: 'Most quotes typed by',
        value: mostAuthored
    });
    if (wordsCount.length > 1) {
        messageFields.push({
            name: 'Quotes with word',
            value: wordsCount.map(word => `\`${word.word}\` (${word.count})`).join('\n'),
        });
    }
    return {
        reply: false,
        response: {
            content: null,
            embeds: [
                {
                    description: filterApplied ? `**Filter applied** \n${filterApplied}` : null,
                    color: 4211787,
                    fields: messageFields,
                }
            ]
        }
    };
}