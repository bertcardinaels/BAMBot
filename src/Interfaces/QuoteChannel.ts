import { MessageCollector, TextChannel } from "discord.js";

export interface QuoteChannel extends TextChannel {
    messageCollector: MessageCollector;
}