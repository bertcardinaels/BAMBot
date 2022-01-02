import { Collection, Guild, GuildChannel, Message, Role, User } from "discord.js";
import { cleanQuote, Colors, rainbowify, ToFix } from "../Common";
import { Scopes, States, Tasks } from "../Interfaces/logs";

export class LoggingService {
    quoteRequest(task: Tasks.QUOTE | Tasks.QUOTESTATS, author: User, guild: Guild, mentionedUsers: Collection<string, User>, mentionedRoles: Collection<string, Role>, textFilter: string[], includeImage?: boolean): void {
        this.log([
            guild.name,
            task,
            States.REQUEST,
            author.tag,
            [mentionedUsers.map(user => `@${user.tag}`).join(' '),
            mentionedRoles.map(role => `@${role.name}`).join(' '),
            textFilter.join(' '), includeImage === undefined ? '' : (includeImage ? '+' : '-') + 'IMAGE'
            ].filter(item => item.length).join(' ')
        ]);
    }
    quoteError(task: Tasks.QUOTE | Tasks.QUOTESTATS, author: User, guild: Guild, error: string): void {
        this.log([guild.name, task, States.ERROR, author.tag, error,], true);
    }
    quoteState(state: States, author: User, guild: Guild, message: Message): void {
        this.log([guild.name, Tasks.QUOTE, state, author.tag, cleanQuote(message)]);
    }
    quoteStatsSuccess(author: User, guild: Guild, quotes: Collection<string, Message>): void {
        this.log([guild.name, Tasks.QUOTESTATS, States.SUCCESS, author.tag, quotes.size.toString()]);
    }
    quotesInitialized(amount: number, guild?: Guild): void {
        this.log([guild?.name ?? Scopes.CLIENT, Tasks.INITIALIZED, amount.toString(), Tasks.QUOTE]);
    }
    started(): void {
        this.log([Scopes.CLIENT, Tasks.STARTED])
    }
    joinedGuild(guild: Guild): void {
        this.log([guild.name, Tasks.JOINED, Scopes.GUILD])
    }
    leftGuild(guild: Guild): void {
        this.log([guild.name, Tasks.LEFT, Scopes.GUILD])
    }
    newChannel(channel: GuildChannel): void {
        this.log([channel.guild.name, Tasks.JOINED, Scopes.CHANNEL])
    }
    leftChannel(channel: GuildChannel): void {
        this.log([channel.guild.name, Tasks.LEFT, Scopes.CHANNEL])
    }
    newQuote(guild: Guild, message: Message): void {
        this.log([guild.name, Tasks.QUOTE, States.ADD, message.author.tag, cleanQuote(message)])
    }
    fixlistRequest(guild: Guild, author: User, target: User): void {
        this.log([guild.name, Tasks.FIXLIST, States.REQUEST, `${author.tag} for ${target.tag}`])
    }
    fixlistSuccess(guild: Guild, author: User, target: User, fixes: number): void {
        this.log([guild.name, Tasks.FIXLIST, States.SUCCESS, `${author.tag} for ${target.tag}`, fixes])
    }
    fixQuoteSuccess(guild: Guild, author: User, toFix: ToFix): void {
        this.log([guild.name, Tasks.FIXQUOTE, States.SUCCESS, author.tag, cleanQuote(toFix.message)])
    }
    newToFix(guild: Guild, author: User, target: User, message: Message): void {
        this.log([guild.name, Tasks.FIXQUOTE, States.ADD, `${author.tag} for ${target.tag}`, cleanQuote(message)])
    }
    reinitialize(guild: Guild, author: User, state: States.REQUEST | States.SUCCESS): void {
        this.log([guild.name, Tasks.REINITIALIZE, state, author.tag])
    }

    private log(messages: any[], error?: boolean): void {
        const body = [
            error ? Colors.Underscore + rainbowify(this.getFormattedTime(), 0) : rainbowify(this.getFormattedTime(), 0),
            ...messages.map((message, index) => rainbowify(message, index + 1)).map((message, index) => {
                if (error && index === 0) return Colors.Underscore + message;
                if (index + 1 === messages.length) return message + Colors.Reset;
                return message;
            }),
        ];
        error ? console.log(...body) : console.error(...body);
    }

    private getFormattedTime(includeDate: boolean = true): string {
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'UTC',
        };

        const date = new Date();
        const timeString = date.toLocaleTimeString('en-US', options);

        const year = date.getUTCFullYear();
        const month = this.prependZeroIfNecessary(date.getUTCMonth() + 1); // months start from zero
        const day = this.prependZeroIfNecessary(date.getUTCDate());
        const dateString = `${year}/${month}/${day}`;

        return includeDate ? `${dateString} ${timeString}` : timeString;
    }

    private prependZeroIfNecessary(number: number): string {
        return (number < 10 ? '0' : '') + number;
    }
}