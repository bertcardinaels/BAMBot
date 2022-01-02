import { Message, MessageEmbedOptions, MessageOptions, User } from "discord.js";
import { createMessageUrl } from ".";

export interface ToFix {
    author: User,
    message: Message,
    flaggedBy: User,
    emoji?: string,
}

export const fixes = [];

export const listMessage = (author: User, allFixes: any[], toFixList: any[], toFix: number, ended?: boolean): MessageOptions => {
    return {
        content: toFixList.length ? '>>> **HOW TO**\nClick the "Link to message"\nFix the quote\nCome back to this message\nReact with the emoji to mark it as fixed\nReact with ❌ to stop' : null,
        embeds: [listEmbed(author, allFixes, toFixList, toFix, ended), ...(ended ? [] : toFixList.map(toFix => fixToEmbed(toFix)))],
    }
}

const listEmbed = (author: User, allFixes: any[], toFixList: any[], toFix: number, ended?: boolean): MessageEmbedOptions => {
    let description: string[] = [];
    if (toFixList.length) {
        description.push(`Listing${allFixes.length > 9 ? ` first ${toFix} out of ${allFixes.length} ` : ` ${allFixes.length} `}quotes to be fixed by <@!${author.id}>.`);
        if (ended) description.push(`**Stopped, no longer listening to reactions.**`);
        else description.push(`React with the emoji to mark it as fixed.`);
        if (amountFixed(toFixList, toFix)) description.push(`${ended ? 'Fixed' : 'Already fixed'} ${amountFixed(toFixList, toFix)} quotes in this session.`);
    } else {
        description.push('All quotes fixed');
    }

    return {
        description: description.join('\n'),
        color: 4211787,
    }
}

const fixToEmbed = (toFix: any): MessageEmbedOptions => ({
    description: `${toFix.emoji} ${toFix.message.content} \n\n [Link to message](${createMessageUrl(toFix.message.guildId, toFix.message.channelId, toFix.message.id)})`,
    color: 4211787,
});

const amountFixed = (fixList: any[], start: number): number => start - fixList.length;