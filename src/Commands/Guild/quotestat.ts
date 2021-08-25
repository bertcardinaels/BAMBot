import { Role, User } from 'discord.js';
import { filterQuotes, getSearchSentence, isRoleMention, isUserMention, sendNoQuotesReply, sendNotInitializedReply } from '../../Common';
import { Command } from '../../Interfaces';

export const command: Command = {
    name: 'quotestats',
    aliases: ['qstat', 'qstats', 'quotestat'],
    run: async (client, message, args) => {
        if (!client.quotes) {
            sendNotInitializedReply(message);
            return;
        }
        const guildQuotes = client.quotes[message.guildId];

        if (!guildQuotes) {
            sendNoQuotesReply(message);
            return;
        }

        const mentionedUsers = message.mentions.users;
        const mentionedRoles = message.mentions.roles;
        const searchTerms = getSearchSentence(message);
        const mentionedWords = searchTerms ? [searchTerms[0].substring(1, searchTerms[0].length - 1)] : args.filter(word => !isUserMention(word) && !isRoleMention(word));
        const quotes = filterQuotes(guildQuotes, mentionedUsers, mentionedRoles, mentionedWords);

        if (quotes.size < 1) {
            message.reply('No quotes found for this query');
            return;
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
        const wordsCount = mentionedWords.map(word => ({ word, count: 0 }));

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
            if (mentionedWords.length) filter.push(`Quotes which include ${mentionedWords.map(word => `\`${word}\``).join(`, `)}`);
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
        message.channel.send({
            content: null,
            embeds: [
                {
                    description: filterApplied ? `**Filter applied** \n${filterApplied}` : null,
                    color: 4211787,
                    fields: messageFields,
                }
            ]
        });
    },
}