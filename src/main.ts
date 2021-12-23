import { Intents } from "discord.js";
import Client from "./Client/client";

try {
    new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]
    }).init();
}
catch (error) {
    console.log(error);
}
