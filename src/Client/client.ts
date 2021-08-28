import { Client, Collection, Guild, GuildChannel, Message, Snowflake, TextChannel } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { insufficientPermissions, isQuote, isQuoteChannel } from "../Common";
import { config } from "../Config/config";
import { Command } from "../Interfaces";
import { QuoteChannel } from "../Interfaces/QuoteChannel";
import { SlashCommand } from "../Interfaces/SlashCommand";

export class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public slashCommands: Collection<string, SlashCommand> = new Collection();

    public quotes: { [guildId: string]: Collection<string, Message> } = {};
    public quotesInitialized: boolean;
    public quoteChannels: Collection<string, QuoteChannel> = new Collection();

    public async init() {
        // Commands
        const commandPath = path.join(__dirname, "..", "Commands");
        readdirSync(commandPath).forEach(async (file) => {
            const { command } = await import(`${commandPath}/${file}`);
            this.commands.set(command.name, command);
            command?.aliases?.length && command.aliases.forEach((alias: any) => {
                this.aliases.set(alias, command);
            });
        });

        // Events
        const eventPath = path.join(__dirname, "..", "Events");
        readdirSync(eventPath).forEach(async (file) => {
            const { event } = await import(`${eventPath}/${file}`);
            this.events.set(event.name, event);
            this.on(event.name, event.run.bind(null, this));
        });

        // Slash Commands
        const slashCommandPath = path.join(__dirname, "..", "SlashCommands");
        readdirSync(slashCommandPath).forEach(async (file) => {
            const { slashCommand } = await import(`${slashCommandPath}/${file}`);
            this.slashCommands.set(slashCommand.name, slashCommand);
        });
        this.initializeSlashCommands();

        await this.login(config.token);

        // Quotes
        await this.initializeQuotes();
        this.quotesInitialized = true;
        console.log('Quotes initialized');
        this.initializeUpdates();
    }

    initializeSlashCommands(): void {
        this.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
            const slashCommand = this.slashCommands.get(interaction.commandName);
            if (!slashCommand) return;
            if (slashCommand.permissions) {
                const guildMember = await interaction.guild.members.fetch(interaction.member.user.id);
                if (!slashCommand.permissions.some(permission => guildMember.permissions.has(permission))) {
                    interaction.reply(insufficientPermissions);
                    return;
                };
            }
            slashCommand.run(this, interaction);
        });
    }

    initializeUpdates(): void {
        this.on('guildCreate', async (guild: Guild) => {
            await this.initializeQuotes(guild);
        });
        this.on('guildDelete', (guild: Guild) => {
            this.deleteGuild(guild);
        });
        this.on('channelCreate', (channel: GuildChannel) => {
            if (isQuoteChannel(channel)) {
                this.initalizeQuoteListener(channel as TextChannel);
            }
        });
        this.on('channelUpdate', async (oldChannel: GuildChannel, newChannel: GuildChannel) => {
            if (isQuoteChannel(oldChannel) && !isQuoteChannel(newChannel)) {
                this.removeQuoteChannel(oldChannel as TextChannel, true);
                this.quotes[newChannel.guildId] = this.quotes[newChannel.guildId].filter(message => message.channelId != newChannel.id);
            }
            if (!isQuoteChannel(oldChannel) && isQuoteChannel(newChannel)) {
                this.initalizeQuoteListener(oldChannel as TextChannel)
                const quotes = await this.fetchQuotesFromChannel(newChannel as TextChannel);
                if (this.quotes[newChannel.guildId]) this.quotes[newChannel.guildId] = this.quotes[newChannel.guildId].concat(quotes);
                else this.quotes[newChannel.guildId] = quotes;

            }
        });
        this.on('channelDelete', (channel: GuildChannel) => {
            if (isQuoteChannel(channel)) {
                this.quoteChannels.find(channel => channel.id === channel.id)?.messageCollector?.stop('Deleted channel channel');
                this.quotes[channel.guildId] = this.quotes[channel.guildId].filter(message => message.channelId != channel.id);
            }
        });
    }

    initalizeQuoteListener(channel: TextChannel): void {
        const messageCollector = channel.createMessageCollector({ filter: message => isQuote(message) }).on('collect', (message) => { this.quotes[message.guild.id].set(message.id, message); });
        this.quoteChannels = this.quoteChannels.set(channel.id, { ...channel, messageCollector } as QuoteChannel);
    }

    removeQuoteChannel(channel: TextChannel, stopMessageListener?: boolean): void {
        if (stopMessageListener) this.quoteChannels.find(quoteChannel => quoteChannel.id === channel.id)?.messageCollector?.stop('Channel no longer quote channel');
        this.quoteChannels = this.quoteChannels.filter(quoteChannel => quoteChannel.id !== channel.id);
    }

    initializeQuotes(guild?: Guild): Promise<void> {
        return new Promise<void>(async resolve => {
            const guilds = guild ? [guild] : await Promise.all((await this.guilds.fetch()).map(async OAuthGuild => await OAuthGuild.fetch()));
            const guildQuotes = await Promise.all(guilds.map(async guild => ({ id: guild.id, quotes: await this.fetchQuotesFromGuild(guild) })));
            guildQuotes.filter(guildQuotes => guildQuotes.quotes).forEach(guildQuotes => this.quotes[guildQuotes.id] = guildQuotes.quotes);
            await Promise.all(guilds.map(guild => guild.commands.set(this.slashCommands.map(slashCommand => slashCommand))));
            resolve();
        });
    }

    deleteGuild(guild: Guild): void {
        delete this.quotes[guild.id];
        this.quoteChannels.filter(quoteChannels => quoteChannels.guildId === guild.id).forEach(channel => this.removeQuoteChannel(channel, true));
    }

    fetchQuotesFromGuild(guild: Guild): Promise<Collection<string, Message>> {
        return new Promise<Collection<string, Message>>(resolve => {
            guild.channels.fetch().then(async channels => {
                const quoteChannels: Collection<string, TextChannel> = channels.filter(channel => isQuoteChannel(channel)) as Collection<string, TextChannel>;
                if (quoteChannels?.size > 0) {
                    const result = await Promise.all(quoteChannels.map(channel => this.fetchQuotesFromChannel(channel)));
                    const quoteCollection = new Collection<string, Message>().concat(...result);
                    quoteChannels.forEach(channel => this.initalizeQuoteListener(channel));
                    resolve(quoteCollection);
                } else resolve(undefined);
            });
        });
    }

    fetchQuotesFromChannel(channel: TextChannel): Promise<Collection<string, Message>> {
        return new Promise<Collection<string, Message>>(async resolve => {
            const fetchedChannel = await channel.fetch() as TextChannel;
            let fullMessageCollection = new Collection<string, Message>();
            let quoteCollection = new Collection<string, Message>();
            let repeatFetch = true;
            let counter = 0;
            let previousBefore: string | undefined = undefined;
            while (repeatFetch) {
                if (counter >= config.maxFetch) repeatFetch = false;
                if (repeatFetch) {
                    previousBefore = fullMessageCollection.last()?.id;
                    const nextMessages = await this.fetchMessages(fetchedChannel, previousBefore);
                    fullMessageCollection = fullMessageCollection.concat(nextMessages);
                    quoteCollection = quoteCollection.concat(nextMessages.filter(message => isQuote(message)));
                    if (nextMessages.size === 0) repeatFetch = false;
                    if (previousBefore && previousBefore === fullMessageCollection.last()?.id) repeatFetch = false;
                    counter++;
                }
            }
            resolve(quoteCollection);
        });
    }

    fetchMessages(channel: TextChannel, before?: Snowflake): Promise<Collection<string, Message>> {
        return new Promise<Collection<string, Message>>(resolve => {
            channel.messages.fetch({ limit: 100, before }).then(messages => resolve(messages));
        });
    }
}

export default ExtendedClient;