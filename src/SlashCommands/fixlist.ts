import { Message } from "discord.js";
import got from "got/dist/source";
import { listMessage, mapNumberToEmoji, ToFix } from "../Common";
import { config } from "../Config/config";
import { SlashCommand } from "../Interfaces/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'fixlist',
    type: 'CHAT_INPUT',
    description: 'Lists all quotes to be fixed by author',
    options: [
        { type: 'USER', name: 'user', description: '(Optional) author to list fixes of' },
    ],
    run: async (client, interaction) => {
        try {
            const userOption = interaction.options.get('user');
            const author = userOption?.user ?? interaction.user;

            const allFixes: ToFix[] = await got.get(`${config.apiLocation}/fix/${interaction.guildId}/${author.id}`).json();

            let toFixList: ToFix[] = allFixes.slice(0, 9).map((toFix, index) => ({ ...toFix, emoji: mapNumberToEmoji(index) }));
            const toFixAmount = toFixList.length;

            if (!allFixes.length) return await interaction.reply(`No quotes to be fixed by you`);

            const replyMessage = await interaction.reply({ fetchReply: true, ...listMessage(author, allFixes, toFixList, toFixAmount) }) as Message;

            const botReactions = await Promise.all(toFixList.map((_, index) => replyMessage.react(mapNumberToEmoji(index))));
            const reactionCollector = replyMessage.createReactionCollector({ time: 1000 * 60 * 60 });

            reactionCollector.on('collect', async (reaction, user) => {
                const fixToDelete = toFixList.find(toFix => toFix.emoji === reaction.emoji.name);

                if (user.id === client.user.id) return;
                if (user.id !== author.id || !fixToDelete) {
                    return await reaction.remove(); //TODO check why different user makes bot reaction go away
                };

                await got.delete(`${config.apiLocation}/fix/${fixToDelete.message.id}`);
                toFixList = toFixList.filter(embed => embed.emoji !== reaction.emoji.name);
                await replyMessage.edit(listMessage(author, allFixes, toFixList, toFixAmount));
                if (toFixList.length) {
                    await reaction.remove();
                    await botReactions.find(react => react.emoji.name === reaction.emoji.name)?.remove();
                } else {
                    await replyMessage.reactions.removeAll();
                }
            });

            reactionCollector.on('end', async () => {
                try {
                    await replyMessage.edit(listMessage(author, allFixes, toFixList, toFixAmount, true));
                    await replyMessage.reactions.removeAll();
                }
                catch (error) {
                    console.error('Error occured during /fixlist reactionCollectorEnd');
                    console.log(error);
                }
            });
        }
        catch (error) {
            console.error('Error occured during /fixlist');
            console.log(error);
        }
    }
}

