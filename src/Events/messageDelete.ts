import { Message } from "discord.js";
import { Event } from "../Interfaces";
import { States } from "../Interfaces/logs";

export const event: Event = {
    name: 'messageDelete',
    run: async (client, message: Message) => {
        if (!message.inGuild() && message.channel.type !== 'GUILD_TEXT') return;
        if (!client.quoteChannels.has(message.channel.id)) return;
        if (client.quotes[message.guild.id].delete(message.id))
            client.logger.quoteState(States.DELETE, message.author, message.guild, message);
    }
}