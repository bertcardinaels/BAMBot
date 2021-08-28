import { Message, TextBasedChannels } from "discord.js";

export const insufficientPermissions = 'You do not have the permissions to execute this command';

export const sendHelpMessage = (channel: TextBasedChannels): Promise<Message> =>
    channel.send({
        "content": null,
        "embeds": [
          {
            "title": "QuoteBot information",
            "description": "Gathers all quotes from #quotes channels\nQuote format: `\"text goes here\" ~ @Quotee`, single quotes `'` and `-` accepted too.\n\n**Commands**\n```!quote ```  Fetches a random quote\nAliases: `!q`\nSlash command: `/quote`\n\n```!quotestats ``` Shows stats on all gathered quotes\nAliases: `!qstat`, `!qstats`, `!quotestat`\nSlash command: `/quotestats`\n\n```!reinitialize``` Reinitializes the quotes on the server\nPermissions needed: `Administrator`\nAliases: `!reinit`\nSlash command: `/reinitialize`\n\n**Filtering**\nBoth quote commands can be filtered as follows:\n1. `!q laugh joke`: Quotes which include `laugh` or `joke` somewhere in the quote\n2. `!q \"set of words\"` Quotes which include the set of words, single `'` works\n3. `!q @Mention`: Quotes which include the mentioned user or role\n\nCombining text filters (`1` or `2`) with mention filters (`3`) returns quotes which satisfy both kinds of filters.",
            "color": 4211787
          }
        ]
      });