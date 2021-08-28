import { getInteractionFilters, getRandomQuote } from "../Common";
import { SlashCommand } from "../Interfaces/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'quote',
    type: 'CHAT_INPUT',
    description: 'Fetches a random quote',
    options: [
        { type: 'STRING', name: 'words', description: 'Filter to include one of the following words' },
        { type: 'USER', name: 'user', description: 'Filter to include member' },
        { type: 'ROLE', name: 'role', description: 'Filter to include role' },
        { type: 'STRING', name: 'strict', description: 'Filter to include the following set of words' },
    ],
    run: async (client, interaction) => {
        const { mentionedUsers, mentionedRoles, textFilter } = getInteractionFilters(interaction);
        interaction.reply((await getRandomQuote(client, interaction.guild, mentionedUsers, mentionedRoles, textFilter)).response);
    }
}