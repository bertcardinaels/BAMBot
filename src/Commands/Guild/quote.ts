import { filterQuotes, isRoleMention, isUserMention } from "../../Common";
import { Command } from "../../Interfaces";

export const command: Command = {
    name: 'quote',
    aliases: ['q'],
    run: async (client, message, args) => {
        if (!client.quotesInitialized) {
            message.reply('Quotes not yet initialized, please try again later');
            return;
        }
        const guildQuotes = client.quotes[message.guildId];
        if (!guildQuotes) {
            message.reply('No quotes found in this server');
            return;
        }

        const mentionedUsers = message.mentions.users;
        const mentionedRoles = message.mentions.roles;
        const mentionedWords = args.filter(word => !isUserMention(word) && !isRoleMention(word));
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