import { Intents } from "discord.js";
import  Client  from "./Client/client";

new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] }).init();
