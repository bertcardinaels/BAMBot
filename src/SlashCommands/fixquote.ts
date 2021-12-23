import got from "got/dist/source";
import { isQuoteChannel, parseMessageUrl, ToFix } from "../Common";
import { config } from "../Config/config";
import { SlashCommand } from "../Interfaces/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'fixquote',
    type: 'CHAT_INPUT',
    description: 'Flags a message to be fixed by author',
    options: [
        { type: 'STRING', name: 'message_link', description: 'Link to quote to be fixed', required: true },
    ],
    run: async (client, interaction) => {
        try {
            const messageLink = interaction.options.get('message_link').value as string;
            const { guildId, messageId, channelId } = parseMessageUrl(messageLink);

            if (!guildId || !channelId || !messageId || guildId !== interaction.guildId) return await interaction.reply('Invalid message URL');

            const channel = client.quoteChannels.get(channelId);
            if (!channel || !isQuoteChannel(channel)) return await interaction.reply('Invalid channel linked');

            const message = await channel.messages.fetch(messageId);
            if (!message) return await interaction.reply('Invalid message linked');

            const payload: ToFix = { message, flaggedBy: interaction.user, author: message.author };
            const isNewFix = await got.post(`${config.apiLocation}/fix`, { json: payload }).json();
            interaction.reply(`${isNewFix ? 'Added' : 'Updated'} quote ${isNewFix ? 'to' : 'in'} list`);
        }
        catch (error) {
            console.error('Error occured during /fixquote');
            console.log(error);
        }
    }
}