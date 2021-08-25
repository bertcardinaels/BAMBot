import { filterQuotes, getSearchSentence, isRoleMention, isUserMention, sendNoQuotesReply, sendNotInitializedReply } from "../../Common";
import { Command } from "../../Interfaces";

export const command: Command = {
    name: 'quote',
    aliases: ['q'],
    run: async (client, message, args) => {
        if (!client.quotesInitialized) {
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
        const quote = quotes.random();

        if (!quote) {
            message.reply('No quote found');
            return;
        }

        const creator = await quote.guild.members.fetch({ user: quote.author });
        message.channel.send({
            "content": null,
            "embeds": [
                {
                    "description": `${quote.content} \n\n[Link to message](${quote.url})`,
                    "color": 4211787,
                    "footer": {
                        "text": `Written by ${creator?.displayName ?? quote.author.username}  •  ${quote.createdAt.getDate()}/${quote.createdAt.getMonth() + 1}/${quote.createdAt.getFullYear()}`
                    }
                }
            ]
        });
    },
}