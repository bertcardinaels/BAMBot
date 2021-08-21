import { GuildMember } from "discord.js";
import { Event } from "../Interfaces";

export const event: Event = {
    name: 'guildMemberAdd',
    run: (client, guildMember: GuildMember) => {
        console.log(`Member ${guildMember.displayName} joined`);        
    }
}