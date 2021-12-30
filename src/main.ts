import { Intents } from "discord.js";
import { ApiService } from "./Client/api";
import Client from "./Client/client";
import { config } from "./Config/config";

try {
    new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]
    }, new ApiService(config.apiLocation)).init();
}
catch (error) {
    console.log(error);
}
