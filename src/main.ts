import { Intents } from "discord.js";
import dotenv from "dotenv-flow";
import { ApiService } from "./Client/api";
import Client from "./Client/client";
dotenv.config();

try {
    new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]
    }, new ApiService(process.env.API_URL)).init();
}
catch (error) {
    console.log(error);
}
