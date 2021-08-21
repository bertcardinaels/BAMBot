import { Command } from "../../Interfaces";

export const command: Command = {
    name: 'ping',
    aliases: ['p'],
    run: async (client, message) => {
        message.channel.send('Pong!');
    }
}