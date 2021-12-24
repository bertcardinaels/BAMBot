import { getInteractionFilters, getQuoteStats } from "../Common";
import { SlashCommand } from "../Interfaces/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'quotestat',
    type: 'CHAT_INPUT',
    description: 'Gets statistics on quotes',
    options: [
        { type: 'STRING', name: 'words', description: 'Filter to include one of the following words' },
        { type: 'USER', name: 'user', description: 'Filter to include member' },
        { type: 'ROLE', name: 'role', description: 'Filter to include role' },
        { type: 'STRING', name: 'strict', description: 'Filter to include the following set of words' },
        { type: 'BOOLEAN', name: 'image', description: 'Filter to include image' },
    ],
    run: async (client, interaction) => {
        const { mentionedUsers, mentionedRoles, textFilter, includeImage } = getInteractionFilters(interaction);
        interaction.reply((await getQuoteStats(client, interaction.guild, mentionedUsers, mentionedRoles, textFilter, includeImage)).response);
    }
}