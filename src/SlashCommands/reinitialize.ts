import { finishedReinitialization, startedReinitialization } from "../common";
import { SlashCommand, States } from "../interfaces";

export const reinitialize: SlashCommand = {
    name: 'reinitialize',
    type: 'CHAT_INPUT',
    description: 'Reinitializes the quotes for the server',
    permissions: ['ADMINISTRATOR'],
    run: async (client, interaction) => {
        client.logger.reinitialize(interaction.guild, interaction.user, States.REQUEST);
        client.deleteGuild(interaction.guild);
        await interaction.reply(startedReinitialization);
        const reply = interaction.channel.lastMessage.content === startedReinitialization && interaction.channel.lastMessage;
        await client.initializeQuotes(interaction.guild);
        client.logger.reinitialize(interaction.guild, interaction.user, States.SUCCESS);
        if (reply) reply.edit(finishedReinitialization);
        else interaction.channel.send(finishedReinitialization);
    }
}