import { Intents } from "discord.js";
import dotenv from "dotenv-flow";
import { ApiService } from "./Client/api";
import Client from "./Client/client";
import { LoggingService } from "./Client/logger";
dotenv.config();

try {
    const apiService = new ApiService(process.env.API_URL);
    const loggingService = new LoggingService();
    new Client(
        {
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS
            ]
        },
        apiService,
        loggingService,
    ).init();
}
catch (error) {
    console.log(error);
}
