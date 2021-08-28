import { finishedReinitialization, startedReinitialization } from "../Common";
import { SlashCommand } from "../Interfaces/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'reinitialize',
    type: 'CHAT_INPUT',
    description: 'Reinitializes the quotes for the server',
    permissions: ['ADMINISTRATOR'],
    run: async (client, interaction) => {
        client.deleteGuild(interaction.guild);
        await interaction.reply(startedReinitialization);
        const reply = interaction.channel.lastMessage.content === startedReinitialization && interaction.channel.lastMessage;
        await client.initializeQuotes(interaction.guild);
        if (reply) reply.edit(finishedReinitialization);
        else interaction.channel.send(finishedReinitialization);
    }
}