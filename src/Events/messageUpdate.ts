import { Message } from "discord.js";
import { isQuote } from "../Common";
import { Event } from "../Interfaces";
import { States } from "../Interfaces/logs";

export const event: Event = {
    name: 'messageUpdate',
    run: async (client, _oldMessage: Message, newMessage: Message) => {
        const oldMessage = _oldMessage.partial ? await _oldMessage.fetch() : _oldMessage;

        if (!newMessage.inGuild() && newMessage.channel.type !== 'GUILD_TEXT') return;
        if (!client.quoteChannels.has(newMessage.channel.id)) return;

        if (isQuote(newMessage)) {
            client.quotes[newMessage.guild.id].set(newMessage.id, newMessage);
            client.logger.quoteState(isQuote(oldMessage) ? States.UPDATE : States.ADD, newMessage.author, newMessage.guild, newMessage);
            return;
        }
        if (isQuote(oldMessage) && !isQuote(newMessage)) {
            if (client.quotes[newMessage.guild.id].delete(newMessage.id))
                client.logger.quoteState(States.DELETE, newMessage.author, newMessage.guild, newMessage);
            return;
        }
    }
}