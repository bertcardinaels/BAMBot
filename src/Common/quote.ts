import { Collection, CommandInteraction, Guild, GuildChannel, Message, MessageOptions, MessagePayload, Role, User } from "discord.js";
import { isRoleMention, isUserMention } from ".";
import ExtendedClient from "../client/client";
import { FilterFlag, States, Tasks } from "../interfaces";

const quotePattern = /(".+"|'.+'|”.+”).*[~-]/;
const strictSearchPattern = /"([^"]*)"|'([^']*)'|”([^”]*)”/g;

const notInitialized = (task: Tasks.QUOTE | Tasks.QUOTESTATS, client: ExtendedClient, author: User, guild: Guild) => {
    client.logger.quoteError(task, author, guild, 'NOT YET INITIALIZED');
    return {
        reply: true,
        response: 'Quotes not yet initialized, please try again later',
    }
};
const noQuotesGuild = (task: Tasks.QUOTE | Tasks.QUOTESTATS, client: ExtendedClient, author: User, guild: Guild) => {
    client.logger.quoteError(task, author, guild, 'NO QUOTES FOR GUILD');
    return {
        reply: true,
        response: 'No quotes found in this server',
    }
};
const noQuotesQuery = (task: Tasks.QUOTE | Tasks.QUOTESTATS, client: ExtendedClient, author: User, guild: Guild) => {
    client.logger.quoteError(task, author, guild, 'NO QUOTES FOR QUERY');
    return {
        reply: true,
        response: 'No quotes found for this query',
    }
};

export const startedReinitialization = 'Started reinitializing quotes';
export const finishedReinitialization = 'Finished reinitializing quotes';

export const isQuote = (message: Message): boolean => quotePattern.test(message.content);

export const cleanQuote = (message: Message): string => message.cleanContent.replace(/(\r\n|\n|\r)/gm, '');

export const messageImageUrl = (message: Message): string => {
    return message.attachments?.find(attachment => attachment.contentType?.startsWith('image/') || attachment.url?.endsWith('.png'))?.url
        ?? message.embeds?.find(embed => !!embed.thumbnail?.url)?.thumbnail.url;
}

export const filterQuotes = (quotes: Collection<string, Message>, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[], includeImage: boolean): Collection<string, Message> => {
    const ignoreImage = includeImage === undefined;
    return quotes.filter(quote => {
        if (!mentionedUsers && !mentionedRoles && !textFilter && ignoreImage) return true;
        return (
            quote.mentions.users.hasAny(...mentionedUsers.map(user => user.id))
            || quote.mentions.roles.hasAny(...mentionedRoles.map(role => role.id))
            || (mentionedRoles.size === 0 && mentionedUsers.size === 0))
            && (textFilter.length === 0 || textFilter.some(word => quote.content.toLowerCase().includes(word.toLowerCase())))
            && (ignoreImage || (includeImage === !!messageImageUrl(quote)));
    });
}

export const getStrictSearches = (text: string): string[] => Array.from(text.matchAll(strictSearchPattern), match => match[0]);

export const getFilterFlags = (text: string): { content: string, flags: { [key in FilterFlag]?: boolean } } => {
    const flags = {};
    Object.keys(FilterFlag).forEach(key => {
        const regex = new RegExp('(\\+|-)' + FilterFlag[key]);
        const match = text.match(regex);
        flags[FilterFlag[key]] = match ? match[0].includes('+') : undefined;
        text = text.replace(regex, '').trim();
    });
    return {
        content: text,
        flags,
    }
};

export const getMessageFilters = (message: Message, messageContent: string): { mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[], includeImage: boolean } => {
    const mentionedUsers = message.mentions.users;
    const mentionedRoles = message.mentions.roles;
    const strictSearches = getStrictSearches(messageContent);
    let { content, flags } = getFilterFlags(messageContent);
    strictSearches.forEach(sentence => content = content.replace(sentence, '').trim());
    const words = content.split(/ +/g).filter(word => word.length && !isUserMention(word) && !isRoleMention(word));
    const textFilter = words.concat(strictSearches.map(term => term.substring(1, term.length - 1)));
    const includeImage = flags[FilterFlag.IMAGE];
    return { mentionedUsers, mentionedRoles, textFilter, includeImage };
}

