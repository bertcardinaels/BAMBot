import { Message } from "discord.js";
import { listMessage, mapNumberToEmoji, ToFix } from "../Common";
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
            const target = userOption?.user ?? interaction.user;

            client.logger.fixlistRequest(interaction.guild, interaction.user, target);
            const allFixes: ToFix[] = await client.apiService.getFixes(interaction.guildId, target.id);

            let toFixList: ToFix[] = allFixes.slice(0, 9).map((toFix, index) => ({ ...toFix, emoji: mapNumberToEmoji(index) }));
            const toFixAmount = toFixList.length;

            client.logger.fixlistSuccess(interaction.guild, interaction.user, target, toFixAmount);

            if (!allFixes.length) return await interaction.reply(`No quotes to be fixed by you`);

            const replyMessage = await interaction.reply({ fetchReply: true, ...listMessage(target, allFixes, toFixList, toFixAmount) }) as Message;

            const botReactions = await Promise.all(toFixList.map((_, index) => replyMessage.react(mapNumberToEmoji(index))));
            const reactionCollector = replyMessage.createReactionCollector({ time: 1000 * 60 * 60 });

            reactionCollector.on('collect', async (reaction, user) => {
                const fixToDelete = toFixList.find(toFix => toFix.emoji === reaction.emoji.name);

                if (user.id === client.user.id) return;
                if (user.id !== target.id || !fixToDelete) {
                    return await reaction.remove();
                };

                await client.apiService.deleteFix(fixToDelete.message.id);
                client.logger.fixQuoteSuccess(interaction.guild, interaction.user, fixToDelete);
                toFixList = toFixList.filter(embed => embed.emoji !== reaction.emoji.name);
                await replyMessage.edit(listMessage(target, allFixes, toFixList, toFixAmount));
                if (toFixList.length) {
                    await reaction.remove();
                    await botReactions.find(react => react.emoji.name === reaction.emoji.name)?.remove();
                } else {
                    await replyMessage.reactions.removeAll();
                }
            });

            reactionCollector.on('end', async () => {
                try {
                    await replyMessage.edit(listMessage(target, allFixes, toFixList, toFixAmount, true));
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

