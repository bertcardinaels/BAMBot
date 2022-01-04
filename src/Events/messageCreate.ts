import { Message } from "discord.js";
import { insufficientPermissions } from "../common";
import { config } from "../config/config";
import { Event } from "../interfaces";

export const messageCreate: Event = {
    name: 'messageCreate',
    run: async (client, message: Message) => {
        if (message.author.bot || !message.guild || !message.content.startsWith(config.prefix)) return;
        if (client.quoteChannels.some(channel => channel.id === message.channelId)) return;
        
        const fullContent = message.content.slice(config.prefix.length).trim();
        const cmd = (fullContent.substring(0, fullContent.indexOf(' ')) || fullContent).toLowerCase();
        const messageContent = fullContent.substring(cmd.length).trim();

        if (!cmd) return;
        const command = client.commands.get(cmd) || client.aliases.get(cmd);
        if (!command) return;

        if (command.permissions) {
            const guildMember = await message.guild.members.fetch(message.author.id);
            if (!command.permissions.some(permission => guildMember.permissions.has(permission))) {
                message.reply(insufficientPermissions);
                return;
            };
        }
        command.run(client, message, messageContent);
    }
}