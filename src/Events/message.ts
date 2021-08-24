import { GuildChannel, Message } from "discord.js";
import { config } from "../Config/config";
import { Command, Event } from "../Interfaces";

export const event: Event = {
    name: 'messageCreate',
    run: (client, message: Message) => {
        if (message.author.bot || !message.guild || !message.content.startsWith(config.prefix)) return;
        if (client.quoteChannels.some(channel => channel.id === message.channelId)) return;
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();
        if (!cmd) return;
        const command = client.commands.get(cmd) || client.aliases.get(cmd);
        if (command) (command as Command).run(client, message, args);
    }
}