export const getInteractionFilters = (interaction: CommandInteraction): { mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[], includeImage: boolean } => {
    const mentionedUsers: Collection<string, User> = new Collection();
    const userOption = interaction.options.get('user');
    if (userOption?.user) mentionedUsers.set(userOption.user.id, userOption.user);
    const mentionedRoles: Collection<string, Role> = new Collection();
    const roleOption = interaction.options.get('role');
    if (roleOption?.role) mentionedRoles.set(roleOption.role.id, roleOption.role as Role);

    const includeImage = interaction.options.get('image')?.value as boolean;

    const strictSearches = interaction.options.get('sentence')?.value as string;
    const searchWords = interaction.options.get('words')?.value as string;
    const textFilter: string[] = [];
    if (strictSearches) textFilter.push(strictSearches);
    if (searchWords) textFilter.push(...searchWords.trim().split(/ +/g));
    return { mentionedUsers, mentionedRoles, textFilter, includeImage };
}

export const isQuoteChannel = (channel: GuildChannel): boolean =>
    channel.type === 'GUILD_TEXT' && channel.name === 'quotes';


export const getRandomQuote = async (client: ExtendedClient, author: User, guild: Guild, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[], includeImage?: boolean): Promise<{ reply: boolean, response: string | MessagePayload | MessageOptions }> => {
    client.logger.quoteRequest(Tasks.QUOTE, author, guild, mentionedUsers, mentionedRoles, textFilter, includeImage);
    if (!client.quotesInitialized) return notInitialized(Tasks.QUOTE, client, author, guild);
    const guildQuotes = client.quotes[guild.id];
    if (!guildQuotes) return noQuotesGuild(Tasks.QUOTE, client, author, guild);

    const quotes = filterQuotes(guildQuotes, mentionedUsers, mentionedRoles, textFilter, includeImage);
    const quote = quotes.random();

    if (!quote) return noQuotesQuery(Tasks.QUOTE, client, author, guild);
    else client.logger.quoteState(States.DISPLAY, author, guild, quote);

    const creator = await quote.guild.members.fetch({ user: quote.author });
    return {
        reply: false,
        response: {
            content: null,
            embeds: [
                {
                    description: `${quote.content} \n\n[Link to message](${quote.url})`,
                    image: { url: messageImageUrl(quote) },
                    color: 4211787,
                    footer: {
                        text: `Written by ${creator?.displayName ?? quote.author.username}  •  ${quote.createdAt.getDate()}/${quote.createdAt.getMonth() + 1}/${quote.createdAt.getFullYear()}`
                    }
                }
            ]
        }
    };
}

export const getQuoteStats = async (client: ExtendedClient, author: User, guild: Guild, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[], includeImage?: boolean): Promise<{ reply: boolean, response: string | MessagePayload | MessageOptions }> => {
    client.logger.quoteRequest(Tasks.QUOTESTATS, author, guild, mentionedUsers, mentionedRoles, textFilter, includeImage);
    if (!client.quotesInitialized) return notInitialized(Tasks.QUOTESTATS, client, author, guild);

    const guildQuotes = client.quotes[guild.id];
    if (!guildQuotes) return noQuotesGuild(Tasks.QUOTESTATS, client, author, guild);

    const quotes = filterQuotes(guildQuotes, mentionedUsers, mentionedRoles, textFilter, includeImage);

    if (quotes.size < 1) return noQuotesQuery(Tasks.QUOTESTATS, client, author, guild);

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
    client.logger.quoteStatsSuccess(author, guild, quotes);
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