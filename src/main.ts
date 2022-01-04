import { Intents } from "discord.js";
import dotenv from "dotenv-flow";
import { ApiService } from "./client/api";
import Client from "./client/client";
import { LoggingService } from "./client/logger";
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
            ],
            partials: [
                'MESSAGE',
            ]
        },
        apiService,
        loggingService,
    ).init();
}
catch (error) {
    console.log(error);
}
